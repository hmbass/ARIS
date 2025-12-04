-- Phase 3: 자산 관리 테이블 생성
CREATE TABLE assets (
    id BIGSERIAL PRIMARY KEY,
    asset_number VARCHAR(20) NOT NULL UNIQUE,
    asset_type VARCHAR(50) NOT NULL,
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
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_asset_type CHECK (asset_type IN ('PC', 'LAPTOP', 'MONITOR', 'SERVER', 'NETWORK', 'PRINTER', 'OTHER'))
);

CREATE INDEX idx_asset_number ON assets(asset_number);
CREATE INDEX idx_asset_type ON assets(asset_type);
CREATE INDEX idx_asset_manager ON assets(manager_id);
CREATE INDEX idx_asset_expired ON assets(is_expired);
CREATE INDEX idx_asset_deleted ON assets(deleted_at);

COMMENT ON TABLE assets IS 'IT 자산 정보';
COMMENT ON COLUMN assets.asset_type IS 'PC, LAPTOP, MONITOR, SERVER, NETWORK, PRINTER, OTHER';
COMMENT ON COLUMN assets.is_expired IS 'true: 폐기, false: 사용중';









