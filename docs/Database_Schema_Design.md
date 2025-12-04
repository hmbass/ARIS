# ARIS 데이터베이스 스키마 설계서

## 📋 문서 정보
- **작성일**: 2025-10-15
- **버전**: 1.0.0
- **DBMS**: PostgreSQL 15+
- **Character Set**: UTF-8
- **Timezone**: Asia/Seoul

---

## 🎯 설계 원칙

### 1. 명명 규칙 (Naming Convention)
- **테이블명**: 소문자 + 언더스코어, 복수형 사용
  - 예: `users`, `service_requests`, `approval_lines`
- **컬럼명**: 소문자 + 언더스코어
  - 예: `created_at`, `user_id`, `is_active`
- **인덱스명**: `idx_` 접두사 + 테이블명 + 컬럼명
  - 예: `idx_user_email`, `idx_sr_project`
- **외래키명**: `fk_` 접두사 + 테이블명 + 참조테이블명
  - 예: `fk_user_company`, `fk_sr_project`

### 2. 공통 컬럼 (Auditing)
모든 테이블은 다음 컬럼을 포함합니다:
```sql
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
created_by VARCHAR(50) NOT NULL,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_by VARCHAR(50) NOT NULL,
deleted_at TIMESTAMP,  -- Soft Delete
version BIGINT DEFAULT 0  -- Optimistic Locking
```

### 3. 기본 키 (Primary Key)
- 모든 테이블은 `id` 컬럼을 기본 키로 사용
- 타입: `BIGSERIAL` (자동 증가)
- UUID는 분산 환경 고려 시 사용 (현재는 BIGSERIAL)

### 4. Soft Delete
- 물리적 삭제 금지
- `deleted_at` 컬럼으로 논리적 삭제 처리
- 조회 시 `WHERE deleted_at IS NULL` 조건 필수

### 5. 인덱스 전략
- 외래키는 자동으로 인덱스 생성 권장
- 자주 검색되는 컬럼에 인덱스 추가
- 복합 인덱스는 선택도가 높은 컬럼 우선

---

## 📊 ERD (Entity Relationship Diagram)

### 전체 ERD 개요
```
┌─────────────────────────────────────────────────────────────────┐
│                        ARIS Database Schema                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  companies  │◄──────│    users    │──────►│user_roles   │
└─────────────┘       └─────────────┘       └─────────────┘
                             │                      │
                             │                      ▼
                      ┌──────┴──────┐       ┌─────────────┐
                      │             │       │    roles    │
                      ▼             ▼       └─────────────┘
              ┌─────────────┐ ┌─────────────┐      │
              │departments  │ │   menus     │◄─────┘
              └─────────────┘ └─────────────┘
                      │
                      ▼
              ┌─────────────┐
              │  projects   │
              └─────────────┘
                      │
                      ▼
              ┌─────────────┐       ┌─────────────┐
              │service_reqs │──────►│   sr_files  │
              └─────────────┘       └─────────────┘
                      │
                      ├──────────────┐
                      ▼              ▼
              ┌─────────────┐ ┌─────────────┐
              │    specs    │ │  approvals  │
              └─────────────┘ └─────────────┘
                      │              │
                      ▼              ▼
              ┌─────────────┐ ┌─────────────┐
              │ spec_files  │ │approval_lines│
              └─────────────┘ └─────────────┘

        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │   issues    │ │  releases   │ │  incidents  │
        └─────────────┘ └─────────────┘ └─────────────┘

        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │  partners   │ │   assets    │ │batch_jobs   │
        └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 📋 테이블 상세 설계

### Phase 1: 인증/권한 관련 테이블

#### 1. companies (회사)
회사 정보를 관리하는 테이블

```sql
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE COMMENT '회사 코드',
    name VARCHAR(100) NOT NULL COMMENT '회사명',
    business_number VARCHAR(20) NOT NULL UNIQUE COMMENT '사업자등록번호',
    ceo_name VARCHAR(50) COMMENT '대표이사명',
    address VARCHAR(200) COMMENT '주소',
    phone_number VARCHAR(20) COMMENT '대표 전화번호',
    is_closed BOOLEAN DEFAULT false COMMENT '폐업 여부',
    closed_at DATE COMMENT '폐업일',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_company_code ON companies(code);
CREATE INDEX idx_company_business_number ON companies(business_number);
CREATE INDEX idx_company_deleted ON companies(deleted_at);

