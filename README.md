# LuminaMedia (灵曜智媒) - AI驱动的内容营销平台

## 项目概述

**LuminaMedia** 是一个基于AI驱动的企业级内容营销平台，采用模块化单体架构，为企事业单位提供完整的宣传营销解决方案。平台分为商务版和政务版，支持SaaS多租户模式和私有化部署。

### 项目状态 (2026-04-05)

**当前版本**: v19.0 (3.1 DEMO细节推进版 规划中)  
**上一版本**: v18.1 (3.0 DEMO版 已归档)  
**项目状态**: 🟡 **3.1 DEMO版方案已确认，任务清单已制定，等待执行**  
**质量评分**: 97.0/100 (3.0 DEMO版第四轮质检)  
**系统状态**: 3.0稳定运行，3.1开发准备就绪

### 版本历史
- **v19.0 (2026-04-05)**: 3.1 DEMO细节推进版 - 聚焦微信公众号运营场景，打造可正式演示的完整版本（规划中）
- **v18.1 (2026-04-04)**: 3.0 DEMO版 - 功能配置系统、配额限制系统、演示数据管理系统完整实现（已归档）
- **v17.0 (2026-04-01)**: 2.0重构基础版本 - 四大核心模块完整实现（已归档）  

### 核心成就

**3.1 DEMO版规划目标**:
- 🎯 **政务版完整演示**: 打造可向政务客户正式演示的版本，聚焦微信公众号运营场景
- 🎯 **租户-用户体系**: 支持一个租户下多用户，不同审核权限
- 🎯 **内容生产闭环**: 选题→资料补充→内容生成→审核→发布的完整流程
- 🎯 **智能报告生成**: 支持自定义报告、Word导出、PPT大纲生成

**3.0 DEMO版已完成**:
- ✅ **架构升级成功**: 从遗留单体架构成功升级为模块化单体架构（22个模块）
- ✅ **功能完整实现**: 四大核心模块（SmartDataEngine、AI Agent、矩阵分发、客户大脑）完整实现
- ✅ **质量基线建立**: 构建成功、测试通过率100%、无严重安全漏洞
- ✅ **文档体系完善**: 完整的项目文档、任务清单、质检报告
- ✅ **运行环境稳定**: Docker容器稳定运行，核心服务100%可用

### 核心业务流程
1. **智能数据导入**：支持Excel/API数据导入，AI自动映射非标字段
2. **大数据分析**：SmartDataEngine处理600万会员数据，生成4维度用户画像
3. **AI营销策划**：Agent工作流模式生成专业级营销方案
4. **内容生成发布**：跨平台内容生成和自动化发布
5. **效果追踪分析**：活动闭环评价和优化建议

### 架构设计原则
- **模块化单体架构**：代码严格模块化，数据库逻辑隔离
- **Mobile-First前端**：优先移动端设计，确保微信端完美显示
- **CloudProvider抽象层**：一键切换阿里云SaaS环境和私有化环境
- **渐进式演进**：当前模块化单体，未来可平滑拆分为微服务

## 核心技术架构

### 2.0架构核心组件
```
┌─────────────────────────────────────────────────┐
│            LuminaMedia 2.0 Core Engine          │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ AI Engine   │ │ Data Engine │ │ Workflow  │ │
│  │   (Agent)   │ │  (OLAP)     │ │  Engine   │ │
│  └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────┘
         │                  │               │
┌────────▼──────────────────▼───────────────▼──────┐
│           Platform Adapter Layer                  │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐  │
│  │ AliCloud    │ │ Private     │ │ Mock      │  │
│  │ Adapter     │ │ Deploy      │ │ Adapter   │  │
│  │             │ │ Adapter     │ │           │  │
│  └─────────────┘ └─────────────┘ └───────────┘  │
└─────────────────────────────────────────────────┘
```

### 技术栈详情

#### 后端技术栈 (NestJS + TypeScript)
- **框架**: NestJS 模块化架构
- **数据库**: MySQL 8.0 + TypeORM (多租户tenant_id隔离)
- **缓存**: Redis云版 (任务队列、会话缓存)
- **异步处理**: Bull/Redis Queue
- **API设计**: RESTful API + WebSocket
- **配置管理**: ConfigModule + 环境变量
- **监控**: Prometheus + Grafana
- **日志**: Winston + ELK

#### 前端技术栈 (React + Vite + TypeScript)
- **构建工具**: Vite + 移动端代码优化
- **组件库**: Ant Design Mobile + 响应式组件
- **状态管理**: Zustand (轻量级全局状态)
- **路由**: React Router + 移动端友好导航
- **数据可视化**: Recharts
- **类型安全**: TypeScript严格模式
- **移动端适配**: Mobile-First原则，微信端完美兼容

#### AI技术栈
- **云端AI**: Google Gemini 2.5 + 阿里云百炼(Qwen)
- **本地AI**: Docker一键拉起Qwen-7B本地模型
- **AI Agent工作流**: 分析Agent → 策划Agent → 文案Agent三阶段
- **RAG知识库**: 向量数据库 + 检索增强生成
- **成本控制**: Token计费 + 额度管控

#### 云服务 (阿里云)
- **计算**: ECS集群 + SLB负载均衡
- **数据库**: RDS MySQL主从
- **缓存**: Redis云版集群
- **存储**: OSS对象存储 + CDN
- **网络**: VPC + 安全组

