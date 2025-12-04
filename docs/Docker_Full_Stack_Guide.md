# Docker Full Stack 실행 가이드

## 📋 개요

ARIS 프로젝트의 전체 스택(PostgreSQL + Backend + Frontend)을 Docker Compose로 실행하는 가이드입니다.

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Network                        │
│                        (aris-network)                        │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │              │    │              │    │              │  │
│  │  PostgreSQL  │◄───│   Backend    │◄───│   Frontend   │  │
│  │   :5432      │    │   :8080      │    │   :80        │  │
│  │              │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         ▲                      ▲                      ▲
         │                      │                      │
    localhost:5432         localhost:8080         localhost:3000
```

---

## 🚀 빠른 시작

### 1. 전체 스택 실행

```bash
# 프로젝트 루트에서 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 2. 접속 정보

| 서비스 | URL | 설명 |
|--------|-----|------|
| **Frontend** | http://localhost:3000 | React 기반 UI |
| **Backend API** | http://localhost:8080/swagger-ui.html | Swagger API 문서 |
| **PostgreSQL** | localhost:5432 | 데이터베이스 |

### 3. 로그인 정보

- **이메일**: `admin@aris.com`
- **비밀번호**: `admin1234`

---

## 📦 서비스별 설정

### PostgreSQL

```yaml
postgres:
  image: postgres:15-alpine
  ports:
    - "5432:5432"
  environment:
    POSTGRES_DB: aris_db
    POSTGRES_USER: aris_user
    POSTGRES_PASSWORD: aris_password
```

**접속 정보:**
- Host: `localhost`
- Port: `5432`
- Database: `aris_db`
- Username: `aris_user`
- Password: `aris_password`

### Backend (Spring Boot)

```yaml
backend:
  build: ./backend
  ports:
    - "8080:8080"
  environment:
    SPRING_PROFILES_ACTIVE: dev
    SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/aris_db
```

**주요 엔드포인트:**
- Swagger UI: http://localhost:8080/swagger-ui.html
- API Docs: http://localhost:8080/v3/api-docs
- Health Check: http://localhost:8080/actuator/health

### Frontend (React + Vite + Nginx)

```yaml
frontend:
  build: ./frontend
  ports:
    - "3000:80"
  environment:
    VITE_API_BASE_URL: http://localhost:8080/api
```

**빌드 과정:**
1. Node.js 18로 React 앱 빌드
2. Nginx Alpine에 정적 파일 배포
3. API 요청은 Nginx에서 Backend로 프록시

---

## 🔧 개발 명령어

### 전체 스택 관리

```bash
# 전체 시작 (빌드 포함)
docker-compose up -d --build

# 전체 중지
docker-compose down

# 전체 중지 + 볼륨 삭제 (DB 초기화)
docker-compose down -v

# 로그 실시간 확인
docker-compose logs -f

# 특정 서비스 로그 확인
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 개별 서비스 관리

```bash
# Backend만 재시작
docker-compose restart backend

# Frontend만 재빌드 및 재시작
docker-compose up -d --build frontend

# PostgreSQL만 중지
docker-compose stop postgres
```

### 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker-compose ps

# 상세 정보 확인
docker-compose ps -a

# 리소스 사용량 확인
docker stats
```

---

## 🔍 트러블슈팅

### 1. PostgreSQL 연결 실패

**증상:**
```
backend  | Could not connect to database
```

**해결 방법:**
```bash
# PostgreSQL 헬스체크 확인
docker-compose ps postgres

# PostgreSQL 로그 확인
docker-compose logs postgres

# PostgreSQL 컨테이너 재시작
docker-compose restart postgres
```

### 2. Backend 빌드 실패

**증상:**
```
backend  | BUILD FAILURE
```

**해결 방법:**
```bash
# 캐시 없이 재빌드
docker-compose build --no-cache backend

# 또는 로컬에서 먼저 빌드 테스트
cd backend
./mvnw clean package -DskipTests
```

### 3. Frontend 빌드 실패

**증상:**
```
frontend | npm ERR! code 1
```

