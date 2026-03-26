# 模块化单体架构设计文档

## 概述

LuminaMedia 2.0 采用**模块化单体架构**（Modular Monolith），这是一种兼顾开发效率和系统可维护性的架构模式。该架构将应用程序划分为多个高内聚、低耦合的功能模块，所有模块部署在同一个进程中，通过清晰的接口契约进行通信。

### 核心设计目标

1. **高内聚**: 每个模块封装特定业务领域的完整功能
2. **低耦合**: 模块间通过接口通信，避免直接依赖
3. **独立开发**: 团队可以并行开发不同模块
4. **渐进式拆分**: 未来可根据需要将模块拆分为微服务
5. **运维简单**: 单体部署，减少分布式系统复杂性

### 适用场景

- 中小企业级应用（团队规模 5-20 人）
- 需要快速迭代和灵活部署的项目
- 希望未来具备微服务迁移能力
- 资源有限，希望降低运维复杂度

## 架构原则

### 1. 模块边界清晰化

- 每个模块对应一个独立的业务领域
- 模块间通过定义良好的接口进行通信
- 禁止跨模块的直接数据库访问
- 模块内部实现对外部透明

### 2. 依赖方向规范化

- 高层模块依赖低层模块的抽象
- 低层模块不依赖高层模块
- 共享代码提取到 `src/shared/` 目录
- 第三方依赖统一管理

### 3. 配置外部化

- 所有配置通过环境变量管理
- 模块配置独立管理，支持覆盖
- 开发、测试、生产环境配置分离
- 敏感信息不进入版本控制系统

### 4. 数据隔离严格化

- 多租户数据通过 `tenant_id` 字段隔离
- 模块间数据访问通过服务接口
- 数据库查询自动过滤租户数据
- 审计日志记录所有数据访问

## 模块划分方案

### 核心功能模块

LuminaMedia 2.0 划分为以下 8 个核心模块：

| 模块名称 | 业务领域 | 主要职责 | 状态 |
|---------|---------|---------|------|
| **AuthModule** | 认证授权 | 用户认证、JWT令牌管理、RBAC权限控制、多租户管理 | ✅ 已实现 |
| **UserModule** | 用户管理 | 用户信息管理、个人设置、通知偏好 | ✅ 已实现 |
| **DataEngineModule** | 智能数据引擎 | 客户数据处理、标签系统、智能分析 | 🔄 规划中 |
| **AIEngineModule** | AI工作流引擎 | AI Agent工作流、内容生成、策略优化 | 🔄 规划中 |
| **PublishModule** | 发布管理 | 社交媒体发布、内容调度、发布监控 | 🔄 规划中 |
| **KnowledgeModule** | 知识库管理 | 知识库维护、向量检索、RAG系统 | 🔄 规划中 |
| **WorkflowModule** | 三审三校流程 | 内容审核工作流、审批流程、版本控制 | 🔄 规划中 |
| **MonitorModule** | 舆情监测 | 舆情监控、预警系统、数据分析 | 🔄 规划中 |

### 共享基础设施模块

| 模块/组件 | 用途 | 位置 |
|----------|------|------|
| **CloudProvider** | 云服务抽象层，支持环境一键切换 | `src/shared/cloud/` |
| **BaseRepository** | 通用数据访问层，提供CRUD基础操作 | `src/shared/repositories/` |
| **TenantContext** | 租户上下文管理，自动注入tenant_id | `src/shared/services/` |
| **ShardingService** | 分表管理，支持大数据量处理 | `src/shared/services/` |

## 目录结构规范

### 后端模块结构

```
src/modules/{module-name}/
├── controllers/           # API控制器层
│   ├── *.controller.ts
│   └── *.spec.ts         # 控制器测试
├── services/             # 业务逻辑层
│   ├── *.service.ts
│   └── *.spec.ts         # 服务测试
├── entities/             # 数据库实体（可选，可共享）
│   └── *.entity.ts
├── dto/                  # 数据传输对象
│   └── *.dto.ts
├── interfaces/           # 接口定义
│   └── *.interface.ts
├── guards/               # NestJS守卫（认证授权）
│   └── *.guard.ts
├── decorators/           # 自定义装饰器
│   └── *.decorator.ts
├── strategies/           # Passport策略（认证）
│   └── *.strategy.ts
├── middlewares/          # 中间件
│   └── *.middleware.ts
└── {module-name}.module.ts  # 模块定义文件
```

