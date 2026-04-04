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
exports.QuotaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const quota_service_1 = require("../services/quota.service");
const tenant_quota_entity_1 = require("../../../entities/tenant-quota.entity");
const quota_dto_1 = require("../dto/quota.dto");
let QuotaController = class QuotaController {
    quotaService;
    constructor(quotaService) {
        this.quotaService = quotaService;
    }
    async getQuotas(query) {
        return await this.quotaService.getQuotas(query);
    }
    async getCurrentQuotas(req) {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            throw new Error('无法获取租户信息');
        }
        return await this.quotaService.getTenantQuotaUsage(tenantId);
    }
    async getQuotaHistory(tenantId, featureKey) {
        return {
            message: '配额使用历史记录功能待实现',
            data: [],
        };
    }
    async resetQuota(resetQuotaDto) {
        const { tenantId, featureKey } = resetQuotaDto;
        if (tenantId && featureKey) {
            await this.quotaService.resetQuota(tenantId, featureKey);
            return { success: true, message: `已重置租户 ${tenantId} 功能 ${featureKey} 的配额` };
        }
        else if (tenantId && !featureKey) {
            await this.quotaService.resetQuotasForTenant(tenantId);
            return { success: true, message: `已重置租户 ${tenantId} 的所有配额` };
        }
        else {
            throw new Error('必须提供租户ID或租户ID+功能键');
        }
    }
    async createQuota(createQuotaDto) {
        const { tenantId, featureKey, maxCount, quotaPeriod = 'daily' } = createQuotaDto;
        return await this.quotaService.setQuota(tenantId, featureKey, maxCount, quotaPeriod);
    }
    async updateQuota(tenantId, featureKey, updateQuotaDto) {
        const { maxCount, quotaPeriod } = updateQuotaDto;
        const existingQuota = await this.quotaService.getQuotaInfo(tenantId, featureKey);
        return await this.quotaService.setQuota(tenantId, featureKey, maxCount ?? existingQuota.maxCount, quotaPeriod ?? 'daily');
    }
    async deleteQuota(tenantId, featureKey) {
        await this.quotaService.deleteQuota(tenantId, featureKey);
    }
    async getQuotaDetail(tenantId, featureKey) {
        const quotaInfo = await this.quotaService.getQuotaInfo(tenantId, featureKey);
        const quotaRecord = await this.quotaService.getOrCreateQuotaRecord(tenantId, featureKey);
        return {
            ...quotaInfo,
            quotaPeriod: quotaRecord.quotaPeriod || 'daily'
        };
    }
};
exports.QuotaController = QuotaController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '获取配额配置列表',
        description: '返回所有配额配置信息（支持分页、过滤）',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'tenantId',
        required: false,
        description: '租户ID过滤',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'featureKey',
        required: false,
        description: '功能键过滤',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'quotaPeriod',
        required: false,
        description: '配额周期过滤（daily/weekly/monthly）',
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
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取配额配置列表', type: [tenant_quota_entity_1.TenantQuota] }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quota_dto_1.QuotaQueryDto]),
    __metadata("design:returntype", Promise)
], QuotaController.prototype, "getQuotas", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, swagger_1.ApiOperation)({
        summary: '获取当前配额使用情况',
        description: '返回当前租户的所有功能配额使用情况',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取当前配额使用情况' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuotaController.prototype, "getCurrentQuotas", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({
        summary: '获取配额使用历史',
        description: '返回配额使用历史记录（功能待实现）',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'tenantId',
        required: false,
        description: '租户ID过滤',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'featureKey',
        required: false,
        description: '功能键过滤',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取配额使用历史（占位）' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('featureKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuotaController.prototype, "getQuotaHistory", null);
__decorate([
    (0, common_1.Post)('reset'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '重置配额',
        description: '重置指定租户和功能的配额使用计数（管理员权限）',
    }),
    (0, swagger_1.ApiBody)({ type: quota_dto_1.ResetQuotaDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '配额重置成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quota_dto_1.ResetQuotaDto]),
    __metadata("design:returntype", Promise)
], QuotaController.prototype, "resetQuota", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '创建配额配置',
        description: '创建新的配额配置',
    }),
    (0, swagger_1.ApiBody)({ type: quota_dto_1.CreateQuotaDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '配额配置创建成功', type: tenant_quota_entity_1.TenantQuota }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误或配额配置已存在' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quota_dto_1.CreateQuotaDto]),
    __metadata("design:returntype", Promise)
], QuotaController.prototype, "createQuota", null);
__decorate([
    (0, common_1.Put)(':tenantId/:featureKey'),
    (0, swagger_1.ApiOperation)({
        summary: '更新配额配置',
        description: '更新指定租户和功能的配额配置',
    }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: '租户ID', example: 'demo-business-001' }),
    (0, swagger_1.ApiParam)({ name: 'featureKey', description: '功能键', example: 'customer-analytics' }),
    (0, swagger_1.ApiBody)({ type: quota_dto_1.UpdateQuotaDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '配额配置更新成功', type: tenant_quota_entity_1.TenantQuota }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '配额配置不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('featureKey')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, quota_dto_1.UpdateQuotaDto]),
    __metadata("design:returntype", Promise)
], QuotaController.prototype, "updateQuota", null);
__decorate([
    (0, common_1.Delete)(':tenantId/:featureKey'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: '删除配额配置',
        description: '删除指定的配额配置',
    }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: '租户ID', example: 'demo-business-001' }),
    (0, swagger_1.ApiParam)({ name: 'featureKey', description: '功能键', example: 'customer-analytics' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: '配额配置删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '配额配置不存在' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('featureKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuotaController.prototype, "deleteQuota", null);
__decorate([
    (0, common_1.Get)(':tenantId/:featureKey'),
    (0, swagger_1.ApiOperation)({
        summary: '获取配额配置详情',
        description: '获取指定租户和功能的配额配置详情',
    }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: '租户ID', example: 'demo-business-001' }),
    (0, swagger_1.ApiParam)({ name: 'featureKey', description: '功能键', example: 'customer-analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取配额配置详情' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '配额配置不存在' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('featureKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuotaController.prototype, "getQuotaDetail", null);
exports.QuotaController = QuotaController = __decorate([
    (0, swagger_1.ApiTags)('配额管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('quotas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [quota_service_1.QuotaService])
], QuotaController);
//# sourceMappingURL=quota.controller.js.map