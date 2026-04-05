-- LuminaMedia 政务版DEMO用户初始化脚本
-- 版本: 1.0
-- 描述: 为政务版演示租户(demo-government-001)初始化DEMO用户数据
--       创建editor@demo-gov, manager@demo-gov, legal@demo-gov, admin@demo-gov四个用户
--       并分配对应角色
-- 执行时间: 2026-04-05
-- 关联版本: v19.0 (3.1 DEMO细节推进版 Phase 1)

USE lumina_media;

-- 临时禁用外键约束检查
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 设置变量
-- ============================================================================

SET @tenant_id = '33333333-3333-3333-3333-333333333333';  -- 政务版演示租户ID
SET @default_password_hash = '$2b$10$tPdHoS6o9OBIKB2nsMEhHunw/jcuETYByrVGihx2qvIPn/4s3YtJG';  -- LuminaDemo2026

-- ============================================================================
-- 1. 创建角色（如果不存在）
-- ============================================================================

SELECT '=== 创建/验证角色 ===' AS step;

-- admin 角色
INSERT IGNORE INTO roles (id, name, description, tenant_id) VALUES
    (UUID(), 'admin', '系统管理员，拥有所有权限', @tenant_id);

-- editor 角色
INSERT IGNORE INTO roles (id, name, description, tenant_id) VALUES
    (UUID(), 'editor', '编辑人员，可以创建和修改内容', @tenant_id);

-- manager 角色
INSERT IGNORE INTO roles (id, name, description, tenant_id) VALUES
    (UUID(), 'manager', '主管人员，负责内容审核和团队管理', @tenant_id);

-- legal 角色
INSERT IGNORE INTO roles (id, name, description, tenant_id) VALUES
    (UUID(), 'legal', '法务人员，负责内容合规性终审', @tenant_id);

-- 显示创建的角色
SELECT '✅ 角色创建完成' AS result;
SELECT id, name, description, tenant_id FROM roles WHERE tenant_id = @tenant_id ORDER BY name;

-- ============================================================================
-- 2. 创建DEMO用户
-- ============================================================================

SELECT '=== 创建DEMO用户 ===' AS step;

-- editor@demo-gov 用户 (编辑角色)
INSERT INTO users (id, username, password_hash, email, phone, status, created_at, tenant_id) VALUES
    (UUID(), 'editor@demo-gov', @default_password_hash, 'editor@demo-gov', NULL, 'active', NOW(), @tenant_id)
ON DUPLICATE KEY UPDATE
    username = VALUES(username),
    password_hash = VALUES(password_hash),
    email = VALUES(email),
    phone = VALUES(phone),
    status = VALUES(status),
    tenant_id = VALUES(tenant_id);

-- manager@demo-gov 用户 (主管角色)
INSERT INTO users (id, username, password_hash, email, phone, status, created_at, tenant_id) VALUES
    (UUID(), 'manager@demo-gov', @default_password_hash, 'manager@demo-gov', NULL, 'active', NOW(), @tenant_id)
ON DUPLICATE KEY UPDATE
    username = VALUES(username),
    password_hash = VALUES(password_hash),
    email = VALUES(email),
    phone = VALUES(phone),
    status = VALUES(status),
    tenant_id = VALUES(tenant_id);

-- legal@demo-gov 用户 (法务角色)
INSERT INTO users (id, username, password_hash, email, phone, status, created_at, tenant_id) VALUES
    (UUID(), 'legal@demo-gov', @default_password_hash, 'legal@demo-gov', NULL, 'active', NOW(), @tenant_id)
ON DUPLICATE KEY UPDATE
    username = VALUES(username),
    password_hash = VALUES(password_hash),
    email = VALUES(email),
    phone = VALUES(phone),
    status = VALUES(status),
    tenant_id = VALUES(tenant_id);

