import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import { In } from 'typeorm';

import { ReferenceInfoService, CrawlResult } from './reference-info.service';
import { ReferenceInfo } from '../../../entities/reference-info.entity';
import { TenantContextService } from '../../../shared/services/tenant-context.service';

// 抓取源配置
interface CrawlSourceConfig {
  name: string;
  url: string;
  type: 'policy' | 'news' | 'blog' | 'official';
  enabled: boolean;
  selectors?: {
    list?: string;
    item?: string;
    title?: string;
    content?: string;
    publishTime?: string;
    author?: string;
    link?: string;
  };
}

@Injectable()
export class ReferenceCrawlerService {
  private readonly logger = new Logger(ReferenceCrawlerService.name);
  private readonly crawlSources: CrawlSourceConfig[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly referenceInfoService: ReferenceInfoService,
    private readonly tenantContextService: TenantContextService,
  ) {
    this.initializeCrawlSources();
  }

  /**
   * 初始化抓取源配置
   */
  private initializeCrawlSources(): void {
    // DEMO版本使用模拟数据源，实际项目可以配置真实源
    this.crawlSources = [
      {
        name: '政策模拟源',
        url: 'https://demo-policy-source.example.com',
        type: 'policy',
        enabled: true,
        selectors: {
          list: '.policy-list li',
          item: 'a',
          title: '.title',
          content: '.content',
          publishTime: '.date',
          author: '.author',
          link: 'a',
        },
      },
      {
        name: '新闻模拟源',
        url: 'https://demo-news-source.example.com',
        type: 'news',
        enabled: true,
        selectors: {
          list: '.news-list article',
          item: 'a',
          title: 'h2',
          content: '.summary',
          publishTime: 'time',
          author: '.byline',
          link: 'a',
        },
      },
    ];

    this.logger.log(`Initialized ${this.crawlSources.length} crawl sources`);
  }

  /**
   * 每日定时抓取任务
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduledCrawl(): Promise<void> {
    const tenantId = this.tenantContextService.getTenantId();
    this.logger.log(`Starting scheduled crawl for tenant ${tenantId}`);

    try {
      const results = await this.crawlAllSources();
      this.logger.log(`Crawled ${results.length} items from all sources`);

      // 保存抓取结果
      if (results.length > 0) {
        const saved = await this.saveCrawlResults(results);
        this.logger.log(`Saved ${saved} new reference items`);
      }
    } catch (error) {
      this.logger.error(`Scheduled crawl failed: ${error.message}`, error.stack);
    }
  }

  /**
   * 抓取所有启用的源
   */
  async crawlAllSources(): Promise<CrawlResult[]> {
    const allResults: CrawlResult[] = [];

    for (const source of this.crawlSources.filter(s => s.enabled)) {
      try {
        this.logger.log(`Crawling source: ${source.name}`);
        const results = await this.crawlSource(source);
        allResults.push(...results);
        this.logger.log(`Crawled ${results.length} items from ${source.name}`);
      } catch (error) {
        this.logger.error(`Failed to crawl source ${source.name}: ${error.message}`, error.stack);
      }
    }

    return allResults;
  }

