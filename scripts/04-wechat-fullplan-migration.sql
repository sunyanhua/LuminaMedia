-- LuminaMedia 微信全案字段迁移脚本
-- 版本: 1.0
-- 描述: 添加 wechat_full_plan 字段到 marketing_strategies 表
-- 执行时间: 2026-03-25
-- 关联版本: v13.57 重构营销专家提示词实现"千人千面"深度全案

USE lumina_media;

-- 创建添加字段的存储过程（如果不存在）
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS add_column_if_not_exists(
    IN p_table_name VARCHAR(64),
    IN p_column_name VARCHAR(64),
    IN p_column_definition VARCHAR(255)
)
BEGIN
    DECLARE v_column_exists INT;

    SELECT COUNT(*) INTO v_column_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = p_table_name
    AND column_name = p_column_name;

    IF v_column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', p_table_name, ' ADD COLUMN ', p_column_name, ' ', p_column_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('Added column ', p_column_name, ' to ', p_table_name) AS result;
    ELSE
        SELECT CONCAT('Column ', p_column_name, ' already exists in ', p_table_name) AS result;
    END IF;
END$$
DELIMITER ;

-- 检查 marketing_strategies 表是否存在
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'marketing_strategies');

SELECT IF(@table_exists > 0, 'marketing_strategies table exists', 'marketing_strategies table does not exist') AS table_status;

-- 如果表存在，添加字段
SET @sql = IF(@table_exists > 0,
    'CALL add_column_if_not_exists(''marketing_strategies'', ''campaign_name'', ''VARCHAR(255) COMMENT \\''活动名称（冗余存储）\\'' AFTER generated_by'');
     CALL add_column_if_not_exists(''marketing_strategies'', ''target_audience_analysis'', ''JSON COMMENT \\''目标受众分析（JSON格式）\\'' AFTER campaign_name'');
     CALL add_column_if_not_exists(''marketing_strategies'', ''core_idea'', ''TEXT COMMENT \\''核心创意理念\\'' AFTER target_audience_analysis'');
     CALL add_column_if_not_exists(''marketing_strategies'', ''xhs_content'', ''TEXT COMMENT \\''小红书文案内容\\'' AFTER core_idea'');
     CALL add_column_if_not_exists(''marketing_strategies'', ''wechat_full_plan'', ''JSON COMMENT \\''微信全案深度方案（JSON格式）\\'' AFTER xhs_content'');
     CALL add_column_if_not_exists(''marketing_strategies'', ''recommended_execution_time'', ''JSON COMMENT \\''推荐执行时间（JSON格式）\\'' AFTER wechat_full_plan'');
     CALL add_column_if_not_exists(''marketing_strategies'', ''expected_performance_metrics'', ''JSON COMMENT \\''预期性能指标（JSON格式）\\'' AFTER recommended_execution_time'');
     CALL add_column_if_not_exists(''marketing_strategies'', ''execution_steps'', ''JSON COMMENT \\''执行步骤（JSON格式）\\'' AFTER expected_performance_metrics'');
     CALL add_column_if_not_exists(''marketing_strategies'', ''risk_assessment'', ''JSON COMMENT \\''风险评估（JSON格式）\\'' AFTER execution_steps'');
     CALL add_column_if_not_exists(''marketing_strategies'', ''budget_allocation'', ''JSON COMMENT \\''预算分配（JSON格式）\\'' AFTER risk_assessment'');
     CALL add_column_if_not_exists(''marketing_strategies'', ''ai_response_raw'', ''TEXT COMMENT \\''AI原始响应（JSON字符串）\\'' AFTER budget_allocation'');
     CALL add_column_if_not_exists(''marketing_strategies'', ''ai_engine'', ''ENUM(\\''QWEN\\'', \\''GEMINI\\'', \\''FALLBACK\\'') COMMENT \\''使用的AI引擎\\'' AFTER ai_response_raw'');
     CALL add_column_if_not_exists(''marketing_strategies'', ''generated_content_ids'', ''JSON COMMENT \\''生成的内容ID数组\\'' AFTER ai_engine'');
     CALL add_column_if_not_exists(''marketing_strategies'', ''content_platforms'', ''JSON COMMENT \\''内容发布平台数组\\'' AFTER generated_content_ids'');
     SELECT \\''所有字段迁移完成\\'' AS migration_status;',
    'SELECT \\''marketing_strategies 表不存在，请先运行基础迁移脚本\\'' AS migration_warning'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 清理临时存储过程
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

-- 完成迁移
SELECT '微信全案字段迁移脚本执行完成' AS final_status;