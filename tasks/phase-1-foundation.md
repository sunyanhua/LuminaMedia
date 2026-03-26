# LuminaMedia 2.0 实施任务清单 - 第一阶段: 基础架构升级

## 阶段概述
**时间**: 1-2个月
**目标**: 建立模块化单体基础框架，实现多租户认证授权和数据库架构重构
**核心交付物**: 多租户认证系统、模块化单体基础框架、数据库迁移脚本、CloudProvider基础接口

## 详细任务分解

### 里程碑1: 认证授权系统 (2周)

#### 任务1.1: ✅ **2026-03-26**: JWT认证模块实现（已完成）
- **任务描述**: 实现完整的JWT认证流程，包括登录、注册、令牌刷新
- **技术方案**:
  - 创建 `src/modules/auth/` 模块目录
  - 实现 `AuthService` 提供登录验证和令牌生成
  - 实现 `JwtStrategy` 用于Passport.js JWT验证
  - 创建 `AuthGuard` 全局守卫保护受保护路由
- **API端点**:
  - `POST /api/auth/login` - 用户登录，返回JWT令牌
  - `POST /api/auth/register` - 用户注册（多租户）
  - `POST /api/auth/refresh` - 令牌刷新
  - `GET /api/auth/profile` - 获取当前用户信息
- **验收标准**:
  - Swagger文档完整，测试通过
  - 支持多租户用户注册（tenant_id字段）
  - 令牌有效期配置可调整
  - 错误处理完善（401、403等状态码）

#### 任务1.2: ✅ **2026-03-26**: 多租户用户体系（已完成）
- **任务描述**: 扩展User实体支持多租户，实现租户管理功能
- **技术方案**:
  - 修改 `src/entities/User.ts` 实体，增加 `tenant_id` 字段
  - 创建 `Tenant` 实体（id, name, created_at, status等）
  - 实现 `TenantService` 提供租户CRUD操作
  - 实现租户上下文中间件，自动注入tenant_id到请求
- **数据库变更**:
  ```sql
  ALTER TABLE users ADD COLUMN tenant_id CHAR(36) NOT NULL DEFAULT 'default-tenant';
  CREATE INDEX idx_users_tenant_id ON users(tenant_id);

  CREATE TABLE tenants (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
  ```
- **验收标准**:
  - 用户注册时自动关联租户
  - 查询接口自动过滤当前租户数据
  - 租户管理API可用

#### 任务1.3: ✅ **2026-03-26**: 角色权限管理 (RBAC)（已完成）
- **任务描述**: 实现基于角色的权限控制系统
- **技术方案**:
  - 创建 `Role` 实体（admin, editor, viewer等）
  - 创建 `Permission` 实体（模块+操作权限）
  - 实现 `RolesGuard` 守卫检查用户角色
  - 实现 `PermissionsGuard` 守卫检查具体权限
- **数据库变更**:
  ```sql
  CREATE TABLE roles (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    tenant_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE user_roles (
    user_id CHAR(36) NOT NULL,
    role_id CHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
  );
  ```
- **验收标准**:
  - 支持角色分配和权限检查
  - 管理员可以管理用户角色
  - API端点根据角色限制访问

### 里程碑2: 数据库架构重构 (2周)

#### 任务2.1: ✅ **2026-03-26**: tenant_id字段添加（已完成）
- **任务描述**: 为所有现有表添加tenant_id字段，建立数据隔离基础
- **涉及表清单**:
  - users (已添加)
  - customer_profiles
  - marketing_strategies
  - content_drafts
  - social_accounts
  - publish_tasks
  - analytics_reports
- **技术方案**:
  - 为每个实体添加 `tenant_id: string` 字段
  - 创建数据库迁移脚本 `scripts/04-tenant-migration.sql`
  - 更新TypeORM实体定义
  - 实现自动填充中间件（请求中自动设置tenant_id）
- **迁移脚本示例**:
  ```sql
  -- 为customer_profiles表添加tenant_id
  ALTER TABLE customer_profiles
  ADD COLUMN tenant_id CHAR(36) NOT NULL DEFAULT 'default-tenant',
  ADD INDEX idx_customer_profiles_tenant_id (tenant_id);

  -- 更新现有数据，分配默认租户
  UPDATE customer_profiles SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;
  ```
- **验收标准**:
  - 所有核心表都有tenant_id字段和索引
  - 迁移脚本可重复执行，无数据丢失
  - 现有功能不受影响

#### 任务2.2: ✅ **2026-03-26**: 数据库查询隔离（已完成）
- **任务描述**: 实现所有数据库查询自动过滤当前租户数据
- **技术方案**:
  - 创建 `TenantAwareRepository` 基类
  - 所有Repository继承此基类，自动添加 `where tenant_id = ?` 条件
  - 实现查询构建器拦截器
  - 管理员可以查看所有租户数据（特殊权限）