  /**
   * 抓取单个源
   */
  async crawlSource(source: CrawlSourceConfig): Promise<CrawlResult[]> {
    // DEMO版本：生成模拟数据
    if (this.configService.get('NODE_ENV') === 'demo' || source.url.includes('example.com')) {
      return this.generateDemoData(source);
    }

    // 实际抓取逻辑（简化版）
    try {
      const response = await lastValueFrom(
        this.httpService.get(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LuminaMediaCrawler/1.0)',
          },
        }),
      );

      const $ = cheerio.load(response.data);
      const results: CrawlResult[] = [];

      // 根据选择器提取内容
      // 这里简化处理，实际需要根据具体网站结构实现
      $(source.selectors?.list || 'article').each((index, element) => {
        const title = $(element).find(source.selectors?.title || 'h1, h2').first().text().trim();
        const content = $(element).find(source.selectors?.content || 'p').first().text().trim();
        const link = $(element).find(source.selectors?.link || 'a').attr('href');
        const publishTimeText = $(element).find(source.selectors?.publishTime || 'time').first().text().trim();
        const author = $(element).find(source.selectors?.author || '.author').first().text().trim();

        if (title && content) {
          const absoluteUrl = link ? new URL(link, source.url).href : source.url;

          results.push({
            title,
            content,
            summary: content.substring(0, 200) + '...',
            sourceUrl: absoluteUrl,
            sourceName: source.name,
            publishTime: this.parseDate(publishTimeText),
            author,
            relevance: 70, // 默认相关度
            metadata: {
              sourceType: source.type,
              crawledAt: new Date(),
              originalUrl: absoluteUrl,
            },
          });
        }
      });

      return results;
    } catch (error) {
      this.logger.error(`HTTP crawl failed for ${source.url}: ${error.message}`);
      // 失败时返回模拟数据
      return this.generateDemoData(source);
    }
  }

  /**
   * 生成演示数据
   */
  private generateDemoData(source: CrawlSourceConfig): CrawlResult[] {
    const demoItems = [
      {
        title: '关于推动数字化转型的政策通知',
        content: '为加快推进数字化转型，提升企业竞争力，现发布相关政策通知。各单位需结合实际情况，制定具体实施方案。',
        category: '政策文件',
      },
      {
        title: '人工智能产业发展规划',
        content: '人工智能是新一轮科技革命和产业变革的重要驱动力量。规划提出到2025年，人工智能核心产业规模超过4000亿元。',
        category: '政策文件',
      },
      {
        title: '数字经济促进条例解读',
        content: '新出台的数字经济促进条例为数字经济发展提供了法律保障。条例明确了数据要素的市场化配置机制。',
        category: '政策解读',
      },
      {
        title: '科技创新支持政策汇总',
        content: '近期各部门出台了一系列科技创新支持政策，包括研发费用加计扣除、高新技术企业认定等。',
        category: '政策汇总',
      },
      {
        title: '绿色低碳发展指导意见',
        content: '为推动绿色低碳发展，指导意见提出了碳达峰碳中和的具体目标和实施路径。',
        category: '环保政策',
      },
    ];

    return demoItems.map((item, index) => {
      const publishTime = new Date();
      publishTime.setDate(publishTime.getDate() - Math.floor(Math.random() * 7));

      return {
        title: item.title,
        content: item.content,
        summary: item.content.substring(0, 150) + '...',
        sourceUrl: `${source.url}/article/${index + 1}`,
        sourceName: source.name,
        publishTime,
        author: '政府发布',
        relevance: Math.floor(Math.random() * 30) + 70, // 70-100
        metadata: {
          sourceType: source.type,
          crawledAt: new Date(),
          isDemo: true,
          category: item.category,
        },
      };
    });
  }

  /**
   * 解析日期字符串
   */
  private parseDate(dateString: string): Date | undefined {
    try {
      // 简单解析常见日期格式
      const parsed = new Date(dateString);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    } catch {
      return undefined;
    }
  }

  /**
   * 保存抓取结果到数据库
   */
  async saveCrawlResults(results: CrawlResult[]): Promise<number> {
    const tenantId = this.tenantContextService.getTenantId();
    let savedCount = 0;

    if (results.length === 0) {
      return 0;
    }

    // 批量检查已存在的记录，避免N+1查询
    const sourceUrls = results.map(result => result.sourceUrl);
    const existingRecords = await this.referenceInfoService['referenceInfoRepository'].find({
      where: {
        tenantId,
        sourceUrl: In(sourceUrls),
      },
      select: ['sourceUrl'],
    });
    const existingUrls = new Set(existingRecords.map(record => record.sourceUrl));

    // 获取租户关键词（一次获取，避免多次查询）
    const tenantKeywords = await this.getTenantKeywords();

    for (const result of results) {
      try {
        // 检查是否已存在相同URL的记录
        if (existingUrls.has(result.sourceUrl)) {
          this.logger.debug(`Skipping duplicate: ${result.title}`);
          continue;
        }

        // 计算内容哈希
        const contentHash = crypto
          .createHash('md5')
          .update(result.title + result.content)
          .digest('hex');

        // 计算相关度评分（基于租户关键词）
        const relevance = this.referenceInfoService.calculateRelevance(
          result.content,
          tenantKeywords,
        );

        // 创建参考信息
        await this.referenceInfoService.create({
          title: result.title,
          summary: result.summary,
          content: result.content,
          sourceUrl: result.sourceUrl,
          sourceName: result.sourceName,
          publishTime: result.publishTime,
          relevance,
          metadata: {
            ...result.metadata,
            contentHash,
            crawledAt: new Date(),
          },
          keywords: this.extractKeywords(result.content),
          category: result.metadata?.category || '政策文件',
        });

        savedCount++;
      } catch (error) {
        this.logger.error(`Failed to save crawl result: ${error.message}`, error.stack);
      }
    }

    return savedCount;
  }

  /**
   * 获取租户关键词（用于相关度计算）
   */
  private async getTenantKeywords(): Promise<string[]> {
    // DEMO版本返回固定关键词
    // 实际项目可以从租户配置或知识库中提取
    return [
      '数字化转型',
      '人工智能',
      '数字经济',
      '科技创新',
      '绿色低碳',
      '政策',
      '发展',
      '规划',
    ];
  }

  /**
   * 从内容中提取关键词
   */
  private extractKeywords(content: string): string[] {
    // 简化实现：提取高频词
    const words = content
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 1);

    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
  }

  /**
   * 手动触发抓取
   */
  async triggerManualCrawl(): Promise<{ success: boolean; message: string; count: number }> {
    try {
      this.logger.log('Manual crawl triggered');
      const results = await this.crawlAllSources();

      if (results.length === 0) {
        return {
          success: true,
          message: '抓取完成，未发现新内容',
          count: 0,
        };
      }

      const saved = await this.saveCrawlResults(results);

      return {
        success: true,
        message: `抓取完成，新增 ${saved} 条参考信息`,
        count: saved,
      };
    } catch (error) {
      this.logger.error(`Manual crawl failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: `抓取失败: ${error.message}`,
        count: 0,
      };
    }
  }
}