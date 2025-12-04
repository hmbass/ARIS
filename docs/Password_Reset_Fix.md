# 비밀번호 관리 기능 개선

## 📋 변경 사항

### 1. 비밀번호 찾기 기능 제거
- ❌ 일반 사용자용 비밀번호 찾기 페이지 제거
- ✅ 관리자용 비밀번호 초기화 기능만 유지

### 2. 회원가입 개선
- ✅ 회사 선택을 선택사항으로 변경
- ✅ 회사 미선택 시 기본 회사 자동 할당
- ✅ autocomplete 속성 추가 (보안 경고 해결)

### 3. 로그인 페이지 개선
- ✅ autocomplete 속성 추가
- ✅ 비밀번호 찾기 링크 제거
- ✅ 관리자 문의 안내 메시지 추가

---

## 🔐 비밀번호 관리 정책

### 사용자 비밀번호 분실 시

```
1. 사용자가 비밀번호 분실
   ↓
2. 관리자에게 문의
   ↓
3. 관리자가 사용자 관리 페이지에서 비밀번호 초기화
   ↓
4. 관리자가 새 비밀번호를 사용자에게 전달
   ↓
5. 사용자가 새 비밀번호로 로그인
   ↓
6. 사용자가 자신의 비밀번호 변경 (헤더 → 비밀번호 변경)
```

### 관리자 비밀번호 초기화 절차

1. **사용자 관리 페이지 접속**
   - 경로: `/users`
   - 권한: `SYSTEM_ADMIN`

2. **사용자 선택**
   - 비밀번호를 초기화할 사용자 찾기

3. **비밀번호 재설정**
   - "비밀번호 재설정" 버튼 클릭
   - 새 비밀번호 입력 (8~20자)
   - 비밀번호 확인
   - "재설정" 버튼 클릭

4. **사용자에게 전달**
   - 새 비밀번호를 안전한 방법으로 사용자에게 전달
   - 이메일, 메신저, 전화 등

---

## 🔧 수정된 파일

### Backend

**파일**: `backend/src/main/java/com/aris/domain/auth/service/AuthService.java`

```java
@Transactional
public UserResponse register(UserCreateRequest request) {
    // 이메일 중복 체크
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
    }

    // Company 조회 (companyId가 없으면 첫 번째 회사 사용)
    Company company;
    if (request.getCompanyId() != null) {
        company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new BusinessException(ErrorCode.COMPANY_NOT_FOUND));
    } else {
        company = companyRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.COMPANY_NOT_FOUND));
    }
    
    // ... 나머지 로직
}
```

### Frontend

#### 1. LoginPage.tsx

**변경 사항**:
- ✅ autocomplete 속성 추가
  - 이메일: `autoComplete="email"`
  - 비밀번호: `autoComplete="current-password"`
- ✅ 비밀번호 찾기 링크 제거
- ✅ 관리자 문의 안내 추가

```tsx
<TextField
  fullWidth
  label="이메일"
  name="email"
  type="email"
  autoComplete="email"  // 추가
  // ...
/>

<TextField
  fullWidth
  label="비밀번호"
  name="password"
  type="password"
  autoComplete="current-password"  // 추가
  // ...
/>

<Typography variant="caption" display="block" color="text.secondary">
  비밀번호를 잊으셨나요? 관리자에게 문의하세요.
</Typography>
```

#### 2. RegisterPage.tsx

**변경 사항**:
- ✅ autocomplete 속성 추가
  - 이메일: `autoComplete="email"`
  - 비밀번호: `autoComplete="new-password"`
  - 비밀번호 확인: `autoComplete="new-password"`
- ✅ 회사 선택을 선택사항으로 변경
- ✅ 회사 미선택 시 기본 회사 자동 할당 안내

```tsx
<TextField
  label="회사 (선택사항)"
  helperText="선택하지 않으면 기본 회사로 등록됩니다."
  // required 제거
/>
```

#### 3. App.tsx

**변경 사항**:
- ❌ ForgotPasswordPage import 제거
- ❌ `/forgot-password` 라우트 제거

---

## 🧪 테스트 방법

### 1. 회원가입 테스트

```bash
# 1. http://localhost:3000 접속
# 2. "회원가입" 클릭
# 3. 폼 작성:
#    - 이메일: test@example.com
#    - 비밀번호: test1234
#    - 비밀번호 확인: test1234
#    - 이름: 테스트 사용자
#    - 전화번호: 010-1234-5678
#    - 회사: (선택하지 않음)  ← 기본 회사로 자동 할당
# 4. "가입하기" 클릭
# 5. 성공 메시지 확인
# 6. 로그인 페이지로 자동 이동
```

