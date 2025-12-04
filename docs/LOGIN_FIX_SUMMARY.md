# 🔧 로그인 문제 해결 완료

**작성일시**: 2025-10-15  
**상태**: ✅ 해결 완료

---

## 🐛 문제 상황

### 증상
```
POST /api/auth/login
{
  "email": "admin@aris.com",
  "password": "admin1234"
}

Response: 400 Bad Request
{
  "code": "A005",
  "message": "이메일 또는 비밀번호가 올바르지 않습니다."
}
```

---

## 🔍 원인 분석

### 1. 데이터베이스 상태 확인
```sql
SELECT id, email, name, password, is_active, is_approved, is_locked 
FROM users 
WHERE email = 'admin@aris.com';
```

**결과**:
- ✅ 사용자 존재: O
- ✅ is_active: true
- ✅ is_approved: true
- ✅ is_locked: false
- ❌ **password 해시**: 잘못된 BCrypt 해시

### 2. 초기 데이터 스크립트 확인
```sql
-- V99.0.0__insert_initial_data.sql
-- 관리자 계정 생성 (비밀번호: admin123) ← 주석과 실제 비밀번호 불일치
-- BCrypt 해시: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
```

**문제점**:
- 주석에는 "admin123"이라고 되어 있지만, 실제 테스트 가이드에는 "admin1234"로 안내
- BCrypt 해시가 어떤 비밀번호에 대한 것인지 불명확
- 실제로 admin123으로도 로그인 실패 (해시가 잘못됨)

---

## ✅ 해결 방법

### 1. 올바른 BCrypt 해시 생성

**방법**: 회원가입 API를 통해 테스트 사용자 생성 후 해시 복사

```bash
# 1. 테스트 사용자 생성 (password: admin1234)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "admin1234",
    "name": "Test User",
    "companyId": 1
  }'

# 2. 생성된 BCrypt 해시 확인
SELECT email, password FROM users WHERE email = 'test@test.com';
# Result: $2a$10$RSih82WGdPGHLKwNmBKFAeIEc69TebIajf97uZh8Ziq0X05V1SRqa

# 3. Admin 계정에 해시 복사
UPDATE users 
SET password = (SELECT password FROM users WHERE email = 'test@test.com') 
WHERE email = 'admin@aris.com';

# 4. 테스트 계정 삭제
DELETE FROM users WHERE email = 'test@test.com';
```

### 2. 초기 데이터 스크립트 수정

**파일**: `backend/src/main/resources/db/migration/V99.0.0__insert_initial_data.sql`

**변경 전**:
```sql
-- 관리자 계정 생성 (비밀번호: admin123)
-- BCrypt 해시: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
INSERT INTO users (email, password, name, company_id, is_active, is_approved, created_by, updated_by) VALUES
('admin@aris.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Admin', 
 (SELECT id FROM companies WHERE code = 'COMP001'), true, true, 'system', 'system');
```

**변경 후**:
```sql
-- 관리자 계정 생성 (비밀번호: admin1234)
-- BCrypt 해시: $2a$10$RSih82WGdPGHLKwNmBKFAeIEc69TebIajf97uZh8Ziq0X05V1SRqa
INSERT INTO users (email, password, name, company_id, is_active, is_approved, created_by, updated_by) VALUES
('admin@aris.com', '$2a$10$RSih82WGdPGHLKwNmBKFAeIEc69TebIajf97uZh8Ziq0X05V1SRqa', '시스템 관리자', 
 (SELECT id FROM companies WHERE code = 'COMP001'), true, true, 'system', 'system');
```

**변경 사항**:
1. ✅ 비밀번호: `admin123` → `admin1234`
2. ✅ BCrypt 해시: 올바른 해시로 업데이트
3. ✅ 이름: `Admin` → `시스템 관리자`

### 3. 현재 DB 데이터도 함께 수정

```sql
-- 사용자 이름 업데이트
UPDATE users SET name = '시스템 관리자' WHERE email = 'admin@aris.com';
```

---

## ✅ 검증

### 로그인 테스트
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aris.com",
    "password": "admin1234"
  }'
```

**결과**: ✅ 200 OK
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "user": {
    "id": 1,
    "email": "admin@aris.com",
    "name": "시스템 관리자",
    "roles": ["ROLE_ADMIN"],
    ...
  }
}
```

---

## 📋 최종 확인 사항

### 데이터베이스
```sql
-- 관리자 계정 확인
SELECT id, email, name, is_active, is_approved 
FROM users 
WHERE email = 'admin@aris.com';

-- Result:
-- id: 1
-- email: admin@aris.com
-- name: 시스템 관리자
-- is_active: true
-- is_approved: true
```

### 역할 확인
```sql
SELECT u.email, r.name as role_name 
FROM user_roles ur 
JOIN users u ON ur.user_id = u.id 
JOIN roles r ON ur.role_id = r.id 
WHERE u.email = 'admin@aris.com';

-- Result:
-- email: admin@aris.com
-- role_name: ROLE_ADMIN
```

---

## 🎓 교훈

### 1. BCrypt 해시 검증의 중요성
- BCrypt 해시는 직접 검증하기 어려움
- 주석에 명시된 비밀번호와 실제 해시가 일치하는지 확인 필요
- 테스트 환경에서 반드시 로그인 테스트 수행

### 2. 초기 데이터 생성 시 주의사항
- 비밀번호는 반드시 PasswordEncoder를 통해 생성
- 하드코딩된 해시는 검증된 것만 사용
- 주석과 실제 값이 일치하는지 확인

### 3. 문제 해결 프로세스
1. 데이터베이스 상태 확인 (사용자 존재 여부, 계정 상태)
2. 역할 확인 (권한 문제가 아닌지)
3. 실제 인증 로직 확인 (코드 검토)
4. BCrypt 해시 검증 (새로운 해시 생성 및 비교)

---

## 🚀 다음 단계

### 신규 환경 구축 시
1. `docker-compose down -v` (기존 볼륨 삭제)
2. `docker-compose build backend` (새로운 이미지 빌드)
3. `docker-compose up -d` (컨테이너 시작)
4. 로그인 테스트: `admin@aris.com` / `admin1234`

### 기존 환경 수정 시
- DB만 업데이트하면 되므로 위 SQL 명령어 실행

---

## ✅ 최종 상태

**로그인 계정 정보**:
- **이메일**: `admin@aris.com`
- **비밀번호**: `admin1234`
- **이름**: `시스템 관리자`
- **역할**: `ROLE_ADMIN`
- **상태**: 활성화됨 ✅

**테스트 완료**: ✅  
**문서 업데이트 완료**: ✅  
**초기 데이터 스크립트 수정 완료**: ✅

---

**작성자**: AI Assistant  
**프로젝트**: ARIS  
**Phase**: Phase 2 Testing  
**문서 버전**: 1.0.0









