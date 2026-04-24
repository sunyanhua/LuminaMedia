# 网页抓取功能实现设计

**状态：** 已批准
**日期：** 2026-04-24

---

## 概述

为知识库模块实现真实的网页抓取功能，替换现有的模拟数据返回逻辑。

## 架构

```
用户输入URL → HTTP请求 → Cheerio解析 → 内容提取 → 文档创建
                                    ↓
                           失败时 → 保存为"待处理"状态
```

## 技术方案

### 级别选择
- **基础提取** - 使用Cheerio解析HTML，提取标题、主要内容、关键词

### 失败处理策略
- **降级保存** - 抓取失败时仍保存文档，状态标记为 `pending`

## 依赖项

项目已有，无需额外安装：
- `axios` - HTTP请求
- `cheerio` - HTML解析
- `html-to-text` - HTML转纯文本

## 修改文件

- `src/modules/knowledge/services/knowledge-document.service.ts`

## 实现详情

### 抓取流程

1. **URL验证** - 检查URL格式有效性
2. **HTTP请求** - 使用axios，带User-Agent头和超时设置
3. **HTML解析** - 使用cheerio加载HTML
4. **内容提取**：
   - 标题：`<title>` 标签或 `og:title` meta标签
   - 内容：`<article>`、`<main>` 或最大文本段落
   - 关键词：从meta keywords或内容提取
5. **文档创建** - 创建KnowledgeDocument实体
6. **降级处理** - 失败时保存为pending状态，保留URL和错误信息

### 元数据提取

| 字段 | 来源 |
|------|------|
| title | `<title>` 或 `og:title` |
| content | `<article>`/`<main>` 的纯文本 |
| author | meta author 或 byline |
| publishDate | meta publishDate 或 og:published_time |
| keywords | meta keywords |

### 错误处理

- 网络错误：保存URL，状态=pending，错误信息存储在 processingError
- 解析错误：同上
- 超时：30秒超时限制

## 数据模型

现有 `KnowledgeDocument` 实体已包含所需字段：
- `status` - 用于标记待处理
- `processingStatus` - 处理状态
- `processingError` - 错误信息
- `metadata` - 包含 author、publishDate 等

## 测试策略

1. 使用curl测试不同类型URL（政府网站、新闻网站，普通网页）
2. 验证内容正确提取
3. 验证降级保存机制
