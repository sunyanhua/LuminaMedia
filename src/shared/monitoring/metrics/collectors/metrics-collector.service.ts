import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SkywalkingApmService } from '../../apm/skywalking/skywalking-apm.service';
import {
  MetricsCollector,
  MetricValue,
  BusinessMetric,
  MetricType,
  PREDEFINED_METRICS,
} from '../../interfaces/metrics.interface';

// 指标存储实体（如果需要持久化）
// 注意：实际项目可能需要时序数据库，这里使用内存存储示例
interface StoredMetric extends MetricValue {
  id?: string;
}

@Injectable()
export class MetricsCollectorService implements MetricsCollector {
  private readonly logger = new Logger(MetricsCollectorService.name);
  private metrics: Map<string, StoredMetric[]> = new Map();
  private businessMetrics: BusinessMetric[] = [...PREDEFINED_METRICS];
  private readonly maxStoragePoints = 1000; // 每个指标最大存储点数

  constructor(
    private configService: ConfigService,
    private apmService: SkywalkingApmService,
  ) {
    this.initializeMetrics();
  }

  /**
   * 初始化指标存储
   */
  private initializeMetrics(): void {
    // 为每个预定义指标创建存储桶
    this.businessMetrics.forEach(metric => {
      this.metrics.set(metric.name, []);
    });

    this.logger.log(`Initialized ${this.businessMetrics.length} business metrics`);
  }

  /**
   * 记录指标
   */
  async record(metric: MetricValue): Promise<void> {
    try {
      // 存储到内存
      this.storeMetric(metric);

      // 上报到APM
      this.apmService.recordMetric(metric.name, metric.value, metric.tags);

      // 记录到日志（调试用）
      this.logger.debug(`Metric recorded: ${metric.name}=${metric.value}`, metric.tags);
    } catch (error) {
      this.logger.error(`Failed to record metric: ${metric.name}`, error);
    }
  }

  /**
   * 记录业务指标
   */
  async recordBusinessMetric(name: string, value: number, tags?: Record<string, string>): Promise<void> {
    // 查找指标定义
    const metricDef = this.businessMetrics.find(m => m.name === name);
    if (!metricDef) {
      this.logger.warn(`Unknown business metric: ${name}`);
      return;
    }

    const metricValue: MetricValue = {
      name,
      value,
      timestamp: new Date(),
      tags: { ...metricDef.defaultTags, ...tags },
      type: metricDef.type,
    };

    await this.record(metricValue);
  }

  /**
   * 获取指标值
   */
  async getMetric(name: string, tags?: Record<string, string>): Promise<MetricValue | null> {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    // 如果有标签过滤，则匹配标签
    if (tags && Object.keys(tags).length > 0) {
      const filtered = metrics.filter(m => this.matchTags(m.tags, tags));
      if (filtered.length === 0) {
        return null;
      }
      // 返回最新的
      return filtered[filtered.length - 1];
    }

    // 返回最新的指标
    return metrics[metrics.length - 1];
  }

  /**
   * 获取指标时间序列
   */
  async getTimeSeries(
    name: string,
    startTime: Date,
    endTime: Date,
    tags?: Record<string, string>,
  ): Promise<MetricValue[]> {
    const metrics = this.metrics.get(name);
    if (!metrics) {
      return [];
    }

    let filtered = metrics.filter(
      m => m.timestamp >= startTime && m.timestamp <= endTime,
    );

    // 标签过滤
    if (tags && Object.keys(tags).length > 0) {
      filtered = filtered.filter(m => this.matchTags(m.tags, tags));
    }

    return filtered;
  }

  /**
   * 获取所有指标定义
   */
  getMetrics(): BusinessMetric[] {
    return [...this.businessMetrics];
  }

  /**
   * 添加自定义业务指标
   */
  registerBusinessMetric(metric: BusinessMetric): void {
    const existingIndex = this.businessMetrics.findIndex(m => m.name === metric.name);
    if (existingIndex >= 0) {
      this.businessMetrics[existingIndex] = metric;
      this.logger.debug(`Updated business metric: ${metric.name}`);
    } else {
      this.businessMetrics.push(metric);
      this.metrics.set(metric.name, []);
      this.logger.debug(`Registered new business metric: ${metric.name}`);
    }
  }

  /**
   * 记录HTTP请求指标
   */
  async recordHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
  ): Promise<void> {
    const tags = {
      method,
      path,
      status_code: statusCode.toString(),
    };

    // 记录请求总数
    await this.recordBusinessMetric('http_requests_total', 1, tags);

    // 记录请求耗时
    await this.recordBusinessMetric('http_request_duration_ms', durationMs, tags);

    // 记录错误（如果有）
    if (statusCode >= 400) {
      await this.recordBusinessMetric('http_errors_total', 1, tags);
    }
  }

  /**
   * 记录数据库查询指标
   */
  async recordDatabaseQuery(
    operation: string,
    table: string,
    durationMs: number,
    success: boolean,
  ): Promise<void> {
    const tags = {
      operation,
      table,
      success: success.toString(),
    };

    // 记录查询总数
    await this.recordBusinessMetric('database_queries_total', 1, tags);

    // 记录查询耗时
    await this.recordBusinessMetric('database_query_duration_ms', durationMs, tags);
  }

  /**
   * 记录AI请求指标
   */
  async recordAiRequest(
    provider: string,
    model: string,
    durationMs: number,
    success: boolean,
  ): Promise<void> {
    const tags = {
      provider,
      model,
      success: success.toString(),
    };

    // 记录请求总数
    await this.recordBusinessMetric('ai_requests_total', 1, tags);

    // 记录请求耗时
    await this.recordBusinessMetric('ai_request_duration_ms', durationMs, tags);
  }

  /**
   * 存储指标到内存
   */
  private storeMetric(metric: MetricValue): void {
    const storedMetrics = this.metrics.get(metric.name) || [];

    // 添加新指标
    storedMetrics.push({
      ...metric,
      id: `${metric.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    // 限制存储点数
    if (storedMetrics.length > this.maxStoragePoints) {
      storedMetrics.splice(0, storedMetrics.length - this.maxStoragePoints);
    }

    this.metrics.set(metric.name, storedMetrics);
  }

  /**
   * 匹配标签
   */
  private matchTags(metricTags?: Record<string, string>, filterTags?: Record<string, string>): boolean {
    if (!filterTags || Object.keys(filterTags).length === 0) {
      return true;
    }

    if (!metricTags) {
      return false;
    }

    for (const [key, value] of Object.entries(filterTags)) {
      if (metricTags[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * 获取指标统计
   */
  getMetricsStats(): { totalMetrics: number; metricNames: string[]; totalDataPoints: number } {
    let totalDataPoints = 0;
    this.metrics.forEach(metrics => {
      totalDataPoints += metrics.length;
    });

    return {
      totalMetrics: this.metrics.size,
      metricNames: Array.from(this.metrics.keys()),
      totalDataPoints,
    };
  }
}