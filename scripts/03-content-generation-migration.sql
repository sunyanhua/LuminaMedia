-- LuminaMedia AI内容生成模块数据库迁移脚本
-- 版本: 1.0
-- 描述: 扩展内容草稿表和营销策略表，支持AI内容生成功能
-- 执行顺序: 在 02-analytics-migration.sql 之后执行

USE lumina_media;

-- 1. 添加内容草稿表新字段
DELIMITER //
CREATE PROCEDURE add_columns_to_content_drafts()
BEGIN
    DECLARE column_exists INT DEFAULT 0;

    -- 检查 generated_by 列是否存在
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'content_drafts'
    AND COLUMN_NAME = 'generated_by';

    IF column_exists = 0 THEN
        ALTER TABLE content_drafts
        ADD COLUMN generated_by ENUM('AI_GENERATED', 'MANUAL', 'TEMPLATE', 'HYBRID') NULL COMMENT '生成方式枚举';
    END IF;

    -- 检查 quality_score 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'content_drafts'
    AND COLUMN_NAME = 'quality_score';

    IF column_exists = 0 THEN
        ALTER TABLE content_drafts
        ADD COLUMN quality_score DECIMAL(5, 2) NULL COMMENT '质量评分 (0-100)';
    END IF;

    -- 检查 ai_generated_content 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'content_drafts'
    AND COLUMN_NAME = 'ai_generated_content';

    IF column_exists = 0 THEN
        ALTER TABLE content_drafts
        ADD COLUMN ai_generated_content JSON NULL COMMENT 'JSON格式的AI生成详情';
    END IF;

    -- 检查 created_at 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'content_drafts'
    AND COLUMN_NAME = 'created_at';

    IF column_exists = 0 THEN
        ALTER TABLE content_drafts
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';
    END IF;

    -- 检查 updated_at 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'content_drafts'
    AND COLUMN_NAME = 'updated_at';

    IF column_exists = 0 THEN
        ALTER TABLE content_drafts
        ADD COLUMN updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';
    END IF;
END //
DELIMITER ;

CALL add_columns_to_content_drafts();
DROP PROCEDURE add_columns_to_content_drafts;

-- 为现有数据设置默认时间戳
UPDATE content_drafts SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;

-- 2. 扩展营销策略表新增字段
DELIMITER //
CREATE PROCEDURE add_columns_to_marketing_strategies()
BEGIN
    DECLARE column_exists INT DEFAULT 0;

    -- 检查 customer_profile_id 列是否存在
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'customer_profile_id';

    IF column_exists = 0 THEN
        ALTER TABLE marketing_strategies
        ADD COLUMN customer_profile_id CHAR(36) NULL COMMENT '关联客户档案ID';
    END IF;

    -- 检查 campaign_name 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'campaign_name';

    IF column_exists = 0 THEN
        ALTER TABLE marketing_strategies
        ADD COLUMN campaign_name VARCHAR(255) NULL COMMENT '活动名称';
    END IF;

    -- 检查 target_audience_analysis 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'target_audience_analysis';

    IF column_exists = 0 THEN
        ALTER TABLE marketing_strategies
        ADD COLUMN target_audience_analysis JSON NULL COMMENT 'JSON格式的目标受众分析';
    END IF;

    -- 检查 core_idea 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'core_idea';

    IF column_exists = 0 THEN
        ALTER TABLE marketing_strategies
        ADD COLUMN core_idea TEXT NULL COMMENT '核心创意';
    END IF;

    -- 检查 xhs_content 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'xhs_content';

    IF column_exists = 0 THEN
        ALTER TABLE marketing_strategies
        ADD COLUMN xhs_content TEXT NULL COMMENT '小红书文案内容';
    END IF;

    -- 检查 recommended_execution_time 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'recommended_execution_time';

    IF column_exists = 0 THEN
        ALTER TABLE marketing_strategies
        ADD COLUMN recommended_execution_time JSON NULL COMMENT 'JSON格式的推荐执行时间';
    END IF;

    -- 检查 expected_performance_metrics 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'expected_performance_metrics';

    IF column_exists = 0 THEN
        ALTER TABLE marketing_strategies
        ADD COLUMN expected_performance_metrics JSON NULL COMMENT 'JSON格式的预期效果指标';
    END IF;

    -- 检查 execution_steps 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'execution_steps';

    IF column_exists = 0 THEN
        ALTER TABLE marketing_strategies
        ADD COLUMN execution_steps JSON NULL COMMENT 'JSON格式的执行步骤计划';
    END IF;

    -- 检查 risk_assessment 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'risk_assessment';

    IF column_exists = 0 THEN
        ALTER TABLE marketing_strategies
        ADD COLUMN risk_assessment JSON NULL COMMENT 'JSON格式的风险评估';
    END IF;

    -- 检查 budget_allocation 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'budget_allocation';

    IF column_exists = 0 THEN
        ALTER TABLE marketing_strategies
        ADD COLUMN budget_allocation JSON NULL COMMENT 'JSON格式的预算分配方案';
    END IF;

    -- 检查 ai_response_raw 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'ai_response_raw';

    IF column_exists = 0 THEN
        ALTER TABLE marketing_strategies
        ADD COLUMN ai_response_raw TEXT NULL COMMENT 'AI原始响应文本';
    END IF;

    -- 检查 generated_content_ids 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'generated_content_ids';

    IF column_exists = 0 THEN
        ALTER TABLE marketing_strategies
        ADD COLUMN generated_content_ids JSON NULL COMMENT 'JSON格式的生成内容ID数组';
    END IF;

    -- 检查 content_platforms 列是否存在
    SET column_exists = 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'content_platforms';

    IF column_exists = 0 THEN
        ALTER TABLE marketing_strategies
        ADD COLUMN content_platforms JSON NULL COMMENT 'JSON格式的内容平台数组';
    END IF;
