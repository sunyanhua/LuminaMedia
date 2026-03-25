-- LuminaMedia 微信全案字段迁移脚本（简化版）
-- 版本: 1.0
-- 描述: 添加 wechat_full_plan 字段到 marketing_strategies 表
-- 执行时间: 2026-03-25

USE lumina_media;

-- 检查 marketing_strategies 表是否存在
SELECT IF(COUNT(*) > 0, 'marketing_strategies table exists', 'marketing_strategies table does not exist') AS table_status
FROM information_schema.tables
WHERE table_schema = 'lumina_media'
AND table_name = 'marketing_strategies';

-- 添加字段的函数（通过条件判断）
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'marketing_strategies');

-- 如果表存在，逐个添加字段
SET @sql = '';
IF @table_exists > 0 THEN
    -- campaign_name
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'campaign_name');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN campaign_name VARCHAR(255) COMMENT '活动名称（冗余存储）' AFTER generated_by;
    END IF;

    -- target_audience_analysis
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'target_audience_analysis');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN target_audience_analysis JSON COMMENT '目标受众分析（JSON格式）' AFTER campaign_name;
    END IF;

    -- core_idea
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'core_idea');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN core_idea TEXT COMMENT '核心创意理念' AFTER target_audience_analysis;
    END IF;

    -- xhs_content
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'xhs_content');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN xhs_content TEXT COMMENT '小红书文案内容' AFTER core_idea;
    END IF;

    -- wechat_full_plan (核心新增字段)
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'wechat_full_plan');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN wechat_full_plan JSON COMMENT '微信全案深度方案（JSON格式）' AFTER xhs_content;
    END IF;

    -- recommended_execution_time
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'recommended_execution_time');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN recommended_execution_time JSON COMMENT '推荐执行时间（JSON格式）' AFTER wechat_full_plan;
    END IF;

    -- expected_performance_metrics
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'expected_performance_metrics');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN expected_performance_metrics JSON COMMENT '预期性能指标（JSON格式）' AFTER recommended_execution_time;
    END IF;

    -- execution_steps
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'execution_steps');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN execution_steps JSON COMMENT '执行步骤（JSON格式）' AFTER expected_performance_metrics;
    END IF;

    -- risk_assessment
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'risk_assessment');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN risk_assessment JSON COMMENT '风险评估（JSON格式）' AFTER execution_steps;
    END IF;

    -- budget_allocation
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'budget_allocation');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN budget_allocation JSON COMMENT '预算分配（JSON格式）' AFTER risk_assessment;
    END IF;

    -- ai_response_raw
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'ai_response_raw');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN ai_response_raw TEXT COMMENT 'AI原始响应（JSON字符串）' AFTER budget_allocation;
    END IF;

    -- ai_engine
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'ai_engine');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN ai_engine ENUM('QWEN', 'GEMINI', 'FALLBACK') COMMENT '使用的AI引擎' AFTER ai_response_raw;
    END IF;

    -- generated_content_ids
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'generated_content_ids');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN generated_content_ids JSON COMMENT '生成的内容ID数组' AFTER ai_engine;
    END IF;

    -- content_platforms
    SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns
                          WHERE table_schema = 'lumina_media'
                          AND table_name = 'marketing_strategies'
                          AND column_name = 'content_platforms');
    IF @column_exists = 0 THEN
        ALTER TABLE marketing_strategies ADD COLUMN content_platforms JSON COMMENT '内容发布平台数组' AFTER generated_content_ids;
    END IF;

    SELECT '所有字段迁移完成' AS migration_status;
ELSE
    SELECT 'marketing_strategies 表不存在，请先运行基础迁移脚本' AS migration_warning;
END IF;