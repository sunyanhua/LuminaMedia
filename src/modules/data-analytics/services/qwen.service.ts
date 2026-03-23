import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { HttpsProxyAgent } from 'https-proxy-agent';
const HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent;

import {
  AIEngine,
  GeminiConfig,
  GeminiStrategyResponse,
  CampaignSummary,
  GeminiError,
  GeminiGenerateOptions,
} from '../interfaces/gemini.interface';

@Injectable()
export class QwenService implements OnModuleInit {
  private readonly logger = new Logger(QwenService.name);
  private config: GeminiConfig;
  private isAvailable = false;

  // 多API Key支持（与GeminiService保持一致）
  private apiKeys: string[] = [];
  private currentKeyIndex = 0;
  private keyFailures = new Map<string, number>();
  private maxFailuresPerKey = 3;
  private keyRotationMode: 'sequential' | 'random' = 'sequential';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initialize();
  }

  /**
   * 解析逗号分隔的API Key字符串为数组
   */
  private parseApiKeys(apiKeyString: string): string[] {
    if (!apiKeyString || apiKeyString.trim() === '') {
      return [];
    }

    // 按逗号分隔，物理级清洗每个Key
    const rawKeys = apiKeyString;
    const keys = rawKeys.split(',')
      .map(k => {
        // 物理级正则表达式清洗：只保留字母、数字、下划线和破折号
        const cleaned = k.replace(/[^a-zA-Z0-9_-]/g, '');
        this.logger.debug(`正则表达式清洗后Key长度：${cleaned.length}`);
        return cleaned;
      })
      .filter(k => k.length > 10)  // 阿里云API Key长度通常较短
      .filter(k => k.startsWith('sk-'));    // 阿里云DashScope API Key以sk-开头
    return keys;
  }

  /**
   * 获取下一个可用的API Key（顺序轮询）
   */
  private getNextApiKey(): string | null {
    if (this.apiKeys.length === 0) {
      return null;
    }

    let attempts = 0;
    while (attempts < this.apiKeys.length) {
      if (this.keyRotationMode === 'random') {
        this.currentKeyIndex = Math.floor(Math.random() * this.apiKeys.length);
      }

      const key = this.apiKeys[this.currentKeyIndex];
      this.logger.debug(`[Lumina AI Qwen] Using Key: ${key.substring(0, 6)}... (索引: ${this.currentKeyIndex})`);
      const failures = this.keyFailures.get(key) || 0;

      if (failures < this.maxFailuresPerKey) {
        return key;
      }

      // 这个key失败次数太多，尝试下一个
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      attempts++;
    }

    // 所有key都超过了最大失败次数
    return null;
  }

  /**
   * 记录API Key失败
   */
  private recordKeyFailure(key: string): void {
    const currentFailures = this.keyFailures.get(key) || 0;
    this.keyFailures.set(key, currentFailures + 1);
    this.logger.warn(`API Key失败记录: ${key.substring(0, 8)}... (失败次数: ${currentFailures + 1}/${this.maxFailuresPerKey})`);

    // 如果达到最大失败次数，尝试切换到下一个key
    if (currentFailures + 1 >= this.maxFailuresPerKey) {
      this.logger.warn(`API Key ${key.substring(0, 8)}... 已达到最大失败次数，将尝试下一个key`);
      this.rotateToNextKey();
    }
  }

  /**
   * 重置API Key失败计数（成功时调用）
   */
  private resetKeyFailure(key: string): void {
    if (this.keyFailures.has(key)) {
      this.keyFailures.delete(key);
      this.logger.debug(`重置API Key失败计数: ${key.substring(0, 8)}...`);
    }
  }

  /**
   * 轮转到下一个API Key
   */
  private rotateToNextKey(): void {
    if (this.apiKeys.length <= 1) {
      return;
    }

    const oldIndex = this.currentKeyIndex;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;

    this.logger.log(`轮转API Key: 从索引 ${oldIndex} 切换到 ${this.currentKeyIndex}`);
    // Qwen API不需要重新初始化
  }

  /**
   * 使用当前选中的API Key初始化Qwen连接
   */
  private async initializeWithCurrentKey(): Promise<boolean> {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    this.logger.debug(`[Lumina AI Qwen] Initializing with Key: ${currentKey.substring(0, 6)}... (index: ${this.currentKeyIndex})`);
    if (!currentKey) {
      this.isAvailable = false;
      return false;
    }

    try {
      this.config = {
        apiKeys: this.apiKeys,
        model: this.configService.get<string>('QWEN_MODEL', 'qwen-max'),
        temperature: this.configService.get<number>('QWEN_TEMPERATURE', 0.7),
        maxTokens: this.configService.get<number>('QWEN_MAX_TOKENS', 2048),
        topP: this.configService.get<number>('GEMINI_TOP_P', 0.95), // 复用Gemini配置
        topK: this.configService.get<number>('GEMINI_TOP_K', 40),   // 复用Gemini配置
        timeout: 30000, // 30秒超时
      };

      // 测试连接：使用阿里云DashScope OpenAI兼容模式测试API Key有效性
      const apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/models';
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API test failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.data || data.data.length === 0) {
        throw new Error('No models found in API response');
      }

      this.isAvailable = true;
      this.resetKeyFailure(currentKey);

      this.logger.log(`QwenService使用API Key索引 ${this.currentKeyIndex} 初始化成功，模型: ${this.config.model}`);
      this.logger.debug(`当前可用API Key数量: ${this.apiKeys.length}, 当前索引: ${this.currentKeyIndex}`);

      return true;
    } catch (error) {
      this.logger.error(`使用API Key索引 ${this.currentKeyIndex} 初始化失败: ${error.message}`);
      this.recordKeyFailure(currentKey);
      this.isAvailable = false;
      return false;
    }
  }

  private async initialize() {
    // 解析多个API Key
    const apiKeyString = this.configService.get<string>('DASHSCOPE_API_KEY', '');
    this.apiKeys = this.parseApiKeys(apiKeyString);

    if (this.apiKeys.length === 0) {
      this.logger.warn(
        '未配置有效的阿里云DashScope API Key。QwenService将不可用。',
      );
      this.logger.warn(`原始API Key字符串: "${apiKeyString}"`);
      this.isAvailable = false;
      return;
    }

    this.logger.log(`解析到 ${this.apiKeys.length} 个阿里云DashScope API Key`);

    // 设置轮询模式（可以从环境变量读取，默认为顺序轮询）
    const rotationMode = this.configService.get<string>('QWEN_KEY_ROTATION', 'sequential');
    this.keyRotationMode = (rotationMode === 'random' ? 'random' : 'sequential');
    this.logger.log(`API Key轮询模式: ${this.keyRotationMode}`);

    // 初始化失败次数记录
    this.keyFailures.clear();
    this.currentKeyIndex = 0;

    // 尝试用第一个可用的key初始化
    let initialized = false;
    for (let i = 0; i < this.apiKeys.length; i++) {
      this.currentKeyIndex = i;
      const key = this.apiKeys[i];
      this.logger.log(`尝试使用API Key索引 ${i} 初始化...`);

      if (await this.initializeWithCurrentKey()) {
        initialized = true;
        break;
      }
    }

    if (!initialized) {
      this.logger.error('所有API Key初始化都失败。QwenService将不可用。');
      this.isAvailable = false;
    }
  }

  /**
   * 检查 Qwen API 是否可用
   */
  isQwenAvailable(): boolean {
    return this.isAvailable;
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
    if (!useFallback && !this.isQwenAvailable()) {
      return {
        success: false,
        error: {
          code: 'API_KEY_INVALID',
          message: 'Qwen API is not available and fallback is disabled',
        },
      };
    }

    // 构建提示词（复用GeminiService的提示词构建逻辑）
    const prompt = this.buildStrategyPrompt(campaignSummary, strategyType);

    // 使用 OpenAI 兼容模式 REST API 生成内容
    this.logger.log('Generating marketing strategy via Qwen REST API');
    const result = await this.generateContentViaRest(prompt, {
      temperature: this.config?.temperature,
      maxTokens: this.config?.maxTokens,
      model: this.config?.model
    });

    if (result.text) {
      // 解析响应文本（复用GeminiService的解析逻辑）
      const parsedResponse = this.parseQwenResponse(result.text);
      if (parsedResponse.success) {
        // 添加引擎标识
        const dataWithEngine = {
          ...parsedResponse.data,
          engine: AIEngine.QWEN
        };
        return {
          success: true,
          data: dataWithEngine,
        };
      } else {
        this.logger.warn('Failed to parse Qwen API response');
        if (useFallback) {
          return this.generateFallbackStrategy(campaignSummary, strategyType);
        }
        return {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse Qwen response',
            details: result.text.substring(0, 500),
          },
        };
      }
    } else {
      this.logger.warn(`Qwen API generation failed: ${result.error}`);
      if (useFallback) {
        this.logger.warn('Qwen API not available, using fallback template');
        return this.generateFallbackStrategy(campaignSummary, strategyType);
      }
      return {
        success: false,
        error: {
          code: 'API_KEY_INVALID',
          message: `Qwen API generation failed: ${result.error}`,
        },
      };
    }
  }

  /**
   * 构建策略生成提示词（复用GeminiService的构建逻辑）
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
        ? `${new Date(startDate).toISOString().split('T')[0]} 至 ${new Date(endDate).toISOString().split('T')[0]}`
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
   * 解析 Qwen 响应文本为 JSON
   */
  private parseQwenResponse(text: string): {
    success: boolean;
    data?: GeminiStrategyResponse;
    error?: string;
  } {
    try {
      // 尝试提取 JSON 部分（Qwen 有时会在响应中添加额外文本）
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
   * 生成回退策略（当 Qwen API 不可用时使用）
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
    this.logger.log('Generating fallback marketing strategy for Qwen');

    const type = strategyType || '综合营销策略';
    const baseName = campaignSummary.name;

    const fallbackStrategy: GeminiStrategyResponse = {
      campaignName: `${baseName}（Qwen回退方案）`,
      targetAudienceAnalysis: {
        demographics: ['25-35岁', '一线城市', '中高收入群体'],
        interests: ['时尚美妆', '生活方式', '旅游美食'],
        painPoints: ['信息过载', '选择困难', '时间有限'],
        preferredChannels: ['小红书', '微信公众号', '抖音'],
      },
      coreIdea: `这是一份基于 ${type} 的营销策略回退方案。由于 Qwen API 暂时不可用，我们提供了基于最佳实践的基础方案。建议在 API 恢复后重新生成更精准的策略。`,
      xhsContent: {
        title: `${baseName}｜${type}营销方案（Qwen回退）`,
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
        message: 'Using fallback strategy due to Qwen API unavailability',
        fallbackUsed: true,
      },
      fallbackUsed: true,
    };
  }

  /**
   * 使用 OpenAI 兼容模式 REST API 生成内容
   */
  private async generateContentViaRest(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }): Promise<{ text: string; error?: string }> {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    if (!currentKey) {
      return { text: '', error: 'No API key available' };
    }

    const model = options?.model || this.config?.model || 'qwen-max';
    const temperature = options?.temperature || this.config?.temperature || 0.7;
    const maxTokens = options?.maxTokens || this.config?.maxTokens || 2048;

    // 阿里云DashScope OpenAI兼容模式端点
    const url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

    const payload = {
      model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature,
      max_tokens: maxTokens,
      top_p: this.config?.topP || 0.95,
      // top_k: this.config?.topK || 40, // OpenAI API不支持top_k参数
    };

    try {
      this.logger.log(`Generating content via Qwen REST API with model: ${model}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Qwen REST API generation failed: HTTP ${response.status} ${response.statusText}`);
        return { text: '', error: `HTTP ${response.status}: ${errorText.substring(0, 200)}` };
      }

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const text = data.choices[0].message.content;
        return { text };
      } else {
        this.logger.error('Qwen REST API response missing expected content');
        return { text: '', error: 'Invalid response format' };
      }
    } catch (error) {
      this.logger.error(`Qwen REST API generation error: ${error.message}`);
      return { text: '', error: error.message };
    }
  }
}