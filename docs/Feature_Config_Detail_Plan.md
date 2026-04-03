# LuminaMedia 功能配置细化方案

## 1. 现状分析

### 1.1 现有RBAC系统
- **数据库表**：
  - `roles` - 角色表
  - `permissions` - 权限表
  - `role_permissions` - 角色权限关联表
  - `user_roles` - 用户角色关联表
- **权限结构**：
  - 权限按`module`和`action`组织（如`module=content, action=read`）
  - 权限与租户关联（`tenant_id`字段）
- **角色配置**：
  - 默认角色：`admin`、`editor`、`viewer`
  - 权限分配：通过`role_permissions`表关联

### 1.2 现有Guard机制
- **JwtAuthGuard** - JWT认证
- **RolesGuard** - 基于角色的访问控制
- **PermissionsGuard** - 基于权限的访问控制

---

## 2. 细化方案设计

### 2.1 扩展现有RBAC系统

#### 2.1.1 为roles表增加tenant_type字段

**数据库修改**：
```sql
-- 为roles表添加tenant_type字段
ALTER TABLE roles 
ADD COLUMN tenant_type ENUM(
    'business', 
    'government', 
    'demo_business', 
    'demo_government', 
    'development'
) DEFAULT 'business' COMMENT '租户类型限制';

-- 为permissions表添加tenant_type字段
ALTER TABLE permissions 
ADD COLUMN tenant_type ENUM(
    'business', 
    'government', 
    'demo_business', 
    'demo_government', 
    'development',
    'all'  -- 适用于所有类型
) DEFAULT 'all' COMMENT '租户类型限制';
```

**TypeORM实体修改**：
```typescript
// src/entities/role.entity.ts
export enum TenantType {
  BUSINESS = 'business',
  GOVERNMENT = 'government',
  DEMO_BUSINESS = 'demo_business',
  DEMO_GOVERNMENT = 'demo_government',
  DEVELOPMENT = 'development',
}

@Entity('roles')
export class Role {
  // ... existing fields ...
  
  @Column({
    type: 'enum',
    enum: TenantType,
    default: TenantType.BUSINESS,
  })
  tenantType: TenantType;
}

// src/entities/permission.entity.ts
@Entity('permissions')
export class Permission {
  // ... existing fields ...
  
  @Column({
    type: 'enum',
    enum: TenantType,
    default: 'all',
  })
  tenantType: TenantType | 'all';
}
```

#### 2.1.2 权限分配逻辑调整

