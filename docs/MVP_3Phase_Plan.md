# ARIS MVP 3단계 개발 계획서

## 📋 문서 정보
- **작성일**: 2025-10-15
- **버전**: 1.0.0
- **프로젝트명**: ARIS (Advanced Request & Issue Management System)
- **목적**: IT 프로젝트의 SR, SPEC, 승인, 장애 등을 통합 관리하는 엔터프라이즈 시스템 개발

---

## 🎯 프로젝트 개요

### 시스템 목적
IT 프로젝트 관리에 필요한 다양한 업무 프로세스를 하나의 플랫폼에서 통합 관리함으로써:
- SR(Service Request) 요청부터 개발 완료까지의 전체 라이프사이클 추적
- 체계적인 승인 프로세스를 통한 투명한 의사결정
- 장애 및 이슈 관리를 통한 서비스 품질 향상
- 통계 및 리포트를 통한 데이터 기반 의사결정 지원

### 기술 스택
| 구분 | 기술 | 비고 |
|------|------|------|
| Backend | Spring Boot 3.x (Java 17) | 주요 프레임워크 |
| Database | PostgreSQL 15+ | 관계형 데이터베이스 |
| ORM | Spring Data JPA | 데이터 접근 계층 |
| Security | Spring Security + JWT | 인증/인가 |
| Migration | Flyway | DB 스키마 버전 관리 |
| Container | Docker & Docker Compose | 컨테이너 기반 배포 |
| Documentation | Swagger/OpenAPI 3.0 | API 문서 자동화 |
| Testing | JUnit 5, Mockito, TestContainers | 테스트 프레임워크 |

---

## 🚀 MVP 전략 및 단계별 목표

### MVP란?
**Minimum Viable Product (최소 기능 제품)**
- 핵심 가치를 제공할 수 있는 최소한의 기능만 구현
- 빠른 시장 진입 및 사용자 피드백 수집
- 점진적 개선 및 확장

### 3단계 MVP 전략

```
Phase 1 (Foundation)
    ↓
Phase 2 (Core Business)
    ↓
Phase 3 (Extended Features)
```

각 단계는 이전 단계가 안정화된 후 진행하며, 사용자 피드백을 반영하여 지속적으로 개선합니다.

---

## 📅 MVP Phase 1: 핵심 기반 (Core Foundation)

### 목표
시스템의 근간이 되는 사용자 인증/인가 및 기본 관리 기능 구축

### 기간
**2-3주** (예상)

### 주요 기능

#### 1.1 사용자 인증 및 권한 관리
- [x] JWT 기반 사용자 인증
- [x] 로그인/로그아웃
- [x] 토큰 갱신 (Refresh Token)
- [x] 비밀번호 암호화 (BCrypt)
- [x] 세션 관리

#### 1.2 사용자 관리 (1.1.2)
- [x] 사용자 계정 조회 (필터링: 회사명, 파트, 이름)
- [x] 사용자 계정 등록
- [x] 사용자 계정 수정
- [x] 비밀번호 변경
- [x] 비밀번호 초기화
- [x] 계정 활성화/비활성화
- [x] 본인 정보 조회/수정

#### 1.3 권한 관리 (1.1.1)
- [x] 역할(Role) CRUD
- [x] 메뉴 권한 관리
- [x] 버튼(기능) 권한 관리
- [x] 사용자에게 권한 부여/회수
- [x] 권한 부여 현황 조회
- [x] 사용자 권한별 메뉴 조회

#### 1.4 공통 UI 프레임워크 (1.7.1)
- [x] 로그인 화면
- [x] 메인 대시보드 레이아웃
- [x] TOP 프레임 (사용자 정보, 로그아웃)
- [x] LEFT 프레임 (권한별 메뉴)
- [x] WORK 메인 화면

### 데이터베이스 설계 (Phase 1)

