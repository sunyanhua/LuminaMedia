# CLAUDE.md

本文件为 Claude Code 提供在此代码库中工作的指导。

> **⚠️ 必读**: 在执行任何文档相关或测试文件相关任务前，请先阅读以下管理制度文档：
> - [文档管理制度](./docs/Document_Management_Policy.md) - 规范文档存储、版本和归档
> - [测试文件管理制度](./docs/Test_File_Management_Policy.md) - 规范测试文件存放位置和管理

## 项目开发任务执行机制
1. **管家派送任务流程**：
   - 管家根据 `PROGRESS.md` 中的工作计划，按阶段顺序调用CC执行具体任务
   - CC收到任务后，需首先读取对应阶段的任务清单文件（`docs/tasks/{版本号}/phase-*.md`），明确具体任务要求
   - 执行任务前，需确认任务在任务清单文件中的准确位置和描述

2. **任务执行和状态更新**：
   - 每完成一个任务，必须在对应的任务清单文件中标注“✅ 已完成”状态及完成时间戳
   - 任务状态更新格式：`- ✅ **2026-03-26**: 任务描述（实际完成时间）`
   - 大阶段完成后，需在 `PROGRESS.md` 中标注“✅ 已完成”状态及完成时间

3. **进度文档更新规范**：
   - `PROGRESS.md` 的更新仅限于以下情况：
     1. **状态概览更新**：项目状态、当前阶段、最新进展
     2. **各阶段完成状态更新**：阶段完成后标记完成状态
     3. **执行过程中出现的重大问题或调整**：需要记录的重大变更
   - **禁止**在 `PROGRESS.md` 中记录日常任务完成细节，这些细节应保留在任务清单文件中

4. **任务清单文件维护**：
   - 每个阶段的任务清单文件（`docs/tasks/{版本号}/phase-*.md`）是任务执行的唯一依据
   - 任务清单中的任务分解必须足够详细，确保管家安排实施时无误解
   - 任务完成后及时更新状态，保持清单与实际进度同步

- **单步执行原则**：在非交互式自动化（Butler）模式下，一个进程 = 一个原子任务。禁止在未重新启动进程的情况下自行处理后续任务，即便后续任务已在 TASK_REPORT.json 中标记为 WAITING。
- **强制退出机制**：完成指定 Step 后的第一动作是更新进度文档，第二动作是立即终止会话，严禁跨步执行。


## 项目概述

LuminaMedia (灵曜智媒) 是一个基于AI驱动的企业级内容营销平台，采用模块化单体架构，为企事业单位提供完整的宣传营销解决方案。平台分为商务版和政务版，支持SaaS多租户模式和私有化部署。

### 项目结构
```
LuminaMedia/
├── src/                    # NestJS后端源代码（模块化单体架构）
│   ├── modules/           # 功能模块目录
│   │   ├── auth/         # 认证授权模块
│   │   ├── data-engine/  # 智能数据引擎模块
│   │   ├── ai-engine/    # AI工作流引擎模块
│   │   ├── publish/      # 发布模块
│   │   └── knowledge/    # 知识库模块
│   ├── entities/         # 数据库实体
│   ├── shared/           # 共享代码（CloudProvider、Repository等）
│   └── config/           # 配置管理
├── dashboard-web/         # 前端Dashboard (React + Mobile-First)
├── scripts/              # 数据库脚本和工具
├── docs/                 # 项目文档
│   ├── tasks/           # 实施任务清单（按版本分目录）
│   │   ├── 3.1-demo/   # 3.1 DEMO版任务清单（当前）
│   │   ├── 3.0-demo/   # 3.0 DEMO版任务清单（已归档）
│   │   └── archive/    # 历史版本归档
│   ├── README.md       # 文档索引
│   └── ...
├── docker-compose.yml    # Docker编排配置
├── Dockerfile.backend    # 后端Dockerfile
└── CLAUDE.md            # 本文件
```

### 核心技术（2.0版本）
- **架构模式**: 模块化单体（Modular Monolith），严格模块隔离
- **后端框架**: NestJS + TypeScript + TypeORM
- **前端框架**: React + Vite + TypeScript + Ant Design Mobile（Mobile-First）
- **数据库**: MySQL 8.0 + 多租户tenant_id隔离 + 分表策略
- **AI技术栈**:
  - AI Agent工作流（分析→策划→文案三阶段）
  - RAG知识库 + 向量数据库
  - 云端AI: Google Gemini 2.5 + 阿里云百炼(Qwen)
  - 本地AI: Docker一键拉起Qwen-7B本地模型
- **云服务抽象**: CloudProvider接口，支持一键切换阿里云SaaS ↔ 私有化部署
- **容器化**: Docker + Docker Compose + Kubernetes生产部署
- **监控运维**: Prometheus + Grafana + ELK日志聚合

---

## 开发环境

### 🐳 Docker 环境管理
- **所有运行环境都统一在 Docker 容器中**，禁止使用 PM2 托管或 `npm run dev`/`npm run start:dev` 等本地启动方式
- **启动服务**: `docker-compose up -d`
- **查看日志**: `docker-compose logs -f`
- **停止服务**: `docker-compose down`

