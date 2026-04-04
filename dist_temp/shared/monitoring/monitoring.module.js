"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const core_1 = require("@nestjs/core");
const logging_module_1 = require("./logging/logging.module");
const autoscaling_module_1 = require("./autoscaling/autoscaling.module");
const skywalking_apm_service_1 = require("./apm/skywalking/skywalking-apm.service");
const metrics_collector_service_1 = require("./metrics/collectors/metrics-collector.service");
const alert_rule_service_1 = require("./alerts/rules/alert-rule.service");
const performance_report_service_1 = require("./reports/performance-report.service");
const monitoring_controller_1 = require("./controllers/monitoring.controller");
const http_metrics_interceptor_1 = require("./interceptors/http-metrics.interceptor");
const database_metrics_subscriber_1 = require("./subscribers/database-metrics.subscriber");
let MonitoringModule = class MonitoringModule {
};
exports.MonitoringModule = MonitoringModule;
exports.MonitoringModule = MonitoringModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            schedule_1.ScheduleModule.forRoot(),
            logging_module_1.LoggingModule,
            autoscaling_module_1.AutoscalingModule,
        ],
        controllers: [monitoring_controller_1.MonitoringController],
        providers: [
            skywalking_apm_service_1.SkywalkingApmService,
            metrics_collector_service_1.MetricsCollectorService,
            alert_rule_service_1.AlertRuleService,
            performance_report_service_1.PerformanceReportService,
            database_metrics_subscriber_1.DatabaseMetricsSubscriber,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: http_metrics_interceptor_1.HttpMetricsInterceptor,
            },
        ],
        exports: [
            skywalking_apm_service_1.SkywalkingApmService,
            metrics_collector_service_1.MetricsCollectorService,
            alert_rule_service_1.AlertRuleService,
            performance_report_service_1.PerformanceReportService,
            logging_module_1.LoggingModule,
            autoscaling_module_1.AutoscalingModule,
        ],
    })
], MonitoringModule);
//# sourceMappingURL=monitoring.module.js.map