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
exports.TenantFeatureController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const tenant_feature_service_1 = require("../services/tenant-feature.service");
const feature_config_entity_1 = require("../../../entities/feature-config.entity");
const tenant_feature_dto_1 = require("../dto/tenant-feature.dto");
let TenantFeatureController = class TenantFeatureController {
    tenantFeatureService;
    constructor(tenantFeatureService) {
        this.tenantFeatureService = tenantFeatureService;
    }
    async getTenantFeatures(tenantId, featureKey, isEnabled) {
        const features = await this.tenantFeatureService.getTenantFeatures(tenantId);
        let filteredFeatures = features;
        if (featureKey) {
            filteredFeatures = filteredFeatures.filter(f => f.featureKey.includes(featureKey));
        }
        if (isEnabled !== undefined) {
            const enabled = isEnabled === 'true';
            filteredFeatures = filteredFeatures.filter(f => f.isEnabled === enabled);
        }
        return filteredFeatures;
    }
    async getTenantFeature(featureKey, tenantId) {
        const tenantFeature = await this.tenantFeatureService.getTenantFeature(tenantId, featureKey);
        if (!tenantFeature) {
            throw new Error('租户功能配置不存在');
        }
        return tenantFeature;
    }
    async enableTenantFeature(featureKey, enableDto) {
        return await this.tenantFeatureService.enableFeatureForTenant(enableDto.tenantId, featureKey, enableDto.quotaConfig);
    }
    async disableTenantFeature(featureKey, disableDto) {
        return await this.tenantFeatureService.disableFeatureForTenant(disableDto.tenantId, featureKey);
    }
    async batchEnableFeatures(batchEnableDto) {
        const features = batchEnableDto.featureKeys.map(featureKey => ({
            featureKey,
            isEnabled: true,
            quotaConfig: batchEnableDto.quotaConfig,
        }));
        const results = await this.tenantFeatureService.batchSetFeaturesForTenant(batchEnableDto.tenantId, features);
        return { success: true, updated: results.length };
    }
    async batchDisableFeatures(batchDisableDto) {
        const features = batchDisableDto.featureKeys.map(featureKey => ({
            featureKey,
            isEnabled: false,
        }));
        const results = await this.tenantFeatureService.batchSetFeaturesForTenant(batchDisableDto.tenantId, features);
        return { success: true, updated: results.length };
    }
};
exports.TenantFeatureController = TenantFeatureController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '获取租户功能列表',
        description: '返回指定租户的所有功能开关状态',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'tenantId',
        required: true,
        description: '租户ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'featureKey',
        required: false,
        description: '按功能键过滤',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isEnabled',
        required: false,
        description: '按启用状态过滤（true/false）',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取租户功能列表', type: [feature_config_entity_1.TenantFeatureToggle] }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('featureKey')),
    __param(2, (0, common_1.Query)('isEnabled')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TenantFeatureController.prototype, "getTenantFeatures", null);
__decorate([
    (0, common_1.Get)(':featureKey'),
    (0, swagger_1.ApiOperation)({
        summary: '获取租户功能详情',
        description: '获取指定租户特定功能的详细信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'featureKey', description: '功能键', example: 'customer-analytics' }),
    (0, swagger_1.ApiQuery)({
        name: 'tenantId',
        required: true,
        description: '租户ID',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取租户功能详情', type: feature_config_entity_1.TenantFeatureToggle }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '租户功能配置不存在' }),
    __param(0, (0, common_1.Param)('featureKey')),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantFeatureController.prototype, "getTenantFeature", null);
__decorate([
    (0, common_1.Put)(':featureKey/enable'),
    (0, swagger_1.ApiOperation)({
        summary: '启用租户功能',
        description: '为指定租户启用特定功能',
    }),
    (0, swagger_1.ApiParam)({ name: 'featureKey', description: '功能键', example: 'customer-analytics' }),
    (0, swagger_1.ApiBody)({ type: tenant_feature_dto_1.EnableFeatureForTenantDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '功能启用成功', type: feature_config_entity_1.TenantFeatureToggle }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Param)('featureKey')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tenant_feature_dto_1.EnableFeatureForTenantDto]),
    __metadata("design:returntype", Promise)
], TenantFeatureController.prototype, "enableTenantFeature", null);
__decorate([
    (0, common_1.Put)(':featureKey/disable'),
    (0, swagger_1.ApiOperation)({
        summary: '禁用租户功能',
        description: '为指定租户禁用特定功能',
    }),
    (0, swagger_1.ApiParam)({ name: 'featureKey', description: '功能键', example: 'customer-analytics' }),
    (0, swagger_1.ApiBody)({ type: tenant_feature_dto_1.DisableFeatureForTenantDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '功能禁用成功', type: feature_config_entity_1.TenantFeatureToggle }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Param)('featureKey')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tenant_feature_dto_1.DisableFeatureForTenantDto]),
    __metadata("design:returntype", Promise)
], TenantFeatureController.prototype, "disableTenantFeature", null);
__decorate([
    (0, common_1.Post)('batch-enable'),
    (0, swagger_1.ApiOperation)({
        summary: '批量启用功能',
        description: '为指定租户批量启用多个功能',
    }),
    (0, swagger_1.ApiBody)({ type: tenant_feature_dto_1.BatchEnableFeaturesDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '批量启用成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tenant_feature_dto_1.BatchEnableFeaturesDto]),
    __metadata("design:returntype", Promise)
], TenantFeatureController.prototype, "batchEnableFeatures", null);
__decorate([
    (0, common_1.Post)('batch-disable'),
    (0, swagger_1.ApiOperation)({
        summary: '批量禁用功能',
        description: '为指定租户批量禁用多个功能',
    }),
    (0, swagger_1.ApiBody)({ type: tenant_feature_dto_1.BatchDisableFeaturesDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '批量禁用成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tenant_feature_dto_1.BatchDisableFeaturesDto]),
    __metadata("design:returntype", Promise)
], TenantFeatureController.prototype, "batchDisableFeatures", null);
exports.TenantFeatureController = TenantFeatureController = __decorate([
    (0, swagger_1.ApiTags)('租户功能管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('tenant-features'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tenant_feature_service_1.TenantFeatureService])
], TenantFeatureController);
//# sourceMappingURL=tenant-feature.controller.js.map