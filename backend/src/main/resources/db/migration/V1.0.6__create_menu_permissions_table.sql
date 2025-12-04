-- 메뉴 권한 테이블 생성
CREATE TABLE menu_permissions (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    can_read BOOLEAN NOT NULL DEFAULT true,
    can_create BOOLEAN NOT NULL DEFAULT false,
    can_update BOOLEAN NOT NULL DEFAULT false,
    can_delete BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    UNIQUE (menu_id, role_id)
);

-- 인덱스 생성
CREATE INDEX idx_menu_perm_menu ON menu_permissions(menu_id);
CREATE INDEX idx_menu_perm_role ON menu_permissions(role_id);

-- 코멘트 추가
COMMENT ON TABLE menu_permissions IS '메뉴별 권한 설정';
COMMENT ON COLUMN menu_permissions.can_read IS '조회(R) 권한';
COMMENT ON COLUMN menu_permissions.can_create IS '생성(C) 권한';
COMMENT ON COLUMN menu_permissions.can_update IS '수정(U) 권한';
COMMENT ON COLUMN menu_permissions.can_delete IS '삭제(D) 권한';









