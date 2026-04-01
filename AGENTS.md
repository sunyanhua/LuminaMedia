# AGENTS.md — LuminaMedia 2.0 (灵曜智媒)

> 本文件面向 AI 编程助手。如果你正在阅读本文档，说明你对该项目一无所知；请严格依据以下内容开展工作，不要做任何假设。

---

## 1. 项目概述

**LuminaMedia 2.0（灵曜智媒）** 是一个基于 AI 驱动的企业级内容营销平台，采用**模块化单体架构（Modular Monolith）**，为企事业单位提供完整的宣传营销解决方案。平台分为商务版和政务版，支持 SaaS 多租户模式和私有化部署。

- **当前版本**: v17.0（2026-04-01）
- **项目状态**: 2.0 四阶段重构计划已全部完成，系统稳定运行，进入迭代优化阶段
- **质量评分**: 第 4 轮全量质检综合评分 98/100

### 1.1 核心功能模块

1. **智能数据魔方 (Business Insights)** — Excel/API 数据导入、AI 字段自动映射、4 维度用户画像
2. **AI 智策工厂 (Campaign Lab)** — Agent 工作流（分析 → 策划 → 文案三阶段）、RAG 知识库联动
3. **矩阵分发中心 (Matrix Ops)** — 三审三校工作流、跨平台内容发布（微信/小红书/微博）
4. **客户大脑 (Knowledge Base)** — 向量化存储、企业画像生成、智能检索
5. **舆情与 GEO 监测** — 全网数据采集、情感分析、SEO/GEO 优化建议

### 1.2 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | NestJS 11 + TypeScript 5.7 |
| 前端框架 | React 18 + Vite 5 + TypeScript（`dashboard-web/`） |
| UI 组件 | Ant Design Mobile + Radix UI + TailwindCSS |
| 数据库 | MySQL 8.0 + TypeORM 0.3 |
| 缓存/队列 | Redis 7 + Bull |
| 向量数据库 | Qdrant |
| AI 服务 | Google Gemini 2.5 + 阿里云百炼 (Qwen) |
| 监控/日志 | SkyWalking APM + Elasticsearch + Logstash + Kibana + Filebeat |
| 容器化 | Docker + Docker Compose |

---

## 2. 项目目录结构

```
LuminaMedia/
├── src/                           # NestJS 后端源代码
│   ├── app.module.ts              # 根模块，注册所有 TypeORM 实体和子模块
│   ├── main.ts                    # 应用入口，初始化 Swagger、CORS、全局代理
│   ├── modules/                   # 11 个业务模块（严格模块化隔离）
│   │   ├── auth/                  # 认证授权（JWT + RBAC + 多租户中间件）
│   │   ├── ai-engine/             # AI Agent 工作流引擎
│   │   ├── data-engine/           # 智能数据引擎（导入、字段映射、标签计算）
│   │   ├── data-analytics/        # 数据分析与营销策略
│   │   ├── customer-data/         # 客户档案与分群
│   │   ├── dashboard/             # 后端仪表盘接口
│   │   ├── publish/               # 矩阵分发与跨平台发布
│   │   ├── knowledge/             # 知识库与 RAG
│   │   ├── workflow/              # 三审三校工作流引擎
│   │   ├── monitor/               # 舆情监测与 GEO 分析
│   │   └── user/                  # 用户管理
│   ├── entities/                  # 全局 TypeORM 实体（用户、租户、角色等）
│   ├── shared/                    # 共享基础设施
│   │   ├── cloud/                 # CloudProvider 抽象层（alicloud/private/mock）
│   │   ├── repositories/          # 基础 Repository 封装
│   │   ├── services/              # 租户上下文、分表服务等
│   │   ├── enums/                 # 全局枚举
│   │   ├── interfaces/            # 全局接口
│   │   └── monitoring/            # APM、日志、自动扩缩容
│   ├── config/                    # 配置文件（如 data-source.ts）
│   ├── health/                    # 健康检查端点
│   └── types/                     # 全局类型定义
├── dashboard-web/                 # 前端项目（React + Vite）
│   ├── src/                       # 前端源代码
│   ├── tests/                     # Playwright E2E 测试
│   └── package.json               # 前端独立依赖
├── test/                          # 后端测试文件（**唯一合法的测试目录**）
│   ├── modules/                   # 单元测试，结构与 src/modules/ 一一对应
│   ├── shared/                    # shared 层测试
│   ├── integration/               # 集成测试
│   └── fixtures/                  # 测试夹具
├── scripts/                       # SQL 迁移脚本与工具脚本
├── docs/                          # 架构文档、开发规范、部署指南
├── tasks/                         # 四阶段重构任务清单（phase-1~4）
├── Audit_Report/                  # 质检报告
├── docker-compose.yml             # 本地开发完整编排
├── Dockerfile.backend             # 后端镜像构建
├── package.json                   # 后端依赖与脚本
├── tsconfig.json                  # TypeScript 配置（含路径别名）
├── eslint.config.mjs              # ESLint 主配置（使用 typescript-eslint）
├── .prettierrc                    # Prettier 配置
└── jest.setup.js                  # Jest 测试环境初始化
```

