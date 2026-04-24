# 网页深层抓取功能设计

**状态：** 已批准
**日期：** 2026-04-25

---

## 概述

在现有单页抓取基础上，新增整站抓取和专题抓取两种模式。用户选择模式后，系统自动分析页面结构，发现可抓取链接，异步执行抓取任务。

## 抓取模式

| 模式 | 说明 | 范围 |
|------|------|------|
| 单页抓取 | 抓取单个URL | 当前URL（现有功能） |
| 专题抓取 | 抓取同路径模式的所有页面 | 如 `/news/2024/` 下所有页面 |
| 整站抓取 | 抓取同一域名下的所有页面 | 整个网站 |

### 专题抓取路径匹配规则

- 提取输入URL的路径前缀（如 `/news/2024/`）
- 抓取所有路径以此前缀开头的页面
- 仅限同一域名

## 架构流程

```
用户输入URL → 模式选择
     ↓
分析页面结构 → 提取所有内链
     ↓
按模式过滤URL（域名/路径匹配）
     ↓
去重 → 入队 → 返回任务ID
     ↓
异步抓取（每抓一个更新状态）
     ↓
完成 → 通知用户
```

## 数据模型

### CrawlTask（抓取任务）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| tenantId | string | 租户ID |
| sourceUrl | string | 入口URL |
| mode | enum | crawl_mode: SINGLE/PROJECT/SITE |
| status | enum | PENDING/RUNNING/COMPLETED/CANCELLED/FAILED |
| totalUrls | int | 待抓取总数 |
| crawledCount | int | 已抓取数 |
| failedCount | int | 失败数 |
| startedAt | datetime | 开始时间 |
| completedAt | datetime | 完成时间 |
| createdAt | datetime | 创建时间 |

### CrawlQueue（待抓取队列）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| taskId | UUID | 关联任务ID |
| url | string | 待抓取URL |
| status | enum | PENDING/PROCESSING/COMPLETED/FAILED |
| priority | int | 优先级（路径深度越浅优先级越高） |
| error | string | 错误信息 |
| createdAt | datetime | 创建时间 |

## 链接过滤规则

1. **同域名限制** - 只抓取与入口URL相同域名的链接
2. **路径模式匹配**（专题抓取）- 必须以指定路径前缀开头
3. **去重** - 使用URL的hash进行去重，已抓取或队列中的URL不再入队
4. **静态资源过滤** - 跳过图片、视频、音频等资源URL（仅保留HTML页面）
5. **参数规范化** - 移除URL中的查询参数（如 `?page=1`）避免重复

## 新增API

### 启动抓取任务

```
POST /api/v1/crawl/start
Body: { url: string, mode: "SINGLE" | "PROJECT" | "SITE", category?: string }
Response: { taskId: string, totalUrls: number }
```

### 获取任务状态

```
GET /api/v1/crawl/:taskId/status
Response: {
  status: string,
  totalUrls: number,
  crawledCount: number,
  failedCount: number,
  startedAt: string,
  completedAt: string | null
}
```

### 取消任务

```
DELETE /api/v1/crawl/:taskId
Response: { success: boolean }
```

### 获取任务列表

```
GET /api/v1/crawl/tasks?offset=0&limit=20
Response: { tasks: CrawlTask[], total: number }
```

## 前端UI

### 模式选择

在现有"网页采集"卡片中新增**模式选择**：

```
┌─────────────────────────────────────────┐
│  网页URL   [________________________]   │
│                                         │
│  采集模式  ○ 单页  ● 专题  ○ 整站      │
│                                         │
│  （专题/整站模式无上限抓取）            │
│                                         │
│  [分类  ▼]        [开始采集]           │
└─────────────────────────────────────────┘
```

### 任务进度

任务启动后显示进度条：

```
正在抓取... ████████░░░░░░░░ 45%
已抓取: 45 | 失败: 2 | 队列: 53
```

### 任务列表

可在知识库页面查看所有抓取任务及其状态。

## 异步处理

1. 启动任务后立即返回，异步执行抓取
2. 前端通过轮询 `/crawl/:taskId/status` 获取进度（每5秒）
3. 抓取完成后刷新文档列表

## 错误处理

1. **网络错误** - 重试3次，失败后标记为FAILED
2. **超时** - 单个URL 30秒超时
3. **反爬虫** - 识别robots.txt，遵守User-Agent限制
4. **部分失败** - 单个URL失败不影响其他URL，统计失败数

## 技术实现

### 依赖

- 现有 `axios`, `cheerio` 保持不变
- 无需新增依赖

### 关键函数

```typescript
// 链接提取
extractLinks(html: string, baseUrl: string): string[]

// 路径匹配
matchesPathPattern(url: string, basePath: string): boolean

// URL去重
normalizeUrl(url: string): string
```

## 测试策略

1. 使用curl测试不同模式
2. 测试路径匹配过滤
3. 测试去重逻辑
4. 验证数据库记录正确

## 实施顺序

1. 创建数据模型（CrawlTask, CrawlQueue实体）
2. 实现链接提取和过滤逻辑
3. 实现任务队列和异步处理
4. 新增API端点
5. 前端UI集成
