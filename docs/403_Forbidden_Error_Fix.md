# 403 Forbidden 에러 해결

## 📅 작성일
2025-01-16

---

## 🚨 문제 상황

### 에러 로그
```
GET http://localhost:3000/api/srs?page=0&size=1 403 (Forbidden)
GET http://localhost:3000/api/projects?page=0&size=1 403 (Forbidden)

console: 권한이 없습니다.
Failed to fetch dashboard data: {
  timestamp: '2025-10-17T12:36:59.181+00:00',
  status: 403,
  error: 'Forbidden',
  path: '/api/srs'
}
```

### 발생 원인
1. **Backend 재시작**: Backend 서비스가 재시작되면서 기존 JWT 토큰이 무효화됨
2. **토큰 검증 실패**: 브라우저에 저장된 토큰이 더 이상 유효하지 않음
3. **403 처리 누락**: API Interceptor에서 403 에러 시 로그아웃 처리가 되지 않음

---

## 🔍 근본 원인 분석

### Backend 재시작 로그
```bash
$ docker-compose ps backend
NAME         CREATED        STATUS
aris-backend 11 hours ago   Up 3 minutes (healthy)
```

→ Backend가 3분 전에 재시작됨

### 기존 API Interceptor 코드
```typescript
// 401 에러만 처리
if (error.response?.status === 401 && !originalRequest._retry) {
  // 토큰 갱신 시도
}

// 403 에러는 console.error만 출력
if (error.response?.status === 403) {
  console.error('권한이 없습니다.');
}
```

**문제점**:
- 403 에러 발생 시 토큰 갱신이나 로그아웃 처리가 없음
- 사용자가 계속 403 에러를 받으며 UI를 사용할 수 없음
- 수동으로 로그아웃하거나 새로고침해야 함

---

## ✅ 해결 방법

### 1. API Interceptor 개선

**수정 파일**: `frontend/src/utils/api.ts`

#### Before (문제 코드)
```typescript
// 401 에러 (인증 실패) - 토큰 갱신 시도
if (error.response?.status === 401 && !originalRequest._retry) {
  // ... 토큰 갱신 로직
}

// 403 에러 (권한 없음)
if (error.response?.status === 403) {
  console.error('권한이 없습니다.');
}
```

#### After (개선 코드)
```typescript
// 401 또는 403 에러 (인증 실패 / 권한 없음) - 토큰 갱신 시도
if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
  originalRequest._retry = true;

  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      // 토큰 갱신 시도
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
```

### 2. 개선 사항

#### ✅ 403 에러도 토큰 갱신 시도
- 401과 403 모두 인증 관련 에러로 처리
- 토큰 갱신 가능하면 자동으로 재시도

#### ✅ refreshToken 없으면 즉시 로그아웃
- refreshToken이 없는 경우 즉시 로그인 페이지로 이동
- 무한 루프 방지

#### ✅ 토큰 갱신 실패 시 로그아웃
- 토큰 갱신 실패 시 로컬 스토리지 정리
- 로그인 페이지로 리다이렉트

---

## 🎯 동작 흐름

### Case 1: 토큰 갱신 성공
```
1. API 요청 → 403 Forbidden
2. Refresh Token으로 새 Access Token 요청
3. 새 Access Token 발급 성공
4. 원래 API 요청 재시도
5. ✅ 정상 응답
```

### Case 2: Refresh Token도 만료됨
```
1. API 요청 → 403 Forbidden
2. Refresh Token으로 새 Access Token 요청
3. ❌ Refresh Token도 만료 (401/403)
4. 로컬 스토리지 정리
5. 로그인 페이지로 리다이렉트
```

### Case 3: Refresh Token 없음
```
1. API 요청 → 403 Forbidden
2. Refresh Token 확인 → 없음
3. 로컬 스토리지 정리
4. 로그인 페이지로 리다이렉트
```

---

## 🧪 테스트 시나리오

### Scenario 1: Backend 재시작 후 접속
**재현 방법**:
```bash
# Backend 재시작
docker-compose restart backend

# 브라우저에서 페이지 새로고침
```

**예상 결과**:
- ✅ 403 에러 발생
- ✅ Refresh Token으로 자동 갱신 시도
- ✅ 성공 시 데이터 정상 로드
- ✅ 실패 시 로그인 페이지로 이동