---

## 3. 构建与运行命令

### 3.1 环境准备

1. 复制环境变量模板：
   ```bash
   cp .env.example .env
   # 编辑 .env，填入数据库连接、GEMINI_API_KEY、DASHSCOPE_API_KEY 等
   ```

2. **必须使用 Docker 运行开发环境**，禁止本地直接 `npm run start:dev` 或 PM2 托管：
   ```bash
   docker-compose up -d
   ```

### 3.2 常用命令

| 命令 | 说明 |
|------|------|
| `docker-compose up -d` | 启动全部服务（MySQL、Redis、Qdrant、后端、前端、SkyWalking、ELK） |
| `docker-compose logs -f app` | 查看后端日志 |
| `docker-compose down` | 停止全部服务 |
| `docker-compose up -d --build` | 修改 .env / docker-compose.yml / Dockerfile 后重建 |
| `docker-compose build --no-cache app` | 强制无缓存重建后端镜像 |
| `npm run build` | 本地构建 NestJS 项目（生成 `dist/`） |
| `npm run lint` | 运行 ESLint 并自动修复 |
| `npm run format` | 运行 Prettier 格式化 `src/` 和 `test/` |

### 3.3 开发服务端口

- 后端 API: http://localhost:3003
- Swagger 文档: http://localhost:3003/api/docs
- 健康检查: http://localhost:3003/health
- 前端 Dashboard: http://localhost:5174
- SkyWalking UI: http://localhost:8080
- Kibana: http://localhost:5601
- Qdrant: http://localhost:6333

### 3.4 热重载规则

- **后端代码** (`src/`): `docker-compose.yml` 已配置卷映射和 `nodemon`，保存后自动重载。
- **前端代码** (`dashboard-web/`): 修改后需重新构建镜像：`docker-compose build --no-cache dashboard && docker-compose up -d`
- **配置/环境文件** (`.env`, `docker-compose.yml`, `Dockerfile`): 修改后必须执行 `docker-compose up -d --build`

---

## 4. 测试策略与规范

### 4.1 测试目录铁律

**所有测试文件必须放在 `test/` 目录下，严禁在 `src/` 或根目录创建 `.spec.ts` / `.test.ts` 文件。**

- `docs/testing-management.md` 对测试文件位置有强制性规定。
- 已有 25 个测试文件全部迁移至 `test/`，`src/` 中不得残留任何测试文件。

### 4.2 测试类型与命名

| 类型 | 命名规范 | 存放位置 |
|------|----------|----------|
| 单元测试 | `*.spec.ts` | `test/modules/<module>/...` 或 `test/shared/...` |
| 集成测试 | `*.integration.spec.ts` | `test/integration/` |
| E2E 测试 | `*.e2e-spec.ts` | `test/e2e/` 或 `test/modules/<module>/e2e/` |

### 4.3 测试命令

```bash
npm test                          # 运行全部单元测试
npm run test:cov                  # 生成覆盖率报告（输出到 coverage/）
npm run test:e2e                  # 运行 E2E 测试（使用 test/jest-e2e.json）
```

### 4.4 Jest 关键配置

配置位于 `package.json` 的 `jest` 字段：
- `rootDir`: `.`
- `roots`: `["src", "test"]`
- `testRegex`: `.*\.spec\.ts$`
- `moduleNameMapper`:
  - `^@src/(.*)$` -> `<rootDir>/src/$1`
  - `^@test/(.*)$` -> `<rootDir>/test/$1`

