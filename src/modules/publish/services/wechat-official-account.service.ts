import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialAccount } from '../../../entities/social-account.entity';
import { PlatformType } from '../interfaces/platform-adapter.interface';
import { AccountStatus } from '../../../shared/enums/account-status.enum';
import { ConfigService } from '@nestjs/config';

/**
 * 微信公众号账号服务
 * 处理微信公众号绑定、授权和数据获取
 */
@Injectable()
export class WechatOfficialAccountService {
  private readonly logger = new Logger(WechatOfficialAccountService.name);

  // DEMO模拟数据
  private readonly demoWechatAccounts = [
    {
      mpAppId: 'wx_demo_appid_001',
      mpName: '政务宣传公众号',
      wechatId: 'gh_demo123456',
      wechatName: '政务宣传',
      fansCount: 12500,
      totalRead: 356800,
      totalLike: 8920,
      totalShare: 4450,
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    {
      mpAppId: 'wx_demo_appid_002',
      mpName: '政策解读公众号',
      wechatId: 'gh_demo789012',
      wechatName: '政策解读',
      fansCount: 8900,
      totalRead: 234500,
      totalLike: 5670,
      totalShare: 2890,
      avatarUrl: 'https://example.com/avatar2.jpg',
    },
  ];

  constructor(
    @InjectRepository(SocialAccount)
    private readonly accountRepository: Repository<SocialAccount>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 获取微信授权URL（模拟）
   * @param tenantId 租户ID
   * @param redirectUri 回调地址
   */
  async getAuthorizationUrl(
    tenantId: string,
    redirectUri: string,
  ): Promise<{ url: string; state: string }> {
    // 在真实环境中，这里会生成微信OAuth授权URL
    // 对于DEMO，我们返回一个模拟URL
    const state = `wechat_auth_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // 模拟URL，实际前端会处理这个URL并模拟回调
    const baseUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const url = `${baseUrl}/api/wechat/auth/callback?state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    this.logger.log(`Generated WeChat authorization URL for tenant ${tenantId}`);
    return { url, state };
  }

  /**
   * 处理授权回调（模拟）
   * @param code 授权码（模拟）
   * @param state 状态参数
   */
  async handleAuthorizationCallback(
    code: string,
    state: string,
    tenantId: string,
  ): Promise<{
    success: boolean;
    accountId?: string;
    mpName?: string;
    error?: string;
  }> {
    try {
      this.logger.log(`Processing WeChat authorization callback for tenant ${tenantId}, state: ${state}`);

      // 模拟从微信API获取access_token
      const accessToken = `wx_access_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const refreshToken = `wx_refresh_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const expiresAt = new Date(Date.now() + 7200 * 1000); // 2小时后过期

      // 随机选择一个DEMO公众号信息
      const demoAccount = this.demoWechatAccounts[
        Math.floor(Math.random() * this.demoWechatAccounts.length)
      ];

      // 检查是否已存在该公众号账号
      let account = await this.accountRepository.findOne({
        where: {
          tenantId,
          platform: PlatformType.WECHAT,
          platformUserId: demoAccount.wechatId,
        },
      });

      const accountId = `wechat_${tenantId}_${demoAccount.wechatId}`;

      if (!account) {
        // 创建新账号
        account = this.accountRepository.create({
          id: accountId,
          tenantId,
          platform: PlatformType.WECHAT,
          accountName: demoAccount.mpName,
          platformUserId: demoAccount.wechatId,
          platformUserName: demoAccount.wechatName,
          avatarUrl: demoAccount.avatarUrl,
          encryptedCredentials: '', // 凭证由AccountCredentialService单独处理
          credentialHash: null,
          config: {
            mpAppId: demoAccount.mpAppId,
            mpName: demoAccount.mpName,
            accessToken,
            refreshToken,
            expiresAt: expiresAt.toISOString(),
            fansCount: demoAccount.fansCount,
            totalRead: demoAccount.totalRead,
            totalLike: demoAccount.totalLike,
            totalShare: demoAccount.totalShare,
            lastDataUpdate: new Date().toISOString(),
          },
          quotaInfo: {
            dailyLimit: 1000,
            usedToday: 0,
            remainingToday: 1000,
          },
          isEnabled: true,
          status: AccountStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // 更新现有账号
        account.config = {
          ...account.config,
          mpAppId: demoAccount.mpAppId,
          mpName: demoAccount.mpName,
          accessToken,
          refreshToken,
          expiresAt: expiresAt.toISOString(),
          fansCount: demoAccount.fansCount,
          totalRead: demoAccount.totalRead,
          totalLike: demoAccount.totalLike,
          totalShare: demoAccount.totalShare,
          lastDataUpdate: new Date().toISOString(),
        };
        account.updatedAt = new Date();
      }

      await this.accountRepository.save(account);

      this.logger.log(`WeChat account bound successfully: ${accountId}`);

      return {
        success: true,
        accountId: account.id,
        mpName: demoAccount.mpName,
      };
    } catch (error) {
      this.logger.error(`Failed to handle WeChat authorization callback: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 获取已绑定的微信公众号列表
   * @param tenantId 租户ID
   */
  async getBoundAccounts(tenantId: string): Promise<any[]> {
    const accounts = await this.accountRepository.find({
      where: {
        tenantId,
        platform: PlatformType.WECHAT,
        status: AccountStatus.ACTIVE,
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    return accounts.map(account => ({
      id: account.id,
      mpName: account.config?.mpName || account.accountName,
      wechatId: account.platformUserId,
      wechatName: account.platformUserName,
      avatarUrl: account.avatarUrl,
      fansCount: account.config?.fansCount || 0,
      totalRead: account.config?.totalRead || 0,
      totalLike: account.config?.totalLike || 0,
      totalShare: account.config?.totalShare || 0,
      isEnabled: account.isEnabled,
      status: account.status,
      lastDataUpdate: account.config?.lastDataUpdate,
      boundAt: account.createdAt,
      lastUsedAt: account.lastUsedAt,
    }));
  }

  /**
   * 获取公众号详细信息
   * @param accountId 账号ID
   * @param tenantId 租户ID
   */
  async getAccountDetails(accountId: string, tenantId: string): Promise<any> {
    const account = await this.accountRepository.findOne({
      where: {
        id: accountId,
        tenantId,
        platform: PlatformType.WECHAT,
      },
    });

    if (!account) {
      throw new Error(`WeChat account not found: ${accountId}`);
    }

    // 模拟公众号数据统计（可以扩展为真实API调用）
    const stats = await this.getAccountStats(accountId, tenantId);

    return {
      id: account.id,
      mpName: account.config?.mpName || account.accountName,
      wechatId: account.platformUserId,
      wechatName: account.platformUserName,
      avatarUrl: account.avatarUrl,
      config: account.config,
      quotaInfo: account.quotaInfo,
      isEnabled: account.isEnabled,
      status: account.status,
      stats,
      boundAt: account.createdAt,
      lastUsedAt: account.lastUsedAt,
      lastTestedAt: account.lastTestedAt,
    };
  }

  /**
   * 获取公众号统计数据（模拟）
   * @param accountId 账号ID
   * @param tenantId 租户ID
   */
  async getAccountStats(accountId: string, tenantId: string): Promise<any> {
    // 模拟数据 - 在实际应用中应该调用微信API
    const account = await this.accountRepository.findOne({
      where: { id: accountId, tenantId },
    });

    const baseFans = account?.config?.fansCount || 10000;
    const baseRead = account?.config?.totalRead || 300000;
    const baseLike = account?.config?.totalLike || 7500;
    const baseShare = account?.config?.totalShare || 3750;

    // 生成一些随机变化，模拟数据更新
    const now = new Date();
    const hour = now.getHours();

    // 模拟不同时间段的数据变化
    let hourlyMultiplier = 1.0;
    if (hour >= 9 && hour <= 11) {
      hourlyMultiplier = 1.3; // 上午活跃
    } else if (hour >= 12 && hour <= 14) {
      hourlyMultiplier = 1.5; // 中午高峰
    } else if (hour >= 19 && hour <= 22) {
      hourlyMultiplier = 1.8; // 晚间高峰
    }

    const randomFactor = 0.9 + Math.random() * 0.2; // 0.9-1.1随机因子

    return {
      // 基础数据
      fansCount: baseFans,
      totalRead: baseRead,
      totalLike: baseLike,
      totalShare: baseShare,

      // 今日数据（模拟）
      today: {
        newFans: Math.floor(50 * hourlyMultiplier * randomFactor),
        lostFans: Math.floor(5 * randomFactor),
        netFans: Math.floor(45 * hourlyMultiplier * randomFactor),
        readCount: Math.floor(1200 * hourlyMultiplier * randomFactor),
        likeCount: Math.floor(30 * hourlyMultiplier * randomFactor),
        shareCount: Math.floor(15 * hourlyMultiplier * randomFactor),
        commentCount: Math.floor(8 * hourlyMultiplier * randomFactor),
      },

      // 7天趋势（模拟）
      weeklyTrend: {
        fans: Array.from({ length: 7 }, (_, i) =>
          baseFans + Math.floor((i + 1) * 45 * hourlyMultiplier)
        ),
        read: Array.from({ length: 7 }, (_, i) =>
          Math.floor(1200 * hourlyMultiplier * (0.8 + i * 0.05))
        ),
        like: Array.from({ length: 7 }, (_, i) =>
          Math.floor(30 * hourlyMultiplier * (0.9 + i * 0.03))
        ),
        share: Array.from({ length: 7 }, (_, i) =>
          Math.floor(15 * hourlyMultiplier * (0.85 + i * 0.04))
        ),
      },

      // 热门文章（模拟）
      topArticles: [
        {
          title: '最新政策解读：数字化转型助力政务公开',
          publishTime: new Date(Date.now() - 86400000).toISOString(), // 1天前
          readCount: Math.floor(8500 * randomFactor),
          likeCount: Math.floor(210 * randomFactor),
          shareCount: Math.floor(105 * randomFactor),
          url: '#',
        },
        {
          title: '政务新媒体运营经验分享',
          publishTime: new Date(Date.now() - 172800000).toISOString(), // 2天前
          readCount: Math.floor(7200 * randomFactor),
          likeCount: Math.floor(180 * randomFactor),
          shareCount: Math.floor(90 * randomFactor),
          url: '#',
        },
        {
          title: '智慧政务建设成果展示',
          publishTime: new Date(Date.now() - 259200000).toISOString(), // 3天前
          readCount: Math.floor(6500 * randomFactor),
          likeCount: Math.floor(160 * randomFactor),
          shareCount: Math.floor(80 * randomFactor),
          url: '#',
        },
      ],

      // 粉丝画像（模拟）
      fanProfile: {
        gender: {
          male: 52,
          female: 48,
        },
        age: {
          '18-25': 15,
          '26-35': 35,
          '36-45': 30,
          '46-55': 15,
          '56+': 5,
        },
        region: {
          '北京': 25,
          '上海': 20,
          '广东': 18,
          '浙江': 12,
          '其他': 25,
        },
      },

      updatedAt: new Date(),
    };
  }

  /**
   * 刷新公众号token（模拟）
   * @param accountId 账号ID
   * @param tenantId 租户ID
   */
  async refreshAccessToken(accountId: string, tenantId: string): Promise<{
    success: boolean;
    newToken?: string;
    expiresAt?: Date;
    error?: string;
  }> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id: accountId, tenantId },
      });

      if (!account) {
        return {
          success: false,
          error: '账号不存在',
        };
      }

      // 模拟新token
      const newToken = `wx_access_token_refreshed_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const expiresAt = new Date(Date.now() + 7200 * 1000);

      // 更新config中的token信息
      account.config = {
        ...account.config,
        accessToken: newToken,
        expiresAt: expiresAt.toISOString(),
      };
      account.updatedAt = new Date();

      await this.accountRepository.save(account);

      this.logger.log(`WeChat access token refreshed for account: ${accountId}`);

      return {
        success: true,
        newToken,
        expiresAt,
      };
    } catch (error) {
      this.logger.error(`Failed to refresh WeChat access token: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 解除公众号绑定
   * @param accountId 账号ID
   * @param tenantId 租户ID
   */
  async unbindAccount(accountId: string, tenantId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id: accountId, tenantId },
      });

      if (!account) {
        return {
          success: false,
          error: '账号不存在',
        };
      }

      // 标记账号为禁用状态
      account.isEnabled = false;
      account.status = AccountStatus.EXPIRED;
      account.updatedAt = new Date();

      await this.accountRepository.save(account);

      this.logger.log(`WeChat account unbound: ${accountId}`);

      return {
        success: true,
        message: '公众号解绑成功',
      };
    } catch (error) {
      this.logger.error(`Failed to unbind WeChat account: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 更新公众号数据（模拟从微信API同步）
   * @param accountId 账号ID
   * @param tenantId 租户ID
   */
  async updateAccountData(accountId: string, tenantId: string): Promise<{
    success: boolean;
    updatedData?: any;
    error?: string;
  }> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id: accountId, tenantId },
      });

      if (!account) {
        return {
          success: false,
          error: '账号不存在',
        };
      }

      // 模拟从微信API获取最新数据
      const demoAccount = this.demoWechatAccounts[
        Math.floor(Math.random() * this.demoWechatAccounts.length)
      ];

      // 模拟数据增长
      const growthFactor = 1.0 + Math.random() * 0.05; // 0-5%增长
      const currentFans = account.config?.fansCount || demoAccount.fansCount;
      const currentRead = account.config?.totalRead || demoAccount.totalRead;
      const currentLike = account.config?.totalLike || demoAccount.totalLike;
      const currentShare = account.config?.totalShare || demoAccount.totalShare;

      const updatedConfig = {
        ...account.config,
        fansCount: Math.floor(currentFans * growthFactor),
        totalRead: Math.floor(currentRead + 1000 * growthFactor),
        totalLike: Math.floor(currentLike + 25 * growthFactor),
        totalShare: Math.floor(currentShare + 12 * growthFactor),
        lastDataUpdate: new Date().toISOString(),
      };

      account.config = updatedConfig;
      account.updatedAt = new Date();
      account.lastUsedAt = new Date();

      await this.accountRepository.save(account);

      this.logger.log(`WeChat account data updated: ${accountId}`);

      return {
        success: true,
        updatedData: {
          fansCount: updatedConfig.fansCount,
          totalRead: updatedConfig.totalRead,
          totalLike: updatedConfig.totalLike,
          totalShare: updatedConfig.totalShare,
          lastDataUpdate: updatedConfig.lastDataUpdate,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to update WeChat account data: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}