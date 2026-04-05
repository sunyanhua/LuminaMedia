-- LuminaMedia 知识库文档表更新迁移脚本
-- 版本: 1.0
-- 描述: 为knowledge_documents表添加file_type字段，更新分类枚举约束
-- 执行时间: 2026-04-06
-- 关联版本: v19.0 (3.1 DEMO细节推进版 Phase 2)

USE lumina_media;

-- 检查file_type列是否存在，不存在则添加
SET @file_type_exists = (SELECT COUNT(*) FROM information_schema.columns
                         WHERE table_schema = 'lumina_media'
                         AND table_name = 'knowledge_documents'
                         AND column_name = 'file_type');

SELECT IF(@file_type_exists > 0, 'file_type column already exists', 'adding file_type column') AS column_status;

SET @sql_file_type = IF(@file_type_exists = 0,
    'ALTER TABLE knowledge_documents ADD COLUMN file_type ENUM(\'word\', \'pdf\', \'markdown\', \'web_page\', \'other\') DEFAULT NULL AFTER source_url;',
    'SELECT \'file_type column already exists, skipping\' AS result;');

PREPARE stmt_file_type FROM @sql_file_type;
EXECUTE stmt_file_type;
DEALLOCATE PREPARE stmt_file_type;

-- 更新现有记录的file_type（基于file_info中的mime_type或source_type）
-- 如果source_type为'file'且file_info中的mime_type包含特定关键字，设置对应的file_type
UPDATE knowledge_documents
SET file_type = CASE
    WHEN source_type = 'file' AND JSON_EXTRACT(file_info, '$.mimeType') LIKE '%word%' THEN 'word'
    WHEN source_type = 'file' AND JSON_EXTRACT(file_info, '$.mimeType') LIKE '%pdf%' THEN 'pdf'
    WHEN source_type = 'file' AND JSON_EXTRACT(file_info, '$.mimeType') LIKE '%markdown%' THEN 'markdown'
    WHEN source_type = 'url' THEN 'web_page'
    ELSE 'other'
END
WHERE file_type IS NULL;

-- 显示更新后的表结构
DESCRIBE knowledge_documents;

-- 显示file_type分布
SELECT
    file_type,
    COUNT(*) as count
FROM knowledge_documents
GROUP BY file_type
ORDER BY count DESC;