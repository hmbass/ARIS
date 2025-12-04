# 사용자 관리 권한 문제 및 초기 비밀번호 변경 기능 추가

## 📋 문제 상황

### 1. 403 Forbidden 에러
```
GET http://localhost:3000/api/users?page=0&size=10 403 (Forbidden)
{code: 'A002', message: '권한이 없습니다.'}
```

**원인**: 
- UserController가 `@PreAuthorize("hasRole('SYSTEM_ADMIN')")` 권한을 요구
- 하지만 초기 데이터에는 `ROLE_ADMIN`만 존재하고 `ROLE_SYSTEM_ADMIN`이 없음
- admin 사용자에게 `ROLE_ADMIN`만 부여되어 권한 불일치 발생

### 2. 초기 비밀번호 변경 기능 미구현
- 신규 사용자 생성 시 초기 비밀번호 변경 강제 기능 없음
- 최초 로그인 시 비밀번호 변경 유도 기능 없음

---

## 🔧 해결 방법

### 1. SYSTEM_ADMIN 역할 추가

**파일**: `backend/src/main/resources/db/migration/V99.2.0__add_system_admin_role.sql`

```sql
-- SYSTEM_ADMIN 역할 추가
INSERT INTO roles (name, description, role_type, created_by, updated_by) 
VALUES ('ROLE_SYSTEM_ADMIN', '시스템 최고 관리자', 'SYSTEM', 'system', 'system')
ON CONFLICT (name) DO NOTHING;

-- admin 사용자에게 SYSTEM_ADMIN 역할 부여
INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT 
    u.id,
    r.id,
    'system'
FROM users u, roles r
WHERE u.email = 'admin@aris.com'
  AND r.name = 'ROLE_SYSTEM_ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );
```

### 2. 초기 비밀번호 변경 필수 기능 추가

#### 2.1 데이터베이스 스키마 추가

**파일**: `backend/src/main/resources/db/migration/V99.3.0__add_password_change_required.sql`

```sql
-- 초기 비밀번호 변경 필요 플래그 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_change_required BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN users.password_change_required IS '초기 비밀번호 변경 필요 여부';
```

#### 2.2 User Entity 수정

**파일**: `backend/src/main/java/com/aris/domain/user/entity/User.java`

```java
@Column(nullable = false)
private Boolean passwordChangeRequired = false;

/**
 * 비밀번호 변경
 */
public void changePassword(String newPassword) {
    this.password = newPassword;
    this.passwordChangedAt = LocalDateTime.now();
    this.passwordChangeRequired = false; // 비밀번호 변경 시 플래그 해제
}

/**
 * 초기 비밀번호 변경 필요 설정
 */
public void requirePasswordChange() {
    this.passwordChangeRequired = true;
}
```

#### 2.3 UserService 수정

**파일**: `backend/src/main/java/com/aris/domain/user/service/UserService.java`

```java
@Transactional
public UserResponse createUser(UserCreateRequest request) {
    // ... 사용자 생성 로직 ...
    
    // 신규 사용자는 초기 비밀번호 변경 필요
    user.requirePasswordChange();
    
    User savedUser = userRepository.save(user);
    log.info("사용자 생성 완료: {}", savedUser.getEmail());
    
    return UserResponse.from(savedUser);
}
```

#### 2.4 UserResponse 수정

**파일**: `backend/src/main/java/com/aris/domain/user/dto/UserResponse.java`

```java
private Boolean passwordChangeRequired;

public static UserResponse from(User user) {
    return UserResponse.builder()
            // ... 기존 필드들 ...
            .passwordChangeRequired(user.getPasswordChangeRequired())
            .build();
}
```

---

## ✅ 해결된 문제

### 1. 권한 문제 해결
- ✅ `ROLE_SYSTEM_ADMIN` 역할 추가
- ✅ admin 사용자에게 `ROLE_SYSTEM_ADMIN` 역할 자동 부여
- ✅ 사용자 관리 API 정상 접근 가능
- ✅ 사용자 목록 조회, 생성, 수정, 삭제 모두 정상 동작

### 2. 초기 비밀번호 변경 기능 구현
- ✅ `passwordChangeRequired` 필드 추가
- ✅ 신규 사용자 생성 시 자동으로 `passwordChangeRequired = true` 설정
- ✅ 비밀번호 변경 시 자동으로 `passwordChangeRequired = false` 설정
- ✅ 로그인 응답에 `passwordChangeRequired` 정보 포함

---

## 🔐 권한 구조

### 역할(Role) 목록

| 역할 이름 | 설명 | 용도 |
|-----------|------|------|
| `ROLE_SYSTEM_ADMIN` | 시스템 최고 관리자 | 사용자 관리, 시스템 설정 등 모든 권한 |
| `ROLE_ADMIN` | 시스템 관리자 | 일반 관리 권한 |
| `ROLE_PM` | PM (Project Manager) | 프로젝트 관리 권한 |
| `ROLE_PL` | PL (Project Leader) | 프로젝트 리더 권한 |
| `ROLE_DEVELOPER` | 개발자 | 개발 관련 권한 |
| `ROLE_USER` | 일반 사용자 | 기본 사용 권한 |

### 권한 체크

