import { Test, TestingModule } from '@nestjs/testing';
import { PlatformAdapterFactory } from './platform-adapter.factory';
import { WechatAdapter } from './wechat.adapter';
import { XHSAdapter } from './xiaohongshu.adapter';
import { WeiboAdapter } from './weibo.adapter';
import { DouyinAdapter } from './douyin.adapter';
import {
  PlatformType,
  PlatformConfig,
  WechatCredentials,
  XHSCredentials,
  WeiboCredentials,
  DouyinCredentials,
} from '../interfaces/platform-adapter.interface';

// Mock adapters to avoid actual API calls
jest.mock('./wechat.adapter');
jest.mock('./xiaohongshu.adapter');
jest.mock('./weibo.adapter');
jest.mock('./douyin.adapter');

describe('PlatformAdapterFactory', () => {
  let factory: PlatformAdapterFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlatformAdapterFactory],
    }).compile();

    factory = module.get<PlatformAdapterFactory>(PlatformAdapterFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('createAdapter', () => {
    const wechatConfig: PlatformConfig = {
      type: PlatformType.WECHAT,
      name: 'WeChat Test',
      enabled: true,
      credentials: {
        appId: 'test_app_id',
        appSecret: 'test_app_secret',
        wechatId: 'test_wechat_id',
        wechatName: 'Test WeChat',
      } as WechatCredentials,
    };

    const xhsConfig: PlatformConfig = {
      type: PlatformType.XIAOHONGSHU,
      name: 'XHS Test',
      enabled: true,
      credentials: {
        username: 'test_user',
        password: 'test_password',
      } as XHSCredentials,
    };

    const weiboConfig: PlatformConfig = {
      type: PlatformType.WEIBO,
      name: 'Weibo Test',
      enabled: true,
      credentials: {
        appKey: 'test_app_key',
        appSecret: 'test_app_secret',
        accessToken: 'test_access_token',
      } as WeiboCredentials,
    };

    const douyinConfig: PlatformConfig = {
      type: PlatformType.DOUYIN,
      name: 'Douyin Test',
      enabled: true,
      credentials: {
        clientKey: 'test_client_key',
        clientSecret: 'test_client_secret',
        accessToken: 'test_access_token',
        openId: 'test_open_id',
      } as DouyinCredentials,
    };

    it('should create WechatAdapter for WECHAT platform type', () => {
      const adapter = factory.createAdapter(wechatConfig);

      expect(WechatAdapter).toHaveBeenCalledWith(wechatConfig);
      expect(adapter).toBeInstanceOf(WechatAdapter);
    });

    it('should create XHSAdapter for XIAOHONGSHU platform type', () => {
      const adapter = factory.createAdapter(xhsConfig);

      expect(XHSAdapter).toHaveBeenCalledWith(xhsConfig);
      expect(adapter).toBeInstanceOf(XHSAdapter);
    });

    it('should create WeiboAdapter for WEIBO platform type', () => {
      const adapter = factory.createAdapter(weiboConfig);

      expect(WeiboAdapter).toHaveBeenCalledWith(weiboConfig);
      expect(adapter).toBeInstanceOf(WeiboAdapter);
    });

    it('should create DouyinAdapter for DOUYIN platform type', () => {
      const adapter = factory.createAdapter(douyinConfig);

      expect(DouyinAdapter).toHaveBeenCalledWith(douyinConfig);
      expect(adapter).toBeInstanceOf(DouyinAdapter);
    });

    it('should throw error for disabled platform', () => {
      const disabledConfig = { ...wechatConfig, enabled: false };

      expect(() => factory.createAdapter(disabledConfig)).toThrow(
        'Platform wechat is disabled',
      );
    });

    it('should throw error for unsupported platform type', () => {
      const unsupportedConfig = {
        type: 'UNSUPPORTED' as PlatformType,
        name: 'Unsupported',
        enabled: true,
        credentials: {},
      };

      expect(() => factory.createAdapter(unsupportedConfig as any)).toThrow(
        'No adapter found for platform type: UNSUPPORTED',
      );
    });

    it('should handle adapter creation errors', () => {
      const error = new Error('Adapter creation failed');
      (
        WechatAdapter as jest.MockedClass<typeof WechatAdapter>
      ).mockImplementationOnce(() => {
        throw error;
      });

      expect(() => factory.createAdapter(wechatConfig)).toThrow(
        'Failed to create adapter for platform wechat: Adapter creation failed',
      );
    });
  });

  describe('createAdapters', () => {
    const configs: PlatformConfig[] = [
      {
        type: PlatformType.WECHAT,
        name: 'WeChat',
        enabled: true,
        credentials: {
          appId: 'id1',
          appSecret: 'secret1',
          wechatId: 'wid1',
          wechatName: 'WeChat1',
        } as WechatCredentials,
      },
      {
        type: PlatformType.XIAOHONGSHU,
        name: 'XHS',
        enabled: false, // Disabled, should be skipped
        credentials: { username: 'user1', password: 'pass1' } as XHSCredentials,
      },
      {
        type: PlatformType.WEIBO,
        name: 'Weibo',
        enabled: true,
        credentials: {
          appKey: 'key1',
          appSecret: 'secret1',
          accessToken: 'token1',
        } as WeiboCredentials,
      },
      {
        type: PlatformType.DOUYIN,
        name: 'Douyin',
        enabled: true,
        credentials: {
          clientKey: 'ckey1',
          clientSecret: 'csecret1',
          accessToken: 'token1',
        } as DouyinCredentials,
      },
    ];

    it('should create adapters for enabled platforms only', () => {
      const adapters = factory.createAdapters(configs);

      expect(adapters.size).toBe(3); // WECHAT, WEIBO, DOUYIN (XHS is disabled)
      expect(adapters.has(PlatformType.WECHAT)).toBe(true);
      expect(adapters.has(PlatformType.XIAOHONGSHU)).toBe(false); // Disabled
      expect(adapters.has(PlatformType.WEIBO)).toBe(true);
      expect(adapters.has(PlatformType.DOUYIN)).toBe(true);
    });

    it('should continue creating adapters even if one fails', () => {
      const error = new Error('WeChat adapter creation failed');
      (
        WechatAdapter as jest.MockedClass<typeof WechatAdapter>
      ).mockImplementationOnce(() => {
        throw error;
      });

      const adapters = factory.createAdapters(configs);

      // Should still create other adapters
      expect(adapters.size).toBe(2); // WEIBO and DOUYIN (WECHAT failed, XHS disabled)
      expect(adapters.has(PlatformType.WEIBO)).toBe(true);
      expect(adapters.has(PlatformType.DOUYIN)).toBe(true);
    });
  });

  describe('getSupportedPlatformTypes', () => {
    it('should return all supported platform types', () => {
      const supportedTypes = factory.getSupportedPlatformTypes();

      expect(supportedTypes).toContain(PlatformType.WECHAT);
      expect(supportedTypes).toContain(PlatformType.XIAOHONGSHU);
      expect(supportedTypes).toContain(PlatformType.WEIBO);
      expect(supportedTypes).toContain(PlatformType.DOUYIN);
      expect(supportedTypes.length).toBe(4);
    });
  });

  describe('isPlatformSupported', () => {
    it('should return true for supported platform types', () => {
      expect(factory.isPlatformSupported(PlatformType.WECHAT)).toBe(true);
      expect(factory.isPlatformSupported(PlatformType.XIAOHONGSHU)).toBe(true);
      expect(factory.isPlatformSupported(PlatformType.WEIBO)).toBe(true);
      expect(factory.isPlatformSupported(PlatformType.DOUYIN)).toBe(true);
    });

    it('should return false for unsupported platform types', () => {
      expect(factory.isPlatformSupported('UNSUPPORTED' as PlatformType)).toBe(
        false,
      );
    });
  });

  describe('validateConfig', () => {
    it('should validate WeChat config successfully', () => {
      const validConfig: PlatformConfig = {
        type: PlatformType.WECHAT,
        name: 'WeChat Valid',
        enabled: true,
        credentials: {
          appId: 'app_id',
          appSecret: 'app_secret',
          wechatId: 'wechat_id',
          wechatName: 'WeChat Name',
        } as WechatCredentials,
      };

      const result = factory.validateConfig(validConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid WeChat config', () => {
      const invalidConfig: PlatformConfig = {
        type: PlatformType.WECHAT,
        name: '',
        enabled: true,
        credentials: {} as WechatCredentials, // Missing required fields
      };

      const result = factory.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('WeChat appId is required');
      expect(result.errors).toContain('WeChat appSecret is required');
      expect(result.errors).toContain('WeChat wechatId is required');
      expect(result.errors).toContain('Platform name is required');
    });

    it('should validate XHS config successfully', () => {
      const validConfig: PlatformConfig = {
        type: PlatformType.XIAOHONGSHU,
        name: 'XHS Valid',
        enabled: true,
        credentials: {
          username: 'xhs_user',
          password: 'xhs_password',
        } as XHSCredentials,
      };

      const result = factory.validateConfig(validConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for XHS config without credentials', () => {
      const invalidConfig: PlatformConfig = {
        type: PlatformType.XIAOHONGSHU,
        name: 'XHS Invalid',
        enabled: true,
        credentials: {
          username: '', // Empty username
        } as XHSCredentials,
      };

      const result = factory.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Xiaohongshu username is required');
      expect(result.errors).toContain(
        'Xiaohongshu requires password, sessionToken, or cookies',
      );
    });
  });

  describe('registerAdapter', () => {
    it('should register custom adapter for new platform type', () => {
      const customPlatformType = 'CUSTOM' as PlatformType;
      const CustomAdapter = class CustomAdapter {};

      // Initially not supported
      expect(factory.isPlatformSupported(customPlatformType)).toBe(false);

      // Register custom adapter
      factory.registerAdapter(customPlatformType, CustomAdapter as any);

      // Now should be supported
      expect(factory.isPlatformSupported(customPlatformType)).toBe(true);

      // Should be able to create adapter
      const config: PlatformConfig = {
        type: customPlatformType,
        name: 'Custom Platform',
        enabled: true,
        credentials: { type: 'custom' },
      };

      const adapter = factory.createAdapter(config);
      expect(adapter).toBeInstanceOf(CustomAdapter);
    });

    it('should override existing adapter when registering same platform type', () => {
      const CustomAdapter = class CustomAdapter {};
      const originalAdapterClass = factory.getAdapterClass(PlatformType.WECHAT);

      factory.registerAdapter(PlatformType.WECHAT, CustomAdapter as any);

      const newAdapterClass = factory.getAdapterClass(PlatformType.WECHAT);
      expect(newAdapterClass).toBe(CustomAdapter);
      expect(newAdapterClass).not.toBe(originalAdapterClass);
    });
  });
});
