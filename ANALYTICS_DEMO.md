# LuminaMedia 数据分析模块演示指南

> **⚠️ 文档更新通知**
>
> 本文档为旧版数据分析模块演示指南，现已被更全面的文档取代。请优先参考以下新文档：
>
> 1. **[DEMO_GUIDE.md](./DEMO_GUIDE.md)** - 完整的系统演示指南，涵盖从数据导入到营销内容生成的全流程
> 2. **[API_REFERENCE.md](./API_REFERENCE.md)** - 完整的API参考文档，包含所有模块的详细API说明
>
> 新文档已更新端口号（3002）和新增功能，建议使用新文档进行开发和演示。

## 概述
数据分析模块为 LuminaMedia 系统添加了用户行为追踪、营销活动管理和智能策略生成功能。本指南演示如何使用该模块的 API。

## 前提条件
1. 数据库已初始化（运行 `scripts/init.sql` 和 `scripts/analytics-migration.sql`）
2. 开发服务器正在运行（`npm run start:dev`）
3. 存在至少一个测试用户（ID: `test-user-123`）

## API 端点概览

### 基础路径
所有 API 端点前缀：`http://localhost:3002/api/v1/analytics/`

### 1. 模拟数据管理（开发环境）
```bash
# 生成模拟数据
POST /mock/generate
{
  "userId": "test-user-123"
}

# 查看模拟数据状态
GET /mock/status

# 重置模拟数据
POST /mock/reset
# 或重置指定用户的数据
POST /mock/reset?userId=test-user-123
```

### 2. 用户行为分析
```bash
# 追踪用户行为（模拟）
POST /behavior/track
{
  "userId": "test-user-123",
  "sessionId": "session-001",
  "eventType": "CONTENT_CREATE",
  "eventData": {
    "contentType": "article",
    "length": 1200
  }
}

# 获取用户行为分析（最近30天）
GET /behavior/test-user-123

# 获取用户行为摘要
GET /behavior/test-user-123/summary
```

### 3. 营销活动管理
```bash
# 创建营销活动
POST /campaigns
{
  "userId": "test-user-123",
  "name": "小红书春季美妆推广",
  "campaignType": "ONLINE",
  "targetAudience": {
    "ageRange": [18, 35],
    "gender": "female",
    "interests": ["美妆", "护肤", "时尚"]
  },
  "budget": 50000,
  "startDate": "2024-03-01",
  "endDate": "2024-06-30"
}

# 获取活动列表
GET /campaigns?userId=test-user-123&page=1&limit=10

# 获取活动详情
GET /campaigns/{campaignId}

# 更新活动
PUT /campaigns/{campaignId}
{
  "status": "ACTIVE",
  "budget": 55000
}

# 分析活动数据
POST /campaigns/{campaignId}/analyze
```

### 4. 营销策略生成
```bash
# 生成营销策略
POST /strategies/generate
{
  "campaignId": "campaign-id-here",
  "strategyType": "CONTENT"
}

# 获取活动的所有策略
GET /strategies/campaign/{campaignId}

# 评估策略效果
POST /strategies/{strategyId}/evaluate

# 获取推荐策略
GET /strategies/recommendations/test-user-123
```

### 5. 报告生成
```bash
# 生成用户行为报告
GET /reports/behavior/test-user-123

# 生成营销活动报告
GET /reports/campaign/{campaignId}

# 导出报告（JSON格式）
POST /reports/export/behavior/test-user-123?format=json

# 获取每日活跃度可视化数据
GET /reports/visualization/daily-activity?userId=test-user-123&days=30

# 获取事件分布可视化数据
GET /reports/visualization/event-distribution?userId=test-user-123
```

## 完整演示流程

### 步骤1: 生成模拟数据
```bash
curl -X POST http://localhost:3002/api/v1/analytics/mock/generate \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-123"}'
```

### 步骤2: 查看生成的数据
```bash
curl http://localhost:3002/api/v1/analytics/mock/status
```

### 步骤3: 分析用户行为
```bash
curl http://localhost:3002/api/v1/analytics/behavior/test-user-123/summary
```

### 步骤4: 创建营销活动
```bash
curl -X POST http://localhost:3002/api/v1/analytics/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "name": "演示营销活动",
    "campaignType": "ONLINE",
    "budget": 30000
  }'
```

### 步骤5: 生成营销策略
```bash
# 首先获取刚创建的活动ID，然后生成策略
campaignId="从步骤4响应中获取"
curl -X POST http://localhost:3002/api/v1/analytics/strategies/generate \
  -H "Content-Type: application/json" \
  -d "{\"campaignId\": \"$campaignId\", \"strategyType\": \"CONTENT\"}"
```

### 步骤6: 生成报告
```bash
curl http://localhost:3002/api/v1/analytics/reports/behavior/test-user-123
```

## 数据结构说明

### 用户行为事件类型 (UserBehaviorEvent)
- `PAGE_VIEW`: 页面浏览
- `CONTENT_CREATE`: 创建内容
- `PUBLISH_TASK`: 发布任务
- `LOGIN`: 登录
- `LOGOUT`: 登出
- `CAMPAIGN_CREATE`: 创建营销活动
- `STRATEGY_GENERATE`: 生成策略
- `REPORT_VIEW`: 查看报告

### 营销活动类型 (CampaignType)
- `ONLINE`: 线上活动
- `OFFLINE`: 线下活动
- `HYBRID`: 混合活动

### 营销策略类型 (StrategyType)
- `CONTENT`: 内容策略
- `CHANNEL`: 渠道策略
- `TIMING`: 时机策略
- `BUDGET_ALLOCATION`: 预算分配策略

## 注意事项
1. Mock 数据控制器仅应在开发环境使用
2. 实际部署时应配置真实的数据库连接
3. 生产环境中应实现真实的用户认证和授权
4. 策略生成功能当前为模拟版本，可扩展为真实的 AI 服务调用

## 扩展建议
1. 集成真实的 AI 服务（Claude/Gemini）进行策略生成
2. 添加实时数据流处理（Kafka/RabbitMQ）
3. 实现高级分析功能（预测分析、异常检测）
4. 开发 Web 前端可视化仪表盘
5. 支持多数据源导入和导出