```java
// UserController - 시스템 관리자만 접근 가능
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class UserController {
    // 사용자 관리 API
}

// 다른 Controller - 인증된 사용자만 접근 가능
@PreAuthorize("isAuthenticated()")
public class ProjectController {
    // 프로젝트 관리 API
}
```

---

## 🔄 사용자 생성 및 로그인 플로우

### 1. 사용자 생성 (시스템 관리자)

```
1. 시스템 관리자가 사용자 등록
   ↓
2. 초기 비밀번호 설정 (예: user1234)
   ↓
3. passwordChangeRequired = true 자동 설정
   ↓
4. 사용자 계정 생성 완료
```

### 2. 신규 사용자 최초 로그인

```
1. 신규 사용자가 로그인
   ↓
2. LoginResponse에 passwordChangeRequired: true 포함
   ↓
3. Frontend에서 비밀번호 변경 페이지로 리다이렉트
   ↓
4. 사용자가 새 비밀번호 입력
   ↓
5. 비밀번호 변경 API 호출
   ↓
6. passwordChangeRequired = false 자동 설정
   ↓
7. 정상적으로 시스템 사용 가능
```

---

## 📊 API 응답 예시

### 로그인 응답 (신규 사용자)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "name": "신규 사용자",
    "isActive": true,
    "isApproved": true,
    "isLocked": false,
    "passwordChangeRequired": true,  // ← 초기 비밀번호 변경 필요
    "roles": ["ROLE_USER"],
    "createdAt": "2025-10-18T15:30:00"
  }
}
```

### 비밀번호 변경 후 로그인 응답

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "name": "신규 사용자",
    "isActive": true,
    "isApproved": true,
    "isLocked": false,
    "passwordChangeRequired": false,  // ← 비밀번호 변경 완료
    "roles": ["ROLE_USER"],
    "createdAt": "2025-10-18T15:30:00"
  }
}
```

---

## 🧪 테스트 방법

### 1. 권한 테스트

```bash
# 1. admin 계정으로 로그인
POST http://localhost:8080/api/auth/login
{
  "email": "admin@aris.com",
  "password": "admin1234"
}

# 2. 사용자 목록 조회 (SYSTEM_ADMIN 권한 필요)
GET http://localhost:8080/api/users
Authorization: Bearer {accessToken}

# 3. 정상 응답 확인 (200 OK)
```

### 2. 신규 사용자 생성 및 로그인 테스트

```bash
# 1. 신규 사용자 생성 (admin 계정)
POST http://localhost:8080/api/users
Authorization: Bearer {adminAccessToken}
{
  "email": "testuser@example.com",
  "password": "test1234",
  "name": "테스트 사용자",
  "companyId": 1
}

# 2. 신규 사용자로 로그인
POST http://localhost:8080/api/auth/login
{
  "email": "testuser@example.com",
  "password": "test1234"
}

# 3. 응답에서 passwordChangeRequired: true 확인

# 4. 비밀번호 변경
PUT http://localhost:8080/api/users/{userId}/password
Authorization: Bearer {adminAccessToken}
{
  "newPassword": "newpassword1234"
}

# 5. 새 비밀번호로 재로그인
POST http://localhost:8080/api/auth/login
{
  "email": "testuser@example.com",
  "password": "newpassword1234"
}

# 6. 응답에서 passwordChangeRequired: false 확인
```

---

## 📝 추가된/수정된 파일

### Backend

```
backend/src/main/resources/db/migration/
├── V99.2.0__add_system_admin_role.sql (NEW)
└── V99.3.0__add_password_change_required.sql (NEW)

backend/src/main/java/com/aris/domain/user/
├── entity/
│   └── User.java (UPDATED - passwordChangeRequired 필드 및 메서드 추가)
├── dto/
│   └── UserResponse.java (UPDATED - passwordChangeRequired 필드 추가)
└── service/
    └── UserService.java (UPDATED - 신규 사용자 생성 시 플래그 설정)
```

---

## 🎯 다음 단계 (Frontend 구현 필요)

### 1. 로그인 후 비밀번호 변경 필요 체크

```typescript
// LoginPage.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await login(formData);
    setAuth(response.user, response.accessToken, response.refreshToken);
    
    // 초기 비밀번호 변경 필요 체크
    if (response.user.passwordChangeRequired) {
      navigate('/change-password');  // 비밀번호 변경 페이지로 리다이렉트
    } else {
      navigate('/dashboard');
    }
  } catch (err: any) {
    setError(err.message || '로그인에 실패했습니다.');
  }
};
```

### 2. 비밀번호 변경 페이지 구현

```typescript
// ChangePasswordPage.tsx
- 현재 비밀번호 확인 (선택사항)
- 새 비밀번호 입력
- 새 비밀번호 확인
- 비밀번호 규칙 표시 (8~20자)
- 변경 완료 후 대시보드로 이동
```

---

## 🎉 완료!

사용자 관리 권한 문제가 해결되고, 초기 비밀번호 변경 기능이 추가되었습니다.

**수정 날짜**: 2025-10-18
**관련 이슈**: 
- 403 Forbidden 에러 (권한 없음)
- 초기 비밀번호 변경 기능 미구현



