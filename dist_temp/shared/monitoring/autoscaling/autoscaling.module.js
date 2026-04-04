"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoscalingModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const scaling_metrics_service_1 = require("./services/scaling-metrics.service");
const kubernetes_scaling_provider_service_1 = require("./integrations/kubernetes-scaling-provider.service");
const scaling_decision_engine_service_1 = require("./services/scaling-decision-engine.service");
const scaling_event_monitor_service_1 = require("./services/scaling-event-monitor.service");
const autoscaling_controller_1 = require("./controllers/autoscaling.controller");
let AutoscalingModule = class AutoscalingModule {
};
exports.AutoscalingModule = AutoscalingModule;
exports.AutoscalingModule = AutoscalingModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, schedule_1.ScheduleModule.forRoot()],
        controllers: [autoscaling_controller_1.AutoscalingController],
        providers: [
            scaling_metrics_service_1.ScalingMetricsService,
            kubernetes_scaling_provider_service_1.KubernetesScalingProvider,
            scaling_decision_engine_service_1.ScalingDecisionEngine,
            scaling_event_monitor_service_1.ScalingEventMonitor,
        ],
        exports: [
            scaling_metrics_service_1.ScalingMetricsService,
            kubernetes_scaling_provider_service_1.KubernetesScalingProvider,
            scaling_decision_engine_service_1.ScalingDecisionEngine,
            scaling_event_monitor_service_1.ScalingEventMonitor,
        ],
    })
], AutoscalingModule);
//# sourceMappingURL=autoscaling.module.js.map