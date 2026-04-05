import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeminiService } from './gemini.service';
import { QwenService } from './qwen.service';
import { Topic } from '../../../entities/topic.entity';
import { Material } from '../../../entities/material.entity';
import { TenantProfile } from '../../../entities/tenant-profile.entity';
import {
  WechatContentGenerationRequest,
  WechatContentGenerationResult,
  GeneratedWechatArticle,
  ContentGenerationContext,
  PromptBuilderResult,
  ContentQualityAssessment,
} from '../interfaces/wechat-content-generation.interface';
import { Platform } from '../../../shared/enums/platform.enum';

@Injectable()
export class WechatContentGenerationService {
  private readonly logger = new Logger(WechatContentGenerationService.name);
  private readonly defaultAiEngine: 'gemini' | 'qwen' = 'gemini';

  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(TenantProfile)
    private readonly tenantProfileRepository: Repository<TenantProfile>,
    @Inject(GeminiService)
    private readonly geminiService: GeminiService,
    @Inject(QwenService)
    private readonly qwenService: QwenService,
  ) {}

  /**
   * 生成微信公众号文章
   */
  async generateWechatArticle(
    request: WechatContentGenerationRequest,
  ): Promise<WechatContentGenerationResult> {
    const startTime = Date.now();
    this.logger.log(
      `开始生成微信公众号文章，topicId: ${request.topicId}, tenantId: ${request.tenantId}`,
    );

    try {
      // 1. 获取上下文数据
      const context = await this.buildGenerationContext(request);
      if (!context.topic) {
        return {
          success: false,
          error: {
            code: 'TOPIC_NOT_FOUND',
            message: `未找到ID为 ${request.topicId} 的选题`,
          },
        };
      }

      // 2. 构建提示词
      const prompt = this.buildPrompt(context);
      this.logger.debug(`构建的提示词: ${JSON.stringify(prompt, null, 2)}`);

      // 3. 调用AI生成内容
      const aiResult = await this.generateWithAI(prompt, request.options);
      if (!aiResult.success) {
        return {
          success: false,
          error: {
            code: 'AI_GENERATION_FAILED',
            message: 'AI内容生成失败',
            details: aiResult.error,
          },
        };
      }

      // 4. 解析AI响应
      const article = this.parseAIResponse(aiResult.content, context);

      // 5. 质量评估
      const qualityAssessment = await this.assessArticleQuality(article, context);

      // 6. 添加元数据
      const finalArticle = this.enrichWithMetadata(article, context, request);

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `微信公众号文章生成成功，处理时间: ${processingTime}ms`,
      );

      return {
        success: true,
        article: finalArticle,
        processingTime,
        modelUsed: aiResult.modelUsed,
        qualityAssessment,
      };
    } catch (error) {
      this.logger.error(`微信公众号文章生成失败: ${error.message}`, error.stack);
      const processingTime = Date.now() - startTime;

      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: '内容生成服务错误',
          details: error.message,
        },
        processingTime,
      };
    }
  }

  /**
   * 构建生成上下文
   */
  private async buildGenerationContext(
    request: WechatContentGenerationRequest,
  ): Promise<ContentGenerationContext> {
    // 获取选题
    const topic = await this.topicRepository.findOne({
      where: { id: request.topicId, tenantId: request.tenantId },
      relations: ['materials'],
    });

    if (!topic) {
      this.logger.warn(`未找到选题: ${request.topicId}`);
      return {
        topic: null,
        materials: [],
        tenantProfile: null,
        options: request.options || {},
      };
    }

    // 获取素材（如果relation未加载）
    let materials: Material[] = [];
    if (topic.materials && topic.materials.length > 0) {
      materials = topic.materials;
    } else {
      materials = await this.materialRepository.find({
        where: { topicId: request.topicId, tenantId: request.tenantId },
      });
    }

    // 获取单位画像
    let tenantProfile: TenantProfile = null;
    try {
      tenantProfile = await this.tenantProfileRepository.findOne({
        where: { tenantId: request.tenantId, status: 'generated' },
        order: { version: 'DESC' },
      });
    } catch (error) {
      this.logger.warn(`获取单位画像失败: ${error.message}`);
    }

    return {
      topic,
      materials,
      tenantProfile,
      options: request.options || {},
    };
  }

  /**
   * 构建提示词
   */
  private buildPrompt(context: ContentGenerationContext): PromptBuilderResult {
    const { topic, materials, tenantProfile, options } = context;

    // 构建系统提示词
    const systemPrompt = this.buildSystemPrompt(tenantProfile, options);

    // 构建用户提示词
    const userPrompt = this.buildUserPrompt(topic, materials, tenantProfile, options);

    // 构建上下文摘要
    const contextSummary = this.buildContextSummary(context);

    return {
      systemPrompt,
      userPrompt,
      contextSummary,
    };
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(
    tenantProfile: TenantProfile,
    options: WechatContentGenerationRequest['options'],
  ): string {
    let systemPrompt = `你是一个专业的微信公众号内容创作助手，擅长为政务单位和企业机构撰写高质量的文章。`;

    if (tenantProfile) {
      // 添加单位画像指导
      systemPrompt += `\n\n请遵循以下单位画像要求进行创作：`;

      if (tenantProfile.positioningDescription) {
        systemPrompt += `\n- 形象定位：${tenantProfile.positioningDescription}`;
      }

      if (tenantProfile.languageStyleDescription) {
        systemPrompt += `\n- 语言风格：${tenantProfile.languageStyleDescription}`;
      }

      if (tenantProfile.visualPreference) {
        systemPrompt += `\n- 视觉偏好：${tenantProfile.visualPreference}`;
      }

      if (tenantProfile.topicPreference && tenantProfile.topicPreference.length > 0) {
        const topTopics = tenantProfile.getSortedTopicTags().slice(0, 5);
        systemPrompt += `\n- 话题偏好：${topTopics.map(t => t.name).join('、')}`;
      }
    }

    // 添加生成选项
    if (options?.tone) {
      systemPrompt += `\n- 语气风格：${options.tone}`;
    }
    if (options?.languageStyle) {
      systemPrompt += `\n- 语言风格：${options.languageStyle}`;
    }

    systemPrompt += `\n\n请生成符合微信公众号平台特点的内容，确保结构清晰、逻辑严谨、语言得体。`;

    return systemPrompt;
  }

  /**
   * 构建用户提示词
   */
  private buildUserPrompt(
    topic: Topic,
    materials: Material[],
    tenantProfile: TenantProfile,
    options: WechatContentGenerationRequest['options'],
  ): string {
    let userPrompt = `请基于以下选题和素材，生成一篇微信公众号文章：\n\n`;

    // 选题信息
    userPrompt += `## 选题信息\n`;
    userPrompt += `- 标题：${topic.title}\n`;
    if (topic.description) {
      userPrompt += `- 描述：${topic.description}\n`;
    }
    userPrompt += `- 来源：${topic.source}\n\n`;

    // 素材信息
    if (materials.length > 0) {
      userPrompt += `## 可用素材\n`;
      materials.forEach((material, index) => {
        userPrompt += `${index + 1}. ${material.type}：${
          material.description || material.fileName || '无描述'
        }\n`;
        if (material.metadata) {
          userPrompt += `   补充信息：${JSON.stringify(material.metadata, null, 2)}\n`;
        }
      });
      userPrompt += `\n`;
    }

    // 生成要求
    userPrompt += `## 生成要求\n`;
    userPrompt += `1. 请提供3-5个标题选项，每个标题不超过30字\n`;
    userPrompt += `2. 生成完整的文章正文，结构清晰，包含引言、正文和结论\n`;
    userPrompt += `3. 提供文章摘要，不超过200字\n`;
    userPrompt += `4. 建议3-5个配图描述（说明图片应展示的内容）\n`;
    userPrompt += `5. 可选：提供相关话题标签\n`;

    if (options?.wordCount) {
      userPrompt += `6. 文章字数约${options.wordCount}字\n`;
    } else {
      userPrompt += `6. 文章字数800-1500字\n`;
    }

    return userPrompt;
  }

  /**
   * 构建上下文摘要
   */
  private buildContextSummary(context: ContentGenerationContext): string {
    const { topic, materials, tenantProfile } = context;
    let summary = `选题："${topic.title}"`;

    if (materials.length > 0) {
      summary += `，包含${materials.length}个素材`;
    }

    if (tenantProfile) {
      summary += `，使用单位画像（${tenantProfile.positioning || '无定位'}）`;
    }

    return summary;
  }

  /**
   * 调用AI生成内容
   */
  private async generateWithAI(
    prompt: PromptBuilderResult,
    options: WechatContentGenerationRequest['options'],
  ): Promise<{ success: boolean; content: string; modelUsed: string; error?: string }> {
    try {
      const fullPrompt = `${prompt.systemPrompt}\n\n${prompt.userPrompt}`;

      // 使用默认AI引擎
      if (this.defaultAiEngine === 'gemini') {
        const result = await this.geminiService.generateText({
          prompt: fullPrompt,
          platform: Platform.WECHAT_MP,
          tone: options?.tone || 'professional',
          wordCount: options?.wordCount || 1000,
          temperature: options?.temperature || 0.7,
          maxTokens: options?.maxTokens || 2000,
        });

        if (result.success && result.content) {
          return {
            success: true,
            content: result.content.content,
            modelUsed: result.modelUsed || 'gemini',
          };
        } else {
          return {
            success: false,
            content: '',
            modelUsed: 'gemini',
            error: result.error?.message || '生成失败',
          };
        }
      } else {
        // 使用Qwen服务
        // 注意：这里需要根据QwenService的实际接口调整
        // 暂时返回错误
        return {
          success: false,
          content: '',
          modelUsed: 'qwen',
          error: 'Qwen服务暂未实现',
        };
      }
    } catch (error) {
      return {
        success: false,
        content: '',
        modelUsed: this.defaultAiEngine,
        error: error.message,
      };
    }
  }

  /**
   * 解析AI响应
   */
  private parseAIResponse(
    aiContent: string,
    context: ContentGenerationContext,
  ): GeneratedWechatArticle {
    // 简单解析逻辑，实际应该更复杂
    // 这里假设AI返回的结构化内容

    // 尝试解析标题选项（假设以"标题选项："开头）
    const titleMatch = aiContent.match(/标题选项：([\s\S]*?)(?=\n\n|\n正文|$)/);
    const titleOptions = titleMatch
      ? titleMatch[1]
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.startsWith('- ') || line.startsWith('• ') || line.match(/^\d\.\s/))
          .map((line) => line.replace(/^[-•\d\.\s]+/, '').trim())
          .filter((line) => line.length > 0)
      : [`${context.topic.title} - 微信公众号文章`];

    // 尝试提取正文
    const contentMatch = aiContent.match(/正文：([\s\S]*?)(?=\n\n摘要|$)/);
    const content = contentMatch ? contentMatch[1].trim() : aiContent;

    // 尝试提取摘要
    const summaryMatch = aiContent.match(/摘要：([\s\S]*?)(?=\n\n配图建议|$)/);
    const summary = summaryMatch
      ? summaryMatch[1].trim()
      : content.substring(0, Math.min(200, content.length)) + '...';

    // 尝试提取配图建议
    const imageMatch = aiContent.match(/配图建议：([\s\S]*?)(?=\n\n话题标签|$)/);
    const imageSuggestions = imageMatch
      ? imageMatch[1]
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.startsWith('- ') || line.startsWith('• ') || line.match(/^\d\.\s/))
          .map((line) => line.replace(/^[-•\d\.\s]+/, '').trim())
          .filter((line) => line.length > 0)
      : [];

    // 计算字数
    const wordCount = content.length;

    return {
      title: titleOptions[0] || context.topic.title,
      content,
      summary,
      titleOptions: titleOptions.slice(0, 5), // 最多5个标题选项
      imageSuggestions: imageSuggestions.slice(0, 5), // 最多5个配图建议
      hashtags: [],
      estimatedReadingTime: this.calculateReadingTime(wordCount),
      wordCount,
      tone: context.options?.tone || 'professional',
      languageStyle: context.tenantProfile?.languageStyle || 'formal',
      metadata: {
        topicId: context.topic.id,
        tenantId: context.topic.tenantId,
        userId: context.topic.userId,
        generatedAt: new Date(),
        modelUsed: this.defaultAiEngine,
        profileInfluenced: !!context.tenantProfile,
        materialsUsed: context.materials.length,
      },
    };
  }

  /**
   * 评估文章质量
   */
  private async assessArticleQuality(
    article: GeneratedWechatArticle,
    context: ContentGenerationContext,
  ): Promise<ContentQualityAssessment> {
    // 简单质量评估逻辑
    let score = 50;

    // 标题质量
    if (article.title.length > 10 && article.title.length < 30) score += 10;
    if (article.titleOptions && article.titleOptions.length >= 3) score += 10;

    // 内容质量
    if (article.wordCount > 500 && article.wordCount < 2000) score += 15;
    if (article.content.includes('\n\n')) score += 5; // 有段落结构

    // 摘要质量
    if (article.summary && article.summary.length > 50 && article.summary.length < 200) score += 5;

    // 配图建议
    if (article.imageSuggestions && article.imageSuggestions.length >= 3) score += 5;

    // 单位画像匹配度
    if (context.tenantProfile) {
      score += 10; // 有单位画像指导，加分
    }

    // 确保分数在0-100之间
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      metrics: {
        readability: Math.min(100, score + 10),
        engagement: Math.min(100, score + 5),
        relevance: Math.min(100, score + 15),
        originality: Math.min(100, score),
        platformFit: Math.min(100, score + 20), // 微信公众号适配度
      },
      feedback: this.generateQualityFeedback(score),
      improvementSuggestions: this.generateImprovementSuggestions(score, article),
    };
  }

  /**
   * 生成质量反馈
   */
  private generateQualityFeedback(score: number): string {
    if (score >= 85) {
      return '优秀！文章结构完整，内容丰富，符合微信公众号平台要求。';
    } else if (score >= 70) {
      return '良好！文章质量不错，但在某些方面还有优化空间。';
    } else if (score >= 60) {
      return '合格！基本符合要求，建议根据改进建议进行优化。';
    } else {
      return '需要改进！文章在多个方面需要优化，建议重新生成或大幅修改。';
    }
  }

  /**
   * 生成改进建议
   */
  private generateImprovementSuggestions(
    score: number,
    article: GeneratedWechatArticle,
  ): string[] {
    const suggestions: string[] = [];

    if (score < 70) {
      suggestions.push('增加文章长度和细节描述');
      suggestions.push('优化标题吸引力');
    }

    if (!article.content.includes('\n\n')) {
      suggestions.push('使用更多段落提高可读性');
    }

    if (article.wordCount < 500) {
      suggestions.push('扩充内容，增加案例或数据支持');
    }

    if (article.imageSuggestions.length < 2) {
      suggestions.push('增加配图建议，增强视觉表现力');
    }

    return suggestions.slice(0, 3);
  }

  /**
   * 丰富元数据
   */
  private enrichWithMetadata(
    article: GeneratedWechatArticle,
    context: ContentGenerationContext,
    request: WechatContentGenerationRequest,
  ): GeneratedWechatArticle {
    // 添加视觉建议
    const visualSuggestions = this.generateVisualSuggestions(context);
    if (visualSuggestions.length > 0) {
      article.visualSuggestions = visualSuggestions;
    }

    // 添加话题标签
    if (context.tenantProfile?.topicPreference) {
      const topTopics = context.tenantProfile.getSortedTopicTags().slice(0, 3);
      article.hashtags = topTopics.map((t) => t.name);
    }

    return article;
  }

  /**
   * 生成视觉建议
   */
  private generateVisualSuggestions(context: ContentGenerationContext) {
    const suggestions = [];
    const { tenantProfile } = context;

    if (tenantProfile) {
      if (tenantProfile.visualPreference) {
        suggestions.push({
          type: 'color' as const,
          description: '色彩搭配',
          suggestion: `建议使用符合${tenantProfile.visualPreference}风格的色彩搭配`,
          reason: '基于单位画像的视觉偏好',
        });
      }

      if (tenantProfile.visualPreferenceDetail?.primaryColor) {
        suggestions.push({
          type: 'color' as const,
          description: '主色调',
          suggestion: `建议使用${tenantProfile.visualPreferenceDetail.primaryColor}作为主色调`,
          reason: '单位画像推荐的主色调',
        });
      }
    }

    // 默认建议
    suggestions.push({
      type: 'layout' as const,
      description: '版式布局',
      suggestion: '建议使用图文混排，每300-500字插入相关配图',
      reason: '提高微信公众号文章的可读性和吸引力',
    });

    return suggestions;
  }

  /**
   * 计算阅读时间
   */
  private calculateReadingTime(wordCount: number): string {
    const wordsPerMinute = 300; // 平均阅读速度
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes}分钟`;
  }
}