import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetricsCollectorService } from '../../metrics/collectors/metrics-collector.service';
import {
  ScalingMetric,
  ScalingMetricType,
  ScalingProvider,
} from '../interfaces/autoscaling.interface';

/**
 * 扩缩容指标服务
 * 负责收集和计算扩缩容所需的指标值
 */
@Injectable()
export class ScalingMetricsService {
  private readonly logger = new Logger(ScalingMetricsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly metricsCollector: MetricsCollectorService,
  ) {}

  /**
   * 获取指标值
   */
  async getMetricValue(metric: ScalingMetric): Promise<number> {
    try {
      switch (metric.type) {
        case ScalingMetricType.RESOURCE:
          return await this.getResourceMetric(metric);
        case ScalingMetricType.POD:
          return await this.getPodMetric(metric);
        case ScalingMetricType.OBJECT:
          return await this.getObjectMetric(metric);
        case ScalingMetricType.BUSINESS:
          return await this.getBusinessMetric(metric);
        default:
          throw new Error(`不支持的指标类型: ${metric.type}`);
      }
    } catch (error) {
      this.logger.error(`获取指标值失败: ${metric.name}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取资源指标（CPU、内存等）
   */
  private async getResourceMetric(metric: ScalingMetric): Promise<number> {
    const resourceName = metric.source?.resourceName;
    if (!resourceName) {
      throw new Error('资源指标必须指定resourceName');
    }

    // 在实际环境中，这里应该从Kubernetes Metrics API获取资源使用情况
    // 当前使用模拟数据或从现有监控数据中获取
    switch (resourceName) {
      case 'cpu':
        // 模拟CPU使用率，实际应从系统监控获取
        return await this.getSimulatedCpuUsage();
      case 'memory':
        // 模拟内存使用率，实际应从系统监控获取
        return await this.getSimulatedMemoryUsage();
      default:
        throw new Error(`不支持的资源类型: ${resourceName}`);
    }
  }

  /**
   * 获取Pod指标（自定义指标）
   */
  private async getPodMetric(metric: ScalingMetric): Promise<number> {
    const selector = metric.source?.selector;
    if (!selector || !selector.metric) {
      throw new Error('Pod指标必须指定selector.metric');
    }

    // 从现有的指标收集器获取指标值
    const metricName = selector.metric;
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    try {
      // 获取时间序列数据
      const timeSeries = await this.metricsCollector.getTimeSeries(
        metricName,
        fiveMinutesAgo,
        now,
        selector,
      );

      if (timeSeries.length === 0) {
        this.logger.warn(`未找到指标数据: ${metricName}`);
        return 0;
      }

      // 根据指标类型计算平均值
      const values = timeSeries.map((ts) => ts.value);
      const sum = values.reduce((a, b) => a + b, 0);
      return sum / values.length;
    } catch (error) {
      this.logger.warn(`从指标收集器获取数据失败，使用模拟数据: ${metricName}`, error.message);
      // 如果指标收集器失败，返回模拟数据
      return await this.getSimulatedPodMetric(metricName);
    }
  }

  /**
   * 获取对象指标（外部系统指标）
   */
  private async getObjectMetric(metric: ScalingMetric): Promise<number> {
    // 对象指标通常需要从外部系统获取
    // 这里使用模拟实现
    this.logger.warn(`对象指标 ${metric.name} 使用模拟实现`);
    return await this.getSimulatedObjectMetric(metric.name);
  }

  /**
   * 获取业务指标
   */
  private async getBusinessMetric(metric: ScalingMetric): Promise<number> {
    // 业务指标可以从数据库或业务系统中获取
    // 这里使用模拟实现
    switch (metric.name) {
      case 'active_users':
        return await this.getSimulatedActiveUsers();
      case 'queue_length':
        return await this.getSimulatedQueueLength();
      default:
        return await this.getSimulatedBusinessMetric(metric.name);
    }
  }

  /**
   * 获取模拟的CPU使用率
   */
  private async getSimulatedCpuUsage(): Promise<number> {
    // 模拟CPU使用率在30%-90%之间波动
    const baseUsage = 50; // 基础使用率
    const timeFactor = Math.sin(Date.now() / 60000); // 每分钟波动
    const randomFactor = Math.random() * 20 - 10; // 随机波动
    return Math.max(10, Math.min(95, baseUsage + timeFactor * 10 + randomFactor));
  }

  /**
   * 获取模拟的内存使用率
   */
  private async getSimulatedMemoryUsage(): Promise<number> {
    // 模拟内存使用率在40%-85%之间波动
    const baseUsage = 60;
    const timeFactor = Math.cos(Date.now() / 90000); // 每1.5分钟波动
    const randomFactor = Math.random() * 15 - 7.5;
    return Math.max(20, Math.min(90, baseUsage + timeFactor * 8 + randomFactor));
  }

  /**
   * 获取模拟的Pod指标
   */
  private async getSimulatedPodMetric(metricName: string): Promise<number> {
    // 根据指标名称返回模拟值
    const simulatedValues: Record<string, number> = {
      http_requests_total: 150 + Math.random() * 100,
      http_request_duration_ms: 120 + Math.random() * 80,
      http_errors_total: 2 + Math.random() * 5,
      database_queries_total: 80 + Math.random() * 60,
      database_query_duration_ms: 80 + Math.random() * 40,
      ai_requests_total: 40 + Math.random() * 30,
      ai_request_duration_ms: 300 + Math.random() * 200,
    };

    return simulatedValues[metricName] || 50 + Math.random() * 50;
  }

  /**
   * 获取模拟的对象指标
   */
  private async getSimulatedObjectMetric(metricName: string): Promise<number> {
    // 模拟对象指标
    return 100 + Math.random() * 100;
  }

  /**
   * 获取模拟的活跃用户数
   */
  private async getSimulatedActiveUsers(): Promise<number> {
    // 模拟活跃用户数，考虑时间因素
    const hour = new Date().getHours();
    let baseUsers = 500;

    // 高峰时段（10-12点，14-16点，20-22点）
    if ((hour >= 10 && hour < 12) || (hour >= 14 && hour < 16) || (hour >= 20 && hour < 22)) {
      baseUsers = 1200;
    }
    // 低谷时段（0-6点）
    else if (hour >= 0 && hour < 6) {
      baseUsers = 100;
    }

    // 添加随机波动
    const randomFactor = Math.random() * 200 - 100;
    return Math.max(0, baseUsers + randomFactor);
  }

  /**
   * 获取模拟的队列长度
   */
  private async getSimulatedQueueLength(): Promise<number> {
    // 模拟队列长度
    const hour = new Date().getHours();
    let baseLength = 50;

    // 高峰时段队列更长
    if ((hour >= 9 && hour < 12) || (hour >= 14 && hour < 18)) {
      baseLength = 150;
    }

    // 添加随机波动
    const randomFactor = Math.random() * 50 - 25;
    return Math.max(0, baseLength + randomFactor);
  }

  /**
   * 获取模拟的业务指标
   */
  private async getSimulatedBusinessMetric(metricName: string): Promise<number> {
    // 通用业务指标模拟
    return 100 + Math.random() * 200;
  }

  /**
   * 批量获取指标值
   */
  async getMetricValues(metrics: ScalingMetric[]): Promise<Array<{ metric: ScalingMetric; value: number }>> {
    const results = [];
    for (const metric of metrics) {
      try {
        const value = await this.getMetricValue(metric);
        results.push({ metric, value });
      } catch (error) {
        this.logger.error(`获取指标 ${metric.name} 失败`, error.stack);
        // 使用默认值0，避免影响其他指标
        results.push({ metric, value: 0 });
      }
    }
    return results;
  }

  /**
   * 检查指标是否可用
   */
  async isMetricAvailable(metric: ScalingMetric): Promise<boolean> {
    try {
      await this.getMetricValue(metric);
      return true;
    } catch (error) {
      return false;
    }
  }
}