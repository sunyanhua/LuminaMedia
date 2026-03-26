# 多租户数据隔离方案

## 概述

LuminaMedia 2.0 采用 **基于共享数据库的多租户架构**，通过 `tenant_id` 字段在数据库层面实现数据隔离。每个租户的数据在物理上存储在同一数据库中，但通过逻辑隔离确保数据安全性和隐私性。

### 设计目标

1. **数据安全**: 确保租户间数据完全隔离，防止数据泄露
2. **性能优化**: 最小化数据隔离带来的性能开销
3. **开发友好**: 对业务代码透明，开发人员无需关心租户隔离细节
4. **运维简单**: 支持租户数据备份、迁移和监控
5. **扩展灵活**: 支持未来向独立数据库或分库分表演进

### 核心原则

- **强制隔离**: 所有数据访问必须经过租户过滤
- **自动注入**: 租户ID自动从请求上下文获取
- **统一入口**: 通过统一的Repository基类实现隔离逻辑
- **审计追踪**: 记录所有数据访问操作

## 架构设计

### 1. 数据隔离层级

LuminaMedia 采用三层数据隔离架构：

| 层级 | 实现方式 | 描述 |
|------|----------|------|
| **应用层** | `TenantMiddleware` | 从请求中提取租户ID，设置到AsyncLocalStorage上下文 |
| **服务层** | `TenantContextService` | 提供全局租户上下文访问，无状态服务 |
| **数据层** | `TenantRepository` | 自动为所有查询添加 `WHERE tenant_id = ?` 条件 |

### 2. 租户ID传递机制

租户ID通过以下方式传递：

```
客户端请求
    ↓
TenantMiddleware (从JWT/Header提取tenantId)
    ↓
AsyncLocalStorage (存储租户上下文)
    ↓
TenantContextService (提供上下文访问)
    ↓
TenantRepository (自动添加过滤条件)
    ↓
数据库查询
```

### 3. 核心组件

| 组件 | 位置 | 职责 |
|------|------|------|
| `TenantMiddleware` | `src/modules/auth/middlewares/tenant.middleware.ts` | 从请求提取租户ID，设置上下文 |
| `TenantContextService` | `src/shared/services/tenant-context.service.ts` | 管理租户上下文，提供访问接口 |
| `TenantRepository` | `src/shared/repositories/tenant.repository.ts` | 租户感知的Repository基类 |
| `TenantEntity` 接口 | `src/shared/interfaces/tenant-entity.interface.ts` | 定义租户实体必须的tenantId字段 |

## 数据库设计

### 1. 表结构规范

所有需要租户隔离的表必须包含 `tenant_id` 字段：

```sql
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  tenant_id CHAR(36) NOT NULL DEFAULT 'default-tenant',
  email VARCHAR(255) NOT NULL,
  -- ... 其他字段
  INDEX idx_users_tenant_id (tenant_id)
);
```

### 2. 必需添加 tenant_id 的表清单

根据第一阶段实施，以下核心表已完成 `tenant_id` 字段添加：

| 表名 | 业务含义 | 状态 |
|------|---------|------|
| `users` | 用户表 | ✅ 已完成 |
| `customer_profiles` | 客户档案表 | ✅ 已完成 |
| `marketing_strategies` | 营销策略表 | ✅ 已完成 |
| `content_drafts` | 内容草稿表 | ✅ 已完成 |
| `social_accounts` | 社交媒体账号表 | ✅ 已完成 |
| `publish_tasks` | 发布任务表 | ✅ 已完成 |
| `analytics_reports` | 分析报告表 | ✅ 已完成 |

### 3. 迁移脚本

已创建数据库迁移脚本 `scripts/04-tenant-migration.sql`，包含：

```sql
-- 为customer_profiles表添加tenant_id
ALTER TABLE customer_profiles
ADD COLUMN tenant_id CHAR(36) NOT NULL DEFAULT 'default-tenant',
ADD INDEX idx_customer_profiles_tenant_id (tenant_id);

-- 更新现有数据，分配默认租户
UPDATE customer_profiles SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;

-- 重复上述操作为其他表...
```

## 代码实现

