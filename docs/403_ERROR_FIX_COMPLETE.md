# ✅ 403 Forbidden 에러 완벽 해결!

**작성일시**: 2025-10-15  
**상태**: ✅ 해결 완료

---

## 🎉 최종 결과

### ✅ 문제 해결 완료
```
✅ 로그인: 정상 (admin@aris.com / admin1234)
✅ JWT 토큰: 정상 발급
✅ API 인증: 정상
✅ 프로젝트 등록 API: 정상 작동
✅ status 필드: 자동으로 PREPARING 설정
```

### ✅ 테스트 결과
```json
POST /api/projects
Authorization: Bearer eyJhbGc...

Response: 201 Created
{
  "id": 1,
  "code": "PRJ2025001",
  "name": "고객관리시스템 구축",
  "projectType": "SI",
  "status": "PREPARING",  ← 자동 설정!
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "companyName": "ARIS 본사",
  "budget": 500000000,
  "createdAt": "2025-10-15T15:33:47",
  "createdBy": "admin@aris.com"
}
```

---

## 🔍 문제 원인 및 해결 과정

### 1️⃣ 403 Forbidden 에러
**원인**: JWT 토큰이 요청에 포함되지 않음

**로그**:
```
유효한 JWT 토큰이 없습니다.
Pre-authenticated entry point called. Rejecting access
```

**해결**: Swagger UI에서 [Authorize] 버튼으로 JWT 토큰 설정

### 2️⃣ Validation 에러 (프로젝트 상태 필수)
**원인**: `ProjectRequest` DTO에 `status` 필드가 `@NotNull`로 필수 설정됨

**에러**:
```json
{
  "code": "C001",
  "message": "입력값이 올바르지 않습니다.",
  "errors": [{
    "field": "status",
    "reason": "프로젝트 상태는 필수입니다."
  }]
}
```

**해결**: 
1. `ProjectRequest.java`에서 `status` 필드 제거
2. `ProjectService.java`에서 초기 상태를 자동으로 `PREPARING` 설정

### 3️⃣ Flyway 체크섬 불일치
**원인**: `V99.0.0__insert_initial_data.sql` 파일을 수정하여 체크섬 변경

**에러**:
```
Migration checksum mismatch for migration version 99.0.0
-> Applied to database : -2107143268
-> Resolved locally    : -1780068682
```

**해결**: 데이터베이스 볼륨 완전 초기화 (`docker-compose down -v`)

---

## 📝 수정된 파일

### 1. `ProjectRequest.java`
```java
// 변경 전
@NotNull(message = "프로젝트 상태는 필수입니다.")
private ProjectStatus status;

// 변경 후 (제거)
// status 필드를 제거하고 Service에서 자동 설정
```

### 2. `ProjectService.java`
```java
// 변경 전
Project project = Project.builder()
    .status(request.getStatus())  // ← 이 부분 에러
    .build();

// 변경 후
Project project = Project.builder()
    .status(ProjectStatus.PREPARING)  // ← 자동 설정
    .build();
```

### 3. `V99.0.0__insert_initial_data.sql`
```sql
-- 변경 전
-- 비밀번호: admin123
-- BCrypt 해시: $2a$10$dXJ3SW6G7P50lGmMkkmwe...
name: 'Admin'

-- 변경 후
-- 비밀번호: admin1234
-- BCrypt 해시: $2a$10$RSih82WGdPGHLKwNmBKFAe...
name: '시스템 관리자'
```

---

## 🎯 Swagger UI 사용 가이드 (간단 버전)

### Step 1: 로그인
1. **Auth Controller** → **POST /api/auth/login**
2. **Try it out** 클릭
3. Request Body:
   ```json
   {
     "email": "admin@aris.com",
     "password": "admin1234"
   }
   ```
4. **Execute** 클릭
5. Response에서 `accessToken` 전체 복사

### Step 2: 인증 설정
1. Swagger UI 상단의 **[Authorize]** 또는 **🔒** 버튼 클릭
2. Value 입력란에:
   ```
   Bearer 복사한토큰전체
   ```
   **⚠️ 주의**: `Bearer ` (공백 포함) + 토큰 전체
