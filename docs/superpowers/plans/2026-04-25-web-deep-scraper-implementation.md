# 网页深层抓取功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现整站抓取和专题抓取功能，用户输入URL后系统自动发现并抓取同站点相关页面

**Architecture:** 使用简单队列模式 - 创建CrawlTask管理任务状态，CrawlQueue存储待抓取URL，异步处理抓取流程。前端轮询任务状态。

**Tech Stack:** axios, cheerio (项目已有), TypeORM

---

## 文件结构

```
src/
├── entities/
│   ├── crawl-task.entity.ts        # 新增：抓取任务实体
│   └── crawl-queue.entity.ts       # 新增：抓取队列实体
└── modules/knowledge/
    ├── controllers/
    │   └── crawl.controller.ts      # 新增：抓取API控制器
    ├── services/
    │   ├── crawl.service.ts         # 新增：抓取核心逻辑
    │   └── knowledge-document.service.ts  # 修改：复用现有抓取逻辑
    └── knowledge.module.ts          # 修改：注册新模块
dashboard-web/src/pages/SmartArchive/
└── KnowledgeBase.tsx                # 修改：添加模式选择和进度显示
```

---

### Task 1: 创建抓取任务实体

**Files:**
- Create: `src/entities/crawl-task.entity.ts`

- [ ] **Step 1: 创建实体文件**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';

// 抓取模式
export enum CrawlMode {
  SINGLE = 'SINGLE',    // 单页抓取
  PROJECT = 'PROJECT',  // 专题抓取
  SITE = 'SITE',        // 整站抓取
}

// 任务状态
export enum CrawlTaskStatus {
  PENDING = 'PENDING',      // 待处理
  RUNNING = 'RUNNING',      // 运行中
  COMPLETED = 'COMPLETED',  // 已完成
  CANCELLED = 'CANCELLED',  // 已取消
  FAILED = 'FAILED',        // 失败
}

@Entity('crawl_tasks')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'createdAt'])
export class CrawlTask extends TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'source_url', type: 'varchar', length: 2000 })
  sourceUrl: string;

  @Column({
    name: 'mode',
    type: 'enum',
    enum: CrawlMode,
    default: CrawlMode.SINGLE,
  })
  mode: CrawlMode;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CrawlTaskStatus,
    default: CrawlTaskStatus.PENDING,
  })
  status: CrawlTaskStatus;

  @Column({ name: 'total_urls', type: 'int', default: 0 })
  totalUrls: number;

  @Column({ name: 'crawled_count', type: 'int', default: 0 })
  crawledCount: number;

  @Column({ name: 'failed_count', type: 'int', default: 0 })
  failedCount: number;

  @Column({ name: 'started_at', type: 'datetime', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'category', type: 'varchar', length: 255, nullable: true })
  category: string | null;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/entities/crawl-task.entity.ts
git commit -m "feat(knowledge): add CrawlTask entity for crawl job management"
```

---

### Task 2: 创建抓取队列实体

**Files:**
- Create: `src/entities/crawl-queue.entity.ts`

- [ ] **Step 1: 创建实体文件**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CrawlTask, CrawlTaskStatus } from './crawl-task.entity';

// 队列项状态
export enum CrawlQueueStatus {
  PENDING = 'PENDING',        // 待处理
  PROCESSING = 'PROCESSING',  // 处理中
  COMPLETED = 'COMPLETED',    // 已完成
  FAILED = 'FAILED',         // 失败
}

@Entity('crawl_queues')
@Index(['taskId', 'status'])
@Index(['url'])
export class CrawlQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @ManyToOne(() => CrawlTask, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: CrawlTask;

  @Column({ name: 'url', type: 'varchar', length: 2000 })
  url: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CrawlQueueStatus,
    default: CrawlQueueStatus.PENDING,
  })
  status: CrawlQueueStatus;

  @Column({ name: 'priority', type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'error', type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/entities/crawl-queue.entity.ts
git commit -m "feat(knowledge): add CrawlQueue entity for URL queue management"
```

---

### Task 3: 创建抓取服务

**Files:**
- Create: `src/modules/knowledge/services/crawl.service.ts`

