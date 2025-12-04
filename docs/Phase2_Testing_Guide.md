# 🧪 ARIS Phase 2 테스트 가이드

**작성일시**: 2025-10-15  
**Phase**: MVP Phase 2  
**테스트 대상**: SR → SPEC → 승인 프로세스

---

## 📋 사전 준비 확인

### ✅ 시스템 상태 확인
```bash
# Docker 컨테이너 상태 확인
docker ps

# 기대 결과:
# - aris-postgres (healthy)
# - aris-backend (running)
```

### ✅ 애플리케이션 로그 확인
```bash
docker logs aris-backend --tail 30

# 확인 사항:
# ✅ "Started ArisApplication"
# ✅ "Successfully applied 16 migrations"
# ✅ "Found 13 JPA repository interfaces"
# ✅ "Tomcat started on port 8080"
```

### ✅ 데이터베이스 연결 확인
```bash
docker exec -it aris-postgres psql -U aris_user -d aris_db -c "\dt"

# 기대 결과: Phase 1 + Phase 2 테이블 목록
# Phase 1: companies, departments, roles, users, user_roles, menus, menu_permissions
# Phase 2: projects, service_requests, sr_files, specifications, spec_files, approvals, approval_lines
```

---

## 🌐 Swagger UI 접속

### URL
```
http://localhost:8080/swagger-ui.html
```

### Swagger에서 확인할 API 그룹
- **Auth Controller**: 인증 및 회원가입 (2개 API)
- **User Controller**: 사용자 관리 (5개 API)
- **Project Controller**: 프로젝트 관리 (6개 API) ⭐ Phase 2
- **Service Request Controller**: SR 관리 (7개 API) ⭐ Phase 2
- **Specification Controller**: SPEC 관리 (9개 API) ⭐ Phase 2
- **Approval Controller**: 승인 관리 (9개 API) ⭐ Phase 2

**총 38개 API 엔드포인트**

---

## 🔐 1단계: 로그인 및 JWT 토큰 획득

### 1-1. 기본 관리자 계정으로 로그인

**API**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "admin@aris.com",
  "password": "admin1234"
}
```

**Expected Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "userInfo": {
    "id": 1,
    "email": "admin@aris.com",
    "name": "시스템 관리자",
    "roles": ["ROLE_ADMIN"]
  }
}
```

### 1-2. JWT 토큰 설정

1. Swagger UI 상단의 **[Authorize]** 버튼 클릭
2. Value 입력란에 `Bearer {accessToken}` 입력
   - 예: `Bearer eyJhbGciOiJIUzI1NiJ9...`
3. **[Authorize]** 버튼 클릭
4. **[Close]** 버튼 클릭

✅ 이제 모든 API 요청에 JWT 토큰이 자동으로 포함됩니다!

---

## 📊 2단계: 프로젝트 생성

Phase 2의 모든 기능은 **프로젝트**를 기반으로 동작합니다.

### 2-1. 프로젝트 등록

**API**: `POST /api/projects`

**Request Body**:
```json
{
  "code": "PRJ2025001",
  "name": "고객관리시스템 구축",
  "projectType": "SI",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "companyId": 1,
  "description": "고객사 CRM 시스템 신규 구축 프로젝트",
  "budget": 500000000,
  "pmId": 1
}
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "code": "PRJ2025001",
  "name": "고객관리시스템 구축",
  "projectType": "SI",
  "status": "PREPARING",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "companyId": 1,
  "companyName": "ARIS 본사",
  "description": "고객사 CRM 시스템 신규 구축 프로젝트",
  "budget": 500000000,
  "pmId": 1,
  "pmName": "시스템 관리자",
  "createdAt": "2025-10-15T14:40:00",
  "createdBy": "admin@aris.com",
  "updatedAt": "2025-10-15T14:40:00",
  "updatedBy": "admin@aris.com"
}
```

✅ **projectId = 1** 저장 (다음 단계에서 사용)

### 2-2. 프로젝트 조회

**API**: `GET /api/projects/1`

**Expected Response** (200 OK): 위와 동일

### 2-3. 프로젝트 상태 변경

