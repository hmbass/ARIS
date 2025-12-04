-- SYSTEM_ADMIN 역할 추가 및 admin 사용자에게 부여

-- SYSTEM_ADMIN 역할 추가
INSERT INTO roles (name, description, role_type, created_by, updated_by) 
VALUES ('ROLE_SYSTEM_ADMIN', '시스템 최고 관리자', 'SYSTEM', 'system', 'system')
ON CONFLICT (name) DO NOTHING;

-- admin 사용자에게 SYSTEM_ADMIN 역할 부여
INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT 
    u.id,
    r.id,
    'system'
FROM users u, roles r
WHERE u.email = 'admin@aris.com'
  AND r.name = 'ROLE_SYSTEM_ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );



