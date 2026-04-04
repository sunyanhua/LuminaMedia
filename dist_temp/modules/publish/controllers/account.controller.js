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
exports.AccountController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const feature_guard_1 = require("../../auth/guards/feature.guard");
const feature_decorator_1 = require("../../auth/decorators/feature.decorator");
const account_credential_service_1 = require("../services/account-credential.service");
const account_connection_test_service_1 = require("../services/account-connection-test.service");
let AccountController = class AccountController {
    accountCredentialService;
    accountConnectionTestService;
    constructor(accountCredentialService, accountConnectionTestService) {
        this.accountCredentialService = accountCredentialService;
        this.accountConnectionTestService = accountConnectionTestService;
    }
    async getAllAccounts(tenantId = 'demo-tenant') {
        return await this.accountCredentialService.getAllAccounts(tenantId);
    }
    async createOrUpdateAccount(accountId, body) {
        const { platform, credentials, tenantId = 'demo-tenant', accountName, config, } = body;
        const account = await this.accountCredentialService.encryptAndStoreCredentials(accountId, platform, credentials, tenantId);
        if (config) {
        }
        return {
            success: true,
            message: '账号凭证保存成功',
            accountId: account.id,
            platform: account.platform,
        };
    }
    async getAccount(accountId, tenantId = 'demo-tenant') {
        const accounts = await this.accountCredentialService.getAllAccounts(tenantId);
        const account = accounts.find((acc) => acc.id === accountId);
        if (!account) {
            return {
                success: false,
                message: `账号不存在: ${accountId}`,
            };
        }
        return {
            success: true,
            account,
        };
    }
    async deleteAccount(accountId, tenantId = 'demo-tenant') {
        await this.accountCredentialService.deleteCredentials(accountId, tenantId);
        return {
            success: true,
            message: '账号凭证已删除',
            accountId,
        };
    }
    async testAccountConnection(accountId, tenantId = 'demo-tenant') {
        return await this.accountConnectionTestService.testAccountConnection(accountId, tenantId);
    }
    async testAllAccounts(tenantId = 'demo-tenant') {
        return await this.accountConnectionTestService.testAllAccounts(tenantId);
    }
    async validateCredentials(accountId, tenantId = 'demo-tenant') {
        const isValid = await this.accountCredentialService.validateCredentials(accountId, tenantId);
        return {
            success: true,
            valid: isValid,
            accountId,
            message: isValid ? '凭证有效' : '凭证无效',
        };
    }
    async updateConfig(accountId, body, tenantId = 'demo-tenant') {
        return {
            success: true,
            message: '配置更新功能待实现',
            accountId,
        };
    }
};
exports.AccountController = AccountController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '获取所有账号列表',
        description: '返回所有社交媒体账号的基本信息（不包含凭证）',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'tenantId',
        required: false,
        description: '租户ID，默认为demo-tenant',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取账号列表' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "getAllAccounts", null);
__decorate([
    (0, common_1.Post)(':accountId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '创建或更新账号凭证',
        description: '加密存储社交媒体账号凭证',
    }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: '账号ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'tenantId',
        required: false,
        description: '租户ID，默认为demo-tenant',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '账号凭证创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "createOrUpdateAccount", null);
__decorate([
    (0, common_1.Get)(':accountId'),
    (0, swagger_1.ApiOperation)({
        summary: '获取账号详情',
        description: '获取指定账号的详细信息（不包含解密后的凭证）',
    }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: '账号ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'tenantId',
        required: false,
        description: '租户ID，默认为demo-tenant',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取账号详情' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '账号不存在' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "getAccount", null);
__decorate([
    (0, common_1.Delete)(':accountId'),
    (0, swagger_1.ApiOperation)({
        summary: '删除账号凭证',
        description: '删除指定账号的凭证（标记为过期）',
    }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: '账号ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'tenantId',
        required: false,
        description: '租户ID，默认为demo-tenant',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '账号凭证删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '账号不存在' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Post)(':accountId/test'),
    (0, swagger_1.ApiOperation)({
        summary: '测试账号连接',
        description: '测试指定社交媒体账号的连接状态',
    }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: '账号ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'tenantId',
        required: false,
        description: '租户ID，默认为demo-tenant',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '连接测试完成' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "testAccountConnection", null);
__decorate([
    (0, common_1.Post)('test/all'),
    (0, swagger_1.ApiOperation)({
        summary: '测试所有账号连接',
        description: '批量测试所有社交媒体账号的连接状态',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'tenantId',
        required: false,
        description: '租户ID，默认为demo-tenant',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '批量连接测试完成' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "testAllAccounts", null);
__decorate([
    (0, common_1.Get)(':accountId/validate'),
    (0, swagger_1.ApiOperation)({
        summary: '验证账号凭证',
        description: '验证指定账号凭证的有效性',
    }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: '账号ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'tenantId',
        required: false,
        description: '租户ID，默认为demo-tenant',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '凭证验证完成' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "validateCredentials", null);
__decorate([
    (0, common_1.Put)(':accountId/config'),
    (0, swagger_1.ApiOperation)({
        summary: '更新账号配置',
        description: '更新社交媒体账号的配置信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: '账号ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'tenantId',
        required: false,
        description: '租户ID，默认为demo-tenant',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '配置更新成功' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "updateConfig", null);
exports.AccountController = AccountController = __decorate([
    (0, swagger_1.ApiTags)('账号管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('accounts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, feature_decorator_1.Feature)('matrix-publish'),
    __metadata("design:paramtypes", [account_credential_service_1.AccountCredentialService,
        account_connection_test_service_1.AccountConnectionTestService])
], AccountController);
//# sourceMappingURL=account.controller.js.map