# ARIS Phase 3 API 테스트 가이드

## 📋 문서 정보
- **작성일**: 2025-10-15
- **버전**: 1.0.0
- **Phase**: MVP Phase 3 (Extended Features)
- **테스트 범위**: Issue, Release, Incident, Partner, Asset 관리

---

## 🎯 테스트 개요

### Phase 3 주요 기능
- 이슈 관리 (Issue Management)
- 릴리즈 관리 (Release Management)
- 장애 관리 (Incident Management)
- 파트너 관리 (Partner Management)
- 자산 관리 (Asset Management)

### 테스트 환경
- **Base URL**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Database**: PostgreSQL (docker-compose)

---

## 🔑 사전 준비

### 1. 로그인 (토큰 획득)

```bash
curl -X 'POST' \
  'http://localhost:8080/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "admin@aris.com",
  "password": "admin1234"
}'
```

**응답 예시**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "email": "admin@aris.com",
  "name": "시스템 관리자",
  "roles": ["ROLE_ADMIN"]
}
```

**중요**: 응답받은 `accessToken`을 복사하여 이후 모든 API 요청 시 사용합니다.

### 2. 프로젝트 및 SR 생성 (테스트 데이터)

Phase 3 테스트를 위해서는 Phase 2에서 생성한 프로젝트, SR, SPEC 데이터가 필요합니다.
Phase 2 테스트 가이드를 참고하여 기본 데이터를 생성하세요.

---

## 📝 Phase 3 API 테스트

### 1️⃣ 이슈 관리 (Issue Management)

#### 1.1 이슈 등록

**Request**:
```bash
curl -X 'POST' \
  'http://localhost:8080/api/issues' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "로그인 버그 수정",
  "content": "특정 브라우저에서 로그인이 안되는 문제가 발생합니다.",
  "status": "OPEN",
  "srId": 1,
  "assigneeId": 1,
  "reporterId": 1
}'
```

**Response**:
```json
{
  "id": 1,
  "issueNumber": "ISS202510150001",
  "title": "로그인 버그 수정",
  "content": "특정 브라우저에서 로그인이 안되는 문제가 발생합니다.",
  "status": "OPEN",
  "srId": 1,
  "srNumber": "SR202510150001",
  "specId": null,
  "assigneeId": 1,
  "assigneeName": "시스템 관리자",
  "reporterId": 1,
  "reporterName": "시스템 관리자",
  "parentIssueId": null,
  "createdAt": "2025-10-15T10:00:00",
  "createdBy": "admin@aris.com",
  "updatedAt": "2025-10-15T10:00:00",
  "updatedBy": "admin@aris.com"
}
```

#### 1.2 이슈 목록 조회

**Request**:
```bash
curl -X 'GET' \
  'http://localhost:8080/api/issues?page=0&size=10' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}'
```

#### 1.3 이슈 상세 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/issues/1' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}'
```

#### 1.4 이슈 수정

```bash
curl -X 'PUT' \
  'http://localhost:8080/api/issues/1' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "로그인 버그 수정 (긴급)",
  "content": "특정 브라우저에서 로그인이 안되는 문제가 발생합니다. 긴급 대응 필요.",
  "status": "IN_PROGRESS",
  "assigneeId": 1
}'
```

#### 1.5 이슈 삭제

```bash
curl -X 'DELETE' \
  'http://localhost:8080/api/issues/1' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}'
```

---

### 2️⃣ 릴리즈 관리 (Release Management)

#### 2.1 릴리즈 등록 (정기 릴리즈)

**Request**:
```bash
curl -X 'POST' \
  'http://localhost:8080/api/releases' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "2025년 10월 정기 릴리즈",
  "releaseType": "REGULAR",
  "content": "10월 정기 릴리즈 배포 내용입니다.",
  "requesterId": 1,
  "requesterDeptId": 1,
  "scheduledAt": "2025-10-20T18:00:00"
}'
```