- **代码实现**:
  ```typescript
  @Injectable()
  export class TenantAwareRepository<T extends TenantEntity> {
    protected addTenantCondition(queryBuilder: SelectQueryBuilder<T>) {
      const tenantId = this.getCurrentTenantId();
      queryBuilder.andWhere(`${queryBuilder.alias}.tenant_id = :tenantId`, { tenantId });
    }
  }
  ```
- **验收标准**:
  - 普通用户只能看到自己租户的数据
  - 跨租户查询被禁止
  - 性能影响最小（合理使用索引）

#### 任务2.3: ✅ **2026-03-26**: 基础分表策略设计（已完成）
- **任务描述**: 为大数据表设计分表策略，支持600万数据处理
- **技术方案**:
  - 分析表数据量和增长趋势 - 已完成：确定customer_profiles、content_drafts、publish_tasks、marketing_strategies、user_behaviors为需要分表的大表
  - 设计按tenant_id哈希分表方案 - 已完成：采用MySQL分区策略，按tenant_id哈希分16个分区
  - 创建分表管理工具类 - 已完成：创建 `ShardingRepository` 基类和 `ShardingService` 服务类
  - 实现动态表名解析 - 已完成：MySQL分区自动路由，提供分区信息查询工具
- **实际交付物**:
  - `scripts/05-sharding-setup.sql` - 分表（分区）策略初始化脚本
  - `src/shared/repositories/sharding.repository.ts` - 分表管理Repository基类
  - `src/shared/services/sharding.service.ts` - 分表管理服务
- **分表策略**:
  ```sql
  -- 按tenant_id哈希分16个分区（MySQL分区表）
  ALTER TABLE customer_profiles
  PARTITION BY HASH(MOD(CRC32(tenant_id), 16))
  PARTITIONS 16;
  ```
- **验收标准**:
  - ✅ 分表策略设计文档完整 - 通过SQL脚本和TypeScript类实现完整设计
  - ✅ 查询路由逻辑正确 - MySQL分区自动路由，提供分区提示工具
  - ✅ 支持未来数据迁移 - 提供迁移计划生成工具和平衡性分析

### 里程碑3: 模块化架构设计 (2周)

#### 任务3.1: ✅ **2026-03-26**: 模块边界定义（已完成）
- **任务描述**: 定义清晰的模块边界和接口契约
- **模块划分方案**:
  1. `AuthModule` - 认证授权、租户管理
  2. `UserModule` - 用户管理、角色权限
  3. `DataEngineModule` - SmartDataEngine核心
  4. `AIEngineModule` - AI Agent工作流
  5. `PublishModule` - 社交媒体发布
  6. `KnowledgeModule` - 知识库管理
  7. `WorkflowModule` - 三审三校流程
  8. `MonitorModule` - 舆情监测
- **技术方案**:
  - 创建 `src/modules/` 子目录结构
  - 定义模块接口 `IModuleService`
  - 实现模块间依赖注入
  - 编写模块文档和API契约
- **验收标准**:
  - 模块目录结构清晰
  - 模块间通过接口通信，无直接依赖
  - 支持独立测试和开发

#### 任务3.2: ✅ **2026-03-26**: CloudProvider抽象层（已完成）
- **任务描述**: 设计CloudProvider接口，支持环境一键切换
- **技术方案**:
  - 定义 `CloudProvider` 抽象接口
  ```typescript
  interface CloudProvider {
    storage: StorageService;
    ai: AIService;
    database: DatabaseService;
    messaging: MessagingService;
  }
  ```
  - 实现 `AliCloudAdapter` (阿里云适配器)
  - 实现 `PrivateDeployAdapter` (私有化部署适配器)
  - 实现 `MockAdapter` (演示模式适配器)
- **环境切换机制**:
  ```typescript
  const providerFactory = {
    'alicloud': () => new AliCloudAdapter(),
    'private': () => new PrivateDeployAdapter(),
    'mock': () => new MockAdapter(),
  };

  const provider = providerFactory[process.env.CLOUD_PROVIDER]();
  ```
- **验收标准**:
  - 通过环境变量切换云服务提供者
  - 各适配器实现基础接口
  - 无硬编码云服务依赖

#### 任务3.3: ✅ **2026-03-26**: 基础数据访问层（已完成）
- **任务描述**: 重构数据访问层，支持多租户和分表
- **技术方案**:
  - 创建 `BaseRepository` 提供CRUD通用操作
  - 实现 `TenantRepository` 扩展多租户支持
  - 实现 `ShardingRepository` 扩展分表支持
  - 统一异常处理和日志记录