#### ERD
```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │───────│ user_roles  │───────│   roles     │
└─────────────┘       └─────────────┘       └─────────────┘
       │                                            │
       │                                            │
       ├──────────┐                        ┌────────┤
       ↓          ↓                        ↓        ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐ ┌─────────────┐
│  companies  │  │ departments │  │    menus    │ │menu_permissions│
└─────────────┘  └─────────────┘  └─────────────┘ └─────────────┘
```

#### 테이블 상세

**users (사용자)**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20),
    company_id BIGINT REFERENCES companies(id),
    department_id BIGINT REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT false,
    resigned_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_company ON users(company_id);
CREATE INDEX idx_user_deleted ON users(deleted_at);
```

**roles (역할/권한)**
```sql
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200),
    role_type VARCHAR(20) NOT NULL, -- SYSTEM, MENU, FUNCTION
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);
```

**user_roles (사용자-역할 매핑)**
```sql
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id),
    role_id BIGINT NOT NULL REFERENCES roles(id),
    granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    granted_by VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role_id)
);
```

**companies (회사)**
```sql
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    business_number VARCHAR(20) NOT NULL UNIQUE,
    ceo_name VARCHAR(50),
    is_closed BOOLEAN DEFAULT false,
    closed_at DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);
```

**departments (부서/파트)**
```sql
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    name VARCHAR(50) NOT NULL,
    parent_id BIGINT REFERENCES departments(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);
