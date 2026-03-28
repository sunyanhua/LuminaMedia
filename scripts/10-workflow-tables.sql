-- LuminaMedia 三审三校工作流数据表结构
-- 版本: 1.0
-- 描述: 创建内容发布审批工作流相关表，支持三审三校流程

USE lumina_media;

-- 1. 工作流主表
CREATE TABLE IF NOT EXISTS workflows (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    tenant_id VARCHAR(36) NOT NULL DEFAULT 'default-tenant' COMMENT '租户ID',
    content_draft_id CHAR(36) NOT NULL COMMENT '内容草稿ID',
    created_by VARCHAR(36) NOT NULL COMMENT '创建者用户ID',
    title VARCHAR(500) NULL COMMENT '工作流标题',
    description TEXT NULL COMMENT '工作流描述',
    status ENUM('DRAFT', 'EDITOR_REVIEW', 'AI_CHECK', 'MANAGER_REVIEW', 'LEGAL_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'NEEDS_REVISION', 'WITHDRAWN', 'CANCELLED') NOT NULL DEFAULT 'DRAFT' COMMENT '工作流状态',
    priority TINYINT NOT NULL DEFAULT 3 COMMENT '优先级 (1-5, 1最低, 5最高)',
    is_expedited BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否为加急流程',
    expected_completion_at TIMESTAMP NULL COMMENT '期望完成时间',
    completed_at TIMESTAMP NULL COMMENT '实际完成时间',
    config JSON NULL COMMENT '工作流配置 (节点配置、审批规则等)',
    current_node_index INT NOT NULL DEFAULT 0 COMMENT '当前活跃节点索引',
    completed_nodes_count INT NOT NULL DEFAULT 0 COMMENT '已完成节点数量',
    total_nodes_count INT NOT NULL DEFAULT 0 COMMENT '总节点数量',
    approval_history JSON NULL COMMENT '审批历史记录（摘要信息）',
    metadata JSON NULL COMMENT '元数据 (修改次数、耗时统计等)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_tenant_id (tenant_id),
    KEY idx_content_draft_id (content_draft_id),
    KEY idx_status (status),
    KEY idx_created_at (created_at),
    KEY idx_created_by (created_by),
    KEY idx_is_expedited (is_expedited),
    KEY idx_priority (priority),
    CONSTRAINT fk_workflows_content_draft FOREIGN KEY (content_draft_id) REFERENCES content_drafts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='三审三校工作流主表';

-- 2. 工作流节点表
CREATE TABLE IF NOT EXISTS workflow_nodes (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    tenant_id VARCHAR(36) NOT NULL DEFAULT 'default-tenant' COMMENT '租户ID',
    workflow_id CHAR(36) NOT NULL COMMENT '工作流ID',
    node_index INT NOT NULL COMMENT '节点索引（顺序）',
    node_type ENUM('EDITOR', 'AI', 'MANAGER', 'LEGAL', 'PARALLEL', 'SEQUENTIAL') NOT NULL COMMENT '节点类型',
    name VARCHAR(200) NOT NULL COMMENT '节点名称',
    description TEXT NULL COMMENT '节点描述',
    status ENUM('DRAFT', 'EDITOR_REVIEW', 'AI_CHECK', 'MANAGER_REVIEW', 'LEGAL_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'NEEDS_REVISION', 'WITHDRAWN', 'CANCELLED') NOT NULL DEFAULT 'DRAFT' COMMENT '节点状态',
    assigned_to VARCHAR(36) NULL COMMENT '节点处理人ID',
    role VARCHAR(100) NULL COMMENT '节点处理角色',
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否为必审节点',
    is_parallel BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否为并行节点',
    parallel_group VARCHAR(100) NULL COMMENT '并行组标识',
    timeout_hours INT NULL COMMENT '超时时间（小时）',
    started_at TIMESTAMP NULL COMMENT '节点开始时间',
    completed_at TIMESTAMP NULL COMMENT '节点完成时间',
    timeout_at TIMESTAMP NULL COMMENT '节点超时时间',
    result JSON NULL COMMENT '节点处理结果',
    config JSON NULL COMMENT '节点配置',
    dependencies TEXT NULL COMMENT '前置节点ID（逗号分隔）',
    metadata JSON NULL COMMENT '节点元数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_tenant_id (tenant_id),
    KEY idx_workflow_id (workflow_id),
    KEY idx_node_type (node_type),
    KEY idx_status (status),
    KEY idx_assigned_to (assigned_to),
    KEY idx_parallel_group (parallel_group),
    CONSTRAINT fk_workflow_nodes_workflow FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流节点表';

-- 3. 审批记录表
CREATE TABLE IF NOT EXISTS approval_records (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    tenant_id VARCHAR(36) NOT NULL DEFAULT 'default-tenant' COMMENT '租户ID',
    workflow_id CHAR(36) NOT NULL COMMENT '工作流ID',
    node_id CHAR(36) NULL COMMENT '节点ID',
    action ENUM('APPROVE', 'REJECT', 'RETURN_FOR_REVISION', 'TRANSFER', 'EXPEDITE') NOT NULL COMMENT '审批动作',
    actor_id VARCHAR(36) NOT NULL COMMENT '审批人ID',
    comments TEXT NULL COMMENT '审批意见',
    attachments TEXT NULL COMMENT '附件URL（逗号分隔）',
    transfer_to VARCHAR(36) NULL COMMENT '转交目标用户ID',
    is_expedited BOOLEAN NOT NULL DEFAULT FALSE COMMENT '加急标记',
    previous_status VARCHAR(50) NULL COMMENT '审批前状态',
    new_status VARCHAR(50) NULL COMMENT '审批后状态',
    ip_address VARCHAR(45) NULL COMMENT 'IP地址',
    user_agent TEXT NULL COMMENT '用户代理',
    device VARCHAR(200) NULL COMMENT '设备信息',
    location VARCHAR(200) NULL COMMENT '地理位置',
    metadata JSON NULL COMMENT '元数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_tenant_id (tenant_id),
    KEY idx_workflow_id (workflow_id),
    KEY idx_node_id (node_id),
    KEY idx_actor_id (actor_id),
    KEY idx_action (action),
    KEY idx_created_at (created_at),
    CONSTRAINT fk_approval_records_workflow FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_records_node FOREIGN KEY (node_id) REFERENCES workflow_nodes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审批记录表';

-- 4. 工作流通知表
CREATE TABLE IF NOT EXISTS workflow_notifications (
    id CHAR(36) NOT NULL COMMENT 'UUID 主键',
    tenant_id VARCHAR(36) NOT NULL DEFAULT 'default-tenant' COMMENT '租户ID',
    type ENUM('TASK_ASSIGNED', 'PENDING_APPROVAL', 'APPROVAL_COMPLETED', 'APPROVAL_TIMEOUT', 'WORKFLOW_STATUS_CHANGED', 'URGENT_APPROVAL') NOT NULL COMMENT '通知类型',
    recipient_id VARCHAR(36) NOT NULL COMMENT '接收人ID',
    workflow_id CHAR(36) NULL COMMENT '工作流ID',
    node_id CHAR(36) NULL COMMENT '节点ID',
    title VARCHAR(500) NOT NULL COMMENT '通知标题',
    content TEXT NOT NULL COMMENT '通知内容',
    status ENUM('PENDING', 'SENT', 'READ', 'ACTIONED', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '通知状态',
    channels TEXT NOT NULL COMMENT '发送渠道（逗号分隔）',
    sent_at TIMESTAMP NULL COMMENT '发送时间',
    read_at TIMESTAMP NULL COMMENT '阅读时间',
    actioned_at TIMESTAMP NULL COMMENT '动作时间',
    priority TINYINT NOT NULL DEFAULT 3 COMMENT '通知优先级 (1-5)',
    is_silent BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否静默通知',
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否重复通知',
    recurrence_interval INT NULL COMMENT '重复间隔（分钟）',
    next_send_at TIMESTAMP NULL COMMENT '下次发送时间',
    retry_count INT NOT NULL DEFAULT 0 COMMENT '重试次数',
    max_retries INT NOT NULL DEFAULT 3 COMMENT '最大重试次数',
    failure_reason TEXT NULL COMMENT '失败原因',
    metadata JSON NULL COMMENT '通知元数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_tenant_id (tenant_id),
    KEY idx_recipient_id (recipient_id),
    KEY idx_workflow_id (workflow_id),
    KEY idx_node_id (node_id),
    KEY idx_type (type),
    KEY idx_status (status),
    KEY idx_created_at (created_at),
    CONSTRAINT fk_workflow_notifications_workflow FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE SET NULL,
    CONSTRAINT fk_workflow_notifications_node FOREIGN KEY (node_id) REFERENCES workflow_nodes (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流通知表';

-- 5. 插入默认审批节点配置（示例）
INSERT INTO workflow_nodes (id, tenant_id, workflow_id, node_index, node_type, name, description, status, role, is_mandatory, timeout_hours, config) VALUES
(
    UUID(),
    'default-tenant',
    '00000000-0000-0000-0000-000000000000', -- 占位符，实际创建工作流时会替换
    0,
    'EDITOR',
    '编辑初审',
    '内容初审，检查基本质量和格式',
    'DRAFT',
    'editor',
    TRUE,
    24,
    '{"approvalRules": {"requireCommentsOnReject": true, "requireAttachments": false}, "notifications": {"remindBeforeTimeout": true, "remindIntervalHours": 12, "escalationRecipients": []}}'
),
(
    UUID(),
    'default-tenant',
    '00000000-0000-0000-0000-000000000000',
    1,
    'AI',
    'AI自检',
    'AI自动检查内容合规性和质量',
    'DRAFT',
    'ai_system',
    TRUE,
    1,
    '{"approvalRules": {"requireCommentsOnReject": true, "requireAttachments": false}, "notifications": {"remindBeforeTimeout": false, "remindIntervalHours": 1, "escalationRecipients": []}}'
),
(
    UUID(),
    'default-tenant',
    '00000000-0000-0000-0000-000000000000',
    2,
    'MANAGER',
    '主管复审',
    '主管审查内容策略和商业价值',
    'DRAFT',
    'manager',
    TRUE,
    48,
    '{"approvalRules": {"requireCommentsOnReject": true, "requireAttachments": false}, "notifications": {"remindBeforeTimeout": true, "remindIntervalHours": 24, "escalationRecipients": []}}'
),
(
    UUID(),
    'default-tenant',
    '00000000-0000-0000-0000-000000000000',
    3,
    'LEGAL',
    '法务终审',
    '法务审查合规性和法律风险',
    'DRAFT',
    'legal',
    TRUE,
    72,
    '{"approvalRules": {"requireCommentsOnReject": true, "requireAttachments": true}, "notifications": {"remindBeforeTimeout": true, "remindIntervalHours": 36, "escalationRecipients": ["legal_manager"]}}'
);

-- 6. 为工作流表添加分区（按租户ID分区，支持多租户数据隔离）
-- 注意：仅当需要分区时执行，分区数量根据租户数量调整
/*
ALTER TABLE workflows PARTITION BY KEY(tenant_id) PARTITIONS 16;
ALTER TABLE workflow_nodes PARTITION BY KEY(tenant_id) PARTITIONS 16;
ALTER TABLE approval_records PARTITION BY KEY(tenant_id) PARTITIONS 16;
ALTER TABLE workflow_notifications PARTITION BY KEY(tenant_id) PARTITIONS 16;
*/

-- 7. 创建视图：工作流统计视图
CREATE OR REPLACE VIEW workflow_stats_view AS
SELECT
    w.tenant_id,
    w.status,
    COUNT(*) as count,
    AVG(TIMESTAMPDIFF(HOUR, w.created_at, IFNULL(w.completed_at, NOW()))) as avg_hours,
    SUM(CASE WHEN w.is_expedited THEN 1 ELSE 0 END) as expedited_count
FROM workflows w
GROUP BY w.tenant_id, w.status;

-- 8. 创建视图：用户待办任务视图
CREATE OR REPLACE VIEW user_pending_tasks_view AS
SELECT
    wn.tenant_id,
    wn.assigned_to as user_id,
    COUNT(*) as pending_count,
    GROUP_CONCAT(DISTINCT wn.node_type) as node_types
FROM workflow_nodes wn
INNER JOIN workflows w ON wn.workflow_id = w.id
WHERE wn.status = 'EDITOR_REVIEW'
    AND wn.assigned_to IS NOT NULL
    AND w.status IN ('EDITOR_REVIEW', 'AI_CHECK', 'MANAGER_REVIEW', 'LEGAL_REVIEW')
GROUP BY wn.tenant_id, wn.assigned_to;