### 共享代码结构

```
src/shared/
├── cloud/                # 云服务抽象层
│   ├── interfaces/       # 云服务接口
│   ├── adapters/         # 具体云平台适配器
│   └── cloud-provider.factory.ts  # 工厂模式
├── repositories/         # 数据访问层基类
│   ├── base.repository.ts
│   ├── tenant.repository.ts
│   └── sharding.repository.ts
├── services/            # 共享服务
│   ├── tenant-context.service.ts
│   └── sharding.service.ts
├── utils/               # 工具函数
│   └── *.ts
└── config/              # 配置管理
    └── *.ts
```

## 模块通信机制

### 1. 依赖注入（NestJS IoC容器）

模块间通过依赖注入进行通信，确保松耦合：

```typescript
// 模块A提供服务
@Module({
  providers: [ServiceA],
  exports: [ServiceA]  // 导出供其他模块使用
})
export class ModuleA {}

// 模块B使用服务
@Module({
  imports: [ModuleA],  // 导入模块A
  providers: [ServiceB]
})
export class ModuleB {
  constructor(private serviceA: ServiceA) {}
}
```

### 2. 事件驱动通信（可选）

对于解耦的异步操作，使用事件驱动模式：

```typescript
// 定义事件
export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly email: string
  ) {}
}

// 发布事件
this.eventEmitter.emit('user.registered', new UserRegisteredEvent(...));

// 订阅事件
@OnEvent('user.registered')
handleUserRegistered(event: UserRegisteredEvent) {
  // 处理用户注册后的逻辑
}
```

### 3. 接口契约优先

模块间通过明确定义的接口进行通信：

```typescript
// 在共享接口中定义
export interface IUserService {
  findById(id: string): Promise<User>;
  updateProfile(userId: string, profile: ProfileDto): Promise<void>;
}

// 模块实现接口
@Injectable()
export class UserService implements IUserService {
  // 实现接口方法
}
```

## 数据库设计规范

### 1. 多租户数据隔离

所有核心表必须包含 `tenant_id` 字段：

```typescript
@Entity('users')
export class User extends TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', length: 36 })
  tenantId: string;

  @Index('idx_users_tenant_id')
  @Column()
  email: string;

  // ... 其他字段
}
```

### 2. 分表策略

大数据量表采用分表策略：

```sql
-- 按tenant_id哈希分16个分区
ALTER TABLE customer_profiles
PARTITION BY HASH(MOD(CRC32(tenant_id), 16))
PARTITIONS 16;
```

### 3. 数据访问层

所有Repository继承自 `TenantAwareRepository`，自动过滤租户数据：

```typescript
export class CustomerProfileRepository extends TenantAwareRepository<CustomerProfile> {
  async findByEmail(email: string): Promise<CustomerProfile> {
    return this.createQueryBuilder('profile')
      .where('profile.email = :email', { email })
      .getOne();  // 自动添加 tenant_id 条件
  }
}
```

## 配置管理

### 1. 环境变量配置

通过 `.env` 文件管理配置：

```env
# 数据库配置
DATABASE_URL=mysql://user:pass@localhost:3306/lumina_media

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# 云服务提供商
CLOUD_PROVIDER=alicloud  # alicloud | private | mock

# AI服务配置
GEMINI_API_KEY=your_gemini_api_key
QWEN_API_KEY=your_qwen_api_key
```

### 2. 模块配置

每个模块可以有自己的配置：

```typescript
// config/auth.config.ts
export default registerAs('auth', () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  tenant: {
    defaultTenantId: process.env.DEFAULT_TENANT_ID || 'default-tenant',
  },
}));
```

### 3. 配置验证

使用 class-validator 验证配置：

```typescript
export class DatabaseConfig {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  poolSize: number = 10;
}
```

## 开发工作流程

### 1. 创建新模块

```bash
# 1. 创建模块目录结构
mkdir -p src/modules/new-module/{controllers,services,dto,interfaces}

# 2. 创建模块定义文件
touch src/modules/new-module/new-module.module.ts

# 3. 在AppModule中导入
# 4. 实现模块功能
# 5. 编写单元测试
```

### 2. 模块接口定义

先定义接口，再实现功能：

```typescript
// 1. 在 interfaces/ 中定义接口
export interface INewModuleService {
  doSomething(input: InputDto): Promise<OutputDto>;
}

// 2. 实现服务
@Injectable()
export class NewModuleService implements INewModuleService {
  async doSomething(input: InputDto): Promise<OutputDto> {
    // 实现逻辑
  }
}
```

