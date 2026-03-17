import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import {
  GeminiConfig,
  GeminiStrategyResponse,
  CampaignSummary,
  GeminiError,
  GeminiGenerateOptions,
} from '../interfaces/gemini.interface';
import {
  ContentGenerationOptions,
  MarketingContentOptions,
  GeneratedContent,
  MarketingContent,
  ContentGenerationResult,
  ContentQualityAssessment,
} from '../interfaces/content-generation.interface';
import { Platform } from '../../../shared/enums/platform.enum';

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private config: GeminiConfig;
  private isAvailable = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      this.logger.warn(
        'GEMINI_API_KEY not configured or using default value. GeminiService will use fallback mode.',
      );
      this.isAvailable = false;
      return;
    }

    try {
      this.config = {
        apiKey,
        model: this.configService.get<string>(
          'GEMINI_MODEL',
          'gemini-1.5-flash',
        ),
        temperature: this.configService.get<number>('GEMINI_TEMPERATURE', 0.7),
        maxTokens: this.configService.get<number>('GEMINI_MAX_TOKENS', 2048),
        topP: this.configService.get<number>('GEMINI_TOP_P', 0.95),
        topK: this.configService.get<number>('GEMINI_TOP_K', 40),
        timeout: 30000, // 30秒超时
      };

      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
      this.isAvailable = true;

      this.logger.log(
        `GeminiService initialized with model: ${this.config.model}`,
      );
      this.logger.log('Gemini API is available for use.');
    } catch (error) {
      this.logger.error(`Failed to initialize GeminiService: ${error.message}`);
      this.isAvailable = false;
    }
  }

  /**
   * 检查 Gemini API 是否可用
   */
  isGeminiAvailable(): boolean {
    return this.isAvailable && this.genAI !== null;
  }

  /**
   * 生成营销策略方案
   */
  async generateMarketingStrategy(options: GeminiGenerateOptions): Promise<{
    success: boolean;
    data?: GeminiStrategyResponse;
    error?: GeminiError;
    fallbackUsed?: boolean;
  }> {
    const {
      campaignSummary,
      strategyType,
      useFallback = true,
      timeout = 30000,
    } = options;

    // 检查 API 可用性
    if (!this.isGeminiAvailable() || !useFallback) {
      if (!useFallback) {
        return {
          success: false,
          error: {
            code: 'API_KEY_INVALID',
            message: 'Gemini API is not available and fallback is disabled',
          },
        };
      }
      this.logger.warn('Gemini API not available, using fallback template');
      return this.generateFallbackStrategy(campaignSummary, strategyType);
    }

    // 构建提示词
    const prompt = this.buildStrategyPrompt(campaignSummary, strategyType);

    try {
      // this.genAI is guaranteed to be non-null here because isGeminiAvailable() returned true
      const model = this.genAI!.getGenerativeModel({
        model: this.config.model,
        generationConfig: {
          temperature: this.config.temperature,
          topP: this.config.topP,
          topK: this.config.topK,
          maxOutputTokens: this.config.maxTokens,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      // 设置超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const result = await model.generateContent(prompt);
      clearTimeout(timeoutId);

      const response = await result.response;
      const text = response.text();

      // 解析 JSON 响应
      const parsedResponse = this.parseGeminiResponse(text);

      if (!parsedResponse.success) {
        this.logger.warn('Failed to parse Gemini response, using fallback');
        if (useFallback) {
          return this.generateFallbackStrategy(campaignSummary, strategyType);
        }
        return {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse Gemini response',
            details: text.substring(0, 500),
          },
        };
      }

      return {
        success: true,
        data: parsedResponse.data,
      };
    } catch (error) {
      this.logger.error(`Gemini API call failed: ${error.message}`);

      // 错误分类
      let geminiError: GeminiError;
      if (error.name === 'AbortError') {
        geminiError = {
          code: 'NETWORK_ERROR',
          message: 'Gemini API request timeout',
          details: `Timeout after ${timeout}ms`,
        };
      } else if (error.message?.includes('API_KEY_INVALID')) {
        geminiError = {
          code: 'API_KEY_INVALID',
          message: 'Invalid Gemini API key',
        };
      } else if (error.message?.includes('QUOTA_EXCEEDED')) {
        geminiError = {
          code: 'QUOTA_EXCEEDED',
          message: 'Gemini API quota exceeded',
        };
      } else if (error.message?.includes('SAFETY')) {
        geminiError = {
          code: 'CONTENT_BLOCKED',
          message: 'Content blocked by safety filters',
        };
      } else {
        geminiError = {
          code: 'UNKNOWN_ERROR',
          message: 'Unknown error occurred',
          details: error.message,
        };
      }

      // 使用回退策略
      if (useFallback) {
        this.logger.warn(
          `Using fallback strategy due to error: ${geminiError.code}`,
        );
        return this.generateFallbackStrategy(campaignSummary, strategyType);
      }

      return {
        success: false,
        error: geminiError,
      };
    }
  }

  /**
   * 构建策略生成提示词
   */
  private buildStrategyPrompt(
    campaignSummary: CampaignSummary,
    strategyType?: string,
  ): string {
    const {
      name,
      campaignType,
      targetAudience,
      budget,
      startDate,
      endDate,
      insights,
    } = campaignSummary;

    const dateRange =
      startDate && endDate
        ? `${startDate.toISOString().split('T')[0]} 至 ${endDate.toISOString().split('T')[0]}`
        : '未指定';

    const insightsText = insights
      ? `
活动洞察：
- 已生成策略数量：${insights.totalStrategies}
- 平均置信度分数：${insights.averageConfidenceScore.toFixed(1)}
- 策略类型分布：${JSON.stringify(insights.strategyTypeDistribution)}
- 预估总 ROI：${insights.estimatedTotalROI.toFixed(2)}%
- 完成率：${insights.completionRate}%
`
      : '暂无活动洞察数据';

    const strategyTypeText = strategyType
      ? `策略类型：${strategyType}`
      : '综合营销策略';

    return `你是一位经验丰富的灵曜智媒首席营销专家。请基于以下营销活动摘要，生成一份详细的营销策略方案。

活动信息：
- 活动名称：${name}
- 活动类型：${campaignType}
- 目标受众：${JSON.stringify(targetAudience, null, 2)}
- 预算：${budget} 元
- 时间范围：${dateRange}
- ${strategyTypeText}

${insightsText}

请生成一份包含以下内容的 JSON 方案：
1. 活动名称（campaignName）：基于原活动名称的优化版本
2. 目标人群分析（targetAudienceAnalysis）：详细描述目标人群特征、痛点、兴趣点，包含 demographics、interests、painPoints、preferredChannels 字段
3. 核心创意（coreIdea）：活动的核心创意概念和独特卖点，100-200字
4. 小红书文案（xhsContent）：适合小红书平台的完整文案，包含 title、content、hashtags、suggestedImages 字段
5. 建议执行时间（recommendedExecutionTime）：具体的时间安排和执行计划，包含 timeline、bestPostingTimes、seasonalConsiderations 字段
6. 预期效果指标（expectedPerformanceMetrics）：包括 engagementRate（互动率 0-100）、conversionRate（转化率 0-100）、expectedReach（预期覆盖人数）、estimatedROI（预估投资回报率）等量化指标
7. 执行步骤计划（executionSteps）：详细的执行步骤、时间节点和负责人，每个步骤包含 step、description、responsible、deadline 字段
8. 风险评估（riskAssessment）：可能遇到的风险点和相应的应对措施，每个风险包含 risk、probability（低/中/高）、impact（低/中/高）、mitigationStrategy 字段
9. 预算分配方案（budgetAllocation）：详细的预算分配建议，包含 category、amount、percentage、justification 字段

请以严格的 JSON 格式返回，确保字段名称与上述要求一致，不要包含任何额外的文本或解释。`;
  }

  /**
   * 解析 Gemini 响应文本为 JSON
   */
  private parseGeminiResponse(text: string): {
    success: boolean;
    data?: GeminiStrategyResponse;
    error?: string;
  } {
    try {
      // 尝试提取 JSON 部分（Gemini 有时会在响应中添加额外文本）
      const jsonMatch =
        text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
      const jsonText = jsonMatch
        ? jsonMatch[0].replace(/```json\n|\n```/g, '')
        : text;

      const parsed = JSON.parse(jsonText);

      // 验证必需字段
      const requiredFields = [
        'campaignName',
        'targetAudienceAnalysis',
        'coreIdea',
        'xhsContent',
        'recommendedExecutionTime',
        'expectedPerformanceMetrics',
        'executionSteps',
        'riskAssessment',
        'budgetAllocation',
      ];

      for (const field of requiredFields) {
        if (!parsed[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return {
        success: true,
        data: parsed as GeminiStrategyResponse,
      };
    } catch (error) {
      this.logger.error(`Failed to parse response: ${error.message}`);
      this.logger.debug(`Raw response: ${text.substring(0, 1000)}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 生成回退策略（当 Gemini API 不可用时使用）
   */
  private generateFallbackStrategy(
    campaignSummary: CampaignSummary,
    strategyType?: string,
  ): {
    success: boolean;
    data: GeminiStrategyResponse;
    error?: GeminiError;
    fallbackUsed: boolean;
  } {
    this.logger.log('Generating fallback marketing strategy');

    const type = strategyType || '综合营销策略';
    const baseName = campaignSummary.name;

    const fallbackStrategy: GeminiStrategyResponse = {
      campaignName: `${baseName}（回退方案）`,
      targetAudienceAnalysis: {
        demographics: ['25-35岁', '一线城市', '中高收入群体'],
        interests: ['时尚美妆', '生活方式', '旅游美食'],
        painPoints: ['信息过载', '选择困难', '时间有限'],
        preferredChannels: ['小红书', '微信公众号', '抖音'],
      },
      coreIdea: `这是一份基于 ${type} 的营销策略回退方案。由于 Gemini API 暂时不可用，我们提供了基于最佳实践的基础方案。建议在 API 恢复后重新生成更精准的策略。`,
      xhsContent: {
        title: `${baseName}｜${type}营销方案`,
        content: `大家好！今天分享我们的${baseName}营销方案✨\n\n🔹 核心目标：提升品牌曝光和用户互动\n🔹 目标人群：${campaignSummary.targetAudience?.description || '25-35岁时尚人群'}\n🔹 预算：${campaignSummary.budget}元\n\n💡 核心创意：\n通过内容营销和社区互动，打造品牌影响力。\n\n📅 执行计划：\n1. 第一阶段：内容预热\n2. 第二阶段：活动引爆\n3. 第三阶段：持续运营\n\n#${baseName.replace(/\s+/g, '')} #营销方案 #小红书运营 #品牌推广`,
        hashtags: ['营销方案', '小红书运营', '品牌推广', '内容营销'],
        suggestedImages: ['产品展示', '场景图', '用户证言', '数据图表'],
      },
      recommendedExecutionTime: {
        timeline: [
          {
            phase: '准备期',
            duration: '2周',
            activities: ['内容规划', '资源准备', '团队培训'],
          },
          {
            phase: '执行期',
            duration: '4周',
            activities: ['内容发布', '活动运营', '数据监测'],
          },
          {
            phase: '优化期',
            duration: '2周',
            activities: ['效果评估', '策略调整', '总结报告'],
          },
        ],
        bestPostingTimes: ['09:00-11:00', '19:00-21:00', '周末上午'],
        seasonalConsiderations: [
          '春季：清新活力主题',
          '夏季：清凉解暑主题',
          '秋季：收获感恩主题',
          '冬季：温暖关怀主题',
        ],
      },
      expectedPerformanceMetrics: {
        engagementRate: 3.5,
        conversionRate: 1.2,
        expectedReach: 50000,
        estimatedROI: 25,
      },
      executionSteps: [
        {
          step: 1,
          description: '市场调研与竞品分析',
          responsible: '市场部',
          deadline: '第1周',
        },
        {
          step: 2,
          description: '内容创意与脚本撰写',
          responsible: '内容团队',
          deadline: '第2周',
        },
        {
          step: 3,
          description: '素材制作与审核',
          responsible: '设计部',
          deadline: '第3周',
        },
        {
          step: 4,
          description: '渠道发布与推广',
          responsible: '运营部',
          deadline: '第4周',
        },
        {
          step: 5,
          description: '数据监测与优化',
          responsible: '数据分析',
          deadline: '持续',
        },
      ],
      riskAssessment: [
        {
          risk: '平台算法变化',
          probability: '中',
          impact: '高',
          mitigationStrategy: '多平台分发，降低单一平台依赖',
        },
        {
          risk: '预算超支',
          probability: '低',
          impact: '中',
          mitigationStrategy: '分阶段拨款，定期审计',
        },
        {
          risk: '内容效果不佳',
          probability: '中',
          impact: '中',
          mitigationStrategy: 'A/B测试，快速迭代',
        },
      ],
      budgetAllocation: [
        {
          category: '内容制作',
          amount: campaignSummary.budget * 0.4,
          percentage: 40,
          justification: '高质量内容是营销成功的基础',
        },
        {
          category: '渠道推广',
          amount: campaignSummary.budget * 0.3,
          percentage: 30,
          justification: '包括小红书推广、微信广告等',
        },
        {
          category: '数据分析',
          amount: campaignSummary.budget * 0.15,
          percentage: 15,
          justification: '效果监测与优化调整',
        },
        {
          category: '应急备用',
          amount: campaignSummary.budget * 0.15,
          percentage: 15,
          justification: '应对突发情况和机会',
        },
      ],
    };

    return {
      success: true,
      data: fallbackStrategy,
      error: {
        code: 'API_KEY_INVALID',
        message: 'Using fallback strategy due to Gemini API unavailability',
        fallbackUsed: true,
      },
      fallbackUsed: true,
    };
  }

  /**
   * 生成单一平台内容
   */
  async generateContent(
    options: ContentGenerationOptions,
  ): Promise<ContentGenerationResult> {
    const {
      prompt,
      platform,
      tone = 'casual',
      wordCount,
      includeHashtags = true,
      includeImageSuggestions = true,
    } = options;

    // 检查 API 可用性
    if (!this.isGeminiAvailable()) {
      this.logger.warn(
        'Gemini API not available, using fallback content generation',
      );
      return this.generateFallbackContent(options);
    }

    try {
      // 构建内容生成提示词
      const contentPrompt = this.buildContentPrompt(
        prompt,
        platform,
        tone,
        wordCount,
      );

      // this.genAI is guaranteed to be non-null here because isGeminiAvailable() returned true
      const model = this.genAI!.getGenerativeModel({
        model: this.config.model,
        generationConfig: {
          temperature: options.temperature || this.config.temperature,
          topP: this.config.topP,
          topK: this.config.topK,
          maxOutputTokens: options.maxTokens || this.config.maxTokens,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      const result = await model.generateContent(contentPrompt);
      const response = await result.response;
      const text = response.text();

      // 解析内容响应
      const generatedContent = this.parseContentResponse(
        text,
        platform,
        options,
      );

      // 评估内容质量
      const qualityAssessment = this.assessContentQuality(
        generatedContent,
        platform,
      );

      return {
        success: true,
        content: generatedContent,
        qualityAssessment,
        processingTime: 0, // 实际应用中应该计算处理时间
        modelUsed: this.config.model,
      };
    } catch (error) {
      this.logger.error(`Content generation failed: ${error.message}`);

      // 使用回退内容
      return this.generateFallbackContent(options);
    }
  }

  /**
   * 生成营销内容包（多平台）
   */
  async generateMarketingContent(
    options: MarketingContentOptions,
  ): Promise<ContentGenerationResult> {
    const {
      campaignSummary,
      targetPlatforms,
      contentTypes = ['promotional'],
      tone = 'professional',
      quantity = 1,
    } = options;

    // 检查 API 可用性
    if (!this.isGeminiAvailable()) {
      this.logger.warn(
        'Gemini API not available, using fallback marketing content generation',
      );
      return this.generateFallbackMarketingContent(options);
    }

    try {
      const contents: GeneratedContent[] = [];
      const startTime = Date.now();

      // 为每个平台生成内容
      for (const platform of targetPlatforms) {
        for (let i = 0; i < quantity; i++) {
          const prompt = this.buildMarketingContentPrompt(
            campaignSummary,
            platform,
            contentTypes,
            tone,
          );

          const contentOptions: ContentGenerationOptions = {
            prompt,
            platform,
            tone,
            includeHashtags: true,
            includeImageSuggestions: true,
          };

          const result = await this.generateContent(contentOptions);
          if (result.success && result.content) {
            contents.push(result.content);
          }
        }
      }

      if (contents.length === 0) {
        throw new Error(
          'Failed to generate any content for the marketing campaign',
        );
      }

      // 计算总体质量分数
      const overallQualityScore =
        contents.reduce(
          (sum, content) => sum + (content.qualityScore || 50),
          0,
        ) / contents.length;

      // 计算一致性分数（基于跨平台内容主题一致性）
      const consistencyScore = this.calculateConsistencyScore(contents);

      const marketingContent: MarketingContent = {
        campaignId: campaignSummary.id,
        campaignName: campaignSummary.name,
        contents,
        overallQualityScore,
        consistencyScore,
        recommendedPostingSchedule: targetPlatforms.map((platform) => ({
          platform,
          bestTimes: this.getBestPostingTimes(platform),
          frequency: this.getRecommendedFrequency(platform),
        })),
        contentStrategySummary: this.generateContentStrategySummary(
          contents,
          campaignSummary,
        ),
        generatedAt: new Date(),
      };

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        marketingContent,
        processingTime,
        modelUsed: this.config.model,
      };
    } catch (error) {
      this.logger.error(
        `Marketing content generation failed: ${error.message}`,
      );

      // 使用回退营销内容
      return this.generateFallbackMarketingContent(options);
    }
  }

  /**
   * 构建内容生成提示词
   */
  private buildContentPrompt(
    prompt: string,
    platform: Platform,
    tone: string,
    wordCount?: number,
  ): string {
    const platformInstructions = this.getPlatformInstructions(platform);
    const toneInstructions = this.getToneInstructions(tone);

    const wordCountText = wordCount ? `大约 ${wordCount} 字` : '适当长度';

    return `你是一位专业的内容创作者。请基于以下要求生成内容：

原始需求：${prompt}

平台：${platform}
风格：${tone}
字数：${wordCountText}

${platformInstructions}
${toneInstructions}

请生成包含以下内容的 JSON 格式输出：
1. title：吸引人的标题
2. content：完整的内容正文
3. hashtags：相关的话题标签数组
4. suggestedImages：建议的图片描述数组（可选）
5. wordCount：字数统计
6. estimatedReadingTime：预计阅读时间（如 "3分钟"）

请确保内容符合平台特点，风格一致，并且具有吸引力。
以严格的 JSON 格式返回，不要包含任何额外的文本或解释。`;
  }

  /**
   * 构建营销内容提示词
   */
  private buildMarketingContentPrompt(
    campaignSummary: CampaignSummary,
    platform: Platform,
    contentTypes: string[],
    tone: string,
  ): string {
    const platformInstructions = this.getPlatformInstructions(platform);
    const contentTypeText = contentTypes.join('、');

    return `你是一位专业的营销内容创作者。请基于以下营销活动信息，为${platform}平台生成${contentTypeText}类型的内容：

活动名称：${campaignSummary.name}
活动类型：${campaignSummary.campaignType}
目标受众：${JSON.stringify(campaignSummary.targetAudience, null, 2)}
预算：${campaignSummary.budget} 元

${platformInstructions}

要求：
1. 内容风格：${tone}
2. 内容类型：${contentTypeText}
3. 突出活动的核心价值和独特卖点
4. 包含吸引目标受众的关键信息
5. 符合平台的内容规范和最佳实践

请生成高质量、有吸引力的内容，能够有效促进用户参与和转化。`;
  }

  /**
   * 解析内容响应
   */
  private parseContentResponse(
    text: string,
    platform: Platform,
    options: ContentGenerationOptions,
  ): GeneratedContent {
    try {
      // 尝试提取 JSON 部分
      const jsonMatch =
        text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
      const jsonText = jsonMatch
        ? jsonMatch[0].replace(/```json\n|\n```/g, '')
        : text;

      const parsed = JSON.parse(jsonText);

      // 计算字数
      const contentText = parsed.content || '';
      const wordCount = contentText.length;

      // 估计阅读时间（按中文平均阅读速度300字/分钟）
      const readingMinutes = Math.ceil(wordCount / 300);
      const estimatedReadingTime =
        readingMinutes === 1 ? '1分钟' : `${readingMinutes}分钟`;

      return {
        title: parsed.title || '未命名内容',
        content: contentText,
        hashtags: parsed.hashtags || [],
        suggestedImages: parsed.suggestedImages || [],
        platform,
        wordCount,
        estimatedReadingTime,
        tone: options.tone,
      };
    } catch (error) {
      this.logger.error(`Failed to parse content response: ${error.message}`);

      // 返回基本的内容结构
      return {
        title: '生成内容',
        content: text.substring(0, 1000),
        hashtags: ['内容生成', platform],
        platform,
        wordCount: text.length,
        estimatedReadingTime: '2分钟',
        tone: options.tone,
      };
    }
  }

  /**
   * 评估内容质量
   */
  private assessContentQuality(
    content: GeneratedContent,
    platform: Platform,
  ): ContentQualityAssessment {
    // 简单的内容质量评估逻辑
    // 实际应用中可以使用更复杂的算法或调用AI进行评估

    const wordCount = content.wordCount || 0;
    const hasTitle = content.title && content.title.length > 0;
    const hasContent = content.content && content.content.length > 0;
    const hasHashtags = content.hashtags && content.hashtags.length > 0;

    // 基础分数
    let score = 60;

    // 根据内容特征加分
    if (wordCount > 300) score += 10; // 内容长度适中
    if (wordCount > 100 && wordCount < 1000) score += 5; // 合理长度
    if (hasTitle) score += 5;
    if (hasContent) score += 10;
    if (hasHashtags) score += 5;
    if (content.suggestedImages && content.suggestedImages.length > 0)
      score += 5;

    // 平台适配加分
    score += this.getPlatformFitScore(content, platform);

    // 确保分数在0-100之间
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      metrics: {
        readability: Math.min(100, score + 10),
        engagement: Math.min(100, score + 5),
        relevance: Math.min(100, score + 15),
        originality: Math.min(100, score),
        platformFit: this.getPlatformFitScore(content, platform) + 70,
      },
      feedback: this.generateQualityFeedback(score, content),
      improvementSuggestions: this.generateImprovementSuggestions(
        score,
        content,
        platform,
      ),
    };
  }

  /**
   * 计算平台适配分数
   */
  private getPlatformFitScore(
    content: GeneratedContent,
    platform: Platform,
  ): number {
    // 简单的平台适配评分
    switch (platform) {
      case Platform.XHS:
        // 小红书：短句、Emoji、互动感
        const hasEmoji = /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(content.content);
        const hasShortParagraphs =
          (content.content.match(/\n\n/g) || []).length > 2;
        return (hasEmoji ? 10 : 0) + (hasShortParagraphs ? 5 : 0);
      case Platform.WECHAT_MP:
        // 公众号：结构化、长文、正式
        const hasHeadings = /#{1,3}\s/.test(content.content);
        const wordCount = content.wordCount || 0;
        return (hasHeadings ? 10 : 0) + (wordCount > 800 ? 5 : 0);
      default:
        return 50;
    }
  }

  /**
   * 生成质量反馈
   */
  private generateQualityFeedback(
    score: number,
    content: GeneratedContent,
  ): string {
    if (score >= 85) {
      return '内容质量优秀！标题吸引人，内容充实，格式规范，非常适合目标平台。';
    } else if (score >= 70) {
      return '内容质量良好。建议进一步优化标题和增加互动元素。';
    } else if (score >= 60) {
      return '内容质量合格。可以考虑增加细节描述和优化结构。';
    } else {
      return '内容质量有待提升。建议重新审视内容结构和关键信息表达。';
    }
  }

  /**
   * 生成改进建议
   */
  private generateImprovementSuggestions(
    score: number,
    content: GeneratedContent,
    platform: Platform,
  ): string[] {
    const suggestions: string[] = [];

    if ((content.wordCount || 0) < 200) {
      suggestions.push('内容长度较短，建议增加更多细节和描述。');
    }

    if ((content.hashtags || []).length < 3) {
      suggestions.push('话题标签数量不足，建议添加更多相关标签以提高曝光。');
    }

    if (!content.title || content.title.length < 5) {
      suggestions.push('标题可以更具吸引力，尝试使用数字、疑问句或情感词汇。');
    }

    switch (platform) {
      case Platform.XHS:
        if (
          !content.content.includes('✨') &&
          !content.content.includes('🔥')
        ) {
          suggestions.push('考虑添加一些Emoji符号增加视觉吸引力。');
        }
        break;
      case Platform.WECHAT_MP:
        if (!content.content.includes('\n\n')) {
          suggestions.push('建议使用更多段落和标题，提高可读性。');
        }
        break;
    }

    return suggestions.slice(0, 3); // 最多返回3条建议
  }

  /**
   * 获取平台特定指令
   */
  private getPlatformInstructions(platform: Platform): string {
    switch (platform) {
      case Platform.XHS:
        return '平台特点：小红书，以短句、Emoji、高互动性为特点。内容需要亲切、真实、有分享价值。建议使用分段、表情符号和话题标签。';
      case Platform.WECHAT_MP:
        return '平台特点：微信公众号，以长文、结构化、深度内容为特点。内容需要专业、有深度、提供价值。建议使用标题、段落和清晰的逻辑结构。';
      default:
        return '平台特点：通用社交媒体平台。内容需要吸引人、信息清晰、有互动性。';
    }
  }

  /**
   * 获取语气指令
   */
  private getToneInstructions(tone: string): string {
    switch (tone) {
      case 'formal':
        return '语气要求：正式、专业。使用规范的书面语，避免口语化表达。';
      case 'casual':
        return '语气要求：随意、亲切。使用口语化表达，可以适当加入网络用语。';
      case 'friendly':
        return '语气要求：友好、热情。使用积极的语言，建立与读者的情感连接。';
      case 'professional':
        return '语气要求：专业、权威。使用行业术语，展示专业知识和经验。';
      default:
        return '语气要求：中性、得体。使用标准的书面表达。';
    }
  }

  /**
   * 获取最佳发布时间
   */
  private getBestPostingTimes(platform: Platform): string[] {
    switch (platform) {
      case Platform.XHS:
        return ['09:00-11:00', '19:00-21:00', '周末上午'];
      case Platform.WECHAT_MP:
        return ['08:00-10:00', '12:00-14:00', '20:00-22:00'];
      default:
        return ['09:00-11:00', '14:00-16:00', '19:00-21:00'];
    }
  }

  /**
   * 获取推荐发布频率
   */
  private getRecommendedFrequency(platform: Platform): string {
    switch (platform) {
      case Platform.XHS:
        return '每周3-5次';
      case Platform.WECHAT_MP:
        return '每周2-3次';
      default:
        return '每周3次';
    }
  }

  /**
   * 计算内容一致性分数
   */
  private calculateConsistencyScore(contents: GeneratedContent[]): number {
    if (contents.length <= 1) return 100;

    // 简单的一致性检查：检查标题和内容主题的相似性
    const titles = contents.map((c) => c.title);
    const firstTitle = titles[0];

    // 计算标题相似度
    let similaritySum = 0;
    for (let i = 1; i < titles.length; i++) {
      similaritySum += this.calculateStringSimilarity(firstTitle, titles[i]);
    }

    const averageSimilarity = similaritySum / (titles.length - 1);
    return Math.round(averageSimilarity * 100);
  }

  /**
   * 计算字符串相似度（简单的Jaccard相似度）
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.toLowerCase().split(/\W+/));
    const words2 = new Set(str2.toLowerCase().split(/\W+/));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * 生成内容策略摘要
   */
  private generateContentStrategySummary(
    contents: GeneratedContent[],
    campaignSummary: CampaignSummary,
  ): string {
    const platformCount = new Set(contents.map((c) => c.platform)).size;
    const totalContentCount = contents.length;
    const avgQualityScore =
      contents.reduce((sum, c) => sum + (c.qualityScore || 50), 0) /
      contents.length;

    return `为"${campaignSummary.name}"活动生成了${totalContentCount}条内容，覆盖${platformCount}个平台。平均质量评分：${avgQualityScore.toFixed(1)}/100。内容涵盖多种类型，适配各平台特点，旨在有效触达目标受众并促进活动目标达成。`;
  }

  /**
   * 生成回退内容（当API不可用时）
   */
  private generateFallbackContent(
    options: ContentGenerationOptions,
  ): ContentGenerationResult {
    this.logger.log('Generating fallback content');

    const { prompt, platform, tone } = options;

    const fallbackContent: GeneratedContent = {
      title: `关于"${prompt.substring(0, 20)}..."的内容`,
      content: `这是基于"${prompt}"生成的内容。由于Gemini API暂时不可用，我们提供了基础版本的内容草稿。\n\n建议在API恢复后重新生成更优化的版本。`,
      hashtags: ['内容生成', platform, '基础版本'],
      platform,
      tone,
      wordCount: 150,
      estimatedReadingTime: '1分钟',
    };

    return {
      success: true,
      content: fallbackContent,
      qualityAssessment: {
        score: 60,
        metrics: {
          readability: 70,
          engagement: 60,
          relevance: 65,
          originality: 55,
          platformFit: 60,
        },
        feedback: '基础版本内容，功能完整但缺乏优化。建议在API恢复后重新生成。',
        improvementSuggestions: [
          '添加更多细节和具体信息',
          '优化标题吸引力',
          '增加平台特定的元素',
        ],
      },
      processingTime: 0,
      modelUsed: 'fallback',
    };
  }

  /**
   * 生成回退营销内容
   */
  private generateFallbackMarketingContent(
    options: MarketingContentOptions,
  ): ContentGenerationResult {
    this.logger.log('Generating fallback marketing content');

    const { campaignSummary, targetPlatforms } = options;

    const contents: GeneratedContent[] = targetPlatforms.map((platform) => ({
      title: `${campaignSummary.name}营销内容`,
      content: `这是为${campaignSummary.name}活动生成的营销内容。活动类型：${campaignSummary.campaignType}，预算：${campaignSummary.budget}元。\n\n由于Gemini API暂时不可用，我们提供了基础版本的内容草稿。`,
      hashtags: [campaignSummary.name, '营销', platform],
      platform,
      tone: 'professional',
      wordCount: 200,
      estimatedReadingTime: '2分钟',
    }));

    const marketingContent: MarketingContent = {
      campaignId: campaignSummary.id,
      campaignName: campaignSummary.name,
      contents,
      overallQualityScore: 60,
      consistencyScore: 80,
      recommendedPostingSchedule: targetPlatforms.map((platform) => ({
        platform,
        bestTimes: this.getBestPostingTimes(platform),
        frequency: this.getRecommendedFrequency(platform),
      })),
      contentStrategySummary: `为"${campaignSummary.name}"活动提供了基础版本的内容方案，涵盖${targetPlatforms.length}个平台。`,
      generatedAt: new Date(),
    };

    return {
      success: true,
      marketingContent,
      processingTime: 0,
      modelUsed: 'fallback',
    };
  }
}
