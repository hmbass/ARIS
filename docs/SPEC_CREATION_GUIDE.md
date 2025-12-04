# 📋 SPEC 생성 가이드 및 문제 해결

**작성일시**: 2025-10-15  
**상태**: ⚠️ 워크플로우 확인 필요

---

## 🎯 현재 상황

### ✅ 완료된 기능
- [x] 로그인 (JWT 토큰 발급)
- [x] 프로젝트 등록 (자동 상태: PREPARING)
- [x] SR 등록 (자동 채번: SR2501-0001, 상태: APPROVAL_REQUESTED)

### ⚠️ 현재 문제
```
POST /api/specs

Response: 400 Bad Request
{
  "code": "SP004",
  "message": "승인된 SR만 SPEC을 생성할 수 있습니다."
}
```

**원인**: SR 상태가 `APPROVAL_REQUESTED`이므로 SPEC을 생성할 수 없음

---

## 🔄 올바른 워크플로우

### Phase 2 전체 프로세스

```
1. 프로젝트 등록
   └─> status: PREPARING

2. SR 등록
   └─> status: APPROVAL_REQUESTED
   └─> srNumber: SR2501-0001

3. SR 승인 (⚠️ 필요!)
   └─> status: APPROVED

4. SPEC 생성
   └─> status: PENDING
   └─> specNumber: SPEC2501-0001

5. SPEC 승인
   └─> status: APPROVED

6. SPEC 완료
   └─> status: COMPLETED
```

---

## 🔧 해결 방법

### 방법 1: 데이터베이스에서 직접 SR 승인 처리

#### Step 1: SR 상태 확인
```bash
docker exec aris-postgres psql -U aris_user -d aris_db -c \
  "SELECT id, sr_number, title, status FROM service_requests WHERE id = 1;"
```

**현재 상태**:
```
id | sr_number    | title              | status
----+--------------+--------------------+-------------------
 1 | SR2501-0001  | 회원 가입 기능 개발 | APPROVAL_REQUESTED
```

#### Step 2: SR 상태를 APPROVED로 변경
```bash
docker exec aris-postgres psql -U aris_user -d aris_db -c \
  "UPDATE service_requests SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP, updated_by = 'admin@aris.com' WHERE id = 1;"
```

#### Step 3: 변경 확인
```bash
docker exec aris-postgres psql -U aris_user -d aris_db -c \
  "SELECT id, sr_number, status FROM service_requests WHERE id = 1;"
```

**변경 후**:
```
id | sr_number    | status
----+--------------+---------
 1 | SR2501-0001  | APPROVED
```

---

### 방법 2: SR 상태 업데이트 API 구현 (선택사항)

#### API 스펙
```http
PATCH /api/srs/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "APPROVED",
  "comment": "승인합니다."
}
```

#### 구현 필요 사항
1. `SrStatusUpdateRequest` DTO
2. `SrService.updateStatus()` 메서드
3. `SrController.updateStatus()` 엔드포인트

**참고**: Phase 2 MVP에서는 승인 프로세스가 별도의 Approval API로 관리되므로, 직접 상태 업데이트는 관리자 기능으로 나중에 구현 가능

---

## ✅ SPEC 생성 테스트 (SR 승인 후)

### Step 1: SR 승인 처리
```bash
docker exec aris-postgres psql -U aris_user -d aris_db -c \
  "UPDATE service_requests SET status = 'APPROVED' WHERE id = 1;"
```

### Step 2: 로그인 및 토큰 획득
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aris.com","password":"admin1234"}' \
  | python3 -c "import json, sys; print(json.load(sys.stdin)['accessToken'])")
```

### Step 3: SPEC 생성
```bash
curl -X POST http://localhost:8080/api/specs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "srId": 1,
    "specType": "DEVELOPMENT",
    "specCategory": "ACCEPTED",
    "functionPoint": 15.5,
    "manDay": 10.0,
    "assigneeId": 1,
    "reviewerId": 1
  }' | python3 -m json.tool
```

**기대 결과**: ✅ 201 Created
```json
{
  "id": 1,
  "specNumber": "SPEC2510-0001",
  "srId": 1,
  "srNumber": "SR2501-0001",
  "specType": "DEVELOPMENT",
  "specCategory": "ACCEPTED",
  "status": "PENDING",
  "functionPoint": 15.5,
  "manDay": 10.0,
  "assigneeName": "시스템 관리자",
  "reviewerName": "시스템 관리자",
  "createdAt": "2025-10-15T...",
  "createdBy": "admin@aris.com"
}
```

---

## 📊 SR 상태 전이도

```
APPROVAL_REQUESTED  ← SR 생성 시 초기 상태
    │
    ├─ APPROVAL_PENDING  (승인 검토 중)
    │
    ├─ APPROVED  ✅ (승인 완료) ← SPEC 생성 가능!
    │
    ├─ REJECTED  ❌ (반려)
    │
    └─ CANCELLED  ❌ (취소)
