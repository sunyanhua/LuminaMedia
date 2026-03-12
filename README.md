# LuminaMedia (灵曜智媒) - 项目设计说明书 (v1.0)

## 1. 项目愿景
**LuminaMedia (灵曜智媒)** 是一款基于 AI 驱动的自动化内容矩阵管理系统。通过集成大语言模型（Claude/Gemini）生成高质量文案，并利用浏览器自动化工具（OpenClaw/Playwright）实现多平台（小红书、微信公众号等）的自动分发。该系统支持多租户模式，旨在帮助用户高效管理多个社交媒体账号。

## 2. 核心技术栈
- **后端框架**: Node.js (NestJS) + TypeScript
- **数据库**: MySQL 8.0 (部署于阿里云 RDS)
- **自动化引擎**: OpenClaw (基于 Playwright)
- **AI 能力**: 
    - 文案: Claude 3.5 Sonnet / Gemini 1.5 Pro API
    - 配图: DALL-E 3 / Midjourney API
- **对象存储**: 阿里云 OSS (用于持久化存储 AI 生成的图片)
- **任务调度**: BullMQ 或内置 Cron 模块

## 3. 多租户数据库模型 (TypeORM Entities)

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

## 4. 核心功能模块设计

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

## 5. 开发阶段路线图

### 第一阶段 (Phase 1): 基础框架与多租户数据库
- [ ] 初始化 NestJS 项目，集成 TypeORM。
- [ ] 在阿里云 RDS 上建立数据库表结构。
- [ ] 实现用户登录与社交账号 Cookie 的基本 CRUD。

### 第二阶段 (Phase 2): AI 内容生成链
- [ ] 集成 Claude/Gemini API。
- [ ] 实现文案生成并自动上传图片到阿里云 OSS。
- [ ] 存储生成的 Draft 到数据库。

### 第三阶段 (Phase 3): 自动化发布集成
- [ ] 编写 OpenClaw 脚本，通过 Cookie 登录小红书后台。
- [ ] 实现自动化发布逻辑：上传 OSS 图片 -> 粘贴文案 -> 发布。
- [ ] 任务状态反馈与记录。

### 第四阶段 (Phase 4): UI 管理后台 (可选)
- [ ] 提供用户 Dashboard，可视化管理账号状态与发布任务。

---

## 6. 给 Claude Code 的初始指令

请按照以下顺序执行任务：
1. **初始化项目**: 使用 NestJS 创建新项目，安装 `typeorm`, `mysql2`, `class-validator` 等依赖。
2. **Entity 开发**: 根据上述第 3 节设计，编写所有的 Entity 文件。
3. **数据库配置**: 配置 `data-source.ts` 连接阿里云 RDS（使用环境变量存储敏感信息）。
4. **生成 SQL**: 提供一份 `init.sql` 用于初始化生产环境数据库。