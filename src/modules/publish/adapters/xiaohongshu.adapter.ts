import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  PlatformAdapter,
  PlatformType,
  PublishContentInput,
  PublishResult,
  PublishStatus,
  PublishStatusType,
  PlatformHealthStatus,
  PlatformStats,
  XHSCredentials,
} from '../interfaces/platform-adapter.interface';
import type { PlatformConfig } from '../interfaces/platform-adapter.interface';

/**
 * 小红书适配器
 * 使用OpenClaw Browser Agent模拟用户操作发布内容
 *
 * 小红书没有官方API，发布流程：
 * 1. 启动Browser Agent → 2. 登录账号 → 3. 模拟点击发布
 * 4. 填写内容 → 5. 上传图片 → 6. 提交发布
 * 7. 获取发布链接 → 8. 关闭Browser
 */
@Injectable()
export class XHSAdapter implements PlatformAdapter {
  private readonly logger = new Logger(XHSAdapter.name);
  private readonly http: AxiosInstance;
  private credentials: XHSCredentials;
  private config: PlatformConfig;
  private browserAgent: any; // OpenClaw Browser Agent实例
  private isLoggedIn: boolean = false;

  constructor(config: PlatformConfig) {
    if (config.type !== PlatformType.XIAOHONGSHU) {
      throw new Error(`Invalid platform type for XHSAdapter: ${config.type}`);
    }

    this.config = config;
    this.credentials = config.credentials as XHSCredentials;
    this.http = axios.create({
      baseURL: 'https://www.xiaohongshu.com/',
      timeout: config.options?.timeout || 60000, // 小红书操作较慢，超时时间较长
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/json',
        ...config.options?.customHeaders,
      },
    });

