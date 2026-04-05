-- LuminaMedia 用户实体更新迁移脚本
-- 版本: 1.0
-- 描述: 为users表添加phone、status字段，添加tenant外键约束
-- 执行时间: 2026-04-05
-- 关联版本: v19.0 (3.1 DEMO细节推进版 Phase 1)

USE lumina_media;

-- 检查phone列是否存在，不存在则添加
SET @phone_exists = (SELECT COUNT(*) FROM information_schema.columns
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'users'
                     AND column_name = 'phone');

SELECT IF(@phone_exists > 0, 'phone column already exists', 'adding phone column') AS column_status;

SET @sql_phone = IF(@phone_exists = 0,
    'ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER email;',
    'SELECT \'phone column already exists, skipping\' AS result;');

PREPARE stmt_phone FROM @sql_phone;
EXECUTE stmt_phone;
DEALLOCATE PREPARE stmt_phone;

-- 检查status列是否存在，不存在则添加
SET @status_exists = (SELECT COUNT(*) FROM information_schema.columns
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'users'
                     AND column_name = 'status');

SELECT IF(@status_exists > 0, 'status column already exists', 'adding status column') AS column_status;

SET @sql_status = IF(@status_exists = 0,
    'ALTER TABLE users ADD COLUMN status ENUM(\'active\', \'inactive\', \'suspended\') DEFAULT \'active\' AFTER phone;',
    'SELECT \'status column already exists, skipping\' AS result;');

PREPARE stmt_status FROM @sql_status;
EXECUTE stmt_status;
DEALLOCATE PREPARE stmt_status;

-- 检查外键约束是否存在，不存在则添加
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints
                  WHERE table_schema = 'lumina_media'
                  AND table_name = 'users'
                  AND constraint_name = 'fk_users_tenant_id');

SELECT IF(@fk_exists > 0, 'foreign key constraint already exists', 'adding foreign key constraint') AS fk_status;

SET @sql_fk = IF(@fk_exists = 0,
    'ALTER TABLE users ADD CONSTRAINT fk_users_tenant_id FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;',
    'SELECT \'foreign key constraint already exists, skipping\' AS result;');

PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

-- 显示更新后的表结构
DESCRIBE users;

-- 显示外键约束
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'lumina_media'
AND TABLE_NAME = 'users'
AND CONSTRAINT_NAME LIKE 'fk_%';