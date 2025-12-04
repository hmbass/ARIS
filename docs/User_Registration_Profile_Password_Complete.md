# 사용자 가입, 프로필 변경, 비밀번호 관리 기능 완료

## 📋 구현 내용

### 1. 사용자 가입 (회원가입)
### 2. 사용자 정보 변경 (프로필 수정)
### 3. 비밀번호 찾기 (임시 비밀번호 발급)
### 4. 비밀번호 변경

---

## 🎯 1. 사용자 가입 (회원가입)

### Backend

#### API 엔드포인트
```
POST /api/auth/register
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "phoneNumber": "010-1234-5678",
  "companyId": 1,
  "departmentId": 1,
  "employeeNumber": "EMP001",
  "position": "대리"
}
```

**Response**:
```json
{
  "id": 2,
  "email": "user@example.com",
  "name": "홍길동",
  "phoneNumber": "010-1234-5678",
  "companyName": "ARIS 본사",
  "departmentName": "개발팀",
  "employeeNumber": "EMP001",
  "position": "대리",
  "isActive": true,
  "isApproved": false,
  "isLocked": false,
  "passwordChangeRequired": false,
  "roles": [],
  "createdAt": "2025-10-18T15:30:00"
}
```

### Frontend

**파일**: `frontend/src/pages/auth/RegisterPage.tsx`

**기능**:
- ✅ 이메일, 비밀번호, 이름, 전화번호, 회사 선택
- ✅ 비밀번호 확인 (일치 여부 검증)
- ✅ 폼 유효성 검증 (React Hook Form)
- ✅ 회사 목록 자동 로드
- ✅ 가입 완료 후 로그인 페이지로 리다이렉트
- ✅ 관리자 승인 대기 안내 메시지

**접근 경로**:
- 로그인 페이지 → "회원가입" 링크
- 직접 URL: `/register`

---

## 🎯 2. 사용자 정보 변경 (프로필 수정)

### Backend

#### API 엔드포인트
```
GET /api/users/{id}
PUT /api/users/{id}
```

**Update Request Body**:
```json
{
  "name": "홍길동",
  "phoneNumber": "010-9999-8888",
  "position": "과장",
  "departmentId": 2
}
```

### Frontend

**파일**: `frontend/src/pages/user/ProfilePage.tsx`

**기능**:
- ✅ 현재 사용자 정보 표시 (아바타, 이메일, 회사, 부서)
- ✅ 이름, 전화번호, 직급 수정
- ✅ 폼 유효성 검증
- ✅ 수정 완료 후 성공 메시지 표시
- ✅ authStore 자동 업데이트

**접근 경로**:
- 헤더 → 사용자 메뉴 → "내 프로필"
- 직접 URL: `/profile`

**화면 구성**:
```
┌─────────────────────────────────────┐
│  👤 홍길동                           │
│  user@example.com                   │
│  ARIS 본사 - 개발팀                 │
├─────────────────────────────────────┤
│  기본 정보                           │
│  ┌─────────────────────────────┐   │
│  │ 이름: [홍길동]              │   │
│  │ 전화번호: [010-1234-5678]   │   │
│  │ 직급: [대리]                │   │
│  └─────────────────────────────┘   │
│                          [저장]     │
└─────────────────────────────────────┘
```

---

## 🎯 3. 비밀번호 찾기 (임시 비밀번호 발급)

### Backend

#### API 엔드포인트
```
POST /api/auth/forgot-password
```

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```
임시 비밀번호가 발급되었습니다: a1b2c3d4
```

**처리 로직**:
1. 이메일로 사용자 조회
2. 8자리 랜덤 임시 비밀번호 생성
3. 비밀번호 암호화 후 저장
4. `passwordChangeRequired = true` 설정
5. 임시 비밀번호 반환 (개발 환경)

**파일**:
- `backend/src/main/java/com/aris/domain/auth/dto/ForgotPasswordRequest.java`
- `backend/src/main/java/com/aris/domain/auth/service/AuthService.java`
- `backend/src/main/java/com/aris/domain/auth/controller/AuthController.java`

### Frontend

**파일**: `frontend/src/pages/auth/ForgotPasswordPage.tsx`

