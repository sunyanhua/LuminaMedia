import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  PlatformAdapter,
  PlatformConfig,
  PlatformType,
} from '../interfaces/platform-adapter.interface';
import { WechatAdapter } from './wechat.adapter';
import { XHSAdapter } from './xiaohongshu.adapter';
import { WeiboAdapter } from './weibo.adapter';
import { DouyinAdapter } from './douyin.adapter';

/**
 * 平台适配器工厂
 * 负责根据平台配置创建相应的适配器实例
 */
@Injectable()
export class PlatformAdapterFactory {
  private readonly logger = new Logger(PlatformAdapterFactory.name);
  private readonly adapterRegistry: Map<
    PlatformType,
    new (config: PlatformConfig) => PlatformAdapter
  >;

  constructor() {
    // 注册所有可用的适配器
    this.adapterRegistry = new Map();
    this.adapterRegistry.set(PlatformType.WECHAT, WechatAdapter);
    this.adapterRegistry.set(PlatformType.XIAOHONGSHU, XHSAdapter);
    this.adapterRegistry.set(PlatformType.WEIBO, WeiboAdapter);
    this.adapterRegistry.set(PlatformType.DOUYIN, DouyinAdapter);
    // 可以继续注册其他平台适配器
  }

  /**
   * 根据平台配置创建适配器实例
   */
  createAdapter(config: PlatformConfig): PlatformAdapter {
    if (!config.enabled) {
      throw new Error(`Platform ${config.type} is disabled`);
    }

    const AdapterClass = this.adapterRegistry.get(config.type);
    if (!AdapterClass) {
      throw new NotFoundException(
        `No adapter found for platform type: ${config.type}`,
      );
    }

    try {
      this.logger.log(
        `Creating adapter for platform: ${config.type} (${config.name})`,
      );
      const adapter = new AdapterClass(config);
      return adapter;
    } catch (error) {
      this.logger.error(
        `Failed to create adapter for platform ${config.type}: ${error.message}`,
        error.stack,
      );
      throw new Error(
        `Failed to create adapter for platform ${config.type}: ${error.message}`,
      );
    }
  }

  /**
   * 批量创建适配器实例
   */
  createAdapters(
    configs: PlatformConfig[],
  ): Map<PlatformType, PlatformAdapter> {
    const adapters = new Map<PlatformType, PlatformAdapter>();

    for (const config of configs) {
      if (!config.enabled) {
        this.logger.log(`Skipping disabled platform: ${config.type}`);
        continue;
      }

      try {
        const adapter = this.createAdapter(config);
        adapters.set(config.type, adapter);
        this.logger.log(`Adapter created for platform: ${config.type}`);
      } catch (error) {
        this.logger.error(
          `Failed to create adapter for platform ${config.type}: ${error.message}`,
        );
        // 继续创建其他适配器，不中断整个流程
      }
    }

    return adapters;
  }

  /**
   * 获取支持的所有平台类型
   */
  getSupportedPlatformTypes(): PlatformType[] {
    return Array.from(this.adapterRegistry.keys());
  }

  /**
   * 检查平台类型是否支持
   */
  isPlatformSupported(platformType: PlatformType): boolean {
    return this.adapterRegistry.has(platformType);
  }

  /**
   * 获取适配器类（用于测试或其他用途）
   */
  getAdapterClass(
    platformType: PlatformType,
  ): new (config: PlatformConfig) => PlatformAdapter {
    const AdapterClass = this.adapterRegistry.get(platformType);
    if (!AdapterClass) {
      throw new NotFoundException(
        `No adapter class found for platform type: ${platformType}`,
      );
    }
    return AdapterClass;
  }

  /**
   * 注册自定义适配器
   */
  registerAdapter(
    platformType: PlatformType,
    adapterClass: new (config: PlatformConfig) => PlatformAdapter,
  ): void {
    if (this.adapterRegistry.has(platformType)) {
      this.logger.warn(
        `Overriding existing adapter for platform type: ${platformType}`,
      );
    }
    this.adapterRegistry.set(platformType, adapterClass);
    this.logger.log(`Custom adapter registered for platform: ${platformType}`);
  }

