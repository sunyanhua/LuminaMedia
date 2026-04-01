# CLAUDE.md

本文件为 Claude Code 提供在此代码库中工作的指导。

## 项目概述

LuminaMedia 2.0 (灵曜智媒) 是一个基于AI驱动的企业级内容营销平台，采用模块化单体架构，为企事业单位提供完整的宣传营销解决方案。平台分为商务版和政务版，支持SaaS多租户模式和私有化部署。

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
├── tasks/                # 2.0实施任务清单（分阶段详细规划）
├── scripts/              # 数据库脚本和工具
├── docs/                 # 项目文档
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

### 2.0重构执行机制
1. **管家派送任务流程**：
   - 管家根据 `PROGRESS.md` 中的2.0重构工作计划，按阶段顺序调用CC执行具体任务
   - CC收到任务后，需首先读取对应阶段的任务清单文件（`tasks/phase-*.md`），明确具体任务要求
   - 执行任务前，需确认任务在任务清单文件中的准确位置和描述

2. **任务执行和状态更新**：
   - 每完成一个任务，必须在对应的任务清单文件中标注“✅ 已完成”状态及完成时间戳
   - 任务状态更新格式：`- ✅ **2026-03-26**: 任务描述（实际完成时间）`
   - 大阶段（里程碑）完成后，需在 `PROGRESS.md` 中标注“✅ 已完成”状态及完成时间

3. **进度文档更新规范**：
   - `PROGRESS.md` 的更新仅限于以下情况：
     1. **状态概览更新**：项目状态、当前阶段、最新进展
     2. **各阶段完成状态更新**：阶段完成后标记完成状态
     3. **执行过程中出现的重大问题或调整**：需要记录的重大变更
   - **禁止**在 `PROGRESS.md` 中记录日常任务完成细节，这些细节应保留在任务清单文件中

4. **任务清单文件维护**：
   - 每个阶段的任务清单文件（`tasks/phase-*.md`）是任务执行的唯一依据
   - 任务清单中的任务分解必须足够详细，确保管家安排实施时无误解
   - 任务完成后及时更新状态，保持清单与实际进度同步

- **单步执行原则**：在非交互式自动化（Butler）模式下，CC 必须严格遵守“一个进程只处理一个 Step”的规矩。
- **强制退出机制**：完成指定 Step 后的第一动作是更新进度文档，第二动作是立即终止会话，严禁跨步执行。


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
参考 `.env.example` 获取必需变量：
- `DATABASE_URL` - MySQL 连接
- `GEMINI_API_KEY` - Google Gemini API 密钥
- `PORT` - 服务器端口（默认: 3003）

---

## 当前项目状态

**项目阶段**: LuminaMedia 2.0 重构计划基础版本完成 ✅
**当前版本**: v17.0 (2026-04-01)
**重构状态**: 2.0四阶段重构计划全部完成

**最新完成任务 (2026-04-01):**
- ✅ 2026-04-01: 第4轮全量质检完成，安全漏洞清零，综合评分98分
- ✅ 2026-04-01: 出具《Audit_20260401_全量质检第4轮.md》最终审计报告
- ✅ 2026-03-31: 第四阶段DEMO整体验收自检完成，商务版和政务版验证通过
- ✅ 2026-03-30: 第三阶段正式验收通过，测试100%通过，无安全漏洞

**核心成就**:
- ✅ 架构升级成功（22个模块化单体）
- ✅ 四大核心功能完整实现（SmartDataEngine、AI Agent、矩阵分发、客户大脑）
- ✅ 质量基线建立（测试通过率100%，安全漏洞清零）
- ✅ 文档体系完善（任务清单、质检报告、进度文档齐全）
- ✅ 运行环境稳定（Docker容器稳定运行29小时+）

**当前重点**: 
1. 修复Qdrant认证配置问题（中优先级，知识库功能）
2. 配置Prometheus指标收集器（生产环境部署前）
3. 修复Swagger循环依赖问题（低优先级，开发体验）
4. 完善生产环境配置和监控

**重要文档**:
- [PROGRESS.md](../PROGRESS.md) - 2.0重构实施进度计划（已更新完成状态）
- [tasks/](../tasks/) - 四阶段详细任务清单（全部完成）
- [README.md](../README.md) - 项目全量文档（已更新版本状态）
- [Audit_Report/](../Audit_Report/) - 四阶段质检报告（4份最终报告）

---

## 注意事项

- 完成任务后务必更新 PROGRESS.md
- 使用 Docker 保持开发环境一致性
- 提交前使用 Swagger UI 测试 API 变更