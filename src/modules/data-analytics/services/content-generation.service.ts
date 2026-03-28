import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import {
  ContentGenerationOptions,
  MarketingContentOptions,
  GeneratedContent,
  MarketingContent,
  ContentGenerationResult,
  ContentTemplate,
  ContentQualityAssessment,
} from '../interfaces/content-generation.interface';
import { Platform } from '../../../shared/enums/platform.enum';

/**
 * 内容生成服务
 *
 * 主要功能：
 * 1. 多平台文案生成（小红书、公众号、抖音等）
 * 2. 内容质量评估
 * 3. 内容模板管理
 * 4. 批量内容生成
 */
@Injectable()
export class ContentGenerationService {
  private readonly logger = new Logger(ContentGenerationService.name);

  // 内容模板库
  private contentTemplates: ContentTemplate[] = [
    {
      id: 'template-xhs-product',
      name: '小红书产品介绍模板',
      platform: Platform.XHS,
      templateType: 'product_intro',
      promptTemplate:
        '请为以下产品生成小红书风格的产品介绍文案：\n\n产品名称：{productName}\n产品特点：{productFeatures}\n目标人群：{targetAudience}\n\n要求：\n1. 突出产品核心卖点\n2. 使用亲切、真实的语气\n3. 包含Emoji和话题标签\n4. 提供使用场景建议',
      exampleOutput:
        '✨发现宝藏好物｜{productName}真的绝了！\n\n最近挖到的{productName}简直是我的心头好💕\n{productFeatures}\n\n适合人群：{targetAudience}\n\n#好物分享 #种草 #小红书好物',
      defaultTone: 'casual',
      suggestedHashtags: ['好物分享', '种草', '小红书好物'],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
    {
      id: 'template-wechat-article',
      name: '微信公众号文章模板',
      platform: Platform.WECHAT_MP,
      templateType: 'educational',
      promptTemplate:
        '请基于以下主题生成微信公众号文章：\n\n文章主题：{topic}\n核心观点：{mainPoints}\n目标读者：{targetReaders}\n\n要求：\n1. 结构清晰，有引言、正文、结论\n2. 提供有价值的深度内容\n3. 使用专业但易懂的语言\n4. 包含数据或案例支持',
      exampleOutput:
        '# {topic}\n\n## 引言\n{introduction}\n\n## 正文\n{mainContent}\n\n## 结论\n{conclusion}',
      defaultTone: 'professional',
      suggestedHashtags: [],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
    {
      id: 'template-promotional',
      name: '促销活动通用模板',
      platform: Platform.XHS,
      templateType: 'promotional',
      promptTemplate:
        '请为以下促销活动生成推广文案：\n\n活动名称：{campaignName}\n活动时间：{campaignPeriod}\n优惠内容：{offerDetails}\n参与方式：{participationMethod}\n\n要求：\n1. 突出优惠力度\n2. 营造紧迫感\n3. 清晰说明参与方式\n4. 吸引用户立即行动',
      exampleOutput:
        '🎉限时福利｜{campaignName}重磅来袭！\n\n活动时间：{campaignPeriod}\n优惠内容：{offerDetails}\n\n参与方式：{participationMethod}\n\n抓紧时间，错过等一年！\n\n#促销活动 #限时优惠 #福利',
      defaultTone: 'friendly',
      suggestedHashtags: ['促销活动', '限时优惠', '福利'],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
  ];

  constructor(
    @Inject(forwardRef(() => GeminiService))
    private readonly geminiService: GeminiService,
  ) {}

  /**
   * 生成单条内容
   */
  async generateContent(
    options: ContentGenerationOptions,
  ): Promise<ContentGenerationResult> {
    this.logger.log(`Generating content for platform: ${options.platform}`);

    try {
      // 使用 Gemini 服务生成内容
      const result = await this.geminiService.generateContent(options);

      // 如果生成成功，进行额外的质量评估
      if (result.success && result.content) {
        // 可以在这里添加额外的质量评估逻辑
        const enhancedAssessment = this.enhanceQualityAssessment(
          result.qualityAssessment,
          result.content,
          options.platform,
        );

        return {
          ...result,
          qualityAssessment: enhancedAssessment,
        };
      }

      return result;
    } catch (error) {
      this.logger.error(`Content generation failed: ${error.message}`);

      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: 'Content generation service error',
          details: error.message,
        },
      };
    }
  }

  /**
   * 生成营销内容包
   */
  async generateMarketingContent(
    options: MarketingContentOptions,
  ): Promise<ContentGenerationResult> {
    this.logger.log(
      `Generating marketing content for campaign: ${options.campaignSummary.name}`,
    );

    try {
      // 使用 Gemini 服务生成营销内容
      const result = await this.geminiService.generateMarketingContent(options);

      // 如果生成成功，进行额外的评估和优化
      if (result.success && result.marketingContent) {
        // 评估跨平台一致性
        const consistencyScore = this.evaluateCrossPlatformConsistency(
          result.marketingContent.contents,
        );

        // 优化发布时间建议
        const optimizedSchedule = this.optimizePostingSchedule(
          result.marketingContent.recommendedPostingSchedule,
          options.campaignSummary,
        );

        const enhancedMarketingContent: MarketingContent = {
          ...result.marketingContent,
          consistencyScore,
          recommendedPostingSchedule: optimizedSchedule,
        };

        return {
          ...result,
          marketingContent: enhancedMarketingContent,
        };
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Marketing content generation failed: ${error.message}`,
      );

      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: 'Marketing content generation service error',
          details: error.message,
        },
      };
    }
  }

  /**
   * 使用模板生成内容
   */
  async generateContentWithTemplate(
    templateId: string,
    templateVariables: Record<string, string>,
    customOptions?: Partial<ContentGenerationOptions>,
  ): Promise<ContentGenerationResult> {
    this.logger.log(`Generating content with template: ${templateId}`);

    // 查找模板
    const template = this.contentTemplates.find((t) => t.id === templateId);
    if (!template) {
      return {
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: `Content template not found: ${templateId}`,
        },
      };
    }

    try {
      // 填充模板变量
      let prompt = template.promptTemplate;
      for (const [key, value] of Object.entries(templateVariables)) {
        prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
      }

      // 构建生成选项
      const options: ContentGenerationOptions = {
        prompt,
        platform: template.platform,
        tone: customOptions?.tone || (template.defaultTone as any) || 'casual',
        includeHashtags: true,
        includeImageSuggestions: true,
        ...customOptions,
      };

      // 生成内容
      const result = await this.generateContent(options);

      // 如果成功，添加模板信息
      if (result.success && result.content) {
        // 确保包含模板建议的话题标签
        if (
          template.suggestedHashtags &&
          template.suggestedHashtags.length > 0
        ) {
          const existingHashtags = result.content.hashtags || [];
          const combinedHashtags = [
            ...new Set([...existingHashtags, ...template.suggestedHashtags]),
          ];
          result.content.hashtags = combinedHashtags;
        }

        // 添加模板元数据
        (result.content as any).templateId = templateId;
        (result.content as any).templateName = template.name;
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Template-based content generation failed: ${error.message}`,
      );

      return {
        success: false,
        error: {
          code: 'TEMPLATE_ERROR',
          message: 'Error processing template',
          details: error.message,
        },
      };
    }
  }

  /**
   * 批量生成内容
   */
  async batchGenerateContent(
    optionsList: ContentGenerationOptions[],
  ): Promise<ContentGenerationResult[]> {
    this.logger.log(`Batch generating ${optionsList.length} content items`);

    const results: ContentGenerationResult[] = [];

    for (const options of optionsList) {
      try {
        const result = await this.generateContent(options);
        results.push(result);
      } catch (error) {
        this.logger.error(`Batch item failed: ${error.message}`);
        results.push({
          success: false,
          error: {
            code: 'BATCH_ITEM_ERROR',
            message: 'Batch generation item failed',
            details: error.message,
          },
        });
      }
    }

    return results;
  }

  /**
   * 评估内容质量（增强版）
   */
  async assessContentQuality(
    content: GeneratedContent,
    platform: Platform,
  ): Promise<ContentQualityAssessment> {
    this.logger.log(`Assessing content quality for platform: ${platform}`);

    // 基础质量评估
    const baseAssessment = this.performBaseQualityAssessment(content, platform);

    // 平台特定评估
    const platformSpecificScore = this.evaluatePlatformSpecificQuality(
      content,
      platform,
    );

    // 计算综合分数
    const finalScore = Math.round(
      baseAssessment.score * 0.6 + platformSpecificScore * 0.4,
    );

    // 生成改进建议
    const improvementSuggestions = this.generateDetailedImprovementSuggestions(
      content,
      platform,
      finalScore,
    );

    return {
      score: finalScore,
      metrics: {
        ...baseAssessment.metrics,
        platformFit: platformSpecificScore,
      },
      feedback: this.generateDetailedFeedback(finalScore, content, platform),
      improvementSuggestions,
    };
  }

  /**
   * 获取所有内容模板
   */
  getAllTemplates(): ContentTemplate[] {
    return [...this.contentTemplates];
  }

  /**
   * 根据平台筛选模板
   */
  getTemplatesByPlatform(platform: Platform): ContentTemplate[] {
    return this.contentTemplates.filter(
      (template) => template.platform === platform,
    );
  }

  /**
   * 根据类型筛选模板
   */
  getTemplatesByType(templateType: string): ContentTemplate[] {
    return this.contentTemplates.filter(
      (template) => template.templateType === templateType,
    );
  }

  /**
   * 添加新模板
   */
  addTemplate(
    template: Omit<ContentTemplate, 'id' | 'createdAt' | 'updatedAt'>,
  ): ContentTemplate {
    const newTemplate: ContentTemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.contentTemplates.push(newTemplate);
    this.logger.log(`New template added: ${newTemplate.id}`);

    return newTemplate;
  }

  /**
   * 更新模板
   */
  updateTemplate(
    templateId: string,
    updates: Partial<Omit<ContentTemplate, 'id' | 'createdAt'>>,
  ): ContentTemplate | null {
    const templateIndex = this.contentTemplates.findIndex(
      (t) => t.id === templateId,
    );

    if (templateIndex === -1) {
      return null;
    }

    const updatedTemplate = {
      ...this.contentTemplates[templateIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.contentTemplates[templateIndex] = updatedTemplate;
    this.logger.log(`Template updated: ${templateId}`);

    return updatedTemplate;
  }

  /**
   * 删除模板
   */
  deleteTemplate(templateId: string): boolean {
    const initialLength = this.contentTemplates.length;
    this.contentTemplates = this.contentTemplates.filter(
      (t) => t.id !== templateId,
    );

    const deleted = this.contentTemplates.length < initialLength;
    if (deleted) {
      this.logger.log(`Template deleted: ${templateId}`);
    }

    return deleted;
  }

  /**
   * 增强质量评估
   */
  private enhanceQualityAssessment(
    baseAssessment: ContentQualityAssessment | undefined,
    content: GeneratedContent,
    platform: Platform,
  ): ContentQualityAssessment {
    if (!baseAssessment) {
      return this.performBaseQualityAssessment(content, platform);
    }

    // 添加额外的评估维度
    const engagementPotential = this.evaluateEngagementPotential(content);
    const conversionPotential = this.evaluateConversionPotential(
      content,
      platform,
    );

    // 更新分数
    const enhancedScore = Math.round(
      baseAssessment.score * 0.7 +
        engagementPotential * 0.15 +
        conversionPotential * 0.15,
    );

    // 更新指标
    const enhancedMetrics = {
      ...baseAssessment.metrics,
      engagementPotential,
      conversionPotential,
    };

    // 生成增强反馈
    const enhancedFeedback = this.generateEnhancedFeedback(
      baseAssessment.feedback,
      engagementPotential,
      conversionPotential,
    );

    return {
      score: enhancedScore,
      metrics: enhancedMetrics,
      feedback: enhancedFeedback,
      improvementSuggestions: baseAssessment.improvementSuggestions,
    };
  }

  /**
   * 执行基础质量评估
   */
  private performBaseQualityAssessment(
    content: GeneratedContent,
    platform: Platform,
  ): ContentQualityAssessment {
    // 基础评估逻辑（简化版）
    const wordCount = content.wordCount || 0;
    const titleLength = content.title?.length || 0;
    const hashtagCount = content.hashtags?.length || 0;

    // 基础分数
    let score = 50;

    // 根据内容特征调整分数
    if (wordCount > 100 && wordCount < 1000) score += 10;
    if (titleLength > 5 && titleLength < 50) score += 10;
    if (hashtagCount >= 3 && hashtagCount <= 10) score += 10;
    if (content.content && content.content.length > 0) score += 20;

    // 平台适配
    const platformFit = this.evaluatePlatformFit(content, platform);
    score += platformFit / 2;

    // 确保分数在0-100之间
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      metrics: {
        readability: Math.min(100, score + 10),
        engagement: Math.min(100, score + 5),
        relevance: Math.min(100, score + 15),
        originality: Math.min(100, score),
        platformFit,
      },
      feedback: `内容质量评估：${score}/100`,
      improvementSuggestions: this.generateBasicImprovementSuggestions(
        content,
        platform,
        score,
      ),
    };
  }

  /**
   * 评估平台适配度
   */
  private evaluatePlatformFit(
    content: GeneratedContent,
    platform: Platform,
  ): number {
    // 简化平台适配评估
    switch (platform) {
      case Platform.XHS: {
        // 小红书：检查Emoji、短句、话题标签
        const hasEmoji = /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(content.content);
        const paragraphCount = (content.content.match(/\n\n/g) || []).length;
        return (hasEmoji ? 20 : 0) + (paragraphCount > 1 ? 15 : 0) + 50;
      }
      case Platform.WECHAT_MP: {
        // 公众号：检查结构、长度、专业性
        const hasStructure =
          /#{1,3}\s/.test(content.content) || content.content.includes('\n\n');
        const isLongForm = (content.wordCount || 0) > 500;
        return (hasStructure ? 20 : 0) + (isLongForm ? 15 : 0) + 55;
      }
      default:
        return 60;
    }
  }

  /**
   * 评估平台特定质量
   */
  private evaluatePlatformSpecificQuality(
    content: GeneratedContent,
    platform: Platform,
  ): number {
    // 平台特定的质量评估
    switch (platform) {
      case Platform.XHS: {
        // 小红书：互动性、视觉吸引力、话题热度
        const interactiveElements = this.countInteractiveElements(
          content.content,
        );
        const visualElements = content.suggestedImages?.length || 0;
        const trendingKeywords = this.checkTrendingKeywords(
          content.content,
          content.hashtags || [],
        );
        return Math.min(
          100,
          50 +
            interactiveElements * 5 +
            visualElements * 3 +
            trendingKeywords * 2,
        );
      }
      case Platform.WECHAT_MP: {
        // 公众号：深度、专业性、价值感
        const depthScore = this.evaluateContentDepth(content.content);
        const professionalTerms = this.countProfessionalTerms(content.content);
        const valueScore = this.evaluateContentValue(content.content);
        return Math.min(
          100,
          55 + depthScore * 10 + professionalTerms * 2 + valueScore * 8,
        );
      }
      default:
        return 60;
    }
  }

  /**
   * 评估跨平台一致性
   */
  private evaluateCrossPlatformConsistency(
    contents: GeneratedContent[],
  ): number {
    if (contents.length <= 1) return 100;

    // 检查主题一致性
    const themes = contents.map((c) => this.extractMainTheme(c.content));
    const firstTheme = themes[0];

    let matchingThemes = 0;
    for (const theme of themes) {
      if (
        theme === firstTheme ||
        this.calculateThemeSimilarity(theme, firstTheme) > 0.5
      ) {
        matchingThemes++;
      }
    }

    const consistency = (matchingThemes / contents.length) * 100;
    return Math.round(consistency);
  }

  /**
   * 优化发布时间建议
   */
  private optimizePostingSchedule(
    schedule: MarketingContent['recommendedPostingSchedule'],
    campaignSummary: any,
  ): MarketingContent['recommendedPostingSchedule'] {
    // 根据活动类型和预算优化发布时间
    const budget = campaignSummary.budget || 0;
    const campaignType = campaignSummary.campaignType;

    return schedule.map((item) => {
      const bestTimes = [...item.bestTimes];
      let frequency = item.frequency;

      // 根据预算调整发布频率
      if (budget > 50000) {
        frequency = this.increaseFrequency(frequency);
      } else if (budget < 10000) {
        frequency = this.decreaseFrequency(frequency);
      }

      // 根据活动类型调整最佳时间
      if (campaignType === 'ONLINE') {
        // 线上活动：增加晚间时段
        if (!bestTimes.some((t) => t.includes('20:00'))) {
          bestTimes.push('20:00-22:00');
        }
      }

      return {
        ...item,
        bestTimes,
        frequency,
      };
    });
  }

  /**
   * 评估参与潜力
   */
  private evaluateEngagementPotential(content: GeneratedContent): number {
    // 简化参与潜力评估
    let score = 50;

    // 检查问题句
    const hasQuestions = /\?/.test(content.content);
    if (hasQuestions) score += 10;

    // 检查互动邀请
    const hasCallToAction = /欢迎|分享|评论|点赞|关注/.test(content.content);
    if (hasCallToAction) score += 10;

    // 检查情感词汇
    const emotionalWords = this.countEmotionalWords(content.content);
    score += Math.min(15, emotionalWords * 3);

    return Math.min(100, score);
  }

  /**
   * 评估转化潜力
   */
  private evaluateConversionPotential(
    content: GeneratedContent,
    platform: Platform,
  ): number {
    // 简化转化潜力评估
    let score = 40;

    // 检查购买相关词汇
    const purchaseWords = this.countPurchaseWords(content.content);
    score += Math.min(20, purchaseWords * 4);

    // 检查优惠信息
    const hasDiscount = /优惠|折扣|促销|特价|福利/.test(content.content);
    if (hasDiscount) score += 10;

    // 平台特定的转化因素
    if (platform === Platform.XHS) {
      // 小红书：种草效果
      const seedingWords = this.countSeedingWords(content.content);
      score += Math.min(15, seedingWords * 3);
    }

    return Math.min(100, score);
  }

  /**
   * 生成详细反馈
   */
  private generateDetailedFeedback(
    score: number,
    content: GeneratedContent,
    platform: Platform,
  ): string {
    if (score >= 85) {
      return `优秀！您的内容在${platform}平台上表现出色，预计会有很高的参与度和转化效果。`;
    } else if (score >= 70) {
      return `良好！内容质量不错，但在${platform}平台的某些特定优化方面还有提升空间。`;
    } else if (score >= 60) {
      return `合格！基本符合${platform}平台的要求，建议根据改进建议进行优化。`;
    } else {
      return `需要改进！内容在${platform}平台上的适配度不足，建议重新构思或大幅修改。`;
    }
  }

  /**
   * 生成增强反馈
   */
  private generateEnhancedFeedback(
    baseFeedback: string,
    engagementPotential: number,
    conversionPotential: number,
  ): string {
    let feedback = baseFeedback;

    if (engagementPotential >= 80) {
      feedback += ' 内容具有很强的互动潜力，预计用户参与度会很高。';
    }

    if (conversionPotential >= 80) {
      feedback += ' 内容转化潜力优秀，有望带来明显的业务效果。';
    } else if (conversionPotential < 60) {
      feedback += ' 建议加强转化相关元素的设置。';
    }

    return feedback;
  }

  /**
   * 生成基本改进建议
   */
  private generateBasicImprovementSuggestions(
    content: GeneratedContent,
    platform: Platform,
    score: number,
  ): string[] {
    const suggestions: string[] = [];

    if (score < 70) {
      suggestions.push('增加内容长度和细节描述');
      suggestions.push('优化标题吸引力');
    }

    if ((content.hashtags || []).length < 3) {
      suggestions.push('添加更多相关话题标签');
    }

    switch (platform) {
      case Platform.XHS:
        if (
          !content.content.includes('✨') &&
          !content.content.includes('💕')
        ) {
          suggestions.push('考虑添加Emoji增强视觉吸引力');
        }
        break;
      case Platform.WECHAT_MP:
        if (!content.content.includes('\n\n')) {
          suggestions.push('使用更多段落提高可读性');
        }
        break;
    }

    return suggestions.slice(0, 3);
  }

  /**
   * 生成详细改进建议
   */
  private generateDetailedImprovementSuggestions(
    content: GeneratedContent,
    platform: Platform,
    score: number,
  ): string[] {
    const suggestions = this.generateBasicImprovementSuggestions(
      content,
      platform,
      score,
    );

    // 添加更多详细建议
    if (score < 80) {
      suggestions.push('检查并优化开头段落，确保立即吸引读者');
      suggestions.push('增加数据或案例支持，提升可信度');
    }

    if (platform === Platform.XHS && score < 75) {
      suggestions.push('尝试使用更多互动式问题句');
      suggestions.push('考虑添加用户证言或使用场景');
    }

    if (platform === Platform.WECHAT_MP && score < 75) {
      suggestions.push('添加小标题，改善内容结构');
      suggestions.push('考虑加入相关数据图表或统计信息');
    }

    return suggestions.slice(0, 5);
  }

  /**
   * 增加发布频率
   */
  private increaseFrequency(frequency: string): string {
    // 简化频率增加逻辑
    if (frequency.includes('每周')) {
      const match = frequency.match(/\d+/);
      if (match) {
        const current = parseInt(match[0], 10);
        return `每周${current + 2}次`;
      }
    }
    return frequency;
  }

  /**
   * 减少发布频率
   */
  private decreaseFrequency(frequency: string): string {
    // 简化频率减少逻辑
    if (frequency.includes('每周')) {
      const match = frequency.match(/\d+/);
      if (match) {
        const current = parseInt(match[0], 10);
        return `每周${Math.max(1, current - 1)}次`;
      }
    }
    return frequency;
  }

  /**
   * 计算互动元素数量
   */
  private countInteractiveElements(text: string): number {
    const patterns = [
      /\?/g, // 问号
      /欢迎|分享|评论|点赞|关注/g, // 互动邀请
      /投票|问卷|测试/g, // 互动形式
    ];

    let count = 0;
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      count += matches ? matches.length : 0;
    }

    return count;
  }

  /**
   * 检查趋势关键词
   */
  private checkTrendingKeywords(text: string, hashtags: string[]): number {
    // 简化趋势关键词检查
    const trendingKeywords = [
      '爆款',
      '热门',
      '网红',
      '必买',
      '推荐',
      '新品',
      '限时',
      '独家',
      '必备',
      '神器',
    ];

    const allText = text + ' ' + hashtags.join(' ');
    let count = 0;

    for (const keyword of trendingKeywords) {
      if (allText.includes(keyword)) {
        count++;
      }
    }

    return count;
  }

  /**
   * 评估内容深度
   */
  private evaluateContentDepth(text: string): number {
    // 简化深度评估
    const paragraphCount = (text.match(/\n\n/g) || []).length;
    const sentenceCount = (text.match(/[。！？]/g) || []).length;
    const wordCount = text.length;

    if (wordCount > 1000 && paragraphCount > 5 && sentenceCount > 20) {
      return 1.0;
    } else if (wordCount > 500 && paragraphCount > 3 && sentenceCount > 10) {
      return 0.7;
    } else if (wordCount > 200 && paragraphCount > 1 && sentenceCount > 5) {
      return 0.4;
    }

    return 0.2;
  }

  /**
   * 计算专业术语数量
   */
  private countProfessionalTerms(text: string): number {
    // 简化专业术语检查
    const professionalTerms = [
      '策略',
      '方案',
      '优化',
      '效果',
      '指标',
      '转化',
      '留存',
      '增长',
      '漏斗',
      'ROI',
      'KPI',
      'UV',
      'PV',
      'CTR',
      'CPA',
    ];

    let count = 0;
    for (const term of professionalTerms) {
      if (text.includes(term)) {
        count++;
      }
    }

    return count;
  }

  /**
   * 评估内容价值
   */
  private evaluateContentValue(text: string): number {
    // 简化价值评估
    const valueIndicators = [
      '如何',
      '教程',
      '指南',
      '步骤',
      '方法',
      '技巧',
      '经验',
      '案例',
      '数据',
      '分析',
      '建议',
      '解决方案',
      '最佳实践',
    ];

    let count = 0;
    for (const indicator of valueIndicators) {
      if (text.includes(indicator)) {
        count++;
      }
    }

    if (count >= 5) return 1.0;
    if (count >= 3) return 0.7;
    if (count >= 1) return 0.4;
    return 0.1;
  }

  /**
   * 提取主要内容主题
   */
  private extractMainTheme(text: string): string {
    // 简化主题提取
    const sentences = text.split(/[。！？]/);
    if (sentences.length === 0) return '未知主题';

    // 取第一句作为主题
    return sentences[0].substring(0, 50);
  }

  /**
   * 计算主题相似度
   */
  private calculateThemeSimilarity(theme1: string, theme2: string): number {
    // 简化相似度计算
    const words1 = new Set(theme1.toLowerCase().split(/\W+/));
    const words2 = new Set(theme2.toLowerCase().split(/\W+/));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * 计算情感词汇数量
   */
  private countEmotionalWords(text: string): number {
    // 简化情感词汇检查
    const emotionalWords = [
      '惊喜',
      '感动',
      '开心',
      '幸福',
      '满意',
      '期待',
      '兴奋',
      '激动',
      '温暖',
      '美好',
      '值得',
      '推荐',
      '喜欢',
      '爱',
      '赞',
    ];

    let count = 0;
    for (const word of emotionalWords) {
      if (text.includes(word)) {
        count++;
      }
    }

    return count;
  }

  /**
   * 计算购买相关词汇数量
   */
  private countPurchaseWords(text: string): number {
    // 简化购买词汇检查
    const purchaseWords = [
      '购买',
      '下单',
      '订购',
      '抢购',
      '秒杀',
      '优惠',
      '折扣',
      '促销',
      '特价',
      '省钱',
      '划算',
      '超值',
      '性价比',
      '包邮',
      '赠品',
    ];

    let count = 0;
    for (const word of purchaseWords) {
      if (text.includes(word)) {
        count++;
      }
    }

    return count;
  }

  /**
   * 计算种草词汇数量
   */
  private countSeedingWords(text: string): number {
    // 简化种草词汇检查
    const seedingWords = [
      '种草',
      '拔草',
      '安利',
      '推荐',
      '必入',
      '宝藏',
      '神仙',
      '绝了',
      '好用',
      '回购',
      '无限回购',
      '空瓶',
      '铁皮',
      '心头好',
      '真爱',
    ];

    let count = 0;
    for (const word of seedingWords) {
      if (text.includes(word)) {
        count++;
      }
    }

    return count;
  }
}
