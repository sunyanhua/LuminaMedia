import { SkywalkingApmService } from '../apm/skywalking/skywalking-apm.service';
import { MetricsCollectorService } from '../metrics/collectors/metrics-collector.service';
import { AlertRuleService } from '../alerts/rules/alert-rule.service';
import { PerformanceReportService } from '../reports/performance-report.service';
export declare class MonitoringController {
    private apmService;
    private metricsCollector;
    private alertRuleService;
    private reportService;
    constructor(apmService: SkywalkingApmService, metricsCollector: MetricsCollectorService, alertRuleService: AlertRuleService, reportService: PerformanceReportService);
    getHealth(): {
        status: string;
        timestamp: string;
        components: {
            apm: string;
            metrics: string;
            alerts: string;
            reports: string;
        };
        stats: {
            metricsCollected: number;
            activeAlerts: number;
            reportDefinitions: number;
        };
    };
    getApmStatus(): {
        initialized: boolean;
        serviceName: string;
        enabled: boolean;
    };
    getMetrics(): {
        metrics: import("../interfaces/metrics.interface").BusinessMetric[];
        stats: {
            totalMetrics: number;
            metricNames: string[];
            totalDataPoints: number;
        };
    };
    getMetric(name: string, tags?: string): Promise<import("../interfaces/metrics.interface").MetricValue | null>;
    getMetricTimeSeries(name: string, start: string, end: string, tags?: string): Promise<import("../interfaces/metrics.interface").MetricValue[]>;
    recordMetric(body: {
        name: string;
        value: number;
        tags?: Record<string, string>;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getAlertRules(): import("../interfaces/alerts.interface").AlertRule[];
    getActiveAlerts(): import("../interfaces/alerts.interface").AlertInstance[];
    getAlertHistory(limit?: number): import("../interfaces/alerts.interface").AlertInstance[];
    checkAlertRule(ruleId: string): Promise<{
        triggered: boolean;
        message: string;
    }>;
    getReportDefinitions(): import("../interfaces/reports.interface").ReportDefinition[];
    getReportInstances(limit?: number): import("../interfaces/reports.interface").ReportInstance[];
    generateReport(definitionId: string, body: {
        format?: string;
    }): Promise<{
        success: boolean;
        reportId: string | undefined;
        status: import("../interfaces/reports.interface").ReportStatus | undefined;
    }>;
    getDashboardData(): Promise<{
        timestamp: string;
        overview: {
            apmStatus: string;
            metricsCollected: number;
            activeAlertsCount: number;
            systemHealth: string;
        };
        keyMetrics: {
            httpRequests: {
                current: number;
                change: number;
            };
            errorRate: {
                current: number;
                change: number;
            };
            responseTime: {
                current: number;
                change: number;
            };
            activeUsers: {
                current: number;
                change: number;
            };
            cpuUsage: {
                current: number;
                change: number;
            };
            memoryUsage: {
                current: number;
                change: number;
            };
        };
        alerts: {
            active: import("../interfaces/alerts.interface").AlertInstance[];
            recent: import("../interfaces/alerts.interface").AlertInstance[];
        };
        reports: import("../interfaces/reports.interface").ReportInstance[];
    }>;
    private getKeyMetrics;
    private calculateSystemHealth;
}
