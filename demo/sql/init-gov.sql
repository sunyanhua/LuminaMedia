-- LuminaMedia 政务版DEMO数据库初始化脚本
-- 版本: 1.0
-- 描述: 创建政务版DEMO专用数据库结构，支持政府场景内容管理

-- 1. 创建政务版DEMO专用数据库
CREATE DATABASE IF NOT EXISTS `lumina_gov` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. 使用政务版DEMO数据库
USE `lumina_gov`;

-- 3. 创建政府内容表
CREATE TABLE IF NOT EXISTS `government_content` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `tenant_id` CHAR(36) NOT NULL DEFAULT 'gov-tenant' COMMENT '租户ID，固定为gov-tenant',
    `content_type` ENUM('official_document', 'anti_fraud', 'policy_interpretation', 'public_service', 'public_notice', 'emergency_response') NOT NULL COMMENT '内容类型',
    `title` VARCHAR(200) NOT NULL COMMENT '标题',
    `document_number` VARCHAR(100) NULL COMMENT '文号',
    `issuing_authority` VARCHAR(200) NOT NULL COMMENT '发文机关',
    `issue_date` DATE NOT NULL COMMENT '发文日期',
    `content_text` TEXT NOT NULL COMMENT '内容正文',
    `status` ENUM('draft', 'review', 'approved', 'published', 'archived') NOT NULL DEFAULT 'draft' COMMENT '状态',
    `compliance_score` DECIMAL(5, 2) NULL COMMENT '合规性评分',
    `compliance_issues` JSON NULL COMMENT '合规性问题',
    `published_platforms` JSON NULL COMMENT '发布平台',
    `published_at` DATETIME NULL COMMENT '发布时间',
    `views_count` INT NOT NULL DEFAULT 0 COMMENT '阅读量',
    `engagement_rate` DECIMAL(5, 4) NULL COMMENT '互动率',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `created_by` VARCHAR(100) NOT NULL COMMENT '创建人',
    `updated_by` VARCHAR(100) NULL COMMENT '更新人',
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_id` (`tenant_id`),
    INDEX `idx_content_type` (`content_type`),
    INDEX `idx_issue_date` (`issue_date`),
    INDEX `idx_status` (`status`),
    INDEX `idx_issuing_authority` (`issuing_authority`),
    FULLTEXT INDEX `idx_content_fulltext` (`title`, `content_text`) COMMENT '全文索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='政府内容表';

-- 4. 创建政府账号凭证表
CREATE TABLE IF NOT EXISTS `government_account_credentials` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `tenant_id` CHAR(36) NOT NULL DEFAULT 'gov-tenant' COMMENT '租户ID',
    `platform` ENUM('wechat', 'xiaohongshu', 'weibo', 'douyin', 'government_website') NOT NULL COMMENT '平台',
    `account_name` VARCHAR(100) NOT NULL COMMENT '账号名称',
    `account_id` VARCHAR(100) NOT NULL COMMENT '平台账号ID',
    `encrypted_credentials` TEXT NOT NULL COMMENT '加密的凭证数据',
    `last_connection_test` DATETIME NULL COMMENT '最后连接测试时间',
    `connection_status` ENUM('connected', 'disconnected', 'error') NOT NULL DEFAULT 'disconnected' COMMENT '连接状态',
    `connection_error` TEXT NULL COMMENT '连接错误信息',
    `daily_publish_limit` INT NOT NULL DEFAULT 10 COMMENT '每日发布限制',
    `publish_count_today` INT NOT NULL DEFAULT 0 COMMENT '今日已发布数量',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_platform_account` (`tenant_id`, `platform`, `account_id`),
    INDEX `idx_connection_status` (`connection_status`),
    INDEX `idx_platform` (`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='政府账号凭证表';

-- 5. 创建政府内容发布记录表
CREATE TABLE IF NOT EXISTS `government_content_publish_records` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `tenant_id` CHAR(36) NOT NULL DEFAULT 'gov-tenant' COMMENT '租户ID',
    `content_id` CHAR(36) NOT NULL COMMENT '内容ID',
    `platform` ENUM('wechat', 'xiaohongshu', 'weibo', 'douyin', 'government_website') NOT NULL COMMENT '发布平台',
    `account_id` CHAR(36) NOT NULL COMMENT '账号ID',
    `publish_status` ENUM('pending', 'publishing', 'published', 'failed') NOT NULL DEFAULT 'pending' COMMENT '发布状态',
    `publish_url` VARCHAR(500) NULL COMMENT '发布URL',
    `publish_time` DATETIME NULL COMMENT '发布时间',
    `views_count` INT NOT NULL DEFAULT 0 COMMENT '阅读量',
    `likes_count` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
    `comments_count` INT NOT NULL DEFAULT 0 COMMENT '评论数',
    `shares_count` INT NOT NULL DEFAULT 0 COMMENT '分享数',
    `error_message` TEXT NULL COMMENT '错误信息',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_content_id` (`content_id`),
    INDEX `idx_platform` (`platform`),
    INDEX `idx_publish_status` (`publish_status`),
    INDEX `idx_publish_time` (`publish_time`),
    FOREIGN KEY (`content_id`) REFERENCES `government_content`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='政府内容发布记录表';

-- 6. 创建政府场景演示剧本表
CREATE TABLE IF NOT EXISTS `government_demo_scenarios` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `tenant_id` CHAR(36) NOT NULL DEFAULT 'gov-tenant' COMMENT '租户ID',
    `scenario_name` VARCHAR(100) NOT NULL COMMENT '剧本名称',
    `scenario_type` ENUM('policy_propaganda', 'anti_fraud', 'public_service', 'emergency_response') NOT NULL COMMENT '剧本类型',
    `description` TEXT NOT NULL COMMENT '剧本描述',
    `target_audience` VARCHAR(200) NOT NULL COMMENT '目标受众',
    `budget` DECIMAL(12, 2) NULL COMMENT '预算',
    `timeline_days` INT NOT NULL DEFAULT 7 COMMENT '时间线（天数）',
    `success_metrics` JSON NOT NULL COMMENT '成功指标',
    `steps` JSON NOT NULL COMMENT '步骤定义',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_scenario_type` (`scenario_type`),
    INDEX `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='政府场景演示剧本表';

-- 7. 插入示例政府内容
INSERT INTO `government_content` (
    `id`, `tenant_id`, `content_type`, `title`, `document_number`, `issuing_authority`, `issue_date`, `content_text`, `status`, `compliance_score`, `created_by`
) VALUES
(
    UUID(), 'gov-tenant', 'official_document',
    '关于做好2026年春季防火工作的通知',
    '政发〔2026〕15号',
    '市应急管理局',
    '2026-03-15',
    '各区县人民政府，市政府各部门：\n\n为切实做好2026年春季防火工作，有效预防和减少火灾事故发生，保障人民群众生命财产安全，现就有关事项通知如下：\n\n一、提高思想认识，落实防火责任\n各级各部门要充分认识春季防火工作的重要性和紧迫性，切实增强责任感和使命感...\n\n二、加强火源管理，消除火灾隐患\n严格执行野外用火审批制度，加强林区、草原等重点区域的火源管控...\n\n三、强化宣传教育，提高防火意识\n广泛开展防火宣传教育，利用多种媒体平台宣传防火知识...\n\n四、完善应急预案，做好应急准备\n修订完善火灾应急预案，加强应急队伍建设和物资储备...\n\n五、加强值班值守，确保信息畅通\n严格执行24小时值班和领导带班制度，确保火情信息及时准确上报...\n\n特此通知。',
    'published', 98.50, '系统管理员'
),
(
    UUID(), 'gov-tenant', 'anti_fraud',
    '警惕新型网络投资诈骗 守护好您的"钱袋子"',
    NULL,
    '市公安局反诈中心',
    '2026-03-20',
    '近期，我市发生多起新型网络投资诈骗案件，犯罪嫌疑人利用虚假投资平台实施诈骗，给人民群众造成重大财产损失。为有效防范此类诈骗，市公安局反诈中心提醒广大市民：\n\n一、诈骗手法揭秘\n1. "高回报"诱惑：承诺短期内获得高额回报，吸引投资者。\n2. "专业"包装：伪造专业投资团队、豪华办公场所。\n3. "初期返利"：前期给予小额返利，诱骗加大投资。\n4. "突然失联"：待投资者投入大额资金后，平台关闭、人员失联。\n\n二、识别防范要点\n1. 核实平台资质：查询平台是否具有合法金融牌照。\n2. 警惕高额回报：任何承诺"保本高收益"的投资都是诈骗。\n3. 保护个人信息：不向陌生人透露身份证、银行卡等信息。\n4. 及时咨询报警：发现可疑情况，立即向公安机关咨询或报警。\n\n三、举报途径\n1. 反诈专线：96110\n2. 市公安局反诈中心：xxx-xxxxxxx\n3. 微信公众号："平安城市"反诈专栏\n\n请广大市民提高警惕，远离网络投资诈骗，守护好您的"钱袋子"。',
    'published', 96.80, '系统管理员'
);

-- 8. 插入示例政府账号
INSERT INTO `government_account_credentials` (
    `id`, `tenant_id`, `platform`, `account_name`, `account_id`, `encrypted_credentials`, `connection_status`, `daily_publish_limit`
) VALUES
(
    UUID(), 'gov-tenant', 'wechat', '市政府微信公众号', 'wx_gov_official',
    'encrypted_data_placeholder_wechat', 'connected', 5
),
(
    UUID(), 'gov-tenant', 'weibo', '市应急管理局微博', 'weibo_emergency_gov',
    'encrypted_data_placeholder_weibo', 'connected', 10
);

-- 9. 插入示例演示剧本
INSERT INTO `government_demo_scenarios` (
    `id`, `tenant_id`, `scenario_name`, `scenario_type`, `description`, `target_audience`, `budget`, `timeline_days`, `success_metrics`, `steps`
) VALUES
(
    UUID(), 'gov-tenant', '春季防火宣传周活动',
    'policy_propaganda',
    '针对春季防火关键期，开展为期一周的防火宣传教育活动，提高市民防火意识。',
    '全体市民，重点针对林区、农村居民',
    50000.00, 7,
    '{"reach_target": 100000, "engagement_rate": 0.05, "content_shares": 5000, "awareness_increase": 0.3}',
    '[{"step": 1, "action": "content_creation", "description": "创建防火宣传内容", "duration_hours": 8}, {"step": 2, "action": "platform_preparation", "description": "准备发布平台", "duration_hours": 4}, {"step": 3, "action": "content_publishing", "description": "发布宣传内容", "duration_hours": 24}, {"step": 4, "action": "engagement_monitoring", "description": "监测互动效果", "duration_hours": 168}, {"step": 5, "action": "effect_analysis", "description": "分析宣传效果", "duration_hours": 8}]'
);

-- 10. 创建政务版DEMO管理员用户
-- 注意：实际应用中应使用安全的密码哈希，此处仅为演示
INSERT IGNORE INTO `user` (`id`, `tenant_id`, `username`, `email`, `password_hash`, `role`, `full_name`, `department`, `is_active`, `created_at`, `updated_at`)
SELECT
    UUID(), 'gov-tenant', 'gov-admin', 'admin@gov-demo.lumina.com',
    '$2b$10$DemoPasswordHashForGovAdmin', 'admin', '政务版管理员', '信息化办公室', 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE username = 'gov-admin' AND tenant_id = 'gov-tenant');

-- 11. 创建政务版DEMO数据导入记录
INSERT INTO `data_import_log` (`id`, `tenant_id`, `import_type`, `source`, `record_count`, `status`, `imported_by`, `created_at`)
SELECT
    UUID(), 'gov-tenant', 'government_content', 'system_init', 2, 'completed', 'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `data_import_log` WHERE import_type = 'government_content' AND tenant_id = 'gov-tenant');

-- 完成消息
SELECT '政务版DEMO数据库初始化完成' AS message;