```

### 비즈니스 규칙
- ✅ **APPROVED** 상태에서만 SPEC 생성 가능
- ❌ APPROVAL_REQUESTED: SPEC 생성 불가
- ❌ REJECTED: SPEC 생성 불가
- ❌ CANCELLED: SPEC 생성 불가

---

## 🎯 완전한 테스트 스크립트

```bash
#!/bin/bash

echo "=========================================="
echo "Phase 2 SPEC 생성 전체 테스트"
echo "=========================================="

# 1. SR 승인 처리 (DB 직접 수정)
echo "1️⃣ SR 승인 처리 중..."
docker exec aris-postgres psql -U aris_user -d aris_db -c \
  "UPDATE service_requests SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP, updated_by = 'admin@aris.com' WHERE id = 1;"

SR_STATUS=$(docker exec aris-postgres psql -U aris_user -d aris_db -t -c \
  "SELECT status FROM service_requests WHERE id = 1;")

echo "✅ SR 상태: $(echo $SR_STATUS | tr -d ' ')"
echo ""

# 2. 로그인
echo "2️⃣ 로그인 중..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aris.com","password":"admin1234"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import json, sys; print(json.load(sys.stdin)['accessToken'])")
echo "✅ 토큰 발급 완료"
echo ""

# 3. SPEC 생성
echo "3️⃣ SPEC 생성 중..."
SPEC_RESPONSE=$(curl -s -X POST http://localhost:8080/api/specs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "srId": 1,
    "specType": "DEVELOPMENT",
    "specCategory": "ACCEPTED",
    "functionPoint": 15.5,
    "manDay": 10.0,
    "assigneeId": 1,
    "reviewerId": 1
  }')

if echo "$SPEC_RESPONSE" | grep -q '"specNumber"'; then
  echo "✅ SPEC 생성 성공!"
  echo ""
  echo "$SPEC_RESPONSE" | python3 -m json.tool
else
  echo "❌ SPEC 생성 실패"
  echo "$SPEC_RESPONSE" | python3 -m json.tool
fi

echo ""
echo "=========================================="
```

---

## 🚨 일반적인 에러 및 해결

### 1. "승인된 SR만 SPEC을 생성할 수 있습니다"
**원인**: SR 상태가 APPROVED가 아님

**해결**:
```sql
UPDATE service_requests 
SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP, updated_by = 'admin@aris.com' 
WHERE id = 1;
```

### 2. "SR을 찾을 수 없습니다"
**원인**: 존재하지 않는 SR ID

**확인**:
```sql
SELECT id, sr_number, status FROM service_requests;
```

### 3. "403 Forbidden"
**원인**: JWT 토큰 만료 (1시간 후)

**해결**: 다시 로그인하여 새 토큰 발급

### 4. "사용자를 찾을 수 없습니다"
**원인**: assigneeId 또는 reviewerId가 잘못됨

**확인**:
```sql
SELECT id, email, name FROM users WHERE is_active = true;
```

---

## 📋 Phase 2 체크리스트

### ✅ 구현 완료
- [x] 프로젝트 등록
- [x] SR 등록
- [x] SR 자동 채번 (SR2501-0001)
- [x] SPEC 등록
- [x] SPEC 자동 채번 (SPEC2510-0001)
- [x] 비즈니스 규칙 검증 (승인된 SR만 SPEC 생성)

### ⚠️ 수동 처리 필요
- [ ] SR 승인 프로세스 (현재: DB 직접 수정)
- [ ] Approval API 통합

### 🎯 다음 단계
- [ ] Approval API 구현
- [ ] SR 승인 요청
- [ ] SPEC 승인 프로세스
- [ ] 전체 워크플로우 자동화

---

## 💡 참고 사항

### JWT 토큰 만료 시간
- **Access Token**: 1시간 (3600초)
- **Refresh Token**: 7일

### 자동 채번 규칙
- **SR**: `SR{YYMM}-{####}`
  - 예: SR2501-0001 (2025년 1월)
- **SPEC**: `SPEC{YYMM}-{####}`
  - 예: SPEC2510-0001 (2025년 10월)
- **Approval**: `APR{YYMM}-{####}`
  - 예: APR2510-0001 (2025년 10월)

### 초기 상태
- **Project**: `PREPARING`
- **SR**: `APPROVAL_REQUESTED`
- **SPEC**: `PENDING`
- **Approval**: `PENDING`

---

**작성자**: AI Assistant  
**프로젝트**: ARIS  
**Phase**: Phase 2 Testing  
**문서 버전**: 1.0.0









