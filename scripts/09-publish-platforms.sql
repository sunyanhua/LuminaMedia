-- LuminaMedia 发布平台数据表结构
-- 版本: 1.0
-- 描述: 创建发布平台配置和发布记录表，支持微信、小红书、微博、抖音等多平台发布

USE lumina_media;

-- 1. 发布平台配置表
CREATE TABLE IF NOT EXISTS publish_platforms (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    tenant_id VARCHAR(36) NOT NULL DEFAULT 'default-tenant' COMMENT '租户ID',
    platform_type ENUM('WECHAT', 'XIAOHONGSHU', 'WEIBO', 'DOUYIN', 'TIKTOK', 'BILIBILI', 'KUAISHOU', 'OTHER') NOT NULL COMMENT '平台类型',
    name VARCHAR(200) NOT NULL COMMENT '平台名称',
    description TEXT NULL COMMENT '平台描述',
    enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
    credentials JSON NOT NULL COMMENT '平台凭证（加密存储）',
    options JSON NULL COMMENT '平台选项（超时、重试次数、代理等）',
    quota JSON NULL COMMENT '平台配额限制',
    webhook_url VARCHAR(500) NULL COMMENT 'Webhook回调URL',
    last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
    sync_status ENUM('PENDING', 'SYNCING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '同步状态',
    sync_error TEXT NULL COMMENT '同步错误信息',
    health_status ENUM('HEALTHY', 'DEGRADED', 'UNHEALTHY') NOT NULL DEFAULT 'HEALTHY' COMMENT '健康状态',
    health_checked_at TIMESTAMP NULL COMMENT '最后健康检查时间',
    stats JSON NULL COMMENT '平台统计信息（发布数、成功率等）',
    metadata JSON NULL COMMENT '元数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(36) NOT NULL COMMENT '创建者用户ID',
    updated_by VARCHAR(36) NULL COMMENT '更新者用户ID',
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenant_platform_type (tenant_id, platform_type),
    KEY idx_tenant_id (tenant_id),
    KEY idx_platform_type (platform_type),
    KEY idx_enabled (enabled),
    KEY idx_health_status (health_status),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发布平台配置表';

-- 2. 发布记录表
CREATE TABLE IF NOT EXISTS publish_records (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    tenant_id VARCHAR(36) NOT NULL DEFAULT 'default-tenant' COMMENT '租户ID',
    platform_type ENUM('WECHAT', 'XIAOHONGSHU', 'WEIBO', 'DOUYIN', 'TIKTOK', 'BILIBILI', 'KUAISHOU', 'OTHER') NOT NULL COMMENT '平台类型',
    platform_config_id CHAR(36) NOT NULL COMMENT '平台配置ID',
    content_draft_id CHAR(36) NULL COMMENT '内容草稿ID',
    workflow_id CHAR(36) NULL COMMENT '工作流ID',
    publish_id VARCHAR(200) NOT NULL COMMENT '平台返回的发布ID',
    title VARCHAR(500) NOT NULL COMMENT '内容标题',
    content_summary TEXT NULL COMMENT '内容摘要',
    publish_status ENUM('DRAFT', 'PENDING', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'DELETED', 'SCHEDULED') NOT NULL DEFAULT 'DRAFT' COMMENT '发布状态',
    publish_url VARCHAR(1000) NULL COMMENT '发布内容的URL',
    published_at TIMESTAMP NULL COMMENT '发布时间',
    scheduled_at TIMESTAMP NULL COMMENT '计划发布时间',
    publish_metadata JSON NULL COMMENT '发布元数据（平台返回的数据）',
    error_message TEXT NULL COMMENT '错误信息',
    retry_count INT NOT NULL DEFAULT 0 COMMENT '重试次数',
    max_retries INT NOT NULL DEFAULT 3 COMMENT '最大重试次数',
    next_retry_at TIMESTAMP NULL COMMENT '下次重试时间',
    platform_stats JSON NULL COMMENT '平台统计信息（阅读数、点赞数、评论数等）',
    audit_log JSON NULL COMMENT '审计日志（发布过程记录）',
    metadata JSON NULL COMMENT '元数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(36) NOT NULL COMMENT '创建者用户ID',
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenant_platform_publish_id (tenant_id, platform_type, publish_id),
    KEY idx_tenant_id (tenant_id),
    KEY idx_platform_type (platform_type),
    KEY idx_platform_config_id (platform_config_id),
    KEY idx_content_draft_id (content_draft_id),
    KEY idx_workflow_id (workflow_id),
    KEY idx_publish_status (publish_status),
    KEY idx_published_at (published_at),
    KEY idx_scheduled_at (scheduled_at),
    KEY idx_created_at (created_at),
    KEY idx_created_by (created_by),
    CONSTRAINT fk_publish_records_platform_config FOREIGN KEY (platform_config_id) REFERENCES publish_platforms (id) ON DELETE CASCADE,
    CONSTRAINT fk_publish_records_content_draft FOREIGN KEY (content_draft_id) REFERENCES content_drafts (id) ON DELETE SET NULL,
    CONSTRAINT fk_publish_records_workflow FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发布记录表';

-- 3. 发布平台统计表（用于快速查询）
CREATE TABLE IF NOT EXISTS publish_platform_stats (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    tenant_id VARCHAR(36) NOT NULL DEFAULT 'default-tenant' COMMENT '租户ID',
    platform_type ENUM('WECHAT', 'XIAOHONGSHU', 'WEIBO', 'DOUYIN', 'TIKTOK', 'BILIBILI', 'KUAISHOU', 'OTHER') NOT NULL COMMENT '平台类型',
    platform_config_id CHAR(36) NOT NULL COMMENT '平台配置ID',
    stat_date DATE NOT NULL COMMENT '统计日期',
    total_published INT NOT NULL DEFAULT 0 COMMENT '总发布数',
    total_failed INT NOT NULL DEFAULT 0 COMMENT '总失败数',
    total_scheduled INT NOT NULL DEFAULT 0 COMMENT '总定时发布数',
    total_deleted INT NOT NULL DEFAULT 0 COMMENT '总删除数',
    success_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '成功率（百分比）',
    avg_publish_time_ms INT NOT NULL DEFAULT 0 COMMENT '平均发布耗时（毫秒）',
    max_publish_time_ms INT NOT NULL DEFAULT 0 COMMENT '最大发布耗时（毫秒）',
    min_publish_time_ms INT NOT NULL DEFAULT 0 COMMENT '最小发布耗时（毫秒）',
    total_views BIGINT NOT NULL DEFAULT 0 COMMENT '总阅读数/播放数',
    total_likes BIGINT NOT NULL DEFAULT 0 COMMENT '总点赞数',
    total_comments BIGINT NOT NULL DEFAULT 0 COMMENT '总评论数',
    total_shares BIGINT NOT NULL DEFAULT 0 COMMENT '总分享数',
    platform_quota_used INT NOT NULL DEFAULT 0 COMMENT '平台配额使用量',
    platform_quota_remaining INT NOT NULL DEFAULT 0 COMMENT '平台配额剩余量',
    metadata JSON NULL COMMENT '元数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenant_platform_stat_date (tenant_id, platform_type, stat_date),
    KEY idx_tenant_id (tenant_id),
    KEY idx_platform_type (platform_type),
    KEY idx_stat_date (stat_date),
    KEY idx_success_rate (success_rate),
    CONSTRAINT fk_publish_platform_stats_platform_config FOREIGN KEY (platform_config_id) REFERENCES publish_platforms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发布平台统计表';

-- 4. 发布内容素材表（存储发布的内容和素材）
CREATE TABLE IF NOT EXISTS publish_content_materials (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    tenant_id VARCHAR(36) NOT NULL DEFAULT 'default-tenant' COMMENT '租户ID',
    publish_record_id CHAR(36) NOT NULL COMMENT '发布记录ID',
    material_type ENUM('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER') NOT NULL COMMENT '素材类型',
    material_url VARCHAR(1000) NOT NULL COMMENT '素材URL',
    platform_media_id VARCHAR(200) NULL COMMENT '平台返回的素材ID',
    platform_media_url VARCHAR(1000) NULL COMMENT '平台返回的素材URL',
    file_size BIGINT NULL COMMENT '文件大小（字节）',
    file_format VARCHAR(50) NULL COMMENT '文件格式',
    duration_seconds INT NULL COMMENT '时长（秒，视频/音频）',
    width INT NULL COMMENT '宽度（像素，图片/视频）',
    height INT NULL COMMENT '高度（像素，图片/视频）',
    thumbnail_url VARCHAR(1000) NULL COMMENT '缩略图URL',
    metadata JSON NULL COMMENT '元数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_tenant_id (tenant_id),
    KEY idx_publish_record_id (publish_record_id),
    KEY idx_material_type (material_type),
    KEY idx_platform_media_id (platform_media_id),
    CONSTRAINT fk_publish_content_materials_record FOREIGN KEY (publish_record_id) REFERENCES publish_records (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发布内容素材表';

-- 5. 插入默认平台配置（示例）
INSERT IGNORE INTO publish_platforms (
    id,
    tenant_id,
    platform_type,
    name,
    description,
    enabled,
    credentials,
    options,
    quota,
    created_by
) VALUES
(
    UUID(),
    'default-tenant',
    'WECHAT',
    '微信公众号示例',
    '企业微信公众号示例配置',
    TRUE,
    JSON_OBJECT(
        'appId', 'your_wechat_app_id',
        'appSecret', 'your_wechat_app_secret',
        'wechatId', 'your_wechat_id',
        'wechatName', '企业公众号'
    ),
    JSON_OBJECT(
        'timeout', 30000,
        'maxRetries', 3,
        'retryDelay', 5000
    ),
    JSON_OBJECT(
        'dailyLimit', 1000,
        'perMinuteLimit', 10
    ),
    'system'
),
(
    UUID(),
    'default-tenant',
    'XIAOHONGSHU',
    '小红书示例',
    '企业小红书账号示例配置',
    TRUE,
    JSON_OBJECT(
        'username', 'your_xhs_username',
        'password', 'your_xhs_password'
    ),
    JSON_OBJECT(
        'timeout', 60000,
        'maxRetries', 2,
        'retryDelay', 10000
    ),
    JSON_OBJECT(
        'dailyLimit', 10,
        'maxImages', 9
    ),
    'system'
),
(
    UUID(),
    'default-tenant',
    'WEIBO',
    '微博示例',
    '企业微博账号示例配置',
    TRUE,
    JSON_OBJECT(
        'appKey', 'your_weibo_app_key',
        'appSecret', 'your_weibo_app_secret'
    ),
    JSON_OBJECT(
        'timeout', 30000,
        'maxRetries', 2,
        'retryDelay', 5000
    ),
    JSON_OBJECT(
        'dailyLimit', 1000,
        'maxImages', 9
    ),
    'system'
),
(
    UUID(),
    'default-tenant',
    'DOUYIN',
    '抖音示例',
    '企业抖音账号示例配置',
    TRUE,
    JSON_OBJECT(
        'clientKey', 'your_douyin_client_key',
        'clientSecret', 'your_douyin_client_secret'
    ),
    JSON_OBJECT(
        'timeout', 60000,
        'maxRetries', 1,
        'retryDelay', 15000
    ),
    JSON_OBJECT(
        'dailyLimit', 50,
        'maxVideoSize', 100000000,
        'maxVideoDuration', 300
    ),
    'system'
);

-- 6. 创建存储过程：更新平台统计
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS update_publish_platform_stats(
    IN p_tenant_id VARCHAR(36),
    IN p_platform_type VARCHAR(50),
    IN p_stat_date DATE
)
BEGIN
    DECLARE v_total_published INT;
    DECLARE v_total_failed INT;
    DECLARE v_total_scheduled INT;
    DECLARE v_total_deleted INT;
    DECLARE v_success_rate DECIMAL(5,2);
    DECLARE v_avg_publish_time_ms INT;
    DECLARE v_max_publish_time_ms INT;
    DECLARE v_min_publish_time_ms INT;

    -- 计算统计数据
    SELECT
        COUNT(CASE WHEN publish_status = 'PUBLISHED' THEN 1 END),
        COUNT(CASE WHEN publish_status = 'FAILED' THEN 1 END),
        COUNT(CASE WHEN publish_status = 'SCHEDULED' THEN 1 END),
        COUNT(CASE WHEN publish_status = 'DELETED' THEN 1 END),
        CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(COUNT(CASE WHEN publish_status = 'PUBLISHED' THEN 1 END) * 100.0 / COUNT(*), 2)
        END,
        COALESCE(AVG(TIMESTAMPDIFF(MILLISECOND, created_at, published_at)), 0),
        COALESCE(MAX(TIMESTAMPDIFF(MILLISECOND, created_at, published_at)), 0),
        COALESCE(MIN(TIMESTAMPDIFF(MILLISECOND, created_at, published_at)), 0)
    INTO
        v_total_published,
        v_total_failed,
        v_total_scheduled,
        v_total_deleted,
        v_success_rate,
        v_avg_publish_time_ms,
        v_max_publish_time_ms,
        v_min_publish_time_ms
    FROM publish_records
    WHERE tenant_id = p_tenant_id
        AND platform_type = p_platform_type
        AND DATE(created_at) = p_stat_date;

    -- 更新或插入统计记录
    INSERT INTO publish_platform_stats (
        id,
        tenant_id,
        platform_type,
        platform_config_id,
        stat_date,
        total_published,
        total_failed,
        total_scheduled,
        total_deleted,
        success_rate,
        avg_publish_time_ms,
        max_publish_time_ms,
        min_publish_time_ms,
        created_at,
        updated_at
    )
    VALUES (
        UUID(),
        p_tenant_id,
        p_platform_type,
        (SELECT id FROM publish_platforms WHERE tenant_id = p_tenant_id AND platform_type = p_platform_type LIMIT 1),
        p_stat_date,
        v_total_published,
        v_total_failed,
        v_total_scheduled,
        v_total_deleted,
        v_success_rate,
        v_avg_publish_time_ms,
        v_max_publish_time_ms,
        v_min_publish_time_ms,
        NOW(),
        NOW()
    )
    ON DUPLICATE KEY UPDATE
        total_published = v_total_published,
        total_failed = v_total_failed,
        total_scheduled = v_total_scheduled,
        total_deleted = v_total_deleted,
        success_rate = v_success_rate,
        avg_publish_time_ms = v_avg_publish_time_ms,
        max_publish_time_ms = v_max_publish_time_ms,
        min_publish_time_ms = v_min_publish_time_ms,
        updated_at = NOW();
END$$

DELIMITER ;

-- 7. 创建事件：每日更新统计
CREATE EVENT IF NOT EXISTS daily_publish_stats_update
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE, '23:59:59')
DO
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_tenant_id VARCHAR(36);
    DECLARE v_platform_type VARCHAR(50);
    DECLARE cur CURSOR FOR SELECT DISTINCT tenant_id, platform_type FROM publish_records WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_tenant_id, v_platform_type;
        IF done THEN
            LEAVE read_loop;
        END IF;

        CALL update_publish_platform_stats(v_tenant_id, v_platform_type, CURDATE() - INTERVAL 1 DAY);
    END LOOP;

    CLOSE cur;
END;

-- 8. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_publish_records_tenant_status_date
ON publish_records (tenant_id, publish_status, published_at);

CREATE INDEX IF NOT EXISTS idx_publish_platforms_tenant_enabled
ON publish_platforms (tenant_id, enabled, platform_type);

-- 9. 创建视图：平台发布概览
CREATE OR REPLACE VIEW v_publish_platform_overview AS
SELECT
    pp.tenant_id,
    pp.platform_type,
    pp.name AS platform_name,
    pp.enabled,
    pp.health_status,
    pp.health_checked_at,
    COALESCE(prs.total_published, 0) AS total_published,
    COALESCE(prs.total_failed, 0) AS total_failed,
    COALESCE(prs.success_rate, 0) AS success_rate,
    COALESCE(prs.avg_publish_time_ms, 0) AS avg_publish_time_ms,
    COUNT(DISTINCT pr.id) AS today_published,
    COUNT(DISTINCT CASE WHEN pr.publish_status = 'FAILED' THEN pr.id END) AS today_failed
FROM publish_platforms pp
LEFT JOIN publish_platform_stats prs ON pp.tenant_id = prs.tenant_id
    AND pp.platform_type = prs.platform_type
    AND prs.stat_date = CURDATE() - INTERVAL 1 DAY
LEFT JOIN publish_records pr ON pp.tenant_id = pr.tenant_id
    AND pp.platform_type = pr.platform_type
    AND DATE(pr.created_at) = CURDATE()
GROUP BY
    pp.tenant_id,
    pp.platform_type,
    pp.name,
    pp.enabled,
    pp.health_status,
    pp.health_checked_at,
    prs.total_published,
    prs.total_failed,
    prs.success_rate,
    prs.avg_publish_time_ms;

-- 10. 注释
-- 表说明：
-- 1. publish_platforms: 发布平台配置表，存储各平台的凭证和配置
-- 2. publish_records: 发布记录表，存储每次发布的详细记录
-- 3. publish_platform_stats: 发布平台统计表，按日统计发布数据
-- 4. publish_content_materials: 发布内容素材表，存储发布的图片、视频等素材
--
-- 使用说明：
-- 1. 首次部署时执行此脚本创建表结构
-- 2. 默认平台配置需要根据实际情况修改凭证信息
-- 3. 统计存储过程会自动更新每日发布数据
-- 4. 事件调度器会在每天23:59:59更新前一天的统计