**Response**:
```json
{
  "id": 1,
  "releaseNumber": "REL202510150001",
  "title": "2025년 10월 정기 릴리즈",
  "releaseType": "REGULAR",
  "status": "REQUESTED",
  "content": "10월 정기 릴리즈 배포 내용입니다.",
  "requesterId": 1,
  "requesterName": "시스템 관리자",
  "requesterDeptId": 1,
  "requesterDeptName": "IT본부",
  "approverId": null,
  "approverName": null,
  "scheduledAt": "2025-10-20T18:00:00",
  "deployedAt": null,
  "createdAt": "2025-10-15T10:00:00",
  "updatedAt": "2025-10-15T10:00:00"
}
```

#### 2.2 릴리즈 등록 (긴급 릴리즈)

```bash
curl -X 'POST' \
  'http://localhost:8080/api/releases' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "긴급 보안 패치",
  "releaseType": "EMERGENCY",
  "content": "보안 취약점 긴급 패치",
  "requesterId": 1,
  "scheduledAt": "2025-10-15T14:00:00"
}'
```

#### 2.3 릴리즈 목록 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/releases?page=0&size=10' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}'
```

#### 2.4 릴리즈 승인

```bash
curl -X 'POST' \
  'http://localhost:8080/api/releases/1/approve' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
  "approverId": 1
}'
```

#### 2.5 릴리즈 배포 완료 처리

```bash
curl -X 'PUT' \
  'http://localhost:8080/api/releases/1' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "2025년 10월 정기 릴리즈",
  "releaseType": "REGULAR",
  "status": "DEPLOYED",
  "content": "10월 정기 릴리즈 배포 완료"
}'
```

---

### 3️⃣ 장애 관리 (Incident Management)

#### 3.1 장애 등록

**Request**:
```bash
curl -X 'POST' \
  'http://localhost:8080/api/incidents' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "서버 다운 장애",
  "incidentType": "FAILURE",
  "systemType": "SERVER",
  "businessArea": "결제 시스템",
  "severity": "HIGH",
  "description": "서버가 다운되어 서비스가 중단되었습니다.",
  "occurredAt": "2025-10-15T09:00:00",
  "assigneeId": 1
}'
```

**Response**:
```json
{
  "id": 1,
  "incidentNumber": "INC202510150001",
  "title": "서버 다운 장애",
  "incidentType": "FAILURE",
  "systemType": "SERVER",
  "businessArea": "결제 시스템",
  "severity": "HIGH",
  "status": "OPEN",
  "description": "서버가 다운되어 서비스가 중단되었습니다.",
  "occurredAt": "2025-10-15T09:00:00",
  "detectedAt": null,
  "resolvedAt": null,
  "resolution": null,
  "assigneeId": 1,
  "assigneeName": "시스템 관리자",
  "createdAt": "2025-10-15T10:00:00",
  "updatedAt": "2025-10-15T10:00:00"
}
```

#### 3.2 장애 목록 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/incidents?page=0&size=10' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}'
```

