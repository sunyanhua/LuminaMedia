# LuminaMedia 内容营销平台演示指南

## 概述

LuminaMedia（灵曜智媒）是一个基于 AI 驱动的**内容营销平台**，提供从客户数据分析到智能营销方案生成的全流程解决方案。本指南演示如何使用系统的完整功能。

### 核心业务流程

1. **客户数据导入**：支持导入客户已有数据（用户信息、消费记录、行为数据等）
2. **AI智能分析**：对导入数据进行深度分析，生成用户画像、消费洞察、趋势预测
3. **营销方案生成**：基于分析结果，AI生成针对性的营销活动方案（线上/线下）
4. **内容营销服务**：提供新媒体运营、网站建设建议、智能内容生成
5. **方案执行跟踪**：跟踪方案执行进度，收集效果反馈，优化迭代

### 演示目标

- **完整功能演示**：从数据导入 → 数据分析 → 营销方案生成的全流程
- **混合演示模式**：
  - 数据导入分析部分：使用模拟数据展示未来能力
  - 营销活动方案生成：接入真实Gemini API进行演示
- **数据看板展示**：漂亮的数据可视化看板，展示分析结果

## 系统架构

### 技术栈
- **后端框架**: Node.js (NestJS) + TypeScript
- **数据库**: MySQL 8.0 + TypeORM
- **AI集成**: Google Gemini 1.5 Pro API
- **前端看板**: React + TypeScript + Vite + ECharts
- **部署**: Docker Compose 一键部署

### 核心模块
1. **客户数据模块** (`CustomerDataModule`) - 客户档案管理和数据导入
2. **数据分析模块** (`DataAnalyticsModule`) - 用户行为分析和营销活动管理
3. **内容生成模块** (`ContentGenerationService`) - AI内容生成
4. **仪表板模块** (`DashboardModule`) - 数据可视化API
5. **演示模块** (`DemoService`) - 一键演示功能

## 快速启动

### 前提条件
- **Docker** 和 **Docker Compose** 已安装
- **Node.js 18+** 和 **npm**（用于开发模式）
- **Gemini API 密钥**（可选，用于AI内容生成）

### 一键启动（推荐）

使用 Docker Compose 一键启动完整系统：

```bash
# 1. 复制环境变量配置文件
cp .env.example .env

# 2. 编辑 .env 文件，配置 Gemini API 密钥（可选）
# 将 GEMINI_API_KEY 设置为您的实际密钥

# 3. 启动所有服务
docker-compose up -d

# 4. 查看服务状态
docker-compose ps
```

服务启动后：
- **后端API**: http://localhost:3003
- **前端看板**: http://localhost:5174
- **数据库**: MySQL 运行在 localhost:3307

### 手动启动（开发模式）

```bash
# 1. 安装依赖
npm install

# 2. 启动数据库（使用Docker）
docker-compose up -d db-lumina

# 3. 初始化数据库
mysql -u lumina_user -plumina_password -h 127.0.0.1 -P 3307 lumina_media < scripts/01-init.sql
mysql -u lumina_user -plumina_password -h 127.0.0.1 -P 3307 lumina_media < scripts/02-analytics-migration.sql
mysql -u lumina_user -plumina_password -h 127.0.0.1 -P 3307 lumina_media < scripts/03-content-generation-migration.sql
mysql -u lumina_user -plumina_password -h 127.0.0.1 -P 3307 lumina_media < scripts/04-customer-data-migration.sql

# 4. 启动后端开发服务器
npm run start:dev

# 5. 启动前端开发服务器（新终端）
cd dashboard-web
npm install
npm run dev
```

## 完整演示流程

### 步骤1：一键启动演示

使用 DEMO 专用API快速启动完整演示流程：

```bash
# 启动完整演示流程
curl -X POST "http://localhost:3003/api/v1/analytics/demo/quick-start" \
  -H "Content-Type: application/json"
```

**响应示例**：
```json
{
  "success": true,
  "message": "演示流程执行成功",
  "data": {
    "demoId": "demo-1742146800000",
    "customerProfile": {
      "id": "customer-profile-uuid",
      "name": "商场顾客数据",
      "description": "基于1000条商场顾客消费记录的模拟数据"
    },
    "segments": [
      {
        "id": "segment-uuid-1",
        "segmentName": "高价值VIP客户",
        "description": "高收入高消费群体，注重品质和体验",
        "memberCount": 150
      },
      {
        "id": "segment-uuid-2",
        "segmentName": "年轻时尚族群",
        "description": "18-30岁年轻人群，追求时尚和社交",
        "memberCount": 300
      },
      {
        "id": "segment-uuid-3",
        "segmentName": "家庭消费群体",
        "description": "30-50岁家庭人群，注重实用性和性价比",
        "memberCount": 350
      }
    ],
    "campaign": {
      "id": "campaign-uuid",
      "name": "商场春季焕新购物节",
      "budget": 200000,
      "status": "ACTIVE"
    },
    "strategies": [
      {
        "id": "strategy-uuid-1",
        "strategyType": "CONTENT",
        "confidenceScore": 85,
        "expectedROI": 42.5
      },
      {
        "id": "strategy-uuid-2",
        "strategyType": "CHANNEL",
        "confidenceScore": 78,
        "expectedROI": 35.2
      },
      {
        "id": "strategy-uuid-3",
        "strategyType": "TIMING",
        "confidenceScore": 82,
        "expectedROI": 28.7
      },
      {
        "id": "strategy-uuid-4",
        "strategyType": "BUDGET_ALLOCATION",
        "confidenceScore": 76,
        "expectedROI": 45.1
      }
    ],
    "contentGenerated": true,
    "contentPlatforms": ["XHS", "WECHAT_MP", "DOUYIN"]
  },
  "timestamp": "2026-03-16T12:00:00.000Z"
}
```

### 步骤2：查看数据看板

访问前端数据看板查看可视化分析结果：

1. 打开浏览器访问：http://localhost:5174
2. 系统会自动加载演示数据
3. 查看以下可视化图表：
   - **客户画像仪表板**：年龄分布、消费习惯、兴趣标签
   - **营销方案效果展示**：ROI、执行进度、内容质量
   - **实时数据监控面板**：活动状态和关键指标

### 步骤3：分步执行演示（可选）

如果您想了解每个步骤的详细信息，可以使用分步API：

```bash
# 获取演示场景描述
curl "http://localhost:3003/api/v1/analytics/demo/scenario/mall-customer"

# 执行特定步骤（步骤1-6）
curl -X POST "http://localhost:3003/api/v1/analytics/demo/step/1" \
  -H "Content-Type: application/json" \
  -d '{"stepData": {"description": "数据导入步骤"}}'
```

### 步骤4：查看演示状态

```bash
# 获取演示系统状态
curl "http://localhost:3003/api/v1/analytics/demo/status"
```

### 步骤5：重置演示数据

```bash
# 重置演示数据（清理数据库）
curl -X DELETE "http://localhost:3003/api/v1/analytics/demo/reset"
```

## 核心模块详细使用

### 1. 客户数据模块

#### 创建客户档案
```bash
POST /api/v1/customer-data/profiles
{
  "customerName": "商场顾客数据",
  "customerType": "INDIVIDUAL",
  "industry": "RETAIL",
  "dataSources": [
    {
      "type": "CSV",
      "path": "demo-data/mall_customers.csv",
      "recordCount": 1000
    }
  ]
}
```

#### 导入数据文件
```bash
POST /api/v1/customer-data/profiles/{profileId}/import
Content-Type: multipart/form-data

# 上传CSV文件
file: @demo-data/mall_customers.csv
```

#### 获取分析报告
```bash
GET /api/v1/customer-data/profiles/{profileId}/analysis
```

#### 获取客户分群
```bash
GET /api/v1/customer-data/profiles/{profileId}/segments
```

### 2. 数据分析模块

