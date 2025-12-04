# 🔧 포트 충돌 오류 해결 완료

**작성일시**: 2025-10-15 13:56  
**상태**: ✅ 해결 완료

---

## 🔴 발생한 오류

### 오류 메시지
```
Error response from daemon: Ports are not available: 
exposing port TCP 0.0.0.0:8080 -> 0.0.0.0:0: 
listen tcp 0.0.0.0:8080: bind: address already in use
```

### 원인
- 8080 포트가 이미 다른 프로세스에서 사용 중
- Docker 컨테이너가 해당 포트를 바인딩할 수 없음

---

## 🔍 문제 진단

### 1. 포트 사용 프로세스 확인
```bash
lsof -ti:8080
# 출력: 49264
```

### 2. 프로세스 상세 정보
```bash
ps -p 49264 -o pid,comm,args
# 출력:
#   PID COMM             ARGS
# 49264 /opt/homebrew/Ce /opt/homebrew/Cellar/python@3.13/3.13.3/
#       Frameworks/Python.framework/Versions/3.13/Resources/
#       Python.app/Contents/MacOS/Python -m http.server 8080
```

**발견**: Python의 간단한 HTTP 서버가 8080 포트에서 실행 중

---

## ✅ 해결 방법

### 1. 충돌 프로세스 종료
```bash
kill 49264
```

### 2. 포트 해제 확인
```bash
lsof -ti:8080
# 출력: (없음) → 포트 해제됨
```

### 3. Docker Compose 재시작
```bash
cd /Users/kevinpark/Desktop/Dev/ARIS
docker-compose up -d
```

---

## 📊 최종 결과

### ✅ 컨테이너 상태
```
NAME            IMAGE              COMMAND                SERVICE    STATUS
aris-backend    aris-backend       "java -Djava..."       backend    Up (healthy)
aris-postgres   postgres:15-alpine "docker-entry..."      postgres   Up (healthy)

PORTS
0.0.0.0:8080->8080/tcp  ✅
0.0.0.0:5432->5432/tcp  ✅
```

### ✅ 애플리케이션 헬스 체크
```bash
curl http://localhost:8080/actuator/health
# 응답: {"status":"UP"}
```

### ✅ 시작 로그 확인
```
[main] INFO  HikariPool-1 - Starting...
[main] INFO  HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@b0d3e7
[main] INFO  HikariPool-1 - Start completed.
[main] INFO  Flyway Community Edition 9.22.3 by Redgate
[main] INFO  Database: jdbc:postgresql://postgres:5432/aris_db (PostgreSQL 15.13)
[main] INFO  Started ArisApplication in 6.313 seconds (process running for 6.719)
```

---

## 🎯 확인 완료 항목

- [x] PostgreSQL 컨테이너 정상 실행 (healthy)
- [x] Backend 컨테이너 정상 실행 (healthy)
- [x] 8080 포트 바인딩 성공
- [x] 데이터베이스 연결 성공 (HikariCP)
- [x] Flyway 마이그레이션 실행 완료
- [x] 애플리케이션 시작 완료 (6.3초)
- [x] Health Endpoint 응답 정상
- [x] OpenAPI 문서 생성 완료

---

## 🌐 접속 가능한 엔드포인트

### 1. Health Check
```
http://localhost:8080/actuator/health
```

### 2. Swagger UI
```
http://localhost:8080/swagger-ui.html
```

### 3. OpenAPI JSON
```
http://localhost:8080/v3/api-docs
```

### 4. 인증 API
```
POST http://localhost:8080/api/auth/login
POST http://localhost:8080/api/auth/register
```

---

## 💡 향후 포트 충돌 방지 방법

### 1. 사용 중인 포트 빠르게 확인
```bash
# macOS/Linux
lsof -ti:8080

# 또는
netstat -an | grep 8080
```

### 2. 프로세스 한 번에 종료
```bash
# 8080 포트 사용 프로세스 자동 종료
lsof -ti:8080 | xargs kill -9
```

### 3. Docker Compose에서 다른 포트 사용
`docker-compose.yml` 수정:
```yaml
services:
  backend:
    ports:
      - "8081:8080"  # 호스트:컨테이너
```

### 4. 기존 컨테이너 정리
```bash
# 중지된 컨테이너 모두 제거
docker-compose down

# 재시작
docker-compose up -d
```

---

## 📝 학습 포인트

### Port Binding 이해
- Docker는 호스트의 포트를 컨테이너 내부 포트에 매핑
- 호스트 포트는 중복 사용 불가
- 컨테이너 내부 포트는 독립적

### 포트 충돌 시 체크리스트
1. `lsof -ti:PORT` → 사용 중인 프로세스 ID 확인
2. `ps -p PID` → 프로세스 상세 정보 확인
3. 필요 시 `kill PID` → 프로세스 종료
4. Docker Compose 재시작

### 개발 환경 모범 사례
- 개발용 포트는 일관성 있게 사용 (예: 8080, 3000 등)
- 불필요한 프로세스는 즉시 종료
- Docker Compose로 전체 환경을 관리하여 충돌 최소화

---

**작성자**: AI Assistant  
**프로젝트**: ARIS (Advanced Request & Issue Management System)  
**Phase**: MVP Phase 1









