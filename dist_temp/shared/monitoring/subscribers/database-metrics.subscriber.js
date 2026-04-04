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
var DatabaseMetricsSubscriber_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseMetricsSubscriber = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const metrics_collector_service_1 = require("../metrics/collectors/metrics-collector.service");
let DatabaseMetricsSubscriber = DatabaseMetricsSubscriber_1 = class DatabaseMetricsSubscriber {
    metricsCollector;
    logger = new common_1.Logger(DatabaseMetricsSubscriber_1.name);
    queryStartTimes = new WeakMap();
    constructor(metricsCollector) {
        this.metricsCollector = metricsCollector;
    }
    beforeQuery(event) {
        if (event.queryRunner) {
            this.queryStartTimes.set(event.queryRunner, Date.now());
        }
    }
    afterQuery(event) {
        const queryRunner = event.queryRunner;
        const startTime = queryRunner
            ? this.queryStartTimes.get(queryRunner)
            : undefined;
        if (startTime) {
            const duration = Date.now() - startTime;
            this.metricsCollector
                .recordDatabaseQuery('query', 'unknown', duration, true)
                .catch((error) => {
                this.logger.error('Failed to record database query metric', error);
            });
            if (queryRunner) {
                this.queryStartTimes.delete(queryRunner);
            }
        }
    }
    beforeInsert(event) {
        this.queryStartTimes.set(event.queryRunner, Date.now());
    }
    afterInsert(event) {
        this.recordOperationMetric(event.queryRunner, 'insert', event.metadata.tableName);
    }
    beforeUpdate(event) {
        this.queryStartTimes.set(event.queryRunner, Date.now());
    }
    afterUpdate(event) {
        this.recordOperationMetric(event.queryRunner, 'update', event.metadata.tableName);
    }
    beforeRemove(event) {
        this.queryStartTimes.set(event.queryRunner, Date.now());
    }
    afterRemove(event) {
        this.recordOperationMetric(event.queryRunner, 'delete', event.metadata.tableName);
    }
    recordOperationMetric(queryRunner, operation, table) {
        const startTime = this.queryStartTimes.get(queryRunner);
        if (startTime) {
            const duration = Date.now() - startTime;
            this.metricsCollector
                .recordDatabaseQuery(operation, table, duration, true)
                .catch((error) => {
                this.logger.error('Failed to record database operation metric', error);
            });
            this.queryStartTimes.delete(queryRunner);
        }
    }
    recordSlowQueryWarning(duration, operation, table) {
        if (duration > 1000) {
            this.logger.warn(`Slow database ${operation} on ${table}: ${duration}ms`);
            this.metricsCollector
                .recordBusinessMetric('database_slow_queries_total', 1, {
                operation,
                table,
            })
                .catch((error) => {
                this.logger.debug('Failed to record slow query metric', error);
            });
        }
    }
};
exports.DatabaseMetricsSubscriber = DatabaseMetricsSubscriber;
exports.DatabaseMetricsSubscriber = DatabaseMetricsSubscriber = DatabaseMetricsSubscriber_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, typeorm_1.EventSubscriber)(),
    __metadata("design:paramtypes", [metrics_collector_service_1.MetricsCollectorService])
], DatabaseMetricsSubscriber);
//# sourceMappingURL=database-metrics.subscriber.js.map