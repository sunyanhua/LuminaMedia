import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import FormData from 'form-data';
import type { PlatformConfig } from '../interfaces/platform-adapter.interface';
import {
  PlatformAdapter,
  PlatformType,
  PublishContentInput,
  PublishResult,
  PublishStatus,
  PublishStatusType,
  PlatformHealthStatus,
  PlatformStats,
  WechatCredentials,
} from '../interfaces/platform-adapter.interface';

/**
 * 微信公众号适配器
 * 使用微信官方API实现内容发布
 *
 * 微信API文档参考：
 * - 获取access_token: https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
 * - 上传临时素材: https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/New_temporary_materials.html
 * - 上传永久素材: https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/Adding_Permanent_Assets.html
 * - 发布图文消息: https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Batch_Sends_and_Originality_Checks.html
 */
@Injectable()
export class WechatAdapter implements PlatformAdapter {
  private readonly logger = new Logger(WechatAdapter.name);
  private readonly http: AxiosInstance;
  private credentials: WechatCredentials;
  private config: PlatformConfig;
  private accessToken: string = '';
  private accessTokenExpiresAt: Date = new Date(0);

  constructor(config: PlatformConfig) {
    if (config.type !== PlatformType.WECHAT) {
      throw new Error(
        `Invalid platform type for WechatAdapter: ${config.type}`,
      );
    }

    this.config = config;
    this.credentials = config.credentials as WechatCredentials;
    this.http = axios.create({
      baseURL: 'https://api.weixin.qq.com/cgi-bin/',
      timeout: config.options?.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.options?.customHeaders,
      },
    });

    // 设置请求拦截器，自动添加access_token
    this.http.interceptors.request.use(async (config) => {
      if (config.url && !config.url.includes('token')) {
        const token = await this.getAccessToken();
        config.params = {
          ...config.params,
          access_token: token,
        };
      }
      return config;
    });

