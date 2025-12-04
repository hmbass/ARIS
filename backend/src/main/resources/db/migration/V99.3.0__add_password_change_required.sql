-- 초기 비밀번호 변경 필요 플래그 추가

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_change_required BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN users.password_change_required IS '초기 비밀번호 변경 필요 여부';

-- 신규 생성된 사용자는 초기 비밀번호 변경 필요
-- (admin 계정은 제외)



