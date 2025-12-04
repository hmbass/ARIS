-- 사용자 테이블 생성
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20),
    company_id BIGINT NOT NULL REFERENCES companies(id),
    department_id BIGINT REFERENCES departments(id),
    employee_number VARCHAR(20),
    position VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    resigned_at DATE,
    last_login_at TIMESTAMP,
    password_changed_at TIMESTAMP,
    failed_login_count INT NOT NULL DEFAULT 0,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- 인덱스 생성
CREATE UNIQUE INDEX idx_user_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_company ON users(company_id);
CREATE INDEX idx_user_department ON users(department_id);
CREATE INDEX idx_user_active ON users(is_active);
CREATE INDEX idx_user_deleted ON users(deleted_at);

-- 코멘트 추가
COMMENT ON TABLE users IS '사용자 정보';
COMMENT ON COLUMN users.email IS '이메일 주소 (로그인 ID)';
COMMENT ON COLUMN users.password IS 'BCrypt 암호화된 비밀번호';
COMMENT ON COLUMN users.failed_login_count IS '로그인 실패 횟수 (5회 이상 시 계정 잠금)';
COMMENT ON COLUMN users.is_locked IS '계정 잠금 여부';









