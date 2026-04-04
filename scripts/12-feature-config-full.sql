-- LuminaMedia 功能配置系统迁移脚本
-- 版本: 1.0
-- 描述: 创建功能配置和租户功能开关系统
-- 执行时间: 2026-04-03

USE lumina_media;

-- 步骤1: 为roles和permissions表添加tenant_type字段
SET @roles_has_tenant_type = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'lumina_media'
    AND table_name = 'roles'
    AND column_name = 'tenant_type'
);

SELECT IF(@roles_has_tenant_type > 0, 'roles.tenant_type already exists', 'adding tenant_type to roles') AS status;

SET @sql_add_tenant_type_roles = IF(@roles_has_tenant_type = 0,
    'ALTER TABLE roles ADD COLUMN tenant_type ENUM(\'business\', \'government\', \'demo_business\', \'demo_government\', \'development\') DEFAULT \'business\' COMMENT \'租户类型限制\';',
    'SELECT \'roles.tenant_type already exists, skipping\' AS result;'
);

PREPARE stmt_roles FROM @sql_add_tenant_type_roles;
EXECUTE stmt_roles;
DEALLOCATE PREPARE stmt_roles;

SET @permissions_has_tenant_type = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'lumina_media'
    AND table_name = 'permissions'
    AND column_name = 'tenant_type'
);

SELECT IF(@permissions_has_tenant_type > 0, 'permissions.tenant_type already exists', 'adding tenant_type to permissions') AS status;

SET @sql_add_tenant_type_permissions = IF(@permissions_has_tenant_type = 0,
    'ALTER TABLE permissions ADD COLUMN tenant_type ENUM(\'business\', \'government\', \'demo_business\', \'demo_government\', \'development\', \'all\') DEFAULT \'all\' COMMENT \'租户类型限制\';',
    'SELECT \'permissions.tenant_type already exists, skipping\' AS result;'
);

PREPARE stmt_permissions FROM @sql_add_tenant_type_permissions;
EXECUTE stmt_permissions;
DEALLOCATE PREPARE stmt_permissions;

-- 步骤2: 创建feature_configs表
SET @feature_configs_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = 'lumina_media'
    AND table_name = 'feature_configs'
);

SELECT IF(@feature_configs_exists > 0, 'feature_configs table already exists', 'creating feature_configs table') AS status;

