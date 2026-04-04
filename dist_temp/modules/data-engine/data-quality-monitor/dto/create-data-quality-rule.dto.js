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
exports.CreateDataQualityRuleDto = exports.RuleSeverity = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var RuleSeverity;
(function (RuleSeverity) {
    RuleSeverity["INFO"] = "info";
    RuleSeverity["WARNING"] = "warning";
    RuleSeverity["ERROR"] = "error";
})(RuleSeverity || (exports.RuleSeverity = RuleSeverity = {}));
class CreateDataQualityRuleDto {
    name;
    tableName;
    fieldName;
    condition;
    threshold;
    severity;
    description;
    isActive = true;
    schedule;
}
exports.CreateDataQualityRuleDto = CreateDataQualityRuleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '规则名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDataQualityRuleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '表名' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDataQualityRuleDto.prototype, "tableName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '字段名', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDataQualityRuleDto.prototype, "fieldName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'SQL条件表达式，如 "mobile IS NOT NULL AND LENGTH(mobile) = 11"',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDataQualityRuleDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '阈值，例如0.95表示完整度需≥95%' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDataQualityRuleDto.prototype, "threshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '严重程度', enum: RuleSeverity }),
    (0, class_validator_1.IsEnum)(RuleSeverity),
    __metadata("design:type", String)
], CreateDataQualityRuleDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '规则描述', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDataQualityRuleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否启用', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDataQualityRuleDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '检查频率（cron表达式），如 "0 0 * * *" 表示每天零点',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDataQualityRuleDto.prototype, "schedule", void 0);
//# sourceMappingURL=create-data-quality-rule.dto.js.map