COMMENT ON TABLE companies IS '회사 정보';
COMMENT ON COLUMN companies.code IS '회사 코드 (예: COMP001)';
COMMENT ON COLUMN companies.business_number IS '사업자등록번호 (000-00-00000)';
```

#### 2. departments (부서/파트)
조직 구조를 관리하는 테이블 (계층 구조 지원)

```sql
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) COMMENT '회사 ID',
    name VARCHAR(50) NOT NULL COMMENT '부서명',
    parent_id BIGINT REFERENCES departments(id) COMMENT '상위 부서 ID',
    depth INT NOT NULL DEFAULT 0 COMMENT '계층 깊이',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '정렬 순서',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_dept_company ON departments(company_id);
CREATE INDEX idx_dept_parent ON departments(parent_id);
CREATE INDEX idx_dept_deleted ON departments(deleted_at);

COMMENT ON TABLE departments IS '부서/파트 정보 (계층 구조)';
COMMENT ON COLUMN departments.depth IS '0: 본부, 1: 팀, 2: 파트';
```

#### 3. roles (역할/권한)
시스템 권한 정보

```sql
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '역할명',
    description VARCHAR(200) COMMENT '역할 설명',
    role_type VARCHAR(20) NOT NULL COMMENT '역할 유형',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_role_type CHECK (role_type IN ('SYSTEM', 'MENU', 'FUNCTION'))
);

CREATE INDEX idx_role_type ON roles(role_type);
CREATE INDEX idx_role_deleted ON roles(deleted_at);

COMMENT ON TABLE roles IS '역할/권한 정보';
COMMENT ON COLUMN roles.role_type IS 'SYSTEM: 시스템 권한, MENU: 메뉴 권한, FUNCTION: 기능 권한';

-- 기본 역할 데이터
INSERT INTO roles (name, description, role_type, created_by) VALUES
('ROLE_ADMIN', '시스템 관리자', 'SYSTEM', 'system'),
('ROLE_PM', 'PM (Project Manager)', 'SYSTEM', 'system'),
('ROLE_PL', 'PL (Project Leader)', 'SYSTEM', 'system'),
('ROLE_DEVELOPER', '개발자', 'SYSTEM', 'system'),
('ROLE_USER', '일반 사용자', 'SYSTEM', 'system');
```

#### 4. users (사용자)
시스템 사용자 정보

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '이메일 (로그인 ID)',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호 (암호화)',
    name VARCHAR(50) NOT NULL COMMENT '이름',
    phone_number VARCHAR(20) COMMENT '전화번호',
    company_id BIGINT NOT NULL REFERENCES companies(id) COMMENT '회사 ID',
    department_id BIGINT REFERENCES departments(id) COMMENT '부서 ID',
    employee_number VARCHAR(20) COMMENT '사번',
    position VARCHAR(50) COMMENT '직급',
    is_active BOOLEAN DEFAULT true COMMENT '활성화 여부',
    is_approved BOOLEAN DEFAULT false COMMENT '승인 여부',
    resigned_at DATE COMMENT '퇴사일',
    last_login_at TIMESTAMP COMMENT '마지막 로그인 일시',
    password_changed_at TIMESTAMP COMMENT '비밀번호 변경일',
    failed_login_count INT DEFAULT 0 COMMENT '로그인 실패 횟수',
    is_locked BOOLEAN DEFAULT false COMMENT '계정 잠금 여부',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE UNIQUE INDEX idx_user_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_company ON users(company_id);
CREATE INDEX idx_user_department ON users(department_id);
CREATE INDEX idx_user_active ON users(is_active);
CREATE INDEX idx_user_deleted ON users(deleted_at);

COMMENT ON TABLE users IS '사용자 정보';
COMMENT ON COLUMN users.email IS '이메일 주소 (로그인 ID로 사용)';
COMMENT ON COLUMN users.password IS 'BCrypt 암호화된 비밀번호';
COMMENT ON COLUMN users.failed_login_count IS '5회 이상 실패 시 계정 잠금';
```

#### 5. user_roles (사용자-역할 매핑)
사용자에게 부여된 역할 정보

```sql
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '부여일시',
    granted_by VARCHAR(50) NOT NULL COMMENT '부여자',
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

COMMENT ON TABLE user_roles IS '사용자-역할 매핑 테이블 (N:M)';
```

#### 6. menus (메뉴)
시스템 메뉴 정보 (계층 구조)

```sql
CREATE TABLE menus (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '메뉴명',
    path VARCHAR(100) COMMENT '경로 (URL)',
    parent_id BIGINT REFERENCES menus(id) COMMENT '상위 메뉴 ID',
    depth INT NOT NULL DEFAULT 0 COMMENT '계층 깊이',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '정렬 순서',
    icon VARCHAR(50) COMMENT '아이콘 클래스',
    is_visible BOOLEAN DEFAULT true COMMENT '노출 여부',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_menu_parent ON menus(parent_id);
CREATE INDEX idx_menu_visible ON menus(is_visible);
CREATE INDEX idx_menu_deleted ON menus(deleted_at);

COMMENT ON TABLE menus IS '시스템 메뉴 정보 (계층 구조)';
COMMENT ON COLUMN menus.depth IS '0: 대메뉴, 1: 중메뉴, 2: 소메뉴';
```