SET @sql_create_feature_configs = IF(@feature_configs_exists = 0,
    'CREATE TABLE feature_configs (
        id CHAR(36) PRIMARY KEY,
        feature_name VARCHAR(100) NOT NULL COMMENT \'功能名称\',
        feature_key VARCHAR(100) NOT NULL COMMENT \'功能唯一标识\',
        description TEXT COMMENT \'功能描述\',
        module_name VARCHAR(100) NOT NULL COMMENT \'对应的模块名\',
        tenant_types JSON NOT NULL COMMENT \'适用的租户类型数组\',
        required_permissions JSON COMMENT \'所需权限列表\',
        is_enabled_by_default BOOLEAN DEFAULT TRUE COMMENT \'是否默认启用\',
        requires_ai BOOLEAN DEFAULT FALSE COMMENT \'是否需要AI服务\',
        requires_publish BOOLEAN DEFAULT FALSE COMMENT \'是否需要发布功能\',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_feature_configs_feature_key (feature_key),
        UNIQUE KEY uk_feature_configs_feature_key (feature_key),
        INDEX idx_feature_configs_module_name (module_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT \'功能配置表\';',
    'SELECT \'feature_configs table already exists, skipping creation\' AS result;'
);

PREPARE stmt_feature_configs FROM @sql_create_feature_configs;
EXECUTE stmt_feature_configs;
DEALLOCATE PREPARE stmt_feature_configs;

-- 插入初始功能配置数据（使用INSERT IGNORE避免重复）
INSERT IGNORE INTO feature_configs (id, feature_name, feature_key, description, module_name, tenant_types, required_permissions, is_enabled_by_default, requires_ai, requires_publish) VALUES
(UUID(), '客户画像分析', 'customer-analytics', '客户画像分析功能', 'customer-analytics', '["business", "demo_business"]', '["customer-analytics:read", "customer-analytics:write"]', TRUE, TRUE, FALSE),
(UUID(), '客户数据导入', 'customer-data-import', '客户数据导入功能', 'customer-data-import', '["business", "demo_business"]', '["customer-data:import"]', TRUE, FALSE, FALSE),
(UUID(), '客户分群', 'customer-segmentation', '客户分群功能', 'customer-segmentation', '["business", "demo_business"]', '["customer-segmentation:read", "customer-segmentation:write"]', TRUE, TRUE, FALSE),
(UUID(), '企业画像', 'enterprise-profile', '企业画像生成功能', 'enterprise-profile', '["business", "demo_business"]', '["enterprise-profile:read", "enterprise-profile:write"]', TRUE, TRUE, FALSE),

(UUID(), '舆情情感分析', 'sentiment-analysis', '舆情情感分析功能', 'sentiment-analysis', '["government", "demo_government"]', '["sentiment-analysis:read"]', TRUE, TRUE, FALSE),
(UUID(), 'GEO地域分析', 'geo-analysis', 'GEO地域分析功能', 'geo-analysis', '["government", "demo_government"]', '["geo-analysis:read"]', TRUE, TRUE, FALSE),
(UUID(), '政务内容发布', 'government-publish', '政务内容发布功能', 'government-publish', '["government", "demo_government"]', '["government-publish:write", "government-publish:publish"]', TRUE, FALSE, TRUE),

(UUID(), 'AI智策工厂', 'ai-campaign-lab', 'AI智策工厂功能', 'ai-campaign-lab', '["business", "government", "demo_business", "demo_government"]', '["campaign:read", "campaign:write"]', TRUE, TRUE, FALSE),
(UUID(), '矩阵分发中心', 'matrix-publish', '矩阵分发中心功能', 'matrix-publish', '["business", "government", "demo_business", "demo_government"]', '["publish:read", "publish:write", "publish:publish"]', TRUE, FALSE, TRUE);

-- 步骤3: 创建tenant_feature_toggles表
SET @tenant_feature_toggles_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = 'lumina_media'
    AND table_name = 'tenant_feature_toggles'
);

SELECT IF(@tenant_feature_toggles_exists > 0, 'tenant_feature_toggles table already exists', 'creating tenant_feature_toggles table') AS status;

SET @sql_create_tenant_feature_toggles = IF(@tenant_feature_toggles_exists = 0,
    'CREATE TABLE tenant_feature_toggles (
        id CHAR(36) PRIMARY KEY,
        tenant_id CHAR(36) NOT NULL COMMENT \'租户ID\',
        feature_key VARCHAR(100) NOT NULL COMMENT \'功能唯一标识\',
        is_enabled BOOLEAN DEFAULT TRUE COMMENT \'是否启用\',
        enabled_at TIMESTAMP NULL COMMENT \'启用时间\',
        disabled_at TIMESTAMP NULL COMMENT \'禁用时间\',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        INDEX idx_tenant_feature_toggles_tenant_id (tenant_id),
        INDEX idx_tenant_feature_toggles_feature_key (feature_key),
        UNIQUE KEY uk_tenant_feature (tenant_id, feature_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT \'租户功能开关表\';

    SELECT \'tenant_feature_toggles table created successfully\' AS result;',
    'SELECT \'tenant_feature_toggles table already exists, skipping creation\' AS result;'
);

PREPARE stmt_toggles FROM @sql_create_tenant_feature_toggles;
EXECUTE stmt_toggles;
DEALLOCATE PREPARE stmt_toggles;

-- 步骤4: 为演示租户初始化功能开关
-- 注意: 这需要在演示租户创建后手动执行

SELECT '=== 功能配置系统迁移完成 ===' AS migration_result;