**新增服务**：`src/modules/auth/services/tenant-feature.service.ts`
```typescript
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../../entities/role.entity';
import { Permission } from '../../../entities/permission.entity';
import { TenantType } from '../../../entities/tenant.entity';

export interface FeatureConfig {
  moduleName: string;
  description: string;
  tenantTypes: TenantType[];
  requiredPermissions: string[]; // permission module-action组合
  isEnabledByDefault: boolean;
  requiresAi: boolean; // 是否需要AI服务
  requiresPublish: boolean; // 是否需要发布功能
}

@Injectable()
export class TenantFeatureService {
  private readonly featureConfigs: FeatureConfig[] = [
    // 商务版特有功能
    {
      moduleName: 'customer-analytics',
      description: '客户画像分析',
      tenantTypes: [TenantType.BUSINESS, TenantType.DEMO_BUSINESS],
      requiredPermissions: ['customer-analytics:read', 'customer-analytics:write'],
      isEnabledByDefault: true,
      requiresAi: true,
      requiresPublish: false,
    },
    {
      moduleName: 'customer-data-import',
      description: '客户数据导入',
      tenantTypes: [TenantType.BUSINESS, TenantType.DEMO_BUSINESS],
      requiredPermissions: ['customer-data:import'],
      isEnabledByDefault: true,
      requiresAi: false,
      requiresPublish: false,
    },
    {
      moduleName: 'customer-segmentation',
      description: '客户分群',
      tenantTypes: [TenantType.BUSINESS, TenantType.DEMO_BUSINESS],
      requiredPermissions: ['customer-segmentation:read', 'customer-segmentation:write'],
      isEnabledByDefault: true,
      requiresAi: true,
      requiresPublish: false,
    },
    {
      moduleName: 'enterprise-profile',
      description: '企业画像生成',
      tenantTypes: [TenantType.BUSINESS, TenantType.DEMO_BUSINESS],
      requiredPermissions: ['enterprise-profile:read', 'enterprise-profile:write'],
      isEnabledByDefault: true,
      requiresAi: true,
      requiresPublish: false,
    },
    // 政务版特有功能
    {
      moduleName: 'sentiment-analysis',
      description: '舆情情感分析',
      tenantTypes: [TenantType.GOVERNMENT, TenantType.DEMO_GOVERNMENT],
      requiredPermissions: ['sentiment-analysis:read'],
      isEnabledByDefault: true,
      requiresAi: true,
      requiresPublish: false,
    },
    {
      moduleName: 'geo-analysis',
      description: 'GEO地域分析',
      tenantTypes: [TenantType.GOVERNMENT, TenantType.DEMO_GOVERNMENT],
      requiredPermissions: ['geo-analysis:read'],
      isEnabledByDefault: true,
      requiresAi: true,
      requiresPublish: false,
    },
    {
      moduleName: 'government-publish',
      description: '政务内容发布',
      tenantTypes: [TenantType.GOVERNMENT, TenantType.DEMO_GOVERNMENT],
      requiredPermissions: ['government-publish:write', 'government-publish:publish'],
      isEnabledByDefault: true,
      requiresAi: false,
      requiresPublish: true,
    },
    // 通用功能
    {
      moduleName: 'ai-campaign-lab',
      description: 'AI智策工厂',
      tenantTypes: [
        TenantType.BUSINESS,
        TenantType.GOVERNMENT,
        TenantType.DEMO_BUSINESS,
        TenantType.DEMO_GOVERNMENT,
      ],
      requiredPermissions: ['campaign:read', 'campaign:write'],
      isEnabledByDefault: true,
      requiresAi: true,
      requiresPublish: false,
    },
    {
      moduleName: 'matrix-publish',
      description: '矩阵分发中心',
      tenantTypes: [
        TenantType.BUSINESS,
        TenantType.GOVERNMENT,
        TenantType.DEMO_BUSINESS,
        TenantType.DEMO_GOVERNMENT,
      ],
      requiredPermissions: ['publish:read', 'publish:write', 'publish:publish'],
      isEnabledByDefault: true,
      requiresAi: false,
      requiresPublish: true,
    },
  ];

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  /**
   * 根据租户类型获取可用的功能列表
   */
  getAvailableFeatures(tenantType: TenantType): FeatureConfig[] {
    return this.featureConfigs.filter((feature) =>
      feature.tenantTypes.includes(tenantType),
    );
  }

  /**
   * 检查特定功能是否对当前租户类型可用
   */
  isFeatureAvailable(
    featureName: string,
    tenantType: TenantType,
  ): boolean {
    const feature = this.featureConfigs.find(
      (f) => f.moduleName === featureName,
    );
    return !!feature && feature.tenantTypes.includes(tenantType);
  }

  /**
   * 获取所有功能配置
   */
  getAllFeatures(): FeatureConfig[] {
    return this.featureConfigs;
  }

  /**
   * 检查用户是否拥有特定功能的权限
   */
  async hasFeaturePermission(
    userId: string,
    tenantId: string,
    featureName: string,
  ): Promise<boolean> {
    const feature = this.featureConfigs.find(
      (f) => f.moduleName === featureName,
    );
    
    if (!feature) {
      return false;
    }

    // 检查用户是否拥有该功能所需的所有权限
    const userPermissions = await this.getUserPermissions(userId, tenantId);
    const hasAllRequired = feature.requiredPermissions.every((perm) => {
      const [module, action] = perm.split(':');
      return userPermissions.some(
        (p) => p.module === module && p.action === action,
      );
    });

    return hasAllRequired;
  }

  /**
   * 获取用户的所有权限
   */
  private async getUserPermissions(
    userId: string,
    tenantId: string,
  ): Promise<Permission[]> {
    const permissions = await this.permissionRepository
      .createQueryBuilder('permission')
      .innerJoin('permission.roles', 'role')
      .innerJoin('role.userRoles', 'userRole')
      .where('userRole.userId = :userId', { userId })
      .andWhere('permission.tenantId = :tenantId', { tenantId })
      .getMany();

    return permissions;
  }

  /**
   * 初始化演示租户的角色和权限
   */
  async initializeDemoTenantRoles(tenantId: string, tenantType: TenantType): Promise<void> {
    // 获取该租户类型可用的功能
    const availableFeatures = this.getAvailableFeatures(tenantType);
    
    // 创建演示管理员角色
    const adminRole = await this.roleRepository.save({
      name: 'demo_admin',
      description: '演示管理员',
      tenantId,
      tenantType,
    });

    // 收集所有需要的权限
    const allPermissions: Set<string> = new Set();
    availableFeatures.forEach((feature) => {
      feature.requiredPermissions.forEach((perm) => allPermissions.add(perm));
    });

    // 创建并分配权限
    const permissionsToAssign: Permission[] = [];
    for (const permStr of allPermissions) {
      const [module, action] = permStr.split(':');
      
      // 检查权限是否已存在
      let permission = await this.permissionRepository.findOne({
        where: { module, action, tenantId },
      });

      if (!permission) {
        // 创建新权限
        permission = await this.permissionRepository.save({
          module,
          action,
          description: `演示租户${module}模块的${action}权限`,
          tenantId,
          tenantType,
        });
      }

      permissionsToAssign.push(permission);
    }

    // 分配权限给角色
    adminRole.permissions = permissionsToAssign;
    await this.roleRepository.save(adminRole);
  }
}
```