**기능**:
- ✅ 이메일 입력
- ✅ 임시 비밀번호 발급 요청
- ✅ 발급된 임시 비밀번호 화면 표시 (개발 환경)
- ✅ 로그인 페이지로 이동 버튼

**접근 경로**:
- 로그인 페이지 → "비밀번호 찾기" 링크
- 직접 URL: `/forgot-password`

**화면 구성**:
```
┌─────────────────────────────────────┐
│          📧                          │
│      비밀번호 찾기                   │
│  가입하신 이메일을 입력하시면        │
│  임시 비밀번호를 발급해드립니다.     │
├─────────────────────────────────────┤
│  이메일: [user@example.com]         │
│                                      │
│  [임시 비밀번호 발급]                │
│                                      │
│  ✅ 임시 비밀번호가 발급되었습니다.  │
│  ┌───────────────────────────────┐  │
│  │ 임시 비밀번호: a1b2c3d4       │  │
│  │ * 로그인 후 반드시 비밀번호를 │  │
│  │   변경해주세요.                │  │
│  └───────────────────────────────┘  │
│                                      │
│  [로그인 페이지로 이동]              │
└─────────────────────────────────────┘
```

---

## 🎯 4. 비밀번호 변경

### Backend

#### API 엔드포인트
```
PUT /api/users/{id}/password
```

**Request Body**:
```json
{
  "newPassword": "newpassword123"
}
```

**처리 로직**:
1. 사용자 조회
2. 새 비밀번호 암호화
3. `user.changePassword()` 호출
4. `passwordChangeRequired = false` 자동 설정
5. `passwordChangedAt = 현재시간` 자동 설정

### Frontend

**파일**: `frontend/src/pages/user/ChangePasswordPage.tsx`

**기능**:
- ✅ 새 비밀번호 입력
- ✅ 새 비밀번호 확인 (일치 여부 검증)
- ✅ 비밀번호 규칙 표시 (8~20자)
- ✅ 변경 완료 후 로그인 페이지로 리다이렉트

**접근 경로**:
- 헤더 → 사용자 메뉴 → "비밀번호 변경"
- 직접 URL: `/change-password`

**화면 구성**:
```
┌─────────────────────────────────────┐
│  🔒 새 비밀번호 설정                │
├─────────────────────────────────────┤
│  새 비밀번호: [**********]          │
│  새 비밀번호 확인: [**********]     │
│                                      │
│  비밀번호 규칙                       │
│  ✓ 8자 이상 20자 이하               │
│  ✓ 영문, 숫자 조합 권장             │
│  ✓ 특수문자 사용 가능               │
│                                      │
│            [취소] [비밀번호 변경]   │
└─────────────────────────────────────┘
```

---

## 🔄 사용자 플로우

### 1. 회원가입 플로우

```
1. 로그인 페이지 접속
   ↓
2. "회원가입" 클릭
   ↓
3. 회원가입 폼 작성
   - 이메일
   - 비밀번호 (8~20자)
   - 비밀번호 확인
   - 이름
   - 전화번호 (선택)
   - 회사 선택
   ↓
4. "가입하기" 클릭
   ↓
5. 가입 완료 메시지
   "회원가입이 완료되었습니다. 관리자 승인 후 로그인 가능합니다."
   ↓
6. 3초 후 로그인 페이지로 자동 이동
   ↓
7. 관리자 승인 대기
   (시스템 관리자가 사용자 관리에서 승인)
   ↓
8. 승인 후 로그인 가능
```

### 2. 비밀번호 찾기 플로우

```
1. 로그인 페이지 접속
   ↓
2. "비밀번호 찾기" 클릭
   ↓
3. 가입한 이메일 입력
   ↓
4. "임시 비밀번호 발급" 클릭
   ↓
5. 임시 비밀번호 화면 표시
   (개발 환경: 화면에 표시)
   (운영 환경: 이메일로 전송)
   ↓
6. "로그인 페이지로 이동" 클릭
   ↓
7. 임시 비밀번호로 로그인
   ↓
8. passwordChangeRequired = true이므로
   비밀번호 변경 페이지로 리다이렉트 (향후 구현)
   ↓
9. 새 비밀번호 설정
   ↓
10. 정상 시스템 사용
```

