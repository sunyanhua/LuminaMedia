-- LuminaMedia RBAC系统简化初始化脚本
-- 版本: 1.0
-- 描述: 创建角色权限管理系统相关表结构（简化版，避免动态SQL）
-- 执行时间: 2026-04-04

USE lumina_media;

-- 1. 创建roles表（如果不存在）
CREATE TABLE IF NOT EXISTS roles (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    tenant_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_roles_tenant_id (tenant_id),
    INDEX idx_roles_name (name),
    UNIQUE KEY uk_roles_name_tenant (name, tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认角色（如果不存在）
INSERT IGNORE INTO roles (id, name, description, tenant_id) VALUES
    (UUID(), 'admin', '系统管理员，拥有所有权限', 'default-tenant'),
    (UUID(), 'editor', '编辑人员，可以创建和修改内容', 'default-tenant'),
    (UUID(), 'viewer', '查看人员，只能查看内容', 'default-tenant');

SELECT 'roles table initialized' AS result;

-- 2. 创建permissions表（如果不存在）
CREATE TABLE IF NOT EXISTS permissions (
    id CHAR(36) PRIMARY KEY,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    tenant_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_permissions_tenant_id (tenant_id),
    INDEX idx_permissions_module (module),
    INDEX idx_permissions_action (action),
    UNIQUE KEY uk_permissions_module_action_tenant (module, action, tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入基础权限（如果不存在）
INSERT IGNORE INTO permissions (id, module, action, description, tenant_id) VALUES
    (UUID(), 'user', 'read', '查看用户信息', 'default-tenant'),
    (UUID(), 'user', 'write', '创建/修改用户', 'default-tenant'),
    (UUID(), 'user', 'delete', '删除用户', 'default-tenant'),
    (UUID(), 'content', 'read', '查看内容', 'default-tenant'),
    (UUID(), 'content', 'write', '创建/修改内容', 'default-tenant'),
    (UUID(), 'content', 'publish', '发布内容', 'default-tenant'),
    (UUID(), 'tenant', 'manage', '管理租户', 'default-tenant'),
    (UUID(), 'role', 'manage', '管理角色', 'default-tenant');

SELECT 'permissions table initialized' AS result;

-- 3. 创建role_permissions表（如果不存在）
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    INDEX idx_role_permissions_role_id (role_id),
    INDEX idx_role_permissions_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 为admin角色分配所有权限
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin' AND r.tenant_id = 'default-tenant'
ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

-- 为editor角色分配内容相关权限
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'editor' AND r.tenant_id = 'default-tenant'
AND p.module IN ('content') AND p.action IN ('read', 'write', 'publish')
ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

-- 为viewer角色分配只读权限
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'viewer' AND r.tenant_id = 'default-tenant'
AND p.action = 'read'
ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

SELECT 'role_permissions table initialized' AS result;

-- 4. 创建user_roles表（如果不存在）
CREATE TABLE IF NOT EXISTS user_roles (
    user_id CHAR(36) NOT NULL,
    role_id CHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tenant_id CHAR(36) NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX idx_user_roles_user_id (user_id),
    INDEX idx_user_roles_role_id (role_id),
    INDEX idx_user_roles_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 为默认admin用户分配admin角色（如果admin用户存在）
INSERT IGNORE INTO user_roles (user_id, role_id, tenant_id)
SELECT u.id, r.id, 'default-tenant'
FROM users u, roles r
WHERE u.username = 'admin' AND u.tenant_id = 'default-tenant'
AND r.name = 'admin' AND r.tenant_id = 'default-tenant'
ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

SELECT 'user_roles table initialized' AS result;

-- 5. 显示创建的表结构
DESCRIBE roles;
DESCRIBE permissions;
DESCRIBE role_permissions;
DESCRIBE user_roles;

-- 6. 显示初始化数据
SELECT '=== 角色列表 ===' AS info;
SELECT id, name, description, tenant_id, created_at FROM roles;

SELECT '=== 权限列表 ===' AS info;
SELECT id, module, action, description, tenant_id, created_at FROM permissions;

SELECT '=== 角色权限分配 ===' AS info;
SELECT r.name AS role_name, p.module, p.action, rp.assigned_at
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.module, p.action;

SELECT '=== 用户角色分配 ===' AS info;
SELECT u.username, r.name AS role_name, ur.assigned_at
FROM user_roles ur
JOIN users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
ORDER BY u.username;

SELECT '=== RBAC系统初始化完成 ===' AS completion_message;