  /**
   * 创建默认配置的适配器（用于测试和演示）
   */
  createDefaultAdapters(): Map<PlatformType, PlatformAdapter> {
    const defaultConfigs: PlatformConfig[] = [
      {
        type: PlatformType.WECHAT,
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
        type: PlatformType.XIAOHONGSHU,
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
        type: PlatformType.WEIBO,
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
        type: PlatformType.DOUYIN,
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

  /**
   * 验证平台配置
   */
  validateConfig(config: PlatformConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

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
    } else {
      // 根据平台类型验证凭证
      const credentialErrors = this.validateCredentials(
        config.type,
        config.credentials,
      );
      errors.push(...credentialErrors);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证平台凭证
   */
  private validateCredentials(
    platformType: PlatformType,
    credentials: any,
  ): string[] {
    const errors: string[] = [];

    switch (platformType) {
      case PlatformType.WECHAT:
        if (!credentials.appId) errors.push('WeChat appId is required');
        if (!credentials.appSecret) errors.push('WeChat appSecret is required');
        if (!credentials.wechatId) errors.push('WeChat wechatId is required');
        break;

      case PlatformType.XIAOHONGSHU:
        if (!credentials.username)
          errors.push('Xiaohongshu username is required');
        // 密码或session token至少需要一个
        if (
          !credentials.password &&
          !credentials.sessionToken &&
          !credentials.cookies
        ) {
          errors.push(
            'Xiaohongshu requires password, sessionToken, or cookies',
          );
        }
        break;

      case PlatformType.WEIBO:
        if (!credentials.appKey) errors.push('Weibo appKey is required');
        if (!credentials.appSecret) errors.push('Weibo appSecret is required');
        // accessToken或refresh token至少需要一个
        if (!credentials.accessToken && !credentials.refreshToken) {
          errors.push('Weibo requires accessToken or refreshToken');
        }
        break;

      case PlatformType.DOUYIN:
        if (!credentials.clientKey) errors.push('Douyin clientKey is required');
        if (!credentials.clientSecret)
          errors.push('Douyin clientSecret is required');
        // accessToken或refresh token至少需要一个
        if (!credentials.accessToken && !credentials.refreshToken) {
          errors.push('Douyin requires accessToken or refreshToken');
        }
        break;

      default:
        errors.push(
          `Validation not implemented for platform type: ${platformType}`,
        );
    }

    return errors;
  }

  /**
   * 初始化所有适配器
   */
  async initializeAdapters(
    adapters: Map<PlatformType, PlatformAdapter>,
  ): Promise<void> {
    const initializationPromises: Promise<void>[] = [];

    for (const [platformType, adapter] of adapters.entries()) {
      this.logger.log(`Initializing adapter for platform: ${platformType}`);
      initializationPromises.push(
        adapter.initialize().catch((error) => {
          this.logger.error(
            `Failed to initialize adapter for platform ${platformType}: ${error.message}`,
          );
          throw error;
        }),
      );
    }

    try {
      await Promise.all(initializationPromises);
      this.logger.log('All adapters initialized successfully');
    } catch (error) {
      this.logger.error(`Some adapters failed to initialize: ${error.message}`);
      // 继续运行，部分适配器可能仍然可用
    }
  }

  /**
   * 清理所有适配器资源
   */
  async cleanupAdapters(
    adapters: Map<PlatformType, PlatformAdapter>,
  ): Promise<void> {
    const cleanupPromises: Promise<void>[] = [];

    for (const [platformType, adapter] of adapters.entries()) {
      this.logger.log(`Cleaning up adapter for platform: ${platformType}`);
      cleanupPromises.push(
        adapter.cleanup().catch((error) => {
          this.logger.error(
            `Failed to cleanup adapter for platform ${platformType}: ${error.message}`,
          );
        }),
      );
    }

    try {
      await Promise.all(cleanupPromises);
      this.logger.log('All adapters cleaned up successfully');
    } catch (error) {
      this.logger.error(`Some adapters failed to cleanup: ${error.message}`);
    }
  }
}
