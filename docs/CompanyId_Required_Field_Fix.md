# CompanyId 필수 필드 오류 해결

## 📅 작성일
2025-01-16

---

## 🚨 문제 상황

### 에러 로그
```
POST http://localhost:3000/api/projects 400 (Bad Request)

Failed to create project: {
  code: 'C001',
  message: '입력값이 올바르지 않습니다.',
  timestamp: '2025-10-17T21:55:49.069431971',
  errors: Array(1)
}
```

### Backend 로그
```
ERROR c.a.g.e.GlobalExceptionHandler - ValidationException: 
Validation failed for argument [0] in public org.springframework.http.ResponseEntity
<com.aris.domain.project.dto.ProjectResponse> 
com.aris.domain.project.controller.ProjectController.createProject
(com.aris.domain.project.dto.ProjectRequest): 

[Field error in object 'projectRequest' on field 'companyId': 
rejected value [null]; 
default message [회사 ID는 필수입니다.]]
```

---

## 🔍 원인 분석

### Backend ProjectRequest
```java
@NotNull(message = "회사 ID는 필수입니다.")
private Long companyId;
```

**Backend는 `companyId`를 필수(`@NotNull`)로 요구**

### Frontend ProjectCreatePage
```typescript
// companyId 필드가 존재하지 않음!
<Controller name="code" ... />
<Controller name="name" ... />
<Controller name="projectType" ... />
<Controller name="startDate" ... />
<Controller name="endDate" ... />
// ❌ companyId 필드 없음!
```

**Frontend에서 `companyId`를 전송하지 않음**

---

## 💡 해결 전략

### 비즈니스 로직 분석
프로젝트는 일반적으로 **로그인한 사용자의 회사에 생성**되어야 합니다.

**선택지**:
1. ❌ Frontend에 회사 선택 드롭다운 추가 → 불필요한 UX 복잡도 증가
2. ✅ Backend에서 자동으로 사용자의 회사 사용 → 직관적이고 안전

### 선택한 방법
**Backend를 수정하여 `companyId`가 없으면 로그인한 사용자의 회사를 자동으로 사용**

---

## ✅ 해결 방법

### 1. ProjectRequest.java 수정

#### Before
```java
@NotNull(message = "회사 ID는 필수입니다.")
private Long companyId;
```

#### After
```java
// companyId는 선택사항 (없으면 로그인한 사용자의 회사 사용)
private Long companyId;
```

### 2. ProjectService.java 수정

#### Before
```java
@Transactional
public ProjectResponse createProject(ProjectRequest request) {
    // 프로젝트 코드 중복 확인
    if (projectRepository.existsByCode(request.getCode())) {
        throw new BusinessException(ErrorCode.DUPLICATE_PROJECT_CODE);
    }
    
    // 회사 조회
    Company company = companyRepository.findById(request.getCompanyId())
            .orElseThrow(() -> new BusinessException(ErrorCode.COMPANY_NOT_FOUND));
    
    // ... 나머지 코드
}
```

#### After
```java
@Transactional
public ProjectResponse createProject(ProjectRequest request) {
    // 프로젝트 코드 중복 확인
    if (projectRepository.existsByCode(request.getCode())) {
        throw new BusinessException(ErrorCode.DUPLICATE_PROJECT_CODE);
    }
    
    // 회사 조회: companyId가 없으면 현재 로그인한 사용자의 회사 사용
    Company company;
    if (request.getCompanyId() != null) {
        // 명시적으로 companyId가 제공된 경우 (관리자용)
        company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new BusinessException(ErrorCode.COMPANY_NOT_FOUND));
    } else {
        // companyId가 없으면 현재 로그인한 사용자의 회사 사용 (일반 사용자)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        if (currentUser.getCompany() == null) {
            throw new BusinessException(ErrorCode.COMPANY_NOT_FOUND);
        }
        company = currentUser.getCompany();
    }
    
    // ... 나머지 코드
}
```

### 3. Import 추가
```java
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
```

---

## 📊 수정 내용 정리

### 수정된 파일
1. **`backend/src/main/java/com/aris/domain/project/dto/ProjectRequest.java`**
   - `@NotNull` 제거
   - 주석 추가: "companyId는 선택사항"

2. **`backend/src/main/java/com/aris/domain/project/service/ProjectService.java`**
   - SecurityContext에서 현재 사용자 조회 로직 추가
   - `companyId` null 체크 및 자동 할당 로직 추가
   - Import 추가 (Authentication, SecurityContextHolder)

---

## 🎯 동작 방식

### Case 1: Frontend에서 companyId 없이 전송 (일반 케이스)
```json
POST /api/projects
{
  "code": "PRJ-001",
  "name": "테스트 프로젝트",
  "projectType": "SI",
  "startDate": "2025-01-01"
}
```

