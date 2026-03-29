import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkywalkingApmService } from '../apm/skywalking/skywalking-apm.service';
import { MetricsCollectorService } from '../metrics/collectors/metrics-collector.service';
import { AlertRuleService } from '../alerts/rules/alert-rule.service';
import { PerformanceReportService } from '../reports/performance-report.service';

@ApiTags('monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private apmService: SkywalkingApmService,
    private metricsCollector: MetricsCollectorService,
    private alertRuleService: AlertRuleService,
    private reportService: PerformanceReportService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: '监控系统健康检查' })
  @ApiResponse({ status: 200, description: '监控系统运行正常' })
  getHealth() {
    const apmStatus = this.apmService.getStatus();
    const metricsStats = this.metricsCollector.getMetricsStats();
    const activeAlerts = this.alertRuleService.getActiveAlerts().length;

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      components: {
        apm: apmStatus.initialized ? 'running' : 'stopped',
        metrics: 'running',
        alerts: 'running',
        reports: 'running',
      },
      stats: {
        metricsCollected: metricsStats.totalDataPoints,
        activeAlerts,
        reportDefinitions: this.reportService.getReportDefinitions().length,
      },
    };
  }

  @Get('apm/status')
  @ApiOperation({ summary: '获取APM状态' })
  getApmStatus() {
    return this.apmService.getStatus();
  }

  @Get('metrics')
  @ApiOperation({ summary: '获取指标列表' })
  getMetrics() {
    const metrics = this.metricsCollector.getMetrics();
    const stats = this.metricsCollector.getMetricsStats();
    return {
      metrics,
      stats: {
        totalMetrics: stats.totalMetrics,
        metricNames: stats.metricNames,
        totalDataPoints: stats.totalDataPoints,
      },
    };
  }

  @Get('metrics/:name')
  @ApiOperation({ summary: '获取指定指标值' })
  async getMetric(
    @Param('name') name: string,
    @Query('tags') tags?: string,
  ) {
    const parsedTags = tags ? JSON.parse(tags) : undefined;
    return this.metricsCollector.getMetric(name, parsedTags);
  }

  @Get('metrics/:name/time-series')
  @ApiOperation({ summary: '获取指标时间序列' })
  async getMetricTimeSeries(
    @Param('name') name: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('tags') tags?: string,
  ) {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const parsedTags = tags ? JSON.parse(tags) : undefined;
    return this.metricsCollector.getTimeSeries(name, startTime, endTime, parsedTags);
  }

  @Post('metrics/record')
  @ApiOperation({ summary: '手动记录指标' })
  async recordMetric(
    @Body() body: { name: string; value: number; tags?: Record<string, string> },
  ) {
    await this.metricsCollector.recordBusinessMetric(body.name, body.value, body.tags);
    return { success: true, message: 'Metric recorded' };
  }

  @Get('alerts/rules')
  @ApiOperation({ summary: '获取告警规则列表' })
  getAlertRules() {
    return this.alertRuleService.getRules();
  }

  @Get('alerts/active')
  @ApiOperation({ summary: '获取活跃告警' })
  getActiveAlerts() {
    return this.alertRuleService.getActiveAlerts();
  }

  @Get('alerts/history')
  @ApiOperation({ summary: '获取告警历史' })
  getAlertHistory(@Query('limit') limit = 100) {
    return this.alertRuleService.getAlertHistory(limit);
  }

  @Post('alerts/rules/:ruleId/check')
  @ApiOperation({ summary: '手动检查告警规则' })
  async checkAlertRule(@Param('ruleId') ruleId: string) {
    const triggered = await this.alertRuleService.checkRule(ruleId);
    return { triggered, message: triggered ? 'Alert triggered' : 'No alert' };
  }

  @Get('reports/definitions')
  @ApiOperation({ summary: '获取报告定义' })
  getReportDefinitions() {
    return this.reportService.getReportDefinitions();
  }

  @Get('reports/instances')
  @ApiOperation({ summary: '获取报告实例' })
  getReportInstances(@Query('limit') limit = 100) {
    return this.reportService.getReportInstances(limit);
  }

  @Post('reports/generate/:definitionId')
  @ApiOperation({ summary: '手动生成报告' })
  async generateReport(
    @Param('definitionId') definitionId: string,
    @Body() body: { format?: string },
  ) {
    const format = body.format as any || 'html';
    const report = await this.reportService.triggerReportGeneration(definitionId, format);
    return {
      success: !!report,
      reportId: report?.id,
      status: report?.status,
    };
  }

  @Get('dashboard')
  @ApiOperation({ summary: '获取监控仪表板数据' })
  async getDashboardData() {
    const apmStatus = this.apmService.getStatus();
    const metricsStats = this.metricsCollector.getMetricsStats();
    const activeAlerts = this.alertRuleService.getActiveAlerts();
    const alertHistory = this.alertRuleService.getAlertHistory(50);
    const recentReports = this.reportService.getReportInstances(10);

    // 获取关键指标
    const keyMetrics = await this.getKeyMetrics();

    return {
      timestamp: new Date().toISOString(),
      overview: {
        apmStatus: apmStatus.initialized ? '健康' : '异常',
        metricsCollected: metricsStats.totalDataPoints,
        activeAlertsCount: activeAlerts.length,
        systemHealth: this.calculateSystemHealth(activeAlerts),
      },
      keyMetrics,
      alerts: {
        active: activeAlerts.slice(0, 10),
        recent: alertHistory.slice(0, 10),
      },
      reports: recentReports,
    };
  }

  /**
   * 获取关键指标
   */
  private async getKeyMetrics() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 这里简化实现，实际应从指标收集器获取
    return {
      httpRequests: { current: 1200, change: 5.2 },
      errorRate: { current: 0.02, change: -0.5 },
      responseTime: { current: 150, change: -2.1 },
      activeUsers: { current: 85, change: 3.7 },
      cpuUsage: { current: 45, change: 1.2 },
      memoryUsage: { current: 62, change: -0.8 },
    };
  }

  /**
   * 计算系统健康度
   */
  private calculateSystemHealth(activeAlerts: any[]): string {
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
    const errorAlerts = activeAlerts.filter(a => a.severity === 'error').length;

    if (criticalAlerts > 0) {
      return '危险';
    } else if (errorAlerts > 0) {
      return '警告';
    } else {
      return '健康';
    }
  }
}