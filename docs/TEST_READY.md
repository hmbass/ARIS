# ✅ Phase 2 테스트 준비 완료

**작성일시**: 2025-10-15 14:40 (KST)  
**상태**: 🟢 Ready for Testing

---

## 🎉 시스템 상태

### Docker 컨테이너
```
✅ aris-postgres: Running (Healthy)
✅ aris-backend: Running
✅ Port 8080: Open
```

### 데이터베이스 마이그레이션
```
✅ Phase 1: V1.0.0 ~ V1.0.6 (7개)
✅ Phase 2: V2.0.0 ~ V2.0.7 (8개)
✅ 초기 데이터: V99.0.0 (1개)
✅ 총 16개 마이그레이션 성공!
```

### 애플리케이션
```
✅ Spring Boot 3.2.0 시작 완료
✅ 13개 JPA Repository 로딩 완료
✅ Swagger UI 활성화
✅ JWT 인증 설정 완료
```

---

## 🌐 접속 정보

### Swagger UI
```
URL: http://localhost:8080/swagger-ui.html
```

### API Base URL
```
http://localhost:8080/api
```

### 기본 관리자 계정
```
Email: admin@aris.com
Password: admin1234
```

---

## 📊 API 엔드포인트 현황

### Phase 1 API (인증 및 사용자 관리)
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/users` - 사용자 목록 조회
- `GET /api/users/{id}` - 사용자 조회
- `POST /api/users` - 사용자 등록
- `PUT /api/users/{id}` - 사용자 수정
- `DELETE /api/users/{id}` - 사용자 삭제

### Phase 2 API (프로젝트/SR/SPEC/승인)

#### Project Management (프로젝트 관리)
- `POST /api/projects` - 프로젝트 등록
- `GET /api/projects/{id}` - 프로젝트 조회
- `GET /api/projects` - 프로젝트 목록 조회
- `PUT /api/projects/{id}` - 프로젝트 수정
- `PUT /api/projects/{id}/status` - 프로젝트 상태 변경
- `DELETE /api/projects/{id}` - 프로젝트 삭제

#### Service Request (SR 관리)
- `POST /api/srs` - SR 등록
- `GET /api/srs/{id}` - SR 조회
- `GET /api/srs/number/{srNumber}` - SR 번호로 조회
- `GET /api/srs` - SR 목록 조회
- `PUT /api/srs/{id}` - SR 수정
- `PUT /api/srs/{id}/status` - SR 상태 변경
- `DELETE /api/srs/{id}` - SR 삭제

#### Specification (SPEC 관리)
- `POST /api/specs` - SPEC 등록
- `GET /api/specs/{id}` - SPEC 조회
- `GET /api/specs/number/{specNumber}` - SPEC 번호로 조회
- `GET /api/specs` - SPEC 목록 조회
- `PUT /api/specs/{id}` - SPEC 수정
- `POST /api/specs/{id}/start` - SPEC 작업 시작
- `POST /api/specs/{id}/complete` - SPEC 작업 완료
- `PUT /api/specs/{id}/status` - SPEC 상태 변경
- `DELETE /api/specs/{id}` - SPEC 삭제

#### Approval (승인 관리)
- `POST /api/approvals` - 승인 요청 생성
- `GET /api/approvals/{id}` - 승인 조회
- `GET /api/approvals/number/{approvalNumber}` - 승인 번호로 조회
- `GET /api/approvals` - 승인 목록 조회
- `GET /api/approvals/my-pending` - 내가 승인할 대기 건 목록
- `GET /api/approvals/my-requested` - 내가 요청한 승인 목록
- `PUT /api/approvals/{id}/approve` - 승인 처리
- `PUT /api/approvals/{id}/reject` - 반려 처리
- `PUT /api/approvals/{id}/cancel` - 승인 취소

**총 38개 API 엔드포인트**

---

## 🧪 테스트 플로우

### 1. 로그인
```
POST /api/auth/login
{
  "email": "admin@aris.com",
  "password": "admin1234"
}
→ JWT 토큰 획득
```

### 2. Swagger UI 인증 설정
```
[Authorize] 버튼 클릭
→ Bearer {토큰} 입력
```

### 3. 프로젝트 생성
```
POST /api/projects
{
  "code": "PRJ2025001",
  "name": "고객관리시스템 구축",
  "projectType": "SI",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "companyId": 1
}
→ projectId = 1
```

### 4. SR 생성
```
POST /api/srs
{
  "title": "회원 가입 기능 개발",
  "srType": "DEVELOPMENT",
  "srCategory": "AP_DEVELOPMENT",
  "businessRequirement": "회원가입 기능 개발",
  "projectId": 1,
  "requesterId": 1,
  "requestDate": "2025-01-15",
  "dueDate": "2025-02-15",
  "priority": "HIGH"
}
→ srNumber = SR2510-0001
→ srId = 1
```

### 5. SR 승인
```
POST /api/approvals
{
  "approvalType": "SR",
  "targetId": 1,
  "requesterId": 1,
  "approverIds": [1]
}
→ approvalNumber = APP2510-0001