**API**: `PUT /api/projects/1/status?status=IN_PROGRESS`

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "status": "IN_PROGRESS",
  ...
}
```

---

## 📝 3단계: SR (Service Request) 생성

### 3-1. SR 등록

**API**: `POST /api/srs`

**Request Body**:
```json
{
  "title": "회원 가입 기능 개발",
  "srType": "DEVELOPMENT",
  "srCategory": "AP_DEVELOPMENT",
  "businessRequirement": "회원가입 시 이메일 인증 및 본인확인 절차를 포함한 회원가입 기능 개발이 필요합니다.",
  "projectId": 1,
  "requesterId": 1,
  "requesterDeptId": null,
  "requestDate": "2025-01-15",
  "dueDate": "2025-02-15",
  "priority": "HIGH"
}
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "srNumber": "SR2510-0001",
  "title": "회원 가입 기능 개발",
  "srType": "DEVELOPMENT",
  "srCategory": "AP_DEVELOPMENT",
  "status": "APPROVAL_REQUESTED",
  "businessRequirement": "회원가입 시 이메일 인증 및 본인확인 절차를 포함한 회원가입 기능 개발이 필요합니다.",
  "project": {
    "id": 1,
    "code": "PRJ2025001",
    "name": "고객관리시스템 구축"
  },
  "requester": {
    "id": 1,
    "name": "시스템 관리자",
    "email": "admin@aris.com"
  },
  "requestDate": "2025-01-15",
  "dueDate": "2025-02-15",
  "priority": "HIGH",
  "createdAt": "2025-10-15T14:45:00",
  "createdBy": "admin@aris.com"
}
```

✅ **SR 번호 자동 채번 확인**: `SR2510-0001` (형식: SR + YY + MM + -NNNN)  
✅ **초기 상태**: `APPROVAL_REQUESTED`  
✅ **srId = 1** 저장 (다음 단계에서 사용)

### 3-2. SR 조회

**API**: `GET /api/srs/1`

**Expected Response** (200 OK): 위와 동일

### 3-3. SR 번호로 조회

**API**: `GET /api/srs/number/SR2510-0001`

**Expected Response** (200 OK): 위와 동일

### 3-4. SR 목록 조회 (검색/필터링)

**API**: `GET /api/srs?page=0&size=10&sort=createdAt,desc`

**Query Parameters** (모두 선택사항):
- `title`: SR 제목 검색
- `srType`: DEVELOPMENT 또는 OPERATION
- `status`: APPROVAL_REQUESTED, APPROVAL_PENDING, APPROVED, REJECTED, CANCELLED
- `projectId`: 프로젝트 ID
- `requesterId`: 요청자 ID
- `requestStartDate`: 요청 시작일
- `requestEndDate`: 요청 종료일
- `page`: 페이지 번호 (0부터 시작)
- `size`: 페이지 크기
- `sort`: 정렬 (예: `createdAt,desc`)

**Expected Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "srNumber": "SR2510-0001",
      "title": "회원 가입 기능 개발",
      ...
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 1,
  "totalPages": 1
}
```

---

## ✅ 4단계: 승인 프로세스 (SR 승인)

### 4-1. SR 승인 요청 생성

**API**: `POST /api/approvals`

**Request Body**:
```json
{
  "approvalType": "SR",
  "targetId": 1,
  "requesterId": 1,
  "approverIds": [1]
}
```

**설명**:
- `approvalType`: SR, SPEC, RELEASE, DATA_EXTRACTION 중 선택
- `targetId`: SR ID (이 경우 1)
- `requesterId`: 요청자 ID (현재 로그인 사용자)
- `approverIds`: 승인자 ID 목록 (순서대로 1단계, 2단계, ...)

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "approvalNumber": "APP2510-0001",
  "approvalType": "SR",
  "targetId": 1,
  "status": "PENDING",
  "currentStep": 1,
  "totalSteps": 1,
  "requester": {
    "id": 1,
    "name": "시스템 관리자",
    "email": "admin@aris.com"
  },
  "requestedAt": "2025-10-15T14:50:00",
  "approvalLines": [
    {
      "id": 1,
      "stepOrder": 1,
      "approver": {
        "id": 1,
        "name": "시스템 관리자",
        "email": "admin@aris.com"
      },
      "status": "PENDING",
      "comment": null,
      "approvedAt": null
    }
  ],
  "createdAt": "2025-10-15T14:50:00",
  "createdBy": "admin@aris.com"
}
```

✅ **승인 번호 자동 채번 확인**: `APP2510-0001`  
✅ **approvalId = 1** 저장 (다음 단계에서 사용)

### 4-2. 내가 승인할 대기 건 목록 조회

**API**: `GET /api/approvals/my-pending`

**Expected Response** (200 OK):
```json
[
  {
    "id": 1,
    "approvalNumber": "APP2510-0001",
    "approvalType": "SR",
    "targetId": 1,
    "status": "PENDING",
    "currentStep": 1,
    ...
  }
]
```

### 4-3. 승인 처리

**API**: `PUT /api/approvals/1/approve`

**Request Body**:
```json
{
  "approverId": 1,
  "comment": "검토 완료. 승인합니다."
}
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "approvalNumber": "APP2510-0001",
  "status": "APPROVED",
  "currentStep": 1,
  "totalSteps": 1,
  "completedAt": "2025-10-15T14:55:00",
  "approvalLines": [
    {
      "id": 1,
      "stepOrder": 1,
      "approver": {
        "id": 1,
        "name": "시스템 관리자"
      },
      "status": "APPROVED",
      "comment": "검토 완료. 승인합니다.",
      "approvedAt": "2025-10-15T14:55:00"
    }
  ]
}
```

✅ **승인 상태**: `PENDING` → `APPROVED`  
✅ **승인라인 상태**: `PENDING` → `APPROVED`  
✅ **완료 시간 기록**: `completedAt` 자동 설정

### 4-4. SR 상태 변경 (승인됨)

**API**: `PUT /api/srs/1/status?status=APPROVED`

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "srNumber": "SR2510-0001",
  "status": "APPROVED",
  ...
}
```

