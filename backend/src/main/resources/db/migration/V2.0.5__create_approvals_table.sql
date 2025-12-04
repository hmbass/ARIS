-- V2.0.5: Create approvals table

CREATE TABLE approvals (
    id BIGSERIAL PRIMARY KEY,
    approval_number VARCHAR(20) NOT NULL UNIQUE,
    approval_type VARCHAR(20) NOT NULL CHECK (approval_type IN ('SR', 'SPEC', 'RELEASE', 'DATA_EXTRACTION')),
    target_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
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

-- Indexes
CREATE UNIQUE INDEX idx_approval_number ON approvals(approval_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_approval_type_target ON approvals(approval_type, target_id);
CREATE INDEX idx_approval_requester ON approvals(requester_id);
CREATE INDEX idx_approval_status ON approvals(status);
CREATE INDEX idx_approval_deleted ON approvals(deleted_at);

-- Comments
COMMENT ON TABLE approvals IS '승인 요청 정보';
COMMENT ON COLUMN approvals.approval_number IS '승인 번호 (자동 채번, 예: APP2501-0001)';
COMMENT ON COLUMN approvals.approval_type IS 'SR: SR 승인, SPEC: SPEC 승인, RELEASE: 릴리즈 승인, DATA_EXTRACTION: 데이터추출 승인';
COMMENT ON COLUMN approvals.target_id IS 'approval_type에 따른 대상 테이블의 ID (polymorphic)';
COMMENT ON COLUMN approvals.status IS 'PENDING: 승인대기, APPROVED: 승인완료, REJECTED: 반려, CANCELLED: 취소';
COMMENT ON COLUMN approvals.current_step IS '현재 승인 단계';
COMMENT ON COLUMN approvals.total_steps IS '전체 승인 단계 수';









