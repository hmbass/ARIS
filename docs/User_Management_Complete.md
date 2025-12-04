# 사용자 관리 기능 구현 완료

## 📋 개요

ARIS 시스템에 사용자 관리 기능이 추가되었습니다. 시스템 관리자(SYSTEM_ADMIN) 권한을 가진 사용자만 접근할 수 있으며, 사용자 추가, 수정, 삭제, 비밀번호 재설정 등의 기능을 제공합니다.

**구현 날짜**: 2025-10-18

---

## 🎯 주요 기능

### 1. 사용자 관리 (CRUD)
- ✅ 사용자 목록 조회 (페이징)
- ✅ 사용자 상세 조회
- ✅ 사용자 생성
- ✅ 사용자 정보 수정
- ✅ 사용자 삭제 (Soft Delete)

### 2. 보안 기능
- ✅ 비밀번호 암호화 저장 (BCrypt)
- ✅ 비밀번호 재설정
- ✅ 시스템 관리자 권한 체크 (`@PreAuthorize("hasRole('SYSTEM_ADMIN')")`)

### 3. 사용자 상태 관리
- ✅ 활성화/비활성화 토글
- ✅ 계정 잠금 상태 표시
- ✅ 승인 상태 표시
- ✅ 마지막 로그인 시간 표시

---

## 🏗️ Backend 구현

### 1. DTO (Data Transfer Object)

#### UserCreateRequest
```java
@NotBlank(message = "이메일은 필수입니다.")
@Email(message = "올바른 이메일 형식이 아닙니다.")
private String email;

@NotBlank(message = "비밀번호는 필수입니다.")
@Size(min = 8, max = 20, message = "비밀번호는 8~20자여야 합니다.")
private String password;

@NotBlank(message = "이름은 필수입니다.")
@Size(max = 50, message = "이름은 50자 이내여야 합니다.")
private String name;

private String phoneNumber;
private Long companyId;
private Long departmentId;
private String employeeNumber;
private String position;
```

#### UserUpdateRequest
```java
private String name;
private String phoneNumber;
private String position;
private Long departmentId;
```

#### PasswordResetRequest
```java
@NotBlank(message = "새 비밀번호는 필수입니다.")
@Size(min = 8, max = 20, message = "비밀번호는 8~20자여야 합니다.")
private String newPassword;
```

#### UserResponse
```java
private Long id;
private String email;
private String name;
private String phoneNumber;
private String companyName;
private String departmentName;
private String employeeNumber;
private String position;
private Boolean isActive;
private Boolean isApproved;
private Boolean isLocked;
private List<String> roles;
private LocalDateTime lastLoginAt;
private LocalDateTime createdAt;
```

### 2. Service Layer

**파일**: `backend/src/main/java/com/aris/domain/user/service/UserService.java`

주요 메서드:
- `getUsers(Pageable pageable)`: 사용자 목록 조회
- `getUser(Long id)`: 사용자 상세 조회
- `createUser(UserCreateRequest request)`: 사용자 생성 (비밀번호 암호화)
- `updateUser(Long id, UserUpdateRequest request)`: 사용자 정보 수정
- `resetPassword(Long id, PasswordResetRequest request)`: 비밀번호 재설정
- `deleteUser(Long id)`: 사용자 삭제 (Soft Delete)
- `toggleUserStatus(Long id)`: 활성화/비활성화 토글

### 3. Controller Layer

**파일**: `backend/src/main/java/com/aris/domain/user/controller/UserController.java`

```java
@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class UserController {
    
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getUsers(Pageable pageable)
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id)
    
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request)
    
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request)
    
    @PutMapping("/{id}/password")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id, @Valid @RequestBody PasswordResetRequest request)
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id)
    
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleUserStatus(@PathVariable Long id)
}
```

### 4. Entity 수정

**파일**: `backend/src/main/java/com/aris/domain/user/entity/User.java`

