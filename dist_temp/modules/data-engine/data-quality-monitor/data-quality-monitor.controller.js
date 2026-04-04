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
exports.DataQualityMonitorController = void 0;
const common_1 = require("@nestjs/common");
const data_quality_monitor_service_1 = require("./data-quality-monitor.service");
const create_data_quality_rule_dto_1 = require("./dto/create-data-quality-rule.dto");
const update_data_quality_rule_dto_1 = require("./dto/update-data-quality-rule.dto");
let DataQualityMonitorController = class DataQualityMonitorController {
    dataQualityMonitorService;
    constructor(dataQualityMonitorService) {
        this.dataQualityMonitorService = dataQualityMonitorService;
    }
    createRule(createDataQualityRuleDto) {
        return this.dataQualityMonitorService.createRule(createDataQualityRuleDto);
    }
    getRules() {
        return this.dataQualityMonitorService.getRules();
    }
    getRule(id) {
        return this.dataQualityMonitorService
            .getRules()
            .then((rules) => rules.find((r) => r.id === id));
    }
    updateRule(id, updateDataQualityRuleDto) {
        return this.dataQualityMonitorService.updateRule(id, updateDataQualityRuleDto);
    }
    deleteRule(id) {
        return this.dataQualityMonitorService.deleteRule(id);
    }
    executeAllRules() {
        return this.dataQualityMonitorService.executeAllRules();
    }
    executeRule(ruleId) {
        return this.dataQualityMonitorService.getRules().then((rules) => {
            const rule = rules.find((r) => r.id === ruleId);
            if (!rule) {
                throw new Error(`Rule ${ruleId} not found`);
            }
            return this.dataQualityMonitorService.executeRule(rule);
        });
    }
    getRecentResults(limit = 100) {
        return this.dataQualityMonitorService.getRecentResults(limit);
    }
    getRuleCompliance(ruleId, days = 30) {
        return this.dataQualityMonitorService.getRuleCompliance(ruleId, days);
    }
    triggerDailyScan() {
        return this.dataQualityMonitorService.scheduleDailyScan();
    }
};
exports.DataQualityMonitorController = DataQualityMonitorController;
__decorate([
    (0, common_1.Post)('rules'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_data_quality_rule_dto_1.CreateDataQualityRuleDto]),
    __metadata("design:returntype", void 0)
], DataQualityMonitorController.prototype, "createRule", null);
__decorate([
    (0, common_1.Get)('rules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DataQualityMonitorController.prototype, "getRules", null);
__decorate([
    (0, common_1.Get)('rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DataQualityMonitorController.prototype, "getRule", null);
__decorate([
    (0, common_1.Patch)('rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_data_quality_rule_dto_1.UpdateDataQualityRuleDto]),
    __metadata("design:returntype", void 0)
], DataQualityMonitorController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Delete)('rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DataQualityMonitorController.prototype, "deleteRule", null);
__decorate([
    (0, common_1.Post)('execute/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DataQualityMonitorController.prototype, "executeAllRules", null);
__decorate([
    (0, common_1.Post)('execute/:ruleId'),
    __param(0, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DataQualityMonitorController.prototype, "executeRule", null);
__decorate([
    (0, common_1.Get)('results'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DataQualityMonitorController.prototype, "getRecentResults", null);
__decorate([
    (0, common_1.Get)('compliance/:ruleId'),
    __param(0, (0, common_1.Param)('ruleId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], DataQualityMonitorController.prototype, "getRuleCompliance", null);
__decorate([
    (0, common_1.Post)('scan/daily'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DataQualityMonitorController.prototype, "triggerDailyScan", null);
exports.DataQualityMonitorController = DataQualityMonitorController = __decorate([
    (0, common_1.Controller)('data-quality-monitor'),
    __metadata("design:paramtypes", [data_quality_monitor_service_1.DataQualityMonitorService])
], DataQualityMonitorController);
//# sourceMappingURL=data-quality-monitor.controller.js.map