**测试文件中推荐使用路径别名导入源码：**
```typescript
import { AuthService } from '@src/modules/auth/services/auth.service';
```

---

## 5. 代码风格规范

### 5.1 格式化

- **Prettier** (`.prettierrc`):
  - `singleQuote: true`
  - `trailingComma: "all"`
- 运行 `npm run format` 后再提交代码。

### 5.2 静态检查

- **ESLint** 主配置为 `eslint.config.mjs`，使用 `typescript-eslint` + `prettier/recommended`。
- 已关闭的规则（项目中允许使用）：
  - `@typescript-eslint/no-explicit-any: off`
- 默认启用的严格规则（会报 warn）：`no-floating-promises`、`no-unsafe-argument`、`no-unsafe-assignment`、`no-unsafe-call`、`no-unsafe-member-access`、`no-unsafe-return`、`require-await` 等。
- 测试文件（`*.spec.ts`）中额外关闭：`@typescript-eslint/unbound-method: off`

### 5.3 TypeScript 配置要点

- `tsconfig.json` 中 `module` 和 `moduleResolution` 均为 `nodenext`。
- `target`: `ES2022`
- `strictNullChecks: true`，`noImplicitAny: false`
- 路径别名：`@src/*` 映射到 `src/*`，`@test/*` 映射到 `test/*`

### 5.4 编码约定

- 后端统一使用 NestJS 模块、控制器、服务三层结构。
- 实体类放在 `src/entities/` 或模块内部 `entities/` 子目录。
- DTO 使用 `class-validator` + `class-transformer` 做校验。
- 共享 Repository 继承 `BaseRepository`，自动注入租户过滤。
- 枚举统一放在 `src/shared/enums/`。

---

## 6. 架构与运行时要点

### 6.1 模块化单体架构

`src/app.module.ts` 是唯一的根模块，直接导入全部 11 个业务模块和共享模块。各模块内部保持严格边界：
- 禁止跨模块直接引用内部实现细节。
- 跨模块通信通过 NestJS 的 `exports/imports` 或 EventEmitter 进行。

### 6.2 多租户隔离

- 所有业务表均包含 `tenant_id` 字段。
- `TenantMiddleware` + `TenantFilterSubscriber` 自动为查询追加租户过滤条件。
- `TenantContextService` 提供当前请求租户 ID 的存取。
- 分表策略通过 `ShardingService` 和 `ShardingRepository` 实现（5 表 16 分区设计）。

### 6.3 CloudProvider 抽象层

`src/shared/cloud/` 定义了统一的 `CloudProvider` 接口，支持一键切换部署环境：
- `alicloud` — 阿里云 SaaS 环境（RDS、Redis、OSS、Gemini/百炼）
- `private` — 私有化部署（本地 MySQL、内网 Redis、MinIO、本地 Qwen-7B）
- `mock` — Demo 演示模式（Mock AI 服务、模拟存储）

通过环境变量 `CLOUD_PROVIDER` 控制，工厂类 `CloudProviderFactory` 负责实例化对应适配器。

### 6.4 AI 工作流

`src/modules/ai-engine/` 实现了三阶段 Agent 工作流：
1. **Analysis Agent** — 分析客户需求与市场数据
2. **Strategy Agent** — 生成营销策略方案
3. **Copywriting Agent** — 生成营销文案

工作流编排由 `AgentWorkflowService` 统一调度，支持 RAG 知识库检索（`KnowledgeRetrievalService`）。

### 6.5 数据库与迁移

- TypeORM `synchronize` 默认关闭（`TYPEORM_SYNCHRONIZE=false`），生产环境禁止自动同步。
- SQL 初始化脚本放在 `scripts/` 目录，通过 `docker-compose.yml` 的卷映射在 MySQL 容器首次启动时自动执行（按 `01-*.sql` ~ `11-*.sql` 顺序）。
- 实体字符集统一使用 `utf8mb4`。

---

## 7. 安全注意事项

### 7.1 认证与授权

