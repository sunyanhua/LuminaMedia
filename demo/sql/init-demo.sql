-- LuminaMedia DEMO数据库初始化脚本
-- 版本: 1.0
-- 描述: 创建DEMO专用数据库结构，与真实业务数据完全隔离

-- 1. 创建DEMO专用数据库
CREATE DATABASE IF NOT EXISTS `lumina_demo` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. 使用DEMO数据库
USE `lumina_demo`;

-- 3. 创建DEMO客户数据表（基于任务文件中的设计）
CREATE TABLE IF NOT EXISTS `demo_customer_profiles` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `tenant_id` CHAR(36) NOT NULL DEFAULT 'demo-tenant' COMMENT '租户ID，固定为demo-tenant',
    `name` VARCHAR(100) NOT NULL COMMENT '客户姓名',
    `gender` ENUM('M', 'F') NOT NULL COMMENT '性别',
    `age` INT NOT NULL COMMENT '年龄',
    `mobile` VARCHAR(20) NOT NULL COMMENT '手机号',
    `email` VARCHAR(100) NULL COMMENT '邮箱',
    `registration_date` DATE NOT NULL COMMENT '注册日期',
    `membership_level` ENUM('bronze', 'silver', 'gold', 'platinum') NOT NULL DEFAULT 'bronze' COMMENT '会员等级',
    `points` INT NOT NULL DEFAULT 0 COMMENT '积分',
    `total_spent` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '累计消费金额',
    `last_purchase_date` DATE NULL COMMENT '最后购买日期',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_id` (`tenant_id`),
    INDEX `idx_membership_level` (`membership_level`),
    INDEX `idx_last_purchase_date` (`last_purchase_date`),
    INDEX `idx_registration_date` (`registration_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DEMO客户数据表';

