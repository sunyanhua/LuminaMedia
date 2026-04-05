# LuminaMedia 演示数据准备方案

## 1. 现状分析

### 1.1 现有数据结构
- **数据库策略**：单数据库（`lumina_media`）+ 租户隔离（`tenant_id`字段）
- **演示租户**：
  - 商务版：`demo-business-001`
  - 政务版：`demo-government-001`
- **现有数据源**：
  - `src/modules/data-analytics/services/mock-data.service.ts` - 通用模拟数据生成
  - `src/modules/data-analytics/services/demo.service.ts` - 演示数据生成（商场顾客场景）
  - `demo/`目录 - 独立数据库初始化脚本（过时，不使用）

### 1.2 数据表结构

#### 商务版相关表
- `customer_profiles` - 客户档案
- `customer_segments` - 客户分群
- `marketing_campaigns` - 营销活动
- `marketing_strategies` - 营销策略
- `data_import_jobs` - 数据导入任务
- `user_behaviors` - 用户行为
- `content_drafts` - 内容草稿
- `publish_tasks` - 发布任务

#### 政务版相关表
- `enterprise_profiles` - 企业画像
- `knowledge_documents` - 知识库文档
- `government_contents` - 政府内容
- `geo_analysis_results` - 地理分析结果
- `geo_regions` - 地理区域
- `sentiment_analysis_results` - 情感分析结果
- `data_collection_tasks` - 舆情采集任务
- `collected_data` - 采集数据

### 1.3 当前问题
- 现有`demo.service.ts`只支持商务版场景
- 政务版演示数据缺失
- 缺少预置静态数据（登录后立即看到的数据）
- 动态生成数据和静态数据未隔离

---

## 2. 数据准备策略

### 2.1 统一数据库+租户隔离

#### 优势
- 数据库维护简单，无需多个数据库实例
- 多租户隔离机制已在2.0重构中实现
- 与现有RBAC系统无缝集成
- 便于数据备份和迁移

#### 实施要点
- 为演示租户设置`tenant_type`字段
- 所有数据通过`tenant_id`字段隔离
- 使用独立的演示账号访问各自租户数据

### 2.2 数据类型划分

#### 2.2.1 预置静态数据（登录即可见）
**目的**：用户登录后立即看到完整的演示数据，无需等待生成

**内容**：
- 商务版：预设的客户档案、分群、营销活动、策略
- 政务版：预设的政府内容、舆情数据、地理分析结果

**标记方式**：
- 新增字段：`is_preset BOOLEAN DEFAULT FALSE` - 标识是否为预置数据
- 预置数据在租户初始化时一次性导入
- 用户操作不会修改预置数据

#### 2.2.2 动态生成数据（交互体验）
**目的**：用户可执行真实操作，体验完整流程

**内容**：
- 通过`DemoService`动态生成的客户档案、分群、活动等
- 用户操作产生的真实数据（如导入数据、创建活动、生成内容）

**标记方式**：
- `is_preset = FALSE`
- 每次"一键演示"生成全新数据

#### 2.2.3 历史操作数据（保留记录）
**目的**：记录用户的操作历史，便于回溯和演示

**内容**：
- 用户导入的数据
- 用户创建的活动
- 用户生成的策略和内容
- 用户执行的发布任务

**生命周期**：保留（可通过重置按钮清空）

---

## 3. 商务版演示数据设计

### 3.1 预置静态数据

#### 3.1.1 客户档案数据
```json
{
  "customerName": "某连锁商场顾客数据",
  "customerType": "INDIVIDUAL",
  "industry": "RETAIL",
  "isPreset": true,
  "profileData": {
    "totalCustomers": 1000,
    "activeCustomers": 780,
    "avgAge": 32.5,
    "ageDistribution": {
      "18-25": 25,
      "26-35": 40,
      "36-45": 20,
      "46-55": 10,
      "56+": 5
    },
    "genderDistribution": {
      "male": 45,
      "female": 55
    },
    "topCategories": ["服饰", "美妆", "餐饮", "娱乐", "家居"],
    "categorySpending": {
      "服饰": 28,
      "美妆": 22,
      "餐饮": 18,
      "娱乐": 15,
      "家居": 8
    }
  }
}
```

#### 3.1.2 客户分群数据
- **高价值VIP客户**（150人）
  - 特征：高收入、高消费、注重品质
  - 推荐策略：个性化服务、专属活动、高端品牌合作
  
