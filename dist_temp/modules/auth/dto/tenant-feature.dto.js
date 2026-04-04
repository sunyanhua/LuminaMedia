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
exports.BatchDisableFeaturesDto = exports.BatchEnableFeaturesDto = exports.DisableFeatureForTenantDto = exports.EnableFeatureForTenantDto = void 0;
const class_validator_1 = require("class-validator");
class EnableFeatureForTenantDto {
    tenantId;
    featureKey;
    quotaConfig;
}
exports.EnableFeatureForTenantDto = EnableFeatureForTenantDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnableFeatureForTenantDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnableFeatureForTenantDto.prototype, "featureKey", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], EnableFeatureForTenantDto.prototype, "quotaConfig", void 0);
class DisableFeatureForTenantDto {
    tenantId;
    featureKey;
}
exports.DisableFeatureForTenantDto = DisableFeatureForTenantDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DisableFeatureForTenantDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DisableFeatureForTenantDto.prototype, "featureKey", void 0);
class BatchEnableFeaturesDto {
    tenantId;
    featureKeys;
    quotaConfig;
}
exports.BatchEnableFeaturesDto = BatchEnableFeaturesDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BatchEnableFeaturesDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], BatchEnableFeaturesDto.prototype, "featureKeys", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], BatchEnableFeaturesDto.prototype, "quotaConfig", void 0);
class BatchDisableFeaturesDto {
    tenantId;
    featureKeys;
}
exports.BatchDisableFeaturesDto = BatchDisableFeaturesDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BatchDisableFeaturesDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], BatchDisableFeaturesDto.prototype, "featureKeys", void 0);
//# sourceMappingURL=tenant-feature.dto.js.map