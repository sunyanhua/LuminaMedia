-- Google Gemini API 集成数据库迁移脚本
-- 为 marketing_strategies 表添加新字段以存储 AI 生成的营销方案

USE lumina_media;

-- 检查表是否存在（安全措施）
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media' AND table_name = 'marketing_strategies');

-- 如果表存在，添加新字段
SET @sql = IF(@table_exists > 0,
    'ALTER TABLE marketing_strategies
    ADD COLUMN IF NOT EXISTS campaign_name VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS target_audience_analysis JSON NULL,
    ADD COLUMN IF NOT EXISTS core_idea TEXT NULL,
    ADD COLUMN IF NOT EXISTS xhs_content TEXT NULL,
    ADD COLUMN IF NOT EXISTS recommended_execution_time JSON NULL,
    ADD COLUMN IF NOT EXISTS expected_performance_metrics JSON NULL,
    ADD COLUMN IF NOT EXISTS execution_steps JSON NULL,
    ADD COLUMN IF NOT EXISTS risk_assessment JSON NULL,
    ADD COLUMN IF NOT EXISTS budget_allocation JSON NULL,
    ADD COLUMN IF NOT EXISTS ai_response_raw TEXT NULL;',
    'SELECT "marketing_strategies table does not exist, skipping migration" as status;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 验证字段添加成功
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM information_schema.columns
WHERE table_schema = 'lumina_media'
    AND table_name = 'marketing_strategies'
    AND COLUMN_NAME IN (
        'campaign_name',
        'target_audience_analysis',
        'core_idea',
        'xhs_content',
        'recommended_execution_time',
        'expected_performance_metrics',
        'execution_steps',
        'risk_assessment',
        'budget_allocation',
        'ai_response_raw'
    )
ORDER BY ORDINAL_POSITION;