#### 7. menu_permissions (메뉴 권한)
메뉴별 권한 설정

```sql
CREATE TABLE menu_permissions (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    can_read BOOLEAN DEFAULT true COMMENT '조회 권한',
    can_create BOOLEAN DEFAULT false COMMENT '생성 권한',
    can_update BOOLEAN DEFAULT false COMMENT '수정 권한',
    can_delete BOOLEAN DEFAULT false COMMENT '삭제 권한',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    UNIQUE (menu_id, role_id)
);

CREATE INDEX idx_menu_perm_menu ON menu_permissions(menu_id);
CREATE INDEX idx_menu_perm_role ON menu_permissions(role_id);

COMMENT ON TABLE menu_permissions IS '메뉴별 권한 설정';
COMMENT ON COLUMN menu_permissions.can_read IS '조회(R) 권한';
COMMENT ON COLUMN menu_permissions.can_create IS '생성(C) 권한';
COMMENT ON COLUMN menu_permissions.can_update IS '수정(U) 권한';
COMMENT ON COLUMN menu_permissions.can_delete IS '삭제(D) 권한';
```

---

### Phase 2: 핵심 업무 관련 테이블

#### 8. projects (프로젝트)
IT 사업/프로젝트 정보

```sql
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE COMMENT '프로젝트 코드',
    name VARCHAR(100) NOT NULL COMMENT '프로젝트명',
    project_type VARCHAR(20) NOT NULL COMMENT '프로젝트 유형',
    status VARCHAR(20) NOT NULL COMMENT '프로젝트 상태',
    start_date DATE NOT NULL COMMENT '시작일',
    end_date DATE COMMENT '종료일',
    company_id BIGINT NOT NULL REFERENCES companies(id) COMMENT '회사 ID',
    description TEXT COMMENT '프로젝트 설명',
    budget DECIMAL(15, 2) COMMENT '예산',
    pm_id BIGINT REFERENCES users(id) COMMENT 'PM ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_project_type CHECK (project_type IN ('SI', 'SM')),
    CONSTRAINT chk_project_status CHECK (status IN ('PREPARING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_project_company ON projects(company_id);
CREATE INDEX idx_project_pm ON projects(pm_id);
CREATE INDEX idx_project_status ON projects(status);
CREATE INDEX idx_project_dates ON projects(start_date, end_date);
CREATE INDEX idx_project_deleted ON projects(deleted_at);

COMMENT ON TABLE projects IS 'IT 프로젝트 정보';
COMMENT ON COLUMN projects.project_type IS 'SI: System Integration, SM: System Maintenance';
COMMENT ON COLUMN projects.status IS 'PREPARING: 준비, IN_PROGRESS: 진행중, COMPLETED: 완료, CANCELLED: 취소';
```

#### 9. service_requests (SR)
서비스 요청 정보

```sql
CREATE TABLE service_requests (
    id BIGSERIAL PRIMARY KEY,
    sr_number VARCHAR(20) NOT NULL UNIQUE COMMENT 'SR 번호',
    title VARCHAR(200) NOT NULL COMMENT 'SR 제목',
    sr_type VARCHAR(20) NOT NULL COMMENT 'SR 유형',
    sr_category VARCHAR(50) NOT NULL COMMENT 'SR 분류',
    status VARCHAR(20) NOT NULL COMMENT 'SR 상태',
    business_requirement TEXT NOT NULL COMMENT '비즈니스 요구사항',
    project_id BIGINT NOT NULL REFERENCES projects(id) COMMENT '프로젝트 ID',
    requester_id BIGINT NOT NULL REFERENCES users(id) COMMENT '요청자 ID',
    requester_dept_id BIGINT REFERENCES departments(id) COMMENT '요청부서 ID',
    request_date DATE NOT NULL COMMENT '요청일',
    due_date DATE COMMENT '희망 완료일',
    priority VARCHAR(20) DEFAULT 'MEDIUM' COMMENT '우선순위',
    release_date DATE COMMENT '릴리즈일',
    release_number VARCHAR(50) COMMENT '릴리즈 번호',
    spec_id BIGINT REFERENCES specifications(id) COMMENT 'SPEC ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_sr_type CHECK (sr_type IN ('DEVELOPMENT', 'OPERATION')),
    CONSTRAINT chk_sr_status CHECK (status IN ('APPROVAL_REQUESTED', 'APPROVAL_PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    CONSTRAINT chk_sr_priority CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW'))
);

CREATE UNIQUE INDEX idx_sr_number ON service_requests(sr_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_sr_project ON service_requests(project_id);
CREATE INDEX idx_sr_requester ON service_requests(requester_id);
CREATE INDEX idx_sr_dept ON service_requests(requester_dept_id);
CREATE INDEX idx_sr_status ON service_requests(status);
CREATE INDEX idx_sr_type ON service_requests(sr_type);
CREATE INDEX idx_sr_request_date ON service_requests(request_date);
CREATE INDEX idx_sr_deleted ON service_requests(deleted_at);

COMMENT ON TABLE service_requests IS '서비스 요청(SR) 정보';
COMMENT ON COLUMN service_requests.sr_type IS 'DEVELOPMENT: 개발, OPERATION: 운영';
COMMENT ON COLUMN service_requests.sr_category IS '개발: AP개발, 운영: 자료요청/데이터변경요청/데이터검증요청/업무지원요청';
```

