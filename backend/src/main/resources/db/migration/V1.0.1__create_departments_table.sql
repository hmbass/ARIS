-- 부서/파트 테이블 생성
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    name VARCHAR(50) NOT NULL,
    parent_id BIGINT REFERENCES departments(id),
    depth INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- 인덱스 생성
CREATE INDEX idx_dept_company ON departments(company_id);
CREATE INDEX idx_dept_parent ON departments(parent_id);
CREATE INDEX idx_dept_deleted ON departments(deleted_at);

-- 코멘트 추가
COMMENT ON TABLE departments IS '부서/파트 정보 (계층 구조)';
COMMENT ON COLUMN departments.depth IS '0: 본부, 1: 팀, 2: 파트';
COMMENT ON COLUMN departments.parent_id IS '상위 부서 ID';









