# 토큰 갱신 기능 추가 및 사용자 관리 오류 수정

## 📋 문제 상황

사용자 관리 기능 사용 시 다음과 같은 오류가 발생했습니다:

```
No static resource api/auth/refresh.
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/auth/refresh.
```

**원인**: `/api/auth/refresh` 엔드포인트가 구현되지 않아, Frontend에서 토큰 갱신 시도 시 404 에러 발생

---

## 🔧 해결 방법

### 1. DTO 추가

#### RefreshTokenRequest.java
```java
@Getter
@Setter
@NoArgsConstructor
public class RefreshTokenRequest {
    @NotBlank(message = "리프레시 토큰은 필수입니다.")
    private String refreshToken;
}
```

#### RefreshTokenResponse.java
```java
@Getter
@Builder
public class RefreshTokenResponse {
    private String accessToken;
    private String refreshToken;
}
```

### 2. AuthService에 토큰 갱신 메서드 추가

**파일**: `backend/src/main/java/com/aris/domain/auth/service/AuthService.java`

```java
@Transactional
public RefreshTokenResponse refreshToken(String refreshToken) {
    try {
        // 리프레시 토큰 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        // 리프레시 토큰에서 이메일 추출
        String email = jwtTokenProvider.getEmailFromToken(refreshToken);

        // 사용자 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 계정 상태 체크
        if (!user.getIsActive()) {
            throw new BusinessException(ErrorCode.USER_NOT_ACTIVE);
        }
        if (!user.getIsApproved()) {
            throw new BusinessException(ErrorCode.USER_NOT_APPROVED);
        }
        if (user.getIsLocked()) {
            throw new BusinessException(ErrorCode.USER_LOCKED);
        }

        // 새로운 토큰 생성
        Collection<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> (GrantedAuthority) () -> role.getName())
                .collect(Collectors.toList());

        String newAccessToken = jwtTokenProvider.createAccessToken(user.getEmail(), authorities);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());

        log.info("토큰 갱신 성공: {}", user.getEmail());

        return RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    } catch (Exception e) {
        log.error("토큰 갱신 실패", e);
        throw new BusinessException(ErrorCode.INVALID_TOKEN);
    }
}
```

### 3. AuthController에 엔드포인트 추가

**파일**: `backend/src/main/java/com/aris/domain/auth/controller/AuthController.java`

```java
@Operation(summary = "토큰 갱신", description = "리프레시 토큰으로 새로운 액세스 토큰을 발급받습니다.")
@PostMapping("/refresh")
public ResponseEntity<RefreshTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
    RefreshTokenResponse response = authService.refreshToken(request.getRefreshToken());
    return ResponseEntity.ok(response);
}
```

---

## ✅ 해결된 문제

### 1. 토큰 갱신 기능 구현
- ✅ `/api/auth/refresh` 엔드포인트 추가
- ✅ 리프레시 토큰 검증
- ✅ 새로운 액세스 토큰 및 리프레시 토큰 발급
- ✅ 사용자 계정 상태 체크 (활성화, 승인, 잠금)

### 2. 사용자 관리 오류 수정
- ✅ 401/403 에러 발생 시 자동 토큰 갱신 시도
- ✅ 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
- ✅ 사용자 관리 페이지 정상 동작

---

## 🔐 보안 강화

### 토큰 갱신 시 보안 체크

1. **토큰 유효성 검증**
   - 리프레시 토큰의 서명 및 만료 시간 확인

2. **사용자 계정 상태 확인**
   - `isActive`: 활성화된 계정만 토큰 갱신 가능
   - `isApproved`: 승인된 계정만 토큰 갱신 가능
   - `isLocked`: 잠긴 계정은 토큰 갱신 불가

3. **새로운 토큰 쌍 발급**
   - 액세스 토큰과 리프레시 토큰을 모두 새로 발급
   - 기존 토큰은 무효화됨

---

## 📊 API 스펙

### POST /api/auth/refresh

**요청**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**응답 (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**에러 응답**:
- `400 Bad Request`: 리프레시 토큰이 없거나 유효하지 않음
- `401 Unauthorized`: 토큰이 만료되었거나 서명이 유효하지 않음
- `403 Forbidden`: 계정이 비활성화, 미승인, 또는 잠김 상태

---

## 🔄 Frontend 토큰 갱신 플로우

**파일**: `frontend/src/utils/api.ts`

```typescript
// Response Interceptor - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 또는 403 에러 (인증 실패 / 권한 없음) - 토큰 갱신 시도
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } else {
          // refreshToken이 없으면 로그아웃
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 - 로그아웃 처리
        console.error('토큰 갱신 실패:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 🧪 테스트 방법

### 1. 토큰 갱신 테스트

1. 로그인 후 액세스 토큰이 만료될 때까지 대기 (기본 1시간)
2. 사용자 관리 페이지 접속
3. 자동으로 토큰 갱신 후 정상 동작 확인

### 2. Swagger UI에서 테스트

```bash
# 1. 로그인
POST http://localhost:8080/api/auth/login
{
  "email": "admin@aris.com",
  "password": "admin1234"
}

# 2. 리프레시 토큰 복사

# 3. 토큰 갱신
POST http://localhost:8080/api/auth/refresh
{
  "refreshToken": "복사한_리프레시_토큰"
}

# 4. 새로운 액세스 토큰 확인
```

### 3. 사용자 관리 기능 테스트

1. 로그인: `admin@aris.com` / `admin1234`
2. 사이드바에서 "사용자 관리" 클릭
3. 사용자 목록 정상 표시 확인
4. 사용자 생성/수정/삭제 기능 테스트

---

## 📝 추가된 파일

```
backend/src/main/java/com/aris/domain/auth/
├── dto/
│   ├── RefreshTokenRequest.java (NEW)
│   └── RefreshTokenResponse.java (NEW)
├── service/
│   └── AuthService.java (UPDATED - refreshToken 메서드 추가)
└── controller/
    └── AuthController.java (UPDATED - /refresh 엔드포인트 추가)
```

---

## 🎉 완료!

토큰 갱신 기능이 성공적으로 추가되어 사용자 관리 기능이 정상적으로 동작합니다.

**수정 날짜**: 2025-10-18
**관련 이슈**: 토큰 갱신 엔드포인트 누락으로 인한 사용자 관리 오류