- **年轻时尚族群**（300人）
  - 特征：18-30岁、追求时尚、社交活跃
  - 推荐策略：社交媒体营销、KOL合作、限量商品
  
- **家庭消费群体**（350人）
  - 特征：30-50岁、有家庭、注重实用性
  - 推荐策略：家庭套餐、周末活动、亲子互动

#### 3.1.3 营销活动数据
- **活动1**：商场春季焕新购物节
  - 预算：200,000元
  - 时间：2026-04-01 至 2026-06-30
  - 目标：提升客流量和消费额
  
- **活动2**：夏日清凉大促销
  - 预算：150,000元
  - 时间：2026-07-01 至 2026-08-31
  - 目标：清仓、提升销售额

#### 3.1.4 营销策略数据
- **内容策略**：每周2-3篇内容，重点推广夏季新品
- **渠道策略**：小红书为主（60%）、微信公众号为辅（40%）
- **时间策略**：最佳发布时间为工作日晚8-10点
- **预算策略**：每月分配预算，保留10%作为应急资金

### 3.2 动态生成数据

#### 3.2.1 一键演示流程
```typescript
async createMallCustomerDemo(userId: string): Promise<DemoResult> {
  // 1. 创建客户档案
  const profile = await this.createCustomerProfile(userId);
  
  // 2. 创建客户分群
  const segments = await this.createCustomerSegments(profile.id);
  
  // 3. 创建营销活动
  const campaign = await this.createMarketingCampaign(profile.id, userId);
  
  // 4. 生成营销策略
  const strategies = await this.generateMarketingStrategies(campaign.id);
  
  // 5. 生成营销内容
  const content = await this.generateMarketingContent(campaign, strategies[0]);
  
  return { profile, segments, campaign, strategies, content };
}
```

#### 3.2.2 模拟数据规模
- 客户数量：1000条
- 消费记录：5000条
- 用户行为：8000条
- 营销活动：2个
- 营销策略：8条
- 内容草稿：10篇

---

## 4. 政务版演示数据设计

### 4.1 预置静态数据

#### 4.1.1 政府内容数据
```json
{
  "content_type": "official_document",
  "title": "关于做好2026年春季防火工作的通知",
  "document_number": "政发〔2026〕15号",
  "issuing_authority": "市应急管理局",
  "issue_date": "2026-03-15",
  "content_text": "...",
  "status": "published",
  "compliance_score": 98.5,
  "is_preset": true
}
```

#### 4.1.2 政府内容类型
- **官方文件**（official_document）
  - 法规、通知、决定、批复等
  
- **反诈宣传**（anti_fraud）
  - 防诈骗宣传、安全提示
  
- **政策解读**（policy_interpretation）
  - 政策要点、实施细则、问答
  
- **公共服务**（public_service）
  - 办事指南、便民服务、活动通知

#### 4.1.3 舆情数据
- **情感分析结果**：
  - 正面舆情：65%
  - 中性舆情：25%
  - 负面舆情：10%
  
- **热点话题**：
  - 话题1：政务服务效率提升
  - 话题2：民生保障政策
  - 话题3：环境保护举措

#### 4.1.4 地理分析数据
- **区域分布**：
  - 北京：20%
  - 上海：15%
  - 广州：12%
  - 深圳：10%
  - 其他：43%
  
- **热点区域**：
  - 政务服务中心周边
  - 商业区
  - 居民区

### 4.2 动态生成数据

#### 4.2.1 政务版演示服务
```typescript
@Injectable()
export class GovernmentDemoService {
  async createGovernmentDemo(userId: string): Promise<GovernmentDemoResult> {
    // 1. 创建政府内容
    const content = await this.createGovernmentContent(userId);
    
    // 2. 创建舆情监控任务
    const monitorTask = await this.createMonitorTask(userId);
    
    // 3. 采集模拟舆情数据
    const collectedData = await this.collectSimulatedData(monitorTask.id);
    
    // 4. 执行情感分析
    const sentimentAnalysis = await this.analyzeSentiment(collectedData);
    
    // 5. 执行地理分析
    const geoAnalysis = await this.analyzeGeo(collectedData);
    
    // 6. 生成发布计划
    const publishPlan = await this.generatePublishPlan(content, userId);
    
    return {
      content,
      monitorTask,
      collectedData,
      sentimentAnalysis,
      geoAnalysis,
      publishPlan,
    };
  }
}
```