### 1. 实体定义

所有租户实体必须实现 `TenantEntity` 接口：

```typescript
// src/shared/interfaces/tenant-entity.interface.ts
export interface TenantEntity {
  tenantId: string;
}

// 实体示例
@Entity('users')
export class User extends TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', length: 36 })
  tenantId: string;  // 必须包含此字段

  @Index('idx_users_tenant_id')
  @Column()
  email: string;

  // ... 其他字段
}
```

### 2. Repository基类

所有Repository继承自 `TenantRepository`，自动添加租户过滤：

```typescript
// src/shared/repositories/tenant.repository.ts
export abstract class TenantRepository<T extends TenantEntity> extends BaseRepository<T> {
  protected getCurrentTenantId(): string {
    return TenantContextService.getCurrentTenantIdStatic();
  }

  protected addTenantCondition(queryBuilder: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
    const tenantId = this.getCurrentTenantId();
    const alias = queryBuilder.alias;
    queryBuilder.andWhere(`${alias}.tenantId = :tenantId`, { tenantId });
    return queryBuilder;
  }

  // 重写所有查询方法，自动添加租户条件
  async find(options?: any): Promise<T[]> {
    const queryBuilder = this.createQueryBuilder(this.metadata.name);
    this.addTenantCondition(queryBuilder);
    // ... 处理其他options
    return queryBuilder.getMany();
  }
}
```

### 3. 使用示例

```typescript
// 自定义Repository
@EntityRepository(CustomerProfile)
export class CustomerProfileRepository extends TenantRepository<CustomerProfile> {
  // 自定义查询方法，自动包含租户过滤
  async findByEmail(email: string): Promise<CustomerProfile> {
    return this.createQueryBuilder('profile')
      .where('profile.email = :email', { email })
      .getOne();
  }
}

// Service中使用
@Injectable()
export class CustomerService {
  constructor(
    private readonly customerProfileRepository: CustomerProfileRepository
  ) {}

  async getCustomerProfile(id: string): Promise<CustomerProfile> {
    // 自动过滤当前租户数据
    return this.customerProfileRepository.findById(id);
  }
}
```

## 分表策略

### 1. 分表设计原则

对于大数据量表，采用 **MySQL分区表** 策略：

- **分区键**: `tenant_id` 字段
- **分区算法**: `HASH(MOD(CRC32(tenant_id), 16))`
- **分区数量**: 16个分区（可配置）
- **适用表**: 预计数据量超过100万行的表

### 2. 分表表清单

以下表已设计分表策略：

| 表名 | 预估数据量 | 分区策略 | 状态 |
|------|-----------|----------|------|
| `customer_profiles` | 600万+ | 16个分区 | ✅ 已设计 |
| `content_drafts` | 300万+ | 16个分区 | ✅ 已设计 |
| `publish_tasks` | 200万+ | 16个分区 | ✅ 已设计 |
| `marketing_strategies` | 100万+ | 16个分区 | ✅ 已设计 |
| `user_behaviors` | 1000万+ | 16个分区 | ✅ 已设计 |

### 3. 分表实现

```sql
-- 分区DDL示例
ALTER TABLE customer_profiles
PARTITION BY HASH(MOD(CRC32(tenant_id), 16))
PARTITIONS 16;
```

### 4. 分表管理服务

通过 `ShardingService` 管理分表：

```typescript
// 初始化分区
const shardingService = new ShardingService(connection);
await shardingService.initializePartitions();

// 监控分区状态
const stats = await shardingService.getAllPartitionStats();
const balance = await shardingService.analyzePartitionBalance('customer_profiles');
```

## 租户管理

### 1. 租户生命周期

```
租户创建 → 数据初始化 → 日常运营 → 数据备份 → 租户停用/删除
```

### 2. 租户数据初始化

新租户创建时，自动初始化必要数据：

```typescript
@Injectable()
export class TenantService {
  async createTenant(name: string): Promise<Tenant> {
    // 1. 创建租户记录
    const tenant = await this.tenantRepository.save({
      id: uuidv4(),
      name,
      status: 'active'
    });

    // 2. 初始化默认数据
    await this.initializeDefaultData(tenant.id);

    // 3. 初始化管理员用户
    await this.createAdminUser(tenant.id);

    return tenant;
  }
}
```

