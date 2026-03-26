-- LuminaMedia RBAC系统初始化脚本
-- 版本: 1.0
-- 描述: 创建角色权限管理系统相关表结构
-- 执行时间: 2026-03-26
-- 关联版本: v15.0 (2.0重构第一阶段)

USE lumina_media;

-- 检查roles表是否已存在
SET @roles_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'roles');

SELECT IF(@roles_exists > 0, 'roles table already exists', 'creating roles table') AS table_status;

-- 如果roles表不存在，创建表
SET @sql_roles = IF(@roles_exists = 0,
    'CREATE TABLE roles (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        tenant_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_roles_tenant_id (tenant_id),
        INDEX idx_roles_name (name),
        UNIQUE KEY uk_roles_name_tenant (name, tenant_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- 插入默认角色
    INSERT INTO roles (id, name, description, tenant_id) VALUES
        (UUID(), \'admin\', \'系统管理员，拥有所有权限\', \'default-tenant\'),
        (UUID(), \'editor\', \'编辑人员，可以创建和修改内容\', \'default-tenant\'),
        (UUID(), \'viewer\', \'查看人员，只能查看内容\', \'default-tenant\');

    SELECT \'roles table created successfully\' AS result;',
    'SELECT \'roles table already exists, skipping creation\' AS result;');

PREPARE stmt_roles FROM @sql_roles;
EXECUTE stmt_roles;
DEALLOCATE PREPARE stmt_roles;

-- 检查permissions表是否已存在
SET @permissions_exists = (SELECT COUNT(*) FROM information_schema.tables
                           WHERE table_schema = 'lumina_media'
                           AND table_name = 'permissions');

SELECT IF(@permissions_exists > 0, 'permissions table already exists', 'creating permissions table') AS table_status;

-- 如果permissions表不存在，创建表
SET @sql_permissions = IF(@permissions_exists = 0,
    'CREATE TABLE permissions (
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

    -- 插入基础权限
    INSERT INTO permissions (id, module, action, description, tenant_id) VALUES
        (UUID(), \'user\', \'read\', \'查看用户信息\', \'default-tenant\'),
        (UUID(), \'user\', \'write\', \'创建/修改用户\', \'default-tenant\'),
        (UUID(), \'user\', \'delete\', \'删除用户\', \'default-tenant\'),
        (UUID(), \'content\', \'read\', \'查看内容\', \'default-tenant\'),
        (UUID(), \'content\', \'write\', \'创建/修改内容\', \'default-tenant\'),
        (UUID(), \'content\', \'publish\', \'发布内容\', \'default-tenant\'),
        (UUID(), \'tenant\', \'manage\', \'管理租户\', \'default-tenant\'),
        (UUID(), \'role\', \'manage\', \'管理角色\', \'default-tenant\');

    SELECT \'permissions table created successfully\' AS result;',
    'SELECT \'permissions table already exists, skipping creation\' AS result;');

PREPARE stmt_permissions FROM @sql_permissions;
EXECUTE stmt_permissions;
DEALLOCATE PREPARE stmt_permissions;

-- 检查role_permissions表是否已存在
SET @role_permissions_exists = (SELECT COUNT(*) FROM information_schema.tables
                                WHERE table_schema = 'lumina_media'
                                AND table_name = 'role_permissions');

SELECT IF(@role_permissions_exists > 0, 'role_permissions table already exists', 'creating role_permissions table') AS table_status;

-- 如果role_permissions表不存在，创建表
SET @sql_role_permissions = IF(@role_permissions_exists = 0,
    'CREATE TABLE role_permissions (
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
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r, permissions p
    WHERE r.name = \'admin\' AND r.tenant_id = \'default-tenant\'
    ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

    -- 为editor角色分配内容相关权限
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r, permissions p
    WHERE r.name = \'editor\' AND r.tenant_id = \'default-tenant\'
    AND p.module IN (\'content\') AND p.action IN (\'read\', \'write\', \'publish\')
    ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

    -- 为viewer角色分配只读权限
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r, permissions p
    WHERE r.name = \'viewer\' AND r.tenant_id = \'default-tenant\'
    AND p.action = \'read\'
    ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

    SELECT \'role_permissions table created successfully\' AS result;',
    'SELECT \'role_permissions table already exists, skipping creation\' AS result;');

PREPARE stmt_role_permissions FROM @sql_role_permissions;
EXECUTE stmt_role_permissions;
DEALLOCATE PREPARE stmt_role_permissions;

-- 检查user_roles表是否已存在
SET @user_roles_exists = (SELECT COUNT(*) FROM information_schema.tables
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'user_roles');

SELECT IF(@user_roles_exists > 0, 'user_roles table already exists', 'creating user_roles table') AS table_status;

-- 如果user_roles表不存在，创建表
SET @sql_user_roles = IF(@user_roles_exists = 0,
    'CREATE TABLE user_roles (
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
    INSERT INTO user_roles (user_id, role_id, tenant_id)
    SELECT u.id, r.id, \'default-tenant\'
    FROM users u, roles r
    WHERE u.username = \'admin\' AND u.tenant_id = \'default-tenant\'
    AND r.name = \'admin\' AND r.tenant_id = \'default-tenant\'
    ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

    SELECT \'user_roles table created successfully\' AS result;',
    'SELECT \'user_roles table already exists, skipping creation\' AS result;');

PREPARE stmt_user_roles FROM @sql_user_roles;
EXECUTE stmt_user_roles;
DEALLOCATE PREPARE stmt_user_roles;

-- 显示创建的表结构
DESCRIBE roles;
DESCRIBE permissions;
DESCRIBE role_permissions;
DESCRIBE user_roles;

-- 显示初始化数据
SELECT \'=== 角色列表 ===\' AS info;
SELECT id, name, description, tenant_id, created_at FROM roles;

SELECT \'=== 权限列表 ===\' AS info;
SELECT id, module, action, description, tenant_id, created_at FROM permissions;

SELECT \'=== 角色权限分配 ===\' AS info;
SELECT r.name AS role_name, p.module, p.action, rp.assigned_at
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.module, p.action;

SELECT \'=== 用户角色分配 ===\' AS info;
SELECT u.username, r.name AS role_name, ur.assigned_at
FROM user_roles ur
JOIN users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
ORDER BY u.username;