-- LuminaMedia SmartDataEngine 数据表结构
-- 版本: 1.0
-- 描述: 创建智能数据引擎相关表，包括数据质量监控表

USE lumina_media;

-- 1. 数据质量规则表
CREATE TABLE IF NOT EXISTS data_quality_rules (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    name VARCHAR(200) NOT NULL COMMENT '规则名称',
    table_name VARCHAR(100) NOT NULL COMMENT '表名',
    field_name VARCHAR(100) NULL COMMENT '字段名',
    condition TEXT NOT NULL COMMENT 'SQL条件表达式',
    threshold DECIMAL(5,3) NOT NULL COMMENT '阈值 (0-1)',
    severity VARCHAR(20) NOT NULL COMMENT '严重程度: info, warning, error',
    description TEXT NULL COMMENT '规则描述',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
    schedule VARCHAR(50) NULL COMMENT '定时执行cron表达式',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_table_name (table_name),
    KEY idx_is_active (is_active),
    KEY idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据质量规则定义';

-- 2. 数据质量结果表
CREATE TABLE IF NOT EXISTS data_quality_results (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    rule_id CHAR(36) NOT NULL COMMENT '关联规则ID',
    rule_name VARCHAR(200) NOT NULL COMMENT '规则名称',
    table_name VARCHAR(100) NOT NULL COMMENT '表名',
    field_name VARCHAR(100) NULL COMMENT '字段名',
    metric_value DECIMAL(10,6) NOT NULL COMMENT '指标值',
    threshold DECIMAL(5,3) NOT NULL COMMENT '阈值',
    severity VARCHAR(20) NOT NULL COMMENT '严重程度',
    passed BOOLEAN NOT NULL COMMENT '是否通过',
    execution_time TIMESTAMP NOT NULL COMMENT '执行时间',
    details JSON NULL COMMENT '详细结果数据',
    PRIMARY KEY (id),
    KEY idx_rule_id (rule_id),
    KEY idx_execution_time (execution_time),
    KEY idx_passed (passed),
    KEY idx_table_name (table_name),
    CONSTRAINT fk_data_quality_results_rule FOREIGN KEY (rule_id) REFERENCES data_quality_rules (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据质量检查结果';

-- 3. 插入示例数据质量规则
INSERT INTO data_quality_rules (id, name, table_name, field_name, condition, threshold, severity, description, is_active, schedule) VALUES
(
    UUID(),
    'mobile_phone_completeness',
    'customer_profiles',
    'mobile',
    'mobile IS NOT NULL AND LENGTH(mobile) = 11',
    0.95,
    'warning',
    '手机号完整度检查：非空且长度为11位',
    TRUE,
    '0 0 * * *'
),
(
    UUID(),
    'purchase_records_timeliness',
    'purchase_records',
    'purchase_date',
    'purchase_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
    0.8,
    'error',
    '购买记录时效性检查：近7天数据占比',
    TRUE,
    '0 0 * * *'
),
(
    UUID(),
    'email_format_validity',
    'customer_profiles',
    'email',
    'email IS NOT NULL AND email REGEXP "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"',
    0.90,
    'warning',
    '邮箱格式有效性检查',
    TRUE,
    '0 0 * * *'
);

-- 4. 为数据质量结果表添加分区（如果已启用分区）
-- 注意：仅当表已分区时执行
-- ALTER TABLE data_quality_results PARTITION BY RANGE (UNIX_TIMESTAMP(execution_time)) (
--     PARTITION p2024q1 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01')),
--     PARTITION p2024q2 VALUES LESS THAN (UNIX_TIMESTAMP('2024-07-01')),
--     PARTITION p2024q3 VALUES LESS THAN (UNIX_TIMESTAMP('2024-10-01')),
--     PARTITION p2024q4 VALUES LESS THAN (UNIX_TIMESTAMP('2025-01-01')),
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );