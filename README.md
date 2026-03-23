# LuminaMedia (灵曜智媒) - 项目设计说明书 (v2.0)

## 1. 项目愿景与定位
**LuminaMedia (灵曜智媒)** 是一个基于 AI 驱动的**内容营销平台**。系统通过数据分析+AI智能能力，为客户提供完整的营销解决方案：

### 核心业务流程
1. **客户数据导入**：支持导入客户已有数据（用户信息、消费记录、行为数据等）
2. **AI智能分析**：对导入数据进行深度分析，生成用户画像、消费洞察、趋势预测
3. **营销方案生成**：基于分析结果，AI生成针对性的营销活动方案（线上/线下）
4. **内容营销服务**：提供新媒体运营、网站建设建议、智能内容生成
5. **方案执行跟踪**：跟踪方案执行进度，收集效果反馈，优化迭代

### 服务模式
- **有数据客户**：导入客户数据 → AI分析 → 个性化营销方案
- **无数据客户**：行业基准数据 → AI推荐 → 标准化营销模板

## 2. 项目核心价值
- **数据驱动决策**：基于真实客户数据提供精准营销建议
- **AI智能赋能**：利用大语言模型生成高质量营销方案和内容
- **全流程覆盖**：从数据分析到方案执行的全链路支持
- **行业适配性**：支持零售、电商、服务、教育等多个行业

## 3. 核心技术栈与当前状态

### 已实现核心能力
- **后端框架**: Node.js (NestJS) + TypeScript ✅
- **数据库**: MySQL 8.0 + TypeORM ✅
- **AI集成**: Google Gemini 1.5 Pro API ✅
  - 已实现完整的营销策略生成功能
  - 支持优雅降级和错误处理
- **数据分析模块**: 完整的用户行为分析和营销活动管理 ✅
- **容器化部署**: Docker Compose 支持 ✅

### 待实现能力
- **AI内容生成**: Claude API 集成、文案生成、图片生成
- **自动化发布**: OpenClaw/Playwright 浏览器自动化
- **对象存储**: 阿里云 OSS 集成
- **任务调度**: BullMQ 队列系统
- **前端管理**: React/Vue 管理后台

### 技术架构特点
1. **模块化设计**: 独立的数据分析模块，易于扩展
2. **多AI提供商支持**: 抽象AI服务接口，支持Gemini/Claude切换
3. **事件驱动**: 通过事件解耦模块间通信
4. **配置驱动**: 环境变量配置所有关键参数
5. **容器化部署**: 支持Docker一键部署

## 4. 多租户数据库模型 (TypeORM Entities)

### 3.1 User (系统用户)
- `id`: UUID, 主键
- `username`: 登录名
- `password_hash`: 加密后的密码
- `email`: 联系邮箱
- `created_at`: 创建时间

### 3.2 SocialAccount (社交账号管理)
- `id`: UUID, 主键
- `userId`: 关联 User.id (多对一)
- `platform`: 平台枚举 (XHS / WECHAT_MP)
- `accountName`: 账号显示名称
- `credentials`: JSON (加密存储 Cookie, Session, Token 等)
- `status`: 账号状态 (ACTIVE / EXPIRED / RE-AUTH_REQUIRED)
- `lastUsedAt`: 最后一次发布时间

### 3.3 ContentDraft (内容草稿库)
- `id`: UUID, 主键
- `userId`: 关联 User.id
- `platformType`: 适配平台 (XHS / WECHAT_MP)
- `title`: AI 生成的标题
- `content`: AI 生成的正文 (Markdown 或 RichText)
- `mediaUrls`: JSON Array (阿里云 OSS 上的图片/视频链接)
- `tags`: JSON Array (话题标签)

### 3.4 PublishTask (发布任务队列)
- `id`: UUID, 主键
- `draftId`: 关联 ContentDraft.id
- `accountId`: 关联 SocialAccount.id
- `status`: 任务状态 (PENDING / PROCESSING / SUCCESS / FAILED)
- `scheduledAt`: 计划发布时间
- `publishedAt`: 实际完成时间
- `postUrl`: 发布成功后的线上链接
- `errorMessage`: 失败原因记录

## 5. 核心功能模块设计

### 4.1 AI 创意引擎 (Creative Service)
- 提供不同平台的 Prompt 模板库。
- 支持小红书风格（Emoji 密集、短句、互动感）和公众号风格（结构化、严谨、长文）的切换。
- 调用图片生成 API 并自动上传至阿里云 OSS。

### 4.2 OpenClaw 自动化适配器 (Automation Adapter)
- 封装 OpenClaw 接口。
- **环境隔离**: 为每个发布任务创建独立的 BrowserContext，注入对应 `SocialAccount` 的 Cookie。
- **UI 操作流**: 实现模拟点击“上传图片”、自动填写标题、粘贴文案、点击“发布”。
- **状态回传**: 抓取发布成功后的页面元素（如链接、作品 ID），并更新数据库状态。

### 4.3 任务调度系统 (Scheduler)
- 扫描 `PublishTask` 表，定时触发自动化脚本。
- 实现发布间隔控制，避免触发平台反爬虫策略。

## 6. 内容营销平台DEMO实施计划

### 项目当前状态
- ✅ **第一阶段**: 基础框架与多租户数据库 - 已完成
- ✅ **第五阶段**: 用户数据分析模块 - 已完成（包含完整的营销策略AI生成）
- 🔄 **第二阶段**: AI内容生成链 - 部分实现（Gemini集成完成，Claude待集成）
- 📋 **新目标**: 围绕"数据分析+营销活动方案生产"制作DEMO演示