#### 3.3 장애 상세 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/incidents/1' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}'
```

#### 3.4 장애 처리 진행

```bash
curl -X 'PUT' \
  'http://localhost:8080/api/incidents/1' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "서버 다운 장애",
  "incidentType": "FAILURE",
  "systemType": "SERVER",
  "businessArea": "결제 시스템",
  "severity": "HIGH",
  "status": "IN_PROGRESS",
  "description": "서버가 다운되어 서비스가 중단되었습니다. 원인 파악 중.",
  "assigneeId": 1
}'
```

#### 3.5 장애 해결 완료

```bash
curl -X 'PUT' \
  'http://localhost:8080/api/incidents/1' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "서버 다운 장애",
  "incidentType": "FAILURE",
  "systemType": "SERVER",
  "businessArea": "결제 시스템",
  "severity": "HIGH",
  "status": "RESOLVED",
  "description": "서버가 다운되어 서비스가 중단되었습니다.",
  "resolution": "서버 재시작으로 해결. 디스크 용량 부족이 원인이었음.",
  "assigneeId": 1
}'
```

---

### 4️⃣ 파트너 관리 (Partner Management)

#### 4.1 파트너 등록

**Request**:
```bash
curl -X 'POST' \
  'http://localhost:8080/api/partners' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
  "code": "PARTNER001",
  "name": "ABC 소프트웨어",
  "businessNumber": "123-45-67890",
  "ceoName": "홍길동",
  "address": "서울시 강남구",
  "phoneNumber": "02-1234-5678",
  "managerId": 1
}'
```

**Response**:
```json
{
  "id": 1,
  "code": "PARTNER001",
  "name": "ABC 소프트웨어",
  "businessNumber": "123-45-67890",
  "ceoName": "홍길동",
  "address": "서울시 강남구",
  "phoneNumber": "02-1234-5678",
  "isClosed": false,
  "closedAt": null,
  "managerId": 1,
  "managerName": "시스템 관리자",
  "createdAt": "2025-10-15T10:00:00",
  "updatedAt": "2025-10-15T10:00:00"
}
```

#### 4.2 파트너 목록 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/partners?page=0&size=10' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}'
```

#### 4.3 파트너 상세 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/partners/1' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}'
```

#### 4.4 파트너 수정

```bash
curl -X 'PUT' \
  'http://localhost:8080/api/partners/1' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "ABC 소프트웨어 주식회사",
  "businessNumber": "123-45-67890",
  "ceoName": "홍길동",
  "address": "서울시 강남구 테헤란로 123",
  "phoneNumber": "02-1234-5679",
  "managerId": 1
}'
```

#### 4.5 파트너 폐업 처리

```bash
curl -X 'DELETE' \
  'http://localhost:8080/api/partners/1' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}'
```

---

### 5️⃣ 자산 관리 (Asset Management)

#### 5.1 자산 등록

**Request**:
```bash
curl -X 'POST' \
  'http://localhost:8080/api/assets' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
  "assetType": "PC",
  "serialNumber": "SN20251015001",
  "modelName": "LG 그램 15",
  "manufacturer": "LG전자",
  "acquiredAt": "2025-10-15",
  "managerId": 1
}'
```

**Response**:
```json
{
  "id": 1,
  "assetNumber": "AST202510150001",
  "assetType": "PC",
  "serialNumber": "SN20251015001",
  "modelName": "LG 그램 15",
  "manufacturer": "LG전자",
  "acquiredAt": "2025-10-15",
  "isExpired": false,
  "expiredAt": null,
  "managerId": 1,
  "managerName": "시스템 관리자",
  "createdAt": "2025-10-15T10:00:00",
  "updatedAt": "2025-10-15T10:00:00"
}
```

#### 5.2 자산 목록 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/assets?page=0&size=10' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}'
```

#### 5.3 자산 상세 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/assets/1' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}'
```

#### 5.4 자산 수정

```bash
curl -X 'PUT' \
  'http://localhost:8080/api/assets/1' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
  "assetType": "LAPTOP",
  "serialNumber": "SN20251015001",
  "modelName": "LG 그램 15 (업그레이드)",
  "manufacturer": "LG전자",
  "managerId": 1
}'
```

#### 5.5 자산 폐기 처리

```bash
curl -X 'DELETE' \
  'http://localhost:8080/api/assets/1' \
  -H 'Authorization: Bearer {YOUR_ACCESS_TOKEN}'