추가된 메서드:
```java
public void updateName(String name)
public void updatePhoneNumber(String phoneNumber)
public void updatePosition(String position)
public void updateDepartment(Department department)
public void toggleActive()
```

### 5. Company Controller 추가

**파일**: `backend/src/main/java/com/aris/domain/company/controller/CompanyController.java`

```java
@GetMapping
public ResponseEntity<List<Company>> getCompanies()
```

---

## 🎨 Frontend 구현

### 1. API Client

**파일**: `frontend/src/api/user.ts`

```typescript
export const getUsers = async (params: UserListParams): Promise<PageResponse<User>>
export const getUser = async (id: number): Promise<User>
export const createUser = async (data: UserCreateRequest): Promise<User>
export const updateUser = async (id: number, data: UserUpdateRequest): Promise<User>
export const resetPassword = async (id: number, data: PasswordResetRequest): Promise<void>
export const deleteUser = async (id: number): Promise<void>
export const toggleUserStatus = async (id: number): Promise<void>
```

### 2. 페이지 구현

#### UserListPage
**파일**: `frontend/src/pages/user/UserListPage.tsx`

기능:
- 사용자 목록 조회 (페이징)
- 반응형 디자인 (모바일: 카드 뷰, 데스크톱: 테이블 뷰)
- 사용자 상태 표시 (활성, 비활성, 잠김, 미승인)
- 작업 버튼:
  - 수정 (Edit)
  - 비밀번호 재설정 (VpnKey)
  - 활성화/비활성화 토글 (Lock/LockOpen)
  - 삭제 (Delete)
- 삭제 확인 Dialog

#### UserCreatePage
**파일**: `frontend/src/pages/user/UserCreatePage.tsx`

기능:
- 사용자 생성 폼
- 필드:
  - 이메일 (필수, 이메일 형식 검증)
  - 비밀번호 (필수, 8~20자)
  - 이름 (필수, 최대 50자)
  - 전화번호 (선택)
  - 회사 (선택, 드롭다운)
  - 사번 (선택)
  - 직급 (선택)
- React Hook Form을 사용한 폼 검증

#### UserEditPage
**파일**: `frontend/src/pages/user/UserEditPage.tsx`

기능:
- 사용자 정보 수정 폼
- 수정 가능 필드:
  - 이름
  - 전화번호
  - 직급
- 이메일, 회사는 수정 불가 (읽기 전용)

#### PasswordResetPage
**파일**: `frontend/src/pages/user/PasswordResetPage.tsx`

기능:
- 비밀번호 재설정 폼
- 필드:
  - 새 비밀번호 (8~20자)
  - 비밀번호 확인 (일치 검증)
- 비밀번호 규칙 안내 Alert

### 3. 라우팅

**파일**: `frontend/src/App.tsx`

```typescript
{/* 사용자 관리 (시스템 관리자 전용) */}
<Route path="users" element={<UserListPage />} />
<Route path="users/new" element={<UserCreatePage />} />
<Route path="users/:id/edit" element={<UserEditPage />} />
<Route path="users/:id/password" element={<PasswordResetPage />} />
```

### 4. 사이드바 메뉴 추가

**파일**: `frontend/src/components/layout/Sidebar.tsx`

```typescript
{ text: '사용자 관리', icon: <People />, path: '/users' }
```

---

## 🔐 보안 적용

### 1. Backend 권한 체크

```java
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
```

- 모든 사용자 관리 API는 `SYSTEM_ADMIN` 권한이 필요합니다.
- 권한이 없는 사용자가 접근 시 `403 Forbidden` 에러 반환

### 2. 비밀번호 암호화

```java
String encodedPassword = passwordEncoder.encode(request.getPassword());
```

- BCrypt 알고리즘을 사용하여 비밀번호 암호화
- 평문 비밀번호는 데이터베이스에 저장되지 않음

### 3. Soft Delete

```java
public void delete() {
    this.deletedAt = LocalDateTime.now();
}
```