✅ SR 상태가 `APPROVED`로 변경되어야 SPEC 생성 가능!

---

## 📋 5단계: SPEC (Specification) 생성

### 5-1. SPEC 등록

**API**: `POST /api/specs`

**Request Body**:
```json
{
  "srId": 1,
  "specType": "DEVELOPMENT",
  "specCategory": "ACCEPTED",
  "functionPoint": 15.5,
  "manDay": 10.0,
  "assigneeId": 1,
  "reviewerId": 1
}
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "specNumber": "SPEC2510-0001",
  "sr": {
    "id": 1,
    "srNumber": "SR2510-0001",
    "title": "회원 가입 기능 개발"
  },
  "specType": "DEVELOPMENT",
  "specCategory": "ACCEPTED",
  "status": "PENDING",
  "functionPoint": 15.5,
  "manDay": 10.0,
  "assignee": {
    "id": 1,
    "name": "시스템 관리자"
  },
  "reviewer": {
    "id": 1,
    "name": "시스템 관리자"
  },
  "createdAt": "2025-10-15T15:00:00",
  "createdBy": "admin@aris.com"
}
```

✅ **SPEC 번호 자동 채번 확인**: `SPEC2510-0001`  
✅ **초기 상태**: `PENDING`  
✅ **SR 연동**: SR에 SPEC이 자동으로 연결됨  
✅ **specId = 1** 저장

### 5-2. SPEC 작업 시작

**API**: `POST /api/specs/1/start`

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "specNumber": "SPEC2510-0001",
  "status": "IN_PROGRESS",
  "startedAt": "2025-10-15T15:05:00",
  ...
}
```

✅ **상태 변경**: `PENDING` → `IN_PROGRESS`  
✅ **시작 시간 기록**: `startedAt` 자동 설정

### 5-3. SPEC 조회

**API**: `GET /api/specs/1`

**Expected Response** (200 OK): 위와 동일

### 5-4. SPEC 번호로 조회

**API**: `GET /api/specs/number/SPEC2510-0001`

**Expected Response** (200 OK): 위와 동일

---

## ✅ 6단계: SPEC 승인 프로세스

### 6-1. SPEC 승인 요청 생성

**API**: `POST /api/approvals`

**Request Body**:
```json
{
  "approvalType": "SPEC",
  "targetId": 1,
  "requesterId": 1,
  "approverIds": [1]
}
```

**Expected Response** (201 Created):
```json
{
  "id": 2,
  "approvalNumber": "APP2510-0002",
  "approvalType": "SPEC",
  "targetId": 1,
  "status": "PENDING",
  "currentStep": 1,
  "totalSteps": 1,
  ...
}
```

### 6-2. SPEC 승인 처리

**API**: `PUT /api/approvals/2/approve`

**Request Body**:
```json
{
  "approverId": 1,
  "comment": "SPEC 검토 완료. 승인합니다."
}
```

**Expected Response** (200 OK):
```json
{
  "id": 2,
  "approvalNumber": "APP2510-0002",
  "status": "APPROVED",
  "completedAt": "2025-10-15T15:10:00",
  ...
}
```

### 6-3. SPEC 상태 변경 (승인됨)

**API**: `PUT /api/specs/1/status?status=APPROVED`

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "specNumber": "SPEC2510-0001",
  "status": "APPROVED",
  ...
}
```

