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
var HttpMetricsInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpMetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const metrics_collector_service_1 = require("../metrics/collectors/metrics-collector.service");
let HttpMetricsInterceptor = HttpMetricsInterceptor_1 = class HttpMetricsInterceptor {
    metricsCollector;
    logger = new common_1.Logger(HttpMetricsInterceptor_1.name);
    excludedPaths = ['/health', '/metrics', '/monitoring'];
    constructor(metricsCollector) {
        this.metricsCollector = metricsCollector;
    }
    intercept(context, next) {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const response = httpContext.getResponse();
        if (this.shouldExclude(request.path)) {
            return next.handle();
        }
        const startTime = Date.now();
        const method = request.method;
        const path = this.normalizePath(request.path);
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const duration = Date.now() - startTime;
                const statusCode = response.statusCode;
                this.metricsCollector
                    .recordHttpRequest(method, path, statusCode, duration)
                    .catch((error) => {
                    this.logger.error('Failed to record HTTP metrics', error);
                });
                this.metricsCollector
                    .recordBusinessMetric('http_request_duration_ms', duration, {
                    method,
                    path,
                    status_code: statusCode.toString(),
                })
                    .catch((error) => {
                    this.logger.debug('Failed to record APM metric', error);
                });
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                const statusCode = error.status || 500;
                this.metricsCollector
                    .recordHttpRequest(method, path, statusCode, duration)
                    .catch((err) => {
                    this.logger.error('Failed to record HTTP error metrics', err);
                });
            },
        }));
    }
    shouldExclude(path) {
        return this.excludedPaths.some((excluded) => path.startsWith(excluded));
    }
    normalizePath(path) {
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
        const numberRegex = /\d+/g;
        let normalized = path;
        normalized = normalized.replace(uuidRegex, ':id');
        normalized = normalized.replace(numberRegex, ':id');
        return normalized;
    }
};
exports.HttpMetricsInterceptor = HttpMetricsInterceptor;
exports.HttpMetricsInterceptor = HttpMetricsInterceptor = HttpMetricsInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_collector_service_1.MetricsCollectorService])
], HttpMetricsInterceptor);
//# sourceMappingURL=http-metrics.interceptor.js.map