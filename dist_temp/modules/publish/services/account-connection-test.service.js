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
var AccountConnectionTestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountConnectionTestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const platform_adapter_factory_1 = require("../adapters/platform-adapter.factory");
const account_credential_service_1 = require("./account-credential.service");
const platform_adapter_interface_1 = require("../interfaces/platform-adapter.interface");
const social_account_entity_1 = require("../../../entities/social-account.entity");
const account_status_enum_1 = require("../../../shared/enums/account-status.enum");
let AccountConnectionTestService = AccountConnectionTestService_1 = class AccountConnectionTestService {
    accountRepository;
    platformAdapterFactory;
    accountCredentialService;
    logger = new common_1.Logger(AccountConnectionTestService_1.name);
    constructor(accountRepository, platformAdapterFactory, accountCredentialService) {
        this.accountRepository = accountRepository;
        this.platformAdapterFactory = platformAdapterFactory;
        this.accountCredentialService = accountCredentialService;
    }
    async testAccountConnection(accountId, tenantId = 'demo-tenant') {
        try {
            this.logger.log(`Testing connection for account: ${accountId}`);
            const accounts = await this.accountCredentialService.getAllAccounts(tenantId);
            const account = accounts.find((acc) => acc.id === accountId);
            if (!account) {
                return {
                    success: false,
                    platform: 'unknown',
                    accountId,
                    message: `Account not found: ${accountId}`,
                    timestamp: new Date(),
                };
            }
            const credentials = await this.accountCredentialService.getDecryptedCredentials(accountId, tenantId);
            let result;
            switch (account.platform) {
                case platform_adapter_interface_1.PlatformType.WECHAT:
                    result = await this.testWechatConnection(credentials);
                    break;
                case platform_adapter_interface_1.PlatformType.XIAOHONGSHU:
                    result = await this.testXiaohongshuConnection(credentials);
                    break;
                case platform_adapter_interface_1.PlatformType.WEIBO:
                    result = await this.testWeiboConnection(credentials);
                    break;
                case platform_adapter_interface_1.PlatformType.DOUYIN:
                    result = await this.testDouyinConnection(credentials);
                    break;
                default:
                    result = {
                        success: false,
                        platform: account.platform,
                        accountId,
                        message: `Unsupported platform for connection test: ${account.platform}`,
                        timestamp: new Date(),
                    };
            }
            await this.updateAccountTestResult(account, result);
            return {
                ...result,
                accountId,
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Connection test failed for account ${accountId}: ${error.message}`, error.stack);
            return {
                success: false,
                platform: 'unknown',
                accountId,
                message: `Connection test failed: ${error.message}`,
                error: error.toString(),
                timestamp: new Date(),
            };
        }
    }
    async testAllAccounts(tenantId = 'demo-tenant') {
        const accounts = await this.accountCredentialService.getAllAccounts(tenantId);
        const results = [];
        for (const account of accounts) {
            if (account.isEnabled) {
                try {
                    const result = await this.testAccountConnection(account.id, tenantId);
                    results.push(result);
                }
                catch (error) {
                    results.push({
                        success: false,
                        platform: account.platform,
                        accountId: account.id,
                        message: `Test failed: ${error.message}`,
                        error: error.toString(),
                        timestamp: new Date(),
                    });
                }
            }
        }
        return {
            total: accounts.length,
            tested: results.length,
            successful: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length,
            results,
            timestamp: new Date(),
        };
    }
    async testWechatConnection(credentials) {
        try {
            const testConfig = {
                type: platform_adapter_interface_1.PlatformType.WECHAT,
                name: '微信连接测试',
                enabled: true,
                credentials,
                options: {
                    timeout: 10000,
                    maxRetries: 1,
                },
            };
            const adapter = this.platformAdapterFactory.createAdapter(testConfig);
            await adapter.initialize();
            const health = await adapter.healthCheck();
            await adapter.cleanup();
            return {
                success: health.status === 'healthy',
                platform: platform_adapter_interface_1.PlatformType.WECHAT,
                message: health.message ||
                    `微信公众号连接${health.status === 'healthy' ? '成功' : '失败'}`,
                details: {
                    healthStatus: health.status,
                    metrics: health.metrics,
                },
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                platform: platform_adapter_interface_1.PlatformType.WECHAT,
                message: `微信公众号连接失败: ${error.message}`,
                error: error.toString(),
                timestamp: new Date(),
            };
        }
    }
    async testXiaohongshuConnection(credentials) {
        try {
            const testConfig = {
                type: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
                name: '小红书连接测试',
                enabled: true,
                credentials,
                options: {
                    timeout: 15000,
                    maxRetries: 1,
                },
            };
            const adapter = this.platformAdapterFactory.createAdapter(testConfig);
            await adapter.initialize();
            const health = await adapter.healthCheck();
            await adapter.cleanup();
            return {
                success: health.status === 'healthy',
                platform: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
                message: health.message ||
                    `小红书连接${health.status === 'healthy' ? '成功' : '失败'}`,
                details: {
                    healthStatus: health.status,
                    metrics: health.metrics,
                },
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                platform: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
                message: `小红书连接失败: ${error.message}`,
                error: error.toString(),
                timestamp: new Date(),
            };
        }
    }
    async testWeiboConnection(credentials) {
        try {
            const testConfig = {
                type: platform_adapter_interface_1.PlatformType.WEIBO,
                name: '微博连接测试',
                enabled: true,
                credentials,
                options: {
                    timeout: 10000,
                    maxRetries: 1,
                },
            };
            const adapter = this.platformAdapterFactory.createAdapter(testConfig);
            await adapter.initialize();
            const health = await adapter.healthCheck();
            await adapter.cleanup();
            return {
                success: health.status === 'healthy',
                platform: platform_adapter_interface_1.PlatformType.WEIBO,
                message: health.message ||
                    `微博连接${health.status === 'healthy' ? '成功' : '失败'}`,
                details: {
                    healthStatus: health.status,
                    metrics: health.metrics,
                },
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                platform: platform_adapter_interface_1.PlatformType.WEIBO,
                message: `微博连接失败: ${error.message}`,
                error: error.toString(),
                timestamp: new Date(),
            };
        }
    }
    async testDouyinConnection(credentials) {
        try {
            const testConfig = {
                type: platform_adapter_interface_1.PlatformType.DOUYIN,
                name: '抖音连接测试',
                enabled: true,
                credentials,
                options: {
                    timeout: 15000,
                    maxRetries: 1,
                },
            };
            const adapter = this.platformAdapterFactory.createAdapter(testConfig);
            await adapter.initialize();
            const health = await adapter.healthCheck();
            await adapter.cleanup();
            return {
                success: health.status === 'healthy',
                platform: platform_adapter_interface_1.PlatformType.DOUYIN,
                message: health.message ||
                    `抖音连接${health.status === 'healthy' ? '成功' : '失败'}`,
                details: {
                    healthStatus: health.status,
                    metrics: health.metrics,
                },
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                platform: platform_adapter_interface_1.PlatformType.DOUYIN,
                message: `抖音连接失败: ${error.message}`,
                error: error.toString(),
                timestamp: new Date(),
            };
        }
    }
    async updateAccountTestResult(account, testResult) {
        try {
            account.lastTestedAt = new Date();
            account.testResult = {
                success: testResult.success,
                message: testResult.message,
                timestamp: testResult.timestamp,
                details: testResult.details,
            };
            if (!testResult.success) {
                account.status = account_status_enum_1.AccountStatus.RE_AUTH_REQUIRED;
            }
            await this.accountRepository.save(account);
            this.logger.log(`Test result updated for account: ${account.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to update test result: ${error.message}`, error.stack);
        }
    }
};
exports.AccountConnectionTestService = AccountConnectionTestService;
exports.AccountConnectionTestService = AccountConnectionTestService = AccountConnectionTestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(social_account_entity_1.SocialAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        platform_adapter_factory_1.PlatformAdapterFactory,
        account_credential_service_1.AccountCredentialService])
], AccountConnectionTestService);
//# sourceMappingURL=account-connection-test.service.js.map