-- LuminaMedia DEMO数据库初始化脚本
-- 生成时间: 2026-03-30T14:33:45.238Z

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS `lumina_demo` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lumina_demo`;

-- 2. 创建DEMO客户数据表
CREATE TABLE IF NOT EXISTS `demo_customer_profiles` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) DEFAULT 'demo-tenant',
    `name` VARCHAR(100) NOT NULL,
    `gender` ENUM('M', 'F') NOT NULL,
    `age` INT NOT NULL,
    `mobile` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100),
    `registration_date` DATE NOT NULL,
    `membership_level` ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
    `points` INT DEFAULT 0,
    `total_spent` DECIMAL(10, 2) DEFAULT 0.00,
    `last_purchase_date` DATE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_id` (`tenant_id`),
    INDEX `idx_membership_level` (`membership_level`),
    INDEX `idx_last_purchase_date` (`last_purchase_date`)
) COMMENT='DEMO客户数据表';

-- 3. 创建DEMO消费记录表
CREATE TABLE IF NOT EXISTS `demo_purchase_records` (
    `id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) DEFAULT 'demo-tenant',
    `purchase_date` DATETIME NOT NULL,
    `store_id` VARCHAR(50) NOT NULL,
    `product_category` VARCHAR(100) NOT NULL,
    `product_name` VARCHAR(200) NOT NULL,
    `quantity` INT NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` ENUM('alipay', 'wechat', 'card', 'cash') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_purchase_date` (`purchase_date`),
    INDEX `idx_product_category` (`product_category`),
    FOREIGN KEY (`customer_id`) REFERENCES `demo_customer_profiles`(`id`) ON DELETE CASCADE
) COMMENT='DEMO消费记录表';

-- 4. 运行插入脚本（请依次执行以下脚本）
--    source sql/01-demo_customer_profiles.sql;
--    source sql/02-demo_purchase_records.sql;
--    source sql/03-demo_activities.sql;
--    source sql/04-demo_social_interactions.sql;

SELECT 'DEMO数据库初始化完成!' AS message;