### DEMO核心目标
1. **数据看板展示**: 漂亮的数据可视化看板，展示分析结果
2. **完整功能演示**: 从数据导入 → 数据分析 → 营销方案生成的全流程
3. **混合演示模式**:
   - 数据导入分析部分：使用模拟数据展示未来能力
   - 营销活动方案生成：接入真实Gemini API进行演示

### 实施阶段规划

#### 阶段1：客户数据导入与分析模块 (1-2周)
**目标**: 实现客户数据导入和基础分析能力
- 新增 `CustomerDataModule`：支持客户档案管理
- 数据导入API：支持CSV/Excel文件上传
- 用户画像生成：基于导入数据生成分析报告
- DEMO数据生成器：预设商场客户数据场景

#### 阶段2：营销方案增强与内容生成 (1-2周)
**目标**: 增强现有营销策略生成，增加AI内容生成能力
- 扩展 `GeminiService`：支持多平台文案生成（小红书、公众号等）
- 创建 `ContentGenerationService`：管理AI内容生成流程
- 集成现有 `ContentDraft` 实体：存储AI生成的内容草稿
- 增强 `MarketingStrategy`：连接客户数据分析结果

#### 阶段3：DEMO集成与前端展示 (1周)
**目标**: 集成所有功能，提供演示界面
- DEMO专用API：一键启动演示场景
- 数据可视化看板：使用Chart.js/ECharts展示分析结果
- 简单管理界面：React/Vue基础前端
- 完整文档：DEMO使用指南和API文档

#### 阶段4：后续演进路线
1. **Claude API集成**：补充现有Gemini，提供多AI选择
2. **图片生成与OSS上传**：集成DALL-E/Midjourney，阿里云OSS存储
3. **自动化发布集成**：OpenClaw/Playwright浏览器自动化
4. **方案执行跟踪**：营销方案执行进度和效果反馈
5. **行业模板扩展**：零售、电商、教育、医疗等行业方案

### 技术架构调整
1. **模块重构**: 将 `DataAnalyticsModule` 扩展为 `CustomerAnalyticsModule`
2. **AI服务抽象**: 创建 `IAIService` 接口，支持Gemini/Claude多提供商
3. **事件驱动**: 通过事件解耦数据导入 → 分析 → 方案生成流程
4. **前后端分离**: 后端API + 前端数据看板展示

### 关键API端点规划
- **客户数据管理**: `/api/v1/customer-data/` (新增)
- **内容生成服务**: `/api/v1/content-generation/` (新增)
- **DEMO专用API**: `/api/v1/demo/` (新增)
- **现有数据分析API**: `/api/v1/analytics/` (保持不变)

### 成功指标
1. DEMO流程完整执行时间 < 3分钟
2. 数据可视化看板响应时间 < 2秒
3. AI营销方案生成质量评分 > 70分
4. 用户理解度调查评分 > 4/5

---

## 7. 快速启动与开发指引

### 实施计划文档
详细的DEMO实施进度计划请参阅 [Progress.md](./Progress.md)，包含：
- 分阶段任务分解（阶段1-3，共14-20天）
- 具体交付物和验收标准
- 技术决策点和风险评估
- 资源需求和时间估算

### 环境准备
1. **配置环境变量**: 复制 `.env.example` 为 `.env` 并填写实际配置
2. **安装依赖**: `npm install`
3. **启动数据库**: `docker-compose up -d` (或配置阿里云RDS)
4. **运行数据库迁移**:
   ```bash
   mysql -u username -p < scripts/01-init.sql
   mysql -u username -p lumina_media < scripts/02-analytics-migration.sql
   ```
5. **启动开发服务器**: `npm run start:dev`

### 测试现有功能
1. **测试Gemini API**: `npm run test:gemini`
2. **访问API文档**: 启动后访问 `http://localhost:3003/api` (如有配置Swagger)
3. **测试数据分析API**:
   ```bash
   # 生成模拟数据
   curl -X POST http://localhost:3003/api/v1/analytics/mock/generate \
     -H "Content-Type: application/json" \
     -d '{"userId": "test-user-123"}'

   # 获取行为分析
   curl http://localhost:3003/api/v1/analytics/behavior/test-user-123/summary
   ```

### 后续开发任务
1. **客户数据模块**: 实现 `CustomerDataModule` 和相关实体
2. **内容生成服务**: 扩展 `GeminiService` 支持文案生成
3. **前端数据看板**: 开发 `dashboard-web/` 可视化界面
4. **DEMO集成**: 实现一键演示场景和完整流程

### 项目结构说明
```
src/
├── entities/                    # 核心业务实体
├── modules/
│   ├── data-analytics/         # 数据分析模块（已完成）
│   ├── customer-data/          # 客户数据模块（待开发）
│   └── content-generation/     # 内容生成模块（待开发）
├── shared/
│   └── enums/                  # 枚举类型定义
└── config/                     # 配置文件
```

### 开发规范
1. **TypeScript严格模式**: 启用所有严格类型检查
2. **模块化设计**: 每个功能独立模块，清晰接口
3. **错误处理**: 统一错误响应格式和日志记录
4. **API文档**: 使用Swagger/OpenAPI文档
5. **测试覆盖**: 单元测试和集成测试