#### 4.2.2 模拟数据规模
- 政府内容：5篇
- 舆情数据：2000条
- 情感分析结果：2000条
- 地理分析结果：50条
- 发布任务：5个

---

## 5. 数据库表结构调整

### 5.1 新增字段

#### 5.1.1 customer_profiles表
```sql
ALTER TABLE customer_profiles
ADD COLUMN is_preset BOOLEAN DEFAULT FALSE COMMENT '是否为预置演示数据',
ADD COLUMN demo_scenario VARCHAR(100) NULL COMMENT '演示场景名称';
```

#### 5.1.2 marketing_campaigns表
```sql
ALTER TABLE marketing_campaigns
ADD COLUMN is_preset BOOLEAN DEFAULT FALSE COMMENT '是否为预置演示数据';
```

#### 5.1.3 government_contents表
```sql
ALTER TABLE government_contents
ADD COLUMN is_preset BOOLEAN DEFAULT FALSE COMMENT '是否为预置演示数据',
ADD COLUMN demo_scenario VARCHAR(100) NULL COMMENT '演示场景名称';
```

### 5.2 索引优化
```sql
-- 为预置数据添加索引
CREATE INDEX idx_customer_profiles_is_preset ON customer_profiles(is_preset);
CREATE INDEX idx_marketing_campaigns_is_preset ON marketing_campaigns(is_preset);
CREATE INDEX idx_government_contents_is_preset ON government_contents(is_preset);

-- 为演示场景添加索引
CREATE INDEX idx_customer_profiles_demo_scenario ON customer_profiles(demo_scenario);
CREATE INDEX idx_government_contents_demo_scenario ON government_contents(demo_scenario);
```

---

## 6. 数据初始化脚本

### 6.1 商务版初始化脚本

**文件**：`scripts/13-demo-business-init.sql`
```sql
-- LuminaMedia 商务版演示数据初始化脚本
-- 版本: 1.0
-- 描述: 为商务版演示租户初始化预置静态数据
-- 执行时间: 2026-04-03

USE lumina_media;

-- 步骤1: 创建商务版演示租户
INSERT INTO tenants (id, name, type, status)
VALUES ('demo-business-001', '商务版演示租户', 'demo_business', 'active')
ON DUPLICATE KEY UPDATE name = '商务版演示租户';

-- 步骤2: 创建演示账号
INSERT INTO users (id, username, password_hash, email, tenant_id)
VALUES (
    UUID(),
    'demo@business.com',
    '$2b$10$DemoBusinessPasswordHash', -- 实际使用时替换为真实哈希
    'demo@business.com',
    'demo-business-001'
)
ON DUPLICATE KEY UPDATE username = 'demo@business.com';

-- 步骤3: 创建演示管理员角色
INSERT INTO roles (id, name, description, tenant_id, tenant_type)
VALUES (
    UUID(),
    'demo_admin',
    '商务版演示管理员',
    'demo-business-001',
    'demo_business'
)
ON DUPLICATE KEY UPDATE name = 'demo_admin';

-- 步骤4: 插入预置客户档案
INSERT INTO customer_profiles (
    id, tenant_id, customer_name, customer_type, industry,
    profile_data, is_preset, demo_scenario, created_by
) VALUES (
    UUID(),
    'demo-business-001',
    '某连锁商场顾客数据',
    'INDIVIDUAL',
    'RETAIL',
    '{"totalCustomers": 1000, "activeCustomers": 780, "avgAge": 32.5, "ageDistribution": {"18-25": 25, "26-35": 40, "36-45": 20, "46-55": 10, "56+": 5}, "genderDistribution": {"male": 45, "female": 55}, "topCategories": ["服饰", "美妆", "餐饮", "娱乐", "家居"], "categorySpending": {"服饰": 28, "美妆": 22, "餐饮": 18, "娱乐": 15, "家居": 8}}',
    TRUE,
    'mall-customer',
    'system'
);

-- 步骤5: 插入预置营销活动
INSERT INTO marketing_campaigns (
    id, tenant_id, user_id, customer_profile_id, name,
    campaign_type, target_audience, budget, status, start_date, end_date, is_preset
) VALUES (
    UUID(),
    'demo-business-001',
    (SELECT id FROM users WHERE username = 'demo@business.com' LIMIT 1),
    (SELECT id FROM customer_profiles WHERE tenant_id = 'demo-business-001' AND is_preset = TRUE LIMIT 1),
    '商场春季焕新购物节',
    'HYBRID',
    '{"ageRange": [18, 55], "gender": "both", "interests": ["购物", "时尚", "美食"]}',
    200000,
    'ACTIVE',
    '2026-04-01',
    '2026-06-30',
    TRUE
);

-- 步骤6: 初始化功能开关
INSERT INTO tenant_feature_toggles (tenant_id, feature_key, is_enabled, enabled_at)
SELECT 'demo-business-001', feature_key, TRUE, NOW()
FROM feature_configs
WHERE JSON_CONTAINS(tenant_types, '"business"') OR JSON_CONTAINS(tenant_types, '"demo_business"')
ON DUPLICATE KEY UPDATE is_enabled = TRUE;

-- 完成提示
SELECT '商务版演示数据初始化完成' AS message;
```