- 사용자 삭제 시 물리적 삭제가 아닌 논리적 삭제
- `deletedAt` 필드에 삭제 시간 기록

---

## 📊 데이터베이스

### User Entity 필드

```sql
- id: BIGINT (PK)
- email: VARCHAR(100) UNIQUE NOT NULL
- password: VARCHAR(255) NOT NULL (암호화)
- name: VARCHAR(50) NOT NULL
- phone_number: VARCHAR(20)
- company_id: BIGINT (FK)
- department_id: BIGINT (FK)
- employee_number: VARCHAR(20)
- position: VARCHAR(50)
- is_active: BOOLEAN NOT NULL DEFAULT TRUE
- is_approved: BOOLEAN NOT NULL DEFAULT FALSE
- is_locked: BOOLEAN NOT NULL DEFAULT FALSE
- resigned_at: DATE
- last_login_at: TIMESTAMP
- password_changed_at: TIMESTAMP
- failed_login_count: INTEGER NOT NULL DEFAULT 0
- created_at: TIMESTAMP NOT NULL
- created_by: VARCHAR(50) NOT NULL
- updated_at: TIMESTAMP NOT NULL
- updated_by: VARCHAR(50) NOT NULL
- deleted_at: TIMESTAMP
- version: BIGINT (Optimistic Locking)
```

---

## 🎯 UI/UX 특징

### 1. 반응형 디자인
- **모바일**: 카드 뷰로 사용자 정보 표시
- **데스크톱**: 테이블 뷰로 한눈에 정보 확인

### 2. 사용자 상태 표시
- **활성**: 녹색 Chip
- **비활성**: 회색 Chip
- **잠김**: 빨간색 Chip (Lock 아이콘)
- **미승인**: 주황색 Chip

### 3. 작업 버튼
- **수정**: 파란색 (Edit 아이콘)
- **비밀번호 재설정**: 보라색 (VpnKey 아이콘)
- **활성화/비활성화**: 주황/녹색 (Lock/LockOpen 아이콘)
- **삭제**: 빨간색 (Delete 아이콘)

### 4. 에러 처리
- API 에러 시 Alert 컴포넌트로 사용자에게 알림
- 성공 시 2초 후 자동으로 목록 페이지로 이동

---

## 🧪 테스트 방법

### 1. 시스템 관리자 로그인

```
이메일: admin@aris.com
비밀번호: admin1234
```

### 2. 사용자 관리 메뉴 접근

- 좌측 사이드바에서 "사용자 관리" 클릭
- URL: `http://localhost:3000/users`

### 3. 사용자 생성 테스트

1. "사용자 등록" 버튼 클릭
2. 필수 정보 입력:
   - 이메일: test@example.com
   - 비밀번호: test1234
   - 이름: 테스트 사용자
3. "등록" 버튼 클릭
4. 성공 메시지 확인 후 목록 페이지로 이동

### 4. 사용자 수정 테스트

1. 사용자 목록에서 "수정" 아이콘 클릭
2. 정보 수정 (이름, 전화번호, 직급)
3. "수정" 버튼 클릭
4. 변경 사항 확인

### 5. 비밀번호 재설정 테스트

1. 사용자 목록에서 "비밀번호 재설정" 아이콘 클릭
2. 새 비밀번호 입력 (8~20자)
3. 비밀번호 확인 입력
4. "재설정" 버튼 클릭

### 6. 활성화/비활성화 테스트

1. 사용자 목록에서 "활성화/비활성화" 아이콘 클릭
2. 상태 변경 확인 (Chip 색상 변경)

### 7. 사용자 삭제 테스트

1. 사용자 목록에서 "삭제" 아이콘 클릭
2. 삭제 확인 Dialog에서 "삭제" 버튼 클릭
3. 목록에서 사용자 제거 확인

---

## 🔗 API 엔드포인트

### Base URL
```
http://localhost:8080/api/users
```