END //
DELIMITER ;

CALL add_columns_to_marketing_strategies();
DROP PROCEDURE add_columns_to_marketing_strategies;

-- 3. 添加外键约束（如果customer_profiles表存在）
SET @customer_profiles_exists = (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = 'lumina_media' AND table_name = 'customer_profiles'
);

IF @customer_profiles_exists > 0 THEN
    -- 添加customer_profile_id外键约束
    ALTER TABLE marketing_strategies
    ADD CONSTRAINT fk_marketing_strategies_customer_profile
    FOREIGN KEY (customer_profile_id)
    REFERENCES customer_profiles(id)
    ON DELETE CASCADE;
END IF;

-- 4. 扩展营销活动表新增字段（如果customer_profiles表存在）
IF @customer_profiles_exists > 0 THEN
    ALTER TABLE marketing_campaigns
    ADD COLUMN IF NOT EXISTS customer_profile_id CHAR(36) NULL COMMENT '关联客户档案ID';

    ALTER TABLE marketing_campaigns
    ADD CONSTRAINT fk_marketing_campaigns_customer_profile
    FOREIGN KEY (customer_profile_id)
    REFERENCES customer_profiles(id)
    ON DELETE CASCADE;
END IF;

-- 5. 创建内容草稿质量评分索引
CREATE INDEX IF NOT EXISTS idx_content_drafts_quality ON content_drafts (quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_drafts_generated_by ON content_drafts (generated_by);
CREATE INDEX IF NOT EXISTS idx_content_drafts_created_at ON content_drafts (created_at DESC);

-- 6. 更新营销策略表索引
CREATE INDEX IF NOT EXISTS idx_marketing_strategies_customer_profile ON marketing_strategies (customer_profile_id);
CREATE INDEX IF NOT EXISTS idx_marketing_strategies_content_platforms ON marketing_strategies ((JSON_LENGTH(content_platforms)));

-- 7. 插入示例内容模板数据（可选）
-- 创建内容模板表（如果不存在）
CREATE TABLE IF NOT EXISTS content_templates (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    name VARCHAR(255) NOT NULL COMMENT '模板名称',
    platform ENUM('XHS', 'WECHAT_MP') NOT NULL COMMENT '平台枚举',
    template_type ENUM('product_intro', 'user_testimonial', 'promotional', 'educational', 'announcement') NOT NULL COMMENT '模板类型枚举',
    prompt_template TEXT NOT NULL COMMENT '提示词模板',
    example_output TEXT NULL COMMENT '示例输出',
    default_tone VARCHAR(50) NULL COMMENT '默认语气',
    suggested_hashtags JSON NULL COMMENT 'JSON格式的建议话题标签',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_platform_template_type (platform, template_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容模板库';

-- 插入示例模板数据
INSERT IGNORE INTO content_templates (id, name, platform, template_type, prompt_template, example_output, default_tone, suggested_hashtags) VALUES
('template-xhs-product-001', '小红书产品介绍模板', 'XHS', 'product_intro', '请为以下产品生成小红书风格的产品介绍文案：\n\n产品名称：{productName}\n产品特点：{productFeatures}\n目标人群：{targetAudience}\n\n要求：\n1. 突出产品核心卖点\n2. 使用亲切、真实的语气\n3. 包含Emoji和话题标签\n4. 提供使用场景建议', '✨发现宝藏好物｜{productName}真的绝了！\n\n最近挖到的{productName}简直是我的心头好💕\n{productFeatures}\n\n适合人群：{targetAudience}\n\n#好物分享 #种草 #小红书好物', 'casual', '["好物分享", "种草", "小红书好物"]'),
('template-wechat-article-001', '微信公众号文章模板', 'WECHAT_MP', 'educational', '请基于以下主题生成微信公众号文章：\n\n文章主题：{topic}\n核心观点：{mainPoints}\n目标读者：{targetReaders}\n\n要求：\n1. 结构清晰，有引言、正文、结论\n2. 提供有价值的深度内容\n3. 使用专业但易懂的语言\n4. 包含数据或案例支持', '# {topic}\n\n## 引言\n{introduction}\n\n## 正文\n{mainContent}\n\n## 结论\n{conclusion}', 'professional', '[]'),
('template-promotional-001', '促销活动通用模板', 'XHS', 'promotional', '请为以下促销活动生成推广文案：\n\n活动名称：{campaignName}\n活动时间：{campaignPeriod}\n优惠内容：{offerDetails}\n参与方式：{participationMethod}\n\n要求：\n1. 突出优惠力度\n2. 营造紧迫感\n3. 清晰说明参与方式\n4. 吸引用户立即行动', '🎉限时福利｜{campaignName}重磅来袭！\n\n活动时间：{campaignPeriod}\n优惠内容：{offerDetails}\n\n参与方式：{participationMethod}\n\n抓紧时间，错过等一年！\n\n#促销活动 #限时优惠 #福利', 'friendly', '["促销活动", "限时优惠", "福利"]');

-- 8. 完成迁移
SELECT 'AI内容生成模块数据库迁移完成' AS migration_status;