### 2. 비밀번호 초기화 테스트 (관리자)

```bash
# 1. admin 계정으로 로그인
# 2. 사용자 관리 메뉴 클릭
# 3. 비밀번호를 초기화할 사용자 선택
# 4. "비밀번호 재설정" 버튼 클릭
# 5. 새 비밀번호 입력:
#    - 새 비밀번호: newpass123
#    - 비밀번호 확인: newpass123
# 6. "재설정" 클릭
# 7. 성공 메시지 확인
# 8. 사용자 목록으로 자동 이동
```

### 3. 사용자 비밀번호 변경 테스트

```bash
# 1. 초기화된 비밀번호로 로그인
# 2. 헤더 → 사용자 아바타 클릭
# 3. "비밀번호 변경" 클릭
# 4. 새 비밀번호 입력:
#    - 새 비밀번호: mypassword123
#    - 새 비밀번호 확인: mypassword123
# 5. "비밀번호 변경" 클릭
# 6. 성공 메시지 확인
# 7. 로그인 페이지로 자동 이동
# 8. 새 비밀번호로 재로그인
```

---

## 🔒 보안 개선 사항

### 1. autocomplete 속성 추가

**문제**: 브라우저 콘솔 경고
```
[DOM] Input elements should have autocomplete attributes
```

**해결**:
```tsx
// 로그인
<TextField type="email" autoComplete="email" />
<TextField type="password" autoComplete="current-password" />

// 회원가입 / 비밀번호 변경
<TextField type="email" autoComplete="email" />
<TextField type="password" autoComplete="new-password" />
```

**효과**:
- ✅ 브라우저 자동완성 기능 정상 작동
- ✅ 비밀번호 관리자 통합
- ✅ 보안 경고 제거

### 2. 비밀번호 관리 정책 강화

**이전**:
- 사용자가 직접 임시 비밀번호 발급
- 보안 위험 (이메일 없이 화면에 표시)

**현재**:
- 관리자만 비밀번호 초기화 가능
- 관리자가 안전한 방법으로 전달
- 사용자 본인 확인 절차 강화

---

## 📝 사용자 가이드

### 비밀번호를 잊었을 때

1. **로그인 페이지 확인**
   ```
   비밀번호를 잊으셨나요? 관리자에게 문의하세요.
   ```

2. **관리자에게 연락**
   - 이메일: admin@aris.com
   - 전화: 내선번호
   - 메신저: 사내 메신저

3. **본인 확인**
   - 이름
   - 이메일
   - 사번
   - 부서

4. **새 비밀번호 수령**
   - 관리자가 비밀번호 초기화
   - 새 비밀번호 전달 (이메일, 메신저 등)

5. **로그인 및 비밀번호 변경**
   - 새 비밀번호로 로그인
   - 헤더 → "비밀번호 변경"
   - 본인만 아는 비밀번호로 변경

---

## 🎯 향후 개선 사항

### 1. 이메일 발송 기능

관리자가 비밀번호를 초기화하면 자동으로 이메일 발송:
```
제목: [ARIS] 비밀번호가 초기화되었습니다

안녕하세요, {사용자명}님

관리자가 귀하의 비밀번호를 초기화했습니다.
새 비밀번호: {새_비밀번호}

보안을 위해 로그인 후 즉시 비밀번호를 변경해주세요.

감사합니다.
ARIS 시스템
```

### 2. 비밀번호 변경 강제

비밀번호 초기화 시 `passwordChangeRequired = true` 설정:
```java
public void resetPassword(Long userId, String newPassword) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    
    user.changePassword(passwordEncoder.encode(newPassword));
    user.requirePasswordChange();  // 비밀번호 변경 강제
    userRepository.save(user);
}
```

로그인 시 체크:
```typescript
if (response.user.passwordChangeRequired) {
  navigate('/change-password');
}
```

### 3. 비밀번호 초기화 이력

```java
@Entity
public class PasswordResetHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private User user;
    
    @ManyToOne
    private User resetBy;  // 초기화한 관리자
    
    private LocalDateTime resetAt;
    
    private String reason;  // 초기화 사유
}
```

---

## ✅ 완료!

모든 비밀번호 관리 기능이 개선되었습니다!

**변경 사항**:
- ✅ 비밀번호 찾기 기능 제거
- ✅ 관리자 비밀번호 초기화 기능 유지
- ✅ 회원가입 개선 (회사 선택 optional)
- ✅ autocomplete 속성 추가 (보안 경고 해결)
- ✅ 로그인 페이지 개선

**수정 날짜**: 2025-10-18
**관련 기능**: 사용자 관리, 비밀번호 관리, 보안