### 2.2 动态功能配置表

#### 2.2.1 创建功能配置表

**数据库脚本**：`scripts/12-feature-config.sql`
```sql
-- 创建功能配置表
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

-- 插入商务版功能配置
INSERT INTO feature_configs (id, feature_name, feature_key, description, module_name, tenant_types, required_permissions, is_enabled_by_default, requires_ai, requires_publish) VALUES
(UUID(), '客户画像分析', 'customer-analytics', '客户画像分析功能', 'customer-analytics', '["business", "demo_business"]', '["customer-analytics:read", "customer-analytics:write"]', TRUE, TRUE, FALSE),
(UUID(), '客户数据导入', 'customer-data-import', '客户数据导入功能', 'customer-data-import', '["business", "demo_business"]', '["customer-data:import"]', TRUE, FALSE, FALSE),
(UUID(), '客户分群', 'customer-segmentation', '客户分群功能', 'customer-segmentation', '["business", "demo_business"]', '["customer-segmentation:read", "customer-segmentation:write"]', TRUE, TRUE, FALSE),
(UUID(), '企业画像', 'enterprise-profile', '企业画像生成功能', 'enterprise-profile', '["business", "demo_business"]', '["enterprise-profile:read", "enterprise-profile:write"]', TRUE, TRUE, FALSE);

-- 插入政务版功能配置
INSERT INTO feature_configs (id, feature_name, feature_key, description, module_name, tenant_types, required_permissions, is_enabled_by_default, requires_ai, requires_publish) VALUES
(UUID(), '舆情情感分析', 'sentiment-analysis', '舆情情感分析功能', 'sentiment-analysis', '["government", "demo_government"]', '["sentiment-analysis:read"]', TRUE, TRUE, FALSE),
(UUID(), 'GEO地域分析', 'geo-analysis', 'GEO地域分析功能', 'geo-analysis', '["government", "demo_government"]', '["geo-analysis:read"]', TRUE, TRUE, FALSE),
(UUID(), '政务内容发布', 'government-publish', '政务内容发布功能', 'government-publish', '["government", "demo_government"]', '["government-publish:write", "government-publish:publish"]', TRUE, FALSE, TRUE);

-- 插入通用功能配置
INSERT INTO feature_configs (id, feature_name, feature_key, description, module_name, tenant_types, required_permissions, is_enabled_by_default, requires_ai, requires_publish) VALUES
(UUID(), 'AI智策工厂', 'ai-campaign-lab', 'AI智策工厂功能', 'ai-campaign-lab', '["business", "government", "demo_business", "demo_government"]', '["campaign:read", "campaign:write"]', TRUE, TRUE, FALSE),
(UUID(), '矩阵分发中心', 'matrix-publish', '矩阵分发中心功能', 'matrix-publish', '["business", "government", "demo_business", "demo_government"]', '["publish:read", "publish:write", "publish:publish"]', TRUE, FALSE, TRUE);

-- 创建租户功能开关表
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
```