### 3. 测试策略

- **单元测试**: 测试单个类或函数
- **集成测试**: 测试模块内部组件协作
- **端到端测试**: 测试完整API流程
- **契约测试**: 确保接口兼容性

## 部署与运维

### 1. 构建与打包

```bash
# 构建后端
npm run build

# 构建前端
cd dashboard-web && npm run build

# Docker构建
docker-compose build --no-cache
```

### 2. 容器化部署

使用 Docker Compose 管理多容器环境：

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/lumina_media
      - CLOUD_PROVIDER=${CLOUD_PROVIDER:-mock}
    ports:
      - "3003:3003"
    depends_on:
      - db
```

### 3. 监控与日志

- **应用监控**: Prometheus + Grafana
- **日志聚合**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **健康检查**: `/health` 端点
- **性能指标**: 响应时间、错误率、吞吐量

## 迁移到微服务的路径

### 1. 识别拆分候选模块

满足以下条件的模块适合拆分为微服务：

- 业务领域边界清晰
- 数据独立性高
- 团队可以独立负责
- 伸缩性需求不同
- 技术栈可能不同

### 2. 拆分策略

1. **数据库拆分**: 为模块创建独立数据库
2. **API网关**: 引入API网关路由请求
3. **服务发现**: 实现服务注册与发现
4. **通信机制**: 从进程内调用改为RPC/消息队列
5. **数据同步**: 处理跨服务数据一致性

### 3. 渐进式迁移

```typescript
// 第一阶段：接口保持兼容
class ModuleService {
  // 内部实现可以改为调用微服务
  async getData(): Promise<Data> {
    if (USE_MICROSERVICE) {
      return this.microserviceClient.getData();
    } else {
      return this.localRepository.find();
    }
  }
}
```

## 最佳实践

### 1. 模块设计原则

- **单一职责**: 每个模块只负责一个业务领域
- **接口隔离**: 模块间通过最小接口通信
- **依赖倒置**: 依赖抽象，不依赖具体实现
- **开闭原则**: 对扩展开放，对修改关闭

### 2. 代码质量保证

- **TypeScript严格模式**: 启用所有严格检查
- **ESLint规则**: 统一的代码风格
- **Prettier格式化**: 自动代码格式化
- **Husky钩子**: 提交前检查
- **测试覆盖率**: 目标≥80%

### 3. 性能优化

- **数据库索引**: 为查询条件创建合适索引
- **查询优化**: 避免N+1查询问题
- **缓存策略**: 合理使用Redis缓存
- **连接池**: 数据库连接池配置
- **懒加载**: 按需加载模块

## 常见问题解答

### Q1: 模块化单体和微服务有什么区别？

**A**: 模块化单体所有模块部署在同一进程中，通过进程内调用通信；微服务每个服务独立部署，通过网络调用通信。模块化单体适合中小规模应用，微服务适合大规模分布式系统。

### Q2: 如何防止模块间产生循环依赖？

**A**: 使用依赖注入容器，NestJS会自动检测循环依赖并报错。设计时遵循依赖方向原则：基础设施层 → 领域层 → 应用层 → 表示层。

### Q3: 模块间共享数据怎么办？

**A**: 有三种方式：1) 通过服务接口访问；2) 使用共享实体（谨慎使用）；3) 事件驱动数据同步。优先选择服务接口方式。

### Q4: 如何测试模块间的集成？

**A**: 使用NestJS的测试工具，可以单独测试模块，也可以测试多个模块的集成。Mock外部依赖，确保测试的隔离性。

### Q5: 未来拆分微服务需要重写多少代码？

**A**: 如果遵循模块化单体原则，大部分代码可以重用。主要需要修改的是：1) 通信机制；2) 数据持久化；3) 配置管理。业务逻辑代码基本不变。

## 参考资源

1. [NestJS官方文档 - 模块](https://docs.nestjs.com/modules)
2. [模块化单体架构模式](https://martinfowler.com/bliki/ModularMonolith.html)
3. [领域驱动设计（DDD）](https://domainlanguage.com/ddd/)
4. [整洁架构](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**文档版本**: 1.0
**最后更新**: 2026-03-26
**维护者**: LuminaMedia 开发团队
**状态**: 正式发布