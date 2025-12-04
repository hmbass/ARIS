-- 회사 테이블 생성
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    business_number VARCHAR(20) NOT NULL UNIQUE,
    ceo_name VARCHAR(50),
    address VARCHAR(200),
    phone_number VARCHAR(20),
    is_closed BOOLEAN NOT NULL DEFAULT false,
    closed_at DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- 인덱스 생성
CREATE INDEX idx_company_code ON companies(code);
CREATE INDEX idx_company_business_number ON companies(business_number);
CREATE INDEX idx_company_deleted ON companies(deleted_at);

-- 코멘트 추가
COMMENT ON TABLE companies IS '회사 정보';
COMMENT ON COLUMN companies.code IS '회사 코드 (예: COMP001)';
COMMENT ON COLUMN companies.business_number IS '사업자등록번호';
COMMENT ON COLUMN companies.is_closed IS '폐업 여부';