#### 10. sr_files (SR 첨부파일)
SR에 첨부된 파일 정보

```sql
CREATE TABLE sr_files (
    id BIGSERIAL PRIMARY KEY,
    sr_id BIGINT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE COMMENT 'SR ID',
    original_filename VARCHAR(255) NOT NULL COMMENT '원본 파일명',
    stored_filename VARCHAR(255) NOT NULL COMMENT '저장된 파일명',
    file_path VARCHAR(500) NOT NULL COMMENT '파일 경로',
    file_size BIGINT NOT NULL COMMENT '파일 크기 (bytes)',
    content_type VARCHAR(100) COMMENT 'MIME 타입',
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '업로드 일시',
    uploaded_by VARCHAR(50) NOT NULL COMMENT '업로드자'
);

CREATE INDEX idx_sr_files_sr ON sr_files(sr_id);
CREATE INDEX idx_sr_files_uploaded ON sr_files(uploaded_at);

COMMENT ON TABLE sr_files IS 'SR 첨부파일 정보';
```

#### 11. specifications (SPEC)
기능 명세서 정보

```sql
CREATE TABLE specifications (
    id BIGSERIAL PRIMARY KEY,
    spec_number VARCHAR(20) NOT NULL UNIQUE COMMENT 'SPEC 번호',
    sr_id BIGINT NOT NULL REFERENCES service_requests(id) COMMENT 'SR ID',
    spec_type VARCHAR(20) NOT NULL COMMENT 'SPEC 유형',
    spec_category VARCHAR(20) NOT NULL COMMENT 'SPEC 분류',
    status VARCHAR(20) NOT NULL COMMENT 'SPEC 상태',
    function_point DECIMAL(10, 2) COMMENT '기능점수 (FP)',
    man_day DECIMAL(10, 2) COMMENT '공수 (MD)',
    assignee_id BIGINT REFERENCES users(id) COMMENT '담당자 ID',
    reviewer_id BIGINT REFERENCES users(id) COMMENT '검토자 ID',
    started_at TIMESTAMP COMMENT '작업 시작일시',
    completed_at TIMESTAMP COMMENT '작업 완료일시',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_spec_type CHECK (spec_type IN ('DEVELOPMENT', 'OPERATION')),
    CONSTRAINT chk_spec_category CHECK (spec_category IN ('ACCEPTED', 'CANCELLED')),
    CONSTRAINT chk_spec_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'APPROVAL_PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'))
);

CREATE UNIQUE INDEX idx_spec_number ON specifications(spec_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_spec_sr ON specifications(sr_id);
CREATE INDEX idx_spec_assignee ON specifications(assignee_id);
CREATE INDEX idx_spec_status ON specifications(status);
CREATE INDEX idx_spec_deleted ON specifications(deleted_at);

COMMENT ON TABLE specifications IS '기능 명세서(SPEC) 정보';
COMMENT ON COLUMN specifications.function_point IS '기능점수 (Function Point)';
COMMENT ON COLUMN specifications.man_day IS '공수 (Man-Day)';
```

#### 12. spec_files (SPEC 첨부파일)
SPEC에 첨부된 파일 정보

```sql
CREATE TABLE spec_files (
    id BIGSERIAL PRIMARY KEY,
    spec_id BIGINT NOT NULL REFERENCES specifications(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(50) NOT NULL
);

CREATE INDEX idx_spec_files_spec ON spec_files(spec_id);

COMMENT ON TABLE spec_files IS 'SPEC 첨부파일 정보';
```