#### 2.2.2 功能配置服务

**新增服务**：`src/modules/auth/services/feature-config.service.ts`
```typescript
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantType } from '../../../entities/tenant.entity';

export interface FeatureConfigEntity {
  id: string;
  featureName: string;
  featureKey: string;
  description: string;
  moduleName: string;
  tenantTypes: TenantType[];
  requiredPermissions: string[];
  isEnabledByDefault: boolean;
  requiresAi: boolean;
  requiresPublish: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantFeatureToggle {
  id: string;
  tenantId: string;
  featureKey: string;
  isEnabled: boolean;
  enabledAt?: Date;
  disabledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class FeatureConfigService {
  constructor(
    @InjectRepository('FeatureConfigRepository')
    private featureConfigRepository: Repository<any>,
    @InjectRepository('TenantFeatureToggleRepository')
    private tenantFeatureToggleRepository: Repository<any>,
  ) {}

  /**
   * 获取租户的所有功能配置
   */
  async getTenantFeatures(tenantId: string, tenantType: TenantType): Promise<FeatureConfigEntity[]> {
    // 获取所有适用的功能配置
    const allFeatures = await this.featureConfigRepository.find({
      where: {
        tenantTypes: (types: any[]) => types.includes(tenantType),
      },
    });

    // 获取租户的功能开关状态
    const toggles = await this.tenantFeatureToggleRepository.find({
      where: { tenantId },
    });

    // 合并配置和开关状态
    return allFeatures.map((feature) => {
      const toggle = toggles.find((t) => t.featureKey === feature.featureKey);
      return {
        ...feature,
        isEnabled: toggle ? toggle.isEnabled : feature.isEnabledByDefault,
      };
    });
  }

  /**
   * 检查特定功能是否对租户可用
   */
  async isFeatureEnabled(
    tenantId: string,
    featureKey: string,
  ): Promise<boolean> {
    const toggle = await this.tenantFeatureToggleRepository.findOne({
      where: { tenantId, featureKey },
    });

    if (toggle) {
      return toggle.isEnabled;
    }

    // 如果没有开关记录，使用默认值
    const feature = await this.featureConfigRepository.findOne({
      where: { featureKey },
    });

    return feature?.isEnabledByDefault ?? false;
  }

  /**
   * 启用/禁用租户功能
   */
  async toggleFeature(
    tenantId: string,
    featureKey: string,
    isEnabled: boolean,
  ): Promise<void> {
    let toggle = await this.tenantFeatureToggleRepository.findOne({
      where: { tenantId, featureKey },
    });

    if (toggle) {
      toggle.isEnabled = isEnabled;
      if (isEnabled) {
        toggle.enabledAt = new Date();
        toggle.disabledAt = null;
      } else {
        toggle.disabledAt = new Date();
        toggle.enabledAt = null;
      }
      await this.tenantFeatureToggleRepository.save(toggle);
    } else {
      toggle = this.tenantFeatureToggleRepository.create({
        tenantId,
        featureKey,
        isEnabled,
        enabledAt: isEnabled ? new Date() : null,
        disabledAt: isEnabled ? null : new Date(),
      });
      await this.tenantFeatureToggleRepository.save(toggle);
    }
  }

  /**
   * 初始化演示租户的功能开关
   */
  async initializeDemoTenantFeatures(
    tenantId: string,
    tenantType: TenantType,
  ): Promise<void> {
    // 获取该租户类型的所有功能
    const features = await this.featureConfigRepository.find({
      where: {
        tenantTypes: (types: any[]) => types.includes(tenantType),
      },
    });

    // 为每个功能创建开关记录（全部启用）
    for (const feature of features) {
      const toggle = this.tenantFeatureToggleRepository.create({
        tenantId,
        featureKey: feature.featureKey,
        isEnabled: true,
        enabledAt: new Date(),
      });
      await this.tenantFeatureToggleRepository.save(toggle);
    }
  }

  /**
   * 获取所有功能配置（用于管理后台）
   */
  async getAllFeatureConfigs(): Promise<FeatureConfigEntity[]> {
    return this.featureConfigRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
```