### 6-4. SPEC 작업 완료

**API**: `POST /api/specs/1/complete`

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "specNumber": "SPEC2510-0001",
  "status": "COMPLETED",
  "startedAt": "2025-10-15T15:05:00",
  "completedAt": "2025-10-15T15:15:00",
  ...
}
```

✅ **상태 변경**: `APPROVED` → `COMPLETED`  
✅ **완료 시간 기록**: `completedAt` 자동 설정

---

## 🎯 7단계: 전체 프로세스 확인

### 7-1. SR 최종 상태 확인

**API**: `GET /api/srs/1`

**Expected Response**:
```json
{
  "id": 1,
  "srNumber": "SR2510-0001",
  "status": "APPROVED",
  "spec": {
    "id": 1,
    "specNumber": "SPEC2510-0001",
    "status": "COMPLETED"
  },
  ...
}
```

✅ SR에 SPEC이 연결되어 있음을 확인!

### 7-2. 내가 요청한 승인 목록 확인

**API**: `GET /api/approvals/my-requested`

**Expected Response**:
```json
[
  {
    "id": 1,
    "approvalNumber": "APP2510-0001",
    "approvalType": "SR",
    "status": "APPROVED"
  },
  {
    "id": 2,
    "approvalNumber": "APP2510-0002",
    "approvalType": "SPEC",
    "status": "APPROVED"
  }
]
```

---

## 🧪 추가 테스트 시나리오

### 시나리오 1: 승인 반려 (Reject)

**API**: `PUT /api/approvals/{id}/reject`

**Request Body**:
```json
{
  "approverId": 1,
  "comment": "요구사항이 명확하지 않습니다. 재작성 후 다시 요청해주세요."
}
```

**Expected Result**:
- 승인 상태: `REJECTED`
- 승인라인 상태: `REJECTED`
- 프로세스 종료

### 시나리오 2: 승인 취소

**API**: `PUT /api/approvals/{id}/cancel`

**Expected Result**:
- 승인 상태: `CANCELLED`
- 프로세스 종료

### 시나리오 3: 다단계 승인

**승인 요청 시 여러 명의 승인자 지정**:
```json
{
  "approvalType": "SR",
  "targetId": 2,
  "requesterId": 1,
  "approverIds": [1, 2, 3]
}
```

**승인 프로세스**:
1. 1단계: 사용자 1이 승인 → `currentStep = 2`
2. 2단계: 사용자 2가 승인 → `currentStep = 3`
3. 3단계 (최종): 사용자 3이 승인 → `status = APPROVED`

### 시나리오 4: SR 수정 제한 검증

**승인된 SR 수정 시도**:

**API**: `PUT /api/srs/1`

**Expected Result**: `400 Bad Request`
```json
{
  "code": "SR004",
  "message": "해당 상태에서는 SR을 수정할 수 없습니다."
}
```

✅ `APPROVAL_REQUESTED` 또는 `REJECTED` 상태에서만 수정 가능!

### 시나리오 5: 승인되지 않은 SR로 SPEC 생성 시도

**API**: `POST /api/specs`

**Request Body**: (status가 APPROVAL_REQUESTED인 SR로 시도)
```json
{
  "srId": 2,
  ...
}
```

**Expected Result**: `400 Bad Request`
```json
{
  "code": "SP004",
  "message": "승인된 SR만 SPEC을 생성할 수 있습니다."
}
```

---

## 🗄️ 데이터베이스 직접 확인

### PostgreSQL 접속
```bash
docker exec -it aris-postgres psql -U aris_user -d aris_db
```

### 테이블 조회 쿼리

```sql
-- 프로젝트 목록
SELECT id, code, name, project_type, status, start_date, end_date 
FROM projects;

-- SR 목록
SELECT id, sr_number, title, sr_type, status, request_date 
FROM service_requests;

-- SPEC 목록
SELECT id, spec_number, sr_id, spec_type, status, function_point, man_day 
FROM specifications;

-- 승인 목록
SELECT id, approval_number, approval_type, target_id, status, current_step, total_steps 
FROM approvals;

-- 승인라인 목록
SELECT id, approval_id, step_order, approver_id, status, comment 
FROM approval_lines;

-- SR과 SPEC 연동 확인
SELECT 
    sr.sr_number,
    sr.title,
    sr.status AS sr_status,
    spec.spec_number,
    spec.status AS spec_status