### 数据库架构
- **多租户隔离**: 所有表增加tenant_id字段，逻辑隔离
- **大数据处理**: 600万数据分表分片策略
- **混合存储**:
  - MySQL RDS: 结构化业务数据
  - Redis: 任务队列、会话缓存
  - OSS: 文档、图片、视频文件
  - 向量数据库: 知识库文档向量化存储

## 五大核心功能模块

### 1. 智能数据魔方 (Business Insights)
- **AI字段自动映射**: 自动识别非标Excel/API表头，转换为标准4维度字段
- **离线标签计算**: SQL批处理引擎，避免Token浪费
- **4维度用户画像**:
  - 基础生命周期属性 (年龄段、学历、家庭角色等)
  - 消费性格属性 (消费档次、购物宽度、决策速度等)
  - 实时状态属性 (活跃度、成长趋势等)
  - 社交与活动属性 (裂变潜力、活动偏好等)
- **数据缺失预警**: 关键维度缺失时自动标记并引导补全

### 2. AI智策工厂 (Campaign Lab)
- **Agent工作流模式**: 分析 → 策划 → 文案三阶段专业CMO工作流
- **RAG知识库联动**: 检索客户知识库，确保方案符合品牌调性
- **全案包生成**: Word方案 + PPT结构 + 媒体排期 + 效果预估
- **活动闭环评价**: AI预测值与实际数据对比分析

### 3. 矩阵分发中心 (Matrix Ops)
- **三审三校工作流**: 编辑 → AI安全自检 → 业务主管 → 行政/法务
- **跨平台发布引擎**:
  - 微信: 官方API + 自动排版模板
  - 小红书/微博: OpenClaw Browser Agent模拟发布
- **自动排版配图**: AI生成封面图、配图、视频脚本

### 4. 客户大脑 (Knowledge Base)
- **向量化存储**: 客户文档、网址、文章通过Embedding存入向量数据库
- **企业画像生成**: 自动分析语言风格、视觉偏好、禁忌词
- **智能检索**: RAG增强的内容生成和方案策划

### 5. 舆情与GEO监测
- **全网数据采集**: 监测小红书/微博/公众号等平台
- **情感分析引擎**: 实时舆情分析和趋势预测
- **GEO优化建议**: SEO/GEO关键词霸屏建议

## 部署方案

### 阿里云SaaS部署 (默认)
```yaml
环境变量: CLOUD_PROVIDER=alicloud
服务配置:
  - 数据库: RDS MySQL 8.0
  - 缓存: Redis云版
  - 存储: OSS + CDN
  - AI服务: Gemini API + 阿里云百炼
```

### 私有化部署
```yaml
环境变量: CLOUD_PROVIDER=private
服务配置:
  - 数据库: 本地MySQL/PostgreSQL
  - 缓存: 内网Redis集群
  - 存储: MinIO对象存储
  - AI服务: Docker一键拉起Qwen-7B本地模型
```

### DEMO部署
- **商务版DEMO**: 模拟数据 + Mock AI服务
- **政务版DEMO**: 真实账号 + 真实AI服务

## 开发环境准备

### 快速启动 (开发环境)
```bash
# 1. 克隆项目
git clone <repository-url>
cd LuminaMedia

# 2. 配置环境变量
cp .env.example .env
# 编辑.env文件，配置数据库连接和API密钥

# 3. 启动Docker容器
docker-compose up -d

# 4. 访问服务
# 后端API: http://localhost:3003
# 前端Dashboard: http://localhost:5174
# API文档: http://localhost:3003/api/docs
```

### 环境变量配置
```env
# 数据库配置
DB_HOST=db-lumina
DB_PORT=3306
DB_USERNAME=lumina_user
DB_PASSWORD=lumina_password
DB_DATABASE=lumina_media

# AI服务配置
GEMINI_API_KEY=your_gemini_api_key
DASHSCOPE_API_KEY=your_dashscope_api_key

# 部署模式
CLOUD_PROVIDER=alicloud  # alicloud | private
DEPLOYMENT_MODE=saas     # saas | demo
```

## 项目结构
```
LuminaMedia/
├── src/                    # NestJS后端源代码
│   ├── modules/           # 模块化目录 (待重构)
│   │   ├── auth/         # 认证模块
│   │   ├── data-engine/  # 智能数据引擎模块
│   │   ├── ai-engine/    # AI工作流引擎模块
│   │   ├── publish/      # 发布模块
│   │   └── knowledge/    # 知识库模块
│   ├── entities/         # 数据库实体
│   ├── shared/           # 共享代码
│   └── config/           # 配置管理
├── dashboard-web/         # 前端Dashboard (React)
├── scripts/              # 数据库脚本和工具
├── docs/                 # 项目文档
│   ├── tasks/            # 实施任务清单（按版本分目录）
│   │   ├── 3.0-demo/     # 3.0 DEMO版六阶段任务清单
│   │   └── archive/      # 历史版本归档
│   ├── README.md         # 文档索引
│   └── ...
├── docker-compose.yml    # Docker编排配置
├── Dockerfile.backend    # 后端Dockerfile
└── README.md            # 本文件
```

## 文档链接
- [项目进度追踪](./PROGRESS.md) - 当前进展和任务状态
- [实施任务清单](./tasks/) - 按版本组织的详细任务分解（当前：3.0-demo/）
- [开发规范](./docs/development-guide.md) - 编码规范和最佳实践

## 许可证
版权所有 © 2026 灵曜智媒团队。保留所有权利。

---

**版本**: v19.0 (2026-04-05)
**状态**: 3.1 DEMO细节推进版方案已确认，任务清单已制定，等待执行
**上一版本**: v18.1 (3.0 DEMO版已归档，综合评分97分)