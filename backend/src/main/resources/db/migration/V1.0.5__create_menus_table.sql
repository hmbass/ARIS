-- 메뉴 테이블 생성
CREATE TABLE menus (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    path VARCHAR(100),
    parent_id BIGINT REFERENCES menus(id),
    depth INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    icon VARCHAR(50),
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- 인덱스 생성
CREATE INDEX idx_menu_parent ON menus(parent_id);
CREATE INDEX idx_menu_visible ON menus(is_visible);
CREATE INDEX idx_menu_deleted ON menus(deleted_at);

-- 코멘트 추가
COMMENT ON TABLE menus IS '시스템 메뉴 정보 (계층 구조)';
COMMENT ON COLUMN menus.depth IS '0: 대메뉴, 1: 중메뉴, 2: 소메뉴';
COMMENT ON COLUMN menus.sort_order IS '정렬 순서';









