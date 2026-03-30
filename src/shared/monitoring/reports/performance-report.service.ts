import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { MetricsCollectorService } from '../metrics/collectors/metrics-collector.service';
import { AlertRuleService } from '../alerts/rules/alert-rule.service';
import {
  ReportDefinition,
  ReportInstance,
  ReportContent,
  ReportType,
  ReportFormat,
  ReportStatus,
  PerformanceMetrics,
  BusinessMetrics,
  PREDEFINED_REPORTS,
} from '../interfaces/reports.interface';

@Injectable()
export class PerformanceReportService {
  private readonly logger = new Logger(PerformanceReportService.name);
  private reportDefinitions: Map<string, ReportDefinition> = new Map();
  private reportInstances: Map<string, ReportInstance> = new Map();
  private readonly maxReportInstances = 1000;

  constructor(
    private configService: ConfigService,
    private metricsCollector: MetricsCollectorService,
    private alertRuleService: AlertRuleService,
  ) {
    this.initializeReportDefinitions();
  }

  /**
   * 初始化报告定义
   */
  private initializeReportDefinitions(): void {
    PREDEFINED_REPORTS.forEach(definition => {
      this.reportDefinitions.set(definition.id, definition);
    });
    this.logger.log(`Initialized ${this.reportDefinitions.size} report definitions`);
  }

  /**
   * 生成每日性能报告
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyPerformanceReport(): Promise<void> {
    await this.generateReport('daily_performance', ReportFormat.HTML);
  }

  /**
   * 生成每周业务报告
   */
  @Cron(CronExpression.EVERY_WEEK)
  async generateWeeklyBusinessReport(): Promise<void> {
    await this.generateReport('weekly_business', ReportFormat.HTML);
  }

  /**
   * 生成月度总结报告
   */
  @Cron('0 0 1 * *')
  async generateMonthlySummaryReport(): Promise<void> {
    await this.generateReport('monthly_summary', ReportFormat.HTML);
  }

  /**
   * 生成性能健康报告（每6小时）
   */
  @Cron('0 */6 * * *')
  async generatePerformanceHealthReport(): Promise<void> {
    await this.generateReport('performance_health', ReportFormat.HTML);
  }

  /**
   * 生成报告
   */
  async generateReport(definitionId: string, format: ReportFormat): Promise<ReportInstance | null> {
    const definition = this.reportDefinitions.get(definitionId);
    if (!definition || !definition.enabled) {
      this.logger.warn(`Report definition not found or disabled: ${definitionId}`);
      return null;
    }

    // 检查格式支持
    if (!definition.format.includes(format)) {
      this.logger.warn(`Report format ${format} not supported for ${definitionId}`);
      return null;
    }

    const reportId = `${definitionId}_${Date.now()}_${format}`;
    const instance: ReportInstance = {
      id: reportId,
      definitionId,
      name: definition.name,
      type: definition.type,
      status: ReportStatus.GENERATING,
      format,
      generationStartedAt: new Date(),
    };

    this.reportInstances.set(reportId, instance);
    this.logger.log(`Starting report generation: ${definition.name}`);

    try {
      // 生成报告内容
      const content = await this.generateReportContent(definition);
      instance.content = content;

      // 生成报告文件
      const filePath = await this.generateReportFile(instance);
      instance.filePath = filePath;

      // 更新状态
      instance.status = ReportStatus.COMPLETED;
      instance.generationCompletedAt = new Date();
      instance.fileSize = this.estimateFileSize(content, format);

      // 发送报告（如果需要）
      await this.deliverReport(instance, definition);

      this.logger.log(`Report generated successfully: ${definition.name}`);
    } catch (error) {
      instance.status = ReportStatus.FAILED;
      instance.errorMessage = error.message;
      this.logger.error(`Failed to generate report: ${definition.name}`, error);
    }

    this.reportInstances.set(reportId, instance);
    this.cleanupOldReports();

    return instance;
  }

