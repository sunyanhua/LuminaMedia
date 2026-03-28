import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import {
  PlatformAdapter,
  PlatformType,
  PublishContentInput,
  PublishResult,
  PublishStatus,
  PublishStatusType,
  PlatformHealthStatus,
  PlatformStats,
  WeiboCredentials,
} from '../interfaces/platform-adapter.interface';
import type { PlatformConfig } from '../interfaces/platform-adapter.interface';

/**
 * 微博适配器
 * 使用微博官方Open API实现内容发布
 *
 * 微博API文档参考：
 * - OAuth2授权: https://open.weibo.com/wiki/Oauth2/authorize
 * - 发布微博: https://open.weibo.com/wiki/2/statuses/share
 * - 上传图片: https://open.weibo.com/wiki/2/statuses/upload
 * - 上传视频: https://open.weibo.com/wiki/2/statuses/upload_url_text
 */
@Injectable()
export class WeiboAdapter implements PlatformAdapter {
  private readonly logger = new Logger(WeiboAdapter.name);
  private readonly http: AxiosInstance;
  private credentials: WeiboCredentials;
  private config: PlatformConfig;
  private accessToken: string = '';
  private refreshToken: string = '';

  constructor(config: PlatformConfig) {
    if (config.type !== PlatformType.WEIBO) {
      throw new Error(`Invalid platform type for WeiboAdapter: ${config.type}`);
    }

    this.config = config;
    this.credentials = config.credentials as WeiboCredentials;
    this.http = axios.create({
      baseURL: 'https://api.weibo.com/2/',
      timeout: config.options?.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.options?.customHeaders,
      },
    });

    // 设置请求拦截器，自动添加access_token
    this.http.interceptors.request.use((config) => {
      if (this.accessToken && !config.url?.includes('oauth2')) {
        config.params = {
          ...config.params,
          access_token: this.accessToken,
        };
      }
      return config;
    });

    // 设置响应拦截器，处理错误
    this.http.interceptors.response.use(
      (response) => {
        const data = response.data;
        if (data.error_code && data.error_code !== 0) {
          throw new Error(`Weibo API error: ${data.error} (code: ${data.error_code})`);
        }
        return response;
      },
      (error) => {
        this.logger.error(`Weibo API request failed: ${error.message}`, error.stack);

        // 处理token过期
        if (error.response?.data?.error_code === 21332) {
          this.logger.warn('Weibo access token expired, attempting refresh...');
          // 这里应该触发token刷新逻辑
        }

        throw error;
      },
    );