- [ ] **Step 1: 创建抓取服务文件**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { CrawlTask, CrawlMode, CrawlTaskStatus } from '../../entities/crawl-task.entity';
import { CrawlQueue, CrawlQueueStatus } from '../../entities/crawl-queue.entity';
import { KnowledgeDocumentService } from './knowledge-document.service';

@Injectable()
export class CrawlService {
  private readonly logger = new Logger(CrawlService.name);

  constructor(
    @InjectRepository(CrawlTask)
    private crawlTaskRepository: Repository<CrawlTask>,
    @InjectRepository(CrawlQueue)
    private crawlQueueRepository: Repository<CrawlQueue>,
    private knowledgeDocumentService: KnowledgeDocumentService,
  ) {}

  async startCrawlTask(
    url: string,
    mode: CrawlMode,
    category?: string,
  ): Promise<{ taskId: string; totalUrls: number }> {
    const task = this.crawlTaskRepository.create({
      sourceUrl: url,
      mode,
      status: CrawlTaskStatus.PENDING,
      category: category || null,
    });
    await this.crawlTaskRepository.save(task);

    this.executeCrawlTask(task.id, url, mode).catch((err) => {
      this.logger.error(`Crawl task ${task.id} failed: ${err.message}`, err.stack);
    });

    return { taskId: task.id, totalUrls: 0 };
  }

  private async executeCrawlTask(
    taskId: string,
    startUrl: string,
    mode: CrawlMode,
  ): Promise<void> {
    const task = await this.crawlTaskRepository.findOne({ where: { id: taskId } });
    if (!task) return;

    task.status = CrawlTaskStatus.RUNNING;
    task.startedAt = new Date();
    await this.crawlTaskRepository.save(task);

    const startPageHtml = await this.fetchHtml(startUrl);
    if (!startPageHtml) {
      task.status = CrawlTaskStatus.FAILED;
      task.completedAt = new Date();
      await this.crawlTaskRepository.save(task);
      return;
    }

    const baseUrl = new URL(startUrl);
    const basePath = this.getBasePath(startUrl);
    const allUrls = this.extractLinks(startPageHtml, baseUrl.origin);
    const filteredUrls = this.filterUrls(allUrls, startUrl, mode, basePath);
    const normalizedUrls = this.normalizeUrls(filteredUrls);
    const uniqueUrls = [...new Set(normalizedUrls)];

    task.totalUrls = uniqueUrls.length;
    await this.crawlTaskRepository.save(task);

    for (const url of uniqueUrls) {
      const queueItem = this.crawlQueueRepository.create({
        taskId: task.id,
        url,
        status: CrawlQueueStatus.PENDING,
        priority: this.calculatePriority(url, basePath),
      });
      await this.crawlQueueRepository.save(queueItem);
    }

    await this.processQueue(task.id);
  }

  private async processQueue(taskId: string): Promise<void> {
    const task = await this.crawlTaskRepository.findOne({ where: { id: taskId } });
    if (!task) return;

    while (true) {
      const queueItem = await this.crawlQueueRepository.findOne({
        where: { taskId, status: CrawlQueueStatus.PENDING },
        order: { priority: 'ASC', createdAt: 'ASC' },
      });

      if (!queueItem) break;

      queueItem.status = CrawlQueueStatus.PROCESSING;
      await this.crawlQueueRepository.save(queueItem);

      try {
        const html = await this.fetchHtml(queueItem.url);
        if (html) {
          await this.knowledgeDocumentService.importUrlDocument(queueItem.url, {
            category: task.category,
          });
          queueItem.status = CrawlQueueStatus.COMPLETED;
        } else {
          queueItem.status = CrawlQueueStatus.FAILED;
          queueItem.error = 'Failed to fetch HTML';
        }
      } catch (error) {
        queueItem.status = CrawlQueueStatus.FAILED;
        queueItem.error = error.message;
      }

      await this.crawlQueueRepository.save(queueItem);
      await this.crawlTaskRepository.save(task);

      if (task.mode === CrawlMode.SITE && task.crawledCount % 10 === 0) {
        await this.expandQueue(task);
      }
    }

    task.status = CrawlTaskStatus.COMPLETED;
    task.completedAt = new Date();
    await this.crawlTaskRepository.save(task);
  }

