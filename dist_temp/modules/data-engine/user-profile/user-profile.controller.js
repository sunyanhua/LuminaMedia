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
exports.UserProfileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const user_profile_service_1 = require("./user-profile.service");
let UserProfileController = class UserProfileController {
    userProfileService;
    constructor(userProfileService) {
        this.userProfileService = userProfileService;
    }
    async getUserProfile(customerId) {
        return this.userProfileService.getUserProfile(customerId);
    }
    async getBatchUserProfiles(body) {
        return this.userProfileService.getBatchUserProfiles(body.customerIds);
    }
    async filterCustomersByProfile(filters) {
        const customerIds = await this.userProfileService.filterCustomersByProfile(filters);
        return { customerIds };
    }
    async getProfileSummary(customerIds) {
        const ids = customerIds ? customerIds.split(',') : undefined;
        return this.userProfileService.getProfileSummary(ids);
    }
    async getBasicLifecycleDistribution() {
        return {};
    }
    async getConsumptionPersonalityDistribution() {
        return {};
    }
    async getRealtimeStatusDistribution() {
        return {};
    }
    async getSocialActivityDistribution() {
        return {};
    }
    async compareProfiles(body) {
        return {
            similarities: {},
            differences: {},
            recommendations: [],
        };
    }
};
exports.UserProfileController = UserProfileController;
__decorate([
    (0, common_1.Get)(':customerId'),
    (0, swagger_1.ApiOperation)({
        summary: '获取单个客户4维度画像',
        description: '根据客户ID获取完整的4维度用户画像数据',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功', type: Object }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户不存在' }),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "getUserProfile", null);
__decorate([
    (0, common_1.Post)('batch'),
    (0, swagger_1.ApiOperation)({
        summary: '批量获取客户画像',
        description: '批量获取多个客户的4维度用户画像数据',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "getBatchUserProfiles", null);
__decorate([
    (0, common_1.Post)('filter'),
    (0, swagger_1.ApiOperation)({
        summary: '根据画像维度筛选客户',
        description: '根据4维度画像条件筛选符合条件的客户',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '筛选成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "filterCustomersByProfile", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({
        summary: '获取画像统计摘要',
        description: '获取客户画像各维度的统计摘要信息',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)('customerIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "getProfileSummary", null);
__decorate([
    (0, common_1.Get)('dimensions/basic-lifecycle'),
    (0, swagger_1.ApiOperation)({
        summary: '获取基础生命周期维度分布',
        description: '获取基础生命周期维度各字段的分布情况',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "getBasicLifecycleDistribution", null);
__decorate([
    (0, common_1.Get)('dimensions/consumption-personality'),
    (0, swagger_1.ApiOperation)({
        summary: '获取消费性格维度分布',
        description: '获取消费性格维度各字段的分布情况',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "getConsumptionPersonalityDistribution", null);
__decorate([
    (0, common_1.Get)('dimensions/realtime-status'),
    (0, swagger_1.ApiOperation)({
        summary: '获取实时状态维度分布',
        description: '获取实时状态维度各字段的分布情况',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "getRealtimeStatusDistribution", null);
__decorate([
    (0, common_1.Get)('dimensions/social-activity'),
    (0, swagger_1.ApiOperation)({
        summary: '获取社交与活动维度分布',
        description: '获取社交与活动维度各字段的分布情况',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "getSocialActivityDistribution", null);
__decorate([
    (0, common_1.Post)('compare'),
    (0, swagger_1.ApiOperation)({
        summary: '画像对比分析',
        description: '对比多个客户画像的相似性和差异性',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '对比成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserProfileController.prototype, "compareProfiles", null);
exports.UserProfileController = UserProfileController = __decorate([
    (0, swagger_1.ApiTags)('用户画像'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('data-engine/user-profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [user_profile_service_1.UserProfileService])
], UserProfileController);
//# sourceMappingURL=user-profile.controller.js.map