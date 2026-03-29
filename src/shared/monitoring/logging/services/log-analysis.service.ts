import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  LogAnalysisResult,
  LogQueryOptions,
  LogAlertRule,
} from '../interfaces/log-analysis.interface';

@Injectable()
export class LogAnalysisService {
  private readonly indexPrefix: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(ElasticsearchService)
    private readonly elasticsearchService?: ElasticsearchService,
  ) {
    this.indexPrefix = this.configService.get('ELASTICSEARCH_INDEX_PREFIX', 'lumina-logs');
  }

  /**
   * 查询日志
   */
  async queryLogs(options: LogQueryOptions): Promise<any> {
    // 如果Elasticsearch服务可用，则查询ES
    if (this.elasticsearchService) {
      return this.queryElasticsearch(options);
    }

    // 否则返回模拟数据（开发环境）
    return this.queryMockData(options);
  }

  /**
   * 分析日志
   */
  async analyzeLogs(options: LogQueryOptions): Promise<LogAnalysisResult> {
    const logs = await this.queryLogs(options);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 这里实现分析逻辑
    // 暂时返回模拟数据
    return {
      timeRange: {
        from: options.from || sevenDaysAgo.toISOString(),
        to: options.to || now.toISOString(),
      },
      statistics: {
        totalLogs: 1000,
        byLevel: { info: 700, error: 50, warn: 200, debug: 50 },
        byModule: { auth: 300, user: 200, api: 500 },
        byStatus: { success: 850, failure: 150 },
        errors: 50,
        warnings: 200,
      },
      trends: {
        hourly: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          count: Math.floor(Math.random() * 100),
          errors: Math.floor(Math.random() * 10),
        })),
        daily: Array.from({ length: 7 }, (_, i) => ({
          day: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 500),
          errors: Math.floor(Math.random() * 50),
        })),
      },
      errorAnalysis: {
        topErrors: [
          {
            errorCode: 'AUTH_FAILED',
            errorMessage: 'Authentication failed',
            count: 25,
            lastOccurred: new Date().toISOString(),
          },
          {
            errorCode: 'DB_CONNECTION',
            errorMessage: 'Database connection failed',
            count: 15,
            lastOccurred: new Date().toISOString(),
          },
        ],
        errorRate: 5.0, // 5%
      },
      performanceAnalysis: {
        averageDuration: 150,
        p95Duration: 450,
        p99Duration: 800,
        slowOperations: [
          {
            module: 'api',
            action: 'generate-report',
            averageDuration: 1200,
            count: 10,
          },
          {
            module: 'auth',
            action: 'validate-token',
            averageDuration: 800,
            count: 50,
          },
        ],
      },
      recommendations: [
        {
          type: 'error',
          priority: 'high',
          description: '高频认证错误',
          suggestion: '检查认证服务配置，增加失败重试机制',
        },
        {
          type: 'performance',
          priority: 'medium',
          description: '报告生成操作耗时过长',
          suggestion: '优化数据库查询，添加缓存机制',
        },
      ],
    };
  }

  /**
   * 检查告警规则
   */
  async checkAlertRules(rules: LogAlertRule[]): Promise<Array<{ rule: LogAlertRule; triggered: boolean; details?: any }>> {
    const results = [];

    for (const rule of rules) {
      if (!rule.enabled) {
        results.push({ rule, triggered: false });
        continue;
      }

      // 检查条件
      const isTriggered = await this.evaluateAlertCondition(rule.condition);

      results.push({
        rule,
        triggered: isTriggered,
        details: isTriggered ? { message: 'Alert triggered' } : undefined,
      });
    }

    return results;
  }

  /**
   * 获取日志统计
   */
  async getLogStats(timeRange: { from: string; to: string }): Promise<any> {
    const analysis = await this.analyzeLogs({
      from: timeRange.from,
      to: timeRange.to,
    });

    return analysis.statistics;
  }

  /**
   * 获取错误趋势
   */
  async getErrorTrends(days: number = 7): Promise<any> {
    const to = new Date().toISOString();
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const analysis = await this.analyzeLogs({ from, to });
    return analysis.trends.daily;
  }

  /**
   * 查询Elasticsearch
   */
  private async queryElasticsearch(options: LogQueryOptions): Promise<any> {
    // 构建Elasticsearch查询
    const query: any = {
      bool: {
        must: [],
      },
    };

    // 添加时间范围过滤
    if (options.from || options.to) {
      query.bool.must.push({
        range: {
          '@timestamp': {
            gte: options.from,
            lte: options.to,
          },
        },
      });
    }

    // 添加其他过滤条件
    if (options.filters) {
      const filters = options.filters;
      if (filters.level) {
        query.bool.must.push({
          term: { 'log.level': filters.level },
        });
      }
      if (filters.module) {
        query.bool.must.push({
          term: { 'service.module': filters.module },
        });
      }
    }

    // 构建搜索请求
    const searchRequest = {
      index: `${this.indexPrefix}-*`,
      body: {
        query,
        size: options.pagination?.pageSize || 100,
        from: ((options.pagination?.page || 1) - 1) * (options.pagination?.pageSize || 100),
        sort: options.sort
          ? [{ [options.sort.field]: { order: options.sort.order } }]
          : [{ '@timestamp': { order: 'desc' } }],
      },
    };

    try {
      const result = await this.elasticsearchService.search(searchRequest);
      return result.body;
    } catch (error) {
      console.error('Elasticsearch query failed:', error);
      throw error;
    }
  }

  /**
   * 查询模拟数据（开发环境）
   */
  private async queryMockData(options: LogQueryOptions): Promise<any> {
    // 返回模拟数据
    return {
      hits: {
        total: { value: 1000 },
        hits: Array.from({ length: 10 }, (_, i) => ({
          _source: {
            '@timestamp': new Date().toISOString(),
            'log.level': i % 3 === 0 ? 'error' : 'info',
            'service.module': i % 2 === 0 ? 'auth' : 'api',
            'log.action': 'request',
            'log.status': i % 10 === 0 ? 'failure' : 'success',
            'error.message': i % 3 === 0 ? 'Something went wrong' : undefined,
          },
        })),
      },
    };
  }

  /**
   * 评估告警条件
   */
  private async evaluateAlertCondition(condition: any): Promise<boolean> {
    // 简化实现：总是返回false
    // 实际实现需要根据条件查询日志
    return false;
  }
}