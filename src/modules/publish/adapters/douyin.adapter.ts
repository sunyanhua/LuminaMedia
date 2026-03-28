import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
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
  DouyinCredentials,
} from '../interfaces/platform-adapter.interface';

/**
 * 抖音适配器
 * 使用抖音开放平台API实现内容发布
 *
 * 抖音API文档参考：
 * - 开放平台: https://open.douyin.com/platform
 * - OAuth2授权: https://open.douyin.com/platform/doc/OpenAPI-oauth2
 * - 发布视频: https://open.douyin.com/platform/doc/OpenAPI-video-publish
 * - 发布图文: https://open.douyin.com/platform/doc/OpenAPI-image-publish
 */
@Injectable()
export class DouyinAdapter implements PlatformAdapter {
  private readonly logger = new Logger(DouyinAdapter.name);
  private readonly http: AxiosInstance;
  private credentials: DouyinCredentials;
  private config: PlatformConfig;
  private accessToken: string = '';
  private refreshToken: string = '';
  private openId: string = '';

  constructor(config: PlatformConfig) {
    if (config.type !== PlatformType.DOUYIN) {
      throw new Error(
        `Invalid platform type for DouyinAdapter: ${config.type}`,
      );
    }

    this.config = config;
    this.credentials = config.credentials as DouyinCredentials;
    this.http = axios.create({
      baseURL: 'https://open.douyin.com/',
      timeout: config.options?.timeout || 60000, // 抖音视频上传可能较慢
      headers: {
        'Content-Type': 'application/json',
        'access-token': this.credentials.accessToken || '',
        ...config.options?.customHeaders,
      },
    });

    // 设置请求拦截器，自动添加access_token
    this.http.interceptors.request.use((config) => {
      if (this.accessToken && !config.url?.includes('oauth')) {
        config.headers['access-token'] = this.accessToken;
      }
      return config;
    });

    // 设置响应拦截器，处理错误
    this.http.interceptors.response.use(
      (response) => {
        const data = response.data;
        if (data.data?.error_code && data.data.error_code !== 0) {
          throw new Error(
            `Douyin API error: ${data.data.description} (code: ${data.data.error_code})`,
          );
        }
        return response;
      },
      (error) => {
        this.logger.error(
          `Douyin API request failed: ${error.message}`,
          error.stack,
        );

        // 处理token过期
        if (error.response?.data?.data?.error_code === 2190008) {
          this.logger.warn(
            'Douyin access token expired, attempting refresh...',
          );
          // 这里应该触发token刷新逻辑
        }

        throw error;
      },
    );

    // 初始化凭证
    if (this.credentials.accessToken) {
      this.accessToken = this.credentials.accessToken;
    }
    if (this.credentials.refreshToken) {
      this.refreshToken = this.credentials.refreshToken;
    }
    if (this.credentials.openId) {
      this.openId = this.credentials.openId;
    }
  }

  getPlatformName(): string {
    return `抖音 - ${this.openId || '未登录'}`;
  }

  getPlatformType(): PlatformType {
    return PlatformType.DOUYIN;
  }