### 엔드포인트 목록

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/users` | 사용자 목록 조회 | SYSTEM_ADMIN |
| GET | `/api/users/{id}` | 사용자 상세 조회 | SYSTEM_ADMIN |
| POST | `/api/users` | 사용자 생성 | SYSTEM_ADMIN |
| PUT | `/api/users/{id}` | 사용자 정보 수정 | SYSTEM_ADMIN |
| PUT | `/api/users/{id}/password` | 비밀번호 재설정 | SYSTEM_ADMIN |
| DELETE | `/api/users/{id}` | 사용자 삭제 | SYSTEM_ADMIN |
| PATCH | `/api/users/{id}/toggle-status` | 활성화/비활성화 토글 | SYSTEM_ADMIN |

### Swagger UI
```
http://localhost:8080/swagger-ui.html
```

---

## 📝 주요 파일 목록

### Backend

```
backend/src/main/java/com/aris/domain/user/
├── controller/
│   └── UserController.java
├── service/
│   └── UserService.java
├── dto/
│   ├── UserCreateRequest.java
│   ├── UserUpdateRequest.java
│   ├── PasswordResetRequest.java
│   └── UserResponse.java
├── entity/
│   └── User.java
└── repository/
    └── UserRepository.java

backend/src/main/java/com/aris/domain/company/
└── controller/
    └── CompanyController.java
```

### Frontend

```
frontend/src/
├── api/
│   └── user.ts
├── pages/
│   └── user/
│       ├── UserListPage.tsx
│       ├── UserCreatePage.tsx
│       ├── UserEditPage.tsx
│       └── PasswordResetPage.tsx
├── components/
│   └── layout/
│       └── Sidebar.tsx (메뉴 추가)
├── types/
│   └── project.types.ts (Company 타입 추가)
└── App.tsx (라우팅 추가)
```

---

## ✅ 완료 항목

- [x] Backend DTO 구현
- [x] Backend Service 구현
- [x] Backend Controller 구현
- [x] 시스템 관리자 권한 체크
- [x] 비밀번호 암호화
- [x] Frontend Types 구현
- [x] Frontend API Client 구현
- [x] 사용자 목록 페이지
- [x] 사용자 생성 페이지
- [x] 사용자 수정 페이지
- [x] 비밀번호 재설정 페이지
- [x] 사이드바 메뉴 추가
- [x] 라우팅 설정
- [x] 반응형 디자인
- [x] Docker 빌드 및 배포

---

## 🚀 실행 방법

### 1. Docker Compose로 전체 시스템 실행

```bash
cd /Users/kevinpark/Desktop/Dev/ARIS
docker-compose up -d
```

### 2. 서비스 확인

```bash
docker-compose ps
```

### 3. 접속

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html

### 4. 로그인

```
이메일: admin@aris.com
비밀번호: admin1234
```

---

## 📌 참고 사항

### 1. 권한 관리

- 현재 시스템 관리자(`SYSTEM_ADMIN`) 권한만 사용자 관리 기능에 접근 가능
- 일반 사용자는 자신의 정보만 조회/수정 가능 (추후 구현 예정)

### 2. 비밀번호 정책

- 최소 8자, 최대 20자
- BCrypt 알고리즘으로 암호화
- 비밀번호 변경 시 `password_changed_at` 필드 자동 업데이트

### 3. 계정 잠금

- 로그인 5회 실패 시 자동 잠금
- 시스템 관리자가 수동으로 잠금 해제 가능 (추후 구현 예정)

### 4. Soft Delete

- 사용자 삭제 시 물리적 삭제가 아닌 논리적 삭제
- `deleted_at` 필드에 삭제 시간 기록
- 삭제된 사용자는 목록에서 표시되지 않음

---

## 🎉 완료!

사용자 관리 기능이 성공적으로 구현되었습니다. 시스템 관리자는 이제 사용자를 효율적으로 관리할 수 있습니다.

**구현 완료 날짜**: 2025-10-18