### 3. 租户数据隔离验证

确保数据隔离正确性的测试用例：

```typescript
describe('Tenant Isolation', () => {
  it('should only return data from current tenant', async () => {
    // 模拟租户A上下文
    TenantContextService.runWithContext(
      { tenantId: 'tenant-a' },
      async () => {
        const data = await repository.find();
        expect(data.every(item => item.tenantId === 'tenant-a')).toBe(true);
      }
    );
  });

  it('should prevent cross-tenant access', async () => {
    // 租户A创建数据
    TenantContextService.runWithContext({ tenantId: 'tenant-a' }, async () => {
      await repository.save({ id: 'data-1', tenantId: 'tenant-a' });
    });

    // 租户B尝试访问
    TenantContextService.runWithContext({ tenantId: 'tenant-b' }, async () => {
      const data = await repository.findById('data-1');
      expect(data).toBeNull(); // 应该返回null
    });
  });
});
```

## 性能优化

### 1. 索引策略

为 `tenant_id` 字段创建复合索引：

```sql
-- 单字段索引（基础）
CREATE INDEX idx_table_tenant_id ON table_name(tenant_id);

-- 复合索引（常用查询）
CREATE INDEX idx_table_tenant_status ON table_name(tenant_id, status);
CREATE INDEX idx_table_tenant_created ON table_name(tenant_id, created_at);
```

### 2. 查询优化

- **避免全表扫描**: 所有查询必须包含 `tenant_id` 条件
- **合理使用索引**: 按照索引顺序编写WHERE条件
- **分页优化**: 使用 `created_at` 字段进行分页，避免深度分页
- **查询缓存**: 对租户配置等低频变更数据使用缓存

### 3. 连接池优化

根据租户数量调整数据库连接池：

```typescript
// TypeORM配置
TypeOrmModule.forRoot({
  // ... 其他配置
  extra: {
    connectionLimit: 100, // 总连接数
    maxTenantConnections: 10, // 每个租户最大连接数
  }
})
```

## 安全管理

### 1. 权限控制矩阵

| 角色 | 权限范围 | 数据访问 |
|------|---------|----------|
| **租户管理员** | 本租户全部数据 | 本租户所有数据 |
| **普通用户** | 本人创建的数据 | 本人创建的数据 |
| **系统管理员** | 所有租户数据 | 所有租户数据（特殊权限） |

### 2. 数据访问审计

记录所有敏感数据访问：

```typescript
@Entity('data_access_logs')
export class DataAccessLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  userId: string;

  @Column()
  action: string; // SELECT, INSERT, UPDATE, DELETE

  @Column()
  tableName: string;

  @Column('json')
  queryParams: any;

  @Column()
  accessedAt: Date;
}
```

### 3. 安全边界检查

防止SQL注入和越权访问：

```typescript
@Injectable()
export class SecurityService {
  async validateTenantAccess(entityId: string, repository: TenantRepository<any>): Promise<boolean> {
    // 检查当前用户是否有权限访问该实体
    return repository.checkTenantAccess(entityId);
  }

  async sanitizeQueryParams(params: any): Promise<any> {
    // 清理查询参数，防止SQL注入
    // ... 实现参数清理逻辑
  }
}
```

## 运维管理

### 1. 租户数据备份

```bash
# 按租户备份数据
mysqldump -u username -p lumina_media \
  --where="tenant_id='tenant-id'" \
  > backup-tenant-id-$(date +%Y%m%d).sql
```

### 2. 数据迁移工具

提供租户数据迁移工具：

```typescript
// 迁移租户数据到新数据库
async function migrateTenantData(sourceTenantId: string, targetTenantId: string) {
  const tables = ['users', 'customer_profiles', 'marketing_strategies'];

  for (const table of tables) {
    await connection.query(`
      INSERT INTO ${table}_backup
      SELECT *, ? as new_tenant_id
      FROM ${table}
      WHERE tenant_id = ?
    `, [targetTenantId, sourceTenantId]);
  }
}
```