  /**
   * 生成报告内容
   */
  private async generateReportContent(definition: ReportDefinition): Promise<ReportContent> {
    const now = new Date();
    let startTime: Date;
    let endTime: Date = now;

    // 根据报告类型确定时间范围
    switch (definition.type) {
      case ReportType.DAILY:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case ReportType.WEEKLY:
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case ReportType.MONTHLY:
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case ReportType.PERFORMANCE:
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6小时
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // 收集性能指标
    const performanceMetrics = await this.collectPerformanceMetrics(startTime, endTime);

    // 收集业务指标
    const businessMetrics = await this.collectBusinessMetrics(startTime, endTime);

    // 收集告警统计
    const alertStats = await this.collectAlertStatistics(startTime, endTime);

    // 识别问题
    const issues = await this.identifyIssues(performanceMetrics, businessMetrics);

    // 分析趋势
    const trends = await this.analyzeTrends(startTime, endTime);

    // 生成建议
    const recommendations = await this.generateRecommendations(issues, trends);

    const content: ReportContent = {
      title: `${definition.name} - ${startTime.toLocaleDateString()} 至 ${endTime.toLocaleDateString()}`,
      summary: this.generateSummary(performanceMetrics, businessMetrics, issues),
      period: { start: startTime, end: endTime },
      performance: performanceMetrics,
      business: businessMetrics,
      alerts: alertStats,
      issues,
      trends,
      recommendations,
    };

    return content;
  }

  /**
   * 收集性能指标
   */
  private async collectPerformanceMetrics(startTime: Date, endTime: Date): Promise<PerformanceMetrics> {
    // 这里简化实现，实际应从指标收集器获取数据
    // 注意：实际项目需要从时序数据库或监控系统获取

    const httpRequestDuration = await this.metricsCollector.getTimeSeries(
      'http_request_duration_ms',
      startTime,
      endTime,
    );

    const httpRequests = await this.metricsCollector.getTimeSeries(
      'http_requests_total',
      startTime,
      endTime,
    );

    const httpErrors = await this.metricsCollector.getTimeSeries(
      'http_errors_total',
      startTime,
      endTime,
    );

    // 计算性能指标
    const durationValues = httpRequestDuration.map(m => m.value);
    const requestCount = httpRequests.reduce((sum, m) => sum + m.value, 0);
    const errorCount = httpErrors.reduce((sum, m) => sum + m.value, 0);

    return {
      responseTimeP95: this.calculatePercentile(durationValues, 95),
      responseTimeP99: this.calculatePercentile(durationValues, 99),
      responseTimeAvg: durationValues.length > 0 ? durationValues.reduce((sum, val) => sum + val, 0) / durationValues.length : 0,
      successRate: requestCount > 0 ? 1 - (errorCount / requestCount) : 1,
      errorRate: requestCount > 0 ? errorCount / requestCount : 0,
      throughput: this.calculateThroughput(httpRequests, startTime, endTime),
      concurrentUsers: await this.estimateConcurrentUsers(startTime, endTime),
      cpuUsage: await this.estimateCpuUsage(startTime, endTime),
      memoryUsage: await this.estimateMemoryUsage(startTime, endTime),
    };
  }

  /**
   * 收集业务指标
   */
  private async collectBusinessMetrics(startTime: Date, endTime: Date): Promise<BusinessMetrics> {
    // 简化实现
    const activeUsers = await this.metricsCollector.getMetric('active_users');
    const contentPublished = await this.metricsCollector.getTimeSeries(
      'content_published_total',
      startTime,
      endTime,
    );
    const aiRequests = await this.metricsCollector.getTimeSeries(
      'ai_requests_total',
      startTime,
      endTime,
    );

    return {
      activeUsers: activeUsers?.value || 0,
      newUsers: await this.estimateNewUsers(startTime, endTime),
      contentPublished: contentPublished.reduce((sum, m) => sum + m.value, 0),
      aiRequests: aiRequests.reduce((sum, m) => sum + m.value, 0),
      databaseQueries: await this.estimateDatabaseQueries(startTime, endTime),
      publishSuccessRate: await this.estimatePublishSuccessRate(startTime, endTime),
      userSatisfaction: await this.estimateUserSatisfaction(startTime, endTime),
    };
  }

  /**
   * 收集告警统计
   */
  private async collectAlertStatistics(startTime: Date, endTime: Date) {
    const alerts = this.alertRuleService.getAlertHistory(1000);
    const periodAlerts = alerts.filter(
      alert => alert.triggeredAt >= startTime && alert.triggeredAt <= endTime,
    );

    const bySeverity: Record<string, number> = {};
    const ruleCounts: Record<string, number> = {};

    periodAlerts.forEach(alert => {
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
      ruleCounts[alert.ruleId] = (ruleCounts[alert.ruleId] || 0) + 1;
    });

    const topRules = Object.entries(ruleCounts)
      .map(([ruleId, count]) => ({ ruleId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: periodAlerts.length,
      bySeverity,
      topRules,
    };
  }

  /**
   * 识别问题
   */
  private async identifyIssues(
    performance: PerformanceMetrics,
    business: BusinessMetrics,
  ) {
    const issues: Array<{ severity: 'low' | 'medium' | 'high' | 'critical'; description: string; recommendation: string; impact: string }> = [];

    // 检查性能问题
    if (performance.responseTimeP99 > 2000) {
      issues.push({
        severity: 'high',
        description: 'API响应时间P99超过2秒，影响用户体验',
        recommendation: '优化慢查询，增加缓存，考虑横向扩展',
        impact: '用户可能因等待时间过长而流失',
      });
    }

    if (performance.errorRate > 0.05) {
      issues.push({
        severity: 'critical',
        description: '系统错误率超过5%，影响服务可靠性',
        recommendation: '检查错误日志，修复bug，增加错误处理',
        impact: '用户无法正常使用功能，可能造成数据丢失',
      });
    }

    if (performance.successRate < 0.95) {
      issues.push({
        severity: 'high',
        description: '系统成功率低于95%',
        recommendation: '检查依赖服务，优化异常处理',
        impact: '用户功能不可用，影响业务连续性',
      });
    }

    // 检查业务问题
    if (business.activeUsers < 10 && business.newUsers === 0) {
      issues.push({
        severity: 'medium',
        description: '活跃用户数低，无新用户增长',
        recommendation: '加强推广活动，优化用户引导',
        impact: '业务增长停滞',
      });
    }

    if (business.publishSuccessRate < 0.8) {
      issues.push({
        severity: 'high',
        description: '内容发布成功率低于80%',
        recommendation: '检查发布平台API，优化发布流程',
        impact: '内容无法正常发布，影响营销效果',
      });
    }

    return issues;
  }

  /**
   * 分析趋势
   */
  private async analyzeTrends(startTime: Date, endTime: Date) {
    // 简化实现
    return [
      {
        metric: 'http_requests_total',
        current: 1000,
        previous: 800,
        change: 200,
        changePercent: 25,
      },
      {
        metric: 'active_users',
        current: 150,
        previous: 120,
        change: 30,
        changePercent: 25,
      },
      {
        metric: 'content_published_total',
        current: 50,
        previous: 40,
        change: 10,
        changePercent: 25,
      },
    ];
  }

  /**
   * 生成建议
   */
  private async generateRecommendations(issues: any[], trends: any[]) {
    const recommendations: string[] = [];

    // 基于问题生成建议
    issues.forEach(issue => {
      recommendations.push(issue.recommendation);
    });

    // 基于趋势生成建议
    trends.forEach(trend => {
      if (trend.changePercent > 50) {
        recommendations.push(`${trend.metric}增长超过50%，建议关注资源扩容`);
      } else if (trend.changePercent < -20) {
        recommendations.push(`${trend.metric}下降超过20%，建议调查原因`);
      }
    });

    // 通用建议
    recommendations.push('定期检查系统日志，及时发现潜在问题');
    recommendations.push('优化数据库查询，添加必要的索引');
    recommendations.push('考虑实施更细粒度的监控和告警');

    return [...new Set(recommendations)]; // 去重
  }

  /**
   * 生成报告摘要
   */
  private generateSummary(performance: PerformanceMetrics, business: BusinessMetrics, issues: any[]): string {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;

    return `系统在报告期间整体运行${criticalIssues > 0 ? '存在严重问题' : highIssues > 0 ? '基本稳定' : '良好'}。` +
      `共处理请求约${Math.round(performance.throughput * (24 * 60 * 60))}次，平均响应时间${performance.responseTimeAvg.toFixed(2)}ms，` +
      `成功率${(performance.successRate * 100).toFixed(1)}%。活跃用户${business.activeUsers}人，` +
      `发布内容${business.contentPublished}篇。发现${issues.length}个问题，其中严重问题${criticalIssues}个，高风险问题${highIssues}个。`;
  }

  /**
   * 生成报告文件
   */
  private async generateReportFile(instance: ReportInstance): Promise<string> {
    // 简化实现：实际应生成HTML/PDF文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${instance.definitionId}_${timestamp}.${instance.format}`;
    const filePath = `./reports/${fileName}`;

    // 实际应写入文件内容
    this.logger.debug(`Report file would be generated at: ${filePath}`);

    return filePath;
  }

  /**
   * 估算文件大小
   */
  private estimateFileSize(content: ReportContent, format: ReportFormat): number {
    // 简化估算
    const jsonSize = JSON.stringify(content).length;
    switch (format) {
      case ReportFormat.HTML:
        return jsonSize * 2; // HTML通常更大
      case ReportFormat.PDF:
        return jsonSize * 3;
      case ReportFormat.JSON:
        return jsonSize;
      case ReportFormat.CSV:
        return jsonSize;
      default:
        return jsonSize;
    }
  }

  /**
   * 发送报告
   */
  private async deliverReport(instance: ReportInstance, definition: ReportDefinition): Promise<void> {
    if (!definition.recipients || definition.recipients.length === 0) {
      return;
    }

    // 简化实现：记录日志
    this.logger.log(`Report would be delivered to: ${definition.recipients.join(', ')}`);

    // 实际应发送邮件或其他通知
  }

  /**
   * 清理旧报告
   */
  private cleanupOldReports(): void {
    if (this.reportInstances.size <= this.maxReportInstances) {
      return;
    }

    const instances = Array.from(this.reportInstances.values());
    instances.sort((a, b) => {
      const aTime = a.generationCompletedAt || a.generationStartedAt || new Date(0);
      const bTime = b.generationCompletedAt || b.generationStartedAt || new Date(0);
      return aTime.getTime() - bTime.getTime();
    });

    const toDelete = instances.slice(0, instances.length - this.maxReportInstances);
    toDelete.forEach(instance => {
      this.reportInstances.delete(instance.id);
    });

    this.logger.debug(`Cleaned up ${toDelete.length} old report instances`);
  }

  /**
   * 辅助方法：计算百分位数
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) {
      return 0;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }

  /**
   * 辅助方法：计算吞吐量
   */
  private calculateThroughput(metrics: any[], startTime: Date, endTime: Date): number {
    if (metrics.length === 0) {
      return 0;
    }
    const totalRequests = metrics.reduce((sum, m) => sum + m.value, 0);
    const timeDiff = (endTime.getTime() - startTime.getTime()) / 1000;
    return timeDiff > 0 ? totalRequests / timeDiff : 0;
  }

  /**
   * 辅助方法：估算并发用户数
   */
  private async estimateConcurrentUsers(startTime: Date, endTime: Date): Promise<number> {
    // 简化实现
    return 10;
  }

  /**
   * 辅助方法：估算CPU使用率
   */
  private async estimateCpuUsage(startTime: Date, endTime: Date): Promise<number> {
    // 简化实现
    return 30;
  }

  /**
   * 辅助方法：估算内存使用率
   */
  private async estimateMemoryUsage(startTime: Date, endTime: Date): Promise<number> {
    // 简化实现
    return 45;
  }

  /**
   * 辅助方法：估算新用户数
   */
  private async estimateNewUsers(startTime: Date, endTime: Date): Promise<number> {
    // 简化实现
    return 5;
  }

  /**
   * 辅助方法：估算数据库查询数
   */
  private async estimateDatabaseQueries(startTime: Date, endTime: Date): Promise<number> {
    // 简化实现
    return 10000;
  }

  /**
   * 辅助方法：估算发布成功率
   */
  private async estimatePublishSuccessRate(startTime: Date, endTime: Date): Promise<number> {
    // 简化实现
    return 0.92;
  }

  /**
   * 辅助方法：估算用户满意度
   */
  private async estimateUserSatisfaction(startTime: Date, endTime: Date): Promise<number> {
    // 简化实现
    return 4.2;
  }

  /**
   * 获取报告定义
   */
  getReportDefinitions(): ReportDefinition[] {
    return Array.from(this.reportDefinitions.values());
  }

  /**
   * 获取报告实例
   */
  getReportInstances(limit = 100): ReportInstance[] {
    const instances = Array.from(this.reportInstances.values());
    return instances
      .sort((a, b) => {
        const aTime = b.generationCompletedAt || b.generationStartedAt || new Date(0);
        const bTime = a.generationCompletedAt || a.generationStartedAt || new Date(0);
        return aTime.getTime() - bTime.getTime();
      })
      .slice(0, limit);
  }

  /**
   * 手动触发报告生成
   */
  async triggerReportGeneration(definitionId: string, format: ReportFormat = ReportFormat.HTML): Promise<ReportInstance | null> {
    return this.generateReport(definitionId, format);
  }
}