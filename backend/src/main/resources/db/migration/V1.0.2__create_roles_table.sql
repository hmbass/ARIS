-- 역할/권한 테이블 생성
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200),
    role_type VARCHAR(20) NOT NULL CHECK (role_type IN ('SYSTEM', 'MENU', 'FUNCTION')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- 인덱스 생성
CREATE INDEX idx_role_type ON roles(role_type);
CREATE INDEX idx_role_deleted ON roles(deleted_at);

-- 코멘트 추가
COMMENT ON TABLE roles IS '역할/권한 정보';
COMMENT ON COLUMN roles.role_type IS 'SYSTEM: 시스템 권한, MENU: 메뉴 권한, FUNCTION: 기능 권한';

-- 기본 역할 데이터 삽입
INSERT INTO roles (name, description, role_type, created_by, updated_by) VALUES
('ROLE_ADMIN', '시스템 관리자', 'SYSTEM', 'system', 'system'),
('ROLE_PM', 'PM (Project Manager)', 'SYSTEM', 'system', 'system'),
('ROLE_PL', 'PL (Project Leader)', 'SYSTEM', 'system', 'system'),
('ROLE_DEVELOPER', '개발자', 'SYSTEM', 'system', 'system'),
('ROLE_USER', '일반 사용자', 'SYSTEM', 'system', 'system');









