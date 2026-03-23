# CLAUDE.md

本文件为 Claude Code 提供在此代码库中工作的指导。

## 项目概述

LuminaMedia (智媒) 是一个 AI 驱动的内容营销平台 DEMO 项目。该平台帮助企业导入客户数据，使用 AI 分析生成用户画像和洞察，并创建带有生成内容的营销策略。

### 项目结构
```
LuminaMedia/
├── src/                      # NestJS 后端
├── dashboard-web/           # React 前端（数据可视化）
├── docs/                    # 文档
├── scripts/                 # 工具脚本
└── CLAUDE.md               # 本文件
```

### 核心技术
- **后端**: NestJS (Node.js), TypeScript, TypeORM
- **前端**: React, TypeScript, ECharts, Ant Design
- **数据库**: MySQL
- **AI 服务**: Gemini API (Google)
- **容器化**: Docker, Docker Compose

---

## 🤖 协作工作流

- **核心模式**：本项目采用“人工规划 + 自动化执行”的双轨制。

- **Plan Mode 规范**：
  1. 当老孙在 VS Code 终端使用**plan mode**探讨计划时，最终目标是更新 `PROGRESS.md`。
  2. **禁止自动执行代码修改**：计划确认后，CC 必须将步骤详细写入 `PROGRESS.md`，并按照格式修改“项目概览”与“更新记录”内容。
  3. **主动结案**：文档更新完成后，CC 应提示：“计划已归档至 PROGRESS.md，老孙请按 Ctrl+C 退出并指派管家进场。” 

- **Butler 执行规范**：
  1. 真正的代码修改由 `project_butler.py` 调用非交互式 CC 完成。
  2. 每次被管家唤起时，CC 必须优先读取 `PROGRESS.md` 里的当前计划。


## 开发规则

### ⚠️ 重要：进度文档

**完成任何任务后，必须更新 PROGRESS.md：**

1. 添加新章节或更新现有章节，包含：
   - 任务描述
   - 完成状态（✅ 完成 / 🔄 进行中）
   - 完成时间戳
   - 关键变更或发现

2. 更新 PROGRESS.md 顶部的“最新进展”部分，只保留最近的5条即可

3. **自动归档**: 每当一个大项（包含多个子任务）全部标记为完成后，必须执行： PROGRESS.md 中仅保留该大项的“更新记录”即可，并更新“项目状态概览”，将其他本次所有已完成的内容记录移动至 HISTORY.md

### 代码质量标准
- 使用 TypeScript 严格模式
- 遵循 NestJS 模块规范
- 为公共 API 添加 JSDoc 注释
- 提交前运行 lint：`npm run lint`

### Git 提交消息
遵循约定式提交：
- `feat:` 新功能
- `fix:` 错误修复
- `docs:` 文档变更
- `refactor:` 代码重构
- `test:` 测试相关变更

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

### 📝 环境变量管理
- 所有环境变量在 `.env` 文件中配置，通过 `docker-compose.yml` 注入容器
- 修改环境变量后，需要重启相关容器：`docker-compose up -d --build [服务名]`

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

**最新完成任务 (2026-03-22):**
- ✅ 一键演示串联测试前后端联调
- ✅ 数据可视化完善增加图表类型
- ✅ 一键重置功能 /demo/reset 接口
- ✅ Docker 部署配置 docker-compose 更新
- ✅ DEMO 文档编写

**当前重点:** DEMO 功能完善与部署

---

## 注意事项

- 完成任务后务必更新 PROGRESS.md
- 使用 Docker 保持开发环境一致性
- 提交前使用 Swagger UI 测试 API 变更