-- Phase 3: 릴리즈 관리 테이블 생성
CREATE TABLE releases (
    id BIGSERIAL PRIMARY KEY,
    release_number VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    release_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
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
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_release_type CHECK (release_type IN ('EMERGENCY', 'REGULAR')),
    CONSTRAINT chk_release_status CHECK (status IN ('REQUESTED', 'APPROVED', 'DEPLOYED', 'CANCELLED'))
);

CREATE INDEX idx_release_number ON releases(release_number);
CREATE INDEX idx_release_requester ON releases(requester_id);
CREATE INDEX idx_release_approver ON releases(approver_id);
CREATE INDEX idx_release_status ON releases(status);
CREATE INDEX idx_release_type ON releases(release_type);
CREATE INDEX idx_release_deleted ON releases(deleted_at);

COMMENT ON TABLE releases IS '릴리즈 정보';
COMMENT ON COLUMN releases.release_type IS 'EMERGENCY: 긴급, REGULAR: 정기';
COMMENT ON COLUMN releases.status IS 'REQUESTED: 요청됨, APPROVED: 승인됨, DEPLOYED: 배포됨, CANCELLED: 취소됨';