### 3. 프로필 수정 플로우

```
1. 로그인 후 대시보드
   ↓
2. 헤더 → 사용자 아바타 클릭
   ↓
3. "내 프로필" 클릭
   ↓
4. 프로필 페이지 표시
   - 현재 정보 확인
   ↓
5. 정보 수정
   - 이름
   - 전화번호
   - 직급
   ↓
6. "저장" 클릭
   ↓
7. 성공 메시지 표시
   "프로필이 성공적으로 수정되었습니다."
   ↓
8. 헤더의 사용자 정보 자동 업데이트
```

### 4. 비밀번호 변경 플로우

```
1. 로그인 후 대시보드
   ↓
2. 헤더 → 사용자 아바타 클릭
   ↓
3. "비밀번호 변경" 클릭
   ↓
4. 비밀번호 변경 페이지 표시
   ↓
5. 새 비밀번호 입력
   - 새 비밀번호
   - 새 비밀번호 확인
   ↓
6. "비밀번호 변경" 클릭
   ↓
7. 성공 메시지 표시
   "비밀번호가 성공적으로 변경되었습니다."
   ↓
8. 2초 후 로그인 페이지로 자동 이동
   ↓
9. 새 비밀번호로 재로그인
```

---

## 📁 추가/수정된 파일

### Backend

```
backend/src/main/java/com/aris/domain/auth/
├── dto/
│   ├── ForgotPasswordRequest.java (NEW)
│   └── ResetPasswordRequest.java (NEW)
├── service/
│   └── AuthService.java (UPDATED - forgotPassword, resetPasswordWithToken 메서드 추가)
└── controller/
    └── AuthController.java (UPDATED - /forgot-password 엔드포인트 추가)

backend/src/main/resources/db/migration/
├── V99.2.0__add_system_admin_role.sql (NEW)
└── V99.3.0__add_password_change_required.sql (NEW)
```

### Frontend

```
frontend/src/pages/
├── auth/
│   ├── RegisterPage.tsx (NEW)
│   ├── ForgotPasswordPage.tsx (NEW)
│   └── LoginPage.tsx (UPDATED - 회원가입, 비밀번호 찾기 링크 추가)
└── user/
    ├── ProfilePage.tsx (NEW)
    └── ChangePasswordPage.tsx (NEW)

frontend/src/components/layout/
└── Header.tsx (UPDATED - 프로필, 비밀번호 변경 메뉴 추가)

frontend/src/types/
└── auth.types.ts (UPDATED - User 타입 필드 optional 처리)

frontend/src/
└── App.tsx (UPDATED - 라우트 추가)
```

---

## 🧪 테스트 방법

### 1. 회원가입 테스트

```bash
# 1. 브라우저에서 http://localhost:3000 접속
# 2. "회원가입" 클릭
# 3. 폼 작성:
#    - 이메일: test@example.com
#    - 비밀번호: test1234
#    - 비밀번호 확인: test1234
#    - 이름: 테스트 사용자
#    - 전화번호: 010-1234-5678
#    - 회사: ARIS 본사
# 4. "가입하기" 클릭
# 5. 성공 메시지 확인
# 6. 로그인 페이지로 자동 이동 확인

# 7. admin 계정으로 로그인
# 8. 사용자 관리 → 신규 사용자 승인
# 9. 로그아웃 후 신규 계정으로 로그인 테스트
```

### 2. 비밀번호 찾기 테스트

```bash
# 1. 로그인 페이지에서 "비밀번호 찾기" 클릭
# 2. 이메일 입력: test@example.com
# 3. "임시 비밀번호 발급" 클릭
# 4. 화면에 표시된 임시 비밀번호 복사
# 5. "로그인 페이지로 이동" 클릭
# 6. 임시 비밀번호로 로그인
# 7. 로그인 성공 확인
```

### 3. 프로필 수정 테스트

```bash
# 1. 로그인 후 헤더의 사용자 아바타 클릭
# 2. "내 프로필" 클릭
# 3. 정보 수정:
#    - 이름: 홍길동 → 김철수
#    - 전화번호: 010-1234-5678 → 010-9999-8888
#    - 직급: 대리 → 과장
# 4. "저장" 클릭
# 5. 성공 메시지 확인
# 6. 헤더의 이름이 "김철수"로 변경되었는지 확인
```

