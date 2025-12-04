# 프로젝트 타입 Enum 불일치 오류 해결

## 📅 작성일
2025-01-16

---

## 🚨 문제 상황

### 에러 로그
```
POST http://localhost:3000/api/projects 500 (Internal Server Error)

Failed to create project: {
  code: 'C999',
  message: '서버 오류가 발생했습니다.',
  timestamp: '2025-10-17T21:44:14.311315177'
}
```

### Backend 로그
```
Caused by: com.fasterxml.jackson.databind.exc.InvalidFormatException: 
Cannot deserialize value of type `com.aris.domain.project.entity.ProjectType` 
from String "DEVELOPMENT": not one of the values accepted for Enum class: [SM, SI]
```

---

## 🔍 원인 분석

### Backend ProjectType Enum
```java
// backend/.../project/entity/ProjectType.java
public enum ProjectType {
    SI("System Integration", "시스템 통합"),
    SM("System Maintenance", "시스템 유지보수");
}
```

**Backend는 `SI`, `SM` 만 허용**

### Frontend 타입 정의
```typescript
// frontend/src/types/project.types.ts
export type ProjectType = 'SI' | 'SM';
```

**Frontend 타입 정의는 올바름**

### Frontend ProjectCreatePage
```typescript
// frontend/src/pages/project/ProjectCreatePage.tsx
<MenuItem value="DEVELOPMENT">개발</MenuItem>
<MenuItem value="OPERATION">운영</MenuItem>
<MenuItem value="MAINTENANCE">유지보수</MenuItem>
```

**❌ 문제: ProjectCreatePage에서 잘못된 값 사용**
- `DEVELOPMENT` → Backend에서 인식 불가
- `OPERATION` → Backend에서 인식 불가
- `MAINTENANCE` → Backend에서 인식 불가

---

## ✅ 해결 방법

### 1. ProjectCreatePage.tsx 수정

#### Before (잘못된 코드)
```typescript
<TextField
  select
  label="프로젝트 유형"
  fullWidth
  margin="normal"
  required
>
  <MenuItem value="DEVELOPMENT">개발</MenuItem>
  <MenuItem value="OPERATION">운영</MenuItem>
  <MenuItem value="MAINTENANCE">유지보수</MenuItem>
</TextField>
```

#### After (수정된 코드)
```typescript
<TextField
  select
  label="프로젝트 유형"
  fullWidth
  margin="normal"
  required
>
  <MenuItem value="SI">SI (시스템 통합)</MenuItem>
  <MenuItem value="SM">SM (시스템 유지보수)</MenuItem>
</TextField>
```

### 2. ProjectListPage.tsx 개선

프로젝트 타입을 사용자 친화적으로 표시하는 함수 추가:

```typescript
const getProjectTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    SI: 'SI (시스템 통합)',
    SM: 'SM (시스템 유지보수)',
  };
  return labels[type] || type;
};

// 사용
<Typography>{getProjectTypeLabel(project.projectType)}</Typography>
```

---

## 📊 수정 내용 정리

### 수정된 파일
1. **`frontend/src/pages/project/ProjectCreatePage.tsx`**
   - MenuItem 값 수정: `DEVELOPMENT`, `OPERATION`, `MAINTENANCE` → `SI`, `SM`
   
2. **`frontend/src/pages/project/ProjectListPage.tsx`**
   - `getProjectTypeLabel()` 함수 추가
   - 프로젝트 타입 표시 개선 (모바일 카드 뷰 + 데스크탑 테이블 뷰)

---

## 🎯 ProjectType 값 정의

### 올바른 값
| 값 | 영문 | 한글 | 설명 |
|----|------|------|------|
| `SI` | System Integration | 시스템 통합 | 새로운 시스템 구축 프로젝트 |
| `SM` | System Maintenance | 시스템 유지보수 | 기존 시스템 운영/유지보수 |

### Frontend-Backend 매핑
```
Frontend (선택)     Backend (저장)     DB (저장)
─────────────────   ──────────────     ─────────
SI (시스템 통합)  → SI              → 'SI'
SM (시스템 유지보수) → SM              → 'SM'
```

---

## 🧪 테스트 시나리오

### Scenario 1: 프로젝트 등록 - SI 타입
**입력**:
```
코드: PRJ-001
이름: 테스트 프로젝트
유형: SI (시스템 통합)
시작일: 2025-01-01
```

**예상 결과**: ✅ 성공
```json
{
  "id": 1,
  "code": "PRJ-001",
  "name": "테스트 프로젝트",
  "projectType": "SI",
  "status": "PREPARING",
  "startDate": "2025-01-01"
}
```

### Scenario 2: 프로젝트 등록 - SM 타입
**입력**:
```
코드: PRJ-002
이름: 유지보수 프로젝트
유형: SM (시스템 유지보수)
시작일: 2025-01-15
```