#### 生成营销活动
```bash
POST /api/v1/analytics/campaigns
{
  "userId": "test-user-123",
  "customerProfileId": "profile-uuid",
  "name": "商场春季焕新购物节",
  "campaignType": "HYBRID",
  "targetAudience": {
    "demographics": {
      "ageRange": [18, 55],
      "gender": "both",
      "incomeLevel": "middle_to_high"
    },
    "interests": ["购物", "时尚", "美食", "娱乐"]
  },
  "budget": 200000
}
```

#### 生成营销策略
```bash
POST /api/v1/analytics/strategies/generate
{
  "campaignId": "campaign-uuid",
  "strategyType": "CONTENT",
  "generatedBy": "AI_GENERATED",
  "useGemini": true
}
```

#### 获取策略推荐
```bash
GET /api/v1/analytics/strategies/recommendations/test-user-123
```

### 3. 内容生成模块

#### 生成营销内容
```bash
POST /api/v1/analytics/content-generation/generate/marketing-content
{
  "campaignSummary": {
    "id": "campaign-uuid",
    "name": "商场春季焕新购物节",
    "campaignType": "HYBRID",
    "budget": 200000
  },
  "targetPlatforms": ["XHS", "WECHAT_MP", "DOUYIN"],
  "contentTypes": ["promotional", "educational"],
  "tone": "friendly",
  "quantity": 2
}
```

#### 为策略生成内容
```bash
POST /api/v1/analytics/strategies/{strategyId}/generate-content
```

### 4. 仪表板模块

#### 获取客户概览数据
```bash
GET /api/v1/dashboard/customer-overview/{profileId}
```

#### 获取营销活动表现
```bash
GET /api/v1/dashboard/marketing-performance/{campaignId}
```

#### 获取实时指标
```bash
GET /api/v1/dashboard/real-time-metrics
```

## 前端数据看板

### 主要功能

1. **客户画像分析**
   - 人口统计分布（年龄、性别、收入）
   - 消费行为模式（购物频率、消费金额、偏好类别）
   - 时间分布（高峰期、工作日/周末模式）

2. **营销活动监控**
   - 活动执行进度跟踪
   - 预算使用情况
   - ROI预期和实际对比
   - 策略效果评估

3. **内容生成展示**
   - AI生成内容预览
   - 多平台内容适配
   - 内容质量评分

### 访问方式
- **开发模式**: http://localhost:5174
- **生产模式**: http://localhost:5174 (Docker部署)
- **API基础路径**: http://localhost:3003/api/v1

## 演示场景说明

### 商场顾客营销方案演示

本演示模拟一个商场顾客数据分析和营销方案生成的全过程：

#### 场景背景
- **数据源**: 1000条商场顾客消费记录
- **行业**: 零售业
- **目标**: 提升商场客流量和消费额
- **预算**: 200,000元
- **时间**: 3个月（春季购物节）

#### 演示步骤
1. **数据导入**: 导入商场顾客CSV数据
2. **客户分析**: 生成用户画像和消费洞察
3. **客户分群**: 分为3个典型群体
   - 高价值VIP客户（150人）
   - 年轻时尚族群（300人）
   - 家庭消费群体（350人）
4. **活动策划**: 创建"商场春季焕新购物节"
5. **策略生成**: AI生成4种营销策略
   - 内容策略（CONTENT）
   - 渠道策略（CHANNEL）
   - 时间策略（TIMING）
   - 预算策略（BUDGET_ALLOCATION）
6. **内容生成**: 为小红书、公众号和抖音生成营销内容

#### 预期产出
- 完整的客户画像分析报告
- 3个客户分群及特征描述
- 营销活动策划方案
- 4个AI生成的营销策略
- 跨平台营销内容包（小红书+公众号+抖音）

## 故障排除

### 常见问题

#### 1. Docker启动失败
**症状**: `docker-compose up -d` 失败
**解决方案**:
```bash
# 检查端口占用
netstat -ano | findstr :3003
netstat -ano | findstr :5174
netstat -ano | findstr :3307

# 停止占用端口的进程
# 或修改 docker-compose.yml 中的端口映射
```