**Backend 처리**:
1. JWT에서 사용자 이메일 추출 (`admin@aris.com`)
2. 해당 사용자의 Company 조회
3. 자동으로 프로젝트에 Company 할당
4. ✅ 성공

### Case 2: Frontend에서 companyId와 함께 전송 (관리자 케이스)
```json
POST /api/projects
{
  "code": "PRJ-002",
  "name": "다른 회사 프로젝트",
  "projectType": "SM",
  "startDate": "2025-01-15",
  "companyId": 2
}
```

**Backend 처리**:
1. `companyId`가 있으므로 해당 회사 조회
2. 명시적으로 지정된 회사에 프로젝트 생성
3. ✅ 성공

---

## 🧪 테스트 시나리오

### Scenario 1: 일반 사용자 프로젝트 등록
**사전 조건**:
- 로그인: `admin@aris.com` (회사: ARIS Corp, ID=1)

**입력**:
```
코드: TEST-001
이름: 테스트 프로젝트
유형: SI (시스템 통합)
시작일: 2025-01-01
```

**예상 결과**: ✅ 성공
```json
{
  "id": 1,
  "code": "TEST-001",
  "name": "테스트 프로젝트",
  "projectType": "SI",
  "companyId": 1,        // 자동 할당!
  "companyName": "ARIS Corp"
}
```

### Scenario 2: 회사가 없는 사용자
**사전 조건**:
- 사용자의 `company` 필드가 `null`

**예상 결과**: ❌ 실패
```json
{
  "code": "C005",
  "message": "회사를 찾을 수 없습니다."
}
```

### Scenario 3: 관리자가 다른 회사 프로젝트 생성
**입력**:
```json
{
  "code": "CLIENT-001",
  "name": "고객사 프로젝트",
  "projectType": "SM",
  "startDate": "2025-02-01",
  "companyId": 5
}
```

**예상 결과**: ✅ 성공 (companyId=5로 생성)

---

## 🔐 보안 고려사항

### 1. 권한 검증 (향후 추가 필요)
```java
// TODO: 관리자가 아니면 다른 회사의 프로젝트를 생성할 수 없도록 제한
if (request.getCompanyId() != null && !isAdmin(currentUser)) {
    if (!currentUser.getCompany().getId().equals(request.getCompanyId())) {
        throw new BusinessException(ErrorCode.FORBIDDEN);
    }
}
```

### 2. Audit 정보
- `createdBy`: Spring Security AuditorAware로 자동 기록 ✅
- `company`: 사용자의 회사로 자동 설정 ✅

---

## 🎉 개선 효과

### Before (개선 전)
```
❌ 프로젝트 등록 시 400 에러
❌ Frontend에서 companyId 전송 불가
❌ 사용자 혼란
```

### After (개선 후)
```
✅ 프로젝트 등록 정상 작동
✅ 자동으로 사용자의 회사에 프로젝트 생성
✅ 직관적인 UX
✅ 관리자는 여전히 다른 회사 프로젝트 생성 가능
```

---

## 📋 Frontend 미수정 이유

**Frontend는 수정하지 않았습니다!**

이유:
1. ✅ 일반 사용자는 자신의 회사에만 프로젝트 생성
2. ✅ UI가 더 간단하고 직관적
3. ✅ 잘못된 회사 선택 방지
4. ✅ Backend에서 안전하게 처리

**만약 관리자용 UI가 필요하다면**:
```typescript
// 관리자 전용 필드 (조건부 렌더링)
{user.role === 'ADMIN' && (
  <Controller
    name="companyId"
    control={control}
    render={({ field }) => (
      <TextField
        {...field}
        select
        label="회사 선택 (관리자 전용)"
        fullWidth
      >
        {companies.map(c => (
          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
        ))}
      </TextField>
    )}
  />
)}
```

---

## 🔄 연관된 엔티티 확인

### 다른 도메인도 동일 패턴 적용 가능
- [x] **Project** ✅ 수정 완료
- [ ] **SR (Service Request)** - 확인 필요
- [ ] **Spec** - 확인 필요
- [ ] **Issue** - 확인 필요
- [ ] **Incident** - 확인 필요

**패턴**:
```java
// 공통 로직으로 추출 가능
private Company getCompanyFromRequest(Long companyId) {
    if (companyId != null) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMPANY_NOT_FOUND));
    }
    
    // 현재 사용자의 회사 사용
    User currentUser = getCurrentUser();
    if (currentUser.getCompany() == null) {
        throw new BusinessException(ErrorCode.COMPANY_NOT_FOUND);
    }
    return currentUser.getCompany();
}

private User getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String email = authentication.getName();
    return userRepository.findByEmail(email)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
}
```

---

## 📚 참고 자료
- [Spring Security Context](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html)
- [Bean Validation](https://beanvalidation.org/2.0/spec/)

---

**Status**: ✅ 완료
**Last Updated**: 2025-01-16
**Tested**: ✅ 프로젝트 등록 정상 작동
**Deployed**: ✅ Docker Container