### 6.2 政务版初始化脚本

**文件**：`scripts/14-demo-government-init.sql`
```sql
-- LuminaMedia 政务版演示数据初始化脚本
-- 版本: 1.0
-- 描述: 为政务版演示租户初始化预置静态数据
-- 执行时间: 2026-04-03

USE lumina_media;

-- 步骤1: 创建政务版演示租户
INSERT INTO tenants (id, name, type, status)
VALUES ('demo-government-001', '政务版演示租户', 'demo_government', 'active')
ON DUPLICATE KEY UPDATE name = '政务版演示租户';

-- 步骤2: 创建演示账号
INSERT INTO users (id, username, password_hash, email, tenant_id)
VALUES (
    UUID(),
    'demo@government.com',
    '$2b$10$DemoGovernmentPasswordHash', -- 实际使用时替换为真实哈希
    'demo@government.com',
    'demo-government-001'
)
ON DUPLICATE KEY UPDATE username = 'demo@government.com';

-- 步骤3: 创建演示管理员角色
INSERT INTO roles (id, name, description, tenant_id, tenant_type)
VALUES (
    UUID(),
    'demo_admin',
    '政务版演示管理员',
    'demo-government-001',
    'demo_government'
)
ON DUPLICATE KEY UPDATE name = 'demo_admin';

-- 步骤4: 插入预置政府内容
INSERT INTO government_contents (
    id, tenant_id, content_type, title, document_number, issuing_authority,
    issue_date, content_text, status, compliance_score, is_preset, demo_scenario, created_by
) VALUES
(
    UUID(),
    'demo-government-001',
    'official_document',
    '关于做好2026年春季防火工作的通知',
    '政发〔2026〕15号',
    '市应急管理局',
    '2026-03-15',
    '各区县人民政府，市政府各部门：\n\n为切实做好2026年春季防火工作...',
    'published',
    98.50,
    TRUE,
    'fire-prevention',
    'system'
),
(
    UUID(),
    'demo-government-001',
    'anti_fraud',
    '警惕新型网络投资诈骗 守护好您的"钱袋子"',
    NULL,
    '市公安局反诈中心',
    '2026-03-20',
    '近期，我市发生多起新型网络投资诈骗案件...',
    'published',
    96.80,
    TRUE,
    'anti-fraud',
    'system'
);

-- 步骤5: 插入预置舆情数据
INSERT INTO collected_data (
    id, tenant_id, platform, content, author, publish_time,
    sentiment_score, is_preset, demo_scenario, created_at
) VALUES
(
    UUID(),
    'demo-government-001',
    'weibo',
    '市政府发布了新的便民服务政策，办事效率大幅提升！',
    '@市民小张',
    NOW(),
    0.85,
    TRUE,
    'public-service',
    NOW()
),
(
    UUID(),
    'demo-government-001',
    'wechat',
    '最近政务服务大厅排队时间明显缩短了，点赞！',
    '市民小李',
    NOW(),
    0.92,
    TRUE,
    'public-service',
    NOW()
);

-- 步骤6: 初始化功能开关
INSERT INTO tenant_feature_toggles (tenant_id, feature_key, is_enabled, enabled_at)
SELECT 'demo-government-001', feature_key, TRUE, NOW()
FROM feature_configs
WHERE JSON_CONTAINS(tenant_types, '"government"') OR JSON_CONTAINS(tenant_types, '"demo_government"')
ON DUPLICATE KEY UPDATE is_enabled = TRUE;

-- 完成提示
SELECT '政务版演示数据初始化完成' AS message;
```

