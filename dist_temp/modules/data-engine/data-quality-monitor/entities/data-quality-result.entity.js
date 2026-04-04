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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataQualityResult = void 0;
const typeorm_1 = require("typeorm");
let DataQualityResult = class DataQualityResult {
    id;
    ruleId;
    ruleName;
    tableName;
    fieldName;
    metricValue;
    threshold;
    severity;
    passed;
    executionTime;
    details;
};
exports.DataQualityResult = DataQualityResult;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DataQualityResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rule_id', length: 36 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DataQualityResult.prototype, "ruleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rule_name', length: 200 }),
    __metadata("design:type", String)
], DataQualityResult.prototype, "ruleName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'table_name', length: 100 }),
    __metadata("design:type", String)
], DataQualityResult.prototype, "tableName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'field_name', length: 100, nullable: true }),
    __metadata("design:type", Object)
], DataQualityResult.prototype, "fieldName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metric_value', type: 'decimal', precision: 10, scale: 6 }),
    __metadata("design:type", Number)
], DataQualityResult.prototype, "metricValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 3 }),
    __metadata("design:type", Number)
], DataQualityResult.prototype, "threshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], DataQualityResult.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean' }),
    __metadata("design:type", Boolean)
], DataQualityResult.prototype, "passed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'execution_time', type: 'timestamp' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], DataQualityResult.prototype, "executionTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DataQualityResult.prototype, "details", void 0);
exports.DataQualityResult = DataQualityResult = __decorate([
    (0, typeorm_1.Entity)('data_quality_results')
], DataQualityResult);
//# sourceMappingURL=data-quality-result.entity.js.map