-- DEMO数据重置脚本
-- 版本: 1.0
-- 描述: 清空所有DEMO表并重新插入示例数据

-- 注意：由于外键约束，需要按正确顺序删除数据

-- 1. 禁用外键检查（确保可以按任意顺序删除）
SET FOREIGN_KEY_CHECKS = 0;

-- 2. 按依赖关系从子表到父表删除数据
-- 注意：demo_customer_profiles是父表，其他表都有外键引用它

TRUNCATE TABLE `demo_social_interaction`;
TRUNCATE TABLE `demo_campaign_participation`;
TRUNCATE TABLE `demo_user_behavior`;
TRUNCATE TABLE `demo_purchase_records`;
TRUNCATE TABLE `demo_data_import`;
TRUNCATE TABLE `demo_reset_log`;
TRUNCATE TABLE `demo_customer_profiles`;

-- 3. 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 4. 重新插入示例数据（与init-demo.sql中的示例数据相同）

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

-- 5. 记录重置操作到日志表
INSERT IGNORE INTO `demo_reset_log` (`id`, `tenant_id`, `reset_type`, `reset_target`, `records_affected`, `reset_by`, `reset_date`, `reason`) VALUES
(UUID(), 'demo-tenant', 'full', '["demo_customer_profiles", "demo_purchase_records", "demo_user_behavior", "demo_campaign_participation", "demo_social_interaction", "demo_data_import"]', 19, 'demo-reset-tool', NOW(), '常规数据重置');

-- 6. 完成提示
SELECT 'DEMO data reset completed successfully!' AS message;
SELECT CONCAT('Total records inserted: ',
    (SELECT COUNT(*) FROM `demo_customer_profiles`) +
    (SELECT COUNT(*) FROM `demo_purchase_records`) +
    (SELECT COUNT(*) FROM `demo_user_behavior`) +
    (SELECT COUNT(*) FROM `demo_campaign_participation`) +
    (SELECT COUNT(*) FROM `demo_social_interaction`) +
    (SELECT COUNT(*) FROM `demo_data_import`)
) AS total_records;