---

## 7. 演示数据重置方案

### 7.1 重置策略

#### 7.1.1 重置范围
- **动态生成数据**：完全清空
- **预置静态数据**：保留不变
- **用户操作数据**：完全清空

#### 7.1.2 重置逻辑
```typescript
async resetDemoData(tenantId: string): Promise<{ deleted: number }> {
  let deleted = 0;
  
  // 1. 删除非预置的客户档案
  const profilesResult = await this.customerProfileRepository
    .createQueryBuilder()
    .delete()
    .where('tenant_id = :tenantId AND is_preset = FALSE', { tenantId })
    .execute();
  deleted += profilesResult.affected || 0;
  
  // 2. 删除非预置的营销活动
  const campaignsResult = await this.campaignRepository
    .createQueryBuilder()
    .delete()
    .where('tenant_id = :tenantId AND is_preset = FALSE', { tenantId })
    .execute();
  deleted += campaignsResult.affected || 0;
  
  // 3. 删除非预置的政府内容
  const contentResult = await this.governmentContentRepository
    .createQueryBuilder()
    .delete()
    .where('tenant_id = :tenantId AND is_preset = FALSE', { tenantId })
    .execute();
  deleted += contentResult.affected || 0;
  
  // 4. 删除采集数据（保留预置）
  const collectedDataResult = await this.collectedDataRepository
    .createQueryBuilder()
    .delete()
    .where('tenant_id = :tenantId AND is_preset = FALSE', { tenantId })
    .execute();
  deleted += collectedDataResult.affected || 0;
  
  return { deleted };
}
```

### 7.2 重置接口

**API端点**：`DELETE /api/v1/analytics/demo/reset`

**请求参数**：
```json
{
  "tenantId": "demo-business-001",
  "scope": "all" // all | business | government
}
```

**响应**：
```json
{
  "success": true,
  "deleted": 123,
  "message": "演示数据重置成功"
}
```

---

## 8. 实施步骤

### 8.1 阶段一：数据库结构调整（预计1天）
- [ ] 为相关表添加`is_preset`和`demo_scenario`字段
- [ ] 创建索引
- [ ] 创建演示租户和账号

### 8.2 阶段二：预置数据准备（预计2天）
- [ ] 编写商务版预置数据
- [ ] 编写政务版预置数据
- [ ] 执行初始化脚本

### 8.3 阶段三：动态生成服务（预计2天）
- [ ] 完善`DemoService`（商务版）
- [ ] 创建`GovernmentDemoService`（政务版）
- [ ] 实现一键生成接口

### 8.4 阶段四：重置功能实现（预计1天）
- [ ] 实现数据重置逻辑
- [ ] 创建重置接口
- [ ] 前端重置按钮

### 8.5 阶段五：测试和验证（预计1天）
- [ ] 数据隔离测试
- [ ] 功能开关测试
- [ ] 重置功能测试

---

## 9. 数据示例

### 9.1 商务版数据示例

#### 客户档案
- 总客户数：1000人
- 年龄分布：18-25岁(25%), 26-35岁(40%), 36-45岁(20%), 46-55岁(10%), 56+(5%)
- 性别分布：男性45%，女性55%
- 消费偏好：服饰28%，美妆22%，餐饮18%，娱乐15%，家居8%

#### 营销活动
- 活动1：商场春季焕新购物节（预算20万）
- 活动2：夏日清凉大促销（预算15万）
- 目标受众：18-55岁，关注购物、时尚、美食

#### 营销策略
- 内容策略：每周2-3篇，重点推广夏季新品
- 渠道策略：小红书60%，微信公众号40%
- 时间策略：工作日晚8-10点
- 预算策略：月度分配+10%应急

### 9.2 政务版数据示例

#### 政府内容
- 官方文件：2篇（防火通知、反诈宣传）
- 政策解读：1篇（便民服务政策）
- 公共服务：1篇（政务服务效率提升）

#### 舆情数据
- 总数据量：2000条
- 情感分布：正面65%，中性25%，负面10%
- 热点话题：政务服务、民生保障、环境保护