- **代码结构**:
  ```
  src/shared/repositories/
  ├── base.repository.ts
  ├── tenant.repository.ts
  └── sharding.repository.ts
  ```
- **验收标准**:
  - 数据访问层代码复用率高
  - 支持事务和连接池管理
  - 性能监控和优化点明确

### 里程碑4: Mobile-First前端基础 (1周)

#### 任务4.1: ✅ **2026-03-26**: 响应式设计框架（已完成）
- **任务描述**: 建立Mobile-First前端基础框架
- **技术方案**:
  - 配置Tailwind CSS响应式断点（移动端优先）
  - 创建响应式布局组件库
  - 实现移动端导航和交互模式
  - 测试微信内置浏览器兼容性
- **CSS规范**:
  ```css
  /* 移动端优先，从小到大扩展 */
  .container {
    padding: 1rem; /* 移动端 */
  }

  @media (min-width: 768px) {
    .container {
      padding: 2rem; /* 平板 */
    }
  }
  ```
- **验收标准**:
  - 375px宽度的手机端界面完美显示
  - 微信内置浏览器无兼容性问题
  - 触摸目标大小符合WCAG标准（≥44×44px）

#### 任务4.2: ✅ **2026-03-26**: 移动端组件库（已完成）
- **任务描述**: 基于Ant Design Mobile创建移动端组件库
- **技术方案**:
  - 安装和配置 `antd-mobile` 组件库
  - 创建项目特定的主题配置
  - 封装常用业务组件（数据卡片、表单、按钮等）
  - 实现移动端手势支持（滑动、长按等）
- **组件清单**:
  - `MobileCard` - 移动端数据卡片
  - `MobileForm` - 移动端表单组件
  - `MobileTable` - 移动端表格（虚拟滚动）
  - `MobileChart` - 移动端图表适配器
- **验收标准**:
  - 组件库文档完整，使用示例丰富
  - 性能优化（懒加载、代码分割）
  - 主题切换支持（亮色/暗色模式）

#### 任务4.3: ✅ **2026-03-26**: 微信端适配测试（已完成）
- **任务描述**: 确保所有界面在微信内置浏览器完美显示
- **技术方案**:
  - 配置微信JSSDK（如果需要）
  - 测试微信内置浏览器的CSS和JS支持
  - 解决微信特定问题（如fixed定位、输入框等）
  - 实现微信分享和登录集成
- **测试清单**:
  - [x] 页面布局在微信中正常
  - [x] 字体大小可读性良好
  - [x] 交互操作（点击、滑动）流畅
  - [x] 图片加载和显示正常
  - [x] 表单输入和提交正常
- **验收标准**:
  - 微信端测试通过率100%
  - 用户反馈无显示问题
  - 性能指标达标（首屏加载<3秒）

## 第一阶段交付物清单

### 代码交付物
1. `src/modules/auth/` - 完整认证授权模块
2. `src/modules/user/` - 多租户用户管理模块
3. `src/shared/cloud/` - CloudProvider抽象层实现
4. `src/shared/repositories/` - 统一数据访问层
5. `dashboard-web/src/components/mobile/` - 移动端组件库

### 数据库交付物
1. `scripts/04-tenant-migration.sql` - 租户字段迁移脚本
2. `scripts/05-sharding-setup.sql` - 分表策略初始化脚本
3. `scripts/06-rbac-init.sql` - 角色权限初始化数据

### 文档交付物
1. `docs/architecture/modular-monolith.md` - 模块化单体架构设计文档
2. `docs/database/tenant-isolation.md` - 多租户数据隔离方案
3. `docs/frontend/mobile-first-guide.md` - Mobile-First开发指南
4. `docs/deployment/cloud-provider.md` - CloudProvider配置指南

### 测试交付物
1. 认证授权系统端到端测试套件
2. 多租户数据隔离测试用例
3. 移动端响应式测试报告
4. 微信浏览器兼容性测试报告

## 风险评估与应对

### 技术风险
1. **性能影响**: 多租户查询增加索引开销
   - **应对**: 精心设计索引，定期性能测试

2. **迁移复杂性**: 现有数据迁移到新架构
   - **应对**: 分批次迁移，保留回滚方案

3. **兼容性问题**: 微信浏览器特定限制
   - **应对**: 早期测试，渐进增强方案

### 进度风险
1. **模块依赖**: 模块间接口定义延迟
   - **应对**: 先定义接口契约，后并行开发

2. **测试工作量**: 多租户场景测试复杂
   - **应对**: 自动化测试优先，重点场景覆盖