#### 13. approvals (승인)
승인 요청 정보

```sql
CREATE TABLE approvals (
    id BIGSERIAL PRIMARY KEY,
    approval_number VARCHAR(20) NOT NULL UNIQUE COMMENT '승인 번호',
    approval_type VARCHAR(20) NOT NULL COMMENT '승인 유형',
    target_id BIGINT NOT NULL COMMENT '대상 ID',
    status VARCHAR(20) NOT NULL COMMENT '승인 상태',
    current_step INT NOT NULL DEFAULT 1 COMMENT '현재 단계',
    total_steps INT NOT NULL COMMENT '전체 단계 수',
    requester_id BIGINT NOT NULL REFERENCES users(id) COMMENT '요청자 ID',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '요청일시',
    completed_at TIMESTAMP COMMENT '완료일시',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_approval_type CHECK (approval_type IN ('SR', 'SPEC', 'RELEASE', 'DATA_EXTRACTION')),
    CONSTRAINT chk_approval_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
);

CREATE UNIQUE INDEX idx_approval_number ON approvals(approval_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_approval_type_target ON approvals(approval_type, target_id);
CREATE INDEX idx_approval_requester ON approvals(requester_id);
CREATE INDEX idx_approval_status ON approvals(status);
CREATE INDEX idx_approval_deleted ON approvals(deleted_at);

COMMENT ON TABLE approvals IS '승인 요청 정보';
COMMENT ON COLUMN approvals.approval_type IS 'SR: SR 승인, SPEC: SPEC 승인, RELEASE: 릴리즈 승인';
COMMENT ON COLUMN approvals.target_id IS 'approval_type에 따른 대상 테이블의 ID';
```

#### 14. approval_lines (승인라인)
승인 단계별 승인자 정보

```sql
CREATE TABLE approval_lines (
    id BIGSERIAL PRIMARY KEY,
    approval_id BIGINT NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
    step_order INT NOT NULL COMMENT '승인 순서',
    approver_id BIGINT NOT NULL REFERENCES users(id) COMMENT '승인자 ID',
    status VARCHAR(20) NOT NULL COMMENT '승인 상태',
    comment TEXT COMMENT '승인/반려 코멘트',
    approved_at TIMESTAMP COMMENT '승인/반려 일시',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_approval_line_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX idx_approval_line_approval ON approval_lines(approval_id);
CREATE INDEX idx_approval_line_approver ON approval_lines(approver_id);
CREATE INDEX idx_approval_line_status ON approval_lines(status);

COMMENT ON TABLE approval_lines IS '승인라인 정보';
COMMENT ON COLUMN approval_lines.step_order IS '승인 순서 (1, 2, 3, ...)';
```

---

### Phase 3: 확장 기능 테이블

#### 15. issues (이슈)
개발 이슈 관리

```sql
CREATE TABLE issues (
    id BIGSERIAL PRIMARY KEY,
    issue_number VARCHAR(20) NOT NULL UNIQUE COMMENT '이슈 번호',
    sr_id BIGINT REFERENCES service_requests(id) COMMENT 'SR ID',
    spec_id BIGINT REFERENCES specifications(id) COMMENT 'SPEC ID',
    title VARCHAR(200) NOT NULL COMMENT '이슈 제목',
    content TEXT NOT NULL COMMENT '이슈 내용',
    status VARCHAR(20) NOT NULL COMMENT '이슈 상태',
    assignee_id BIGINT REFERENCES users(id) COMMENT '담당자 ID',
    reporter_id BIGINT NOT NULL REFERENCES users(id) COMMENT '보고자 ID',
    parent_issue_id BIGINT REFERENCES issues(id) COMMENT '원이슈 번호',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_issue_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))
);

CREATE UNIQUE INDEX idx_issue_number ON issues(issue_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_issue_sr ON issues(sr_id);
CREATE INDEX idx_issue_spec ON issues(spec_id);
CREATE INDEX idx_issue_assignee ON issues(assignee_id);
CREATE INDEX idx_issue_reporter ON issues(reporter_id);
CREATE INDEX idx_issue_status ON issues(status);
CREATE INDEX idx_issue_deleted ON issues(deleted_at);

COMMENT ON TABLE issues IS '개발 이슈 정보';
```

#### 16. releases (릴리즈)
릴리즈 관리

