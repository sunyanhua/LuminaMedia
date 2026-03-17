-- LuminaMedia 数据库初始化脚本
-- 版本: 1.0
-- 描述: 创建多租户内容矩阵管理系统的数据库结构

-- 1. 使用已创建的数据库
USE lumina_media;

-- 2. 创建 users 表
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    username VARCHAR(50) NOT NULL COMMENT '登录名',
    password_hash VARCHAR(255) NOT NULL COMMENT '加密后的密码',
    email VARCHAR(100) NOT NULL COMMENT '联系邮箱',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户';

-- 3. 创建 social_accounts 表
CREATE TABLE IF NOT EXISTS social_accounts (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    user_id CHAR(36) NOT NULL COMMENT '关联用户ID',
    platform ENUM('XHS', 'WECHAT_MP') NOT NULL COMMENT '平台枚举 (小红书/微信公众号)',
    account_name VARCHAR(100) NOT NULL COMMENT '账号显示名称',
    credentials JSON COMMENT '加密存储的Cookie/Session/Token等',
    status ENUM('ACTIVE', 'EXPIRED', 'RE_AUTH_REQUIRED') NOT NULL DEFAULT 'ACTIVE' COMMENT '账号状态',
    last_used_at TIMESTAMP NULL COMMENT '最后一次使用时间',
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_platform (platform),
    KEY idx_status (status),
    CONSTRAINT fk_social_accounts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社交账号管理';

-- 4. 创建 content_drafts 表
CREATE TABLE IF NOT EXISTS content_drafts (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    user_id CHAR(36) NOT NULL COMMENT '关联用户ID',
    platform_type ENUM('XHS', 'WECHAT_MP') NOT NULL COMMENT '适配平台',
    title VARCHAR(200) NOT NULL COMMENT 'AI生成的标题',
    content TEXT NOT NULL COMMENT 'AI生成的正文',
    media_urls JSON COMMENT '阿里云OSS上的图片/视频链接（JSON数组）',
    tags JSON COMMENT '话题标签（JSON数组）',
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_platform_type (platform_type),
    CONSTRAINT fk_content_drafts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容草稿库';

-- 5. 创建 publish_tasks 表
CREATE TABLE IF NOT EXISTS publish_tasks (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    draft_id CHAR(36) NOT NULL COMMENT '关联内容草稿ID',
    account_id CHAR(36) NOT NULL COMMENT '关联社交账号ID',
    status ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '任务状态',
    scheduled_at TIMESTAMP NULL COMMENT '计划发布时间',
    published_at TIMESTAMP NULL COMMENT '实际完成时间',
    post_url VARCHAR(500) NULL COMMENT '发布成功后的线上链接',
    error_message TEXT NULL COMMENT '失败原因记录',
    PRIMARY KEY (id),
    KEY idx_draft_id (draft_id),
    KEY idx_account_id (account_id),
    KEY idx_status (status),
    KEY idx_scheduled_at (scheduled_at),
    CONSTRAINT fk_publish_tasks_draft FOREIGN KEY (draft_id) REFERENCES content_drafts (id) ON DELETE CASCADE,
    CONSTRAINT fk_publish_tasks_account FOREIGN KEY (account_id) REFERENCES social_accounts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发布任务队列';

-- 6. 插入测试数据（可选，仅用于开发环境）
-- 注意：在生产环境中请删除或注释此部分
INSERT IGNORE INTO users (id, username, password_hash, email) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', '$2b$10$YourHashedPasswordHere', 'admin@example.com');

INSERT IGNORE INTO social_accounts (id, user_id, platform, account_name, credentials, status) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'XHS', '小红书测试账号', '{}', 'ACTIVE'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'WECHAT_MP', '公众号测试账号', '{}', 'ACTIVE');

INSERT IGNORE INTO content_drafts (id, user_id, platform_type, title, content, media_urls, tags) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'XHS', '测试标题', '测试内容', '["https://oss.example.com/image1.jpg"]', '["测试", "AI"]');

INSERT IGNORE INTO publish_tasks (id, draft_id, account_id, status, scheduled_at) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'PENDING', NOW());

-- 7. 完成提示
SELECT 'Database initialization completed successfully!' AS message;