- 使用 **JWT + Passport** 做身份认证，`JWT_SECRET` 必须在 `.env` 中配置强随机字符串。
- RBAC 权限模型：用户 → 角色 → 权限，通过 `@Roles()`、`@Permissions()` 装饰器 + Guard 控制接口访问。
- 密码使用 `bcrypt` 哈希存储。

### 7.2 数据安全

- **严禁**在代码中硬编码 API 密钥（Gemini、Dashscope、数据库密码等）。所有密钥通过环境变量注入。
- 代理配置（`HTTPS_PROXY`）仅用于开发环境访问外部 AI 服务，生产环境按需配置。
- 文件上传目录 `uploads/` 需做好访问控制和文件类型校验。

### 7.3 容器安全

- `Dockerfile.backend` 使用多阶段构建，最终镜像以非 root 用户 `node` 运行。
- 开发环境的 Elasticsearch、Kibana、SkyWalking 等均未启用身份验证，**仅限本地/内网使用**。

---

## 8. 前端项目（dashboard-web）

- 独立目录 `dashboard-web/`，拥有独立的 `package.json` 和依赖。
- 构建工具：Vite 5
- 状态管理：Zustand
- 路由：React Router DOM v7
- 图表：Recharts
- 移动端适配：Mobile-First 原则，微信端完美兼容（集成 `weixin-js-sdk`）
- E2E 测试：Playwright

前端构建：
```bash
cd dashboard-web
npm run build      # 输出到 dashboard-web/dist/
npm run test:e2e   # 运行 Playwright E2E 测试
```

---

## 9. 常用环境变量

参考 `.env.example` 和 `docker-compose.yml`：

| 变量 | 说明 |
|------|------|
| `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_DATABASE` | MySQL 连接信息 |
| `TYPEORM_SYNCHRONIZE` | 是否自动同步数据库结构（开发可 true，生产必须 false） |
| `APP_PORT` | 后端服务端口，默认 3003 |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | JWT 签名密钥与过期时间 |
| `GEMINI_API_KEY` | Google Gemini API 密钥，支持多 Key 逗号分隔轮询 |
| `GEMINI_MODEL` | 默认 `gemini-2.5-flash` |
| `GEMINI_KEY_ROTATION` | 轮询模式：`sequential` 或 `random` |
| `DASHSCOPE_API_KEY` | 阿里云百炼 API 密钥 |
| `QWEN_MODEL` | 默认 `qwen-max` |
| `CLOUD_PROVIDER` | 云提供商：`alicloud` / `private` / `mock` |
| `DEPLOYMENT_MODE` | 部署模式：`saas` / `demo` |
| `QDRANT_HOST` / `QDRANT_PORT` / `QDRANT_API_KEY` | 向量数据库连接 |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | Redis 连接 |
| `APM_ENABLED` / `APM_OAP_SERVER` | SkyWalking APM 开关与地址 |

---

## 10. 任务与进度文档

项目采用分阶段任务清单管理：
- `PROGRESS.md` — 项目总体进度与里程碑状态（**只更新状态概览和重大问题**）
- `tasks/phase-1-foundation.md` — 第一阶段（基础架构）任务清单
- `tasks/phase-2-core-features.md` — 第二阶段（核心功能）任务清单
- `tasks/phase-3-advanced-features.md` — 第三阶段（高级功能）任务清单
- `tasks/phase-4-demo-development.md` — 第四阶段（DEMO 开发）任务清单

**工作规范**：
- 每完成一个具体任务，必须在对应的 `tasks/phase-*.md` 中标注 `✅ 已完成` 及时间戳。
- 严禁跨步执行多个任务；完成一个 Step 后，第一动作是更新进度文档，第二动作是终止会话。

---

## 11. 关键参考文档

- `README.md` — 项目全貌、快速启动、架构图
- `CLAUDE.md` — 面向 Claude Code 的执行规范与注意事项
- `PROGRESS.md` — 重构进度总览
- `docs/testing-management.md` — 测试文件管理强制规范
- `docs/architecture/modular-monolith.md` — 模块化单体架构设计
- `docs/deployment/cloud-provider.md` — CloudProvider 部署指南
- `API_REFERENCE.md` — 后端 API 接口参考
- `Audit_Report/` — 四阶段质检报告

---

**文档版本**: 1.0  
**更新日期**: 2026-04-01