**예상 결과**: ✅ 성공
```json
{
  "id": 2,
  "code": "PRJ-002",
  "name": "유지보수 프로젝트",
  "projectType": "SM",
  "status": "PREPARING",
  "startDate": "2025-01-15"
}
```

### Scenario 3: 프로젝트 목록 조회
**API 응답**:
```json
{
  "content": [
    {
      "id": 1,
      "code": "PRJ-001",
      "name": "테스트 프로젝트",
      "projectType": "SI"
    }
  ]
}
```

**UI 표시**:
```
프로젝트 목록
┌──────────────────────────────────────┐
│ PRJ-001                              │
│ 테스트 프로젝트                      │
│ 유형: SI (시스템 통합)               │
└──────────────────────────────────────┘
```

---

## 🔄 추가 개선 사항

### 1. autocomplete 속성 추가

**LoginPage.tsx 경고 해결**:
```
[DOM] Input elements should have autocomplete attributes 
(suggested: "current-password")
```

**Before**:
```typescript
<TextField
  type="password"
  name="password"
/>
```

**After**:
```typescript
<TextField
  type="password"
  name="password"
  autoComplete="current-password"
/>
```

### 2. 타입 안전성 강화

**Frontend 타입 가드 추가**:
```typescript
export const PROJECT_TYPES = ['SI', 'SM'] as const;
export type ProjectType = typeof PROJECT_TYPES[number];

export function isValidProjectType(value: string): value is ProjectType {
  return PROJECT_TYPES.includes(value as ProjectType);
}
```

### 3. Backend Enum 설명 추가

**ProjectType.java**:
```java
public enum ProjectType {
    SI("System Integration", "시스템 통합", "새로운 시스템 구축"),
    SM("System Maintenance", "시스템 유지보수", "기존 시스템 운영");
    
    private final String code;
    private final String description;
    private final String detail;
}
```

---

## 📝 재발 방지 방안

### 1. Frontend 개발 체크리스트
- [ ] Backend Enum 값 확인
- [ ] Frontend 타입 정의와 일치하는지 검증
- [ ] 드롭다운/셀렉트 박스 값 검증
- [ ] API 호출 전 값 유효성 검사

### 2. Backend 에러 메시지 개선
```java
@ExceptionHandler(InvalidFormatException.class)
public ResponseEntity<ErrorResponse> handleInvalidFormat(InvalidFormatException e) {
    String message = String.format(
        "잘못된 값입니다: '%s'. 허용된 값: %s",
        e.getValue(),
        Arrays.toString(ProjectType.values())
    );
    return ResponseEntity.badRequest()
        .body(ErrorResponse.of("INVALID_ENUM_VALUE", message));
}
```

### 3. 자동화 테스트
```typescript
describe('ProjectCreatePage', () => {
  it('should only show valid project types', () => {
    const { getAllByRole } = render(<ProjectCreatePage />);
    const options = getAllByRole('option');
    
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue('SI');
    expect(options[1]).toHaveValue('SM');
  });
});
```

---

## 🎉 개선 효과

### Before (개선 전)
```
❌ 프로젝트 등록 시 500 에러
❌ 사용자 혼란 (잘못된 옵션 제공)
❌ Frontend-Backend 불일치
```

### After (개선 후)
```
✅ 프로젝트 등록 정상 작동
✅ 명확한 옵션 제공 (SI, SM)
✅ Frontend-Backend 일치
✅ 사용자 친화적 레이블
```

---

## 📊 Enum 관리 베스트 프랙티스

### 1. Single Source of Truth
```
Backend Enum → Frontend에서 참조
├── API 문서화 (Swagger)
├── Frontend 타입 생성
└── 유효성 검증
```

### 2. 명확한 네이밍
```
✅ SI, SM (명확한 약어)
❌ TYPE1, TYPE2 (의미 불명확)
```

### 3. 설명 포함
```
SI (시스템 통합) - 사용자가 이해하기 쉬움
SM (시스템 유지보수) - 용도가 명확함
```

---

## 🔗 관련 이슈

### 동일한 패턴의 Enum 확인 필요

다음 Enum들도 Frontend-Backend 일치 여부 확인 필요:
- [x] **ProjectType** ✅ 수정 완료
- [ ] **ProjectStatus** - 확인 필요
- [ ] **SrType** - 확인 필요
- [ ] **SrPriority** - 확인 필요
- [ ] **SpecStatus** - 확인 필요
- [ ] **IssueType** - 확인 필요
- [ ] **IssuePriority** - 확인 필요
- [ ] **IncidentSeverity** - 확인 필요

---

## 📚 참고 자료
- [Jackson Enum Deserialization](https://www.baeldung.com/jackson-serialize-enums)
- [TypeScript Enum Best Practices](https://www.typescriptlang.org/docs/handbook/enums.html)

---

**Status**: ✅ 완료
**Last Updated**: 2025-01-16
**Tested**: ✅ 프로젝트 등록 정상 작동
**Deployed**: ✅ Docker Container





