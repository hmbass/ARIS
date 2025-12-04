-- 사용자-역할 매핑 테이블 생성
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    granted_by VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role_id)
);

-- 인덱스 생성
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- 코멘트 추가
COMMENT ON TABLE user_roles IS '사용자-역할 매핑 테이블 (N:M)';
COMMENT ON COLUMN user_roles.granted_at IS '역할 부여 일시';
COMMENT ON COLUMN user_roles.granted_by IS '역할 부여자';









