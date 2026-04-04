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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const skywalking_apm_service_1 = require("../apm/skywalking/skywalking-apm.service");
const metrics_collector_service_1 = require("../metrics/collectors/metrics-collector.service");
const alert_rule_service_1 = require("../alerts/rules/alert-rule.service");
const performance_report_service_1 = require("../reports/performance-report.service");
let MonitoringController = class MonitoringController {
    apmService;
    metricsCollector;
    alertRuleService;
    reportService;
    constructor(apmService, metricsCollector, alertRuleService, reportService) {
        this.apmService = apmService;
        this.metricsCollector = metricsCollector;
        this.alertRuleService = alertRuleService;
        this.reportService = reportService;
    }
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
    getApmStatus() {
        return this.apmService.getStatus();
    }
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
    async getMetric(name, tags) {
        const parsedTags = tags ? JSON.parse(tags) : undefined;
        return this.metricsCollector.getMetric(name, parsedTags);
    }
    async getMetricTimeSeries(name, start, end, tags) {
        const startTime = new Date(start);
        const endTime = new Date(end);
        const parsedTags = tags ? JSON.parse(tags) : undefined;
        return this.metricsCollector.getTimeSeries(name, startTime, endTime, parsedTags);
    }
    async recordMetric(body) {
        await this.metricsCollector.recordBusinessMetric(body.name, body.value, body.tags);
        return { success: true, message: 'Metric recorded' };
    }
    getAlertRules() {
        return this.alertRuleService.getRules();
    }
    getActiveAlerts() {
        return this.alertRuleService.getActiveAlerts();
    }
    getAlertHistory(limit = 100) {
        return this.alertRuleService.getAlertHistory(limit);
    }
    async checkAlertRule(ruleId) {
        const triggered = await this.alertRuleService.checkRule(ruleId);
        return { triggered, message: triggered ? 'Alert triggered' : 'No alert' };
    }
    getReportDefinitions() {
        return this.reportService.getReportDefinitions();
    }
    getReportInstances(limit = 100) {
        return this.reportService.getReportInstances(limit);
    }
    async generateReport(definitionId, body) {
        const format = body.format || 'html';
        const report = await this.reportService.triggerReportGeneration(definitionId, format);
        return {
            success: !!report,
            reportId: report?.id,
            status: report?.status,
        };
    }
    async getDashboardData() {
        const apmStatus = this.apmService.getStatus();
        const metricsStats = this.metricsCollector.getMetricsStats();
        const activeAlerts = this.alertRuleService.getActiveAlerts();
        const alertHistory = this.alertRuleService.getAlertHistory(50);
        const recentReports = this.reportService.getReportInstances(10);
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
    async getKeyMetrics() {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        return {
            httpRequests: { current: 1200, change: 5.2 },
            errorRate: { current: 0.02, change: -0.5 },
            responseTime: { current: 150, change: -2.1 },
            activeUsers: { current: 85, change: 3.7 },
            cpuUsage: { current: 45, change: 1.2 },
            memoryUsage: { current: 62, change: -0.8 },
        };
    }
    calculateSystemHealth(activeAlerts) {
        const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical').length;
        const errorAlerts = activeAlerts.filter((a) => a.severity === 'error').length;
        if (criticalAlerts > 0) {
            return '危险';
        }
        else if (errorAlerts > 0) {
            return '警告';
        }
        else {
            return '健康';
        }
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: '监控系统健康检查' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '监控系统运行正常' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('apm/status'),
    (0, swagger_1.ApiOperation)({ summary: '获取APM状态' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getApmStatus", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: '获取指标列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('metrics/:name'),
    (0, swagger_1.ApiOperation)({ summary: '获取指定指标值' }),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, common_1.Query)('tags')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getMetric", null);
__decorate([
    (0, common_1.Get)('metrics/:name/time-series'),
    (0, swagger_1.ApiOperation)({ summary: '获取指标时间序列' }),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __param(3, (0, common_1.Query)('tags')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getMetricTimeSeries", null);
__decorate([
    (0, common_1.Post)('metrics/record'),
    (0, swagger_1.ApiOperation)({ summary: '手动记录指标' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "recordMetric", null);
__decorate([
    (0, common_1.Get)('alerts/rules'),
    (0, swagger_1.ApiOperation)({ summary: '获取告警规则列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getAlertRules", null);
__decorate([
    (0, common_1.Get)('alerts/active'),
    (0, swagger_1.ApiOperation)({ summary: '获取活跃告警' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getActiveAlerts", null);
__decorate([
    (0, common_1.Get)('alerts/history'),
    (0, swagger_1.ApiOperation)({ summary: '获取告警历史' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getAlertHistory", null);
__decorate([
    (0, common_1.Post)('alerts/rules/:ruleId/check'),
    (0, swagger_1.ApiOperation)({ summary: '手动检查告警规则' }),
    __param(0, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "checkAlertRule", null);
__decorate([
    (0, common_1.Get)('reports/definitions'),
    (0, swagger_1.ApiOperation)({ summary: '获取报告定义' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getReportDefinitions", null);
__decorate([
    (0, common_1.Get)('reports/instances'),
    (0, swagger_1.ApiOperation)({ summary: '获取报告实例' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getReportInstances", null);
__decorate([
    (0, common_1.Post)('reports/generate/:definitionId'),
    (0, swagger_1.ApiOperation)({ summary: '手动生成报告' }),
    __param(0, (0, common_1.Param)('definitionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: '获取监控仪表板数据' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getDashboardData", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, swagger_1.ApiTags)('monitoring'),
    (0, common_1.Controller)('monitoring'),
    __metadata("design:paramtypes", [skywalking_apm_service_1.SkywalkingApmService,
        metrics_collector_service_1.MetricsCollectorService,
        alert_rule_service_1.AlertRuleService,
        performance_report_service_1.PerformanceReportService])
], MonitoringController);
//# sourceMappingURL=monitoring.controller.js.map