-- Phase 3: 파트너 관리 테이블 생성
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

CREATE INDEX idx_partner_code ON partners(code);
CREATE INDEX idx_partner_business_number ON partners(business_number);
CREATE INDEX idx_partner_manager ON partners(manager_id);
CREATE INDEX idx_partner_closed ON partners(is_closed);
CREATE INDEX idx_partner_deleted ON partners(deleted_at);

COMMENT ON TABLE partners IS '파트너 정보';
COMMENT ON COLUMN partners.is_closed IS 'true: 폐업, false: 운영중';