    // 初始化token
    if (this.credentials.accessToken) {
      this.accessToken = this.credentials.accessToken;
    }
    if (this.credentials.refreshToken) {
      this.refreshToken = this.credentials.refreshToken;
    }
  }

  getPlatformName(): string {
    return `微博 - ${this.credentials.screenName || this.credentials.uid || '未登录'}`;
  }

  getPlatformType(): PlatformType {
    return PlatformType.WEIBO;
  }

  async initialize(): Promise<void> {
    this.logger.log(`Initializing Weibo adapter for: ${this.credentials.uid || 'unknown user'}`);

    // 验证token有效性
    if (this.accessToken) {
      try {
        await this.verifyCredentials();
        this.logger.log('Weibo adapter initialized with existing token');
      } catch (error) {
        this.logger.warn(`Existing token invalid: ${error.message}, attempting refresh...`);
        if (this.refreshToken) {
          await this.refreshAccessToken();
        } else {
          throw new Error('No valid access token and no refresh token available');
        }
      }
    } else if (this.refreshToken) {
      await this.refreshAccessToken();
    } else {
      this.logger.warn('No credentials provided for Weibo, adapter will operate in limited mode');
    }
  }

  async healthCheck(): Promise<PlatformHealthStatus> {
    try {
      const startTime = Date.now();

      // 验证凭证
      await this.verifyCredentials();
      const latency = Date.now() - startTime;

      return {
        status: 'healthy',
        message: 'Weibo API is accessible and token is valid',
        lastChecked: new Date(),
        metrics: {
          availability: 100,
          latency,
          successRate: 95,
          quotaUsed: 0, // 需要从API获取配额信息
          quotaRemaining: 1000,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Weibo API health check failed: ${error.message}`,
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
    this.logger.log(`Publishing content to Weibo: ${content.title}`);

    if (!this.accessToken) {
      throw new Error('Weibo adapter is not authenticated. Please provide valid credentials.');
    }

    try {
      let result: any;

      // 根据内容类型选择发布方式
      if (content.videoUrl) {
        // 发布视频微博
        result = await this.publishVideo(content);
      } else if (content.coverImages && content.coverImages.length > 0) {
        // 发布图片微博
        result = await this.publishWithImages(content);
      } else {
        // 发布纯文本微博
        result = await this.publishText(content);
      }

      return {
        publishId: result.idstr || result.id.toString(),
        platform: PlatformType.WEIBO,
        status: PublishStatusType.PUBLISHED,
        url: result.url || `https://weibo.com/${result.user?.idstr}/status/${result.idstr}`,
        rawResponse: result,
        publishedAt: new Date(result.created_at || Date.now()),
        metadata: {
          weiboId: result.id,
          userId: result.user?.id,
          repostsCount: result.reposts_count || 0,
          commentsCount: result.comments_count || 0,
          attitudesCount: result.attitudes_count || 0,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to publish content to Weibo: ${error.message}`, error.stack);

      // 微博API有频率限制，失败后可以重试
      const maxRetries = this.config.options?.maxRetries || 2;
      for (let retry = 1; retry <= maxRetries; retry++) {
        try {
          this.logger.log(`Retrying Weibo publish (attempt ${retry}/${maxRetries})`);
          await this.delay(5000); // 微博API频率限制，需要等待

          let retryResult;
          if (content.videoUrl) {
            retryResult = await this.publishVideo(content);
          } else if (content.coverImages && content.coverImages.length > 0) {
            retryResult = await this.publishWithImages(content);
          } else {
            retryResult = await this.publishText(content);
          }

          return {
            publishId: retryResult.idstr || retryResult.id.toString(),
            platform: PlatformType.WEIBO,
            status: PublishStatusType.PUBLISHED,
            url: retryResult.url || `https://weibo.com/${retryResult.user?.idstr}/status/${retryResult.idstr}`,
            rawResponse: retryResult,
            publishedAt: new Date(retryResult.created_at || Date.now()),
            metadata: {
              weiboId: retryResult.id,
              retryCount: retry,
            },
          };
        } catch (retryError) {
          if (retry === maxRetries) {
            return {
              publishId: `error_${Date.now()}`,
              platform: PlatformType.WEIBO,
              status: PublishStatusType.FAILED,
              error: `Failed after ${maxRetries} retries: ${retryError.message}`,
              publishedAt: new Date(),
              metadata: {
                retryCount: retry,
              },
            };
          }
        }
      }

      return {
        publishId: `error_${Date.now()}`,
        platform: PlatformType.WEIBO,
        status: PublishStatusType.FAILED,
        error: error.message,
        publishedAt: new Date(),
      };
    }
  }

  async getPublishStatus(publishId: string): Promise<PublishStatus> {
    try {
      const response = await this.http.get('/statuses/show.json', {
        params: {
          id: publishId,
        },
      });

      const weibo = response.data;

      return {
        publishId,
        status: weibo.deleted ? PublishStatusType.DELETED : PublishStatusType.PUBLISHED,
        progress: 100,
        message: weibo.deleted ? 'Weibo has been deleted' : 'Weibo is published',
        lastUpdated: new Date(weibo.created_at || Date.now()),
      };
    } catch (error) {
      // 微博不存在或无权访问
      if (error.response?.data?.error_code === 20101) {
        return {
          publishId,
          status: PublishStatusType.DELETED,
          message: 'Weibo does not exist or has been deleted',
          lastUpdated: new Date(),
        };
      }

      return {
        publishId,
        status: PublishStatusType.FAILED,
        message: `Failed to get publish status: ${error.message}`,
        lastUpdated: new Date(),
      };
    }
  }

  async updateContent(publishId: string, content: Partial<PublishContentInput>): Promise<PublishResult> {
    // 微博不支持更新已发布内容，只能删除后重新发布
    this.logger.warn('Weibo does not support content update. Need to delete and republish.');
    throw new Error('Weibo does not support content update. Use delete and republish instead.');
  }

  async deleteContent(publishId: string): Promise<void> {
    try {
      await this.http.post('/statuses/destroy.json', {
        id: publishId,
      });
      this.logger.log(`Deleted Weibo: ${publishId}`);
    } catch (error) {
      this.logger.error(`Failed to delete Weibo: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPlatformStats(): Promise<PlatformStats> {
    try {
      // 获取用户信息
      const userResponse = await this.http.get('/users/show.json', {
        params: {
          uid: this.credentials.uid,
        },
      });

      const user = userResponse.data;

      return {
        platform: PlatformType.WEIBO,
        totalPublished: user.statuses_count || 0,
        totalFailed: 0, // 需要从数据库获取
        totalScheduled: 0,
        averagePublishTime: 5000, // 微博发布较快，约5秒
        successRate: 95,
        lastPublishAt: new Date(user.created_at || Date.now()),
        quotaInfo: {
          dailyLimit: 1000, // 微博API日调用限额
          usedToday: 0,
          remainingToday: 1000,
          resetAt: this.getNextMidnight(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get Weibo platform stats: ${error.message}`);

      // 返回默认统计信息
      return {
        platform: PlatformType.WEIBO,
        totalPublished: 0,
        totalFailed: 0,
        totalScheduled: 0,
        averagePublishTime: 0,
        successRate: 0,
        quotaInfo: {
          dailyLimit: 1000,
          usedToday: 0,
          remainingToday: 1000,
          resetAt: this.getNextMidnight(),
        },
      };
    }
  }

  async cleanup(): Promise<void> {
    this.logger.log('Cleaning up Weibo adapter resources');
    // 清理资源
  }

  // ========== 微博特定方法 ==========

  /**
   * 验证凭证有效性
   */
  private async verifyCredentials(): Promise<void> {
    const response = await this.http.get('/account/get_uid.json');
    if (!response.data.uid) {
      throw new Error('Invalid access token');
    }

    // 更新uid
    if (!this.credentials.uid) {
      this.credentials.uid = response.data.uid;
    }
  }

  /**
   * 刷新access_token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.logger.log('Refreshing Weibo access token');
    const response = await axios.post('https://api.weibo.com/oauth2/access_token', null, {
      params: {
        client_id: this.credentials.appKey,
        client_secret: this.credentials.appSecret,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      },
    });

    this.accessToken = response.data.access_token;
    this.refreshToken = response.data.refresh_token;
    const expiresIn = response.data.expires_in || 86400; // 默认24小时

    // 更新凭证
    this.credentials.accessToken = this.accessToken;
    this.credentials.refreshToken = this.refreshToken;

    this.logger.log('Weibo access token refreshed successfully');
  }

  /**
   * 发布纯文本微博
   */
  private async publishText(content: PublishContentInput): Promise<any> {
    const status = this.formatWeiboContent(content.content, content.title, content.tags);

    const response = await this.http.post('/statuses/share.json', {
      status,
      visible: content.metadata?.visible || 0, // 0:所有人可见，1:仅自己可见，2:好友可见，3:指定分组可见
      list_id: content.metadata?.list_id, // 微博列表ID
      lat: content.location?.latitude,
      long: content.location?.longitude,
      annotations: content.metadata?.annotations, // 元数据
      rip: content.metadata?.rip, // 客户端IP
    });

    return response.data;
  }

  /**
   * 发布带图片的微博
   */
  private async publishWithImages(content: PublishContentInput): Promise<any> {
    const status = this.formatWeiboContent(content.content, content.title, content.tags);

    // 微博最多支持9张图片
    const images = content.coverImages?.slice(0, 9) || [];

    if (images.length === 1) {
      // 单张图片
      const imageData = await this.downloadImage(images[0]);
      const formData = new FormData();
      formData.append('pic', imageData, {
        filename: `weibo_${Date.now()}.jpg`,
        contentType: 'image/jpeg',
      });
      formData.append('status', status);

      const response = await this.http.post('/statuses/upload.json', formData, {
        headers: formData.getHeaders(),
      });

      return response.data;
    } else if (images.length > 1) {
      // 多张图片（需要先上传图片，再发布微博）
      const picIds: string[] = [];
      for (const imageUrl of images) {
        const picId = await this.uploadImage(imageUrl);
        picIds.push(picId);
      }

      const response = await this.http.post('/statuses/upload.json', {
        status,
        pic_id: picIds.join(','),
      });

      return response.data;
    } else {
      // 没有图片，回退到纯文本
      return this.publishText(content);
    }
  }

  /**
   * 发布视频微博
   */
  private async publishVideo(content: PublishContentInput): Promise<any> {
    if (!content.videoUrl) {
      throw new Error('Video URL is required for video weibo');
    }

    const status = this.formatWeiboContent(content.content, content.title, content.tags);

    // 微博视频发布较复杂，需要先上传视频到微博服务器
    // 这里简化处理，假设视频已经在可访问的URL
    const response = await this.http.post('/statuses/upload_url_text.json', {
      status,
      url: content.videoUrl,
    });

    return response.data;
  }

  /**
   * 格式化微博内容
   */
  private formatWeiboContent(content: string, title?: string, tags?: string[]): string {
    let formatted = '';

    // 添加标题（如果有）
    if (title && title.length > 0) {
      formatted += `${title}\n\n`;
    }

    // 添加正文
    formatted += content;

    // 添加标签
    if (tags && tags.length > 0) {
      const weiboTags = tags.map(tag => `#${tag.replace(/#/g, '')}#`).join(' ');
      formatted += `\n\n${weiboTags}`;
    }

    // 限制长度（微博限制280个字符，中文算1个字符）
    if (formatted.length > 280) {
      formatted = formatted.substring(0, 280) + '...';
    }

    return formatted;
  }

  /**
   * 下载图片
   */
  private async downloadImage(imageUrl: string): Promise<Buffer> {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    return Buffer.from(response.data);
  }

  /**
   * 上传图片到微博服务器（返回pic_id）
   */
  private async uploadImage(imageUrl: string): Promise<string> {
    const imageData = await this.downloadImage(imageUrl);
    const formData = new FormData();
    formData.append('pic', imageData, {
      filename: `weibo_${Date.now()}.jpg`,
      contentType: 'image/jpeg',
    });

    const response = await this.http.post('/statuses/upload_pic.json', formData, {
      headers: formData.getHeaders(),
    });

    return response.data.pic_id;
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取用户时间线
   */
  async getUserTimeline(page = 1, count = 20): Promise<any> {
    const response = await this.http.get('/statuses/user_timeline.json', {
      params: {
        page,
        count,
      },
    });
    return response.data;
  }

  /**
   * 获取@我的微博
   */
  async getMentions(page = 1, count = 20): Promise<any> {
    const response = await this.http.get('/statuses/mentions.json', {
      params: {
        page,
        count,
      },
    });
    return response.data;
  }
}