#### 地理分布
- 北京：20%
- 上海：15%
- 广州：12%
- 深圳：10%
- 其他：43%

---

## 10. 总结

### 10.1 方案优势
1. **统一管理**：单数据库+租户隔离，简化运维
2. **数据隔离**：预置静态数据 + 动态生成数据，互不干扰
3. **快速体验**：登录即可见预置数据，无需等待
4. **交互体验**：支持一键生成和重置，便于多次演示
5. **扩展性强**：易于添加新的演示场景和数据类型

### 10.2 关键要点
- 使用`tenant_id`实现数据隔离
- 使用`is_preset`字段区分静态/动态数据
- 预置数据在租户初始化时一次性导入
- 动态数据支持一键生成和手动重置
- 保留用户操作历史，便于回溯

### 10.3 后续优化方向
- 支持更多演示场景（如电商、教育、医疗）
- 支持数据模板管理（管理员可配置）
- 支持数据量自定义（小规模/大规模演示）
- 支持数据导出/导入功能

---

## 11. 第一阶段实施状态 (2026-04-04)

### 11.1 完成情况
第一阶段（数据库迁移）已于2026-04-04完成，具体任务如下：

#### ✅ 任务1：功能配置系统表创建
- 执行脚本：`scripts/feature-config-static.sql`（版本1.0）
- 创建表：`feature_configs`、`tenant_feature_toggles`
- 插入功能配置数据：9条（商务版4条、政务版3条、通用2条）
- 状态：✅ 已完成

#### ✅ 任务2：角色和权限表扩展
- 修改`roles`表：`tenant_type`字段类型从ENUM改为VARCHAR(50)
- 修改`permissions`表：`tenant_type`字段类型从ENUM改为VARCHAR(50)
- 更新现有数据：roles设置为'business'，permissions设置为'all'
- 状态：✅ 已完成

#### ✅ 任务3：演示数据字段扩展
- 为`customer_profiles`表添加`is_preset`和`demo_scenario`字段
- 为`marketing_campaigns`表添加`is_preset`字段
- 为`government_contents`表添加`is_preset`和`demo_scenario`字段
- 创建索引优化查询性能
- 状态：✅ 已完成

#### ✅ 任务4：商务版演示租户创建
- 执行脚本：`scripts/13-demo-business-init-fixed.sql`（版本1.0）
- 创建租户：`demo-business-001`
- 创建账号：`demo@business.com` / `LuminaDemo2026`
- 导入预置数据：5条客户档案、3个分群、2个营销活动
- 状态：✅ 已完成

#### ✅ 任务5：政务版演示租户创建
- 执行脚本：`scripts/14-demo-government-init.sql`（版本1.0）
- 创建租户：`demo-government-001`
- 创建账号：`demo@government.com` / `LuminaDemo2026`
- 导入预置数据：4条政府内容
- 状态：✅ 已完成

#### ✅ 任务6：数据库验证和测试
- 验证所有表结构符合设计要求
- 验证演示租户和账号数据完整
- 验证功能配置数据正确初始化
- 验证演示数据标记字段正确
- 执行基本CRUD操作测试
- 检查数据库日志，确保无错误
- 状态：✅ 已完成

#### ✅ 任务7：数据库脚本版本管理
- 为所有执行的SQL脚本添加版本号注释
- 记录脚本执行历史到`scripts/execution_log.md`
- 备份当前数据库结构快照`scripts/database_snapshot_20260404.sql`
- 更新数据库迁移文档（本文档）
- 状态：✅ 已完成

### 11.2 数据库快照
- 备份文件：`scripts/database_snapshot_20260404.sql`
- 包含所有表结构（不含数据）
- 备份时间：2026-04-04

### 11.3 脚本版本管理
所有执行的SQL脚本均已添加版本注释：
1. `feature-config-static.sql` - 版本1.0
2. `13-demo-business-init-fixed.sql` - 版本1.0
3. `14-demo-government-init.sql` - 版本1.0

执行日志：`scripts/execution_log.md`

---

**文档版本**: v1.1  
**更新日期**: 2026-04-04  
**作者**: LuminaMedia AI Team  
**关联文档**: 
- [Demonstration_Upgrade_Summary.md](./Demonstration_Upgrade_Summary.md) - 演示版升级完整方案
- [Feature_Config_Detail_Plan.md](./Feature_Config_Detail_Plan.md)