  async initialize(): Promise<void> {
    this.logger.log(
      `Initializing Douyin adapter for: ${this.openId || 'unknown user'}`,
    );

    // 验证token有效性
    if (this.accessToken && this.openId) {
      try {
        await this.verifyCredentials();
        this.logger.log('Douyin adapter initialized with existing token');
      } catch (error) {
        this.logger.warn(
          `Existing token invalid: ${error.message}, attempting refresh...`,
        );
        if (this.refreshToken) {
          await this.refreshAccessToken();
        } else {
          throw new Error(
            'No valid access token and no refresh token available',
          );
        }
      }
    } else if (this.refreshToken) {
      await this.refreshAccessToken();
    } else {
      this.logger.warn(
        'No credentials provided for Douyin, adapter will operate in limited mode',
      );
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
        message: 'Douyin API is accessible and token is valid',
        lastChecked: new Date(),
        metrics: {
          availability: 100,
          latency,
          successRate: 90, // 抖音发布成功率相对较低
          quotaUsed: 0,
          quotaRemaining: 100,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Douyin API health check failed: ${error.message}`,
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
    this.logger.log(`Publishing content to Douyin: ${content.title}`);

    if (!this.accessToken || !this.openId) {
      throw new Error(
        'Douyin adapter is not authenticated. Please provide valid credentials.',
      );
    }

    try {
      let result: any;

      // 根据内容类型选择发布方式
      if (content.videoUrl) {
        // 发布视频
        result = await this.publishVideo(content);
      } else if (content.coverImages && content.coverImages.length > 0) {
        // 发布图文
        result = await this.publishImages(content);
      } else {
        // 抖音不支持纯文本，回退到图文
        result = await this.publishImages(content);
      }

      return {
        publishId: result.item_id || result.video_id || `douyin_${Date.now()}`,
        platform: PlatformType.DOUYIN,
        status: result.share_id
          ? PublishStatusType.PUBLISHED
          : PublishStatusType.PENDING,
        url:
          result.share_url || `https://www.douyin.com/video/${result.item_id}`,
        rawResponse: result,
        publishedAt: new Date(),
        metadata: {
          itemId: result.item_id,
          videoId: result.video_id,
          shareId: result.share_id,
          openId: this.openId,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to publish content to Douyin: ${error.message}`,
        error.stack,
      );

      // 抖音API有严格频率限制，失败后谨慎重试
      const maxRetries = Math.min(this.config.options?.maxRetries || 1, 2); // 最多重试2次
      for (let retry = 1; retry <= maxRetries; retry++) {
        try {
          this.logger.log(
            `Retrying Douyin publish (attempt ${retry}/${maxRetries})`,
          );
          await this.delay(10000); // 抖音API频率限制严格，等待10秒

          let retryResult;
          if (content.videoUrl) {
            retryResult = await this.publishVideo(content);
          } else {
            retryResult = await this.publishImages(content);
          }

          return {
            publishId:
              retryResult.item_id ||
              retryResult.video_id ||
              `douyin_${Date.now()}`,
            platform: PlatformType.DOUYIN,
            status: retryResult.share_id
              ? PublishStatusType.PUBLISHED
              : PublishStatusType.PENDING,
            url:
              retryResult.share_url ||
              `https://www.douyin.com/video/${retryResult.item_id}`,
            rawResponse: retryResult,
            publishedAt: new Date(),
            metadata: {
              retryCount: retry,
            },
          };
        } catch (retryError) {
          if (retry === maxRetries) {
            return {
              publishId: `error_${Date.now()}`,
              platform: PlatformType.DOUYIN,
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
        platform: PlatformType.DOUYIN,
        status: PublishStatusType.FAILED,
        error: error.message,
        publishedAt: new Date(),
      };
    }
  }

  async getPublishStatus(publishId: string): Promise<PublishStatus> {
    try {
      // 抖音不提供直接的状态查询API，可以通过视频信息接口查询
      const response = await this.http.post(
        '/api/douyin/v1/video/video_data/',
        {
          item_ids: [publishId],
        },
      );

      const videoData = response.data.data?.list?.[0];

      if (!videoData) {
        return {
          publishId,
          status: PublishStatusType.FAILED,
          message: 'Video not found',
          lastUpdated: new Date(),
        };
      }

      const status =
        videoData.video_status === 1
          ? PublishStatusType.PUBLISHED
          : videoData.video_status === 2
            ? PublishStatusType.PENDING
            : videoData.video_status === 3
              ? PublishStatusType.FAILED
              : PublishStatusType.PENDING;

      return {
        publishId,
        status,
        progress:
          videoData.video_progress ||
          (status === PublishStatusType.PUBLISHED ? 100 : 0),
        message: this.getDouyinStatusMessage(videoData.video_status),
        lastUpdated: new Date(),
      };
    } catch (error) {
      return {
        publishId,
        status: PublishStatusType.FAILED,
        message: `Failed to get publish status: ${error.message}`,
        lastUpdated: new Date(),
      };
    }
  }

  async updateContent(
    publishId: string,
    content: Partial<PublishContentInput>,
  ): Promise<PublishResult> {
    // 抖音不支持更新已发布内容
    this.logger.warn(
      'Douyin does not support content update. Need to delete and republish.',
    );
    throw new Error(
      'Douyin does not support content update. Use delete and republish instead.',
    );
  }

  async deleteContent(publishId: string): Promise<void> {
    try {
      await this.http.post('/api/douyin/v1/video/delete/', {
        item_id: publishId,
      });
      this.logger.log(`Deleted Douyin video: ${publishId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete Douyin video: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getPlatformStats(): Promise<PlatformStats> {
    try {
      // 获取用户信息
      const response = await this.http.post('/api/douyin/v1/user/user_info/', {
        open_id: this.openId,
      });

      const userInfo = response.data.data;

      return {
        platform: PlatformType.DOUYIN,
        totalPublished: userInfo.video_count || 0,
        totalFailed: 0, // 需要从数据库获取
        totalScheduled: 0,
        averagePublishTime: 60000, // 抖音视频处理较慢，约1分钟
        successRate: 85,
        lastPublishAt: new Date(),
        quotaInfo: {
          dailyLimit: 50, // 抖音API每日发布限制较严格
          usedToday: 0,
          remainingToday: 50,
          resetAt: this.getNextMidnight(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get Douyin platform stats: ${error.message}`,
      );

      // 返回默认统计信息
      return {
        platform: PlatformType.DOUYIN,
        totalPublished: 0,
        totalFailed: 0,
        totalScheduled: 0,
        averagePublishTime: 0,
        successRate: 0,
        quotaInfo: {
          dailyLimit: 50,
          usedToday: 0,
          remainingToday: 50,
          resetAt: this.getNextMidnight(),
        },
      };
    }
  }

  async cleanup(): Promise<void> {
    this.logger.log('Cleaning up Douyin adapter resources');
    // 清理资源
  }

  // ========== 抖音特定方法 ==========

  /**
   * 验证凭证有效性
   */
  private async verifyCredentials(): Promise<void> {
    const response = await this.http.post('/oauth/userinfo/', {
      open_id: this.openId,
    });

    if (!response.data.data?.open_id) {
      throw new Error('Invalid access token or open_id');
    }

    // 更新open_id
    if (!this.openId) {
      this.openId = response.data.data.open_id;
      this.credentials.openId = this.openId;
    }
  }

  /**
   * 刷新access_token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.logger.log('Refreshing Douyin access token');
    const response = await axios.post(
      'https://open.douyin.com/oauth/refresh_token/',
      null,
      {
        params: {
          client_key: this.credentials.clientKey,
          client_secret: this.credentials.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        },
      },
    );

    const data = response.data.data;
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.openId = data.open_id;
    const expiresIn = data.expires_in || 86400; // 默认24小时

    // 更新凭证
    this.credentials.accessToken = this.accessToken;
    this.credentials.refreshToken = this.refreshToken;
    this.credentials.openId = this.openId;

    // 更新HTTP客户端header
    this.http.defaults.headers['access-token'] = this.accessToken;

    this.logger.log(
      `Douyin access token refreshed for open_id: ${this.openId}`,
    );
  }

  /**
   * 发布视频
   */
  private async publishVideo(content: PublishContentInput): Promise<any> {
    if (!content.videoUrl) {
      throw new Error('Video URL is required for Douyin video publish');
    }

    // 抖音视频发布流程：
    // 1. 创建视频
    // 2. 上传视频
    // 3. 发布视频

    // 步骤1: 创建视频
    const createResponse = await this.http.post(
      '/api/douyin/v1/video/create/',
      {
        open_id: this.openId,
        text: this.formatDouyinText(
          content.content,
          content.title,
          content.tags,
        ),
      },
    );

    const videoId = createResponse.data.data?.video_id;
    if (!videoId) {
      throw new Error(
        'Failed to create video: ' + JSON.stringify(createResponse.data),
      );
    }

    // 步骤2: 上传视频
    const videoData = await this.downloadVideo(content.videoUrl);
    const uploadResult = await this.uploadVideo(videoId, videoData);

    // 步骤3: 发布视频
    const publishResponse = await this.http.post(
      '/api/douyin/v1/video/publish/',
      {
        open_id: this.openId,
        video_id: videoId,
      },
    );

    return {
      ...publishResponse.data.data,
      video_id: videoId,
      upload_info: uploadResult,
    };
  }

  /**
   * 发布图文
   */
  private async publishImages(content: PublishContentInput): Promise<any> {
    // 抖音图文发布
    const images = content.coverImages?.slice(0, 9) || []; // 抖音最多9张图

    if (images.length === 0) {
      // 如果没有图片，使用默认图片
      images.push('https://via.placeholder.com/1080x1920?text=Douyin+Content');
    }

    // 上传图片并获取image_ids
    const imageIds: string[] = [];
    for (const imageUrl of images) {
      const imageId = await this.uploadImage(imageUrl);
      imageIds.push(imageId);
    }

    const response = await this.http.post('/api/douyin/v1/image/publish/', {
      open_id: this.openId,
      text: this.formatDouyinText(content.content, content.title, content.tags),
      image_ids: imageIds,
      at_users: content.mentions || [],
      poi_id: content.metadata?.poi_id, // 地理位置ID
      micro_app_id: content.metadata?.micro_app_id, // 小程序ID
      micro_app_title: content.metadata?.micro_app_title, // 小程序标题
      micro_app_url: content.metadata?.micro_app_url, // 小程序页面路径
    });

    return response.data.data;
  }

  /**
   * 格式化抖音文本
   */
  private formatDouyinText(
    content: string,
    title?: string,
    tags?: string[],
  ): string {
    let formatted = '';

    // 添加标题（如果有）
    if (title && title.length > 0) {
      formatted += `${title}\n\n`;
    }

    // 添加正文
    formatted += content;

    // 添加标签
    if (tags && tags.length > 0) {
      const douyinTags = tags
        .map((tag) => `#${tag.replace(/#/g, '')}`)
        .join(' ');
      formatted += `\n\n${douyinTags}`;
    }

    // 限制长度（抖音文本限制）
    if (formatted.length > 1000) {
      formatted = formatted.substring(0, 1000) + '...';
    }

    return formatted;
  }

  /**
   * 下载视频
   */
  private async downloadVideo(videoUrl: string): Promise<Buffer> {
    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
      timeout: 120000, // 视频下载可能较慢
      maxContentLength: 100 * 1024 * 1024, // 限制100MB
    });
    return Buffer.from(response.data);
  }

