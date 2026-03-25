-- LuminaMedia 数据分析模块数据库迁移脚本
-- 版本: 1.0
-- 描述: 添加用户数据分析模块的表结构

USE lumina_media;

-- 1. 创建 user_behaviors 表（用户行为记录）
CREATE TABLE IF NOT EXISTS user_behaviors (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    user_id CHAR(36) NOT NULL COMMENT '关联用户ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话标识',
    event_type ENUM(
        'PAGE_VIEW',
        'CONTENT_CREATE',
        'PUBLISH_TASK',
        'LOGIN',
        'LOGOUT',
        'CAMPAIGN_CREATE',
        'STRATEGY_GENERATE',
        'REPORT_VIEW'
    ) NOT NULL COMMENT '事件类型枚举',
    event_data JSON COMMENT 'JSON格式的事件详情',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '事件发生时间',
    PRIMARY KEY (id),
    KEY idx_user_id_timestamp (user_id, timestamp),
    KEY idx_session_id (session_id),
    KEY idx_event_type (event_type),
    CONSTRAINT fk_user_behaviors_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户行为记录';

-- 2. 创建 marketing_campaigns 表（营销活动）
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    user_id CHAR(36) NOT NULL COMMENT '关联用户ID',
    name VARCHAR(255) NOT NULL COMMENT '活动名称',
    campaign_type ENUM('ONLINE', 'OFFLINE', 'HYBRID') NOT NULL COMMENT '活动类型枚举',
    target_audience JSON COMMENT 'JSON格式的目标受众描述',
    budget DECIMAL(10, 2) DEFAULT 0.00 COMMENT '预算金额',
    status ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT' COMMENT '活动状态枚举',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_user_id_status (user_id, status),
    KEY idx_start_date_end_date (start_date, end_date),
    CONSTRAINT fk_marketing_campaigns_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='营销活动';

-- 3. 创建 marketing_strategies 表（营销策略）
CREATE TABLE IF NOT EXISTS marketing_strategies (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    campaign_id CHAR(36) NOT NULL COMMENT '关联营销活动ID',
    strategy_type ENUM('CONTENT', 'CHANNEL', 'TIMING', 'BUDGET_ALLOCATION') NOT NULL COMMENT '策略类型枚举',
    description TEXT NOT NULL COMMENT '策略描述',
    implementation_plan JSON COMMENT 'JSON格式的实施计划',
    expected_roi VARCHAR(255) COMMENT '预期投资回报率',
    confidence_score VARCHAR(255) COMMENT '置信度评分',
    generated_by ENUM('AI_GENERATED', 'MANUAL', 'TEMPLATE') NOT NULL DEFAULT 'AI_GENERATED' COMMENT '生成方式枚举',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_campaign_id (campaign_id),
    KEY idx_strategy_type (strategy_type),
    KEY idx_confidence_score (confidence_score),
    CONSTRAINT fk_marketing_strategies_campaign FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='营销策略';

-- 4. 插入演示数据（可选）
-- 注意：需要先有测试用户数据才能插入演示数据
-- 假设存在一个测试用户 ID: 'test-user-123'

-- INSERT INTO marketing_campaigns (id, user_id, name, campaign_type, target_audience, budget, status, start_date, end_date) VALUES
-- ('campaign-1', 'test-user-123', '小红书春季美妆推广', 'ONLINE', '{"ageRange": [18, 35], "gender": "female", "interests": ["美妆", "护肤", "时尚"]}', 50000.00, 'ACTIVE', '2024-03-01', '2024-06-30'),
-- ('campaign-2', 'test-user-123', '微信公众号内容矩阵建设', 'ONLINE', '{"ageRange": [25, 45], "gender": "both", "interests": ["科技", "商业", "职场"]}', 30000.00, 'ACTIVE', '2024-01-01', '2024-12-31');

-- INSERT INTO marketing_strategies (id, campaign_id, strategy_type, description, implementation_plan, expected_roi, confidence_score, generated_by) VALUES
-- ('strategy-1', 'campaign-1', 'CONTENT', '针对年轻女性的美妆内容策略', '{"focus": ["化妆教程", "产品测评"], "frequency": "每周3篇"}', 35.50, 85, 'AI_GENERATED'),
-- ('strategy-2', 'campaign-1', 'CHANNEL', '小红书平台重点投放策略', '{"primaryChannel": "小红书", "secondaryChannels": ["微信公众号"]}', 42.30, 78, 'AI_GENERATED');

-- 5. 创建索引优化查询性能
CREATE INDEX idx_user_behaviors_composite ON user_behaviors (user_id, event_type, timestamp);
CREATE INDEX idx_campaigns_date_range ON marketing_campaigns (start_date, end_date, status);
CREATE INDEX idx_strategies_confidence ON marketing_strategies (campaign_id, confidence_score DESC);

-- 完成迁移
SELECT '数据分析模块表结构创建完成' AS migration_status;