-- admin@demo-gov 用户 (管理员角色)
INSERT INTO users (id, username, password_hash, email, phone, status, created_at, tenant_id) VALUES
    (UUID(), 'admin@demo-gov', @default_password_hash, 'admin@demo-gov', NULL, 'active', NOW(), @tenant_id)
ON DUPLICATE KEY UPDATE
    username = VALUES(username),
    password_hash = VALUES(password_hash),
    email = VALUES(email),
    phone = VALUES(phone),
    status = VALUES(status),
    tenant_id = VALUES(tenant_id);

SELECT '✅ DEMO用户创建完成' AS result;

-- 显示创建的用户
SELECT id, username, email, phone, status, tenant_id FROM users
WHERE tenant_id = @tenant_id AND username LIKE '%@demo-gov'
ORDER BY username;

-- ============================================================================
-- 3. 分配用户角色
-- ============================================================================

SELECT '=== 分配用户角色 ===' AS step;

-- editor@demo-gov -> editor角色
INSERT INTO user_roles (user_id, role_id, tenant_id)
SELECT u.id, r.id, @tenant_id
FROM users u, roles r
WHERE u.username = 'editor@demo-gov' AND u.tenant_id = @tenant_id
AND r.name = 'editor' AND r.tenant_id = @tenant_id
ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

-- manager@demo-gov -> manager角色
INSERT INTO user_roles (user_id, role_id, tenant_id)
SELECT u.id, r.id, @tenant_id
FROM users u, roles r
WHERE u.username = 'manager@demo-gov' AND u.tenant_id = @tenant_id
AND r.name = 'manager' AND r.tenant_id = @tenant_id
ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

-- legal@demo-gov -> legal角色
INSERT INTO user_roles (user_id, role_id, tenant_id)
SELECT u.id, r.id, @tenant_id
FROM users u, roles r
WHERE u.username = 'legal@demo-gov' AND u.tenant_id = @tenant_id
AND r.name = 'legal' AND r.tenant_id = @tenant_id
ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

-- admin@demo-gov -> admin角色
INSERT INTO user_roles (user_id, role_id, tenant_id)
SELECT u.id, r.id, @tenant_id
FROM users u, roles r
WHERE u.username = 'admin@demo-gov' AND u.tenant_id = @tenant_id
AND r.name = 'admin' AND r.tenant_id = @tenant_id
ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

-- admin@demo-gov 也分配editor角色（管理员也应具有编辑权限）
INSERT INTO user_roles (user_id, role_id, tenant_id)
SELECT u.id, r.id, @tenant_id
FROM users u, roles r
WHERE u.username = 'admin@demo-gov' AND u.tenant_id = @tenant_id
AND r.name = 'editor' AND r.tenant_id = @tenant_id
ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

SELECT '✅ 用户角色分配完成' AS result;

-- 显示用户角色分配
SELECT '=== 用户角色分配结果 ===' AS info;
SELECT u.username, r.name AS role_name, ur.assigned_at
FROM user_roles ur
JOIN users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
WHERE u.tenant_id = @tenant_id AND u.username LIKE '%@demo-gov'
ORDER BY u.username, r.name;

-- ============================================================================
-- 4. 验证数据
-- ============================================================================

SELECT '=== 数据验证 ===' AS step;

SELECT '租户用户统计:' AS verification;
SELECT COUNT(*) AS user_count FROM users WHERE tenant_id = @tenant_id;
SELECT COUNT(*) AS demo_user_count FROM users WHERE tenant_id = @tenant_id AND username LIKE '%@demo-gov';

SELECT '角色统计:' AS verification;
SELECT COUNT(*) AS role_count FROM roles WHERE tenant_id = @tenant_id;

SELECT '用户角色关联统计:' AS verification;
SELECT COUNT(*) AS user_role_count FROM user_roles WHERE tenant_id = @tenant_id;

SELECT '✅ 政务版DEMO用户初始化完成' AS final_result;

-- 恢复外键约束检查
SET FOREIGN_KEY_CHECKS = 1;