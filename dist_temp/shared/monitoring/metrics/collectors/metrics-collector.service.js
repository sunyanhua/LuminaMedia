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
var MetricsCollectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollectorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const skywalking_apm_service_1 = require("../../apm/skywalking/skywalking-apm.service");
const metrics_interface_1 = require("../../interfaces/metrics.interface");
let MetricsCollectorService = MetricsCollectorService_1 = class MetricsCollectorService {
    configService;
    apmService;
    logger = new common_1.Logger(MetricsCollectorService_1.name);
    metrics = new Map();
    businessMetrics = [...metrics_interface_1.PREDEFINED_METRICS];
    maxStoragePoints = 1000;
    constructor(configService, apmService) {
        this.configService = configService;
        this.apmService = apmService;
        this.initializeMetrics();
    }
    initializeMetrics() {
        this.businessMetrics.forEach((metric) => {
            this.metrics.set(metric.name, []);
        });
        this.logger.log(`Initialized ${this.businessMetrics.length} business metrics`);
    }
    async record(metric) {
        try {
            this.storeMetric(metric);
            this.apmService.recordMetric(metric.name, metric.value, metric.tags);
            if (this.configService.get('NODE_ENV') === 'development') {
                this.logger.debug(`Metric recorded: ${metric.name}=${metric.value}`, metric.tags);
            }
        }
        catch (error) {
            this.logger.error(`Failed to record metric: ${metric.name}`, error);
        }
    }
    async recordBusinessMetric(name, value, tags) {
        const metricDef = this.businessMetrics.find((m) => m.name === name);
        if (!metricDef) {
            this.logger.warn(`Unknown business metric: ${name}`);
            return;
        }
        const metricValue = {
            name,
            value,
            timestamp: new Date(),
            tags: { ...metricDef.defaultTags, ...tags },
            type: metricDef.type,
        };
        await this.record(metricValue);
    }
    async getMetric(name, tags) {
        const metrics = this.metrics.get(name);
        if (!metrics || metrics.length === 0) {
            return null;
        }
        if (tags && Object.keys(tags).length > 0) {
            const filtered = metrics.filter((m) => this.matchTags(m.tags, tags));
            if (filtered.length === 0) {
                return null;
            }
            return filtered[filtered.length - 1];
        }
        return metrics[metrics.length - 1];
    }
    async getTimeSeries(name, startTime, endTime, tags) {
        const metrics = this.metrics.get(name);
        if (!metrics) {
            return [];
        }
        let filtered = metrics.filter((m) => m.timestamp >= startTime && m.timestamp <= endTime);
        if (tags && Object.keys(tags).length > 0) {
            filtered = filtered.filter((m) => this.matchTags(m.tags, tags));
        }
        return filtered;
    }
    getMetrics() {
        return [...this.businessMetrics];
    }
    registerBusinessMetric(metric) {
        const existingIndex = this.businessMetrics.findIndex((m) => m.name === metric.name);
        if (existingIndex >= 0) {
            this.businessMetrics[existingIndex] = metric;
            this.logger.debug(`Updated business metric: ${metric.name}`);
        }
        else {
            this.businessMetrics.push(metric);
            this.metrics.set(metric.name, []);
            this.logger.debug(`Registered new business metric: ${metric.name}`);
        }
    }
    async recordHttpRequest(method, path, statusCode, durationMs) {
        const tags = {
            method,
            path,
            status_code: statusCode.toString(),
        };
        await this.recordBusinessMetric('http_requests_total', 1, tags);
        await this.recordBusinessMetric('http_request_duration_ms', durationMs, tags);
        if (statusCode >= 400) {
            await this.recordBusinessMetric('http_errors_total', 1, tags);
        }
    }
    async recordDatabaseQuery(operation, table, durationMs, success) {
        const tags = {
            operation,
            table,
            success: success.toString(),
        };
        await this.recordBusinessMetric('database_queries_total', 1, tags);
        await this.recordBusinessMetric('database_query_duration_ms', durationMs, tags);
    }
    async recordAiRequest(provider, model, durationMs, success) {
        const tags = {
            provider,
            model,
            success: success.toString(),
        };
        await this.recordBusinessMetric('ai_requests_total', 1, tags);
        await this.recordBusinessMetric('ai_request_duration_ms', durationMs, tags);
    }
    storeMetric(metric) {
        const storedMetrics = this.metrics.get(metric.name) || [];
        storedMetrics.push({
            ...metric,
            id: `${metric.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
        if (storedMetrics.length > this.maxStoragePoints) {
            storedMetrics.splice(0, storedMetrics.length - this.maxStoragePoints);
        }
        this.metrics.set(metric.name, storedMetrics);
    }
    matchTags(metricTags, filterTags) {
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
    getMetricsStats() {
        let totalDataPoints = 0;
        this.metrics.forEach((metrics) => {
            totalDataPoints += metrics.length;
        });
        return {
            totalMetrics: this.metrics.size,
            metricNames: Array.from(this.metrics.keys()),
            totalDataPoints,
        };
    }
};
exports.MetricsCollectorService = MetricsCollectorService;
exports.MetricsCollectorService = MetricsCollectorService = MetricsCollectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        skywalking_apm_service_1.SkywalkingApmService])
], MetricsCollectorService);
//# sourceMappingURL=metrics-collector.service.js.map