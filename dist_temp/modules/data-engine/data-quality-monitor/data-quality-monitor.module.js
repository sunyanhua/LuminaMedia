"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataQualityMonitorModule = void 0;
const common_1 = require("@nestjs/common");
const data_quality_monitor_service_1 = require("./data-quality-monitor.service");
const data_quality_monitor_controller_1 = require("./data-quality-monitor.controller");
const typeorm_1 = require("@nestjs/typeorm");
const data_quality_rule_entity_1 = require("./entities/data-quality-rule.entity");
const data_quality_result_entity_1 = require("./entities/data-quality-result.entity");
let DataQualityMonitorModule = class DataQualityMonitorModule {
};
exports.DataQualityMonitorModule = DataQualityMonitorModule;
exports.DataQualityMonitorModule = DataQualityMonitorModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([data_quality_rule_entity_1.DataQualityRule, data_quality_result_entity_1.DataQualityResult])],
        controllers: [data_quality_monitor_controller_1.DataQualityMonitorController],
        providers: [data_quality_monitor_service_1.DataQualityMonitorService],
        exports: [data_quality_monitor_service_1.DataQualityMonitorService],
    })
], DataQualityMonitorModule);
//# sourceMappingURL=data-quality-monitor.module.js.map