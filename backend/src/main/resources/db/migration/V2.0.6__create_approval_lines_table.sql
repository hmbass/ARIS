-- V2.0.6: Create approval_lines table

CREATE TABLE approval_lines (
    id BIGSERIAL PRIMARY KEY,
    approval_id BIGINT NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    approver_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    comment TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (approval_id, step_order)
);

-- Indexes
CREATE INDEX idx_approval_line_approval ON approval_lines(approval_id);
CREATE INDEX idx_approval_line_approver ON approval_lines(approver_id);
CREATE INDEX idx_approval_line_status ON approval_lines(status);

-- Comments
COMMENT ON TABLE approval_lines IS '승인라인 정보';
COMMENT ON COLUMN approval_lines.step_order IS '승인 순서 (1, 2, 3, ...)';
COMMENT ON COLUMN approval_lines.approver_id IS '승인자 ID';
COMMENT ON COLUMN approval_lines.status IS 'PENDING: 승인대기, APPROVED: 승인, REJECTED: 반려';
COMMENT ON COLUMN approval_lines.comment IS '승인/반려 코멘트';
COMMENT ON COLUMN approval_lines.approved_at IS '승인/반려 일시';









