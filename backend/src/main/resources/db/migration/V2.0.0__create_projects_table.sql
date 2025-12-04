-- V2.0.0: Create projects table

CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    project_type VARCHAR(20) NOT NULL CHECK (project_type IN ('SI', 'SM')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PREPARING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    start_date DATE NOT NULL,
    end_date DATE,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    description TEXT,
    budget DECIMAL(15, 2),
    pm_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- Indexes
CREATE UNIQUE INDEX idx_project_code ON projects(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_company ON projects(company_id);
CREATE INDEX idx_project_pm ON projects(pm_id);
CREATE INDEX idx_project_status ON projects(status);
CREATE INDEX idx_project_dates ON projects(start_date, end_date);
CREATE INDEX idx_project_deleted ON projects(deleted_at);

-- Comments
COMMENT ON TABLE projects IS 'IT 프로젝트 정보';
COMMENT ON COLUMN projects.code IS '프로젝트 코드 (예: PJ2025001)';
COMMENT ON COLUMN projects.project_type IS 'SI: System Integration, SM: System Maintenance';
COMMENT ON COLUMN projects.status IS 'PREPARING: 준비, IN_PROGRESS: 진행중, COMPLETED: 완료, CANCELLED: 취소';
COMMENT ON COLUMN projects.pm_id IS 'PM (Project Manager) 사용자 ID';









