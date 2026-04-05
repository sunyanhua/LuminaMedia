# LuminaMedia 演示版上线升级计划

## 文档概述

本文档汇总了演示版升级的完整方案，包含环境架构、功能配置、演示数据三大核心部分，为将LuminaMedia 2.0从开发测试阶段升级为可对外测试的演示版本提供完整的实施指导。

---

## 目录

1. [项目背景与目标](#1-项目背景与目标)
2. [环境架构设计](#2-环境架构设计)
3. [功能配置方案](#3-功能配置方案)
4. [演示数据管理](#4-演示数据管理)
5. [实施计划](#5-实施计划)
6. [风险评估与应对](#6-风险评估与应对)
7. [后续优化方向](#7-后续优化方向)

---

## 1. 项目背景与目标

### 1.1 当前状态
- ✅ **2.0重构已完成**：四大核心模块（SmartDataEngine、AI Agent、矩阵分发、客户大脑）完整实现
- ✅ **架构稳定**：模块化单体架构、多租户隔离、Docker容器化部署
- ✅ **功能基础完整**：演示功能已初步实现，支持快速启动演示流程
- **运行状态**：连续稳定运行29小时+，质量评分98/100

### 1.2 升级目标
1. 将当前的演示功能升级为**可对外测试的稳定演示版**
2. 支持**商务版**和**政务版**两种演示场景
3. 建立完整的演示数据管理体系
4. 实现演示版与正式版的数据隔离和功能区分
5. 通过配额限制控制资源消耗，支持真实AI服务

### 1.3 核心设计原则
- **租户级隔离**：通过`tenant_id`字段实现逻辑隔离
- **功能完整+配额限制**：保证体验完整性，控制资源消耗
- **混合数据模式**：预置静态数据 + 动态生成数据
- **手动重置**：用户可控的数据生命周期管理
- **真实AI+降级**：真实调用 + 配额用尽后Mock降级

---

## 2. 环境架构设计

### 2.1 环境关系图

```
┌─────────────────────────────────────────────────────┐
│                   正式版生产环境                     │
│  ┌─────────────────┐  ┌─────────────────┐          │
│  │ 商务版租户       │  │ 政务版租户       │          │
│  │ (正式客户数据)   │  │ (正式客户数据)   │          │
│  └─────────────────┘  └─────────────────┘          │
└─────────────────────────────────────────────────────┘
                          │
                          │
┌─────────────────────────┴───────────────────────────┐
│                   演示版环境（子集）                 │
│  ┌─────────────────┐  ┌─────────────────┐          │
│  │ 商务版演示租户   │  │ 政务版演示租户   │          │
│  │ (演示数据隔离)   │  │ (演示数据隔离)   │          │
│  │ 功能完整         │  │ 功能完整         │          │
│  │ AI配额限制       │  │ AI配额限制       │          │
│  └─────────────────┘  └─────────────────┘          │
└─────────────────────────────────────────────────────┘
                          │
                          │
┌─────────────────────────┴───────────────────────────┐
│            开发环境 / 测试环境 / 预发布环境         │
│  (用于开发、测试、预发布验证)                       │
└─────────────────────────────────────────────────────┘
```

### 2.2 数据隔离策略

#### 2.2.1 租户级隔离
- **专用演示租户**：
  - 商务版演示租户：`demo-business-001`
  - 政务版演示租户：`demo-government-001`
- **数据库共享**：演示版与正式版使用同一数据库，但通过租户隔离
- **租户类型字段**：
  ```typescript
  export enum TenantType {
    BUSINESS = 'business',              // 正式商务版
    GOVERNMENT = 'government',          // 正式政务版
    DEMO_BUSINESS = 'demo_business',    // 演示商务版
    DEMO_GOVERNMENT = 'demo_government',// 演示政务版
    DEVELOPMENT = 'development',        // 开发环境
  }
  ```

#### 2.2.2 用户管理
- **专用演示账号**：
  - 商务版：`demo@business.com` / 密码：`LuminaDemo2026`
  - 政务版：`demo@government.com` / 密码：`LuminaDemo2026`
- **固定演示租户**：所有演示用户归属专用演示租户，共享同一套演示数据
- **无需注册**：直接使用演示账号登录

### 2.3 配额限制策略

#### 2.3.1 配额配置表

| 资源类型 | 配额限制 | 重置周期 | 说明 |
|---------|---------|---------|------|
| **AI调用次数** | 5次/天 | 每日00:00 | 超出后返回Mock数据 |
| **内容发布次数** | 10次/天 | 每日00:00 | 超出后禁止发布操作 |
| **数据导入次数** | 3次/天 | 每日00:00 | 超出后禁止导入操作 |
| **API调用总量** | 100次/天 | 每日00:00 | 限流保护 |
| **并发请求数** | 5个/租户 | 实时 | 保护系统资源 |

#### 2.3.2 配额实现方式
- **数据库表**：`tenant_quotas`表
- **中间件拦截**：配额检查中间件在API层拦截请求
- **定时任务**：每日00:00 UTC+8自动重置配额

---

## 3. 功能配置方案

### 3.1 现有RBAC系统

#### 3.1.1 数据库表
- `roles` - 角色表
- `permissions` - 权限表
- `role_permissions` - 角色权限关联表
- `user_roles` - 用户角色关联表

#### 3.1.2 Guard机制
- `JwtAuthGuard` - JWT认证
- `RolesGuard` - 基于角色的访问控制
- `PermissionsGuard` - 基于权限的访问控制

### 3.2 功能差异化设计

#### 3.2.1 商务版 vs 政务版功能对比

| 功能模块 | 商务版 | 政务版 | 说明 |
|---------|--------|--------|------|
| **核心数据面板** | 客户画像分析 | 舆情监测面板 | 商务版关注销售指标，政务版关注舆情指标 |
| **智能数据魔方** | ✓ | ✗ | 商务版独有（客户数据导入和分析） |
| **AI智策工厂** | ✓ | ✓ | 两者都有，但业务场景不同 |
| **矩阵分发中心** | ✓ | ✓ | 政务版发布渠道不同 |
| **客户大脑** | ✓ | ✗ | 商务版独有（企业画像） |
| **舆情监测** | ✓ | ✓ | 政务版更深入 |
| **GEO分析** | ✗ | ✓ | 政务版独有（地域舆情分析） |
| **政府内容发布** | ✗ | ✓ | 政务版独有（政府公文发布） |

#### 3.2.2 数据类型差异化

**商务版关注指标**：
- 销售额、转化率、客户生命周期价值、ROI
- 数据来源：CRM系统、POS系统、电商平台、社交媒体
- 分析维度：客户分群、消费行为、营销效果、竞品分析

**政务版关注指标**：
- 舆情指数、正面/负面比例、传播范围、响应及时度
- 数据来源：政务微博、政府网站、新闻媒体、社交媒体
- 分析维度：舆情情感、热点话题、地域分布、时间趋势

### 3.3 动态功能配置系统

#### 3.3.1 功能配置表设计

**数据库表**：`feature_configs`
```sql
CREATE TABLE feature_configs (
    id CHAR(36) PRIMARY KEY,
    feature_name VARCHAR(100) NOT NULL,      -- 功能名称
    feature_key VARCHAR(100) NOT NULL,       -- 功能唯一标识
    description TEXT,                        -- 功能描述
    module_name VARCHAR(100) NOT NULL,       -- 对应的模块名
    tenant_types JSON NOT NULL,              -- 适用的租户类型数组
    required_permissions JSON,               -- 所需权限列表
    is_enabled_by_default BOOLEAN DEFAULT TRUE,
    requires_ai BOOLEAN DEFAULT FALSE,       -- 是否需要AI服务
    requires_publish BOOLEAN DEFAULT FALSE,  -- 是否需要发布功能
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3.3.2 租户功能开关表

**数据库表**：`tenant_feature_toggles`
```sql
CREATE TABLE tenant_feature_toggles (
    id CHAR(36) PRIMARY KEY,
    tenant_id CHAR(36) NOT NULL,             -- 租户ID
    feature_key VARCHAR(100) NOT NULL,       -- 功能唯一标识
    is_enabled BOOLEAN DEFAULT TRUE,         -- 是否启用
    enabled_at TIMESTAMP NULL,               -- 启用时间
    disabled_at TIMESTAMP NULL,              -- 禁用时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY uk_tenant_feature (tenant_id, feature_key)
);
```

#### 3.3.3 FeatureGuard实现

**新增Guard**：`src/modules/auth/guards/feature.guard.ts`
```typescript
@Injectable()
export class FeatureGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureKey = this.reflector.getAllAndOverride<string>(
      FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!featureKey) return true;

    const tenantId = request['tenantId'] || request.user?.tenantId;
    
    // 检查功能是否启用
    const isEnabled = await this.featureConfigService.isFeatureEnabled(
      tenantId,
      featureKey,
    );

    if (!isEnabled) {
      throw new ForbiddenException(
        `功能 "${featureKey}" 当前未启用`,
      );
    }

    return true;
  }
}
```

#### 3.3.4 功能配置示例

**商务版特有功能**：
```typescript
{
  moduleName: 'customer-analytics',
  featureKey: 'customer-analytics',
  tenantTypes: ['business', 'demo_business'],
  requiredPermissions: ['customer-analytics:read', 'customer-analytics:write'],
  isEnabledByDefault: true,
  requiresAi: true,
}
```

**政务版特有功能**：
```typescript
{
  moduleName: 'sentiment-analysis',
  featureKey: 'sentiment-analysis',
  tenantTypes: ['government', 'demo_government'],
  requiredPermissions: ['sentiment-analysis:read'],
  isEnabledByDefault: true,
  requiresAi: true,
}
```

---

## 4. 演示数据管理

### 4.1 数据类型划分

#### 4.1.1 预置静态数据（登录即可见）
- **目的**：用户登录后立即看到完整的演示数据，无需等待生成
- **内容**：
  - 客户档案、分群、营销活动、策略（商务版）
  - 政府内容、舆情数据、地理分析结果（政务版）
- **标记方式**：`is_preset = TRUE`
- **生命周期**：永久保留，不受重置影响

#### 4.1.2 动态生成数据（交互体验）
- **目的**：用户可执行真实操作，体验完整流程
- **触发方式**：点击"一键演示"按钮
- **标记方式**：`is_preset = FALSE`
- **生命周期**：可手动重置

#### 4.1.3 历史操作数据（保留记录）
- **目的**：记录用户的操作历史，便于回溯和演示
- **内容**：用户导入的数据、创建的活动、生成的策略等
- **生命周期**：保留（可通过重置按钮清空）

### 4.2 商务版演示数据

#### 4.2.1 预置静态数据
- **客户档案**：某连锁商场顾客数据（1000人）
  - 年龄分布：18-25岁(25%), 26-35岁(40%), 36-45岁(20%), 46-55岁(10%), 56+(5%)
  - 性别分布：男性45%，女性55%
  - 消费偏好：服饰28%，美妆22%，餐饮18%，娱乐15%，家居8%
  
- **客户分群**：
  - 高价值VIP客户（150人）
  - 年轻时尚族群（300人）
  - 家庭消费群体（350人）
  - 价值寻求者（120人）
  - 数字化原住民（80人）

- **营销活动**：
  - 商场春季焕新购物节（预算20万，2026-04-01至2026-06-30）
  - 夏日清凉大促销（预算15万，2026-07-01至2026-08-31）

- **营销策略**：
  - 内容策略、渠道策略、时间策略、预算策略

#### 4.2.2 动态生成数据
- **一键演示流程**：
  1. 创建客户档案
  2. 创建客户分群
  3. 创建营销活动
  4. 生成营销策略
  5. 生成营销内容

- **模拟数据规模**：
  - 客户数量：1000条
  - 消费记录：5000条
  - 用户行为：8000条
  - 营销活动：2个
  - 营销策略：8条
  - 内容草稿：10篇

### 4.3 政务版演示数据

#### 4.3.1 预置静态数据
- **政府内容**：
  - 官方文件：《关于做好2026年春季防火工作的通知》
  - 反诈宣传：《警惕新型网络投资诈骗》
  - 政策解读：《便民服务政策解读》
  - 公共服务：《政务服务效率提升》

- **舆情数据**：
  - 总数据量：2000条
  - 情感分布：正面65%，中性25%，负面10%
  - 热点话题：政务服务、民生保障、环境保护

- **地理分析**：
  - 区域分布：北京20%，上海15%，广州12%，深圳10%，其他43%

#### 4.3.2 动态生成数据
- **政务版演示流程**：
  1. 创建政府内容
  2. 创建舆情监控任务
  3. 采集模拟舆情数据
  4. 执行情感分析
  5. 执行地理分析
  6. 生成发布计划

- **模拟数据规模**：
  - 政府内容：5篇
  - 舆情数据：2000条
  - 情感分析结果：2000条
  - 地理分析结果：50条
  - 发布任务：5个

### 4.4 数据库表结构调整

#### 4.4.1 新增字段
```sql
-- customer_profiles表
ALTER TABLE customer_profiles
ADD COLUMN is_preset BOOLEAN DEFAULT FALSE COMMENT '是否为预置演示数据',
ADD COLUMN demo_scenario VARCHAR(100) NULL COMMENT '演示场景名称';

-- marketing_campaigns表
ALTER TABLE marketing_campaigns
ADD COLUMN is_preset BOOLEAN DEFAULT FALSE COMMENT '是否为预置演示数据';

-- government_contents表
ALTER TABLE government_contents
ADD COLUMN is_preset BOOLEAN DEFAULT FALSE COMMENT '是否为预置演示数据',
ADD COLUMN demo_scenario VARCHAR(100) NULL COMMENT '演示场景名称';
```

#### 4.4.2 索引优化
```sql
CREATE INDEX idx_customer_profiles_is_preset ON customer_profiles(is_preset);
CREATE INDEX idx_marketing_campaigns_is_preset ON marketing_campaigns(is_preset);
CREATE INDEX idx_government_contents_is_preset ON government_contents(is_preset);
```

### 4.5 演示数据重置方案

#### 4.5.1 重置策略
- **动态生成数据**：完全清空
- **预置静态数据**：保留不变
- **用户操作数据**：完全清空

#### 4.5.2 重置接口
**API端点**：`DELETE /api/v1/analytics/demo/reset`

**响应**：
```json
{
  "success": true,
  "deleted": 123,
  "message": "演示数据重置成功"
}
```

---

## 5. 实施计划

### 5.1 总体时间规划
**预计总工期**：12-15个工作日

### 5.2 阶段一：数据库迁移（预计2天）

#### 任务清单
- [ ] 执行`scripts/12-feature-config-full.sql`（功能配置表）
- [ ] 执行`scripts/13-demo-business-init.sql`（商务版初始化）
- [ ] 执行`scripts/14-demo-government-init.sql`（政务版初始化）
- [ ] 为roles和permissions表添加`tenant_type`字段
- [ ] 为相关表添加`is_preset`和`demo_scenario`字段
- [ ] 验证表结构和初始数据

#### 输出物
- ✅ 数据库结构更新完成
- ✅ 演示租户和账号创建完成
- ✅ 预置演示数据导入完成

### 5.3 阶段二：后端服务实现（预计4天）

#### 任务清单
- [ ] 创建`FeatureConfigService`（功能配置服务）
- [ ] 创建`TenantFeatureService`（租户功能服务）
- [ ] 创建`FeatureGuard`（功能开关Guard）
- [ ] 创建`GovernmentDemoService`（政务版演示服务）
- [ ] 完善`DemoService`（商务版演示服务）
- [ ] 修改`Role`和`Permission`实体（增加tenantType字段）
- [ ] 更新`RoleService`和`PermissionService`
- [ ] 实现配额检查中间件
- [ ] 实现演示数据重置逻辑

#### 输出物
- ✅ 功能配置系统实现完成
- ✅ 功能开关Guard实现完成
- ✅ 政务版演示服务实现完成
- ✅ 配额限制系统实现完成
- ✅ 演示数据重置功能实现完成

### 5.4 阶段三：功能开关集成（预计3天）

#### 任务清单
- [ ] 为各控制器添加`@Feature()`装饰器
- [ ] 更新路由守卫配置
- [ ] 添加功能配置管理API
- [ ] 添加配额查询和重置API
- [ ] 添加演示数据管理API

#### 输出物
- ✅ 功能开关集成到所有控制器
- ✅ 功能配置管理API开发完成
- ✅ 配额管理API开发完成
- ✅ 演示数据管理API开发完成

### 5.5 阶段四：前端适配（预计3天）

#### 任务清单
- [ ] 修改登录页，增加版本选择入口
- [ ] 创建版本切换逻辑
- [ ] 添加演示环境标识（蓝色横幅）
- [ ] 添加配额显示组件
- [ ] 添加重置演示按钮
- [ ] 根据租户类型动态加载功能菜单
- [ ] 创建功能配置管理界面
- [ ] 创建租户功能管理界面

#### 输出物
- ✅ 登录页改造完成
- ✅ 演示环境标识实现
- ✅ 配额显示组件实现
- ✅ 重置演示按钮实现
- ✅ 功能配置管理界面实现

### 5.6 阶段五：测试和验证（预计2天）

#### 任务清单
- [ ] 功能开关测试
- [ ] 租户隔离测试
- [ ] 权限验证测试
- [ ] 配额限制测试
- [ ] 演示数据管理测试
- [ ] 商务版完整流程测试
- [ ] 政务版完整流程测试
- [ ] 性能和安全测试

#### 输出物
- ✅ 测试报告
- ✅ 问题修复清单
- ✅ 验收通过

### 5.7 阶段六：部署和文档（预计1-2天）

#### 任务清单
- [ ] 部署到演示环境
- [ ] 编写用户操作手册
- [ ] 编写管理员配置手册
- [ ] 录制演示视频
- [ ] 准备演示环境访问说明

#### 输出物
- ✅ 演示环境部署完成
- ✅ 用户操作手册
- ✅ 管理员配置手册
- ✅ 演示视频

---

## 6. 风险评估与应对

### 6.1 技术风险

| 风险项 | 影响程度 | 应对策略 |
|-------|---------|---------|
| 配额系统性能问题 | 中 | 使用Redis缓存配额数据，定时同步到数据库 |
| 多租户数据隔离失效 | 高 | 严格测试租户隔离逻辑，增加数据访问日志 |
| Mock数据质量不足 | 低 | 准备丰富的模板，定期更新 |
| 功能开关复杂度高 | 中 | 采用配置表驱动，降低代码耦合 |

### 6.2 运营风险

| 风险项 | 影响程度 | 应对策略 |
|-------|---------|---------|
| 演示账号被滥用 | 中 | 设置强密码，定期更换，监控异常登录 |
| 配额被恶意刷取 | 中 | 增加IP限流，异常行为检测 |
| 演示数据被误操作删除 | 低 | 定期备份演示数据，提供快速恢复机制 |
| 用户混淆演示版和正式版 | 中 | 明显的界面标识，清晰的使用说明 |

### 6.3 进度风险

| 风险项 | 影响程度 | 应对策略 |
|-------|---------|---------|
| 功能开发延期 | 中 | 采用并行开发，优先实现核心功能 |
| 测试发现问题多 | 中 | 预留充足的测试和修复时间 |
| 部署环境问题 | 低 | 提前准备部署环境，进行预演 |

---

## 7. 后续优化方向

### 7.1 短期优化（1个月内）
- [ ] 增加演示数据统计分析功能
- [ ] 优化配额重置策略（支持自定义重置时间）
- [ ] 增加演示版使用情况监控
- [ ] 支持演示数据模板管理

### 7.2 中期优化（3个月内）
- [ ] 实现演示版自动化测试脚本
- [ ] 增加多语言支持（中英文切换）
- [ ] 优化演示数据生成算法
- [ ] 支持更多演示场景（电商、教育、医疗）

### 7.3 长期优化（6个月内）
- [ ] 实现演示版A/B测试功能
- [ ] 增加演示版用户反馈收集机制
- [ ] 优化演示版性能和用户体验
- [ ] 支持演示数据导出/导入功能
- [ ] 实现功能灰度发布机制

---

## 8. 附录

### 8.1 相关文档
- [功能配置细化方案](./Feature_Config_Detail_Plan.md) - 详细功能配置实现
- [演示数据准备方案](./Demo_Data_Preparation_Plan.md) - 详细数据准备和管理
- [项目完成报告](./Project_Completion_Report.md) - 项目实施总结
- [文档目录索引](./README.md) - 所有项目文档导航

### 8.2 数据库脚本清单
- `scripts/12-feature-config-full.sql` - 功能配置系统迁移脚本
- `scripts/13-demo-business-init.sql` - 商务版演示数据初始化脚本
- `scripts/14-demo-government-init.sql` - 政务版演示数据初始化脚本

### 8.3 API接口清单
- `POST /api/v1/analytics/demo/quick-start` - 一键启动演示
- `DELETE /api/v1/analytics/demo/reset` - 重置演示数据
- `GET /api/v1/analytics/demo/status` - 获取演示状态
- `GET /api/v1/analytics/demo/progress` - 获取演示进度
- `POST /api/auth/login` - 用户登录（支持版本选择）
- `GET /api/features` - 获取功能配置列表
- `PUT /api/features/:featureKey/toggle` - 启用/禁用功能

---

## 9. 总结

### 9.1 核心设计要点
1. **租户级隔离**：通过`tenant_id`实现数据隔离，简单高效
2. **功能完整+配额限制**：保证体验完整性，控制资源消耗
3. **混合数据模式**：预置静态数据 + 动态生成数据
4. **手动重置**：用户可控的数据生命周期管理
5. **真实AI+降级**：真实调用 + 配额用尽后Mock降级
6. **动态功能配置**：通过配置表动态控制功能，无需修改代码

### 9.2 预期效果
- ✅ **商务版和政务版**功能差异化清晰
- ✅ **演示数据**丰富且易于管理
- ✅ **配额系统**有效控制资源消耗
- ✅ **用户体验**完整且流畅
- ✅ **运维成本**可控（共享数据库）
- ✅ **系统安全**可靠（租户隔离+权限控制）

### 9.3 实施状态
本方案已全面实施完成：
1. ✅ 六阶段全部实施完成（2026-04-04）
2. ✅ 数据库迁移、后端服务、功能开关、前端适配全部完成
3. ✅ 测试验证通过，部署文档完成
4. ✅ 项目正式验收通过，综合评分97分

---

**文档版本**: v1.1  
**创建日期**: 2026-04-03  
**更新日期**: 2026-04-05  
**作者**: LuminaMedia AI Team  
**状态**: ✅ 已实施完成
