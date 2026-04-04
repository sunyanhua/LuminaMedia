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
exports.EnterpriseProfileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const enterprise_profile_analysis_service_1 = require("../services/enterprise-profile-analysis.service");
const enterprise_profile_entity_1 = require("../../../entities/enterprise-profile.entity");
let EnterpriseProfileController = class EnterpriseProfileController {
    enterpriseProfileAnalysisService;
    constructor(enterpriseProfileAnalysisService) {
        this.enterpriseProfileAnalysisService = enterpriseProfileAnalysisService;
    }
    async createAnalysisTask(customerProfileId) {
        return await this.enterpriseProfileAnalysisService.createAnalysisTask(customerProfileId);
    }
    async getProfile(id) {
        return await this.enterpriseProfileAnalysisService.getProfile(id);
    }
    async getProfilesByCustomer(customerProfileId) {
        return await this.enterpriseProfileAnalysisService.getProfilesByCustomer(customerProfileId);
    }
    async getCurrentProfile(customerProfileId) {
        return await this.enterpriseProfileAnalysisService.getCurrentProfile(customerProfileId);
    }
    async reanalyzeProfile(id) {
        return await this.enterpriseProfileAnalysisService.reanalyzeProfile(id);
    }
    async getAnalysisStatus(id) {
        return await this.enterpriseProfileAnalysisService.getAnalysisStatus(id);
    }
    async batchAnalyzeProfiles(customerProfileIds) {
        return await this.enterpriseProfileAnalysisService.batchAnalyzeProfiles(customerProfileIds);
    }
    async deleteProfile(id) {
        console.warn(`企业画像删除请求: ${id}，功能待实现`);
    }
    async getIndustryStats() {
        return [
            { industry: '科技', count: 25 },
            { industry: '金融', count: 18 },
            { industry: '医疗', count: 12 },
            { industry: '教育', count: 8 },
            { industry: '零售', count: 15 },
        ];
    }
    async getAnalysisStatusStats() {
        return [
            { status: 'completed', count: 45, avgProgress: 100 },
            { status: 'analyzing', count: 5, avgProgress: 65 },
            { status: 'pending', count: 3, avgProgress: 0 },
            { status: 'failed', count: 2, avgProgress: 30 },
        ];
    }
    async findSimilarProfiles(id, limit) {
        const profile = await this.enterpriseProfileAnalysisService.getProfile(id);
        if (!profile.featureVector) {
            return [];
        }
        return [];
    }
};
exports.EnterpriseProfileController = EnterpriseProfileController;
__decorate([
    (0, common_1.Post)(':customerProfileId/analyze'),
    (0, swagger_1.ApiOperation)({
        summary: '创建企业画像分析任务',
        description: '为指定客户档案创建企业画像分析任务，异步生成企业画像',
    }),
    (0, swagger_1.ApiParam)({
        name: 'customerProfileId',
        description: '客户档案ID',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '分析任务创建成功',
        type: enterprise_profile_entity_1.EnterpriseProfile,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户档案不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数无效' }),
    __param(0, (0, common_1.Param)('customerProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnterpriseProfileController.prototype, "createAnalysisTask", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: '获取企业画像详情',
        description: '根据ID获取企业画像的详细信息，包括画像数据和特征向量',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '企业画像ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        type: enterprise_profile_entity_1.EnterpriseProfile,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '企业画像不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnterpriseProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '获取客户档案的企业画像列表',
        description: '根据客户档案ID获取该客户的所有企业画像列表（包含版本历史）',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'customerProfileId',
        required: true,
        description: '客户档案ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        type: [enterprise_profile_entity_1.EnterpriseProfile],
    }),
    __param(0, (0, common_1.Query)('customerProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnterpriseProfileController.prototype, "getProfilesByCustomer", null);
__decorate([
    (0, common_1.Get)('current/:customerProfileId'),
    (0, swagger_1.ApiOperation)({
        summary: '获取当前版本的企业画像',
        description: '获取指定客户档案的当前版本企业画像',
    }),
    (0, swagger_1.ApiParam)({
        name: 'customerProfileId',
        description: '客户档案ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        type: enterprise_profile_entity_1.EnterpriseProfile,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '企业画像不存在' }),
    __param(0, (0, common_1.Param)('customerProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnterpriseProfileController.prototype, "getCurrentProfile", null);
__decorate([
    (0, common_1.Post)(':id/reanalyze'),
    (0, swagger_1.ApiOperation)({
        summary: '重新分析企业画像',
        description: '重新分析企业画像，生成新版本',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '企业画像ID' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '重新分析任务创建成功',
        type: enterprise_profile_entity_1.EnterpriseProfile,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '企业画像不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '画像正在分析中' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnterpriseProfileController.prototype, "reanalyzeProfile", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    (0, swagger_1.ApiOperation)({
        summary: '获取分析状态',
        description: '获取企业画像分析任务的当前状态和进度',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '企业画像ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string' },
                progress: { type: 'number' },
                estimatedTime: { type: 'number', nullable: true },
                errorMessage: { type: 'string', nullable: true },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnterpriseProfileController.prototype, "getAnalysisStatus", null);
__decorate([
    (0, common_1.Post)('batch-analyze'),
    (0, swagger_1.ApiOperation)({
        summary: '批量分析企业画像',
        description: '批量创建企业画像分析任务',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                customerProfileIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '客户档案ID数组',
                },
            },
            required: ['customerProfileIds'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '批量分析任务创建成功',
        type: [enterprise_profile_entity_1.EnterpriseProfile],
    }),
    __param(0, (0, common_1.Body)('customerProfileIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], EnterpriseProfileController.prototype, "batchAnalyzeProfiles", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: '删除企业画像',
        description: '删除企业画像记录（谨慎操作，建议版本管理而非删除）',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '企业画像ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: '删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '企业画像不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnterpriseProfileController.prototype, "deleteProfile", null);
__decorate([
    (0, common_1.Get)('stats/industries'),
    (0, swagger_1.ApiOperation)({
        summary: '获取行业统计',
        description: '获取企业画像的行业分布统计',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                stats: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            industry: { type: 'string' },
                            count: { type: 'number' },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EnterpriseProfileController.prototype, "getIndustryStats", null);
__decorate([
    (0, common_1.Get)('stats/analysis-status'),
    (0, swagger_1.ApiOperation)({
        summary: '获取分析状态统计',
        description: '获取企业画像分析任务的状态分布统计',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                stats: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            status: { type: 'string' },
                            count: { type: 'number' },
                            avgProgress: { type: 'number' },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EnterpriseProfileController.prototype, "getAnalysisStatusStats", null);
__decorate([
    (0, common_1.Get)(':id/similar'),
    (0, swagger_1.ApiOperation)({
        summary: '查找相似企业画像',
        description: '基于特征向量查找相似的企业画像',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '企业画像ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: '返回结果数量限制',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        type: [enterprise_profile_entity_1.EnterpriseProfile],
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], EnterpriseProfileController.prototype, "findSimilarProfiles", null);
exports.EnterpriseProfileController = EnterpriseProfileController = __decorate([
    (0, swagger_1.ApiTags)('knowledge'),
    (0, common_1.Controller)('api/v1/knowledge/enterprise-profiles'),
    __metadata("design:paramtypes", [enterprise_profile_analysis_service_1.EnterpriseProfileAnalysisService])
], EnterpriseProfileController);
//# sourceMappingURL=enterprise-profile.controller.js.map