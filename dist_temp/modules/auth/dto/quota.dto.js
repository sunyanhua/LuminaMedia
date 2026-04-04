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
exports.QuotaQueryDto = exports.ResetQuotaDto = exports.UpdateQuotaDto = exports.CreateQuotaDto = void 0;
const class_validator_1 = require("class-validator");
class CreateQuotaDto {
    tenantId;
    featureKey;
    maxCount;
    quotaPeriod;
}
exports.CreateQuotaDto = CreateQuotaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuotaDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuotaDto.prototype, "featureKey", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateQuotaDto.prototype, "maxCount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['daily', 'weekly', 'monthly']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotaDto.prototype, "quotaPeriod", void 0);
class UpdateQuotaDto {
    maxCount;
    quotaPeriod;
}
exports.UpdateQuotaDto = UpdateQuotaDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateQuotaDto.prototype, "maxCount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['daily', 'weekly', 'monthly']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuotaDto.prototype, "quotaPeriod", void 0);
class ResetQuotaDto {
    tenantId;
    featureKey;
}
exports.ResetQuotaDto = ResetQuotaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ResetQuotaDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ResetQuotaDto.prototype, "featureKey", void 0);
class QuotaQueryDto {
    tenantId;
    featureKey;
    quotaPeriod;
    page = 1;
    pageSize = 20;
}
exports.QuotaQueryDto = QuotaQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuotaQueryDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuotaQueryDto.prototype, "featureKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['daily', 'weekly', 'monthly']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuotaQueryDto.prototype, "quotaPeriod", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QuotaQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QuotaQueryDto.prototype, "pageSize", void 0);
//# sourceMappingURL=quota.dto.js.map