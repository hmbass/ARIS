-- V2.0.1: Create service_requests table

CREATE TABLE service_requests (
    id BIGSERIAL PRIMARY KEY,
    sr_number VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    sr_type VARCHAR(20) NOT NULL CHECK (sr_type IN ('DEVELOPMENT', 'OPERATION')),
    sr_category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('APPROVAL_REQUESTED', 'APPROVAL_PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    business_requirement TEXT NOT NULL,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    requester_id BIGINT NOT NULL REFERENCES users(id),
    requester_dept_id BIGINT REFERENCES departments(id),
    request_date DATE NOT NULL,
    due_date DATE,
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    release_date DATE,
    release_number VARCHAR(50),
    spec_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- Indexes
CREATE UNIQUE INDEX idx_sr_number ON service_requests(sr_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_sr_project ON service_requests(project_id);
CREATE INDEX idx_sr_requester ON service_requests(requester_id);
CREATE INDEX idx_sr_dept ON service_requests(requester_dept_id);
CREATE INDEX idx_sr_status ON service_requests(status);
CREATE INDEX idx_sr_type ON service_requests(sr_type);
CREATE INDEX idx_sr_request_date ON service_requests(request_date);
CREATE INDEX idx_sr_deleted ON service_requests(deleted_at);
CREATE INDEX idx_sr_spec ON service_requests(spec_id);

-- Comments
COMMENT ON TABLE service_requests IS '서비스 요청(SR) 정보';
COMMENT ON COLUMN service_requests.sr_number IS 'SR 번호 (자동 채번, 예: SR2501-0001)';
COMMENT ON COLUMN service_requests.sr_type IS 'DEVELOPMENT: 개발, OPERATION: 운영';
COMMENT ON COLUMN service_requests.sr_category IS '개발: AP개발 | 운영: 자료요청, 데이터변경요청, 데이터검증요청, 업무지원요청, 데이터추출요청, 정기업무';
COMMENT ON COLUMN service_requests.status IS 'APPROVAL_REQUESTED: 승인요청, APPROVAL_PENDING: 승인대기, APPROVED: 승인, REJECTED: 반려, CANCELLED: 취소';









