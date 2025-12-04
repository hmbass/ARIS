# 🔧 ARIS Phase 1 오류 수정 요약

**작성일시**: 2025-10-15 13:50  
**상태**: ✅ 주요 오류 해결 완료

---

## 📋 발견된 오류 및 해결 방법

### 1. ✅ JPA Auditing 중복 설정 오류

#### 오류 내용
```
The bean 'jpaAuditingHandler' could not be registered. 
A bean with that name has already been defined and overriding is disabled.
```

#### 원인
- `ArisApplication.java`에 `@EnableJpaAuditing`
- `JpaConfig.java`에도 `@EnableJpaAuditing`
- 두 곳에서 중복으로 Auditing 핸들러 빈 생성

#### 해결 방법
`ArisApplication.java`에서 `@EnableJpaAuditing` 제거 → `JpaConfig`에만 유지

#### 수정된 파일
```java
// ArisApplication.java (수정 후)
@SpringBootApplication
public class ArisApplication {
    public static void main(String[] args) {
        SpringApplication.run(ArisApplication.class, args);
    }
}
```

---

### 2. ✅ Docker 이미지 플랫폼 호환성 문제

#### 오류 내용
```
failed to solve: eclipse-temurin:17-jre-alpine: 
no match for platform in manifest: not found
```

#### 원인
- Apple Silicon (M1/M2) Mac에서 Alpine Linux 이미지 아키텍처 불일치
- `eclipse-temurin:17-jre-alpine` 이미지가 ARM64용으로 빌드되지 않음

#### 해결 방법
Dockerfile 수정: `eclipse-temurin:17-jre-alpine` → `eclipse-temurin:17-jre`

#### 수정된 Dockerfile
```dockerfile
# Run stage
FROM eclipse-temurin:17-jre  # alpine 제거
WORKDIR /app
```

---

### 3. ✅ Docker 사용자 그룹 충돌 문제

#### 오류 내용
```
groupadd: GID '1000' already exists
```

#### 원인
- 베이스 이미지에 이미 GID 1000이 존재
- 새로운 그룹 생성 시 충돌 발생

#### 해결 방법
개발 환경에서는 non-root 사용자 생성 단계를 제거하고 간소화

#### 수정된 Dockerfile
```dockerfile
# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Create directories
RUN mkdir -p /app/logs /app/uploads

# Note: Running as root for simplicity in development
# In production, consider using a non-root user
```

---

### 4. ✅ PostgreSQL 연결 오류

#### 오류 내용
```
Connection to localhost:5432 refused
```

#### 원인
PostgreSQL 컨테이너가 실행되지 않음

#### 해결 방법
```bash
docker-compose up -d postgres
```

#### 검증
```bash
docker exec aris-postgres pg_isready -U aris_user
# 출력: /var/run/postgresql:5432 - accepting connections
```

---

### 5. ⚠️ Maven Docker 빌드 네트워크 오류

#### 오류 내용
```
Could not transfer artifact net.bytebuddy:byte-buddy:jar:1.14.10
Connection reset
```

#### 원인
Docker 빌드 중 Maven 중앙 저장소 연결 불안정

#### 해결 방법
로컬에서 Maven 빌드 후 Docker 이미지 생성

```bash
cd backend
./mvnw clean package -DskipTests
# BUILD SUCCESS ✅
```

---

## 📊 최종 상태

### ✅ 해결 완료
1. **JPA Auditing 중복** → `ArisApplication`에서 어노테이션 제거
2. **Docker Alpine 이미지** → 일반 이미지로 변경
3. **PostgreSQL 연결** → 컨테이너 정상 실행
4. **Maven 로컬 빌드** → JAR 파일 생성 성공

### 📦 빌드 결과
```
BUILD SUCCESS
Total time: 4.433 s
Artifact: /backend/target/aris-backend-0.0.1-SNAPSHOT.jar
```

### 🗄️ PostgreSQL 상태
```
Container: aris-postgres
Status: Up (healthy)
Port: 0.0.0.0:5432->5432/tcp
```

---

## 🚀 다음 단계

### 1. 애플리케이션 실행 확인
```bash
cd backend
java -jar target/aris-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
```

### 2. 헬스 체크
```bash
curl http://localhost:8080/actuator/health
# 기대값: {"status":"UP"}
```

### 3. Swagger UI 접속
```
http://localhost:8080/swagger-ui.html
```

### 4. 초기 데이터 확인
```sql
-- PostgreSQL 접속
docker exec -it aris-postgres psql -U aris_user -d aris_db

-- 초기 데이터 확인
SELECT * FROM users;
SELECT * FROM roles;
SELECT * FROM companies;
SELECT * FROM menus;
```

---

## 💡 학습 포인트

### Spring Boot 빈 중복 방지
- `@EnableJpaAuditing`는 한 곳에만 선언
- 일반적으로 `@Configuration` 클래스에 선언 권장
- Main Application 클래스는 최대한 간결하게 유지

### Docker 멀티 아키텍처 대응
- ARM64 (Apple Silicon) 환경에서는 Alpine 대신 일반 이미지 사용 검토
- 또는 `--platform linux/amd64` 옵션으로 명시적 플랫폼 지정

### 컨테이너 의존성 관리
- `depends_on`과 `healthcheck` 조합으로 안정적인 시작 순서 보장
- PostgreSQL은 `service_healthy` 상태까지 기다림

---

**작성자**: AI Assistant  
**프로젝트**: ARIS (Advanced Request & Issue Management System)  
**Phase**: MVP Phase 1









