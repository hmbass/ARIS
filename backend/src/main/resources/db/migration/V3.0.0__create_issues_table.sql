-- Phase 3: 이슈 관리 테이블 생성
CREATE TABLE issues (
    id BIGSERIAL PRIMARY KEY,
    issue_number VARCHAR(20) NOT NULL UNIQUE,
    sr_id BIGINT REFERENCES service_requests(id),
    spec_id BIGINT REFERENCES specifications(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    assignee_id BIGINT REFERENCES users(id),
    reporter_id BIGINT NOT NULL REFERENCES users(id),
    parent_issue_id BIGINT REFERENCES issues(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_issue_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))
);

CREATE INDEX idx_issue_number ON issues(issue_number);
CREATE INDEX idx_issue_sr ON issues(sr_id);
CREATE INDEX idx_issue_spec ON issues(spec_id);
CREATE INDEX idx_issue_assignee ON issues(assignee_id);
CREATE INDEX idx_issue_reporter ON issues(reporter_id);
CREATE INDEX idx_issue_status ON issues(status);
CREATE INDEX idx_issue_deleted ON issues(deleted_at);

COMMENT ON TABLE issues IS '이슈 정보';
COMMENT ON COLUMN issues.status IS 'OPEN: 열림, IN_PROGRESS: 진행중, RESOLVED: 해결됨, CLOSED: 닫힘';









