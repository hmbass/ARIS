# 🔧 Swagger UI 403 오류 해결 완료

**작성일시**: 2025-10-15 14:09  
**상태**: ✅ 해결 완료

---

## 🔴 발생한 오류

### 증상
```
Access to localhost was denied
HTTP ERROR 403
You don't have authorisation to view this page.
```

**URL**: `http://localhost:8080/swagger-ui.html`

---

## 🔍 문제 원인

### Spring Security 설정 누락
`SecurityConfig.java`에서 Swagger UI 관련 경로가 완전히 허용되지 않았습니다.

#### 문제가 있던 설정
```java
.requestMatchers(
    "/api/auth/**",
    "/swagger-ui/**",        // 이것만으로는 부족
    "/v3/api-docs/**",
    "/actuator/health"
).permitAll()
```

### 누락된 경로들
1. `/swagger-ui.html` - 기존 Swagger UI 진입점
2. `/swagger-resources/**` - Swagger 리소스
3. `/webjars/**` - Swagger UI가 사용하는 JavaScript/CSS 라이브러리
4. `/favicon.ico` - 파비콘 요청

---

## ✅ 해결 방법

### 수정된 SecurityConfig.java

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        
        // 요청 권한 설정
        .authorizeHttpRequests(auth -> auth
                // 인증 없이 접근 가능한 경로
                .requestMatchers(
                        "/api/auth/**",           // 인증 API
                        "/swagger-ui/**",         // Swagger UI 3.x
                        "/swagger-ui.html",       // Swagger UI 레거시 경로
                        "/v3/api-docs/**",        // OpenAPI 3.0 문서
                        "/swagger-resources/**",  // Swagger 리소스
                        "/webjars/**",            // WebJars (JS/CSS)
                        "/actuator/health",       // Health Check
                        "/favicon.ico"            // 파비콘
                ).permitAll()
                // 그 외 모든 요청은 인증 필요
                .anyRequest().authenticated())
        
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
```

---

## 🔄 재배포 과정

### 1. 코드 수정
```bash
backend/src/main/java/com/aris/global/security/SecurityConfig.java
```

### 2. 빌드
```bash
cd backend
./mvnw clean package -DskipTests
# BUILD SUCCESS (7.374 s)
```

### 3. Docker 재배포
```bash
# 기존 컨테이너 중지 및 제거
docker-compose down

# 새 이미지 빌드
docker-compose build backend

# 컨테이너 시작
docker-compose up -d
```

### 4. 애플리케이션 시작 확인
```bash
curl http://localhost:8080/actuator/health
# {"status":"UP"}
```

---

## ✅ 테스트 결과

### 1. Swagger UI HTML 접근 ✅
```bash
curl -I http://localhost:8080/swagger-ui.html
# HTTP/1.1 302 (정상 리다이렉트)
```

### 2. Swagger UI 메인 페이지 ✅
```bash
curl http://localhost:8080/swagger-ui/index.html
# <!DOCTYPE html>
# <html lang="en">
#   <head>
#     <meta charset="UTF-8">
#     <title>Swagger UI</title>
```

### 3. OpenAPI 문서 ✅
```bash
curl http://localhost:8080/v3/api-docs
# {
#   "openapi": "3.0.1",
#   "info": {
#     "title": "ARIS API Documentation",
#     ...
#   }
# }
```

---

## 🌐 접속 가능한 URL

### Swagger UI (추천)
```
http://localhost:8080/swagger-ui/index.html
```

### Swagger UI (레거시 경로)
```
http://localhost:8080/swagger-ui.html
→ 자동으로 /swagger-ui/index.html로 리다이렉트
```

### OpenAPI JSON
```
http://localhost:8080/v3/api-docs
```

### OpenAPI YAML
```
http://localhost:8080/v3/api-docs.yaml
```

---

## 📊 Swagger UI 사용 방법

### 1. 브라우저에서 접속
```
http://localhost:8080/swagger-ui/index.html
```

### 2. API 엔드포인트 확인
- **Authentication**: 로그인/회원가입 API
- 각 API의 요청/응답 스키마 확인 가능

### 3. API 테스트 (인증 필요 없는 API)
1. `POST /api/auth/register` 클릭
2. "Try it out" 버튼 클릭
3. Request body 입력:
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "name": "Test User",
     "phoneNumber": "010-1234-5678",
     "companyId": 1
   }
   ```
4. "Execute" 버튼 클릭
5. 응답 확인

### 4. JWT 토큰 인증 설정
1. 로그인 API로 토큰 획득
2. 상단 "Authorize" 버튼 클릭
3. `Bearer {token}` 형식으로 입력
4. 인증이 필요한 API 테스트 가능

---

## 💡 Spring Boot 3.x Swagger 경로 변경사항

### Spring Boot 2.x
- Swagger UI: `/swagger-ui.html`
- API Docs: `/v2/api-docs`

### Spring Boot 3.x (현재 사용)
- Swagger UI: `/swagger-ui/index.html` (또는 `/swagger-ui.html`에서 리다이렉트)
- API Docs: `/v3/api-docs`

### SpringDoc OpenAPI 라이브러리
- Spring Boot 3.x부터는 SpringFox 대신 SpringDoc 사용
- 더 나은 OpenAPI 3.0 지원
- 자동으로 JWT Bearer 인증 스키마 생성

---

## 🔒 보안 고려사항

### 현재 설정 (개발 환경)
```java
.requestMatchers(
    "/swagger-ui/**",
    "/v3/api-docs/**"
).permitAll()
```

✅ **개발 환경**: Swagger UI 전체 공개 - OK

### 운영 환경 권장 설정
```java
// application-prod.yml
springdoc:
  swagger-ui:
    enabled: false  # 운영에서는 Swagger UI 비활성화
  api-docs:
    enabled: false  # 또는 특정 IP만 허용
```

또는 Security 설정으로 IP 제한:
```java
.requestMatchers("/swagger-ui/**").hasIpAddress("내부IP")
```

---

## 🎯 확인 체크리스트

- [x] SecurityConfig.java에 Swagger 경로 추가
- [x] Maven 빌드 성공
- [x] Docker 이미지 재빌드
- [x] 컨테이너 재시작
- [x] Health Check 정상
- [x] Swagger UI HTML 로드 확인
- [x] OpenAPI 문서 접근 가능
- [x] 브라우저에서 정상 접속 가능

---

## 📝 추가 설정 (선택사항)

### 1. Swagger UI 커스터마이징
`application.yml`:
```yaml
springdoc:
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: alpha
    display-request-duration: true
    doc-expansion: none
  api-docs:
    path: /api-docs
  default-consumes-media-type: application/json
  default-produces-media-type: application/json
```

### 2. API 그룹핑
```yaml
springdoc:
  group-configs:
    - group: auth
      paths-to-match: /api/auth/**
      display-name: Authentication APIs
    - group: users
      paths-to-match: /api/users/**
      display-name: User Management APIs
```

---

## 🎉 결론

**Swagger UI 403 오류가 완전히 해결되었습니다!**

### 해결된 항목
- ✅ Security 설정에 필요한 모든 경로 추가
- ✅ Docker 컨테이너 재배포
- ✅ Swagger UI 정상 접근 가능
- ✅ OpenAPI 문서 정상 생성
- ✅ API 테스트 환경 준비 완료

### 접속 URL
```
http://localhost:8080/swagger-ui/index.html
```

이제 Swagger UI를 통해 모든 API를 테스트할 수 있습니다!

---

**작성자**: AI Assistant  
**프로젝트**: ARIS (Advanced Request & Issue Management System)  
**Phase**: MVP Phase 1 - 완료