```sql
CREATE TABLE releases (
    id BIGSERIAL PRIMARY KEY,
    release_number VARCHAR(20) NOT NULL UNIQUE COMMENT '릴리즈 번호',
    title VARCHAR(200) NOT NULL COMMENT '릴리즈 제목',
    release_type VARCHAR(20) NOT NULL COMMENT '릴리즈 유형',
    status VARCHAR(20) NOT NULL COMMENT '릴리즈 상태',
    content TEXT COMMENT '릴리즈 내용',
    requester_id BIGINT NOT NULL REFERENCES users(id) COMMENT '요청자 ID',
    requester_dept_id BIGINT REFERENCES departments(id) COMMENT '요청부서 ID',
    approver_id BIGINT REFERENCES users(id) COMMENT '승인자 ID',
    scheduled_at TIMESTAMP COMMENT '예정일시',
    deployed_at TIMESTAMP COMMENT '배포일시',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_release_type CHECK (release_type IN ('EMERGENCY', 'REGULAR')),
    CONSTRAINT chk_release_status CHECK (status IN ('REQUESTED', 'APPROVED', 'DEPLOYED', 'CANCELLED'))
);

CREATE UNIQUE INDEX idx_release_number ON releases(release_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_release_type ON releases(release_type);
CREATE INDEX idx_release_status ON releases(status);
CREATE INDEX idx_release_scheduled ON releases(scheduled_at);
CREATE INDEX idx_release_deleted ON releases(deleted_at);

COMMENT ON TABLE releases IS '릴리즈 정보';
COMMENT ON COLUMN releases.release_type IS 'EMERGENCY: 긴급, REGULAR: 정기';
```

#### 17. incidents (장애)
장애/인시던트 관리

```sql
CREATE TABLE incidents (
    id BIGSERIAL PRIMARY KEY,
    incident_number VARCHAR(20) NOT NULL UNIQUE COMMENT '장애 번호',
    title VARCHAR(200) NOT NULL COMMENT '장애명',
    incident_type VARCHAR(20) NOT NULL COMMENT '장애 구분',
    system_type VARCHAR(50) NOT NULL COMMENT '장애 시스템',
    business_area VARCHAR(50) COMMENT '장애 업무구분',
    severity VARCHAR(20) NOT NULL COMMENT '긴급도',
    status VARCHAR(20) NOT NULL COMMENT '처리 상태',
    description TEXT NOT NULL COMMENT '장애 내용',
    occurred_at TIMESTAMP NOT NULL COMMENT '장애 발생시간',
    detected_at TIMESTAMP COMMENT '장애 감지시간',
    resolved_at TIMESTAMP COMMENT '처리시간',
    resolution TEXT COMMENT '처리결과',
    assignee_id BIGINT REFERENCES users(id) COMMENT '처리자 ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_incident_type CHECK (incident_type IN ('INCIDENT', 'FAILURE')),
    CONSTRAINT chk_incident_system CHECK (system_type IN ('PROGRAM', 'DATA', 'SERVER', 'NETWORK', 'PC')),
    CONSTRAINT chk_incident_severity CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
    CONSTRAINT chk_incident_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))
);

CREATE UNIQUE INDEX idx_incident_number ON incidents(incident_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_incident_type ON incidents(incident_type);
CREATE INDEX idx_incident_severity ON incidents(severity);
CREATE INDEX idx_incident_status ON incidents(status);
CREATE INDEX idx_incident_occurred ON incidents(occurred_at);
CREATE INDEX idx_incident_deleted ON incidents(deleted_at);

COMMENT ON TABLE incidents IS '장애/인시던트 정보';
COMMENT ON COLUMN incidents.severity IS 'HIGH: 상, MEDIUM: 중, LOW: 하';
```

#### 18. partners (파트너사)
협력업체 관리

```sql
CREATE TABLE partners (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE COMMENT '파트너 코드',
    name VARCHAR(100) NOT NULL COMMENT '회사명',
    business_number VARCHAR(20) NOT NULL UNIQUE COMMENT '사업자번호',
    ceo_name VARCHAR(50) COMMENT '대표이사',
    address VARCHAR(200) COMMENT '주소',
    phone_number VARCHAR(20) COMMENT '전화번호',
    is_closed BOOLEAN DEFAULT false COMMENT '폐업여부',
    closed_at DATE COMMENT '폐업일자',
    manager_id BIGINT REFERENCES users(id) COMMENT '관리담당자 ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_partner_code ON partners(code);
CREATE INDEX idx_partner_manager ON partners(manager_id);
CREATE INDEX idx_partner_deleted ON partners(deleted_at);

COMMENT ON TABLE partners IS '파트너사 정보';
```

#### 19. assets (자산)
IT 자산 관리