-- 4. 创建DEMO消费记录表
CREATE TABLE IF NOT EXISTS `demo_purchase_records` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `customer_id` CHAR(36) NOT NULL COMMENT '客户ID',
    `tenant_id` CHAR(36) NOT NULL DEFAULT 'demo-tenant' COMMENT '租户ID，固定为demo-tenant',
    `purchase_date` DATETIME NOT NULL COMMENT '购买时间',
    `store_id` VARCHAR(50) NOT NULL COMMENT '门店ID',
    `product_category` VARCHAR(100) NOT NULL COMMENT '商品类别',
    `product_name` VARCHAR(200) NOT NULL COMMENT '商品名称',
    `quantity` INT NOT NULL COMMENT '数量',
    `unit_price` DECIMAL(10, 2) NOT NULL COMMENT '单价',
    `total_amount` DECIMAL(10, 2) NOT NULL COMMENT '总金额',
    `payment_method` ENUM('alipay', 'wechat', 'card', 'cash') NOT NULL COMMENT '支付方式',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_purchase_date` (`purchase_date`),
    INDEX `idx_product_category` (`product_category`),
    INDEX `idx_tenant_id` (`tenant_id`),
    CONSTRAINT `fk_demo_purchase_records_customer`
        FOREIGN KEY (`customer_id`)
        REFERENCES `demo_customer_profiles` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DEMO消费记录表';

-- 5. 创建DEMO用户行为记录表（用于模拟用户浏览、收藏等行为）
CREATE TABLE IF NOT EXISTS `demo_user_behavior` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `customer_id` CHAR(36) NOT NULL COMMENT '客户ID',
    `tenant_id` CHAR(36) NOT NULL DEFAULT 'demo-tenant' COMMENT '租户ID',
    `behavior_type` ENUM('browse', 'click', 'collect', 'cart_add', 'search') NOT NULL COMMENT '行为类型',
    `target_id` VARCHAR(100) NULL COMMENT '目标ID（商品ID、页面ID等）',
    `target_type` VARCHAR(50) NULL COMMENT '目标类型（product, category, page等）',
    `duration_seconds` INT NULL COMMENT '停留时长（秒）',
    `device_type` ENUM('mobile', 'desktop', 'tablet') NULL COMMENT '设备类型',
    `platform` ENUM('web', 'app', 'wechat') NULL COMMENT '平台',
    `location` VARCHAR(100) NULL COMMENT '地理位置',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '行为时间',
    PRIMARY KEY (`id`),
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_behavior_type` (`behavior_type`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_tenant_id` (`tenant_id`),
    CONSTRAINT `fk_demo_user_behavior_customer`
        FOREIGN KEY (`customer_id`)
        REFERENCES `demo_customer_profiles` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DEMO用户行为记录表';

-- 6. 创建DEMO营销活动参与记录表
CREATE TABLE IF NOT EXISTS `demo_campaign_participation` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `customer_id` CHAR(36) NOT NULL COMMENT '客户ID',
    `tenant_id` CHAR(36) NOT NULL DEFAULT 'demo-tenant' COMMENT '租户ID',
    `campaign_id` VARCHAR(50) NOT NULL COMMENT '活动ID',
    `campaign_name` VARCHAR(200) NOT NULL COMMENT '活动名称',
    `participation_type` ENUM('signup', 'share', 'purchase', 'review', 'redeem') NOT NULL COMMENT '参与类型',
    `participation_date` DATETIME NOT NULL COMMENT '参与时间',
    `reward_points` INT NULL COMMENT '奖励积分',
    `coupon_code` VARCHAR(50) NULL COMMENT '优惠券代码',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_campaign_id` (`campaign_id`),
    INDEX `idx_participation_date` (`participation_date`),
    INDEX `idx_tenant_id` (`tenant_id`),
    CONSTRAINT `fk_demo_campaign_participation_customer`
        FOREIGN KEY (`customer_id`)
        REFERENCES `demo_customer_profiles` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DEMO营销活动参与记录表';

-- 7. 创建DEMO社交媒体互动记录表
CREATE TABLE IF NOT EXISTS `demo_social_interaction` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `customer_id` CHAR(36) NOT NULL COMMENT '客户ID',
    `tenant_id` CHAR(36) NOT NULL DEFAULT 'demo-tenant' COMMENT '租户ID',
    `platform` ENUM('wechat', 'xiaohongshu', 'weibo', 'douyin') NOT NULL COMMENT '社交平台',
    `interaction_type` ENUM('follow', 'like', 'comment', 'share', 'read') NOT NULL COMMENT '互动类型',
    `content_id` VARCHAR(100) NULL COMMENT '内容ID',
    `content_type` VARCHAR(50) NULL COMMENT '内容类型（article, video, post等）',
    `interaction_date` DATETIME NOT NULL COMMENT '互动时间',
    `metadata` JSON NULL COMMENT '元数据（如评论内容、分享渠道等）',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_platform` (`platform`),
    INDEX `idx_interaction_date` (`interaction_date`),
    INDEX `idx_tenant_id` (`tenant_id`),
    CONSTRAINT `fk_demo_social_interaction_customer`
        FOREIGN KEY (`customer_id`)
        REFERENCES `demo_customer_profiles` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DEMO社交媒体互动记录表';

-- 8. 创建DEMO数据导入记录表（用于跟踪模拟数据导入）
CREATE TABLE IF NOT EXISTS `demo_data_import` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `tenant_id` CHAR(36) NOT NULL DEFAULT 'demo-tenant' COMMENT '租户ID',
    `import_type` ENUM('customer', 'purchase', 'behavior', 'campaign', 'social') NOT NULL COMMENT '导入数据类型',
    `record_count` INT NOT NULL COMMENT '记录数量',
    `file_name` VARCHAR(255) NULL COMMENT '文件名（如果从文件导入）',
    `import_date` DATETIME NOT NULL COMMENT '导入时间',
    `status` ENUM('success', 'failed', 'partial') NOT NULL DEFAULT 'success' COMMENT '导入状态',
    `error_message` TEXT NULL COMMENT '错误信息',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_import_type` (`import_type`),
    INDEX `idx_import_date` (`import_date`),
    INDEX `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DEMO数据导入记录表';

-- 9. 创建DEMO重置日志表（用于记录数据重置操作）
CREATE TABLE IF NOT EXISTS `demo_reset_log` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `tenant_id` CHAR(36) NOT NULL DEFAULT 'demo-tenant' COMMENT '租户ID',
    `reset_type` ENUM('full', 'partial') NOT NULL COMMENT '重置类型',
    `reset_target` JSON NOT NULL COMMENT '重置目标表（JSON数组）',
    `records_affected` INT NOT NULL COMMENT '影响的记录数',
    `reset_by` VARCHAR(100) NULL COMMENT '执行者',
    `reset_date` DATETIME NOT NULL COMMENT '重置时间',
    `reason` VARCHAR(500) NULL COMMENT '重置原因',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_reset_date` (`reset_date`),
    INDEX `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DEMO重置日志表';

-- 10. 插入示例DEMO数据（用于初始演示）
-- 注意：这些是示例数据，实际DEMO中会从模拟数据生成工具导入

-- 示例客户数据
INSERT IGNORE INTO `demo_customer_profiles` (`id`, `tenant_id`, `name`, `gender`, `age`, `mobile`, `email`, `registration_date`, `membership_level`, `points`, `total_spent`, `last_purchase_date`) VALUES
('demo-customer-001', 'demo-tenant', '张三', 'M', 28, '13800138001', 'zhangsan@example.com', '2025-01-15', 'gold', 1250, 5800.50, '2026-03-28'),
('demo-customer-002', 'demo-tenant', '李四', 'F', 35, '13800138002', 'lisi@example.com', '2024-11-20', 'platinum', 3200, 15200.00, '2026-03-30'),
('demo-customer-003', 'demo-tenant', '王五', 'M', 42, '13800138003', 'wangwu@example.com', '2025-03-10', 'silver', 800, 3200.75, '2026-03-25'),
('demo-customer-004', 'demo-tenant', '赵六', 'F', 31, '13800138004', 'zhaoliu@example.com', '2025-02-28', 'bronze', 300, 1500.00, '2026-03-20');

-- 示例消费记录
INSERT IGNORE INTO `demo_purchase_records` (`id`, `customer_id`, `tenant_id`, `purchase_date`, `store_id`, `product_category`, `product_name`, `quantity`, `unit_price`, `total_amount`, `payment_method`) VALUES
('demo-purchase-001', 'demo-customer-001', 'demo-tenant', '2026-03-28 14:30:00', 'store-001', '电子产品', '智能手机', 1, 2999.00, 2999.00, 'alipay'),
('demo-purchase-002', 'demo-customer-001', 'demo-tenant', '2026-03-28 15:15:00', 'store-001', '电子产品', '蓝牙耳机', 1, 399.50, 399.50, 'wechat'),
('demo-purchase-003', 'demo-customer-002', 'demo-tenant', '2026-03-30 10:20:00', 'store-002', '服装', '冬季外套', 1, 1200.00, 1200.00, 'card'),
('demo-purchase-004', 'demo-customer-002', 'demo-tenant', '2026-03-30 11:05:00', 'store-002', '服装', '毛衣', 2, 299.00, 598.00, 'cash'),
('demo-purchase-005', 'demo-customer-003', 'demo-tenant', '2026-03-25 16:45:00', 'store-003', '食品', '进口巧克力', 3, 89.00, 267.00, 'alipay');

-- 示例用户行为记录
INSERT IGNORE INTO `demo_user_behavior` (`id`, `customer_id`, `tenant_id`, `behavior_type`, `target_id`, `target_type`, `duration_seconds`, `device_type`, `platform`, `location`) VALUES
('demo-behavior-001', 'demo-customer-001', 'demo-tenant', 'browse', 'product-001', 'product', 45, 'mobile', 'app', '北京市朝阳区'),
('demo-behavior-002', 'demo-customer-001', 'demo-tenant', 'click', 'product-002', 'product', 5, 'mobile', 'app', '北京市朝阳区'),
('demo-behavior-003', 'demo-customer-002', 'demo-tenant', 'collect', 'product-003', 'product', 120, 'desktop', 'web', '上海市浦东新区'),
('demo-behavior-004', 'demo-customer-003', 'demo-tenant', 'cart_add', 'product-004', 'product', 30, 'mobile', 'wechat', '广州市天河区');

-- 示例营销活动参与记录
INSERT IGNORE INTO `demo_campaign_participation` (`id`, `customer_id`, `tenant_id`, `campaign_id`, `campaign_name`, `participation_type`, `participation_date`, `reward_points`, `coupon_code`) VALUES
('demo-campaign-001', 'demo-customer-001', 'demo-tenant', 'campaign-spring-2026', '2026春季促销', 'signup', '2026-03-01 09:00:00', 100, 'SPRING100'),
('demo-campaign-002', 'demo-customer-002', 'demo-tenant', 'campaign-spring-2026', '2026春季促销', 'purchase', '2026-03-15 14:30:00', 200, NULL),
('demo-campaign-003', 'demo-customer-003', 'demo-tenant', 'campaign-member-day', '会员日特惠', 'redeem', '2026-03-20 11:15:00', 50, 'MEMBER50');

-- 示例社交媒体互动记录
INSERT IGNORE INTO `demo_social_interaction` (`id`, `customer_id`, `tenant_id`, `platform`, `interaction_type`, `content_id`, `content_type`, `interaction_date`, `metadata`) VALUES
('demo-social-001', 'demo-customer-001', 'demo-tenant', 'wechat', 'follow', 'official-account-001', 'account', '2026-03-10 08:30:00', '{"account_name": "品牌官方号"}'),
('demo-social-002', 'demo-customer-001', 'demo-tenant', 'xiaohongshu', 'like', 'post-001', 'post', '2026-03-12 15:20:00', '{"post_title": "春季穿搭分享"}'),
('demo-social-003', 'demo-customer-002', 'demo-tenant', 'weibo', 'share', 'article-001', 'article', '2026-03-18 20:15:00', '{"share_channel": "朋友圈", "comment": "推荐阅读"}');

-- 示例数据导入记录
INSERT IGNORE INTO `demo_data_import` (`id`, `tenant_id`, `import_type`, `record_count`, `file_name`, `import_date`, `status`, `error_message`) VALUES
('demo-import-001', 'demo-tenant', 'customer', 4, 'demo_customers.csv', '2026-03-30 09:00:00', 'success', NULL),
('demo-import-002', 'demo-tenant', 'purchase', 5, 'demo_purchases.csv', '2026-03-30 09:05:00', 'success', NULL);

-- 11. 创建DEMO数据库用户（可选，用于DEMO环境）
-- 注意：在实际部署中，应该使用更安全的密码
CREATE USER IF NOT EXISTS 'demo_user'@'%' IDENTIFIED BY 'demo_password';
GRANT ALL PRIVILEGES ON `lumina_demo`.* TO 'demo_user'@'%';
FLUSH PRIVILEGES;

-- 12. 完成提示
SELECT 'DEMO database initialization completed successfully!' AS message;
SELECT 'Database: lumina_demo' AS info;
SELECT CONCAT('Tables created: ', COUNT(*)) AS tables_count FROM information_schema.tables WHERE table_schema = 'lumina_demo';