  /**
   * 上传视频到抖音服务器
   */
  private async uploadVideo(videoId: string, videoData: Buffer): Promise<any> {
    // 抖音视频上传使用分片上传，这里简化处理
    const formData = new FormData();
    formData.append('video', videoData, {
      filename: `douyin_${Date.now()}.mp4`,
      contentType: 'video/mp4',
    });

    const response = await this.http.post(
      `/api/douyin/v1/video/upload/${videoId}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'access-token': this.accessToken,
        },
      },
    );

    return response.data;
  }

  /**
   * 上传图片到抖音服务器
   */
  private async uploadImage(imageUrl: string): Promise<string> {
    const imageData = await this.downloadImage(imageUrl);
    const formData = new FormData();
    formData.append('image', imageData, {
      filename: `douyin_${Date.now()}.jpg`,
      contentType: 'image/jpeg',
    });

    const response = await this.http.post(
      '/api/douyin/v1/image/upload/',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'access-token': this.accessToken,
        },
      },
    );

    return response.data.data?.image_id;
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
   * 获取抖音状态消息
   */
  private getDouyinStatusMessage(status: number): string {
    const statusMap: Record<number, string> = {
      1: '视频已发布',
      2: '视频处理中',
      3: '视频发布失败',
      4: '视频审核中',
      5: '视频审核不通过',
    };
    return statusMap[status] || '未知状态';
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
   * 获取用户视频列表
   */
  async getUserVideos(cursor = 0, count = 20): Promise<any> {
    const response = await this.http.post('/api/douyin/v1/video/list/', {
      open_id: this.openId,
      cursor,
      count,
    });
    return response.data;
  }

  /**
   * 获取用户粉丝列表
   */
  async getUserFollowers(cursor = 0, count = 20): Promise<any> {
    const response = await this.http.post(
      '/api/douyin/v1/user/following/list/',
      {
        open_id: this.openId,
        cursor,
        count,
      },
    );
    return response.data;
  }
}
