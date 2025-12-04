-- V2.0.3: Create specifications table

CREATE TABLE specifications (
    id BIGSERIAL PRIMARY KEY,
    spec_number VARCHAR(20) NOT NULL UNIQUE,
    sr_id BIGINT NOT NULL REFERENCES service_requests(id),
    spec_type VARCHAR(20) NOT NULL CHECK (spec_type IN ('DEVELOPMENT', 'OPERATION')),
    spec_category VARCHAR(20) NOT NULL CHECK (spec_category IN ('ACCEPTED', 'CANCELLED')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'APPROVAL_PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')),
    function_point DECIMAL(10, 2),
    man_day DECIMAL(10, 2),
    assignee_id BIGINT REFERENCES users(id),
    reviewer_id BIGINT REFERENCES users(id),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- Indexes
CREATE UNIQUE INDEX idx_spec_number ON specifications(spec_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_spec_sr ON specifications(sr_id);
CREATE INDEX idx_spec_assignee ON specifications(assignee_id);
CREATE INDEX idx_spec_reviewer ON specifications(reviewer_id);
CREATE INDEX idx_spec_status ON specifications(status);
CREATE INDEX idx_spec_deleted ON specifications(deleted_at);

-- Comments
COMMENT ON TABLE specifications IS '기능 명세서(SPEC) 정보';
COMMENT ON COLUMN specifications.spec_number IS 'SPEC 번호 (자동 채번, 예: SPEC2501-0001)';
COMMENT ON COLUMN specifications.spec_type IS 'DEVELOPMENT: 개발, OPERATION: 운영';
COMMENT ON COLUMN specifications.spec_category IS 'ACCEPTED: 접수, CANCELLED: 취소';
COMMENT ON COLUMN specifications.status IS 'PENDING: 대기, IN_PROGRESS: 진행중, APPROVAL_PENDING: 승인대기, APPROVED: 승인, REJECTED: 반려, COMPLETED: 완료';
COMMENT ON COLUMN specifications.function_point IS '기능점수 (Function Point)';
COMMENT ON COLUMN specifications.man_day IS '공수 (Man-Day)';
COMMENT ON COLUMN specifications.assignee_id IS '담당자 ID';
COMMENT ON COLUMN specifications.reviewer_id IS '검토자 ID';