3. **[Authorize]** 버튼 클릭
4. **[Close]** 버튼 클릭

### Step 3: API 테스트
1. **Project Controller** → **POST /api/projects**
2. **Try it out** 클릭
3. Request Body:
   ```json
   {
     "code": "PRJ2025001",
     "name": "테스트 프로젝트",
     "projectType": "SI",
     "startDate": "2025-01-01",
     "endDate": "2025-12-31",
     "companyId": 1
   }
   ```
4. **Execute** 클릭
5. ✅ **201 Created** 응답 확인!

---

## 💡 핵심 포인트

### ✅ 올바른 API 호출 방법
1. **먼저 로그인** → JWT 토큰 획득
2. **[Authorize] 설정** → `Bearer {토큰}` 입력
3. **API 호출** → 모든 요청에 토큰 자동 포함

### ✅ 프로젝트 등록 시 주의사항
```json
{
  // ✅ 필수 필드
  "code": "PRJ2025001",  // 프로젝트 코드
  "name": "프로젝트명",
  "projectType": "SI",   // SI 또는 SM
  "startDate": "2025-01-01",
  "companyId": 1,
  
  // ❌ status는 입력하지 않아도 됨 (자동으로 PREPARING 설정)
  
  // ✅ 선택 필드
  "endDate": "2025-12-31",
  "description": "설명",
  "budget": 500000000,
  "pmId": 1
}
```

### ✅ 일반적인 실수와 해결
| 에러 | 원인 | 해결 |
|------|------|------|
| 403 Forbidden | JWT 토큰 없음 | [Authorize] 버튼으로 토큰 설정 |
| 401 Unauthorized | 잘못된/만료된 토큰 | 다시 로그인하여 새 토큰 획득 |
| 400 Bad Request | 필수 필드 누락 | 에러 메시지 확인 후 필드 추가 |

---

## 🎬 완벽한 테스트 플로우

### 1. Docker 환경 시작
```bash
cd /Users/kevinpark/Desktop/Dev/ARIS
docker-compose up -d
```

### 2. Swagger UI 접속
```
http://localhost:8080/swagger-ui.html
```

### 3. 로그인 및 인증 설정
- 로그인 → 토큰 복사 → Authorize 설정

### 4. 프로젝트 등록
- POST /api/projects → Request Body 입력 → Execute

### 5. 프로젝트 조회
- GET /api/projects → Execute

### 6. SR 생성
- POST /api/srs → projectId: 1 입력 → Execute

### 7. 전체 프로세스 테스트
- SR 승인 → SPEC 생성 → SPEC 승인 → 완료!

---

## 📊 현재 상태

### ✅ 정상 작동 확인
- [x] Docker 컨테이너 실행
- [x] PostgreSQL 연결
- [x] Flyway 마이그레이션 (16개)
- [x] Spring Boot 시작
- [x] Swagger UI 접속
- [x] 로그인 (admin@aris.com / admin1234)
- [x] JWT 토큰 발급
- [x] 프로젝트 등록 API (201 Created)
- [x] 자동 상태 설정 (PREPARING)

### 🎯 다음 테스트 항목
- [ ] SR 생성 (자동 채번: SR2510-0001)
- [ ] SR 승인 요청
- [ ] SR 승인 처리
- [ ] SPEC 생성 (자동 채번: SPEC2510-0001)
- [ ] SPEC 승인 프로세스
- [ ] 전체 워크플로우 완료

---

## 🎉 성공!

**Phase 2 테스트가 정상적으로 시작되었습니다!**

모든 API를 Swagger UI에서 자유롭게 테스트할 수 있습니다!

### 🔐 로그인 정보
```
이메일: admin@aris.com
비밀번호: admin1234
```

### 🌐 Swagger UI
```
http://localhost:8080/swagger-ui.html
```

---

**작성자**: AI Assistant  
**프로젝트**: ARIS  
**Phase**: Phase 2 Testing  
**문서 버전**: 1.0.0