## 第一阶段成功标准
1. ✅ 多租户认证系统上线，支持JWT和RBAC
2. ✅ 数据库所有核心表完成tenant_id字段迁移
3. ✅ CloudProvider抽象层实现，支持环境切换
4. ✅ Mobile-First前端框架建立，微信端测试通过
5. ✅ 模块化架构设计完成，模块边界清晰

## 第一阶段完成后启动条件
- 代码审查通过，无严重缺陷
- 测试覆盖率≥80%
- 性能基准测试达标
- 文档完整，移交第二阶段团队

### 里程碑5: 第一阶段问题修复 (1周)

#### 任务5.1: ✅ **2026-03-26**: 后端TypeScript编译错误修复（已完成）
- **任务描述**: 修复27个TypeScript编译错误，确保项目能够正常构建
- **具体问题**:
  1. 修复`Index`装饰器导入缺失问题（多个实体文件）
  2. 修复`findByIds`方法参数错误（TypeORM版本兼容性）
  3. 移除`@Entity`装饰器中不支持的`repository`选项
  4. 修复`tenant-context.service`模块缺失问题
- **技术方案**:
  - 更新实体文件导入语句：`import { Index } from 'typeorm';`
  - 调整`findByIds`调用方式
  - 移除`@Entity`装饰器中的`repository`选项
  - 创建缺失的`tenant-context.service.ts`文件
- **验收标准**:
  - `npm run build`命令成功执行，无TypeScript错误
  - 所有实体文件编译通过
  - 后端服务能够正常启动

#### 任务5.2: ✅ **2026-03-26**: 前端构建问题修复（已完成）
- **任务描述**: 修复前端构建错误和依赖解析问题
- **具体问题**:
  1. 修复`gestures.ts`文件语法错误（第398行JSX语法问题）
  2. 解决antd-mobile CSS导入路径问题
  3. 确保前端容器能够正常构建和运行
- **技术方案**:
  - 修复`gestures.ts`中的JSX语法错误
  - 调整antd-mobile导入路径或版本
  - 验证前端Docker构建流程
- **验收标准**:
  - `npm run build`在前端目录成功执行
  - 前端开发服务器正常启动
  - 移动端组件库正常显示

#### 任务5.3: ✅ **2026-03-26**: 缺失文档创建（已完成）
- **任务描述**: 创建phase-1-foundation.md要求的4个核心文档
- **文档清单**:
  1. `docs/architecture/modular-monolith.md` - 模块化单体架构设计文档
  2. `docs/database/tenant-isolation.md` - 多租户数据隔离方案
  3. `docs/frontend/mobile-first-guide.md` - Mobile-First开发指南
  4. `docs/deployment/cloud-provider.md` - CloudProvider配置指南
- **内容要求**:
  - 每个文档至少包含：概述、设计原则、实现方案、配置示例、最佳实践
  - 与现有代码实现保持一致
  - 提供实际可用的配置示例
- **验收标准**:
  - 4个文档全部创建完成
  - 文档内容完整、准确
  - 文档结构符合项目规范

#### 任务5.4: ✅ **2026-03-26**: 测试套件补充（已完成）
- **任务描述**: 补充缺失的测试用例，确保第一阶段功能有完整测试覆盖
- **测试范围**:
  1. **认证授权测试**: JWT认证、RBAC权限控制、多租户用户体系
  2. **多租户数据隔离测试**: 租户数据过滤、跨租户访问防护
  3. **移动端响应式测试**: 移动端组件、响应式布局、触摸交互
  4. **微信兼容性测试**: 微信内置浏览器适配、JSSDK集成
- **技术方案**:
  - 创建`src/modules/auth/tests/`测试目录
  - 实现端到端测试和单元测试
  - 使用Jest和Supertest进行API测试
  - 添加移动端组件测试
- **验收标准**:
  - 测试覆盖率≥80%
  - 所有核心功能都有对应测试
  - 测试通过率100%

#### 任务5.5: ✅ **2026-03-26**: 项目状态验证和修复（已完成）
- **任务描述**: 验证第一阶段所有交付物，修复不完整或缺失的部分
- **验证清单**:
  1. **代码交付物验证**: 检查所有模块实现完整性
  2. **数据库交付物验证**: 验证迁移脚本正确性
  3. **文档交付物验证**: 验证文档完整性和准确性
  4. **测试交付物验证**: 验证测试覆盖率和有效性
- **修复方案**:
  - 验证CloudProvider实现完整性
  - 补充缺失的文档和测试
  - 更新PROGRESS.md反映真实状态
- **验收标准**:
  - 所有交付物验证通过
  - 项目能够正常构建、测试和运行
  - 文档与代码状态一致

---

**文件**: `tasks/phase-1-foundation.md`
**版本**: 1.0
**更新日期**: 2026-03-26
**下一阶段**: [phase-2-core-features.md](./phase-2-core-features.md)