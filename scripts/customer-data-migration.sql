-- LuminaMedia 客户数据模块数据库迁移脚本
-- 版本: 1.0
-- 描述: 添加客户数据模块的表结构，并扩展现有营销活动表以支持客户关联

USE lumina_media;

-- 1. 创建 customer_profiles 表（客户档案）
CREATE TABLE IF NOT EXISTS customer_profiles (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    user_id CHAR(36) NOT NULL COMMENT '关联用户ID',
    customer_name VARCHAR(255) NOT NULL COMMENT '客户名称',
    customer_type ENUM(
        'ENTERPRISE',
        'SME',
        'INDIVIDUAL_BUSINESS',
        'INDIVIDUAL',
        'GOVERNMENT',
        'NON_PROFIT'
    ) NOT NULL DEFAULT 'ENTERPRISE' COMMENT '客户类型枚举',
    industry ENUM(
        'RETAIL',
        'ECOMMERCE',
        'RESTAURANT',
        'EDUCATION',
        'HEALTHCARE',
        'FINANCE',
        'REAL_ESTATE',
        'TRAVEL_HOTEL',
        'MANUFACTURING',
        'TECHNOLOGY',
        'MEDIA_ENTERTAINMENT',
        'AUTOMOTIVE',
        'FASHION_BEAUTY',
        'SPORTS_FITNESS',
        'OTHER'
    ) NOT NULL DEFAULT 'OTHER' COMMENT '行业分类枚举',
    data_sources JSON COMMENT 'JSON格式的数据源信息',
    profile_data JSON COMMENT 'JSON格式的客户档案数据',
    behavior_insights JSON COMMENT 'JSON格式的行为洞察数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_user_id_customer_type (user_id, customer_type),
    KEY idx_industry_created_at (industry, created_at),
    CONSTRAINT fk_customer_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户档案';

-- 2. 创建 data_import_jobs 表（数据导入任务）
CREATE TABLE IF NOT EXISTS data_import_jobs (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    customer_profile_id CHAR(36) NOT NULL COMMENT '关联客户档案ID',
    source_type ENUM(
        'CSV',
        'EXCEL',
        'JSON',
        'DATABASE',
        'API',
        'MANUAL',
        'OTHER'
    ) NOT NULL DEFAULT 'CSV' COMMENT '数据源类型枚举',
    file_path VARCHAR(500) NULL COMMENT '文件存储路径',
    original_filename VARCHAR(255) NULL COMMENT '原始文件名',
    record_count INT NOT NULL DEFAULT 0 COMMENT '总记录数',
    success_count INT NOT NULL DEFAULT 0 COMMENT '成功导入记录数',
    failed_count INT NOT NULL DEFAULT 0 COMMENT '导入失败记录数',
    status ENUM(
        'PENDING',
        'PROCESSING',
        'SUCCESS',
        'FAILED',
        'PARTIAL_SUCCESS',
        'CANCELLED'
    ) NOT NULL DEFAULT 'PENDING' COMMENT '导入状态枚举',
    error_message TEXT NULL COMMENT '错误信息',
    validation_errors JSON NULL COMMENT 'JSON格式的验证错误列表',
    summary JSON NULL COMMENT 'JSON格式的导入摘要',
    notes TEXT NULL COMMENT '备注信息',
    import_data JSON NULL COMMENT 'JSON格式的导入数据（原始数据或处理后的数据）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    started_at TIMESTAMP NULL COMMENT '开始处理时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    PRIMARY KEY (id),
    KEY idx_customer_profile_id_status (customer_profile_id, status),
    KEY idx_created_at (created_at),
    CONSTRAINT fk_data_import_jobs_customer_profile FOREIGN KEY (customer_profile_id) REFERENCES customer_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据导入任务';

-- 3. 创建 customer_segments 表（客户分群）
CREATE TABLE IF NOT EXISTS customer_segments (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    customer_profile_id CHAR(36) NOT NULL COMMENT '关联客户档案ID',
    segment_name VARCHAR(255) NOT NULL COMMENT '分群名称',
    description TEXT NULL COMMENT '分群描述',
    criteria JSON NOT NULL COMMENT 'JSON格式的分群规则',
    member_count INT NOT NULL DEFAULT 0 COMMENT '成员数量',
    member_ids JSON NULL COMMENT 'JSON格式的成员ID列表',
    segment_insights JSON NULL COMMENT 'JSON格式的分群洞察数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_customer_profile_id_segment_name (customer_profile_id, segment_name),
    CONSTRAINT fk_customer_segments_customer_profile FOREIGN KEY (customer_profile_id) REFERENCES customer_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户分群';

-- 4. 扩展现有 marketing_campaigns 表（营销活动）添加客户关联
-- 如果表存在但列不存在，则添加 customer_profile_id 列和外键约束
DELIMITER //
CREATE PROCEDURE add_customer_profile_to_campaigns()
BEGIN
    DECLARE column_exists INT DEFAULT 0;

    -- 检查 customer_profile_id 列是否存在
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_campaigns'
    AND COLUMN_NAME = 'customer_profile_id';

    IF column_exists = 0 THEN
        -- 添加 customer_profile_id 列
        ALTER TABLE marketing_campaigns
        ADD COLUMN customer_profile_id CHAR(36) NULL COMMENT '关联客户档案ID' AFTER user_id;

        -- 添加外键约束
        ALTER TABLE marketing_campaigns
        ADD CONSTRAINT fk_marketing_campaigns_customer_profile
        FOREIGN KEY (customer_profile_id) REFERENCES customer_profiles (id) ON DELETE SET NULL;

        -- 添加索引
        CREATE INDEX idx_customer_profile_id_status ON marketing_campaigns (customer_profile_id, status);
    END IF;
END //
DELIMITER ;

CALL add_customer_profile_to_campaigns();
DROP PROCEDURE add_customer_profile_to_campaigns;

-- 5. 扩展现有 marketing_strategies 表（营销策略）添加客户关联
DELIMITER //
CREATE PROCEDURE add_customer_profile_to_strategies()
BEGIN
    DECLARE column_exists INT DEFAULT 0;

    -- 检查 customer_profile_id 列是否存在
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_strategies'
    AND COLUMN_NAME = 'customer_profile_id';

    IF column_exists = 0 THEN
        -- 添加 customer_profile_id 列
        ALTER TABLE marketing_strategies
        ADD COLUMN customer_profile_id CHAR(36) NULL COMMENT '关联客户档案ID' AFTER campaign_id;

        -- 添加外键约束
        ALTER TABLE marketing_strategies
        ADD CONSTRAINT fk_marketing_strategies_customer_profile
        FOREIGN KEY (customer_profile_id) REFERENCES customer_profiles (id) ON DELETE SET NULL;

        -- 添加索引
        CREATE INDEX idx_customer_profile_id ON marketing_strategies (customer_profile_id);
    END IF;
END //
DELIMITER ;

CALL add_customer_profile_to_strategies();
DROP PROCEDURE add_customer_profile_to_strategies;

-- 6. 插入演示数据（可选，仅用于开发环境）
-- 注意：需要先有测试用户数据才能插入演示数据
-- 假设存在一个测试用户 ID: 'test-user-123'

-- INSERT INTO customer_profiles (id, user_id, customer_name, customer_type, industry, data_sources, profile_data) VALUES
-- ('customer-profile-1', 'test-user-123', '上海万达广场', 'ENTERPRISE', 'RETAIL', '{"sources": ["POS系统", "会员系统", "停车数据"]}', '{"location": "上海市浦东新区", "floorCount": 6, "storeCount": 300}'),
-- ('customer-profile-2', 'test-user-123', '星巴克咖啡（中国）', 'ENTERPRISE', 'RESTAURANT', '{"sources": ["会员APP", "线上订单", "门店销售"]}', '{"storeCount": 6000, "employeeCount": 50000}');

-- INSERT INTO data_import_jobs (id, customer_profile_id, source_type, original_filename, record_count, success_count, status, summary) VALUES
-- ('import-job-1', 'customer-profile-1', 'CSV', 'mall_customers_202403.csv', 1000, 950, 'SUCCESS', '{"totalRecords": 1000, "validRecords": 950, "invalidRecords": 50, "importDuration": "2.5s"}');

-- INSERT INTO customer_segments (id, customer_profile_id, segment_name, description, criteria, member_count, segment_insights) VALUES
-- ('segment-1', 'customer-profile-1', '高价值会员', '月消费超过5000元的会员', '{"criteria": {"minMonthlySpend": 5000, "memberTier": ["GOLD", "PLATINUM"]}}', 150, '{"averageSpend": 8500, "favoriteCategories": ["服装", "餐饮", "娱乐"]}'),
-- ('segment-2', 'customer-profile-1', '年轻家庭客群', '25-35岁有孩子的家庭', '{"criteria": {"ageRange": [25, 35], "hasChildren": true}}', 320, '{"averageSpend": 3200, "visitFrequency": "每周1.5次", "preferredTime": "周末白天"}');

-- 7. 创建索引优化查询性能
CREATE INDEX idx_customer_profiles_user_industry ON customer_profiles (user_id, industry);
CREATE INDEX idx_data_import_jobs_status_date ON data_import_jobs (status, created_at);
CREATE INDEX idx_customer_segments_member_count ON customer_segments (member_count DESC);

-- 完成迁移
SELECT '客户数据模块表结构创建完成' AS migration_status;