```

**menus (메뉴)**
```sql
CREATE TABLE menus (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    path VARCHAR(100),
    parent_id BIGINT REFERENCES menus(id),
    sort_order INT NOT NULL DEFAULT 0,
    icon VARCHAR(50),
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);
```

**menu_permissions (메뉴 권한)**
```sql
CREATE TABLE menu_permissions (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL REFERENCES menus(id),
    role_id BIGINT NOT NULL REFERENCES roles(id),
    can_read BOOLEAN DEFAULT true,
    can_create BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL
);
```

### API 엔드포인트 (Phase 1)

#### 인증 API
```
POST   /api/auth/register          - 회원가입
POST   /api/auth/login             - 로그인
POST   /api/auth/logout            - 로그아웃
POST   /api/auth/refresh           - 토큰 갱신
POST   /api/auth/password/reset    - 비밀번호 초기화
PUT    /api/auth/password/change   - 비밀번호 변경
GET    /api/auth/me                - 현재 로그인 사용자 정보
```

#### 사용자 관리 API
```
GET    /api/users                  - 사용자 목록 조회 (필터링, 페이징)
POST   /api/users                  - 사용자 등록
GET    /api/users/{id}             - 사용자 상세 조회
PUT    /api/users/{id}             - 사용자 정보 수정
DELETE /api/users/{id}             - 사용자 삭제 (Soft Delete)
PUT    /api/users/{id}/activate    - 사용자 활성화
PUT    /api/users/{id}/deactivate  - 사용자 비활성화
PUT    /api/users/{id}/approve     - 사용자 승인
```

#### 권한 관리 API
```
GET    /api/roles                  - 역할 목록 조회
POST   /api/roles                  - 역할 등록
GET    /api/roles/{id}             - 역할 상세 조회
PUT    /api/roles/{id}             - 역할 수정
DELETE /api/roles/{id}             - 역할 삭제
POST   /api/roles/{id}/grant       - 사용자에게 역할 부여
POST   /api/roles/{id}/revoke      - 사용자로부터 역할 회수
GET    /api/roles/{id}/users       - 역할이 부여된 사용자 목록
```

#### 메뉴 관리 API
```
GET    /api/menus                  - 메뉴 목록 조회 (권한 기반)
POST   /api/menus                  - 메뉴 등록
GET    /api/menus/{id}             - 메뉴 상세 조회
PUT    /api/menus/{id}             - 메뉴 수정
DELETE /api/menus/{id}             - 메뉴 삭제
GET    /api/menus/tree             - 메뉴 트리 구조 조회
```

#### 회사 관리 API
```
GET    /api/companies              - 회사 목록 조회
POST   /api/companies              - 회사 등록
GET    /api/companies/{id}         - 회사 상세 조회
PUT    /api/companies/{id}         - 회사 정보 수정
DELETE /api/companies/{id}         - 회사 삭제
```

### 주요 구현 클래스

#### Entity
- `User.java`
- `Role.java`
- `UserRole.java`
- `Company.java`
- `Department.java`
- `Menu.java`
- `MenuPermission.java`
- `BaseEntity.java` (공통 엔티티)

#### DTO
- `UserCreateRequest.java`
- `UserUpdateRequest.java`
- `UserResponse.java`
- `LoginRequest.java`
- `LoginResponse.java`
- `TokenResponse.java`

#### Service
- `AuthService.java`
- `UserService.java`
- `RoleService.java`
- `MenuService.java`
- `CompanyService.java`

#### Security
- `JwtTokenProvider.java`
- `JwtAuthenticationFilter.java`
- `SecurityConfig.java`
- `CustomUserDetails.java`
- `CustomUserDetailsService.java`

### 완료 조건 (Definition of Done)
- [ ] 모든 API 엔드포인트 구현 완료
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] Swagger 문서 작성 완료
- [ ] Docker Compose로 로컬 실행 가능
- [ ] JWT 인증 정상 동작
- [ ] 권한 기반 메뉴 조회 정상 동작
- [ ] 코드 리뷰 완료

---

## 📅 MVP Phase 2: 핵심 업무 흐름 (Core Business Flow)

### 목표
SR 요청 → SPEC 작성 → 개발 → 승인이라는 핵심 업무 프로세스 구현

### 기간
**3-4주** (예상)

### 주요 기능

#### 2.1 IT 사업 관리 (2.1.2)
- [x] 프로젝트 조회 (필터링: 기간, 프로젝트 구분)
- [x] 프로젝트 등록
- [x] 프로젝트 수정
- [x] 프로젝트 상세 정보 조회
- [x] 프로젝트 상태 관리 (준비, 진행중, 완료, 취소)

#### 2.2 SR 관리 - 개발 (3.1.1)
- [x] 개발 SR 정보 조회 (필터링, 페이징)
- [x] 개발 SR 상세 정보 조회
- [x] 개발 SR 정보 등록
- [x] 개발 SR 정보 수정
- [x] 파일 첨부 기능
- [x] SR 상태 관리 (승인요청, 승인대기, 승인, 반려, 취소)

#### 2.3 SR 관리 - 운영 (3.1.2)
- [x] 운영 SR 정보 조회
- [x] 운영 SR 상세 정보 조회
- [x] 운영 SR 등록
- [x] 운영 SR 정보 수정
- [x] 데이터 추출 요청 처리

#### 2.4 SPEC 관리 (4.1.1)
- [x] SPEC 조회 (필터링: 등록일, SPEC 분류, SPEC 상태)
- [x] SPEC 상세 조회
- [x] SPEC 정보 등록
- [x] SPEC 정보 수정
- [x] SPEC 상태 관리 (대기, 진행중, 승인대기, 승인, 반려, 완료)
- [x] FP/MD 관리
- [x] 담당자 할당

#### 2.5 승인 관리 (5.1.1)
- [x] 승인 내역 조회 (필터링: 승인유형, 승인상태)
- [x] 승인 내역 상세조회
- [x] 승인 요청
- [x] 승인 확정
- [x] 승인 반려
- [x] 승인 라인 관리

### 데이터베이스 설계 (Phase 2)

#### ERD
```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  projects   │       │service_reqs │       │    specs    │
└─────────────┘       └─────────────┘       └─────────────┘
       │                      │                      │
       │                      ├──────────────────────┤
       │                      │                      │
       │              ┌───────┴──────┐       ┌───────┴──────┐
       │              ↓              ↓       ↓              ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│project_users│  │   sr_files  │  │ spec_files  │  │  approvals  │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
                                                           │
                                                           ↓
                                                   ┌─────────────┐
                                                   │approval_lines│
                                                   └─────────────┘