### 3. 监控指标

监控关键指标确保系统健康：

| 指标 | 预警阈值 | 检查频率 |
|------|---------|----------|
| 租户数据增长率 | >10%/天 | 每天 |
| 查询响应时间 | >1秒 | 实时 |
| 租户隔离错误 | >0次 | 实时 |
| 分区不平衡度 | >30% | 每周 |

## 故障处理

### 1. 常见问题

#### Q1: 租户上下文丢失

**症状**: 查询返回所有租户数据或报错
**解决方案**:
1. 检查 `TenantMiddleware` 是否正确配置
2. 验证JWT令牌是否包含 `tenantId`
3. 检查 `AsyncLocalStorage` 上下文是否正确传递

#### Q2: 分表性能下降

**症状**: 查询变慢，分区不平衡
**解决方案**:
1. 运行 `ShardingService.analyzePartitionBalance()`
2. 考虑增加分区数量
3. 优化查询语句和索引

#### Q3: 数据隔离绕过

**症状**: 用户看到其他租户数据
**解决方案**:
1. 检查Repository是否继承 `TenantRepository`
2. 验证实体是否包含 `tenantId` 字段
3. 运行隔离测试用例

### 2. 应急恢复流程

1. **立即措施**: 启用数据库审计，追踪数据访问
2. **问题定位**: 使用监控工具定位问题根源
3. **数据修复**: 修复受影响的数据
4. **系统修复**: 修复代码或配置问题
5. **预防措施**: 添加监控告警，防止复发

## 最佳实践

### 1. 开发规范

- **所有新表**必须包含 `tenant_id` 字段
- **所有Repository**必须继承 `TenantRepository`
- **所有查询**必须经过Repository，避免裸SQL
- **所有测试**必须包含租户隔离验证

### 2. 代码审查要点

- ✅ 实体是否包含 `tenantId` 字段
- ✅ Repository是否继承 `TenantRepository`
- ✅ 查询是否可能绕过租户过滤
- ✅ 测试是否覆盖多租户场景

### 3. 性能调优建议

- **索引优化**: 为 `tenant_id` 创建合适索引
- **查询优化**: 避免跨分区查询
- **缓存策略**: 租户级缓存，避免缓存污染
- **连接管理**: 合理配置连接池参数

## 未来演进

### 1. 向独立数据库迁移

当租户数据量或隔离要求增加时，可迁移到独立数据库：

```typescript
// 动态数据源选择
@Injectable()
export class DynamicDataSourceService {
  getDataSource(tenantId: string): DataSource {
    // 根据租户ID返回对应的数据源
    return dataSourceMap.get(tenantId);
  }
}
```

### 2. 分库分表架构

支持更大规模的数据存储：

```
租户A → 数据库1 → 分表1, 分表2, ...
租户B → 数据库2 → 分表1, 分表2, ...
租户C → 数据库1 → 分表3, 分表4, ...
```

### 3. 多级租户结构

支持组织-子租户层级结构：

```
组织（顶级租户）
├── 部门A（子租户）
├── 部门B（子租户）
└── 项目C（子租户）
```

## 附录

### A. 数据库脚本位置

- `scripts/04-tenant-migration.sql` - 租户字段迁移脚本
- `scripts/05-sharding-setup.sql` - 分表策略初始化脚本
- `scripts/06-rbac-init.sql` - 角色权限初始化数据

### B. 相关代码文件

- `src/shared/repositories/tenant.repository.ts` - 租户感知Repository基类
- `src/shared/services/tenant-context.service.ts` - 租户上下文服务
- `src/modules/auth/middlewares/tenant.middleware.ts` - 租户中间件
- `src/shared/services/sharding.service.ts` - 分表管理服务

### C. 监控仪表板

访问Grafana监控租户数据隔离状态：
- **租户数据分布图**: 各租户数据量对比
- **查询隔离成功率**: 租户隔离有效性
- **分区平衡度**: 分表数据分布均匀性
- **错误监控**: 隔离相关错误统计

---

**文档版本**: 1.0
**最后更新**: 2026-03-26
**维护者**: LuminaMedia 数据库团队
**状态**: 正式发布