"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PerformanceReportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceReportService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const metrics_collector_service_1 = require("../metrics/collectors/metrics-collector.service");
const alert_rule_service_1 = require("../alerts/rules/alert-rule.service");
const reports_interface_1 = require("../interfaces/reports.interface");
let PerformanceReportService = PerformanceReportService_1 = class PerformanceReportService {
    configService;
    metricsCollector;
    alertRuleService;
    logger = new common_1.Logger(PerformanceReportService_1.name);
    reportDefinitions = new Map();
    reportInstances = new Map();
    maxReportInstances = 1000;
    constructor(configService, metricsCollector, alertRuleService) {
        this.configService = configService;
        this.metricsCollector = metricsCollector;
        this.alertRuleService = alertRuleService;
        this.initializeReportDefinitions();
    }
    initializeReportDefinitions() {
        reports_interface_1.PREDEFINED_REPORTS.forEach((definition) => {
            this.reportDefinitions.set(definition.id, definition);
        });
        this.logger.log(`Initialized ${this.reportDefinitions.size} report definitions`);
    }
    async generateDailyPerformanceReport() {
        await this.generateReport('daily_performance', reports_interface_1.ReportFormat.HTML);
    }
    async generateWeeklyBusinessReport() {
        await this.generateReport('weekly_business', reports_interface_1.ReportFormat.HTML);
    }
    async generateMonthlySummaryReport() {
        await this.generateReport('monthly_summary', reports_interface_1.ReportFormat.HTML);
    }
    async generatePerformanceHealthReport() {
        await this.generateReport('performance_health', reports_interface_1.ReportFormat.HTML);
    }
    async generateReport(definitionId, format) {
        const definition = this.reportDefinitions.get(definitionId);
        if (!definition || !definition.enabled) {
            this.logger.warn(`Report definition not found or disabled: ${definitionId}`);
            return null;
        }
        if (!definition.format.includes(format)) {
            this.logger.warn(`Report format ${format} not supported for ${definitionId}`);
            return null;
        }
        const reportId = `${definitionId}_${Date.now()}_${format}`;
        const instance = {
            id: reportId,
            definitionId,
            name: definition.name,
            type: definition.type,
            status: reports_interface_1.ReportStatus.GENERATING,
            format,
            generationStartedAt: new Date(),
        };
        this.reportInstances.set(reportId, instance);
        this.logger.log(`Starting report generation: ${definition.name}`);
        try {
            const content = await this.generateReportContent(definition);
            instance.content = content;
            const filePath = await this.generateReportFile(instance);
            instance.filePath = filePath;
            instance.status = reports_interface_1.ReportStatus.COMPLETED;
            instance.generationCompletedAt = new Date();
            instance.fileSize = this.estimateFileSize(content, format);
            await this.deliverReport(instance, definition);
            this.logger.log(`Report generated successfully: ${definition.name}`);
        }
        catch (error) {
            instance.status = reports_interface_1.ReportStatus.FAILED;
            instance.errorMessage = error.message;
            this.logger.error(`Failed to generate report: ${definition.name}`, error);
        }
        this.reportInstances.set(reportId, instance);
        this.cleanupOldReports();
        return instance;
    }
    async generateReportContent(definition) {
        const now = new Date();
        let startTime;
        const endTime = now;
        switch (definition.type) {
            case reports_interface_1.ReportType.DAILY:
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case reports_interface_1.ReportType.WEEKLY:
                startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case reports_interface_1.ReportType.MONTHLY:
                startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case reports_interface_1.ReportType.PERFORMANCE:
                startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
                break;
            default:
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        const performanceMetrics = await this.collectPerformanceMetrics(startTime, endTime);
        const businessMetrics = await this.collectBusinessMetrics(startTime, endTime);
        const alertStats = await this.collectAlertStatistics(startTime, endTime);
        const issues = await this.identifyIssues(performanceMetrics, businessMetrics);
        const trends = await this.analyzeTrends(startTime, endTime);
        const recommendations = await this.generateRecommendations(issues, trends);
        const content = {
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
    async collectPerformanceMetrics(startTime, endTime) {
        const httpRequestDuration = await this.metricsCollector.getTimeSeries('http_request_duration_ms', startTime, endTime);
        const httpRequests = await this.metricsCollector.getTimeSeries('http_requests_total', startTime, endTime);
        const httpErrors = await this.metricsCollector.getTimeSeries('http_errors_total', startTime, endTime);
        const durationValues = httpRequestDuration.map((m) => m.value);
        const requestCount = httpRequests.reduce((sum, m) => sum + m.value, 0);
        const errorCount = httpErrors.reduce((sum, m) => sum + m.value, 0);
        return {
            responseTimeP95: this.calculatePercentile(durationValues, 95),
            responseTimeP99: this.calculatePercentile(durationValues, 99),
            responseTimeAvg: durationValues.length > 0
                ? durationValues.reduce((sum, val) => sum + val, 0) /
                    durationValues.length
                : 0,
            successRate: requestCount > 0 ? 1 - errorCount / requestCount : 1,
            errorRate: requestCount > 0 ? errorCount / requestCount : 0,
            throughput: this.calculateThroughput(httpRequests, startTime, endTime),
            concurrentUsers: await this.estimateConcurrentUsers(startTime, endTime),
            cpuUsage: await this.estimateCpuUsage(startTime, endTime),
            memoryUsage: await this.estimateMemoryUsage(startTime, endTime),
        };
    }
    async collectBusinessMetrics(startTime, endTime) {
        const activeUsers = await this.metricsCollector.getMetric('active_users');
        const contentPublished = await this.metricsCollector.getTimeSeries('content_published_total', startTime, endTime);
        const aiRequests = await this.metricsCollector.getTimeSeries('ai_requests_total', startTime, endTime);
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
    async collectAlertStatistics(startTime, endTime) {
        const alerts = this.alertRuleService.getAlertHistory(1000);
        const periodAlerts = alerts.filter((alert) => alert.triggeredAt >= startTime && alert.triggeredAt <= endTime);
        const bySeverity = {};
        const ruleCounts = {};
        periodAlerts.forEach((alert) => {
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
    async identifyIssues(performance, business) {
        const issues = [];
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
    async analyzeTrends(startTime, endTime) {
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
    async generateRecommendations(issues, trends) {
        const recommendations = [];
        issues.forEach((issue) => {
            recommendations.push(issue.recommendation);
        });
        trends.forEach((trend) => {
            if (trend.changePercent > 50) {
                recommendations.push(`${trend.metric}增长超过50%，建议关注资源扩容`);
            }
            else if (trend.changePercent < -20) {
                recommendations.push(`${trend.metric}下降超过20%，建议调查原因`);
            }
        });
        recommendations.push('定期检查系统日志，及时发现潜在问题');
        recommendations.push('优化数据库查询，添加必要的索引');
        recommendations.push('考虑实施更细粒度的监控和告警');
        return [...new Set(recommendations)];
    }
    generateSummary(performance, business, issues) {
        const criticalIssues = issues.filter((i) => i.severity === 'critical').length;
        const highIssues = issues.filter((i) => i.severity === 'high').length;
        return (`系统在报告期间整体运行${criticalIssues > 0 ? '存在严重问题' : highIssues > 0 ? '基本稳定' : '良好'}。` +
            `共处理请求约${Math.round(performance.throughput * (24 * 60 * 60))}次，平均响应时间${performance.responseTimeAvg.toFixed(2)}ms，` +
            `成功率${(performance.successRate * 100).toFixed(1)}%。活跃用户${business.activeUsers}人，` +
            `发布内容${business.contentPublished}篇。发现${issues.length}个问题，其中严重问题${criticalIssues}个，高风险问题${highIssues}个。`);
    }
    async generateReportFile(instance) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${instance.definitionId}_${timestamp}.${instance.format}`;
        const filePath = `./reports/${fileName}`;
        this.logger.debug(`Report file would be generated at: ${filePath}`);
        return filePath;
    }
    estimateFileSize(content, format) {
        const jsonSize = JSON.stringify(content).length;
        switch (format) {
            case reports_interface_1.ReportFormat.HTML:
                return jsonSize * 2;
            case reports_interface_1.ReportFormat.PDF:
                return jsonSize * 3;
            case reports_interface_1.ReportFormat.JSON:
                return jsonSize;
            case reports_interface_1.ReportFormat.CSV:
                return jsonSize;
            default:
                return jsonSize;
        }
    }
    async deliverReport(instance, definition) {
        if (!definition.recipients || definition.recipients.length === 0) {
            return;
        }
        this.logger.log(`Report would be delivered to: ${definition.recipients.join(', ')}`);
    }
    cleanupOldReports() {
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
        toDelete.forEach((instance) => {
            this.reportInstances.delete(instance.id);
        });
        this.logger.debug(`Cleaned up ${toDelete.length} old report instances`);
    }
    calculatePercentile(values, percentile) {
        if (values.length === 0) {
            return 0;
        }
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
    }
    calculateThroughput(metrics, startTime, endTime) {
        if (metrics.length === 0) {
            return 0;
        }
        const totalRequests = metrics.reduce((sum, m) => sum + m.value, 0);
        const timeDiff = (endTime.getTime() - startTime.getTime()) / 1000;
        return timeDiff > 0 ? totalRequests / timeDiff : 0;
    }
    async estimateConcurrentUsers(startTime, endTime) {
        return 10;
    }
    async estimateCpuUsage(startTime, endTime) {
        return 30;
    }
    async estimateMemoryUsage(startTime, endTime) {
        return 45;
    }
    async estimateNewUsers(startTime, endTime) {
        return 5;
    }
    async estimateDatabaseQueries(startTime, endTime) {
        return 10000;
    }
    async estimatePublishSuccessRate(startTime, endTime) {
        return 0.92;
    }
    async estimateUserSatisfaction(startTime, endTime) {
        return 4.2;
    }
    getReportDefinitions() {
        return Array.from(this.reportDefinitions.values());
    }
    getReportInstances(limit = 100) {
        const instances = Array.from(this.reportInstances.values());
        return instances
            .sort((a, b) => {
            const aTime = b.generationCompletedAt || b.generationStartedAt || new Date(0);
            const bTime = a.generationCompletedAt || a.generationStartedAt || new Date(0);
            return aTime.getTime() - bTime.getTime();
        })
            .slice(0, limit);
    }
    async triggerReportGeneration(definitionId, format = reports_interface_1.ReportFormat.HTML) {
        return this.generateReport(definitionId, format);
    }
};
exports.PerformanceReportService = PerformanceReportService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceReportService.prototype, "generateDailyPerformanceReport", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_WEEK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceReportService.prototype, "generateWeeklyBusinessReport", null);
__decorate([
    (0, schedule_1.Cron)('0 0 1 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceReportService.prototype, "generateMonthlySummaryReport", null);
__decorate([
    (0, schedule_1.Cron)('0 */6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceReportService.prototype, "generatePerformanceHealthReport", null);
exports.PerformanceReportService = PerformanceReportService = PerformanceReportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        metrics_collector_service_1.MetricsCollectorService,
        alert_rule_service_1.AlertRuleService])
], PerformanceReportService);
//# sourceMappingURL=performance-report.service.js.map