```

#### 테이블 상세

**projects (프로젝트)**
```sql
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    project_type VARCHAR(20) NOT NULL, -- SI, SM
    status VARCHAR(20) NOT NULL, -- PREPARING, IN_PROGRESS, COMPLETED, CANCELLED
    start_date DATE NOT NULL,
    end_date DATE,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_project_company ON projects(company_id);
CREATE INDEX idx_project_dates ON projects(start_date, end_date);
```

**service_requests (SR)**
```sql
CREATE TABLE service_requests (
    id BIGSERIAL PRIMARY KEY,
    sr_number VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    sr_type VARCHAR(20) NOT NULL, -- DEVELOPMENT, OPERATION
    sr_category VARCHAR(50) NOT NULL, -- AP개발, 자료요청, 데이터변경요청 등
    status VARCHAR(20) NOT NULL, -- APPROVAL_REQUESTED, APPROVAL_PENDING, APPROVED, REJECTED, CANCELLED
    business_requirement TEXT NOT NULL,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    requester_id BIGINT NOT NULL REFERENCES users(id),
    requester_dept_id BIGINT REFERENCES departments(id),
    request_date DATE NOT NULL,
    release_date DATE,
    release_number VARCHAR(50),
    issue_number VARCHAR(50),
    issue_content TEXT,
    spec_id BIGINT REFERENCES specifications(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_sr_project ON service_requests(project_id);
CREATE INDEX idx_sr_requester ON service_requests(requester_id);
CREATE INDEX idx_sr_status ON service_requests(status);
CREATE INDEX idx_sr_request_date ON service_requests(request_date);
```

**sr_files (SR 첨부파일)**
```sql
CREATE TABLE sr_files (
    id BIGSERIAL PRIMARY KEY,
    sr_id BIGINT NOT NULL REFERENCES service_requests(id),
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(50) NOT NULL
);

CREATE INDEX idx_sr_files_sr ON sr_files(sr_id);
```

**specifications (SPEC)**
```sql
CREATE TABLE specifications (
    id BIGSERIAL PRIMARY KEY,
    spec_number VARCHAR(20) NOT NULL UNIQUE,
    sr_id BIGINT NOT NULL REFERENCES service_requests(id),
    spec_type VARCHAR(20) NOT NULL, -- DEVELOPMENT, OPERATION
    spec_category VARCHAR(20) NOT NULL, -- ACCEPTED, CANCELLED
    status VARCHAR(20) NOT NULL, -- PENDING, IN_PROGRESS, APPROVAL_PENDING, APPROVED, REJECTED, COMPLETED
    function_point DECIMAL(10, 2),
    man_day DECIMAL(10, 2),
    assignee_id BIGINT REFERENCES users(id),
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_spec_sr ON specifications(sr_id);
CREATE INDEX idx_spec_assignee ON specifications(assignee_id);
CREATE INDEX idx_spec_status ON specifications(status);
```

**spec_files (SPEC 첨부파일)**
```sql
CREATE TABLE spec_files (
    id BIGSERIAL PRIMARY KEY,
    spec_id BIGINT NOT NULL REFERENCES specifications(id),
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(50) NOT NULL
);

CREATE INDEX idx_spec_files_spec ON spec_files(spec_id);
```

**approvals (승인)**
```sql
CREATE TABLE approvals (
    id BIGSERIAL PRIMARY KEY,
    approval_number VARCHAR(20) NOT NULL UNIQUE,
    approval_type VARCHAR(20) NOT NULL, -- SR, SPEC, RELEASE
    target_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL, -- PENDING, APPROVED, REJECTED, CANCELLED
    current_step INT NOT NULL DEFAULT 1,
    total_steps INT NOT NULL,
    requester_id BIGINT NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_approval_type_target ON approvals(approval_type, target_id);
CREATE INDEX idx_approval_status ON approvals(status);
```

**approval_lines (승인라인)**
```sql
CREATE TABLE approval_lines (
    id BIGSERIAL PRIMARY KEY,
    approval_id BIGINT NOT NULL REFERENCES approvals(id),
    step_order INT NOT NULL,
    approver_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL, -- PENDING, APPROVED, REJECTED
    comment TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approval_line_approval ON approval_lines(approval_id);
CREATE INDEX idx_approval_line_approver ON approval_lines(approver_id);
```

### API 엔드포인트 (Phase 2)

#### 프로젝트 관리 API
```
GET    /api/projects               - 프로젝트 목록 조회
POST   /api/projects               - 프로젝트 등록
GET    /api/projects/{id}          - 프로젝트 상세 조회
PUT    /api/projects/{id}          - 프로젝트 수정
PUT    /api/projects/{id}/status   - 프로젝트 상태 변경
DELETE /api/projects/{id}          - 프로젝트 삭제
GET    /api/projects/{id}/srs      - 프로젝트별 SR 목록
GET    /api/projects/{id}/stats    - 프로젝트 통계
```

#### SR 관리 API
```
GET    /api/srs                    - SR 목록 조회 (필터링, 페이징)
POST   /api/srs                    - SR 등록
GET    /api/srs/{id}               - SR 상세 조회
PUT    /api/srs/{id}               - SR 수정
DELETE /api/srs/{id}               - SR 삭제
PUT    /api/srs/{id}/status        - SR 상태 변경
POST   /api/srs/{id}/files         - SR 파일 첨부
DELETE /api/srs/{id}/files/{fileId} - SR 파일 삭제
GET    /api/srs/{id}/files/{fileId}/download - SR 파일 다운로드
POST   /api/srs/{id}/submit        - SR 승인 요청
```

#### SPEC 관리 API
```
GET    /api/specs                  - SPEC 목록 조회
POST   /api/specs                  - SPEC 등록
GET    /api/specs/{id}             - SPEC 상세 조회
PUT    /api/specs/{id}             - SPEC 수정
DELETE /api/specs/{id}             - SPEC 삭제
PUT    /api/specs/{id}/status      - SPEC 상태 변경
PUT    /api/specs/{id}/assign      - SPEC 담당자 할당
POST   /api/specs/{id}/files       - SPEC 파일 첨부
DELETE /api/specs/{id}/files/{fileId} - SPEC 파일 삭제
POST   /api/specs/{id}/submit      - SPEC 승인 요청
```

#### 승인 관리 API
```
GET    /api/approvals              - 승인 목록 조회
POST   /api/approvals              - 승인 요청 생성
GET    /api/approvals/{id}         - 승인 상세 조회
PUT    /api/approvals/{id}/approve - 승인 처리
PUT    /api/approvals/{id}/reject  - 반려 처리
PUT    /api/approvals/{id}/cancel  - 승인 취소
GET    /api/approvals/my-pending   - 내가 승인할 건 목록
GET    /api/approvals/my-requested - 내가 요청한 건 목록
```

### 주요 구현 클래스

#### Entity
- `Project.java`
- `ServiceRequest.java`
- `SrFile.java`
- `Specification.java`
- `SpecFile.java`
- `Approval.java`
- `ApprovalLine.java`

#### DTO
- `ProjectRequest.java`, `ProjectResponse.java`
- `SrCreateRequest.java`, `SrUpdateRequest.java`, `SrResponse.java`
- `SpecRequest.java`, `SpecResponse.java`
- `ApprovalRequest.java`, `ApprovalResponse.java`
- `FileUploadResponse.java`

#### Service
- `ProjectService.java`
- `ServiceRequestService.java`
- `SpecificationService.java`
- `ApprovalService.java`
- `FileStorageService.java`

#### Enum
- `SrType.java` (DEVELOPMENT, OPERATION)
- `SrCategory.java`
- `SrStatus.java`
- `SpecStatus.java`
- `ApprovalType.java`
- `ApprovalStatus.java`

### 완료 조건 (Definition of Done)
- [ ] 모든 API 엔드포인트 구현 완료
- [ ] SR → SPEC → 승인 프로세스 통합 테스트 완료
- [ ] 파일 첨부/다운로드 기능 정상 동작
- [ ] 승인 워크플로우 정상 동작
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] Swagger 문서 작성 완료
- [ ] 코드 리뷰 완료

---

## 📅 MVP Phase 3: 확장 기능 (Extended Features)

### 목표
핵심 업무 흐름을 지원하는 확장 기능 및 관리 도구 구현

### 기간
**4-5주** (예상)

### 주요 기능

#### 3.1 이슈 관리 (4.1.2)
- [x] 이슈 등록
- [x] 이슈 조회 (필터링: 요청자, 이슈담당자, 이슈상태)
- [x] 이슈 수정/삭제
- [x] 이슈 상태 관리

#### 3.2 릴리즈 관리 (4.1.3)
- [x] 릴리즈 리스트 조회
- [x] 릴리즈 등록 (긴급, 정기)
- [x] 릴리즈 수정
- [x] 릴리즈 승인 프로세스

#### 3.3 장애 관리 (6.1.1)
- [x] 장애/인시던트 등록
- [x] 장애/인시던트 조회
- [x] 장애/인시던트 수정
- [x] 장애 기준정보 등록
- [x] 장애 등급 관리
- [x] 장애보고서 관리
- [x] 시스템 담당자 관리

#### 3.4 통계 (9.1)
- [x] 개발 SR 리스트 통계
- [x] 개발 완료 과제 리소스 통계
- [x] 기간별 개발 공수 산정
- [x] 조직별 개발 공수 산정
- [x] 운영 SR 통계
- [x] 월별/시스템별 장애 통계

#### 3.5 파트너 관리 (7.1.1)
- [x] 파트너 조회
- [x] 파트너 등록
- [x] 파트너 수정/삭제

#### 3.6 자산 관리 (8.1.1)
- [x] PC 및 IT 기기 등록
- [x] PC 및 IT 기기 조회
- [x] PC 및 IT 기기 수정/삭제

#### 3.7 알림 관리 (1.4.1)
- [x] SMS 알림 요청 조회
- [x] SMS 알림 요청 등록
- [x] 알림 발송

#### 3.8 배치 관리 (1.6)
- [x] 배치 정보 등록/수정/삭제
- [x] 배치 처리 내역 조회
- [x] 배치 스케줄 관리

#### 3.9 일괄 처리 (1.5)
- [x] 엑셀 다운로드 요청
- [x] 엑셀 파일 생성
- [x] 일괄 등록 파일 표준화
- [x] 일괄 등록 내역 생성

### 데이터베이스 설계 (Phase 3)

#### 테이블 상세

**issues (이슈)**
```sql
CREATE TABLE issues (
    id BIGSERIAL PRIMARY KEY,
    issue_number VARCHAR(20) NOT NULL UNIQUE,
    sr_id BIGINT REFERENCES service_requests(id),
    spec_id BIGINT REFERENCES specifications(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL, -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    assignee_id BIGINT REFERENCES users(id),
    reporter_id BIGINT NOT NULL REFERENCES users(id),
    parent_issue_id BIGINT REFERENCES issues(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);
```

**releases (릴리즈)**
```sql
CREATE TABLE releases (
    id BIGSERIAL PRIMARY KEY,
    release_number VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    release_type VARCHAR(20) NOT NULL, -- EMERGENCY, REGULAR
    status VARCHAR(20) NOT NULL, -- REQUESTED, APPROVED, DEPLOYED, CANCELLED
    content TEXT,
    requester_id BIGINT NOT NULL REFERENCES users(id),
    requester_dept_id BIGINT REFERENCES departments(id),
    approver_id BIGINT REFERENCES users(id),
    scheduled_at TIMESTAMP,
    deployed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);
```

**incidents (장애)**
```sql
CREATE TABLE incidents (
    id BIGSERIAL PRIMARY KEY,
    incident_number VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    incident_type VARCHAR(20) NOT NULL, -- INCIDENT, FAILURE
    system_type VARCHAR(50) NOT NULL, -- PROGRAM, DATA, SERVER, NETWORK, PC
    business_area VARCHAR(50),
    severity VARCHAR(20) NOT NULL, -- HIGH, MEDIUM, LOW
    status VARCHAR(20) NOT NULL, -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    occurred_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    resolution TEXT,
    assignee_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);
```

**partners (파트너)**
```sql
CREATE TABLE partners (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    business_number VARCHAR(20) NOT NULL UNIQUE,
    ceo_name VARCHAR(50),
    is_closed BOOLEAN DEFAULT false,
    closed_at DATE,
    manager_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);
```

**assets (자산)**
```sql
CREATE TABLE assets (
    id BIGSERIAL PRIMARY KEY,
    asset_number VARCHAR(20) NOT NULL UNIQUE,
    asset_type VARCHAR(50) NOT NULL, -- PC, LAPTOP, MONITOR, SERVER, etc
    serial_number VARCHAR(100),
    acquired_at DATE NOT NULL,
    is_expired BOOLEAN DEFAULT false,
    expired_at DATE,
    manager_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);
```

**notifications (알림)**
```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    notification_type VARCHAR(20) NOT NULL, -- SMS, EMAIL
    recipient VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL, -- PENDING, SENT, FAILED
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL
);
```

**batch_jobs (배치작업)**
```sql
CREATE TABLE batch_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(200),
    cron_expression VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_executed_at TIMESTAMP,
    last_status VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);
```

### API 엔드포인트 (Phase 3)

```
# 이슈 관리
GET    /api/issues
POST   /api/issues
GET    /api/issues/{id}
PUT    /api/issues/{id}
DELETE /api/issues/{id}

# 릴리즈 관리
GET    /api/releases
POST   /api/releases
GET    /api/releases/{id}
PUT    /api/releases/{id}
POST   /api/releases/{id}/approve

# 장애 관리
GET    /api/incidents
POST   /api/incidents
GET    /api/incidents/{id}
PUT    /api/incidents/{id}
DELETE /api/incidents/{id}

# 통계
GET    /api/statistics/srs
GET    /api/statistics/resources
GET    /api/statistics/mandays
GET    /api/statistics/incidents

# 파트너 관리
GET    /api/partners
POST   /api/partners
GET    /api/partners/{id}
PUT    /api/partners/{id}
DELETE /api/partners/{id}

# 자산 관리
GET    /api/assets
POST   /api/assets
GET    /api/assets/{id}
PUT    /api/assets/{id}
DELETE /api/assets/{id}

# 알림 관리
GET    /api/notifications
POST   /api/notifications

# 배치 관리
GET    /api/batch-jobs
POST   /api/batch-jobs
GET    /api/batch-jobs/{id}
PUT    /api/batch-jobs/{id}
DELETE /api/batch-jobs/{id}
GET    /api/batch-jobs/{id}/history
```

### 완료 조건 (Definition of Done)
- [ ] 모든 API 엔드포인트 구현 완료
- [ ] 통계 데이터 정확성 검증 완료
- [ ] 배치 스케줄 정상 동작
- [ ] 알림 발송 정상 동작
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] Swagger 문서 작성 완료
- [ ] 코드 리뷰 완료
- [ ] 성능 테스트 완료

---

## 🐳 Docker 환경 구성

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: aris-postgres
    environment:
      POSTGRES_DB: aris_db
      POSTGRES_USER: aris_user
      POSTGRES_PASSWORD: aris_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aris_user -d aris_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - aris-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: aris-backend
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/aris_db
      SPRING_DATASOURCE_USERNAME: aris_user
      SPRING_DATASOURCE_PASSWORD: aris_password
      JWT_SECRET: your-jwt-secret-key-must-be-at-least-256-bits-long
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/logs:/app/logs
      - ./backend/uploads:/app/uploads
    networks:
      - aris-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  aris-network:
    driver: bridge
```

### Backend Dockerfile
```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 실행 방법
```bash
# PostgreSQL만 실행 (로컬에서 IDE로 Backend 개발 시)
docker-compose up -d postgres

# 전체 실행 (Backend + PostgreSQL)
docker-compose up -d

# 로그 확인
docker-compose logs -f backend

# 종료
docker-compose down

# 데이터 포함 전체 삭제
docker-compose down -v
```

---

## 📈 개발 일정 (예상)

| Phase | 주차 | 주요 작업 | 완료 기준 |
|-------|------|-----------|-----------|
| Phase 1 | 1주차 | 프로젝트 초기 설정, Docker 환경 구축, BaseEntity 설계 | 로컬 실행 가능 |
| Phase 1 | 2주차 | JWT 인증 구현, 사용자 관리 API | 로그인/회원가입 가능 |
| Phase 1 | 3주차 | 권한 관리 API, 메뉴 관리, 테스트 | Phase 1 DoD 충족 |
| Phase 2 | 4주차 | 프로젝트 관리, SR 관리 API | SR CRUD 가능 |
| Phase 2 | 5주차 | SPEC 관리, 파일 첨부 기능 | SPEC CRUD 가능 |
| Phase 2 | 6주차 | 승인 프로세스 구현, 통합 테스트 | 승인 워크플로우 동작 |
| Phase 2 | 7주차 | 버그 수정, 리팩토링, 테스트 보완 | Phase 2 DoD 충족 |
| Phase 3 | 8주차 | 이슈 관리, 릴리즈 관리 | 이슈/릴리즈 CRUD 가능 |
| Phase 3 | 9주차 | 장애 관리, 파트너/자산 관리 | 장애 관리 가능 |
| Phase 3 | 10주차 | 통계, 알림, 배치 | 통계/알림/배치 동작 |
| Phase 3 | 11주차 | 버그 수정, 성능 최적화 | 성능 요구사항 충족 |
| Phase 3 | 12주차 | 최종 테스트, 문서화 완료 | Phase 3 DoD 충족 |

**총 예상 기간: 12주 (약 3개월)**

---

## 📊 성공 지표 (KPI)

### Phase 1
- [ ] JWT 인증 성공률: 99% 이상
- [ ] API 응답 시간: 평균 200ms 이하
- [ ] 테스트 커버리지: 80% 이상

### Phase 2
- [ ] SR 등록부터 승인까지 처리 시간: 평균 5초 이하
- [ ] 파일 업로드 성공률: 99% 이상
- [ ] 동시 사용자 100명 처리 가능

### Phase 3
- [ ] 통계 데이터 정확도: 100%
- [ ] 배치 작업 성공률: 99% 이상
- [ ] 전체 시스템 안정성: 99.9% 이상

---

## 🎓 학습 자료 및 참고사항

### Spring Boot
- [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Data JPA Guide](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)

### PostgreSQL
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)

### Docker
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Testing
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [TestContainers Guide](https://www.testcontainers.org/)

---

## 📞 문의 및 지원

프로젝트 관련 문의사항이나 기술 지원이 필요한 경우:
1. GitHub Issues에 등록
2. 개발 팀 Slack 채널 활용
3. 주간 스탠드업 미팅에서 논의

---

**Last Updated**: 2025-10-15
**Document Version**: 1.0.0