**해결 방법:**
```bash
# 캐시 없이 재빌드
docker-compose build --no-cache frontend

# 또는 로컬에서 먼저 빌드 테스트
cd frontend
npm install
npm run build
```

### 4. 포트 충돌

**증상:**
```
Error: bind: address already in use
```

**해결 방법:**
```bash
# 사용 중인 포트 확인
lsof -i :3000  # Frontend
lsof -i :8080  # Backend
lsof -i :5432  # PostgreSQL

# 프로세스 종료
kill -9 <PID>

# 또는 docker-compose.yml에서 포트 변경
ports:
  - "3001:80"  # Frontend를 3001로 변경
```

### 5. Flyway Migration 오류

**증상:**
```
FlywayValidateException: Detected resolved migration not applied to database
```

**해결 방법:**
```bash
# 데이터베이스 완전 초기화
docker-compose down -v --remove-orphans
docker-compose up -d
```

### 6. Frontend에서 API 호출 실패

**증상:**
- CORS 에러
- Network Error

**해결 방법:**

1. **Backend가 먼저 완전히 실행되었는지 확인:**
```bash
docker-compose logs backend | grep "Started ArisApplication"
```

2. **Backend 헬스체크:**
```bash
curl http://localhost:8080/actuator/health
```

3. **Nginx 프록시 설정 확인:**
```bash
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

---

## 🧹 완전 초기화

모든 것을 처음부터 다시 시작하려면:

```bash
# 1. 모든 컨테이너 중지 및 삭제
docker-compose down -v --remove-orphans

# 2. Docker 이미지 삭제
docker rmi aris-backend aris-frontend

# 3. Docker 빌드 캐시 삭제
docker builder prune -a

# 4. 다시 시작
docker-compose up -d --build
```

---

## 📊 성능 최적화

### 빌드 시간 단축

1. **Docker 레이어 캐싱 활용:**
   - `package.json`과 `pom.xml`을 먼저 복사하여 의존성 캐싱

2. **멀티스테이지 빌드:**
   - 빌드 단계와 런타임 단계 분리
   - Frontend: Node.js (빌드) → Nginx (런타임)
   - Backend: Maven (빌드) → JRE (런타임)

### 리소스 제한

```yaml
# docker-compose.yml에 추가
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          memory: 1G
```

---

## 🔐 보안 고려사항

### 1. 환경변수 관리

**개발 환경:**
```bash
# .env 파일 생성 (gitignore에 추가됨)
cp .env.example .env
```

**프로덕션 환경:**
- AWS Secrets Manager
- Kubernetes Secrets
- HashiCorp Vault

### 2. 기본 비밀번호 변경

```yaml
# docker-compose.yml 또는 .env
POSTGRES_PASSWORD: <강력한_비밀번호>
JWT_SECRET: <256비트_이상의_랜덤_문자열>
```

### 3. 네트워크 분리

```yaml
networks:
  frontend-network:
  backend-network:
  database-network:

services:
  frontend:
    networks:
      - frontend-network
  backend:
    networks:
      - frontend-network
      - backend-network
  postgres:
    networks:
      - backend-network
```

---

## 📈 모니터링

### 로그 수집

```bash
# 모든 로그를 파일로 저장
docker-compose logs > logs/all-services.log

# 특정 시간 이후 로그만 확인
docker-compose logs --since 30m

# 실시간 로그 with timestamp
docker-compose logs -f -t
```

### 헬스 체크

```bash
# Backend
curl http://localhost:8080/actuator/health

# Frontend
curl http://localhost:3000

# PostgreSQL
docker-compose exec postgres pg_isready -U aris_user
```

---

## 🎯 다음 단계

1. **로컬 개발**: [Quick_Start_Guide.md](./Quick_Start_Guide.md)
2. **Frontend 개발**: [Frontend_Development_Guide.md](./Frontend_Development_Guide.md)
3. **API 테스트**: [Phase3_Testing_Guide.md](./Phase3_Testing_Guide.md)
4. **배포**: (추후 작성 예정)

---

## 📚 참고 자료

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [React Docker Deployment](https://create-react-app.dev/docs/deployment/#docker)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

**Last Updated**: 2025-10-16  
**Version**: 1.0.0