```sql
CREATE TABLE assets (
    id BIGSERIAL PRIMARY KEY,
    asset_number VARCHAR(20) NOT NULL UNIQUE COMMENT '자산번호',
    asset_type VARCHAR(50) NOT NULL COMMENT '자산유형',
    serial_number VARCHAR(100) COMMENT '일련번호',
    model_name VARCHAR(100) COMMENT '모델명',
    manufacturer VARCHAR(50) COMMENT '제조사',
    acquired_at DATE NOT NULL COMMENT '등록일자',
    is_expired BOOLEAN DEFAULT false COMMENT '사용만료여부',
    expired_at DATE COMMENT '만료일자',
    manager_id BIGINT REFERENCES users(id) COMMENT '관리담당자 ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_asset_number ON assets(asset_number);
CREATE INDEX idx_asset_type ON assets(asset_type);
CREATE INDEX idx_asset_manager ON assets(manager_id);
CREATE INDEX idx_asset_deleted ON assets(deleted_at);

COMMENT ON TABLE assets IS 'IT 자산 정보';
COMMENT ON COLUMN assets.asset_type IS 'PC, LAPTOP, MONITOR, SERVER, PRINTER 등';
```

#### 20. notifications (알림)
알림 발송 이력

```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    notification_type VARCHAR(20) NOT NULL COMMENT '알림 유형',
    recipient VARCHAR(100) NOT NULL COMMENT '수신자',
    subject VARCHAR(200) COMMENT '제목',
    message TEXT NOT NULL COMMENT '메시지',
    status VARCHAR(20) NOT NULL COMMENT '발송 상태',
    sent_at TIMESTAMP COMMENT '발송일시',
    error_message TEXT COMMENT '오류 메시지',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    CONSTRAINT chk_notification_type CHECK (notification_type IN ('SMS', 'EMAIL', 'PUSH')),
    CONSTRAINT chk_notification_status CHECK (status IN ('PENDING', 'SENT', 'FAILED'))
);

CREATE INDEX idx_notification_type ON notifications(notification_type);
CREATE INDEX idx_notification_status ON notifications(status);
CREATE INDEX idx_notification_created ON notifications(created_at);

COMMENT ON TABLE notifications IS '알림 발송 이력';
```

#### 21. batch_jobs (배치 작업)
배치 작업 정보

```sql
CREATE TABLE batch_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Job 이름',
    description VARCHAR(200) COMMENT 'Job 설명',
    cron_expression VARCHAR(50) NOT NULL COMMENT 'Cron 표현식',
    is_active BOOLEAN DEFAULT true COMMENT '활성화 여부',
    last_executed_at TIMESTAMP COMMENT '마지막 실행일시',
    last_status VARCHAR(20) COMMENT '마지막 실행 상태',
    last_error_message TEXT COMMENT '마지막 오류 메시지',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_batch_job_status CHECK (last_status IN ('SUCCESS', 'FAILED', 'RUNNING'))
);

CREATE INDEX idx_batch_job_active ON batch_jobs(is_active);
CREATE INDEX idx_batch_job_deleted ON batch_jobs(deleted_at);

COMMENT ON TABLE batch_jobs IS '배치 작업 정보';
COMMENT ON COLUMN batch_jobs.cron_expression IS 'Quartz Cron 표현식 (예: 0 0 2 * * ?)';
```

#### 22. batch_job_histories (배치 실행 이력)
배치 작업 실행 이력

```sql
CREATE TABLE batch_job_histories (
    id BIGSERIAL PRIMARY KEY,
    batch_job_id BIGINT NOT NULL REFERENCES batch_jobs(id),
    started_at TIMESTAMP NOT NULL COMMENT '시작일시',
    completed_at TIMESTAMP COMMENT '완료일시',
    status VARCHAR(20) NOT NULL COMMENT '실행 상태',
    error_message TEXT COMMENT '오류 메시지',
    processed_count INT DEFAULT 0 COMMENT '처리 건수',
    CONSTRAINT chk_batch_history_status CHECK (status IN ('SUCCESS', 'FAILED', 'RUNNING'))
);

CREATE INDEX idx_batch_history_job ON batch_job_histories(batch_job_id);
CREATE INDEX idx_batch_history_started ON batch_job_histories(started_at);

COMMENT ON TABLE batch_job_histories IS '배치 작업 실행 이력';
```

---

## 🔍 인덱스 전략 요약

### 자주 사용되는 조회 패턴
1. **사용자 조회**: email, company_id
2. **SR 조회**: project_id, status, request_date
3. **SPEC 조회**: sr_id, status, assignee_id
4. **승인 조회**: approval_type + target_id, status
5. **장애 조회**: occurred_at, severity, status