#### 2. 数据库连接失败
**症状**: 应用无法连接MySQL
**解决方案**:
```bash
# 检查MySQL容器状态
docker-compose ps db-lumina

# 查看MySQL日志
docker-compose logs db-lumina

# 手动连接测试
mysql -u lumina_user -plumina_password -h 127.0.0.1 -P 3307 lumina_media
```

#### 3. Gemini API密钥问题
**症状**: AI内容生成失败
**解决方案**:
1. 检查 `.env` 文件中的 `GEMINI_API_KEY` 配置
2. 验证API密钥是否有效
3. 系统支持优雅降级，无API密钥时使用模拟模板

#### 4. 前端无法访问后端API
**症状**: 前端看板显示网络错误
**解决方案**:
1. 检查后端服务是否运行：`curl http://localhost:3003/health`
2. 检查CORS配置：确保前端URL在CORS允许列表中
3. 查看浏览器控制台错误信息

### 调试日志

启用详细日志有助于诊断问题：

```bash
# 修改 .env 文件
TYPEORM_LOGGING=true
LOG_LEVEL=debug

# 重启服务
docker-compose restart app
```

查看应用日志：
```bash
docker-compose logs app
```

## 性能指标

### 系统要求
- **内存**: 至少4GB RAM
- **CPU**: 2核以上
- **磁盘**: 至少10GB可用空间
- **网络**: 稳定互联网连接（用于Gemini API）

### 性能基准
- **数据导入API响应时间**: < 1秒
- **AI内容生成平均时间**: < 10秒
- **前端页面加载时间**: < 3秒
- **图表渲染时间**: < 2秒
- **完整演示流程执行时间**: < 3分钟

### 监控建议
- API调用成功率
- 平均响应时间
- 内存使用情况
- 数据库连接池状态

## 扩展和定制

### 添加新的演示场景

1. 在 `DemoService` 中添加新的场景方法
2. 创建对应的模拟数据文件
3. 更新演示场景API端点
4. 调整前端展示逻辑

### 集成其他AI服务

系统支持多AI提供商，可轻松集成：
- **Claude API**: 参考 `GeminiService` 实现
- **OpenAI GPT**: 实现相同接口
- **本地模型**: 部署本地LLM服务

### 自定义数据分析算法

修改以下服务以定制分析逻辑：
- `CustomerAnalyticsService`: 客户数据分析算法
- `AnalyticsService`: 用户行为分析逻辑
- `MarketingStrategyService`: 策略生成逻辑

## 相关文档

- [项目README](./README.md) - 项目总体介绍
- [进度计划](./PROGRESS.md) - 开发进度和计划
- [Gemini集成指南](./docs/gemini-integration.md) - AI集成详细说明
- [数据分析模块演示指南](./ANALYTICS_DEMO.md) - 数据分析模块API文档

## 技术支持

如遇问题，请按以下步骤排查：

1. 查看本文档的故障排除部分
2. 检查应用日志：`docker-compose logs app`
3. 运行健康检查：`curl http://localhost:3003/health`
4. 查看数据库状态：`docker-compose exec db-lumina mysql -u lumina_user -plumina_password lumina_media -e "SHOW TABLES;"`
5. 联系开发团队

### 当前系统状态 (2026-03-22)

- **Docker容器状态**: 所有容器运行正常（后端3003，前端5174，数据库3307）
- **Gemini API代理**: 已修复并验证可用，健康检查通过，可访问7个模型
- **DEMO核心功能**: 一键演示API工作正常，前端看板可访问
- **内容生成**: Gemini API健康检查通过，但内容生成使用回退模式（需进一步调试）
- **系统整体**: 功能完整，可进行完整演示流程

---

**演示系统版本**: v2.0
**最后更新**: 2026-03-22
**预计演示时间**: 3-5分钟
**数据完整性**: 1000条模拟客户记录
**AI集成**: Google Gemini 1.5 Pro API