FROM service_requests sr
LEFT JOIN specifications spec ON sr.spec_id = spec.id;
```

---

## ✅ 체크리스트

### Phase 2 핵심 기능 검증

- [ ] **프로젝트 생성** - 자동 채번 없음, 수동 코드 입력
- [ ] **SR 생성** - 자동 채번 `SR2510-0001` 형식
- [ ] **SR 승인 요청** - 승인 번호 `APP2510-0001` 형식
- [ ] **SR 승인 처리** - 상태 `PENDING` → `APPROVED`
- [ ] **SR 상태 변경** - `APPROVAL_REQUESTED` → `APPROVED`
- [ ] **SPEC 생성** - 자동 채번 `SPEC2510-0001` 형식
- [ ] **SR-SPEC 연동** - SR의 `spec_id` 자동 설정
- [ ] **SPEC 작업 시작** - 상태 `PENDING` → `IN_PROGRESS`, `startedAt` 기록
- [ ] **SPEC 승인 요청** - 승인 번호 `APP2510-0002`
- [ ] **SPEC 승인 처리** - 상태 `PENDING` → `APPROVED`
- [ ] **SPEC 작업 완료** - 상태 `APPROVED` → `COMPLETED`, `completedAt` 기록
- [ ] **승인 반려** - 상태 `REJECTED`, 프로세스 종료
- [ ] **승인 취소** - 상태 `CANCELLED`
- [ ] **다단계 승인** - N단계 승인 프로세스 정상 동작
- [ ] **SR 수정 제한** - 특정 상태에서만 수정 가능
- [ ] **SPEC 생성 제한** - 승인된 SR만 SPEC 생성 가능

### JWT 인증 검증

- [ ] 로그인 성공 시 JWT 토큰 발급
- [ ] 토큰 없이 API 호출 시 `401 Unauthorized`
- [ ] 잘못된 토큰으로 API 호출 시 `401 Unauthorized`
- [ ] 유효한 토큰으로 모든 API 접근 가능

### 데이터 검증

- [ ] 자동 채번 중복 없음 (SR, SPEC, Approval)
- [ ] 생성자/수정자 자동 기록 (`createdBy`, `updatedBy`)
- [ ] 생성/수정 일시 자동 기록 (`createdAt`, `updatedAt`)
- [ ] Soft Delete 동작 확인 (`deletedAt`)
- [ ] 페이징 정상 동작 (page, size, sort)

---

## 🚨 문제 해결

### 문제 1: 애플리케이션이 시작되지 않음

**증상**: Docker 로그에 오류 메시지

**해결**:
```bash
# 컨테이너 재시작
docker-compose restart backend

# 또는 완전히 재구축
docker-compose down -v
docker-compose build backend
docker-compose up -d
```

### 문제 2: Swagger UI 접속 안 됨 (403 Forbidden)

**원인**: Security 설정 문제

**확인**:
```java
// SecurityConfig.java
.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
```

### 문제 3: Flyway 마이그레이션 실패

**증상**: "Validate failed: Migrations have failed validation"

**해결**:
```bash
# 데이터베이스 초기화 후 재시작
docker-compose down -v
docker-compose up -d
```

### 문제 4: JWT 토큰 오류

**증상**: "Invalid token" 또는 "Expired token"

**해결**:
1. 다시 로그인하여 새로운 토큰 획득
2. Swagger UI에서 `[Authorize]` 버튼으로 토큰 재설정

### 문제 5: 자동 채번 중복

**증상**: `sr_number` 또는 `spec_number` 중복 오류

**원인**: `synchronized` 키워드 없음

**확인**:
```java
// NumberingService.java
@Transactional
public synchronized String generateSrNumber() {
    // ...
}
```

---

## 📊 성능 테스트 (선택사항)

### JMeter 또는 Postman Collection

1. **다중 사용자 동시 SR 생성** (동시성 테스트)
2. **대량 데이터 조회** (페이징 성능 테스트)
3. **자동 채번 중복 검증** (트랜잭션 테스트)

---

## 🎉 테스트 완료!

Phase 2의 핵심 프로세스인 **SR → SPEC → 승인**이 모두 정상 동작하면 테스트 완료입니다!

### 다음 단계

- **Option 1**: Phase 3 개발 시작
- **Option 2**: Phase 2 단위 테스트 코드 작성
- **Option 3**: 통합 테스트 자동화 (TestContainers)

---

**작성자**: AI Assistant  
**프로젝트**: ARIS (Advanced Request & Issue Management System)  
**Phase**: MVP Phase 2 - Testing Guide  
**문서 버전**: 1.0.0









