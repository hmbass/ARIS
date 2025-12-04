-- V2.0.4: Create spec_files table

CREATE TABLE spec_files (
    id BIGSERIAL PRIMARY KEY,
    spec_id BIGINT NOT NULL REFERENCES specifications(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(50) NOT NULL
);

-- Indexes
CREATE INDEX idx_spec_files_spec ON spec_files(spec_id);
CREATE INDEX idx_spec_files_uploaded ON spec_files(uploaded_at);

-- Comments
COMMENT ON TABLE spec_files IS 'SPEC 첨부파일 정보';
COMMENT ON COLUMN spec_files.original_filename IS '원본 파일명';
COMMENT ON COLUMN spec_files.stored_filename IS '저장된 파일명 (UUID 기반)';
COMMENT ON COLUMN spec_files.file_path IS '파일 저장 경로';
COMMENT ON COLUMN spec_files.file_size IS '파일 크기 (bytes)';
COMMENT ON COLUMN spec_files.content_type IS 'MIME 타입';









