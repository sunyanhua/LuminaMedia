import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { CrawlTask, CrawlMode, CrawlTaskStatus } from '../../../entities/crawl-task.entity';
import { CrawlQueue, CrawlQueueStatus } from '../../../entities/crawl-queue.entity';
import { KnowledgeDocumentService } from './knowledge-document.service';
import { TenantContextService } from '../../../shared/services/tenant-context.service';

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
    const tenantId = TenantContextService.getCurrentTenantIdStatic();
    const task = this.crawlTaskRepository.create({
      sourceUrl: url,
      mode,
      status: CrawlTaskStatus.PENDING,
      category: category || null,
      tenantId,
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
          task.crawledCount++;
        } else {
          queueItem.status = CrawlQueueStatus.FAILED;
          queueItem.error = 'Failed to fetch HTML';
        }
      } catch (error: unknown) {
        queueItem.status = CrawlQueueStatus.FAILED;
        queueItem.error = error instanceof Error ? error.message : 'Unknown error';
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
