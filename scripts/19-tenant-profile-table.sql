-- LuminaMedia 租户画像表创建迁移脚本
-- 版本: 1.0
-- 描述: 创建tenant_profiles表，存储单位画像信息
-- 执行时间: 2026-04-06
-- 关联版本: v19.0 (3.1 DEMO细节推进版 Phase 2 Day 6)

USE lumina_media;

-- 检查tenant_profiles表是否存在，不存在则创建
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'tenant_profiles');

SELECT IF(@table_exists > 0, 'tenant_profiles table already exists', 'creating tenant_profiles table') AS table_status;

-- 如果表不存在，创建表
SET @sql_create_table = IF(@table_exists = 0, '
CREATE TABLE tenant_profiles (
  id VARCHAR(36) NOT NULL PRIMARY KEY COMMENT \'主键ID\',
  tenant_id VARCHAR(36) NOT NULL COMMENT \'租户ID\',
  positioning ENUM(\'authoritative\', \'people_friendly\', \'professional\', \'innovative\', \'service_oriented\', \'other\') DEFAULT NULL COMMENT \'形象定位\',
  positioning_description TEXT DEFAULT NULL COMMENT \'形象定位描述\',
  positioning_tags JSON DEFAULT NULL COMMENT \'形象定位标签(JSON数组)\',
  language_style ENUM(\'formal\', \'concise\', \'vivid\', \'persuasive\', \'popular\', \'professional\', \'other\') DEFAULT NULL COMMENT \'语言风格\',
  language_style_description TEXT DEFAULT NULL COMMENT \'语言风格描述\',
  language_style_examples JSON DEFAULT NULL COMMENT \'语言风格示例(JSON数组)\',
  visual_preference ENUM(\'minimalist\', \'modern\', \'traditional\', \'colorful\', \'gradient\', \'flat\', \'other\') DEFAULT NULL COMMENT \'视觉偏好\',
  visual_preference_detail JSON DEFAULT NULL COMMENT \'视觉偏好详情(JSON)\',
  topic_preference JSON DEFAULT NULL COMMENT \'话题偏好(JSON数组)\',
  publishing_habits JSON DEFAULT NULL COMMENT \'发布习惯详情(JSON)\',
  status ENUM(\'draft\', \'generated\', \'manually_edited\', \'published\') DEFAULT \'draft\' COMMENT \'画像状态\',
  raw_data JSON DEFAULT NULL COMMENT \'AI生成的原始数据(JSON)\',
  generated_at TIMESTAMP DEFAULT NULL COMMENT \'生成时间\',
  last_edited_at TIMESTAMP DEFAULT NULL COMMENT \'最后编辑时间\',
  last_edited_by VARCHAR(36) DEFAULT NULL COMMENT \'编辑者\',
  version INT DEFAULT 1 COMMENT \'版本号\',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT \'创建时间\',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT \'更新时间\',
  deleted_at TIMESTAMP DEFAULT NULL COMMENT \'软删除时间\',
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_generated_at (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=\'租户画像表\';
', '
SELECT \'tenant_profiles table already exists, skipping\' AS result;
');

PREPARE stmt_create_table FROM @sql_create_table;
EXECUTE stmt_create_table;
DEALLOCATE PREPARE stmt_create_table;

-- 显示表结构
DESCRIBE tenant_profiles;

-- 显示表创建状态
SELECT COUNT(*) as table_count FROM information_schema.tables
WHERE table_schema = 'lumina_media'
AND table_name = 'tenant_profiles';