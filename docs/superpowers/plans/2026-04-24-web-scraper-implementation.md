# 网页抓取功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 替换知识库的模拟网页抓取为真实抓取实现

**Architecture:** 使用 axios 获取HTML，cheerio 解析DOM，html-to-text 转换纯文本。抓取失败时保存为 pending 状态。

**Tech Stack:** axios, cheerio, html-to-text (项目已有)

---

### Task 1: 添加依赖库导入

**Files:**
- Modify: `src/modules/knowledge/services/knowledge-document.service.ts:1-31`

- [ ] **Step 1: 添加新的 import 语句**

在现有 import 后添加：

```typescript
import axios from 'axios';
import * as cheerio from 'cheerio';
import { htmlToText } from 'html-to-text';
```

**现有导入（第1-30行）：**
```typescript
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, In } from 'typeorm';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
```

**修改为：**
```typescript
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, In } from 'typeorm';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { htmlToText } from 'html-to-text';
```

- [ ] **Step 2: 提交**

```bash
git add src/modules/knowledge/services/knowledge-document.service.ts
git commit -m "feat(knowledge): add axios cheerio html-to-text imports for web scraping"
```

---

### Task 2: 实现真实网页抓取

**Files:**
- Modify: `src/modules/knowledge/services/knowledge-document.service.ts:913-968`

- [ ] **Step 1: 替换 mock 实现为真实抓取**

**现有 mock 实现（第913-968行）：**
```typescript
private async crawlUrlContent(url: string): Promise<UrlCrawlResult> {
  try {
    this.logger.log(`开始抓取网页内容: ${url}`);

    // 在实际应用中，这里应该使用专业的网页抓取库（如puppeteer、cheerio等）
    // DEMO版本中，我们模拟抓取过程，返回结构化数据

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 模拟不同URL返回不同的内容
    let title = `网页标题: ${url}`;
    let content = `这是从 ${url} 抓取的网页内容示例。...`;
    // ... 大量 mock 逻辑
```

**替换为真实实现：**
```typescript
private async crawlUrlContent(url: string): Promise<UrlCrawlResult> {
  try {
    this.logger.log(`开始抓取网页内容: ${url}`);

    // 验证URL格式
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error('无效的URL格式');
    }

    // 发送HTTP请求
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
    });

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = response.data as string;
    const $ = cheerio.load(html);

    // 提取标题
    let title = $('title').text().trim() ||
                $('meta[property="og:title"]').attr('content') ||
                $('meta[name="title"]').attr('content') ||
                `网页标题: ${url}`;

    // 提取主要内容
    let content = '';
    const articleElement = $('article').first();
    const mainElement = $('main').first();
    const contentElement = articleElement.length > 0 ? articleElement : mainElement;

    if (contentElement.length > 0) {
      content = htmlToText(contentElement.html() || '', {
        wordwrap: false,
        selectors: [
          { selector: 'a', options: { ignoreImage: true, ignoreHref: true } },
          { selector: 'img', format: 'skip' },
          { selector: 'script', format: 'skip' },
          { selector: 'style', format: 'skip' },
        ],
      });
    } else {
      // 回退：查找最大的文本段落
      content = htmlToText(html, {
        wordwrap: false,
        selectors: [
          { selector: 'a', options: { ignoreImage: true, ignoreHref: true } },
          { selector: 'img', format: 'skip' },
          { selector: 'script', format: 'skip' },
          { selector: 'style', format: 'skip' },
          { selector: 'nav', format: 'skip' },
          { selector: 'header', format: 'skip' },
          { selector: 'footer', format: 'skip' },
          { selector: 'aside', format: 'skip' },
        ],
      });
    }

    // 提取作者
    const author = $('meta[name="author"]').attr('content') ||
                   $('meta[property="article:author"]').attr('content') ||
                   $('[rel="author"]').text().trim() ||
                   undefined;

    // 提取发布日期
    const publishDateStr = $('meta[property="article:published_time"]').attr('content') ||
                          $('meta[name="publishdate"]').attr('content') ||
                          $('meta[name="date"]').attr('content') ||
                          undefined;
    const publishDate = publishDateStr ? new Date(publishDateStr) : undefined;

    // 提取关键词
    const keywordsStr = $('meta[name="keywords"]').attr('content');
    const keywords = keywordsStr
      ? keywordsStr.split(',').map(k => k.trim()).filter(Boolean)
      : undefined;

    const wordCount = this.countWords(content);
    const readingTime = Math.ceil(wordCount / 200);

    this.logger.log(`网页抓取成功: ${url}, 字数: ${wordCount}`);

    return {
      url,
      title,
      content: content.trim(),
      metadata: {
        author,
        publishDate,
        wordCount,
        readingTime,
        keywords,
      },
    };
  } catch (error) {
    this.logger.error(`抓取网页内容失败: ${error.message}`, error.stack);
    // 降级保存：返回基本信息，不影响文档创建
    return {
      url,
      title: `抓取自: ${url}`,
      content: '',
      metadata: {
        wordCount: 0,
        readingTime: 0,
        keywords: [],
      },
    };
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/modules/knowledge/services/knowledge-document.service.ts
git commit -m "feat(knowledge): implement real web scraping with cheerio"
```

---

### Task 3: 测试验证

**Files:**
- 测试文件: 无（使用 curl 手动测试）

- [ ] **Step 1: 使用 curl 测试 API**

测试抓取政府网站：
```bash
curl -X POST http://localhost:3003/api/v1/knowledge/documents/import/url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.gov.cn/"}' \
  | jq '.title, .metadata.wordCount'
```

测试抓取普通网页：
```bash
curl -X POST http://localhost:3003/api/v1/knowledge/documents/import/url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/"}' \
  | jq '.title, .content[:100]'
```

测试列表接口确认数据保存：
```bash
curl http://localhost:3003/api/v1/knowledge/documents?offset=0&limit=5 \
  | jq '.documents[0].title, .documents[0].metadata'
```

- [ ] **Step 2: 提交**

```bash
git add -A && git commit -m "test(knowledge): verify web scraping works"
```