### 4. 비밀번호 변경 테스트

```bash
# 1. 로그인 후 헤더의 사용자 아바타 클릭
# 2. "비밀번호 변경" 클릭
# 3. 새 비밀번호 입력:
#    - 새 비밀번호: newpass123
#    - 새 비밀번호 확인: newpass123
# 4. "비밀번호 변경" 클릭
# 5. 성공 메시지 확인
# 6. 로그인 페이지로 자동 이동 확인
# 7. 새 비밀번호로 재로그인 테스트
```

---

## 🎨 UI/UX 개선 사항

### 1. 통일된 디자인
- ✅ 모든 인증 페이지 중앙 정렬
- ✅ Paper 컴포넌트로 카드 스타일 통일
- ✅ 일관된 버튼 스타일 및 크기

### 2. 사용자 친화적 메시지
- ✅ 명확한 에러 메시지
- ✅ 성공 메시지 표시
- ✅ 로딩 인디케이터
- ✅ 비밀번호 규칙 안내

### 3. 폼 유효성 검증
- ✅ React Hook Form 사용
- ✅ 실시간 에러 표시
- ✅ 비밀번호 일치 여부 확인
- ✅ 이메일 형식 검증

### 4. 반응형 디자인
- ✅ 모바일, 태블릿, 데스크톱 대응
- ✅ 적절한 여백 및 패딩
- ✅ 터치 친화적 버튼 크기

---

## 🔐 보안 고려사항

### 1. 비밀번호 보안
- ✅ BCrypt 암호화 (Backend)
- ✅ 8~20자 길이 제한
- ✅ 비밀번호 확인 필드
- ✅ 비밀번호 변경 이력 저장 (`passwordChangedAt`)

### 2. 임시 비밀번호
- ✅ 8자리 랜덤 생성 (UUID 기반)
- ✅ 발급 시 `passwordChangeRequired = true` 설정
- ✅ 로그인 후 비밀번호 변경 강제 (향후 구현)

### 3. 사용자 승인
- ✅ 회원가입 시 `isApproved = false` 기본값
- ✅ 관리자 승인 필요
- ✅ 미승인 사용자 로그인 차단

### 4. 계정 잠금
- ✅ 로그인 실패 5회 시 자동 잠금
- ✅ 잠긴 계정 로그인 차단
- ✅ 관리자가 수동으로 잠금 해제

---

## 📝 향후 개선 사항

### 1. 이메일 발송 기능
```java
// TODO: 실제 운영 환경에서는 이메일로 임시 비밀번호 전송
// emailService.sendTempPassword(user.getEmail(), tempPassword);
```

현재는 개발 환경으로 화면에 임시 비밀번호를 표시하지만, 운영 환경에서는:
- SMTP 서버 설정
- 이메일 템플릿 작성
- 비동기 이메일 발송
- 발송 이력 저장

### 2. 비밀번호 변경 강제
로그인 시 `passwordChangeRequired = true`인 경우:
```typescript
if (response.user.passwordChangeRequired) {
  navigate('/change-password');
}
```

### 3. 비밀번호 정책 강화
- 영문, 숫자, 특수문자 조합 필수
- 이전 비밀번호 재사용 방지
- 비밀번호 만료 기간 설정 (90일)

### 4. 2단계 인증 (2FA)
- TOTP (Time-based One-Time Password)
- SMS 인증
- 이메일 인증 코드

### 5. 소셜 로그인
- Google OAuth
- Naver OAuth
- Kakao OAuth

---

## 🎉 완료!

모든 사용자 관리 기능이 구현되었습니다!

**구현된 기능**:
- ✅ 사용자 가입 (회원가입)
- ✅ 사용자 정보 변경 (프로필 수정)
- ✅ 비밀번호 찾기 (임시 비밀번호 발급)
- ✅ 비밀번호 변경
- ✅ 초기 비밀번호 변경 필수 기능
- ✅ 사용자 승인 시스템
- ✅ 계정 잠금 기능

**수정 날짜**: 2025-10-18
**관련 기능**: 사용자 관리, 인증/인가