    // 设置响应拦截器，处理错误
    this.http.interceptors.response.use(
      (response) => {
        const data = response.data;
        if (data.errcode && data.errcode !== 0) {
          throw new Error(
            `WeChat API error: ${data.errmsg} (code: ${data.errcode})`,
          );
        }
        return response;
      },
      (error) => {
        this.logger.error(
          `WeChat API request failed: ${error.message}`,
          error.stack,
        );
        throw error;
      },
    );
  }

  getPlatformName(): string {
    return `微信公众号 - ${this.credentials.wechatName || this.credentials.wechatId}`;
  }

  getPlatformType(): PlatformType {
    return PlatformType.WECHAT;
  }

  async initialize(): Promise<void> {
    this.logger.log(
      `Initializing WeChat adapter for: ${this.credentials.wechatId}`,
    );
    await this.getAccessToken(); // 预获取token
    this.logger.log('WeChat adapter initialized successfully');
  }

  async healthCheck(): Promise<PlatformHealthStatus> {
    try {
      const startTime = Date.now();
      await this.getAccessToken();
      const latency = Date.now() - startTime;

      return {
        status: 'healthy',
        message: 'WeChat API is accessible',
        lastChecked: new Date(),
        metrics: {
          availability: 100,
          latency,
          successRate: 100,
          quotaUsed: 0, // 需要从API获取配额信息
          quotaRemaining: 1000, // 默认值
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `WeChat API health check failed: ${error.message}`,
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
    this.logger.log(`Publishing content to WeChat: ${content.title}`);

    try {
      // 1. 上传图片素材
      const imageMediaIds: string[] = [];
      if (content.coverImages && content.coverImages.length > 0) {
        for (const imageUrl of content.coverImages.slice(0, 3)) {
          // 微信最多支持3张封面图
          const mediaId = await this.uploadImage(imageUrl);
          imageMediaIds.push(mediaId);
        }
      }

      // 2. 构建图文消息
      const articles = [
        {
          title: content.title,
          thumb_media_id: imageMediaIds[0], // 封面图media_id
          author: content.metadata?.author || '灵曜智媒',
          digest: content.summary || content.content.substring(0, 100),
          content: this.formatWechatContent(content.content),
          content_source_url: content.externalLinks?.[0]?.url || '',
          show_cover_pic: 1,
          need_open_comment: content.metadata?.enableComment ? 1 : 0,
          only_fans_can_comment: content.metadata?.onlyFansComment ? 1 : 0,
        },
      ];

      // 3. 发布图文消息
      const response = await this.http.post('/material/add_news', { articles });
      const mediaId = response.data.media_id;

      // 4. 发布到公众号
      let publishResult;
      if (content.publishAt && content.publishAt > new Date()) {
        // 定时发布
        publishResult = await this.schedulePublish(mediaId, content.publishAt);
      } else {
        // 立即发布
        publishResult = await this.publishNow(mediaId);
      }

      return {
        publishId: publishResult.publishId || mediaId,
        platform: PlatformType.WECHAT,
        status: PublishStatusType.PUBLISHED,
        url: publishResult.url,
        rawResponse: publishResult.rawResponse,
        publishedAt: new Date(),
        metadata: {
          mediaId,
          imageMediaIds,
          articleCount: articles.length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to publish content to WeChat: ${error.message}`,
        error.stack,
      );
      return {
        publishId: `error_${Date.now()}`,
        platform: PlatformType.WECHAT,
        status: PublishStatusType.FAILED,
        error: error.message,
        publishedAt: new Date(),
      };
    }
  }

  async getPublishStatus(publishId: string): Promise<PublishStatus> {
    // 微信API不提供发布状态查询，我们只能假设已发布或失败
    // 在实际应用中，可以通过webhook接收发布状态回调
    return {
      publishId,
      status: PublishStatusType.PUBLISHED, // 假设已发布成功
      lastUpdated: new Date(),
    };
  }

  async updateContent(
    publishId: string,
    content: Partial<PublishContentInput>,
  ): Promise<PublishResult> {
    // 微信不支持直接更新已发布内容，需要重新发布
    this.logger.warn(
      'WeChat does not support content update. Need to republish.',
    );
    throw new Error(
      'WeChat does not support content update. Use delete and republish instead.',
    );
  }

  async deleteContent(publishId: string): Promise<void> {
    try {
      await this.http.post('/material/del_material', {
        media_id: publishId,
      });
      this.logger.log(`Deleted WeChat content: ${publishId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete WeChat content: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getPlatformStats(): Promise<PlatformStats> {
    // 获取公众号统计信息（简化实现）
    try {
      const response = await this.http.get('/user/get');
      const userStats = response.data;

      return {
        platform: PlatformType.WECHAT,
        totalPublished: 0, // 需要从数据库获取
        totalFailed: 0,
        totalScheduled: 0,
        averagePublishTime: 0,
        successRate: 100,
        lastPublishAt: new Date(),
        quotaInfo: {
          dailyLimit: 1000, // 微信API日调用限额
          usedToday: 0,
          remainingToday: 1000,
          resetAt: this.getNextMidnight(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get WeChat platform stats: ${error.message}`,
      );
      // 返回默认统计信息
      return {
        platform: PlatformType.WECHAT,
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
    this.logger.log('Cleaning up WeChat adapter resources');
    // 清理资源，如断开连接等
  }

  // ========== 微信特定方法 ==========

  /**
   * 获取access_token
   */
  private async getAccessToken(): Promise<string> {
    // 检查token是否有效
    if (this.accessToken && this.accessTokenExpiresAt > new Date()) {
      return this.accessToken;
    }

    this.logger.log('Refreshing WeChat access token');
    const response = await this.http.get('/token', {
      params: {
        grant_type: 'client_credential',
        appid: this.credentials.appId,
        secret: this.credentials.appSecret,
      },
    });

    this.accessToken = response.data.access_token;
    const expiresIn = response.data.expires_in || 7200; // 默认2小时
    this.accessTokenExpiresAt = new Date(Date.now() + (expiresIn - 300) * 1000); // 提前5分钟过期

    // 更新凭证
    this.credentials.accessToken = this.accessToken;
    this.credentials.accessTokenExpiresAt = this.accessTokenExpiresAt;

    this.logger.log(
      `WeChat access token refreshed, expires at: ${this.accessTokenExpiresAt}`,
    );
    return this.accessToken;
  }

  /**
   * 上传图片到微信服务器
   */
  private async uploadImage(imageUrl: string): Promise<string> {
    try {
      // 下载图片
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const formData = new FormData();
      formData.append('media', Buffer.from(imageResponse.data), {
        filename: `image_${Date.now()}.jpg`,
        contentType: imageResponse.headers['content-type'] || 'image/jpeg',
      });

      const response = await this.http.post(
        '/material/add_material',
        formData,
        {
          headers: formData.getHeaders(),
          params: {
            type: 'image',
          },
        },
      );

      return response.data.media_id;
    } catch (error) {
      this.logger.error(
        `Failed to upload image to WeChat: ${error.message}`,
        error.stack,
      );
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  /**
   * 格式化微信内容（处理HTML转义等）
   */
  private formatWechatContent(content: string): string {
    // 微信内容需要特殊处理
    let formatted = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 移除script标签
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // 移除style标签
      .replace(/<img([^>]+)>/g, '<img$1 />') // 确保img标签自闭合
      .replace(/<br\s*\/?>/gi, '<br/>'); // 统一br标签

    // 限制内容长度（微信图文消息内容限制）
    if (formatted.length > 20000) {
      formatted = formatted.substring(0, 20000) + '...';
    }

    return formatted;
  }

  /**
   * 立即发布
   */
  private async publishNow(
    mediaId: string,
  ): Promise<{ publishId: string; url?: string; rawResponse: any }> {
    const response = await this.http.post('/message/mass/sendall', {
      filter: {
        is_to_all: true,
      },
      mpnews: {
        media_id: mediaId,
      },
      msgtype: 'mpnews',
    });

    return {
      publishId: mediaId,
      rawResponse: response.data,
    };
  }

  /**
   * 定时发布
   */
  private async schedulePublish(
    mediaId: string,
    publishAt: Date,
  ): Promise<{ publishId: string; url?: string; rawResponse: any }> {
    // 微信定时发布API
    const response = await this.http.post('/message/mass/send', {
      touser: [], // 空数组表示发给所有用户
      mpnews: {
        media_id: mediaId,
      },
      msgtype: 'mpnews',
      send_ignore_reprint: 0,
      clientmsgid: `schedule_${Date.now()}`,
    });

    // 注意：微信定时发布需要另外的API，这里简化处理
    return {
      publishId: mediaId,
      rawResponse: response.data,
    };
  }

  /**
   * 获取下一个午夜时间（用于配额重置）
   */
  private getNextMidnight(): Date {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * 获取公众号用户列表（测试用）
   */
  async getUsers(nextOpenId?: string): Promise<{
    total: number;
    count: number;
    data: { openid: string[] };
    next_openid: string;
  }> {
    const response = await this.http.get('/user/get', {
      params: nextOpenId ? { next_openid: nextOpenId } : {},
    });
    return response.data;
  }

  /**
   * 获取素材列表
   */
  async getMaterials(
    type: 'image' | 'video' | 'voice' | 'news',
    offset = 0,
    count = 20,
  ): Promise<any> {
    const response = await this.http.post('/material/batchget_material', {
      type,
      offset,
      count,
    });
    return response.data;
  }
}