### Scenario 2: 토큰 수동 삭제
**재현 방법**:
```javascript
// 브라우저 콘솔에서
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');

// 페이지 새로고침
```

**예상 결과**:
- ✅ 403 에러 발생
- ✅ Refresh Token 없음 감지
- ✅ 즉시 로그인 페이지로 리다이렉트

### Scenario 3: 토큰 만료
**재현 방법**:
- 로그인 후 1시간 이상 대기 (Access Token 만료)
- 또는 7일 이상 대기 (Refresh Token 만료)
- API 호출

**예상 결과**:
- ✅ Access Token 만료 → 자동 갱신
- ✅ Refresh Token도 만료 → 로그인 페이지

---

## 📊 에러 코드 처리 정리

| 에러 코드 | 의미 | 처리 방법 |
|----------|------|----------|
| 401 | 인증 실패 | Refresh Token으로 갱신 시도 → 실패 시 로그아웃 |
| 403 | 권한 없음 | Refresh Token으로 갱신 시도 → 실패 시 로그아웃 |
| 404 | 리소스 없음 | 에러 메시지 표시 |
| 500 | 서버 오류 | 에러 메시지 표시 |

---

## 🔐 보안 고려사항

### 1. 토큰 저장 위치
- ✅ Access Token: localStorage (XSS 위험)
- ✅ Refresh Token: localStorage (XSS 위험)

**개선 방안**:
- HttpOnly Cookie 사용 (XSS 방어)
- Secure Flag 설정 (HTTPS only)

### 2. 토큰 만료 시간
- Access Token: 1시간
- Refresh Token: 7일

**현재 설정**:
```yaml
# backend application.yml
jwt:
  access-token-validity: 3600000    # 1 hour
  refresh-token-validity: 604800000  # 7 days
```

### 3. 재시도 로직
```typescript
if (!originalRequest._retry) {
  originalRequest._retry = true;
  // 한 번만 재시도
}
```

→ 무한 루프 방지

---

## 🎉 개선 효과

### Before (개선 전)
```
❌ Backend 재시작 후 403 에러 반복 발생
❌ 사용자 수동으로 로그아웃 필요
❌ 나쁜 사용자 경험
```

### After (개선 후)
```
✅ 403 에러 시 자동 토큰 갱신
✅ 갱신 실패 시 자동 로그아웃
✅ 사용자 개입 없이 자동 처리
✅ 향상된 사용자 경험
```

---

## 🚀 추가 개선 사항

### 1. 토큰 갱신 로딩 표시
```typescript
// 토큰 갱신 중임을 사용자에게 알림
setIsRefreshing(true);
try {
  // ... 토큰 갱신
} finally {
  setIsRefreshing(false);
}
```

### 2. 토큰 만료 사전 알림
```typescript
// Access Token 만료 5분 전 알림
const tokenExpiry = jwt_decode(accessToken).exp;
const now = Date.now() / 1000;
if (tokenExpiry - now < 300) {
  alert('세션이 곧 만료됩니다. 저장하지 않은 작업을 저장해주세요.');
}
```

### 3. Silent Refresh
```typescript
// 백그라운드에서 주기적으로 토큰 갱신
setInterval(() => {
  refreshAccessToken();
}, 50 * 60 * 1000); // 50분마다
```

---

## 📝 사용자 안내

### 로그인 페이지 메시지
```
세션이 만료되었습니다.
다시 로그인해주세요.
```

### 자동 로그아웃 시
```typescript
window.location.href = '/login?reason=token_expired';

// LoginPage에서
const searchParams = new URLSearchParams(window.location.search);
if (searchParams.get('reason') === 'token_expired') {
  alert('세션이 만료되어 로그아웃되었습니다.');
}
```

---

## 🔄 관련 이슈

### Backend JWT Secret 관리
**문제**: Backend 재시작 시 JWT Secret이 변경되면 모든 토큰 무효화

**해결**:
```yaml
# application-prod.yml
jwt:
  secret: ${JWT_SECRET:your-fixed-secret-key-here}
```

→ 환경 변수로 고정된 Secret 사용

---

## 📚 참고 자료
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Status**: ✅ 완료
**Last Updated**: 2025-01-16
**Tested**: ✅ Backend 재시작 시나리오
**Deployed**: ✅ Docker Container





