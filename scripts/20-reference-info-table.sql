-- LuminaMedia 参考信息表迁移脚本
-- 版本: 1.0
-- 描述: 创建reference_infos表，存储每日抓取的政策资讯等参考信息
-- 执行时间: 2026-04-06
-- 关联版本: v19.0 (3.1 DEMO细节推进版 Phase 2)

USE lumina_media;

-- 检查reference_infos表是否存在，不存在则创建
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'reference_infos');

SELECT IF(@table_exists > 0, 'reference_infos table already exists', 'creating reference_infos table') AS table_status;

-- 创建表的SQL语句
SET @sql_create_table = IF(@table_exists = 0,
    'CREATE TABLE reference_infos (
        id VARCHAR(36) NOT NULL,
        tenant_id VARCHAR(36) DEFAULT \'default-tenant\',
        created_by VARCHAR(36) DEFAULT NULL,
        title VARCHAR(500) NOT NULL,
        summary TEXT DEFAULT NULL,
        content LONGTEXT DEFAULT NULL,
        source_url VARCHAR(2000) DEFAULT NULL,
        source_name VARCHAR(200) DEFAULT NULL,
        publish_time TIMESTAMP NULL DEFAULT NULL,
        relevance INT DEFAULT 0,
        is_adopted TINYINT(1) DEFAULT 0,
        status ENUM(\'new\', \'adopted\', \'modified\', \'ignored\') DEFAULT \'new\',
        adopted_at TIMESTAMP NULL DEFAULT NULL,
        adopted_by VARCHAR(36) DEFAULT NULL,
        modification_notes TEXT DEFAULT NULL,
        generated_content LONGTEXT DEFAULT NULL,
        ignore_reason VARCHAR(500) DEFAULT NULL,
        metadata JSON DEFAULT NULL,
        keywords JSON DEFAULT NULL,
        category VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id),
        INDEX idx_tenant_id (tenant_id),
        INDEX idx_status (status),
        INDEX idx_publish_time (publish_time),
        INDEX idx_relevance (relevance),
        INDEX idx_is_adopted (is_adopted),
        CONSTRAINT fk_reference_infos_tenant_id FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;',
    'SELECT \'reference_infos table already exists, skipping\' AS result;');

PREPARE stmt_create_table FROM @sql_create_table;
EXECUTE stmt_create_table;
DEALLOCATE PREPARE stmt_create_table;

-- 显示表结构
DESCRIBE reference_infos;

-- 显示索引信息
SHOW INDEX FROM reference_infos;