---

## 3. 功能开关Guard实现

### 3.1 新增FeatureGuard

**新增Guard**：`src/modules/auth/guards/feature.guard.ts`
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { FeatureConfigService } from '../services/feature-config.service';

export const FEATURE_KEY = 'feature';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureConfigService: FeatureConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureKey = this.reflector.getAllAndOverride<string>(
      FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!featureKey) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const tenantId = request['tenantId'] || request.user?.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('租户信息缺失');
    }

    // 检查功能是否启用
    const isEnabled = await this.featureConfigService.isFeatureEnabled(
      tenantId,
      featureKey,
    );

    if (!isEnabled) {
      throw new ForbiddenException(
        `功能 "${featureKey}" 当前未启用，请联系管理员`,
      );
    }

    return true;
  }
}
```

### 3.2 使用示例

**控制器装饰器**：
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeatureGuard } from '../auth/guards/feature.guard';
import { SetMetadata } from '@nestjs/common';

export const Feature = (featureKey: string) => SetMetadata('feature', featureKey);

@Controller('api/customer-analytics')
@UseGuards(JwtAuthGuard, FeatureGuard)
export class CustomerAnalyticsController {
  @Get('profile')
  @Feature('customer-analytics') // 使用功能开关
  async getProfile() {
    // ...
  }
}
```

---

## 4. 数据库迁移脚本

### 4.1 完整迁移脚本

**文件**：`scripts/12-feature-config-full.sql`
```sql
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
        INDEX idx_feature_configs_module_name (module_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT \'功能配置表\';
    
    -- 插入商务版功能
    INSERT INTO feature_configs (id, feature_name, feature_key, description, module_name, tenant_types, required_permissions, is_enabled_by_default, requires_ai, requires_publish) VALUES
    (UUID(), \'客户画像分析\', \'customer-analytics\', \'客户画像分析功能\', \'customer-analytics\', \'["business", "demo_business"]\', \'["customer-analytics:read", "customer-analytics:write"]\', TRUE, TRUE, FALSE),
    (UUID(), \'客户数据导入\', \'customer-data-import\', \'客户数据导入功能\', \'customer-data-import\', \'["business", "demo_business"]\', \'["customer-data:import"]\', TRUE, FALSE, FALSE),
    (UUID(), \'客户分群\', \'customer-segmentation\', \'客户分群功能\', \'customer-segmentation\', \'["business", "demo_business"]\', \'["customer-segmentation:read", "customer-segmentation:write"]\', TRUE, TRUE, FALSE),
    (UUID(), \'企业画像\', \'enterprise-profile\', \'企业画像生成功能\', \'enterprise-profile\', \'["business", "demo_business"]\', \'["enterprise-profile:read", "enterprise-profile:write"]\', TRUE, TRUE, FALSE);
    
    -- 插入政务版功能
    INSERT INTO feature_configs (id, feature_name, feature_key, description, module_name, tenant_types, required_permissions, is_enabled_by_default, requires_ai, requires_publish) VALUES
    (UUID(), \'舆情情感分析\', \'sentiment-analysis\', \'舆情情感分析功能\', \'sentiment-analysis\', \'["government", "demo_government"]\', \'["sentiment-analysis:read"]\', TRUE, TRUE, FALSE),
    (UUID(), \'GEO地域分析\', \'geo-analysis\', \'GEO地域分析功能\', \'geo-analysis\', \'["government", "demo_government"]\', \'["geo-analysis:read"]\', TRUE, TRUE, FALSE),
    (UUID(), \'政务内容发布\', \'government-publish\', \'政务内容发布功能\', \'government-publish\', \'["government", "demo_government"]\', \'["government-publish:write", "government-publish:publish"]\', TRUE, FALSE, TRUE);
    
    -- 插入通用功能
    INSERT INTO feature_configs (id, feature_name, feature_key, description, module_name, tenant_types, required_permissions, is_enabled_by_default, requires_ai, requires_publish) VALUES
    (UUID(), \'AI智策工厂\', \'ai-campaign-lab\', \'AI智策工厂功能\', \'ai-campaign-lab\', \'["business", "government", "demo_business", "demo_government"]\', \'["campaign:read", "campaign:write"]\', TRUE, TRUE, FALSE),
    (UUID(), \'矩阵分发中心\', \'matrix-publish\', \'矩阵分发中心功能\', \'matrix-publish\', \'["business", "government", "demo_business", "demo_government"]\', \'["publish:read", "publish:write", "publish:publish"]\', TRUE, FALSE, TRUE);
    
    SELECT \'feature_configs table created successfully\' AS result;',
    'SELECT \'feature_configs table already exists, skipping creation\' AS result;'
);

PREPARE stmt_feature_configs FROM @sql_create_feature_configs;
EXECUTE stmt_feature_configs;
DEALLOCATE PREPARE stmt_feature_configs;

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

SELECT \'=== 功能配置系统迁移完成 ===\' AS migration_result;
```