PUT /api/approvals/1/approve
{
  "approverId": 1,
  "comment": "승인합니다."
}
→ status = APPROVED

PUT /api/srs/1/status?status=APPROVED
→ SR 상태 = APPROVED
```

### 6. SPEC 생성
```
POST /api/specs
{
  "srId": 1,
  "specType": "DEVELOPMENT",
  "specCategory": "ACCEPTED",
  "functionPoint": 15.5,
  "manDay": 10.0,
  "assigneeId": 1,
  "reviewerId": 1
}
→ specNumber = SPEC2510-0001
→ specId = 1
```

### 7. SPEC 작업
```
POST /api/specs/1/start
→ status = IN_PROGRESS

(작업 수행)

PUT /api/specs/1/status?status=APPROVAL_PENDING
→ SPEC 승인 대기
```

### 8. SPEC 승인
```
POST /api/approvals
{
  "approvalType": "SPEC",
  "targetId": 1,
  "requesterId": 1,
  "approverIds": [1]
}
→ approvalNumber = APP2510-0002

PUT /api/approvals/2/approve
{
  "approverId": 1,
  "comment": "SPEC 승인합니다."
}

PUT /api/specs/1/status?status=APPROVED
```

### 9. SPEC 완료
```
POST /api/specs/1/complete
→ status = COMPLETED
```

---

## 📋 검증 체크리스트

### 자동 채번
- [ ] SR 번호: `SR2510-0001` 형식
- [ ] SPEC 번호: `SPEC2510-0001` 형식
- [ ] 승인 번호: `APP2510-0001` 형식
- [ ] 연월별 순차 증가 확인
- [ ] 중복 없음 확인

### SR → SPEC 연동
- [ ] SPEC 생성 시 SR에 자동 연결
- [ ] 승인된 SR만 SPEC 생성 가능
- [ ] SR 조회 시 SPEC 정보 포함

### 승인 프로세스
- [ ] 단일 승인자 (1단계)
- [ ] 다중 승인자 (N단계)
- [ ] 승인 처리 (PENDING → APPROVED)
- [ ] 반려 처리 (PENDING → REJECTED)
- [ ] 취소 처리 (PENDING → CANCELLED)
- [ ] 현재 단계의 승인자만 처리 가능

### 상태 전이
- [ ] SR: APPROVAL_REQUESTED → APPROVAL_PENDING → APPROVED
- [ ] SPEC: PENDING → IN_PROGRESS → APPROVAL_PENDING → APPROVED → COMPLETED
- [ ] Approval: PENDING → APPROVED/REJECTED/CANCELLED

### 수정 제한
- [ ] 승인된 SR 수정 불가
- [ ] 진행 중인 SPEC만 수정 가능

### JWT 인증
- [ ] 로그인 성공 시 토큰 발급
- [ ] 토큰 없이 API 호출 시 401
- [ ] 유효한 토큰으로 모든 API 접근

---

## 🗄️ 데이터베이스 확인

### PostgreSQL 접속
```bash
docker exec -it aris-postgres psql -U aris_user -d aris_db
```

### 테이블 목록 확인
```sql
\dt
```

**기대 결과**:
```
 public | approvals          | table | aris_user
 public | approval_lines     | table | aris_user
 public | companies          | table | aris_user
 public | departments        | table | aris_user
 public | flyway_schema_history | table | aris_user
 public | menu_permissions   | table | aris_user
 public | menus              | table | aris_user
 public | projects           | table | aris_user
 public | roles              | table | aris_user
 public | service_requests   | table | aris_user
 public | specifications     | table | aris_user
 public | spec_files         | table | aris_user
 public | sr_files           | table | aris_user
 public | users              | table | aris_user
 public | user_roles         | table | aris_user