  private async expandQueue(task: CrawlTask): Promise<void> {
    const completedUrls = await this.crawlQueueRepository.find({
      where: { taskId: task.id, status: CrawlQueueStatus.COMPLETED },
      take: 5,
      order: { createdAt: 'DESC' },
    });

    for (const item of completedUrls) {
      try {
        const html = await this.fetchHtml(item.url);
        if (html) {
          const baseUrl = new URL(item.url);
          const basePath = this.getBasePath(task.sourceUrl);
          const newUrls = this.extractLinks(html, baseUrl.origin);
          const filtered = this.filterUrls(newUrls, task.sourceUrl, task.mode, basePath);

          for (const url of filtered) {
            const normalized = this.normalizeUrls([url])[0];
            const exists = await this.crawlQueueRepository.findOne({ where: { taskId: task.id, url: normalized } });
            if (!exists) {
              const queueItem = this.crawlQueueRepository.create({
                taskId: task.id,
                url: normalized,
                status: CrawlQueueStatus.PENDING,
                priority: this.calculatePriority(url, basePath),
              });
              await this.crawlQueueRepository.save(queueItem);
              task.totalUrls++;
            }
          }
        }
      } catch {
        // ignore
      }
    }

    await this.crawlTaskRepository.save(task);
  }

  private async fetchHtml(url: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html',
        },
        maxRedirects: 5,
        validateStatus: (status) => status < 500,
      });
      return response.status === 200 ? response.data : null;
    } catch {
      return null;
    }
  }

  extractLinks(html: string, baseOrigin: string): string[] {
    const $ = cheerio.load(html);
    const links: string[] = [];

    $('a[href]').each((_, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        try {
          const fullUrl = new URL(href, baseOrigin);
          if (fullUrl.origin === baseOrigin) {
            links.push(fullUrl.href);
          }
        } catch {
          // ignore invalid URLs
        }
      }
    });

    return links;
  }

  private filterUrls(urls: string[], sourceUrl: string, mode: CrawlMode, basePath: string): string[] {
    const sourceOrigin = new URL(sourceUrl).origin;

    return urls.filter((url) => {
      try {
        const parsed = new URL(url);

        if (parsed.origin !== sourceOrigin) return false;

        if (mode === CrawlMode.PROJECT && !parsed.pathname.startsWith(basePath)) {
          return false;
        }

        const ext = parsed.pathname.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'css', 'js', 'ico', 'woff', 'woff2'].includes(ext || '')) {
          return false;
        }

        return true;
      } catch {
        return false;
      }
    });
  }

  normalizeUrls(urls: string[]): string[] {
    return urls.map((url) => {
      try {
        const parsed = new URL(url);
        parsed.hash = '';
        if (parsed.search) {
          const params = new URLSearchParams(parsed.search);
          params.sort();
          parsed.search = params.toString();
        }
        return parsed.toString();
      } catch {
        return url;
      }
    });
  }

  private getBasePath(url: string): string {
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        segments.pop();
      }
      return '/' + segments.join('/') + '/';
    } catch {
      return '/';
    }
  }

  private calculatePriority(url: string, basePath: string): number {
    try {
      const parsed = new URL(url);
      const depth = parsed.pathname.split('/').filter(Boolean).length;
      return depth;
    } catch {
      return 999;
    }
  }

  async getTaskStatus(taskId: string) {
    const task = await this.crawlTaskRepository.findOne({ where: { id: taskId } });
    if (!task) return null;

    return {
      status: task.status,
      totalUrls: task.totalUrls,
      crawledCount: task.crawledCount,
      failedCount: task.failedCount,
      startedAt: task.startedAt,
      completedAt: task.completedAt,
    };
  }

  async cancelTask(taskId: string): Promise<boolean> {
    const task = await this.crawlTaskRepository.findOne({ where: { id: taskId } });
    if (!task) return false;

    task.status = CrawlTaskStatus.CANCELLED;
    task.completedAt = new Date();
    await this.crawlTaskRepository.save(task);

    await this.crawlQueueRepository.update(
      { taskId, status: CrawlQueueStatus.PENDING },
      { status: CrawlQueueStatus.FAILED },
    );

    return true;
  }

  async getTaskList(offset: number = 0, limit: number = 20) {
    const [tasks, total] = await this.crawlTaskRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return { tasks, total };
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/modules/knowledge/services/crawl.service.ts
git commit -m "feat(knowledge): add CrawlService for deep web scraping"
```

---

### Task 4: 创建抓取控制器

**Files:**
- Create: `src/modules/knowledge/controllers/crawl.controller.ts`

- [ ] **Step 1: 创建控制器文件**

```typescript
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CrawlService } from '../services/crawl.service';
import { CrawlMode } from '../../entities/crawl-task.entity';

