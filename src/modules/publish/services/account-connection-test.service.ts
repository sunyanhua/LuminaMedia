import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformAdapterFactory } from '../adapters/platform-adapter.factory';
import { AccountCredentialService } from './account-credential.service';
import {
  PlatformType,
  PlatformConfig,
  WechatCredentials,
  XHSCredentials,
  WeiboCredentials,
  DouyinCredentials,
} from '../interfaces/platform-adapter.interface';
import { SocialAccount } from '../../../entities/social-account.entity';
import { AccountStatus } from '../../../shared/enums/account-status.enum';

/**
 * 账号连接测试服务
 * 负责测试社交媒体账号的连接状态和API可用性
 */
@Injectable()
export class AccountConnectionTestService {
  private readonly logger = new Logger(AccountConnectionTestService.name);

  constructor(
    @InjectRepository(SocialAccount)
    private readonly accountRepository: Repository<SocialAccount>,
    private readonly platformAdapterFactory: PlatformAdapterFactory,
    private readonly accountCredentialService: AccountCredentialService,
  ) {}

  /**
   * 测试账号连接
   */
  async testAccountConnection(
    accountId: string,
    tenantId: string = 'demo-tenant',
  ): Promise<TestResult> {
    try {
      this.logger.log(`Testing connection for account: ${accountId}`);

      // 获取账号信息和凭证
      const accounts =
        await this.accountCredentialService.getAllAccounts(tenantId);
      const account = accounts.find((acc) => acc.id === accountId);

      if (!account) {
        return {
          success: false,
          platform: 'unknown' as PlatformType,
          accountId,
          message: `Account not found: ${accountId}`,
          timestamp: new Date(),
        };
      }

      // 获取解密后的凭证
      const credentials =
        await this.accountCredentialService.getDecryptedCredentials(
          accountId,
          tenantId,
        );

      // 根据平台类型测试连接
      let result: TestResult;
      switch (account.platform) {
        case PlatformType.WECHAT:
          result = await this.testWechatConnection(
            credentials as WechatCredentials,
          );
          break;
        case PlatformType.XIAOHONGSHU:
          result = await this.testXiaohongshuConnection(
            credentials as XHSCredentials,
          );
          break;
        case PlatformType.WEIBO:
          result = await this.testWeiboConnection(
            credentials as WeiboCredentials,
          );
          break;
        case PlatformType.DOUYIN:
          result = await this.testDouyinConnection(
            credentials as DouyinCredentials,
          );
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

      // 更新账号测试结果
      await this.updateAccountTestResult(account, result);

      return {
        ...result,
        accountId,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Connection test failed for account ${accountId}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        platform: 'unknown' as PlatformType,
        accountId,
        message: `Connection test failed: ${error.message}`,
        error: error.toString(),
        timestamp: new Date(),
      };
    }
  }

  /**
   * 测试所有账号连接
   */
  async testAllAccounts(
    tenantId: string = 'demo-tenant',
  ): Promise<BatchTestResult> {
    const accounts =
      await this.accountCredentialService.getAllAccounts(tenantId);
    const results: TestResult[] = [];

    for (const account of accounts) {
      if (account.isEnabled) {
        try {
          const result = await this.testAccountConnection(account.id, tenantId);
          results.push(result);
        } catch (error) {
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

  /**
   * 测试微信公众号连接
   */
  private async testWechatConnection(
    credentials: WechatCredentials,
  ): Promise<TestResult> {
    try {
      // 创建测试配置
      const testConfig: PlatformConfig = {
        type: PlatformType.WECHAT,
        name: '微信连接测试',
        enabled: true,
        credentials,
        options: {
          timeout: 10000, // 10秒超时
          maxRetries: 1,
        },
      };

      // 创建适配器
      const adapter = this.platformAdapterFactory.createAdapter(testConfig);

      // 初始化适配器
      await adapter.initialize();

      // 执行健康检查
      const health = await adapter.healthCheck();

      // 清理适配器
      await adapter.cleanup();

      return {
        success: health.status === 'healthy',
        platform: PlatformType.WECHAT,
        message:
          health.message ||
          `微信公众号连接${health.status === 'healthy' ? '成功' : '失败'}`,
        details: {
          healthStatus: health.status,
          metrics: health.metrics,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        platform: PlatformType.WECHAT,
        message: `微信公众号连接失败: ${error.message}`,
        error: error.toString(),
        timestamp: new Date(),
      };
    }
  }

  /**
   * 测试小红书连接
   */
  private async testXiaohongshuConnection(
    credentials: XHSCredentials,
  ): Promise<TestResult> {
    try {
      // 创建测试配置
      const testConfig: PlatformConfig = {
        type: PlatformType.XIAOHONGSHU,
        name: '小红书连接测试',
        enabled: true,
        credentials,
        options: {
          timeout: 15000, // 15秒超时
          maxRetries: 1,
        },
      };

      // 创建适配器
      const adapter = this.platformAdapterFactory.createAdapter(testConfig);

      // 初始化适配器
      await adapter.initialize();

      // 执行健康检查
      const health = await adapter.healthCheck();

      // 清理适配器
      await adapter.cleanup();

      return {
        success: health.status === 'healthy',
        platform: PlatformType.XIAOHONGSHU,
        message:
          health.message ||
          `小红书连接${health.status === 'healthy' ? '成功' : '失败'}`,
        details: {
          healthStatus: health.status,
          metrics: health.metrics,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        platform: PlatformType.XIAOHONGSHU,
        message: `小红书连接失败: ${error.message}`,
        error: error.toString(),
        timestamp: new Date(),
      };
    }
  }

  /**
   * 测试微博连接
   */
  private async testWeiboConnection(
    credentials: WeiboCredentials,
  ): Promise<TestResult> {
    try {
      // 创建测试配置
      const testConfig: PlatformConfig = {
        type: PlatformType.WEIBO,
        name: '微博连接测试',
        enabled: true,
        credentials,
        options: {
          timeout: 10000,
          maxRetries: 1,
        },
      };

      // 创建适配器
      const adapter = this.platformAdapterFactory.createAdapter(testConfig);

      // 初始化适配器
      await adapter.initialize();

      // 执行健康检查
      const health = await adapter.healthCheck();

      // 清理适配器
      await adapter.cleanup();

      return {
        success: health.status === 'healthy',
        platform: PlatformType.WEIBO,
        message:
          health.message ||
          `微博连接${health.status === 'healthy' ? '成功' : '失败'}`,
        details: {
          healthStatus: health.status,
          metrics: health.metrics,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        platform: PlatformType.WEIBO,
        message: `微博连接失败: ${error.message}`,
        error: error.toString(),
        timestamp: new Date(),
      };
    }
  }

  /**
   * 测试抖音连接
   */
  private async testDouyinConnection(
    credentials: DouyinCredentials,
  ): Promise<TestResult> {
    try {
      // 创建测试配置
      const testConfig: PlatformConfig = {
        type: PlatformType.DOUYIN,
        name: '抖音连接测试',
        enabled: true,
        credentials,
        options: {
          timeout: 15000,
          maxRetries: 1,
        },
      };

      // 创建适配器
      const adapter = this.platformAdapterFactory.createAdapter(testConfig);

      // 初始化适配器
      await adapter.initialize();

      // 执行健康检查
      const health = await adapter.healthCheck();

      // 清理适配器
      await adapter.cleanup();

      return {
        success: health.status === 'healthy',
        platform: PlatformType.DOUYIN,
        message:
          health.message ||
          `抖音连接${health.status === 'healthy' ? '成功' : '失败'}`,
        details: {
          healthStatus: health.status,
          metrics: health.metrics,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        platform: PlatformType.DOUYIN,
        message: `抖音连接失败: ${error.message}`,
        error: error.toString(),
        timestamp: new Date(),
      };
    }
  }

  /**
   * 更新账号测试结果
   */
  private async updateAccountTestResult(
    account: SocialAccount,
    testResult: TestResult,
  ): Promise<void> {
    try {
      account.lastTestedAt = new Date();
      account.testResult = {
        success: testResult.success,
        message: testResult.message,
        timestamp: testResult.timestamp,
        details: testResult.details,
      };

      // 如果测试失败，更新状态为需要重新认证
      if (!testResult.success) {
        account.status = AccountStatus.RE_AUTH_REQUIRED;
      }

      await this.accountRepository.save(account);
      this.logger.log(`Test result updated for account: ${account.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to update test result: ${error.message}`,
        error.stack,
      );
    }
  }
}

/**
 * 测试结果接口
 */
export interface TestResult {
  success: boolean;
  platform: PlatformType;
  accountId?: string;
  message: string;
  error?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

/**
 * 批量测试结果接口
 */
export interface BatchTestResult {
  total: number;
  tested: number;
  successful: number;
  failed: number;
  results: TestResult[];
  timestamp: Date;
}