### 🔧 代码修改与容器更新规则
1. **环境配置文件修改** (.env, docker-compose.yml, Dockerfile):
   - 修改后执行 `docker-compose up -d --build` 重启并重建容器
   - 或分别执行 `docker-compose build --no-cache [服务名]` 和 `docker-compose up -d`

2. **后端源代码修改** (src/目录下的文件):
   - 检查 Docker 配置是否支持热重载（查看 docker-compose.yml 中是否有源代码卷映射和开发启动命令）
   - **支持热重载**: 修改代码后开发服务器自动检测并重新编译，无需手动重启容器
   - **不支持热重载**: 执行 `docker-compose build --no-cache app` 重新构建后端镜像，然后 `docker-compose up -d` 重启容器

3. **前端源代码修改** (dashboard-web/目录下的文件):
   - 执行 `docker-compose build --no-cache dashboard` 重新构建前端镜像
   - 然后执行 `docker-compose up -d` 重启容器

### API 文档
- Swagger UI: http://localhost:3003/api/docs
- 健康检查: http://localhost:3003/health

---

## 配置

### 环境变量

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

## 当前项目状态

**项目阶段**: LuminaMedia 3.1 DEMO细节推进版 规划准备 ⏳  
**当前版本**: v19.0 (2026-04-05)  
**上一版本**: v18.1 (3.0 DEMO版 已归档)  
**项目状态**: 3.1方案已确认，六阶段任务清单已制定，等待管家派发执行

**最新进展**:
- ✅ 2026-04-05: 3.1 DEMO版实施规划方案确认完成，六阶段详细任务清单制定完成
- ✅ 2026-04-05: 3.0 DEMO版实施历程归档完成，详细记录保存至 [docs/archive/PROGRESS_3.0_Archive.md](./docs/archive/PROGRESS_3.0_Archive.md)
- ✅ 2026-04-04: 3.0 DEMO版第四轮全量质检修复完成，综合评分97分

**3.1版本核心特性**:
- ⏳ 租户-用户两层架构 - 一个租户下多个用户，不同审核权限
- ⏳ 智慧档案 - 知识库管理 + 单位画像生成
- ⏳ 参考信息 - 每日自动抓取政策资讯，支持一键采用
- ⏳ 公众号管理 - 微信公众号绑定、内容发布四步流程、一键发布
- ⏳ 三审三校 - 完整审核流程，支持用户切换体验
- ⏳ 舆情监测 - 实时舆情数据监测和分析
- ⏳ 一键报告 - 智能报告 + 自定义报告（支持Word导出和PPT大纲）

**重要文档**:
- [PROGRESS.md](../PROGRESS.md) - 项目总体进度文档
- [docs/tasks/](./docs/tasks/) - 任务清单目录（按版本组织）
  - [docs/tasks/3.1-demo/](./docs/tasks/3.1-demo/) - 3.1 DEMO版六阶段任务清单
  - [docs/tasks/3.0-demo/](./docs/tasks/3.0-demo/) - 3.0 DEMO版六阶段任务清单（已归档）
- [docs/archive/3.1_Demo_Implementation_Plan.md](./docs/archive/3.1_Demo_Implementation_Plan.md) - 3.1详细实施规划

---

## 测试文件管理规范

### 核心原则（强制）
**所有测试文件必须统一存放在 `test/` 目录下，严禁在 `src/` 或根目录创建测试文件。**

### 详细规范
完整测试文件管理制度参见：
- 📄 [Test_File_Management_Policy.md](./docs/Test_File_Management_Policy.md) - 测试文件存放位置、命名规范、归档流程

### 关键要点速查
| 测试类型 | 命名规范 | 存放位置 | 临时文件期限 |
|----------|----------|----------|--------------|
| 单元测试 | `*.spec.ts` | `test/modules/` | - |
| 集成测试 | `*.integration.spec.ts` | `test/integration/` | - |
| E2E测试 | `*.e2e-spec.ts` | `test/e2e/` | - |
| 临时文件 | `temp-*.ts` | `test/temp/` | **7天** |

### 检查命令
```bash
# 检查src目录是否有测试文件（结果应为0）
find src -name "*.spec.ts" -o -name "*.test.ts" 2>/dev/null | wc -l

# 检查临时文件是否超期
find test/temp -name "temp-*.ts" -mtime +7
```

---

## Dashboard Web 前端开发规范

### 站点地图 (Sitemap)

**完整的前端页面结构定义参见**: [dashboard-web/SITEMAP.md](./dashboard-web/SITEMAP.md)

该文档是前端开发的权威参考，定义了：
- 政务版 (`/government/*`) 的完整菜单结构
- 所有页面的路由路径、组件文件位置
- 菜单配置和路由配置的规范

### 开发原则

1. **新增页面前**: 先查阅 SITEMAP.md，确认路径命名符合规范
2. **菜单修改**: 必须同步更新 `src/config/menu.config.ts` 和 SITEMAP.md
3. **路由修改**: 必须同步更新 `src/routes/index.tsx` 和 SITEMAP.md
4. **版本控制**: SITEMAP.md 中的"变更记录"必须及时更新

---

## 注意事项

- 使用 Docker 保持开发环境一致性
- 提交前使用 Swagger UI 测试 API 变更
- 严格遵守测试文件管理规范，保持项目整洁