@ApiTags('Crawl')
@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Post('start')
  @ApiOperation({ summary: '启动抓取任务' })
  @ApiResponse({ status: 201, description: '任务启动成功' })
  async startCrawl(
    @Body() body: { url: string; mode: string; category?: string },
  ) {
    const mode = body.mode as CrawlMode;
    const result = await this.crawlService.startCrawlTask(
      body.url,
      mode,
      body.category,
    );
    return result;
  }

  @Get(':taskId/status')
  @ApiOperation({ summary: '获取任务状态' })
  @ApiResponse({ status: 200, description: '任务状态' })
  async getTaskStatus(@Param('taskId') taskId: string) {
    const status = await this.crawlService.getTaskStatus(taskId);
    return status;
  }

  @Delete(':taskId')
  @ApiOperation({ summary: '取消任务' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async cancelTask(@Param('taskId') taskId: string) {
    const success = await this.crawlService.cancelTask(taskId);
    return { success };
  }

  @Get('tasks')
  @ApiOperation({ summary: '获取任务列表' })
  @ApiResponse({ status: 200, description: '任务列表' })
  async getTaskList(
    @Query('offset') offset: string = '0',
    @Query('limit') limit: string = '20',
  ) {
    const result = await this.crawlService.getTaskList(
      parseInt(offset, 10),
      parseInt(limit, 10),
    );
    return result;
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/modules/knowledge/controllers/crawl.controller.ts
git commit -m "feat(knowledge): add CrawlController for crawl API endpoints"
```

---

### Task 5: 更新知识库模块

**Files:**
- Modify: `src/modules/knowledge/knowledge.module.ts`

- [ ] **Step 1: 添加新实体和服务**

在文件顶部添加导入：
```typescript
import { CrawlTask } from '../../entities/crawl-task.entity';
import { CrawlQueue } from '../../entities/crawl-queue.entity';
import { CrawlService } from './services/crawl.service';
import { CrawlController } from './controllers/crawl.controller';
```

在 @Module 的 imports 中添加：
```typescript
TypeOrmModule.forFeature([..., CrawlTask, CrawlQueue]),
```

在 @Module 的 controllers 中添加：
```typescript
controllers: [..., CrawlController],
```

在 @Module 的 providers 中添加：
```typescript
providers: [..., CrawlService],
```

- [ ] **Step 2: 提交**

```bash
git add src/modules/knowledge/knowledge.module.ts
git commit -m "feat(knowledge): register CrawlTask, CrawlQueue and CrawlService"
```

---

### Task 6: 更新前端UI

**Files:**
- Modify: `dashboard-web/src/pages/SmartArchive/KnowledgeBase.tsx`

- [ ] **Step 1: 添加状态和模式选择**

在现有状态后添加：
```typescript
const [crawlMode, setCrawlMode] = useState<'SINGLE' | 'PROJECT' | 'SITE'>('SINGLE');
const [crawlProgress, setCrawlProgress] = useState<{
  taskId: string;
  status: string;
  crawledCount: number;
  failedCount: number;
} | null>(null);
```

- [ ] **Step 2: 修改网页采集卡片，添加模式选择UI**

在URL输入框后添加：
```tsx
<div className="space-y-2">
  <Label className="text-slate-300">采集模式</Label>
  <div className="flex gap-4">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        value="SINGLE"
        checked={crawlMode === 'SINGLE'}
        onChange={(e) => setCrawlMode('SINGLE')}
        className="accent-amber-500"
      />
      <span className="text-slate-300">单页</span>
    </label>
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        value="PROJECT"
        checked={crawlMode === 'PROJECT'}
        onChange={(e) => setCrawlMode('PROJECT')}
        className="accent-amber-500"
      />
      <span className="text-slate-300">专题</span>
    </label>
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        value="SITE"
        checked={crawlMode === 'SITE'}
        onChange={(e) => setCrawlMode('SITE')}
        className="accent-amber-500"
      />
      <span className="text-slate-300">整站</span>
    </label>
  </div>
  {crawlMode !== 'SINGLE' && (
    <p className="text-xs text-slate-500">（无上限抓取，请谨慎使用）</p>
  )}
</div>
```

- [ ] **Step 3: 修改handleCrawl函数使用新API**

```typescript
const handleCrawl = async () => {
  if (!urlInput.trim()) {
    toast({ title: '请输入URL', description: '请先输入要采集的网页URL', variant: 'destructive' });
    return;
  }

  setUploading(true);
  try {
    const response = await fetch('/api/v1/crawl/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: urlInput,
        mode: crawlMode,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '采集失败');
    }

    const result = await response.json();
    setCrawlProgress({
      taskId: result.taskId,
      status: 'PENDING',
      crawledCount: 0,
      failedCount: 0,
    });

    pollCrawlProgress(result.taskId);

    toast({ title: '采集任务已启动', description: `开始抓取，请稍候查看进度` });
    setUrlInput('');
  } catch (error) {
    // ... 错误处理不变
  } finally {
    setUploading(false);
  }
};
```

- [ ] **Step 4: 添加轮询函数**

```typescript
const pollCrawlProgress = async (taskId: string) => {
  const poll = async () => {
    try {
      const response = await fetch(`/api/v1/crawl/${taskId}/status`);
      if (response.ok) {
        const status = await response.json();
        setCrawlProgress({
          taskId,
          status: status.status,
          crawledCount: status.crawledCount,
          failedCount: status.failedCount,
        });

        if (status.status === 'RUNNING' || status.status === 'PENDING') {
          setTimeout(poll, 5000);
        } else {
          fetchDocuments();
        }
      }
    } catch {
      // 忽略轮询错误
    }
  };
  poll();
};
```

- [ ] **Step 5: 在卡片下方添加进度显示**

```tsx
{crawlProgress && (
  <Card className="bg-slate-900/50 border-slate-800">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-300">抓取进度</span>
        <span className="text-slate-400 text-sm">
          {crawlProgress.status === 'RUNNING' ? '采集中...' :
           crawlProgress.status === 'COMPLETED' ? '已完成' :
           crawlProgress.status === 'CANCELLED' ? '已取消' : '处理中'}
        </span>
      </div>
      <div className="flex gap-4 text-sm">
        <span className="text-slate-400">已抓取: {crawlProgress.crawledCount}</span>
        <span className="text-red-400">失败: {crawlProgress.failedCount}</span>
      </div>
    </CardContent>
  </Card>
)}
```

- [ ] **Step 6: 提交**

```bash
git add dashboard-web/src/pages/SmartArchive/KnowledgeBase.tsx
git commit -m "feat(knowledge): add crawl mode selection and progress tracking UI"
```

---

### Task 7: 测试验证

- [ ] **Step 1: 测试单页抓取**

```bash
curl -X POST http://localhost:3003/api/v1/crawl/start \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/","mode":"SINGLE"}'
```

- [ ] **Step 2: 测试专题抓取**

```bash
curl -X POST http://localhost:3003/api/v1/crawl/start \
  -H "Content-Type: application/json" \
  -d '{"url":"https://httpbin.org/html","mode":"PROJECT"}'
```

- [ ] **Step 3: 查看任务状态**

```bash
curl http://localhost:3003/api/v1/crawl/{taskId}/status
```

- [ ] **Step 4: 提交**

```bash
git add -A && git commit -m "test(knowledge): verify deep crawl functionality"
```
