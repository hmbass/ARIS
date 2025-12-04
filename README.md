# ARIS - Advanced Request & Issue Management System

IT 프로젝트의 SR(Service Request), SPEC, 승인, 장애 등을 통합 관리하는 엔터프라이즈급 관리 시스템

## 🎯 프로젝트 개요

**ARIS**는 IT 프로젝트 관리의 전체 라이프사이클을 지원하는 통합 시스템입니다.

### 주요 기능
- ✅ **사용자 인증/인가** (JWT 기반)
- ✅ **권한 관리** (RBAC)
- ✅ **프로젝트 관리** (Frontend/Backend 완료)
- ✅ **SR(Service Request) 관리** (Frontend/Backend 완료) 🆕
- ✅ **SPEC 관리** (FP/MD)
- ✅ **승인 프로세스** (다단계 승인)
- ✅ **이슈 관리** (Issue Management)
- ✅ **릴리즈 관리** (Release Management)
- ✅ **장애 관리** (Incident Management)
- ✅ **파트너 관리** (Partner Management)
- ✅ **자산 관리** (Asset Management)
- ⏳ **통계 및 분석** (Statistics & Analytics - Backend 준비 중)
- ⏳ **Excel 리포트** (Report Generation - Backend 준비 중)

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| Backend | Spring Boot 3.2.0, Java 17 |
| Database | PostgreSQL 15+ |
| ORM | Spring Data JPA |
| Security | Spring Security, JWT |
| Migration | Flyway |
| Container | Docker, Docker Compose |
| Documentation | Swagger/OpenAPI 3.0 |
| Testing | JUnit 5, Mockito, TestContainers |
| Frontend | React 18, TypeScript, Material-UI 🆕 |
| Report | Apache POI (Excel) 🆕 |

## 🚀 시작하기

### 1. 사전 요구사항

- Java 17 이상
- Maven 3.9 이상
- Docker & Docker Compose

### 2. 로컬 실행 (개발 모드)

#### PostgreSQL 실행
```bash
docker-compose up -d postgres
```

#### Backend 빌드 및 실행
```bash
cd backend
./mvnw clean install -DskipTests
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. Docker로 전체 실행 (권장)

```bash
# 전체 서비스 실행 (PostgreSQL + Backend + Frontend)
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 종료
docker-compose down
```

### 4. 접속 확인

- **Frontend UI**: http://localhost:3000 🆕
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Health Check**: http://localhost:8080/actuator/health

## 📊 기본 계정

초기 데이터가 자동으로 삽입됩니다.

- **이메일**: admin@aris.com
- **비밀번호**: admin1234
- **역할**: ROLE_ADMIN

## 📚 API 문서

Swagger UI를 통해 모든 API를 확인하고 테스트할 수 있습니다.

http://localhost:8080/swagger-ui.html

### 주요 API 엔드포인트

#### 인증 API
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입

#### 사용자 관리 API
- `GET /api/users` - 사용자 목록 조회
- `POST /api/users` - 사용자 등록
- `GET /api/users/{id}` - 사용자 상세 조회
- `PUT /api/users/{id}` - 사용자 수정
- `DELETE /api/users/{id}` - 사용자 삭제

## 🗂 프로젝트 구조

```
ARIS/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/aris/
│   │   │   │   ├── domain/        # 도메인별 패키지
│   │   │   │   │   ├── user/      # 사용자 도메인
│   │   │   │   │   ├── auth/      # 인증/인가
│   │   │   │   │   ├── project/   # 프로젝트
│   │   │   │   │   └── ...
│   │   │   │   └── global/        # 공통 모듈
│   │   │   │       ├── config/    # 설정
│   │   │   │       ├── security/  # 보안
│   │   │   │       ├── exception/ # 예외 처리
│   │   │   │       └── entity/    # BaseEntity
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/migration/  # Flyway
│   │   └── test/
│   ├── pom.xml
│   └── Dockerfile
├── docker-compose.yml
├── docs/                          # 프로젝트 문서
└── README.md
```

## 🧪 테스트

```bash
# 전체 테스트 실행
./mvnw test

