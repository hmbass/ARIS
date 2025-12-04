-- Phase 3: 장애 관리 테이블 생성
CREATE TABLE incidents (
    id BIGSERIAL PRIMARY KEY,
    incident_number VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    incident_type VARCHAR(20) NOT NULL,
    system_type VARCHAR(50) NOT NULL,
    business_area VARCHAR(50),
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    resolution TEXT,
    assignee_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_incident_type CHECK (incident_type IN ('INCIDENT', 'FAILURE')),
    CONSTRAINT chk_incident_system_type CHECK (system_type IN ('PROGRAM', 'DATA', 'SERVER', 'NETWORK', 'PC')),
    CONSTRAINT chk_incident_severity CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
    CONSTRAINT chk_incident_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))
);

CREATE INDEX idx_incident_number ON incidents(incident_number);
CREATE INDEX idx_incident_assignee ON incidents(assignee_id);
CREATE INDEX idx_incident_status ON incidents(status);
CREATE INDEX idx_incident_severity ON incidents(severity);
CREATE INDEX idx_incident_occurred ON incidents(occurred_at);
CREATE INDEX idx_incident_deleted ON incidents(deleted_at);

COMMENT ON TABLE incidents IS '장애 정보';
COMMENT ON COLUMN incidents.incident_type IS 'INCIDENT: 인시던트, FAILURE: 장애';
COMMENT ON COLUMN incidents.system_type IS 'PROGRAM: 프로그램, DATA: 데이터, SERVER: 서버, NETWORK: 네트워크, PC: PC';
COMMENT ON COLUMN incidents.severity IS 'HIGH: 높음, MEDIUM: 중간, LOW: 낮음';
COMMENT ON COLUMN incidents.status IS 'OPEN: 열림, IN_PROGRESS: 진행중, RESOLVED: 해결됨, CLOSED: 닫힘';









