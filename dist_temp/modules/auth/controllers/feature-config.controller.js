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
exports.FeatureConfigController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const feature_config_service_1 = require("../services/feature-config.service");
const feature_config_entity_1 = require("../../../entities/feature-config.entity");
const feature_config_dto_1 = require("../dto/feature-config.dto");
let FeatureConfigController = class FeatureConfigController {
    featureConfigService;
    constructor(featureConfigService) {
        this.featureConfigService = featureConfigService;
    }
    async getFeatureConfigs(page = 1, pageSize = 20, isEnabled, tenantType, sortBy, sortOrder) {
        const where = {};
        if (isEnabled && isEnabled !== 'all') {
            where.isEnabled = isEnabled === 'true';
        }
        if (tenantType && tenantType !== 'all') {
            where.tenantType = tenantType;
        }
        const [data, total] = await this.featureConfigService.getAllFeatureConfigs(page, pageSize, where, sortBy, sortOrder);
        return {
            data,
            total,
            page,
            pageSize,
        };
    }
    async getFeatureConfig(featureKey) {
        const featureConfig = await this.featureConfigService.getFeatureConfigByKey(featureKey);
        if (!featureConfig) {
            throw new Error('功能配置不存在');
        }
        return featureConfig;
    }
    async createFeatureConfig(createFeatureConfigDto) {
        return await this.featureConfigService.createFeatureConfig(createFeatureConfigDto);
    }
    async updateFeatureConfig(featureKey, updateFeatureConfigDto) {
        return await this.featureConfigService.updateFeatureConfig(featureKey, updateFeatureConfigDto);
    }
    async deleteFeatureConfig(featureKey) {
        await this.featureConfigService.deleteFeatureConfig(featureKey);
    }
    async batchEnableFeatures(body) {
        let updated = 0;
        for (const featureKey of body.featureKeys) {
            try {
                await this.featureConfigService.updateFeatureConfig(featureKey, { isEnabled: true });
                updated++;
            }
            catch (error) {
            }
        }
        return { success: true, updated };
    }
    async batchDisableFeatures(body) {
        let updated = 0;
        for (const featureKey of body.featureKeys) {
            try {
                await this.featureConfigService.updateFeatureConfig(featureKey, { isEnabled: false });
                updated++;
            }
            catch (error) {
            }
        }
        return { success: true, updated };
    }
};
exports.FeatureConfigController = FeatureConfigController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '获取功能配置列表',
        description: '返回所有功能配置信息（支持分页、过滤、排序）',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        description: '页码，默认为1',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'pageSize',
        required: false,
        description: '每页数量，默认为20',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isEnabled',
        required: false,
        description: '是否启用（true/false/all）',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'tenantType',
        required: false,
        description: '租户类型过滤（all/business/government）',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        description: '排序字段（featureKey/featureName/createdAt）',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortOrder',
        required: false,
        description: '排序方式（asc/desc），默认asc',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取功能配置列表', type: [feature_config_entity_1.FeatureConfig] }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('isEnabled')),
    __param(3, (0, common_1.Query)('tenantType')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FeatureConfigController.prototype, "getFeatureConfigs", null);
__decorate([
    (0, common_1.Get)(':featureKey'),
    (0, swagger_1.ApiOperation)({
        summary: '获取单个功能配置',
        description: '根据功能键获取特定功能配置的详细信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'featureKey', description: '功能键', example: 'customer-analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取功能配置', type: feature_config_entity_1.FeatureConfig }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '功能配置不存在' }),
    __param(0, (0, common_1.Param)('featureKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FeatureConfigController.prototype, "getFeatureConfig", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '创建功能配置',
        description: '创建新的功能配置',
    }),
    (0, swagger_1.ApiBody)({ type: feature_config_dto_1.CreateFeatureConfigDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '功能配置创建成功', type: feature_config_entity_1.FeatureConfig }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误或功能键已存在' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [feature_config_dto_1.CreateFeatureConfigDto]),
    __metadata("design:returntype", Promise)
], FeatureConfigController.prototype, "createFeatureConfig", null);
__decorate([
    (0, common_1.Put)(':featureKey'),
    (0, swagger_1.ApiOperation)({
        summary: '更新功能配置',
        description: '更新指定功能配置的信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'featureKey', description: '功能键', example: 'customer-analytics' }),
    (0, swagger_1.ApiBody)({ type: feature_config_dto_1.UpdateFeatureConfigDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '功能配置更新成功', type: feature_config_entity_1.FeatureConfig }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '功能配置不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Param)('featureKey')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, feature_config_dto_1.UpdateFeatureConfigDto]),
    __metadata("design:returntype", Promise)
], FeatureConfigController.prototype, "updateFeatureConfig", null);
__decorate([
    (0, common_1.Delete)(':featureKey'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: '删除功能配置',
        description: '删除指定的功能配置',
    }),
    (0, swagger_1.ApiParam)({ name: 'featureKey', description: '功能键', example: 'customer-analytics' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: '功能配置删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '功能配置不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '无法删除正在使用的功能配置' }),
    __param(0, (0, common_1.Param)('featureKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FeatureConfigController.prototype, "deleteFeatureConfig", null);
__decorate([
    (0, common_1.Post)('batch/enable'),
    (0, swagger_1.ApiOperation)({
        summary: '批量启用功能',
        description: '批量启用指定的功能配置',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                featureKeys: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '功能键列表',
                },
            },
            example: {
                featureKeys: ['customer-analytics', 'geo-analysis'],
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '批量启用成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FeatureConfigController.prototype, "batchEnableFeatures", null);
__decorate([
    (0, common_1.Post)('batch/disable'),
    (0, swagger_1.ApiOperation)({
        summary: '批量禁用功能',
        description: '批量禁用指定的功能配置',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                featureKeys: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '功能键列表',
                },
            },
            example: {
                featureKeys: ['customer-analytics', 'geo-analysis'],
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '批量禁用成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FeatureConfigController.prototype, "batchDisableFeatures", null);
exports.FeatureConfigController = FeatureConfigController = __decorate([
    (0, swagger_1.ApiTags)('功能配置管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('features'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [feature_config_service_1.FeatureConfigService])
], FeatureConfigController);
//# sourceMappingURL=feature-config.controller.js.map