    // 初始化Browser Agent（简化实现）
    this.initializeBrowserAgent();
  }

  getPlatformName(): string {
    return `小红书 - ${this.credentials.username || '未登录'}`;
  }

  getPlatformType(): PlatformType {
    return PlatformType.XIAOHONGSHU;
  }

  async initialize(): Promise<void> {
    this.logger.log(
      `Initializing Xiaohongshu adapter for: ${this.credentials.username}`,
    );

    try {
      // 尝试使用现有session token登录
      if (this.credentials.sessionToken || this.credentials.cookies) {
        await this.loginWithSession();
      } else if (this.credentials.username && this.credentials.password) {
        await this.loginWithCredentials();
      } else {
        this.logger.warn(
          'No credentials provided for Xiaohongshu, adapter will operate in limited mode',
        );
      }

      this.logger.log('Xiaohongshu adapter initialized successfully');
    } catch (error) {
      this.logger.error(
        `Failed to initialize Xiaohongshu adapter: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async healthCheck(): Promise<PlatformHealthStatus> {
    try {
      const startTime = Date.now();

      // 检查网络连接
      await this.http.get('/');
      const networkLatency = Date.now() - startTime;

      // 检查登录状态
      const loginStatus = this.isLoggedIn ? 'logged_in' : 'not_logged_in';

      return {
        status: this.isLoggedIn ? 'healthy' : 'degraded',
        message: `Xiaohongshu adapter ${this.isLoggedIn ? 'is logged in' : 'is not logged in'}`,
        lastChecked: new Date(),
        metrics: {
          availability: 100,
          latency: networkLatency,
          successRate: this.isLoggedIn ? 90 : 50, // 预估成功率
          quotaUsed: 0,
          quotaRemaining: 100,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Xiaohongshu health check failed: ${error.message}`,
        lastChecked: new Date(),
        metrics: {
          availability: 0,
          latency: 0,
          successRate: 0,
          quotaUsed: 0,
          quotaRemaining: 0,
        },
      };
    }
  }

  async publishContent(content: PublishContentInput): Promise<PublishResult> {
    this.logger.log(`Publishing content to Xiaohongshu: ${content.title}`);

    if (!this.isLoggedIn) {
      throw new Error(
        'Xiaohongshu adapter is not logged in. Please login first.',
      );
    }

    try {
      // 使用Browser Agent发布内容
      const result = await this.publishWithBrowserAgent(content);

      return {
        publishId: result.publishId,
        platform: PlatformType.XIAOHONGSHU,
        status: PublishStatusType.PUBLISHED,
        url: result.url,
        rawResponse: result.rawResponse,
        publishedAt: new Date(),
        metadata: {
          noteId: result.noteId,
          imageCount: content.coverImages?.length || 0,
          videoPosted: !!content.videoUrl,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to publish content to Xiaohongshu: ${error.message}`,
        error.stack,
      );

      // 尝试重试（小红书发布容易失败）
      const maxRetries = this.config.options?.maxRetries || 3;
      for (let retry = 1; retry <= maxRetries; retry++) {
        try {
          this.logger.log(
            `Retrying Xiaohongshu publish (attempt ${retry}/${maxRetries})`,
          );
          const result = await this.publishWithBrowserAgent(content);

          return {
            publishId: result.publishId,
            platform: PlatformType.XIAOHONGSHU,
            status: PublishStatusType.PUBLISHED,
            url: result.url,
            rawResponse: result.rawResponse,
            publishedAt: new Date(),
            metadata: {
              noteId: result.noteId,
              retryCount: retry,
            },
          };
        } catch (retryError) {
          if (retry === maxRetries) {
            return {
              publishId: `error_${Date.now()}`,
              platform: PlatformType.XIAOHONGSHU,
              status: PublishStatusType.FAILED,
              error: `Failed after ${maxRetries} retries: ${retryError.message}`,
              publishedAt: new Date(),
              metadata: {
                retryCount: retry,
              },
            };
          }
          await this.delay(this.config.options?.retryDelay || 5000);
        }
      }

      // 所有重试都失败
      return {
        publishId: `error_${Date.now()}`,
        platform: PlatformType.XIAOHONGSHU,
        status: PublishStatusType.FAILED,
        error: error.message,
        publishedAt: new Date(),
      };
    }
  }

  async getPublishStatus(publishId: string): Promise<PublishStatus> {
    // 小红书不提供发布状态API，我们假设已发布成功
    // 可以通过访问笔记页面来验证
    try {
      const noteUrl = `https://www.xiaohongshu.com/explore/${publishId}`;
      const response = await this.http.get(noteUrl);
      const isPublished = response.status === 200;

      return {
        publishId,
        status: isPublished
          ? PublishStatusType.PUBLISHED
          : PublishStatusType.FAILED,
        message: isPublished
          ? 'Note is published and accessible'
          : 'Note not found or not accessible',
        lastUpdated: new Date(),
      };
    } catch (error) {
      return {
        publishId,
        status: PublishStatusType.FAILED,
        message: `Failed to check publish status: ${error.message}`,
        lastUpdated: new Date(),
      };
    }
  }

  async updateContent(
    publishId: string,
    content: Partial<PublishContentInput>,
  ): Promise<PublishResult> {
    // 小红书不支持直接更新已发布内容，需要删除后重新发布
    this.logger.warn(
      'Xiaohongshu does not support content update. Need to delete and republish.',
    );
    throw new Error(
      'Xiaohongshu does not support content update. Use delete and republish instead.',
    );
  }

  async deleteContent(publishId: string): Promise<void> {
    try {
      // 使用Browser Agent删除笔记
      await this.deleteNoteWithBrowserAgent(publishId);
      this.logger.log(`Deleted Xiaohongshu note: ${publishId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete Xiaohongshu note: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getPlatformStats(): Promise<PlatformStats> {
    // 获取小红书账号统计信息（简化实现）
    return {
      platform: PlatformType.XIAOHONGSHU,
      totalPublished: 0, // 需要从数据库获取
      totalFailed: 0,
      totalScheduled: 0,
      averagePublishTime: 120000, // 小红书发布较慢，约2分钟
      successRate: 85, // 小红书发布成功率相对较低
      lastPublishAt: new Date(),
      quotaInfo: {
        dailyLimit: 10, // 小红书每日发布限制（防spam）
        usedToday: 0,
        remainingToday: 10,
        resetAt: this.getNextMidnight(),
      },
    };
  }

  async cleanup(): Promise<void> {
    this.logger.log('Cleaning up Xiaohongshu adapter resources');

    if (this.browserAgent) {
      try {
        await this.browserAgent.close();
        this.logger.log('Browser agent closed successfully');
      } catch (error) {
        this.logger.error(`Failed to close browser agent: ${error.message}`);
      }
    }

    this.isLoggedIn = false;
  }

  // ========== 小红书特定方法 ==========

  /**
   * 初始化Browser Agent
   */
  private async initializeBrowserAgent(): Promise<void> {
    // 这里应该初始化真实的Browser Agent（如OpenClaw）
    // 简化实现：模拟Browser Agent
    this.browserAgent = {
      isReady: true,
      close: async () => {
        this.logger.log('Mock browser agent closed');
      },
      login: async (credentials: any) => {
        this.logger.log(`Mock login for: ${credentials.username}`);
        return { success: true, cookies: 'mock_cookie_string' };
      },
      publishNote: async (noteData: any) => {
        this.logger.log(`Mock publishing note: ${noteData.title}`);
        return {
          success: true,
          noteId: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: `https://www.xiaohongshu.com/explore/note_${Date.now()}`,
        };
      },
      deleteNote: async (noteId: string) => {
        this.logger.log(`Mock deleting note: ${noteId}`);
        return { success: true };
      },
    };
  }

  /**
   * 使用session token登录
   */
  private async loginWithSession(): Promise<void> {
    try {
      if (this.credentials.cookies) {
        // 设置cookies
        this.http.defaults.headers.Cookie = this.credentials.cookies;

        // 验证cookies是否有效
        const response = await this.http.get('/user/profile');
        if (response.status === 200) {
          this.isLoggedIn = true;
          this.logger.log('Logged in to Xiaohongshu using cookies');
          return;
        }
      }

      if (this.credentials.sessionToken) {
        // 使用session token登录
        // 这里需要根据小红书实际的token验证逻辑实现
        this.isLoggedIn = true;
        this.logger.log('Logged in to Xiaohongshu using session token');
        return;
      }

      throw new Error('No valid session credentials provided');
    } catch (error) {
      this.logger.error(`Session login failed: ${error.message}`);
      this.isLoggedIn = false;
      throw error;
    }
  }

  /**
   * 使用用户名密码登录
   */
  private async loginWithCredentials(): Promise<void> {
    try {
      if (!this.credentials.username || !this.credentials.password) {
        throw new Error(
          'Username and password are required for credential login',
        );
      }

      // 使用Browser Agent进行登录
      const loginResult = await this.browserAgent.login({
        username: this.credentials.username,
        password: this.credentials.password,
      });

      if (loginResult.success) {
        this.isLoggedIn = true;
        this.credentials.cookies = loginResult.cookies;
        this.logger.log('Logged in to Xiaohongshu using credentials');
      } else {
        throw new Error('Browser agent login failed');
      }
    } catch (error) {
      this.logger.error(`Credential login failed: ${error.message}`);
      this.isLoggedIn = false;
      throw error;
    }
  }

  /**
   * 使用Browser Agent发布内容
   */
  private async publishWithBrowserAgent(content: PublishContentInput): Promise<{
    publishId: string;
    noteId: string;
    url: string;
    rawResponse: any;
  }> {
    // 准备笔记数据
    const noteData = {
      title: content.title,
      content: this.formatXHSContent(content.content),
      images: content.coverImages || [],
      video: content.videoUrl,
      tags: content.tags || [],
      location: content.location?.name,
      publishAt: content.publishAt,
      metadata: content.metadata || {},
    };

    // 调用Browser Agent发布
    const result = await this.browserAgent.publishNote(noteData);

    if (!result.success) {
      throw new Error('Browser agent failed to publish note');
    }

    return {
      publishId: result.noteId,
      noteId: result.noteId,
      url: result.url,
      rawResponse: result,
    };
  }

  /**
   * 使用Browser Agent删除笔记
   */
  private async deleteNoteWithBrowserAgent(noteId: string): Promise<void> {
    const result = await this.browserAgent.deleteNote(noteId);

    if (!result.success) {
      throw new Error('Browser agent failed to delete note');
    }
  }

  /**
   * 格式化小红书内容
   */
  private formatXHSContent(content: string): string {
    // 小红书内容格式处理
    let formatted = content;

    // 移除HTML标签（小红书支持有限HTML）
    formatted = formatted.replace(/<[^>]*>/g, '');

    // 添加话题标签
    if (formatted.length < 1000) {
      // 小红书内容较短，可以添加一些emoji和格式
      formatted = `📝 ${formatted}\n\n#小红书笔记 #生活分享`;
    }

    // 限制长度（小红书笔记长度限制）
    if (formatted.length > 1000) {
      formatted = formatted.substring(0, 1000) + '...';
    }

    return formatted;
  }

  /**
   * 获取下一个午夜时间
   */
  private getNextMidnight(): Date {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 获取用户信息（测试用）
   */
  async getUserProfile(): Promise<any> {
    if (!this.isLoggedIn) {
      throw new Error('Not logged in');
    }

    try {
      const response = await this.http.get('/api/sns/web/v1/user/selfinfo');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get user profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取笔记列表
   */
  async getUserNotes(page = 1, pageSize = 20): Promise<any> {
    if (!this.isLoggedIn) {
      throw new Error('Not logged in');
    }

    try {
      const response = await this.http.get('/api/sns/web/v1/user_posted', {
        params: {
          page,
          page_size: pageSize,
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get user notes: ${error.message}`);
      throw error;
    }
  }
}