# 커버리지 리포트 생성
./mvnw test jacoco:report
```

## 📖 주요 문서

### 계획 및 설계
- [MVP 3단계 개발 계획서](docs/MVP_3Phase_Plan.md)
- [MVP Phase 4 개발 계획서](docs/MVP_Phase4_Plan.md) 🆕
- [데이터베이스 스키마 설계서](docs/Database_Schema_Design.md)
- [개발 가이드](docs/Development_Guide.md)
- [분석 보고서](docs/Analysis_Report.md)

### 프론트엔드
- [프론트엔드 개발 가이드](docs/Frontend_Development_Guide.md) 🆕
- [MVP 4.1 프론트엔드 템플릿 완료](docs/MVP41_Frontend_Template_Complete.md) 🆕
- [전체 도메인 Frontend 개발 완료](docs/All_Domains_Frontend_Complete.md) 🆕
- [Frontend-Backend 연동 완료](docs/Frontend_Backend_Integration_Complete.md) 🆕
- [403 Forbidden 에러 해결](docs/403_Forbidden_Error_Fix.md) 🆕
- [에러와 빈 데이터 구분 처리 개선](docs/Error_vs_Empty_Data_Handling.md) 🆕
- [유동적 레이아웃 개선 완료](docs/Fluid_Layout_Update.md) 🆕
- [반응형 UI 개선 완료](docs/Responsive_UI_Complete.md) 🆕
- [SR 관리 기능 구현 완료](docs/SR_Management_Complete.md) 🆕
- [프론트엔드/백엔드 통합 수정](docs/Frontend_Backend_Integration_Fix.md) 🆕
- [Favicon 적용 완료](docs/Favicon_Implementation.md) 🆕

### 테스트 및 배포
- [Phase 2 테스트 가이드](docs/Phase2_Testing_Guide.md)
- [Phase 3 테스트 가이드](docs/Phase3_Testing_Guide.md)
- [Docker Full Stack 실행 가이드](docs/Docker_Full_Stack_Guide.md) 🆕
- [Docker Compose Full Stack 완료](docs/Docker_Compose_Full_Stack_Complete.md) 🆕

### 완료 보고서
- [Phase 3 완료 보고서](docs/Phase3_Complete_Summary.md)
- [MVP 4.2 통계/리포트 완료](docs/MVP42_Statistics_Reports_Complete.md) 🆕
- [MVP Phase 4 진행 현황](docs/MVP_Phase4_Progress_Summary.md) 🆕
- [프로젝트 전체 완료 보고서](ARIS_PROJECT_COMPLETE.md)

## 🔒 보안

- JWT 기반 인증
- BCrypt 비밀번호 암호화
- RBAC 권한 관리
- SQL Injection 방지
- XSS 방어

## 📝 라이선스

이 프로젝트는 Apache 2.0 라이선스를 따릅니다.

## 📧 문의

프로젝트 관련 문의는 GitHub Issues를 이용해주세요.

---

## 📊 프로젝트 현황

### MVP 개발 진행 상황
- ✅ **Phase 1**: 핵심 기반 (완료)
- ✅ **Phase 2**: 핵심 업무 흐름 (완료)
- ✅ **Phase 3**: 확장 기능 (완료)
- 🔄 **Phase 4**: 고급 기능 (진행중)
  - ✅ MVP 4.1: 프론트엔드 개발 (완료) 🎉
  - ⏳ MVP 4.2: 통계 및 리포트 (Backend 구현 대기)
  - ⏳ MVP 4.3: 배치 처리 (대기)
  - ⏳ MVP 4.4: 알림 시스템 (대기)

### 통계
- **Backend API 엔드포인트**: 80개
  - Phase 1-3: 완료
- **Frontend 페이지**: 7개 (신규)
  - 로그인, 대시보드, 프로젝트 목록/등록, SR 목록/등록/상세
- **프론트엔드 컴포넌트**: 20개
- **데이터베이스 테이블**: 22개
- **문서**: 16개 이상

---

## 🎉 최신 업데이트

### 403 Forbidden 에러 해결! (2025-01-16) 🔐

**Backend 재시작 후 발생하는 403 에러를 자동으로 처리합니다!**

**해결 내용**:
- ✅ 403 에러 시 자동 토큰 갱신 시도
- ✅ Refresh Token으로 재인증
- ✅ 실패 시 자동 로그아웃 처리
- ✅ 사용자 개입 최소화

**결과**: 끊김 없는 사용자 경험! 🎉

### 에러 처리 개선 완료! (2025-01-16) 🎯

**사용자가 API 에러와 빈 데이터를 명확히 구분할 수 있습니다!**

**개선 사항**:
- ✅ 모든 목록 페이지에 에러 Alert 추가
- ✅ 에러 메시지 사용자 친화적으로 개선
- ✅ 데이터 없음 vs API 에러 명확히 구분
- ✅ 즉각적인 피드백 제공

**결과**: 사용자 혼란 해소, UX 개선! 🎉

### Frontend-Backend 연동 완료! (2025-01-16) 🎊

**모든 API가 정상 연동되어 작동합니다!**

**연동 결과**:
- ✅ 프로젝트 API (100%)
- ✅ SR 관리 API (100%)
- ✅ SPEC 관리 API (100%) - PostgreSQL Enum 이슈 해결
- ✅ 승인 관리 API (100%)
- ✅ 이슈 관리 API (100%)
- ✅ 릴리즈 API (100%)
- ✅ 장애 관리 API (100%) - PostgreSQL Enum 이슈 해결
- ✅ 파트너 API (100%)
- ✅ 자산 관리 API (100%)

**종합**: **9/9 API 연동 성공 (100%)** 🎉

### 전체 도메인 필수 필드 최적화 완료! (2025-01-16) 🎯

**6개 도메인, 8개 필드의 UX를 대폭 개선했습니다!**

**문제점**:
- ❌ 프로젝트: `companyId` 필수
- ❌ SR: `requestDate`, `srCategory`, `businessRequirement` 필수
- ❌ Issue: `reporterId` 필수
- ❌ Incident: `occurredAt` 필수
- ❌ Release: `requesterId` 필수
- ❌ Asset: `acquiredAt` 필수

**해결책**:
- ✅ 로그인한 사용자 정보 자동 활용
- ✅ 현재 날짜/시간 자동 설정
- ✅ 최소한의 정보만 입력 받기
- ✅ 직관적이고 안전한 UX
- ✅ 관리자는 여전히 명시적 지정 가능

**상세 내용**: [전체 도메인 필수 필드 최적화](docs/All_Domains_Required_Fields_Fix.md)

### ProjectType Enum 불일치 오류 해결! (2025-01-16) 🐛

**프로젝트 등록 시 500 에러를 수정했습니다!**

**문제점**:
- ❌ Frontend에서 `DEVELOPMENT`, `OPERATION`, `MAINTENANCE` 값 전송
- ❌ Backend는 `SI`, `SM`만 허용
- ❌ Jackson Enum Deserialization 오류 발생

**해결책**:
- ✅ ProjectCreatePage.tsx MenuItem 값 수정 (`SI`, `SM`)
- ✅ ProjectListPage.tsx에 `getProjectTypeLabel()` 함수 추가
- ✅ 사용자 친화적 레이블 표시 (예: "SI (시스템 통합)")

**상세 내용**: [ProjectType Enum 불일치 해결](docs/Project_Type_Enum_Mismatch_Fix.md)

### 전체 도메인 Frontend 개발 완료! (2025-01-16) 🚀

**7개 도메인**의 Frontend를 전체 개발 완료했습니다!

**완료된 도메인**:
- ✅ SPEC 관리 (Types + API + List Page)
- ✅ 승인 관리 (Types + API + List Page)
- ✅ 이슈 관리 (Types + API + List Page)
- ✅ 릴리즈 (Types + API + List Page)
- ✅ 장애 관리 (Types + API + List Page)
- ✅ 파트너 (Types + API + List Page)
- ✅ 자산 관리 (Types + API + List Page)

**총 22개 파일 생성** (Types 7개 + API 7개 + Pages 7개 + Routing)

### 유동적 레이아웃 개선 완료! (2025-01-16) 💯

브라우저 창 크기에 맞게 **모든 컴포넌트가 100% 딱 맞고 가변적으로 조정**되도록 개선했습니다!

**개선사항**:
- ✅ 창 크기 조정 시 실시간 컴포넌트 크기 변경
- ✅ 고정 maxWidth 제거 → 100% 유동적 너비
- ✅ 뷰포트 단위 사용 (100vw, 100vh)
- ✅ 넓은 화면에서 공간 활용도 극대화
- ✅ 모든 화면 크기에서 최적의 레이아웃

### 반응형 UI 개선 완료! (2025-01-16) 🎨

전체 화면을 모바일/태블릿/데스크탑에 최적화된 반응형 UI로 개선했습니다!

**개선사항**:
- ✅ 모바일 햄버거 메뉴 (Temporary Drawer)
- ✅ 테이블 → 카드 뷰 자동 전환
- ✅ 반응형 폼 레이아웃
- ✅ 터치 인터페이스 최적화
- ✅ 모바일 우선 디자인

### SR 관리 기능 완전 구현 완료! (2025-01-16)

프로젝트 관리에 이어 SR(Service Request) 관리 기능의 Frontend/Backend 통합이 완료되었습니다!

**새로운 기능**:
- ✅ SR 목록 조회 (페이징, 상태/우선순위별 표시)
- ✅ SR 등록 (프로젝트 연동)
- ✅ SR 상세 조회
- ✅ SR 삭제
- ✅ 반응형 UI (모바일/태블릿/데스크탑)

**접속하기**:
```bash
# 전체 스택 실행
docker-compose up -d

# Frontend UI에서 SR 관리
http://localhost:3000/srs

# 로그인 정보
# 이메일: admin@aris.com
# 비밀번호: admin1234
```

### Docker Compose Full Stack 구성 완료! (2025-10-16)

이제 `docker-compose up -d` 명령 하나로 전체 스택(PostgreSQL + Backend + Frontend)을 실행할 수 있습니다!

자세한 내용은 [Docker Compose Full Stack 완료 보고서](docs/Docker_Compose_Full_Stack_Complete.md)를 참조하세요.

---

**Last Updated**: 2025-10-16  
**Version**: 1.2.0 (Docker Compose Full Stack 완료)
