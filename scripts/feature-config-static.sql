-- 功能配置系统静态SQL脚本
-- 版本: 1.0
-- 描述: 创建功能配置表和租户功能开关表（静态版本）
-- 执行时间: 2026-04-04

USE lumina_media;

-- 创建功能配置表（如果不存在）
CREATE TABLE IF NOT EXISTS feature_configs (
    id CHAR(36) PRIMARY KEY,
    feature_name VARCHAR(100) NOT NULL COMMENT '功能名称',
    feature_key VARCHAR(100) NOT NULL COMMENT '功能唯一标识（如customer-analytics）',
    description TEXT COMMENT '功能描述',
    module_name VARCHAR(100) NOT NULL COMMENT '对应的模块名',
    tenant_types JSON NOT NULL COMMENT '适用的租户类型数组',
    required_permissions JSON COMMENT '所需权限列表（module:action格式）',
    is_enabled_by_default BOOLEAN DEFAULT TRUE COMMENT '是否默认启用',
    requires_ai BOOLEAN DEFAULT FALSE COMMENT '是否需要AI服务',
    requires_publish BOOLEAN DEFAULT FALSE COMMENT '是否需要发布功能',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_feature_configs_feature_key (feature_key),
    INDEX idx_feature_configs_module_name (module_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='功能配置表';

-- 插入商务版功能配置（如果不存在）
INSERT IGNORE INTO feature_configs (id, feature_name, feature_key, description, module_name, tenant_types, required_permissions, is_enabled_by_default, requires_ai, requires_publish) VALUES
(UUID(), '客户画像分析', 'customer-analytics', '客户画像分析功能', 'customer-analytics', '["business", "demo_business"]', '["customer-analytics:read", "customer-analytics:write"]', TRUE, TRUE, FALSE),
(UUID(), '客户数据导入', 'customer-data-import', '客户数据导入功能', 'customer-data-import', '["business", "demo_business"]', '["customer-data:import"]', TRUE, FALSE, FALSE),
(UUID(), '客户分群', 'customer-segmentation', '客户分群功能', 'customer-segmentation', '["business", "demo_business"]', '["customer-segmentation:read", "customer-segmentation:write"]', TRUE, TRUE, FALSE),
(UUID(), '企业画像', 'enterprise-profile', '企业画像生成功能', 'enterprise-profile', '["business", "demo_business"]', '["enterprise-profile:read", "enterprise-profile:write"]', TRUE, TRUE, FALSE);

-- 插入政务版功能配置（如果不存在）
INSERT IGNORE INTO feature_configs (id, feature_name, feature_key, description, module_name, tenant_types, required_permissions, is_enabled_by_default, requires_ai, requires_publish) VALUES
(UUID(), '舆情情感分析', 'sentiment-analysis', '舆情情感分析功能', 'sentiment-analysis', '["government", "demo_government"]', '["sentiment-analysis:read"]', TRUE, TRUE, FALSE),
(UUID(), 'GEO地域分析', 'geo-analysis', 'GEO地域分析功能', 'geo-analysis', '["government", "demo_government"]', '["geo-analysis:read"]', TRUE, TRUE, FALSE),
(UUID(), '政务内容发布', 'government-publish', '政务内容发布功能', 'government-publish', '["government", "demo_government"]', '["government-publish:write", "government-publish:publish"]', TRUE, FALSE, TRUE);

-- 插入通用功能配置（如果不存在）
INSERT IGNORE INTO feature_configs (id, feature_name, feature_key, description, module_name, tenant_types, required_permissions, is_enabled_by_default, requires_ai, requires_publish) VALUES
(UUID(), 'AI智策工厂', 'ai-campaign-lab', 'AI智策工厂功能', 'ai-campaign-lab', '["business", "government", "demo_business", "demo_government"]', '["campaign:read", "campaign:write"]', TRUE, TRUE, FALSE),
(UUID(), '矩阵分发中心', 'matrix-publish', '矩阵分发中心功能', 'matrix-publish', '["business", "government", "demo_business", "demo_government"]', '["publish:read", "publish:write", "publish:publish"]', TRUE, FALSE, TRUE);

-- 创建租户功能开关表（如果不存在）
CREATE TABLE IF NOT EXISTS tenant_feature_toggles (
    id CHAR(36) PRIMARY KEY,
    tenant_id CHAR(36) NOT NULL COMMENT '租户ID',
    feature_key VARCHAR(100) NOT NULL COMMENT '功能唯一标识',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    enabled_at TIMESTAMP NULL COMMENT '启用时间',
    disabled_at TIMESTAMP NULL COMMENT '禁用时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_tenant_feature_toggles_tenant_id (tenant_id),
    INDEX idx_tenant_feature_toggles_feature_key (feature_key),
    UNIQUE KEY uk_tenant_feature (tenant_id, feature_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租户功能开关表';

-- 验证表创建
SELECT 'feature_configs table created' AS result;
SELECT COUNT(*) AS feature_configs_count FROM feature_configs;

SELECT 'tenant_feature_toggles table created' AS result;
SELECT COUNT(*) AS tenant_feature_toggles_count FROM tenant_feature_toggles;

-- 显示创建的表结构
DESCRIBE feature_configs;
DESCRIBE tenant_feature_toggles;