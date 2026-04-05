"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const platform_adapter_factory_1 = require("./platform-adapter.factory");
const wechat_adapter_1 = require("./wechat.adapter");
const xiaohongshu_adapter_1 = require("./xiaohongshu.adapter");
const weibo_adapter_1 = require("./weibo.adapter");
const douyin_adapter_1 = require("./douyin.adapter");
const platform_adapter_interface_1 = require("../interfaces/platform-adapter.interface");
jest.mock('./wechat.adapter');
jest.mock('./xiaohongshu.adapter');
jest.mock('./weibo.adapter');
jest.mock('./douyin.adapter');
describe('PlatformAdapterFactory', () => {
    let factory;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [platform_adapter_factory_1.PlatformAdapterFactory],
        }).compile();
        factory = module.get(platform_adapter_factory_1.PlatformAdapterFactory);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(factory).toBeDefined();
    });
    describe('createAdapter', () => {
        const wechatConfig = {
            type: platform_adapter_interface_1.PlatformType.WECHAT,
            name: 'WeChat Test',
            enabled: true,
            credentials: {
                appId: 'test_app_id',
                appSecret: 'test_app_secret',
                wechatId: 'test_wechat_id',
                wechatName: 'Test WeChat',
            },
        };
        const xhsConfig = {
            type: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
            name: 'XHS Test',
            enabled: true,
            credentials: {
                username: 'test_user',
                password: 'test_password',
            },
        };
        const weiboConfig = {
            type: platform_adapter_interface_1.PlatformType.WEIBO,
            name: 'Weibo Test',
            enabled: true,
            credentials: {
                appKey: 'test_app_key',
                appSecret: 'test_app_secret',
                accessToken: 'test_access_token',
            },
        };
        const douyinConfig = {
            type: platform_adapter_interface_1.PlatformType.DOUYIN,
            name: 'Douyin Test',
            enabled: true,
            credentials: {
                clientKey: 'test_client_key',
                clientSecret: 'test_client_secret',
                accessToken: 'test_access_token',
                openId: 'test_open_id',
            },
        };
        it('should create WechatAdapter for WECHAT platform type', () => {
            const adapter = factory.createAdapter(wechatConfig);
            expect(wechat_adapter_1.WechatAdapter).toHaveBeenCalledWith(wechatConfig);
            expect(adapter).toBeInstanceOf(wechat_adapter_1.WechatAdapter);
        });
        it('should create XHSAdapter for XIAOHONGSHU platform type', () => {
            const adapter = factory.createAdapter(xhsConfig);
            expect(xiaohongshu_adapter_1.XHSAdapter).toHaveBeenCalledWith(xhsConfig);
            expect(adapter).toBeInstanceOf(xiaohongshu_adapter_1.XHSAdapter);
        });
        it('should create WeiboAdapter for WEIBO platform type', () => {
            const adapter = factory.createAdapter(weiboConfig);
            expect(weibo_adapter_1.WeiboAdapter).toHaveBeenCalledWith(weiboConfig);
            expect(adapter).toBeInstanceOf(weibo_adapter_1.WeiboAdapter);
        });
        it('should create DouyinAdapter for DOUYIN platform type', () => {
            const adapter = factory.createAdapter(douyinConfig);
            expect(douyin_adapter_1.DouyinAdapter).toHaveBeenCalledWith(douyinConfig);
            expect(adapter).toBeInstanceOf(douyin_adapter_1.DouyinAdapter);
        });
        it('should throw error for disabled platform', () => {
            const disabledConfig = { ...wechatConfig, enabled: false };
            expect(() => factory.createAdapter(disabledConfig)).toThrow('Platform wechat is disabled');
        });
        it('should throw error for unsupported platform type', () => {
            const unsupportedConfig = {
                type: 'UNSUPPORTED',
                name: 'Unsupported',
                enabled: true,
                credentials: {},
            };
            expect(() => factory.createAdapter(unsupportedConfig)).toThrow('No adapter found for platform type: UNSUPPORTED');
        });
        it('should handle adapter creation errors', () => {
            const error = new Error('Adapter creation failed');
            wechat_adapter_1.WechatAdapter.mockImplementationOnce(() => {
                throw error;
            });
            expect(() => factory.createAdapter(wechatConfig)).toThrow('Failed to create adapter for platform wechat: Adapter creation failed');
        });
    });
    describe('createAdapters', () => {
        const configs = [
            {
                type: platform_adapter_interface_1.PlatformType.WECHAT,
                name: 'WeChat',
                enabled: true,
                credentials: {
                    appId: 'id1',
                    appSecret: 'secret1',
                    wechatId: 'wid1',
                    wechatName: 'WeChat1',
                },
            },
            {
                type: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
                name: 'XHS',
                enabled: false,
                credentials: { username: 'user1', password: 'pass1' },
            },
            {
                type: platform_adapter_interface_1.PlatformType.WEIBO,
                name: 'Weibo',
                enabled: true,
                credentials: {
                    appKey: 'key1',
                    appSecret: 'secret1',
                    accessToken: 'token1',
                },
            },
            {
                type: platform_adapter_interface_1.PlatformType.DOUYIN,
                name: 'Douyin',
                enabled: true,
                credentials: {
                    clientKey: 'ckey1',
                    clientSecret: 'csecret1',
                    accessToken: 'token1',
                },
            },
        ];
        it('should create adapters for enabled platforms only', () => {
            const adapters = factory.createAdapters(configs);
            expect(adapters.size).toBe(3);
            expect(adapters.has(platform_adapter_interface_1.PlatformType.WECHAT)).toBe(true);
            expect(adapters.has(platform_adapter_interface_1.PlatformType.XIAOHONGSHU)).toBe(false);
            expect(adapters.has(platform_adapter_interface_1.PlatformType.WEIBO)).toBe(true);
            expect(adapters.has(platform_adapter_interface_1.PlatformType.DOUYIN)).toBe(true);
        });
        it('should continue creating adapters even if one fails', () => {
            const error = new Error('WeChat adapter creation failed');
            wechat_adapter_1.WechatAdapter.mockImplementationOnce(() => {
                throw error;
            });
            const adapters = factory.createAdapters(configs);
            expect(adapters.size).toBe(2);
            expect(adapters.has(platform_adapter_interface_1.PlatformType.WEIBO)).toBe(true);
            expect(adapters.has(platform_adapter_interface_1.PlatformType.DOUYIN)).toBe(true);
        });
    });
    describe('getSupportedPlatformTypes', () => {
        it('should return all supported platform types', () => {
            const supportedTypes = factory.getSupportedPlatformTypes();
            expect(supportedTypes).toContain(platform_adapter_interface_1.PlatformType.WECHAT);
            expect(supportedTypes).toContain(platform_adapter_interface_1.PlatformType.XIAOHONGSHU);
            expect(supportedTypes).toContain(platform_adapter_interface_1.PlatformType.WEIBO);
            expect(supportedTypes).toContain(platform_adapter_interface_1.PlatformType.DOUYIN);
            expect(supportedTypes.length).toBe(4);
        });
    });
    describe('isPlatformSupported', () => {
        it('should return true for supported platform types', () => {
            expect(factory.isPlatformSupported(platform_adapter_interface_1.PlatformType.WECHAT)).toBe(true);
            expect(factory.isPlatformSupported(platform_adapter_interface_1.PlatformType.XIAOHONGSHU)).toBe(true);
            expect(factory.isPlatformSupported(platform_adapter_interface_1.PlatformType.WEIBO)).toBe(true);
            expect(factory.isPlatformSupported(platform_adapter_interface_1.PlatformType.DOUYIN)).toBe(true);
        });
        it('should return false for unsupported platform types', () => {
            expect(factory.isPlatformSupported('UNSUPPORTED')).toBe(false);
        });
    });
    describe('validateConfig', () => {
        it('should validate WeChat config successfully', () => {
            const validConfig = {
                type: platform_adapter_interface_1.PlatformType.WECHAT,
                name: 'WeChat Valid',
                enabled: true,
                credentials: {
                    appId: 'app_id',
                    appSecret: 'app_secret',
                    wechatId: 'wechat_id',
                    wechatName: 'WeChat Name',
                },
            };
            const result = factory.validateConfig(validConfig);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it('should return errors for invalid WeChat config', () => {
            const invalidConfig = {
                type: platform_adapter_interface_1.PlatformType.WECHAT,
                name: '',
                enabled: true,
                credentials: {},
            };
            const result = factory.validateConfig(invalidConfig);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('WeChat appId is required');
            expect(result.errors).toContain('WeChat appSecret is required');
            expect(result.errors).toContain('WeChat wechatId is required');
            expect(result.errors).toContain('Platform name is required');
        });
        it('should validate XHS config successfully', () => {
            const validConfig = {
                type: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
                name: 'XHS Valid',
                enabled: true,
                credentials: {
                    username: 'xhs_user',
                    password: 'xhs_password',
                },
            };
            const result = factory.validateConfig(validConfig);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it('should return errors for XHS config without credentials', () => {
            const invalidConfig = {
                type: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
                name: 'XHS Invalid',
                enabled: true,
                credentials: {
                    username: '',
                },
            };
            const result = factory.validateConfig(invalidConfig);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Xiaohongshu username is required');
            expect(result.errors).toContain('Xiaohongshu requires password, sessionToken, or cookies');
        });
    });
    describe('registerAdapter', () => {
        it('should register custom adapter for new platform type', () => {
            const customPlatformType = 'CUSTOM';
            const CustomAdapter = class CustomAdapter {
            };
            expect(factory.isPlatformSupported(customPlatformType)).toBe(false);
            factory.registerAdapter(customPlatformType, CustomAdapter);
            expect(factory.isPlatformSupported(customPlatformType)).toBe(true);
            const config = {
                type: customPlatformType,
                name: 'Custom Platform',
                enabled: true,
                credentials: { type: 'custom' },
            };
            const adapter = factory.createAdapter(config);
            expect(adapter).toBeInstanceOf(CustomAdapter);
        });
        it('should override existing adapter when registering same platform type', () => {
            const CustomAdapter = class CustomAdapter {
            };
            const originalAdapterClass = factory.getAdapterClass(platform_adapter_interface_1.PlatformType.WECHAT);
            factory.registerAdapter(platform_adapter_interface_1.PlatformType.WECHAT, CustomAdapter);
            const newAdapterClass = factory.getAdapterClass(platform_adapter_interface_1.PlatformType.WECHAT);
            expect(newAdapterClass).toBe(CustomAdapter);
            expect(newAdapterClass).not.toBe(originalAdapterClass);
        });
    });
});
//# sourceMappingURL=platform-adapter.factory.spec.js.map