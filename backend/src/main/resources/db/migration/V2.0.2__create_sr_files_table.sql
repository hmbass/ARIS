-- V2.0.2: Create sr_files table

CREATE TABLE sr_files (
    id BIGSERIAL PRIMARY KEY,
    sr_id BIGINT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(50) NOT NULL
);

-- Indexes
CREATE INDEX idx_sr_files_sr ON sr_files(sr_id);
CREATE INDEX idx_sr_files_uploaded ON sr_files(uploaded_at);

-- Comments
COMMENT ON TABLE sr_files IS 'SR 첨부파일 정보';
COMMENT ON COLUMN sr_files.original_filename IS '원본 파일명';
COMMENT ON COLUMN sr_files.stored_filename IS '저장된 파일명 (UUID 기반)';
COMMENT ON COLUMN sr_files.file_path IS '파일 저장 경로';
COMMENT ON COLUMN sr_files.file_size IS '파일 크기 (bytes)';
COMMENT ON COLUMN sr_files.content_type IS 'MIME 타입 (예: application/pdf)';









