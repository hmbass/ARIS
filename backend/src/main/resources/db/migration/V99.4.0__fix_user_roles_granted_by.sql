-- user_roles 테이블의 granted_by 컬럼에 기본값 추가
-- JPA @ManyToMany 사용 시 추가 컬럼 값 설정이 어려우므로 기본값 설정

ALTER TABLE user_roles ALTER COLUMN granted_by SET DEFAULT 'system';

-- 기존 NULL 값이 있으면 업데이트 (혹시 모를 경우 대비)
UPDATE user_roles SET granted_by = 'system' WHERE granted_by IS NULL;

COMMENT ON COLUMN user_roles.granted_by IS '역할 부여자 (기본값: system)';




