# 🔧 403 Forbidden 에러 해결 가이드

**증상**: 프로젝트 등록 API 호출 시 403 Forbidden 에러 발생

---

## 🐛 에러 상황

```
Error: response status is 403

Response headers:
- x-frame-options: DENY
- x-xss-protection: 0

Backend Log:
"유효한 JWT 토큰이 없습니다."
"Pre-authenticated entry point called. Rejecting access"
```

---

## 🔍 원인

**JWT 토큰이 요청에 포함되지 않았거나 잘못 설정됨**

Spring Security가 인증되지 않은 요청을 차단하고 있습니다.

---

## ✅ 해결 방법 (Swagger UI)

### Step 1: 로그인하여 JWT 토큰 획득

1. **Swagger UI 접속**: http://localhost:8080/swagger-ui.html

2. **Auth Controller** 섹션을 찾아서 펼치기

3. **POST /api/auth/login** 클릭

4. **Try it out** 버튼 클릭 (중요!)

5. Request Body에 다음 내용 **정확히** 복사해서 붙여넣기:
   ```json
   {
     "email": "admin@aris.com",
     "password": "admin1234"
   }
   ```

6. **Execute** 버튼 클릭

7. Response에서 `accessToken` 값을 **전체 복사** (매우 긴 문자열)
   ```
   eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1....(매우 길다)
   ```

### Step 2: Swagger UI에 JWT 토큰 설정

1. Swagger UI **맨 위**를 보면 **[Authorize]** 또는 **🔒** 버튼이 있습니다

2. 이 버튼을 클릭

3. 팝업 창이 뜨면 **Value** 입력란에 다음 형식으로 입력:
   ```
   Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1...
   ```
   
   **⚠️ 중요 사항**:
   - `Bearer ` (B는 대문자, 뒤에 공백 한 칸 필수!)
   - 그 다음 복사한 토큰 전체를 붙여넣기
   - 따옴표 없이, 토큰만 깔끔하게

4. **[Authorize]** 버튼 클릭 (팝업 내)

5. 성공하면 자물쇠 아이콘이 잠긴 상태로 바뀝니다

6. **[Close]** 버튼으로 팝업 닫기

### Step 3: API 재시도

이제 다시 **POST /api/projects** API를 시도하면 정상 작동합니다!

---

## 🎯 올바른 예시

### ✅ 올바른 토큰 설정
```
Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBhcmlzLmNvbSIsInJvbGVzIjoiUk9MRV9BRE1JTiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjA1MDg0NTAsImV4cCI6MTc2MDUxMjA1MH0.UQ1Cm8dAz0nJyM_20wmJ00-K6QBR4zXf6-HkkYPh9TA
```

### ❌ 잘못된 설정 예시

```
# 1. Bearer 키워드 없음
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOi...

# 2. Bearer 뒤에 공백 없음
BearereyJhbGciOiJIUzI1NiJ9.eyJzdWIiOi...

# 3. 따옴표 포함
"Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOi..."

# 4. bearer 소문자
bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOi...
```

---

## 🔄 토큰 만료 시

JWT 토큰은 **1시간(3600초)** 후에 만료됩니다.

### 증상
- 이전에는 되던 API가 갑자기 403 에러 발생
- 로그: "만료된 JWT 토큰입니다"

### 해결
1. 다시 **POST /api/auth/login** 실행
2. 새로운 `accessToken` 획득
3. **[Authorize]** 버튼으로 새 토큰 설정
4. API 재시도

---

## 🧪 테스트 - 토큰 설정 확인

### 방법 1: 간단한 GET API로 확인

**GET /api/users** (사용자 목록 조회)
- 토큰이 올바르게 설정되었으면: **200 OK**
- 토큰이 없거나 잘못됨: **403 Forbidden**

### 방법 2: cURL로 직접 확인

```bash
# 1. 로그인
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aris.com","password":"admin1234"}' \
  | grep -o '"accessToken":"[^"]*"' \
  | cut -d'"' -f4)

# 2. 토큰 확인
echo "Token: $TOKEN"

# 3. 프로젝트 등록 테스트
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST001",
    "name": "테스트 프로젝트",
    "projectType": "SI",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "companyId": 1
  }'
```