```

---

## ✅ 테스트 체크리스트

### Issue Management
- [ ] 이슈 등록 성공
- [ ] 이슈 목록 조회 성공
- [ ] 이슈 상세 조회 성공
- [ ] 이슈 수정 성공
- [ ] 이슈 삭제 성공
- [ ] 이슈 번호 자동 생성 확인
- [ ] 이슈 상태 변경 확인 (OPEN → IN_PROGRESS → RESOLVED → CLOSED)

### Release Management
- [ ] 정기 릴리즈 등록 성공
- [ ] 긴급 릴리즈 등록 성공
- [ ] 릴리즈 목록 조회 성공
- [ ] 릴리즈 상세 조회 성공
- [ ] 릴리즈 승인 성공
- [ ] 릴리즈 배포 완료 처리 성공
- [ ] 릴리즈 번호 자동 생성 확인

### Incident Management
- [ ] 장애 등록 성공
- [ ] 장애 목록 조회 성공
- [ ] 장애 상세 조회 성공
- [ ] 장애 처리 진행 상태 변경 성공
- [ ] 장애 해결 완료 처리 성공
- [ ] 장애 번호 자동 생성 확인
- [ ] 긴급도별 분류 확인 (HIGH, MEDIUM, LOW)

### Partner Management
- [ ] 파트너 등록 성공
- [ ] 파트너 목록 조회 성공
- [ ] 파트너 상세 조회 성공
- [ ] 파트너 수정 성공
- [ ] 파트너 폐업 처리 성공
- [ ] 사업자번호 중복 검증 확인

### Asset Management
- [ ] 자산 등록 성공
- [ ] 자산 목록 조회 성공
- [ ] 자산 상세 조회 성공
- [ ] 자산 수정 성공
- [ ] 자산 폐기 처리 성공
- [ ] 자산 번호 자동 생성 확인
- [ ] 자산 유형별 분류 확인

---

## 🔍 예상되는 오류 및 해결 방법

### 1. 401 Unauthorized
**원인**: JWT 토큰이 만료되었거나 유효하지 않음
**해결**: 로그인을 다시 수행하여 새로운 토큰을 발급받으세요.

### 2. 400 Bad Request - "프로젝트를 찾을 수 없습니다"
**원인**: 존재하지 않는 ID를 참조함
**해결**: 먼저 필요한 데이터(프로젝트, SR 등)를 생성하세요.

### 3. 409 Conflict - "이미 존재하는 코드입니다"
**원인**: 파트너 코드 또는 사업자번호가 중복됨
**해결**: 다른 코드나 사업자번호를 사용하세요.

---

## 📊 테스트 결과 기록

### Issue Management
| 테스트 항목 | 결과 | 비고 |
|------------|------|------|
| 이슈 등록 | ✅ / ❌ | |
| 이슈 조회 | ✅ / ❌ | |
| 이슈 수정 | ✅ / ❌ | |
| 이슈 삭제 | ✅ / ❌ | |

### Release Management
| 테스트 항목 | 결과 | 비고 |
|------------|------|------|
| 릴리즈 등록 | ✅ / ❌ | |
| 릴리즈 조회 | ✅ / ❌ | |
| 릴리즈 승인 | ✅ / ❌ | |

### Incident Management
| 테스트 항목 | 결과 | 비고 |
|------------|------|------|
| 장애 등록 | ✅ / ❌ | |
| 장애 조회 | ✅ / ❌ | |
| 장애 해결 | ✅ / ❌ | |

### Partner Management
| 테스트 항목 | 결과 | 비고 |
|------------|------|------|
| 파트너 등록 | ✅ / ❌ | |
| 파트너 조회 | ✅ / ❌ | |
| 파트너 수정 | ✅ / ❌ | |

### Asset Management
| 테스트 항목 | 결과 | 비고 |
|------------|------|------|
| 자산 등록 | ✅ / ❌ | |
| 자산 조회 | ✅ / ❌ | |
| 자산 수정 | ✅ / ❌ | |

---

## 📝 결론

Phase 3 API 테스트를 완료하면:
- Issue, Release, Incident, Partner, Asset 관리 기능이 정상 동작함을 확인
- 자동 번호 생성 로직 검증 완료
- 상태 관리 및 생명주기 확인 완료

---

**Last Updated**: 2025-10-15
**Document Version**: 1.0.0









