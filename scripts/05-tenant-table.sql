-- LuminaMedia 多租户支持：创建tenants表
-- 版本: 1.0
-- 描述: 创建tenants表用于多租户隔离
-- 执行时间: 2026-03-26
-- 关联版本: v15.0 (2.0重构第一阶段)

USE lumina_media;

-- 检查tenants表是否已存在
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'tenants');

SELECT IF(@table_exists > 0, 'tenants table already exists', 'creating tenants table') AS table_status;

-- 如果表不存在，创建表
SET @sql = IF(@table_exists = 0,
    'CREATE TABLE tenants (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        status ENUM(\'active\', \'suspended\', \'pending\') DEFAULT \'active\',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- 为name字段添加索引以便快速查找
    CREATE INDEX idx_tenants_name ON tenants(name);

    -- 为status字段添加索引以便过滤
    CREATE INDEX idx_tenants_status ON tenants(status);

    -- 插入默认租户（如果不存在）
    INSERT IGNORE INTO tenants (id, name, status) VALUES (\'default-tenant\', \'默认租户\', \'active\');

    SELECT \'tenants table created successfully\' AS result;',
    'SELECT \'tenants table already exists, skipping creation\' AS result;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 显示当前tenants表结构
DESCRIBE tenants;