-- V2.0.7: Add foreign key constraint from service_requests to specifications

-- Add foreign key constraint (spec_id references specifications table)
ALTER TABLE service_requests
ADD CONSTRAINT fk_sr_spec
FOREIGN KEY (spec_id) REFERENCES specifications(id);

-- Comment
COMMENT ON COLUMN service_requests.spec_id IS 'SPEC ID (승인된 SR에서 생성된 SPEC)';