---

## 📋 체크리스트

### 로그인 전
- [ ] Swagger UI가 정상적으로 열림
- [ ] Auth Controller 섹션이 보임
- [ ] POST /api/auth/login API가 보임

### 로그인 시
- [ ] **Try it out** 버튼을 클릭함
- [ ] Request Body를 정확히 입력함
- [ ] **Execute** 버튼을 클릭함
- [ ] Response가 200 OK임
- [ ] `accessToken` 값이 Response에 있음
- [ ] 토큰 전체를 복사함 (매우 긴 문자열)

### Authorize 설정 시
- [ ] Swagger UI 상단의 **[Authorize]** 버튼을 찾음
- [ ] 버튼을 클릭함
- [ ] Value 입력란에 `Bearer ` + 토큰 입력
- [ ] Bearer 뒤에 공백이 있음
- [ ] 따옴표가 없음
- [ ] **[Authorize]** 버튼 (팝업 내)을 클릭함
- [ ] 자물쇠 아이콘이 잠긴 상태로 변함
- [ ] **[Close]**로 팝업을 닫음

### API 호출 시
- [ ] Try it out 버튼을 클릭함
- [ ] Request Body를 입력함
- [ ] Execute 버튼을 클릭함
- [ ] Response가 **201 Created** 또는 **200 OK**임

---

## 🎬 화면 캡처 가이드 (참고용)

### 1. Authorize 버튼 위치
```
┌─────────────────────────────────────────────┐
│ 🔒 Authorize  ← 여기를 클릭!                 │
│                                             │
│ ARIS API Documentation                      │
│                                             │
│ ▼ Auth Controller                           │
│ ▼ Project Controller                        │
└─────────────────────────────────────────────┘
```

### 2. Authorize 팝업
```
┌─────────────────────────────────────────────┐
│ Available authorizations                    │
│                                             │
│ bearerAuth (http, Bearer)                   │
│                                             │
│ Value:                                      │
│ ┌─────────────────────────────────────────┐ │
│ │ Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIi... │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Authorize]  [Close]  ← Authorize 클릭!     │
└─────────────────────────────────────────────┘
```

### 3. 인증 성공 후
```
┌─────────────────────────────────────────────┐
│ 🔒 Authorize (인증됨) ✓                     │
│                                             │
│ ARIS API Documentation                      │
└─────────────────────────────────────────────┘
```

---

## 🚨 여전히 403 에러가 나는 경우

### 1. 브라우저 캐시 문제
```
해결: Ctrl+F5 (강력 새로고침) 또는 시크릿 모드
```

### 2. 토큰이 정말 설정되었는지 재확인
```
1. [Authorize] 버튼을 다시 클릭
2. Value 입력란에 토큰이 보이는지 확인
3. 없으면 다시 로그인하여 토큰 획득 후 설정
```

### 3. 토큰 만료
```
로그인한지 1시간 이상 지났으면 토큰 만료
→ 다시 로그인하여 새 토큰 획득
```

### 4. 백엔드 재시작
```bash
docker restart aris-backend
# 그 다음 다시 로그인
```

---

## ✅ 성공 예시

### Request
```
POST /api/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "code": "PRJ2025001",
  "name": "고객관리시스템 구축",
  "projectType": "SI",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "companyId": 1
}
```

### Response: 201 Created
```json
{
  "id": 1,
  "code": "PRJ2025001",
  "name": "고객관리시스템 구축",
  "projectType": "SI",
  "status": "PREPARING",
  "companyName": "ARIS 본사",
  ...
}
```

---

## 🎉 문제 해결 완료!

이제 모든 API를 자유롭게 테스트할 수 있습니다!

**핵심 포인트**:
1. 로그인으로 JWT 토큰 획득
2. **[Authorize]** 버튼으로 `Bearer {토큰}` 설정
3. 이후 모든 API 호출에 자동으로 토큰 포함됨

---

**작성자**: AI Assistant  
**문서 버전**: 1.0.0









