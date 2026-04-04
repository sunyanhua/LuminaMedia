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
var ScalingMetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalingMetricsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const metrics_collector_service_1 = require("../../metrics/collectors/metrics-collector.service");
const autoscaling_interface_1 = require("../interfaces/autoscaling.interface");
let ScalingMetricsService = ScalingMetricsService_1 = class ScalingMetricsService {
    configService;
    metricsCollector;
    logger = new common_1.Logger(ScalingMetricsService_1.name);
    constructor(configService, metricsCollector) {
        this.configService = configService;
        this.metricsCollector = metricsCollector;
    }
    async getMetricValue(metric) {
        try {
            switch (metric.type) {
                case autoscaling_interface_1.ScalingMetricType.RESOURCE:
                    return await this.getResourceMetric(metric);
                case autoscaling_interface_1.ScalingMetricType.POD:
                    return await this.getPodMetric(metric);
                case autoscaling_interface_1.ScalingMetricType.OBJECT:
                    return await this.getObjectMetric(metric);
                case autoscaling_interface_1.ScalingMetricType.BUSINESS:
                    return await this.getBusinessMetric(metric);
                default:
                    throw new Error(`不支持的指标类型: ${metric.type}`);
            }
        }
        catch (error) {
            this.logger.error(`获取指标值失败: ${metric.name}`, error.stack);
            throw error;
        }
    }
    async getResourceMetric(metric) {
        const resourceName = metric.source?.resourceName;
        if (!resourceName) {
            throw new Error('资源指标必须指定resourceName');
        }
        switch (resourceName) {
            case 'cpu':
                return await this.getSimulatedCpuUsage();
            case 'memory':
                return await this.getSimulatedMemoryUsage();
            default:
                throw new Error(`不支持的资源类型: ${resourceName}`);
        }
    }
    async getPodMetric(metric) {
        const selector = metric.source?.selector;
        if (!selector || !selector.metric) {
            throw new Error('Pod指标必须指定selector.metric');
        }
        if (!this.metricsCollector) {
            this.logger.warn(`指标收集器不可用，使用模拟数据: ${selector.metric}`);
            return await this.getSimulatedPodMetric(selector.metric);
        }
        const metricName = selector.metric;
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        try {
            const timeSeries = await this.metricsCollector.getTimeSeries(metricName, fiveMinutesAgo, now, selector);
            if (timeSeries.length === 0) {
                this.logger.warn(`未找到指标数据: ${metricName}`);
                return 0;
            }
            const values = timeSeries.map((ts) => ts.value);
            const sum = values.reduce((a, b) => a + b, 0);
            return sum / values.length;
        }
        catch (error) {
            this.logger.warn(`从指标收集器获取数据失败，使用模拟数据: ${metricName}`, error.message);
            return await this.getSimulatedPodMetric(metricName);
        }
    }
    async getObjectMetric(metric) {
        this.logger.warn(`对象指标 ${metric.name} 使用模拟实现`);
        return await this.getSimulatedObjectMetric(metric.name);
    }
    async getBusinessMetric(metric) {
        switch (metric.name) {
            case 'active_users':
                return await this.getSimulatedActiveUsers();
            case 'queue_length':
                return await this.getSimulatedQueueLength();
            default:
                return await this.getSimulatedBusinessMetric(metric.name);
        }
    }
    async getSimulatedCpuUsage() {
        const baseUsage = 50;
        const timeFactor = Math.sin(Date.now() / 60000);
        const randomFactor = Math.random() * 20 - 10;
        return Math.max(10, Math.min(95, baseUsage + timeFactor * 10 + randomFactor));
    }
    async getSimulatedMemoryUsage() {
        const baseUsage = 60;
        const timeFactor = Math.cos(Date.now() / 90000);
        const randomFactor = Math.random() * 15 - 7.5;
        return Math.max(20, Math.min(90, baseUsage + timeFactor * 8 + randomFactor));
    }
    async getSimulatedPodMetric(metricName) {
        const simulatedValues = {
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
    async getSimulatedObjectMetric(metricName) {
        return 100 + Math.random() * 100;
    }
    async getSimulatedActiveUsers() {
        const hour = new Date().getHours();
        let baseUsers = 500;
        if ((hour >= 10 && hour < 12) ||
            (hour >= 14 && hour < 16) ||
            (hour >= 20 && hour < 22)) {
            baseUsers = 1200;
        }
        else if (hour >= 0 && hour < 6) {
            baseUsers = 100;
        }
        const randomFactor = Math.random() * 200 - 100;
        return Math.max(0, baseUsers + randomFactor);
    }
    async getSimulatedQueueLength() {
        const hour = new Date().getHours();
        let baseLength = 50;
        if ((hour >= 9 && hour < 12) || (hour >= 14 && hour < 18)) {
            baseLength = 150;
        }
        const randomFactor = Math.random() * 50 - 25;
        return Math.max(0, baseLength + randomFactor);
    }
    async getSimulatedBusinessMetric(metricName) {
        return 100 + Math.random() * 200;
    }
    async getMetricValues(metrics) {
        const results = [];
        for (const metric of metrics) {
            try {
                const value = await this.getMetricValue(metric);
                results.push({ metric, value });
            }
            catch (error) {
                this.logger.error(`获取指标 ${metric.name} 失败`, error.stack);
                results.push({ metric, value: 0 });
            }
        }
        return results;
    }
    async isMetricAvailable(metric) {
        try {
            await this.getMetricValue(metric);
            return true;
        }
        catch (error) {
            return false;
        }
    }
};
exports.ScalingMetricsService = ScalingMetricsService;
exports.ScalingMetricsService = ScalingMetricsService = ScalingMetricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [config_1.ConfigService,
        metrics_collector_service_1.MetricsCollectorService])
], ScalingMetricsService);
//# sourceMappingURL=scaling-metrics.service.js.map