### 복합 인덱스 권장
```sql
-- SR 조회 최적화
CREATE INDEX idx_sr_project_status ON service_requests(project_id, status) 
WHERE deleted_at IS NULL;

-- SPEC 조회 최적화
CREATE INDEX idx_spec_status_assignee ON specifications(status, assignee_id) 
WHERE deleted_at IS NULL;

-- 승인 대기 건 조회 최적화
CREATE INDEX idx_approval_line_pending ON approval_lines(approver_id, status) 
WHERE status = 'PENDING';
```

---

## 📈 성능 최적화 고려사항

### 1. 파티셔닝
대용량 테이블에 대한 파티셔닝 고려 (향후 적용)
```sql
-- 예시: service_requests를 연도별로 파티셔닝
CREATE TABLE service_requests_2024 PARTITION OF service_requests
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 2. Materialized View (통계 데이터)
자주 조회되는 통계 데이터는 Materialized View 활용
```sql
CREATE MATERIALIZED VIEW mv_sr_statistics AS
SELECT 
    project_id,
    sr_type,
    status,
    COUNT(*) as total_count,
    DATE_TRUNC('month', request_date) as month
FROM service_requests
WHERE deleted_at IS NULL
GROUP BY project_id, sr_type, status, DATE_TRUNC('month', request_date);

CREATE INDEX idx_mv_sr_stats_project ON mv_sr_statistics(project_id);
```

### 3. Full Text Search
텍스트 검색 최적화
```sql
-- SR 제목/내용 전문 검색
ALTER TABLE service_requests 
ADD COLUMN search_vector tsvector;

CREATE INDEX idx_sr_search ON service_requests USING GIN(search_vector);

-- 자동 업데이트 트리거
CREATE TRIGGER trig_sr_search_vector_update 
BEFORE INSERT OR UPDATE ON service_requests
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.korean', title, business_requirement);
```

---

## 🔒 보안 고려사항

### 1. Row-Level Security (RLS)
회사별 데이터 격리 (필요 시 적용)
```sql
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_isolation_policy ON service_requests
FOR ALL
TO authenticated_users
USING (project_id IN (
    SELECT id FROM projects WHERE company_id = current_user_company_id()
));
```

### 2. 민감 정보 암호화
- 비밀번호: BCrypt (Application Layer)
- 개인정보: PG Crypto 확장 모듈 활용 가능

---

## 📊 데이터 마이그레이션 전략 (Flyway)

### 버전 관리
```
/src/main/resources/db/migration/
├── V1.0.0__create_companies_table.sql
├── V1.0.1__create_departments_table.sql
├── V1.0.2__create_roles_table.sql
├── V1.0.3__create_users_table.sql
├── V1.0.4__create_user_roles_table.sql
├── V1.0.5__create_menus_table.sql
├── V1.0.6__create_menu_permissions_table.sql
├── V2.0.0__create_projects_table.sql
├── V2.0.1__create_service_requests_table.sql
├── V2.0.2__create_sr_files_table.sql
...
```

### 초기 데이터 (Seed Data)
```sql
-- V99.0.0__insert_initial_data.sql

-- 기본 회사 정보
INSERT INTO companies (code, name, business_number, created_by) VALUES
('COMP001', 'ARIS 본사', '123-45-67890', 'system');

-- 기본 역할
INSERT INTO roles (name, description, role_type, created_by) VALUES
('ROLE_ADMIN', '시스템 관리자', 'SYSTEM', 'system'),
('ROLE_PM', 'PM', 'SYSTEM', 'system'),
('ROLE_DEVELOPER', '개발자', 'SYSTEM', 'system');

-- 관리자 계정 (비밀번호: admin123)
INSERT INTO users (email, password, name, company_id, is_active, is_approved, created_by) VALUES
('admin@aris.com', '$2a$10$...', 'Admin', 1, true, true, 'system');
```

---

## ✅ 체크리스트

### Phase 1
- [x] companies 테이블 생성
- [x] departments 테이블 생성
- [x] roles 테이블 생성
- [x] users 테이블 생성
- [x] user_roles 테이블 생성
- [x] menus 테이블 생성
- [x] menu_permissions 테이블 생성

### Phase 2
- [x] projects 테이블 생성
- [x] service_requests 테이블 생성
- [x] sr_files 테이블 생성
- [x] specifications 테이블 생성
- [x] spec_files 테이블 생성
- [x] approvals 테이블 생성
- [x] approval_lines 테이블 생성

### Phase 3
- [x] issues 테이블 생성
- [x] releases 테이블 생성
- [x] incidents 테이블 생성
- [x] partners 테이블 생성
- [x] assets 테이블 생성
- [x] notifications 테이블 생성
- [x] batch_jobs 테이블 생성
- [x] batch_job_histories 테이블 생성

---

**Last Updated**: 2025-10-15
**Document Version**: 1.0.0









