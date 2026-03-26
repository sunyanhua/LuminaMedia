-- LuminaMedia 2.0 多租户数据隔离迁移脚本
-- 版本: 1.0
-- 描述: 为所有核心表添加tenant_id字段，建立数据隔离基础
-- 执行时间: 2026-03-26
-- 关联任务: 第一阶段任务2.1 - tenant_id字段添加

USE lumina_media;

-- 设置默认租户ID
SET @default_tenant_id = 'default-tenant';

-- 1. customer_profiles表
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'customer_profiles');

SELECT IF(@table_exists > 0, 'Adding tenant_id to customer_profiles table', 'customer_profiles table does not exist, skipping') AS table_status;

-- 如果表存在，添加tenant_id字段
SET @sql = IF(@table_exists > 0,
    CONCAT('ALTER TABLE customer_profiles
            ADD COLUMN tenant_id CHAR(36) NOT NULL DEFAULT \'', @default_tenant_id, '\',
            ADD INDEX idx_customer_profiles_tenant_id (tenant_id);

            -- 更新现有数据，分配默认租户
            UPDATE customer_profiles SET tenant_id = \'', @default_tenant_id, '\' WHERE tenant_id IS NULL;

            SELECT \'customer_profiles table updated successfully\' AS result;'),
    'SELECT \'customer_profiles table does not exist, skipping\' AS result;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. marketing_strategies表
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'marketing_strategies');

SELECT IF(@table_exists > 0, 'Adding tenant_id to marketing_strategies table', 'marketing_strategies table does not exist, skipping') AS table_status;

SET @sql = IF(@table_exists > 0,
    CONCAT('ALTER TABLE marketing_strategies
            ADD COLUMN tenant_id CHAR(36) NOT NULL DEFAULT \'', @default_tenant_id, '\',
            ADD INDEX idx_marketing_strategies_tenant_id (tenant_id);

            UPDATE marketing_strategies SET tenant_id = \'', @default_tenant_id, '\' WHERE tenant_id IS NULL;

            SELECT \'marketing_strategies table updated successfully\' AS result;'),
    'SELECT \'marketing_strategies table does not exist, skipping\' AS result;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. content_drafts表
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'content_drafts');

SELECT IF(@table_exists > 0, 'Adding tenant_id to content_drafts table', 'content_drafts table does not exist, skipping') AS table_status;

SET @sql = IF(@table_exists > 0,
    CONCAT('ALTER TABLE content_drafts
            ADD COLUMN tenant_id CHAR(36) NOT NULL DEFAULT \'', @default_tenant_id, '\',
            ADD INDEX idx_content_drafts_tenant_id (tenant_id);

            UPDATE content_drafts SET tenant_id = \'', @default_tenant_id, '\' WHERE tenant_id IS NULL;

            SELECT \'content_drafts table updated successfully\' AS result;'),
    'SELECT \'content_drafts table does not exist, skipping\' AS result;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. social_accounts表
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'social_accounts');

SELECT IF(@table_exists > 0, 'Adding tenant_id to social_accounts table', 'social_accounts table does not exist, skipping') AS table_status;

SET @sql = IF(@table_exists > 0,
    CONCAT('ALTER TABLE social_accounts
            ADD COLUMN tenant_id CHAR(36) NOT NULL DEFAULT \'', @default_tenant_id, '\',
            ADD INDEX idx_social_accounts_tenant_id (tenant_id);

            UPDATE social_accounts SET tenant_id = \'', @default_tenant_id, '\' WHERE tenant_id IS NULL;

            SELECT \'social_accounts table updated successfully\' AS result;'),
    'SELECT \'social_accounts table does not exist, skipping\' AS result;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. publish_tasks表
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'publish_tasks');

SELECT IF(@table_exists > 0, 'Adding tenant_id to publish_tasks table', 'publish_tasks table does not exist, skipping') AS table_status;

SET @sql = IF(@table_exists > 0,
    CONCAT('ALTER TABLE publish_tasks
            ADD COLUMN tenant_id CHAR(36) NOT NULL DEFAULT \'', @default_tenant_id, '\',
            ADD INDEX idx_publish_tasks_tenant_id (tenant_id);

            UPDATE publish_tasks SET tenant_id = \'', @default_tenant_id, '\' WHERE tenant_id IS NULL;

            SELECT \'publish_tasks table updated successfully\' AS result;'),
    'SELECT \'publish_tasks table does not exist, skipping\' AS result;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. analytics_reports表（可能不存在，检查后处理）
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'analytics_reports');

SELECT IF(@table_exists > 0, 'Adding tenant_id to analytics_reports table', 'analytics_reports table does not exist, skipping') AS table_status;

SET @sql = IF(@table_exists > 0,
    CONCAT('ALTER TABLE analytics_reports
            ADD COLUMN tenant_id CHAR(36) NOT NULL DEFAULT \'', @default_tenant_id, '\',
            ADD INDEX idx_analytics_reports_tenant_id (tenant_id);

            UPDATE analytics_reports SET tenant_id = \'', @default_tenant_id, '\' WHERE tenant_id IS NULL;

            SELECT \'analytics_reports table updated successfully\' AS result;'),
    'SELECT \'analytics_reports table does not exist, skipping\' AS result;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 显示迁移结果
SELECT 'Tenant ID migration completed' AS migration_status;
SELECT
    table_name,
    IF(column_name = 'tenant_id', 'tenant_id column exists', 'tenant_id column missing') AS column_status
FROM information_schema.columns
WHERE table_schema = 'lumina_media'
    AND table_name IN ('users', 'customer_profiles', 'marketing_strategies', 'content_drafts', 'social_accounts', 'publish_tasks', 'analytics_reports')
    AND column_name = 'tenant_id'
UNION ALL
SELECT '---', '---'
UNION ALL
SELECT 'Total tables with tenant_id', COUNT(DISTINCT table_name)
FROM information_schema.columns
WHERE table_schema = 'lumina_media'
    AND table_name IN ('users', 'customer_profiles', 'marketing_strategies', 'content_drafts', 'social_accounts', 'publish_tasks', 'analytics_reports')
    AND column_name = 'tenant_id';