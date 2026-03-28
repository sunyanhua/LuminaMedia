import { Injectable, Logger, Inject, forwardRef, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PlatformAdapterFactory } from '../adapters/platform-adapter.factory';
import {
  PlatformAdapter,
  PlatformType,
  PublishContentInput,
  PublishResult,
  PublishStatus,
  PlatformConfig,
  PublishStatusType,
} from '../interfaces/platform-adapter.interface';
import { WechatFormatterService, WechatFormatOptions } from './wechat-formatter.service';
import { AIImageGeneratorService, ImageGenerationOptions } from './ai-image-generator.service';

/**
 * 发布服务
 * 负责协调多个平台的发布操作，提供统一的发布接口
 */
@Injectable()
export class PublishService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PublishService.name);
  private adapters: Map<PlatformType, PlatformAdapter> = new Map();
  private platformConfigs: PlatformConfig[] = [];

  constructor(
    private readonly adapterFactory: PlatformAdapterFactory,
    private readonly eventEmitter: EventEmitter2,
    private readonly wechatFormatterService: WechatFormatterService,
    private readonly aiImageGeneratorService: AIImageGeneratorService,
  ) {}

  /**
   * 模块初始化时加载配置并初始化适配器
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing PublishService...');

    try {
      // 这里应该从数据库或配置服务加载平台配置
      // 暂时使用空配置，实际使用时会动态加载
      this.platformConfigs = await this.loadPlatformConfigs();

      // 创建并初始化适配器
      this.adapters = this.adapterFactory.createAdapters(this.platformConfigs);
      await this.adapterFactory.initializeAdapters(this.adapters);

      this.logger.log(`PublishService initialized with ${this.adapters.size} platform adapters`);
    } catch (error) {
      this.logger.error(`Failed to initialize PublishService: ${error.message}`, error.stack);
      // 即使初始化失败，服务仍然可以运行（适配器可以稍后动态添加）
    }
  }

  /**
   * 模块销毁时清理资源
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Cleaning up PublishService...');
    await this.adapterFactory.cleanupAdapters(this.adapters);
    this.adapters.clear();
  }

  /**
   * 发布内容到指定平台
   */
  async publishToPlatform(
    platformType: PlatformType,
    content: PublishContentInput,
  ): Promise<PublishResult> {
    this.logger.log(`Publishing content to platform: ${platformType}`);

    const adapter = this.getAdapter(platformType);
    if (!adapter) {
      throw new Error(`No adapter available for platform: ${platformType}`);
    }

    let processedContent: PublishContentInput = content;

    try {
      // 预处理内容（格式化、生成图片等）
      processedContent = await this.preprocessContent(platformType, content);

      // 触发发布前事件
      this.eventEmitter.emit('publish.before', {
        platformType,
        content: processedContent,
        timestamp: new Date(),
      });

      const result = await adapter.publishContent(processedContent);

      // 触发发布后事件
      this.eventEmitter.emit('publish.after', {
        platformType,
        content: processedContent,
        result,
        timestamp: new Date(),
      });

      // 记录发布结果（这里应该保存到数据库）
      await this.recordPublishResult(platformType, processedContent, result);

      this.logger.log(`Content published to ${platformType}, publishId: ${result.publishId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to publish content to ${platformType}: ${error.message}`, error.stack);

      // 触发发布失败事件
      this.eventEmitter.emit('publish.failed', {
        platformType,
        content: processedContent,
        error: error.message,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * 发布内容到多个平台
   */
  async publishToPlatforms(
    platformTypes: PlatformType[],
    content: PublishContentInput,
  ): Promise<Map<PlatformType, PublishResult>> {
    this.logger.log(`Publishing content to ${platformTypes.length} platforms`);

    const results = new Map<PlatformType, PublishResult>();
    const errors: Array<{ platform: PlatformType; error: string }> = [];

    // 并行发布到所有平台
    const publishPromises = platformTypes.map(async (platformType) => {
      try {
        const result = await this.publishToPlatform(platformType, content);
        results.set(platformType, result);
      } catch (error) {
        errors.push({ platform: platformType, error: error.message });
        this.logger.error(`Failed to publish to ${platformType}: ${error.message}`);
      }
    });

    await Promise.allSettled(publishPromises);

    // 如果有错误，记录但继续返回成功的结果
    if (errors.length > 0) {
      this.logger.warn(`Publish completed with ${errors.length} errors out of ${platformTypes.length} platforms`);
      // 触发部分失败事件
      this.eventEmitter.emit('publish.partial_failure', {
        content,
        results: Array.from(results.entries()),
        errors,
        timestamp: new Date(),
      });
    } else {
      this.logger.log(`Successfully published to all ${platformTypes.length} platforms`);
    }

    return results;
  }

  /**
   * 发布内容到所有可用平台
   */
  async publishToAllPlatforms(content: PublishContentInput): Promise<Map<PlatformType, PublishResult>> {
    const enabledPlatforms = this.getEnabledPlatforms();
    return this.publishToPlatforms(enabledPlatforms, content);
  }

  /**
   * 获取发布状态
   */
  async getPublishStatus(
    platformType: PlatformType,
    publishId: string,
  ): Promise<PublishStatus> {
    const adapter = this.getAdapter(platformType);
    if (!adapter) {
      throw new Error(`No adapter available for platform: ${platformType}`);
    }

    return adapter.getPublishStatus(publishId);
  }

  /**
   * 获取所有平台的发布状态
   */
  async getPublishStatuses(
    publishRecords: Array<{ platformType: PlatformType; publishId: string }>,
  ): Promise<Map<PlatformType, PublishStatus>> {
    const statuses = new Map<PlatformType, PublishStatus>();
    const errors: Array<{ platform: PlatformType; publishId: string; error: string }> = [];

    const statusPromises = publishRecords.map(async (record) => {
      try {
        const status = await this.getPublishStatus(record.platformType, record.publishId);
        statuses.set(record.platformType, status);
      } catch (error) {
        errors.push({
          platform: record.platformType,
          publishId: record.publishId,
          error: error.message,
        });
      }
    });

    await Promise.allSettled(statusPromises);

    if (errors.length > 0) {
      this.logger.warn(`Failed to get status for ${errors.length} publish records`);
    }

    return statuses;
  }

  /**
   * 删除已发布内容
   */
  async deleteContent(
    platformType: PlatformType,
    publishId: string,
  ): Promise<void> {
    const adapter = this.getAdapter(platformType);
    if (!adapter) {
      throw new Error(`No adapter available for platform: ${platformType}`);
    }

    try {
      await adapter.deleteContent(publishId);

      // 触发删除事件
      this.eventEmitter.emit('publish.deleted', {
        platformType,
        publishId,
        timestamp: new Date(),
      });

      this.logger.log(`Content deleted from ${platformType}, publishId: ${publishId}`);
    } catch (error) {
      this.logger.error(`Failed to delete content from ${platformType}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 批量删除内容
   */
  async deleteContents(
    records: Array<{ platformType: PlatformType; publishId: string }>,
  ): Promise<Map<PlatformType, boolean>> {
    const results = new Map<PlatformType, boolean>();

    const deletePromises = records.map(async (record) => {
      try {
        await this.deleteContent(record.platformType, record.publishId);
        results.set(record.platformType, true);
      } catch (error) {
        this.logger.error(`Failed to delete content from ${record.platformType}: ${error.message}`);
        results.set(record.platformType, false);
      }
    });

    await Promise.allSettled(deletePromises);
    return results;
  }

  /**
   * 获取平台健康状态
   */
  async getPlatformHealth(platformType: PlatformType): Promise<any> {
    const adapter = this.getAdapter(platformType);
    if (!adapter) {
      throw new Error(`No adapter available for platform: ${platformType}`);
    }

    return adapter.healthCheck();
  }

  /**
   * 获取所有平台健康状态
   */
  async getAllPlatformsHealth(): Promise<Map<PlatformType, any>> {
    const healthStatuses = new Map<PlatformType, any>();

    for (const [platformType, adapter] of this.adapters.entries()) {
      try {
        const health = await adapter.healthCheck();
        healthStatuses.set(platformType, health);
      } catch (error) {
        this.logger.error(`Failed to get health for platform ${platformType}: ${error.message}`);
        healthStatuses.set(platformType, {
          status: 'unhealthy',
          message: `Failed to check health: ${error.message}`,
          lastChecked: new Date(),
        });
      }
    }

    return healthStatuses;
  }

  /**
   * 获取平台统计信息
   */
  async getPlatformStats(platformType: PlatformType): Promise<any> {
    const adapter = this.getAdapter(platformType);
    if (!adapter) {
      throw new Error(`No adapter available for platform: ${platformType}`);
    }

    return adapter.getPlatformStats();
  }

  /**
   * 获取所有平台统计信息
   */
  async getAllPlatformsStats(): Promise<Map<PlatformType, any>> {
    const stats = new Map<PlatformType, any>();

    for (const [platformType, adapter] of this.adapters.entries()) {
      try {
        const platformStats = await adapter.getPlatformStats();
        stats.set(platformType, platformStats);
      } catch (error) {
        this.logger.error(`Failed to get stats for platform ${platformType}: ${error.message}`);
      }
    }

    return stats;
  }

  /**
   * 添加平台配置
   */
  async addPlatformConfig(config: PlatformConfig): Promise<void> {
    // 验证配置
    const validation = this.adapterFactory.validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid platform config: ${validation.errors.join(', ')}`);
    }

    // 检查是否已存在
    const existingIndex = this.platformConfigs.findIndex(c => c.type === config.type);
    if (existingIndex >= 0) {
      // 更新现有配置
      this.platformConfigs[existingIndex] = config;
      this.logger.log(`Updated platform config for: ${config.type}`);
    } else {
      // 添加新配置
      this.platformConfigs.push(config);
      this.logger.log(`Added new platform config for: ${config.type}`);
    }

    // 重新创建适配器
    if (config.enabled) {
      const adapter = this.adapterFactory.createAdapter(config);
      await adapter.initialize();
      this.adapters.set(config.type, adapter);
      this.logger.log(`Adapter created and initialized for platform: ${config.type}`);
    } else {
      // 如果禁用，移除适配器
      if (this.adapters.has(config.type)) {
        const adapter = this.adapters.get(config.type)!;
        await adapter.cleanup();
        this.adapters.delete(config.type);
        this.logger.log(`Adapter removed for disabled platform: ${config.type}`);
      }
    }
  }

  /**
   * 移除平台配置
   */
  async removePlatformConfig(platformType: PlatformType): Promise<void> {
    // 清理适配器
    if (this.adapters.has(platformType)) {
      const adapter = this.adapters.get(platformType)!;
      await adapter.cleanup();
      this.adapters.delete(platformType);
    }

    // 移除配置
    this.platformConfigs = this.platformConfigs.filter(c => c.type !== platformType);
    this.logger.log(`Removed platform config for: ${platformType}`);
  }

  /**
   * 获取所有平台配置
   */
  getPlatformConfigs(): PlatformConfig[] {
    return [...this.platformConfigs];
  }

  /**
   * 获取已启用的平台类型列表
   */
  getEnabledPlatforms(): PlatformType[] {
    return this.platformConfigs
      .filter(config => config.enabled)
      .map(config => config.type);
  }

  /**
   * 获取适配器实例
   */
  getAdapter(platformType: PlatformType): PlatformAdapter | undefined {
    return this.adapters.get(platformType);
  }

  /**
   * 获取所有适配器实例
   */
  getAdapters(): Map<PlatformType, PlatformAdapter> {
    return new Map(this.adapters);
  }

  // ========== 私有方法 ==========

  /**
   * 加载平台配置（从数据库或配置文件）
   */
  private async loadPlatformConfigs(): Promise<PlatformConfig[]> {
    // 这里应该从数据库加载配置
    // 暂时返回空数组，实际使用时会动态添加配置
    return [];

    // 示例配置：
    // return [
    //   {
    //     type: PlatformType.WECHAT,
    //     name: '企业微信公众号',
    //     enabled: true,
    //     credentials: {
    //       appId: process.env.WECHAT_APP_ID,
    //       appSecret: process.env.WECHAT_APP_SECRET,
    //       wechatId: process.env.WECHAT_ID,
    //       wechatName: process.env.WECHAT_NAME,
    //     },
    //     options: {
    //       timeout: 30000,
    //       maxRetries: 3,
    //     },
    //   },
    //   // 其他平台配置...
    // ];
  }

  /**
   * 记录发布结果到数据库
   */
  private async recordPublishResult(
    platformType: PlatformType,
    content: PublishContentInput,
    result: PublishResult,
  ): Promise<void> {
    // 这里应该将发布结果保存到数据库
    // 暂时只记录日志
    this.logger.log(`Publish recorded: ${platformType} - ${result.publishId} - ${result.status}`);

    // 示例数据库记录：
    // const publishRecord = {
    //   id: uuidv4(),
    //   tenantId: content.tenantId,
    //   platformType,
    //   publishId: result.publishId,
    //   contentTitle: content.title,
    //   status: result.status,
    //   url: result.url,
    //   publishedAt: result.publishedAt,
    //   error: result.error,
    //   metadata: result.metadata,
    //   rawResponse: result.rawResponse,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // };
    // await this.publishRepository.save(publishRecord);
  }

  /**
   * 预处理发布内容（格式化、生成图片等）
   */
  private async preprocessContent(
    platformType: PlatformType,
    content: PublishContentInput,
  ): Promise<PublishContentInput> {
    const processedContent = { ...content };

    // 微信平台特殊处理
    if (platformType === PlatformType.WECHAT) {
      try {
        // 1. 格式化微信公众号内容
        const formatOptions: WechatFormatOptions = {
          enableAdvancedFormatting: true,
          enableQualityCheck: true,
          generateImageSuggestions: true,
        };

        const formattedResult = await this.wechatFormatterService.formatContent(
          processedContent.content,
          formatOptions,
        );

        // 更新内容
        processedContent.content = formattedResult.html;

        // 记录质量报告
        processedContent.metadata = {
          ...processedContent.metadata,
          wechatFormatting: {
            qualityScore: formattedResult.qualityReport.score,
            wordCount: formattedResult.wordCount,
            imageCount: formattedResult.imageCount,
            issues: formattedResult.qualityReport.issues,
            suggestions: formattedResult.qualityReport.suggestions,
            formattedAt: formattedResult.formattedAt,
          },
        };

        // 2. 如果没有封面图，生成AI图片建议
        if ((!processedContent.coverImages || processedContent.coverImages.length === 0) &&
            formattedResult.qualityReport.score >= 60) {
          try {
            const imageSuggestions = await this.aiImageGeneratorService.generateImageSuggestions(
              formattedResult.plainText,
              3, // 生成3个建议
            );

            if (imageSuggestions.length > 0) {
              // 选择相关性最高的图片
              const bestSuggestion = imageSuggestions[0];
              if (bestSuggestion.imageData || bestSuggestion.imageUrl) {
                // 这里需要将图片上传到图床或直接使用Base64
                // 暂时记录建议，实际使用需要进一步处理
                processedContent.metadata = {
                  ...processedContent.metadata,
                  aiImageSuggestions: imageSuggestions.map(suggestion => ({
                    prompt: suggestion.prompt,
                    description: suggestion.description,
                    relevanceScore: suggestion.relevanceScore,
                    suggestedPosition: suggestion.suggestedPosition,
                  })),
                };

                this.logger.log(`AI image suggestions generated for WeChat content: ${imageSuggestions.length} options`);
              }
            }
          } catch (imageError) {
            this.logger.warn(`Failed to generate AI image suggestions: ${imageError.message}`);
            // 不影响主要发布流程
          }
        }

        this.logger.log(`WeChat content preprocessed: quality score ${formattedResult.qualityReport.score}`);
      } catch (formatError) {
        this.logger.error(`Failed to preprocess WeChat content: ${formatError.message}`, formatError.stack);
        // 预处理失败不影响发布，使用原始内容
      }
    }

    // 其他平台可以添加各自的预处理逻辑
    // ...

    return processedContent;
  }

  /**
   * 验证发布内容
   */
  private validatePublishContent(content: PublishContentInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!content.title || content.title.trim().length === 0) {
      errors.push('Content title is required');
    }

    if (!content.content || content.content.trim().length === 0) {
      errors.push('Content body is required');
    }

    if (content.title && content.title.length > 200) {
      errors.push('Content title must be less than 200 characters');
    }

    if (content.content && content.content.length > 10000) {
      errors.push('Content body must be less than 10000 characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}