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
var PlatformAdapterFactory_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAdapterFactory = void 0;
const common_1 = require("@nestjs/common");
const platform_adapter_interface_1 = require("../interfaces/platform-adapter.interface");
const wechat_adapter_1 = require("./wechat.adapter");
const xiaohongshu_adapter_1 = require("./xiaohongshu.adapter");
const weibo_adapter_1 = require("./weibo.adapter");
const douyin_adapter_1 = require("./douyin.adapter");
let PlatformAdapterFactory = PlatformAdapterFactory_1 = class PlatformAdapterFactory {
    logger = new common_1.Logger(PlatformAdapterFactory_1.name);
    adapterRegistry;
    constructor() {
        this.adapterRegistry = new Map();
        this.adapterRegistry.set(platform_adapter_interface_1.PlatformType.WECHAT, wechat_adapter_1.WechatAdapter);
        this.adapterRegistry.set(platform_adapter_interface_1.PlatformType.XIAOHONGSHU, xiaohongshu_adapter_1.XHSAdapter);
        this.adapterRegistry.set(platform_adapter_interface_1.PlatformType.WEIBO, weibo_adapter_1.WeiboAdapter);
        this.adapterRegistry.set(platform_adapter_interface_1.PlatformType.DOUYIN, douyin_adapter_1.DouyinAdapter);
    }
    createAdapter(config) {
        if (!config.enabled) {
            throw new Error(`Platform ${config.type} is disabled`);
        }
        const AdapterClass = this.adapterRegistry.get(config.type);
        if (!AdapterClass) {
            throw new common_1.NotFoundException(`No adapter found for platform type: ${config.type}`);
        }
        try {
            this.logger.log(`Creating adapter for platform: ${config.type} (${config.name})`);
            const adapter = new AdapterClass(config);
            return adapter;
        }
        catch (error) {
            this.logger.error(`Failed to create adapter for platform ${config.type}: ${error.message}`, error.stack);
            throw new Error(`Failed to create adapter for platform ${config.type}: ${error.message}`);
        }
    }
    createAdapters(configs) {
        const adapters = new Map();
        for (const config of configs) {
            if (!config.enabled) {
                this.logger.log(`Skipping disabled platform: ${config.type}`);
                continue;
            }
            try {
                const adapter = this.createAdapter(config);
                adapters.set(config.type, adapter);
                this.logger.log(`Adapter created for platform: ${config.type}`);
            }
            catch (error) {
                this.logger.error(`Failed to create adapter for platform ${config.type}: ${error.message}`);
            }
        }
        return adapters;
    }
    getSupportedPlatformTypes() {
        return Array.from(this.adapterRegistry.keys());
    }
    isPlatformSupported(platformType) {
        return this.adapterRegistry.has(platformType);
    }
    getAdapterClass(platformType) {
        const AdapterClass = this.adapterRegistry.get(platformType);
        if (!AdapterClass) {
            throw new common_1.NotFoundException(`No adapter class found for platform type: ${platformType}`);
        }
        return AdapterClass;
    }
    registerAdapter(platformType, adapterClass) {
        if (this.adapterRegistry.has(platformType)) {
            this.logger.warn(`Overriding existing adapter for platform type: ${platformType}`);
        }
        this.adapterRegistry.set(platformType, adapterClass);
        this.logger.log(`Custom adapter registered for platform: ${platformType}`);
    }
    createDefaultAdapters() {
        const defaultConfigs = [
            {
                type: platform_adapter_interface_1.PlatformType.WECHAT,
                name: '微信公众号测试',
                enabled: true,
                credentials: {
                    appId: 'test_app_id',
                    appSecret: 'test_app_secret',
                    wechatId: 'test_wechat_id',
                    wechatName: '测试公众号',
                },
                options: {
                    timeout: 30000,
                    maxRetries: 3,
                },
            },
            {
                type: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
                name: '小红书测试',
                enabled: true,
                credentials: {
                    username: 'test_user',
                    password: 'test_password',
                },
                options: {
                    timeout: 60000,
                    maxRetries: 2,
                },
            },
            {
                type: platform_adapter_interface_1.PlatformType.WEIBO,
                name: '微博测试',
                enabled: true,
                credentials: {
                    appKey: 'test_app_key',
                    appSecret: 'test_app_secret',
                    accessToken: 'test_access_token',
                },
                options: {
                    timeout: 30000,
                    maxRetries: 2,
                },
            },
            {
                type: platform_adapter_interface_1.PlatformType.DOUYIN,
                name: '抖音测试',
                enabled: true,
                credentials: {
                    clientKey: 'test_client_key',
                    clientSecret: 'test_client_secret',
                    accessToken: 'test_access_token',
                    openId: 'test_open_id',
                },
                options: {
                    timeout: 60000,
                    maxRetries: 1,
                },
            },
        ];
        return this.createAdapters(defaultConfigs);
    }
    validateConfig(config) {
        const errors = [];
        if (!config.type) {
            errors.push('Platform type is required');
        }
        if (!this.isPlatformSupported(config.type)) {
            errors.push(`Platform type ${config.type} is not supported`);
        }
        if (!config.name) {
            errors.push('Platform name is required');
        }
        if (!config.credentials) {
            errors.push('Platform credentials are required');
        }
        else {
            const credentialErrors = this.validateCredentials(config.type, config.credentials);
            errors.push(...credentialErrors);
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    validateCredentials(platformType, credentials) {
        const errors = [];
        switch (platformType) {
            case platform_adapter_interface_1.PlatformType.WECHAT:
                if (!credentials.appId)
                    errors.push('WeChat appId is required');
                if (!credentials.appSecret)
                    errors.push('WeChat appSecret is required');
                if (!credentials.wechatId)
                    errors.push('WeChat wechatId is required');
                break;
            case platform_adapter_interface_1.PlatformType.XIAOHONGSHU:
                if (!credentials.username)
                    errors.push('Xiaohongshu username is required');
                if (!credentials.password &&
                    !credentials.sessionToken &&
                    !credentials.cookies) {
                    errors.push('Xiaohongshu requires password, sessionToken, or cookies');
                }
                break;
            case platform_adapter_interface_1.PlatformType.WEIBO:
                if (!credentials.appKey)
                    errors.push('Weibo appKey is required');
                if (!credentials.appSecret)
                    errors.push('Weibo appSecret is required');
                if (!credentials.accessToken && !credentials.refreshToken) {
                    errors.push('Weibo requires accessToken or refreshToken');
                }
                break;
            case platform_adapter_interface_1.PlatformType.DOUYIN:
                if (!credentials.clientKey)
                    errors.push('Douyin clientKey is required');
                if (!credentials.clientSecret)
                    errors.push('Douyin clientSecret is required');
                if (!credentials.accessToken && !credentials.refreshToken) {
                    errors.push('Douyin requires accessToken or refreshToken');
                }
                break;
            default:
                errors.push(`Validation not implemented for platform type: ${platformType}`);
        }
        return errors;
    }
    async initializeAdapters(adapters) {
        const initializationPromises = [];
        for (const [platformType, adapter] of adapters.entries()) {
            this.logger.log(`Initializing adapter for platform: ${platformType}`);
            initializationPromises.push(adapter.initialize().catch((error) => {
                this.logger.error(`Failed to initialize adapter for platform ${platformType}: ${error.message}`);
                throw error;
            }));
        }
        try {
            await Promise.all(initializationPromises);
            this.logger.log('All adapters initialized successfully');
        }
        catch (error) {
            this.logger.error(`Some adapters failed to initialize: ${error.message}`);
        }
    }
    async cleanupAdapters(adapters) {
        const cleanupPromises = [];
        for (const [platformType, adapter] of adapters.entries()) {
            this.logger.log(`Cleaning up adapter for platform: ${platformType}`);
            cleanupPromises.push(adapter.cleanup().catch((error) => {
                this.logger.error(`Failed to cleanup adapter for platform ${platformType}: ${error.message}`);
            }));
        }
        try {
            await Promise.all(cleanupPromises);
            this.logger.log('All adapters cleaned up successfully');
        }
        catch (error) {
            this.logger.error(`Some adapters failed to cleanup: ${error.message}`);
        }
    }
};
exports.PlatformAdapterFactory = PlatformAdapterFactory;
exports.PlatformAdapterFactory = PlatformAdapterFactory = PlatformAdapterFactory_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PlatformAdapterFactory);
//# sourceMappingURL=platform-adapter.factory.js.map