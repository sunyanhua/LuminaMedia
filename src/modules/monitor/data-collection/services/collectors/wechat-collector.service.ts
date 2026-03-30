import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { PlatformCollector } from '../interfaces/platform-collector.interface';
import {
  PlatformType,
  CollectionMethod,
  CollectedDataItem,
  DataStatus,
} from '../../interfaces/data-collection.interface';

@Injectable()
export class WeChatCollectorService implements PlatformCollector {
  private readonly logger = new Logger(WeChatCollectorService.name);
  private readonly apiBaseUrl = 'https://api.weixin.qq.com';
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  getPlatform(): PlatformType {
    return PlatformType.WECHAT;
  }

  getSupportedMethods(): CollectionMethod[] {
    return [CollectionMethod.API];
  }

  /**
   * 获取访问令牌
   */
  private async getAccessToken(credentials: any): Promise<string> {
    // 检查令牌是否有效
    if (
      this.accessToken &&
      this.tokenExpiresAt &&
      new Date() < this.tokenExpiresAt
    ) {
      return this.accessToken;
    }

    const { appId, appSecret } = credentials;
    if (!appId || !appSecret) {
      throw new Error('微信API凭证缺失: appId和appSecret为必填项');
    }

    try {
      const url = `${this.apiBaseUrl}/cgi-bin/token`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            grant_type: 'client_credential',
            appid: appId,
            secret: appSecret,
          },
        }),
      );

      const { access_token, expires_in } = (response as any).data;
      if (!access_token) {
        throw new Error(
          `获取访问令牌失败: ${JSON.stringify((response as any).data)}`,
        );
      }

      this.accessToken = access_token;
      this.tokenExpiresAt = new Date(Date.now() + (expires_in - 300) * 1000); // 提前5分钟过期

      this.logger.debug(
        `获取微信访问令牌成功，有效期至: ${this.tokenExpiresAt}`,
      );
      return access_token;
    } catch (error) {
      this.logger.error(`获取微信访问令牌失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 验证凭证
   */
  async validateCredentials(credentials: any): Promise<boolean> {
    try {
      await this.getAccessToken(credentials);
      return true;
    } catch (error) {
      this.logger.warn(`微信凭证验证失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 采集公众号文章
   */
  async collect(data: {
    credentials: any;
    config: {
      officialAccountIds?: string[];
      keywords?: string[];
      dateRange?: { start: Date; end: Date };
      maxResults?: number;
    };
  }): Promise<CollectedDataItem[]> {
    const { credentials, config } = data;
    const results: CollectedDataItem[] = [];

    try {
      const accessToken = await this.getAccessToken(credentials);
      const officialAccountIds = config.officialAccountIds || [];

      if (officialAccountIds.length === 0) {
        this.logger.warn('未指定公众号ID，跳过采集');
        return [];
      }

      for (const accountId of officialAccountIds) {
        try {
          const articles = await this.fetchOfficialAccountArticles(
            accessToken,
            accountId,
            config,
          );
          results.push(...articles);
          this.logger.debug(
            `公众号 ${accountId} 采集到 ${articles.length} 篇文章`,
          );
        } catch (error) {
          this.logger.error(`采集公众号 ${accountId} 失败: ${error.message}`);
          // 继续处理其他公众号
        }
      }

      // 如果有关键词，进行过滤
      if (config.keywords && config.keywords.length > 0) {
        const filteredResults = results.filter((item) =>
          config.keywords!.some(
            (keyword) =>
              item.title.includes(keyword) || item.content.includes(keyword),
          ),
        );
        this.logger.debug(
          `关键词过滤: ${results.length} -> ${filteredResults.length} 条`,
        );
        return filteredResults.slice(0, config.maxResults || 100);
      }

      return results.slice(0, config.maxResults || 100);
    } catch (error) {
      this.logger.error(`微信采集失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取公众号文章列表
   */
  private async fetchOfficialAccountArticles(
    accessToken: string,
    officialAccountId: string,
    config: any,
  ): Promise<CollectedDataItem[]> {
    // 注意：微信官方API对公众号文章获取有限制
    // 这里使用简化实现，实际可能需要结合其他方法

    const url = `${this.apiBaseUrl}/cgi-bin/material/batchget_material`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            type: 'news',
            offset: 0,
            count: config.maxResults || 20,
          },
          {
            params: { access_token: accessToken },
          },
        ),
      );

      const articles = (response as any).data.item || [];
      const results: CollectedDataItem[] = [];

      for (const article of articles) {
        try {
          const content = await this.fetchArticleContent(
            accessToken,
            article.media_id,
          );

          const collectedItem: CollectedDataItem = {
            platform: PlatformType.WECHAT,
            sourceId: article.media_id,
            url:
              article.url || `https://mp.weixin.qq.com/s/${article.media_id}`,
            title: article.title || '无标题',
            content: content,
            author: article.author || officialAccountId,
            publishDate: new Date(article.update_time * 1000),
            collectedAt: new Date(),
            metadata: {
              likes: article.like_num,
              shares: article.share_num,
              comments: article.comment_num,
              views: article.read_num,
              mediaUrls: article.thumb_url ? [article.thumb_url] : [],
              rawData: article,
            },
            status: DataStatus.RAW,
            qualityScore: this.calculateQualityScore(article),
          };

          results.push(collectedItem);
        } catch (error) {
          this.logger.warn(
            `解析文章 ${article.media_id} 失败: ${error.message}`,
          );
        }
      }

      return results;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.data) {
        this.logger.error(
          `微信API错误: ${JSON.stringify((axiosError.response as any).data)}`,
        );
      }
      throw error;
    }
  }

  /**
   * 获取文章内容
   */
  private async fetchArticleContent(
    accessToken: string,
    mediaId: string,
  ): Promise<string> {
    const url = `${this.apiBaseUrl}/cgi-bin/material/get_material`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            media_id: mediaId,
          },
          {
            params: { access_token: accessToken },
            responseType: 'json',
          },
        ),
      );

      // 微信返回的文章内容可能是HTML格式
      const content = (response as any).data.content || '';
      // 简单提取文本内容（实际应该使用HTML解析器）
      const textContent = content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return textContent || '内容为空';
    } catch (error) {
      this.logger.warn(`获取文章内容失败 ${mediaId}: ${error.message}`);
      return '内容获取失败';
    }
  }

  /**
   * 计算文章质量分数
   */
  private calculateQualityScore(article: any): number {
    let score = 50; // 基础分

    if (article.title && article.title.length > 10) score += 10;
    if (article.author) score += 5;
    if (article.update_time) score += 5;
    if (article.read_num > 100) score += 10;
    if (article.like_num > 10) score += 10;
    if (article.share_num > 5) score += 10;

    return Math.min(100, score);
  }

  /**
   * 测试API连接
   */
  async testConnection(credentials: any): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const accessToken = await this.getAccessToken(credentials);
      return {
        success: true,
        message: '微信API连接成功',
        data: { accessToken: accessToken.substring(0, 10) + '...' },
      };
    } catch (error) {
      return {
        success: false,
        message: `微信API连接失败: ${error.message}`,
      };
    }
  }

  /**
   * 获取API使用统计
   */
  async getApiUsage(credentials: any): Promise<{
    dailyLimit: number;
    remaining: number;
    resetAt: Date;
  }> {
    // 微信API限制信息需要从另一个接口获取
    // 这里返回模拟数据
    return {
      dailyLimit: 1000,
      remaining: 950,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后重置
    };
  }
}