---

## 5. 实施步骤

### 5.1 阶段一：数据库迁移（预计1天）
- [ ] 执行`scripts/12-feature-config-full.sql`
- [ ] 验证表结构和初始数据
- [ ] 为现有演示租户初始化功能开关

### 5.2 阶段二：后端服务实现（预计2天）
- [ ] 创建`FeatureConfigService`
- [ ] 创建`TenantFeatureService`
- [ ] 创建`FeatureGuard`
- [ ] 修改`Role`和`Permission`实体
- [ ] 更新`RoleService`和`PermissionService`

### 5.3 阶段三：功能开关集成（预计2天）
- [ ] 为各控制器添加`@Feature()`装饰器
- [ ] 更新路由守卫配置
- [ ] 添加功能配置管理API

### 5.4 阶段四：前端适配（预计2天）
- [ ] 创建功能配置管理界面
- [ ] 根据功能开关动态加载菜单
- [ ] 添加功能禁用提示

### 5.5 阶段五：测试和验证（预计1天）
- [ ] 功能开关测试
- [ ] 租户隔离测试
- [ ] 权限验证测试

---

## 6. 管理后台界面

### 6.1 功能配置管理界面

**路径**：`/admin/feature-config`
```
┌─────────────────────────────────────────────┐
│ 功能配置管理                                 │
├─────────────────────────────────────────────┤
│ 功能名称  │ 租户类型  │ 默认启用 │ 需要AI  │ │
│─────────────────────────────────────────────│
│ 客户画像  │ 商务版    │ ✓        │ ✓       │ │
│ 舆情分析  │ 政务版    │ ✓        │ ✓       │ │
│ 矩阵发布  │ 通用      │ ✓        │ ✗       │ │
│ ...                                       │ │
└─────────────────────────────────────────────┘
```

### 6.2 租户功能管理界面

**路径**：`/admin/tenants/:id/features`
```
┌─────────────────────────────────────────────┐
│ demo-business-001 功能管理                   │
├─────────────────────────────────────────────┤
│ 功能名称        │ 状态 │ 操作              │ │
│─────────────────────────────────────────────│
│ 客户画像分析    │ ✓启用 │ [禁用]            │ │
│ 客户数据导入    │ ✓启用 │ [禁用]            │ │
│ 舆情分析        │ ✗禁用 │ [启用]            │ │
│ ...                                       │ │
└─────────────────────────────────────────────┘
```

---

## 7. 总结

### 7.1 方案优势
1. **灵活性高**：通过配置表动态控制功能，无需修改代码
2. **租户隔离**：基于租户类型自动过滤功能
3. **权限集成**：与现有RBAC系统无缝集成
4. **可扩展性**：新增功能只需添加配置，无需修改核心逻辑

### 7.2 技术实现要点
- 使用`tenant_type`字段区分租户类型
- 通过`feature_configs`表集中管理功能配置
- 通过`tenant_feature_toggles`表实现租户级功能开关
- 使用`FeatureGuard`实现运行时功能检查

### 7.3 后续优化方向
- 支持功能灰度发布
- 支持功能使用统计
- 支持功能A/B测试
- 支持功能依赖关系管理

---

**文档版本**: v1.0  
**创建日期**: 2026-04-03  
**作者**: LuminaMedia AI Team  
**关联文档**: [Demonstration_Upgrade_Plan.md](./Demonstration_Upgrade_Plan.md)