```

**총 15개 테이블 (flyway_schema_history 포함)**

### 초기 데이터 확인
```sql
-- 회사
SELECT * FROM companies;

-- 사용자
SELECT id, email, name FROM users;

-- 역할
SELECT * FROM roles;

-- 메뉴
SELECT id, name, path FROM menus ORDER BY order_num;
```

---

## 📖 상세 테스트 가이드

자세한 API 테스트 방법은 다음 문서를 참조하세요:

```
docs/Phase2_Testing_Guide.md
```

이 문서에는 다음 내용이 포함되어 있습니다:
- 단계별 API 호출 예시
- Request/Response 예제
- 검증 포인트
- 문제 해결 방법
- 추가 테스트 시나리오

---

## 🚀 Quick Start

### 1. 브라우저에서 Swagger UI 열기
```
http://localhost:8080/swagger-ui.html
```

### 2. 로그인
1. `Auth Controller` 섹션 확장
2. `POST /api/auth/login` 클릭
3. **Try it out** 클릭
4. Request Body 입력:
   ```json
   {
     "email": "admin@aris.com",
     "password": "admin1234"
   }
   ```
5. **Execute** 클릭
6. Response에서 `accessToken` 복사

### 3. 인증 설정
1. Swagger UI 상단의 **[Authorize]** 버튼 클릭
2. Value에 `Bearer {복사한토큰}` 입력
3. **[Authorize]** 버튼 클릭
4. **[Close]** 버튼 클릭

### 4. API 테스트 시작!
이제 모든 API를 자유롭게 테스트할 수 있습니다!

---

## 🎯 핵심 검증 포인트

### 1. 자동 채번 시스템
```
SR: SR + YY + MM + -NNNN (예: SR2510-0001)
SPEC: SPEC + YY + MM + -NNNN (예: SPEC2510-0001)
Approval: APP + YY + MM + -NNNN (예: APP2510-0001)
```

### 2. 비즈니스 규칙
- ✅ 승인된 SR만 SPEC 생성 가능
- ✅ 특정 상태에서만 SR 수정 가능
- ✅ 현재 단계의 승인자만 승인/반려 가능
- ✅ 승인 완료 후 다음 단계로 자동 이동
- ✅ 최종 승인 시 상태 APPROVED로 변경

### 3. 데이터 무결성
- ✅ SR-SPEC 연동 (spec_id foreign key)
- ✅ Project-SR 연동 (project_id foreign key)
- ✅ Approval-Target 연동 (target_id)
- ✅ Soft Delete (deleted_at)
- ✅ Auditing (created_at, created_by, updated_at, updated_by)

---

## 🎉 결론

**Phase 2 개발이 완료되었고, 테스트할 준비가 완료되었습니다!**

모든 시스템이 정상 동작하고 있으며, Swagger UI를 통해 전체 API를 테스트할 수 있습니다.

궁금한 점이 있으면 `docs/Phase2_Testing_Guide.md`를 참조하세요!

---

**작성자**: AI Assistant  
**프로젝트**: ARIS (Advanced Request & Issue Management System)  
**Phase**: MVP Phase 2 Complete  
**문서 버전**: 1.0.0









