import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpsProxyAgent } from 'https-proxy-agent';

import {
  AIEngine,
  GeminiConfig,
  GeminiStrategyResponse,
  CampaignSummary,
  // [Hot reload test] Modified at $(date) to verify Docker watch mode - gemini.service.ts
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
  private config: GeminiConfig;
  private isAvailable = false;

  // 多API Key支持
  private apiKeys: string[] = [];
  private currentKeyIndex = 0;
  private keyFailures = new Map<string, number>();
  private maxFailuresPerKey = 3;
  private keyRotationMode: 'sequential' | 'random' = 'sequential';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    console.log('LuminaMedia Proxy active on:', process.env.HTTPS_PROXY);
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
        console.log(`正则表达式清洗后Key长度：${cleaned.length}`);
        return cleaned;
      })
      .filter(k => k.length > 30)  // 长度过滤，确保密钥符合标准
      .filter(k => k.startsWith('AIza'));    // 只保留以 AIza 开头的合法 Key
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
      console.log(`[Lumina AI] Using Key: ${key.substring(0, 6)}... (索引: ${this.currentKeyIndex})`);
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
    this.initializeWithCurrentKey().catch(error => {
      this.logger.error(`轮转后重新初始化失败: ${error.message}`);
    });
  }

  /**
   * 使用当前选中的API Key初始化GoogleGenerativeAI
   */
  private async initializeWithCurrentKey(): Promise<boolean> {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    console.log(`[Lumina AI] Initializing with Key: ${currentKey.substring(0, 6)}... (index: ${this.currentKeyIndex})`);
    if (!currentKey) {
      this.isAvailable = false;
      return false;
    }

    try {
      this.config = {
        apiKeys: this.apiKeys,
        model: 'gemini-2.5-flash', // 固定模型名称
        temperature: this.configService.get<number>('GEMINI_TEMPERATURE', 0.8),
        maxTokens: this.configService.get<number>('GEMINI_MAX_TOKENS', 8192),
        topP: this.configService.get<number>('GEMINI_TOP_P', 0.95),
        topK: this.configService.get<number>('GEMINI_TOP_K', 40),
        timeout: 30000, // 30秒超时
      };

      // 测试连接：使用直接 REST API 调用测试 API Key 有效性
      console.log('>>> [DEPLOY CHECK] API Version: v1 | Model: gemini-2.5-flash');
      const apiUrl = 'https://generativelanguage.googleapis.com/v1/models';
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': currentKey,
        },
      });

      if (!response.ok) {
        throw new Error(`API test failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.models || data.models.length === 0) {
        throw new Error('No models found in API response');
      }

      this.isAvailable = true;
      this.resetKeyFailure(currentKey);

      this.logger.log(`GeminiService使用API Key索引 ${this.currentKeyIndex} 初始化成功，模型: ${this.config.model}`);
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

    // 添加环境变量调试日志
    console.log('>>> [DOCKER ENV DEBUG] Key length:', this.configService.get<string>('GEMINI_API_KEY', '')?.length || 0);
    console.log('>>> [DOCKER ENV DEBUG] Proxy:', process.env.HTTPS_PROXY);
    console.log('>>> [DOCKER ENV DEBUG] HTTP_PROXY:', process.env.HTTP_PROXY);
    console.log('>>> [DOCKER ENV DEBUG] NODE_ENV:', process.env.NODE_ENV);


    // 解析多个API Key
    const apiKeyString = this.configService.get<string>('GEMINI_API_KEY', '');
    this.apiKeys = this.parseApiKeys(apiKeyString);

    if (this.apiKeys.length === 0) {
      this.logger.warn(
        '未配置有效的Gemini API Key。GeminiService将使用回退模式。',
      );
      this.logger.warn(`原始API Key字符串: "${apiKeyString}"`);
      this.isAvailable = false;
      return;
    }

    this.logger.log(`解析到 ${this.apiKeys.length} 个Gemini API Key`);

    // 原生Fetch对比测试（诊断密钥字符串污染问题）
    if (this.apiKeys.length > 0) {
      const testKey = this.apiKeys[0];
      console.log(`>>> [原生Fetch测试] 开始测试Key: ${testKey.substring(0, 8)}...`);
      console.log(`>>> [原生Fetch测试] 测试URL: https://generativelanguage.googleapis.com/v1/models?key=${testKey.substring(0, 8)}...`);

      try {
        const testUrl = `https://generativelanguage.googleapis.com/v1/models?key=${testKey}`;
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`>>> [原生Fetch测试] ✅ 成功！HTTP ${response.status}，返回模型数量: ${data.models?.length || 0}`);
          console.log(`>>> [原生Fetch测试] 诊断结论: 原生Fetch成功 → 如果SDK失败则为SDK配置问题`);
        } else {
          const errorText = await response.text();
          console.log(`>>> [原生Fetch测试] ❌ 失败！HTTP ${response.status} ${response.statusText}`);
          console.log(`>>> [原生Fetch测试] 错误响应: ${errorText.substring(0, 200)}`);
          console.log(`>>> [原生Fetch测试] 诊断结论: 原生Fetch也失败 → 密钥字符串或代理篡改问题`);
        }
      } catch (error) {
        console.log(`>>> [原生Fetch测试] ❌ 异常！${error.message}`);
        console.log(`>>> [原生Fetch测试] 诊断结论: 网络连接或代理配置问题`);
      }
    } else {
      console.log(`>>> [原生Fetch测试] 跳过：无可用API Key进行测试`);
    }

    // 设置轮询模式（可以从环境变量读取，默认为顺序轮询）
    const rotationMode = this.configService.get<string>('GEMINI_KEY_ROTATION', 'sequential');
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
      this.logger.error('所有API Key初始化都失败。GeminiService将使用回退模式。');
      this.isAvailable = false;
    }
  }

  /**
   * 检查 Gemini API 是否可用
   */
  isGeminiAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * 检查 Gemini API 健康状态
   */
  async checkGeminiHealth(retryCount = 0): Promise<{
    available: boolean;
    error?: string;
    details?: any;
    apiKeys?: {
      total: number;
      available: number;
      currentIndex: number;
      failures: Record<string, number>;
    };
  }> {
    // 添加：如果当前不可用，尝试重新初始化
    if (!this.isAvailable && retryCount === 0) {
      this.logger.warn('GeminiService is not available, attempting re-initialization...');
      try {
        await this.initialize();
        // 重新初始化后，如果变为可用，直接返回成功
        if (this.isAvailable) {
          this.logger.log('GeminiService re-initialized successfully');
          return {
            available: true,
            details: {
              reinitialized: true,
              apiKeys: {
                total: this.apiKeys.length,
                available: this.apiKeys.filter(key => {
                  const failures = this.keyFailures.get(key) || 0;
                  return failures < this.maxFailuresPerKey;
                }).length,
                currentIndex: this.currentKeyIndex,
                failures: Object.fromEntries(this.keyFailures)
              }
            }
          };
        }
      } catch (reinitError) {
        this.logger.error(`Re-initialization failed: ${reinitError.message}`);
      }
    }

    // 防止无限递归重试
    if (retryCount >= this.apiKeys.length) {
      return {
        available: false,
        error: `健康检查重试次数超过限制 (${this.apiKeys.length})，所有Key可能都无效`,
        details: {
          total: this.apiKeys.length,
          available: 0,
          currentIndex: this.currentKeyIndex,
          failures: Object.fromEntries(this.keyFailures)
        }
      };
    }

    // 使用直接 REST API 调用测试 API Key 有效性（避免 SDK 代理问题）
    const currentKey = this.apiKeys[this.currentKeyIndex];
    if (!currentKey) {
      return {
        available: false,
        error: 'No API key available',
        details: {
          apiKeys: {
            total: this.apiKeys.length,
            available: 0,
            currentIndex: this.currentKeyIndex,
            failures: Object.fromEntries(this.keyFailures)
          }
        }
      };
    }

    try {
      this.logger.log(`Testing Gemini API with direct REST call using key index: ${this.currentKeyIndex}`);
      console.log(`[Lumina AI] Health check using Key: ${currentKey.substring(0, 6)}... (index: ${this.currentKeyIndex})`);

      // 直接调用 Gemini REST API 模型列表端点（与 list-models.js 相同）
      const apiUrl = 'https://generativelanguage.googleapis.com/v1/models';
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': currentKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API health check failed: HTTP ${response.status} ${response.statusText}`);

        // 记录当前key的失败
        this.recordKeyFailure(currentKey);

        // 检查是否为API Key无效错误
        const isInvalidKeyError = response.status === 400 || response.status === 403 ||
                                 errorText.includes('API_KEY_INVALID') || errorText.includes('API key not valid');

        if (isInvalidKeyError) {
          console.log(`[Lumina AI] Key ${currentKey.substring(0, 6)}... invalid, trying next Key`);
          // 尝试切换到下一个key
          this.rotateToNextKey();
          // 递归调用健康检查（但限制深度避免无限循环）
          return this.checkGeminiHealth(retryCount + 1);
        } else {
          // 非Key无效错误，只轮转不重试
          this.rotateToNextKey();
        }

        const apiKeyDetails = {
          total: this.apiKeys.length,
          available: this.apiKeys.filter(key => {
            const failures = this.keyFailures.get(key) || 0;
            return failures < this.maxFailuresPerKey;
          }).length,
          currentIndex: this.currentKeyIndex,
          failures: Object.fromEntries(this.keyFailures)
        };

        return {
          available: false,
          error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
          details: {
            code: response.status,
            status: response.statusText,
            apiKeys: apiKeyDetails
          }
        };
      }

      const data = await response.json();

      if (!data || !data.models || data.models.length === 0) {
        this.logger.error('Gemini API health check: No models found in response');
        this.recordKeyFailure(currentKey);
        this.rotateToNextKey();

        const apiKeyDetails = {
          total: this.apiKeys.length,
          available: this.apiKeys.filter(key => {
            const failures = this.keyFailures.get(key) || 0;
            return failures < this.maxFailuresPerKey;
          }).length,
          currentIndex: this.currentKeyIndex,
          failures: Object.fromEntries(this.keyFailures)
        };

        return {
          available: false,
          error: 'No models found in API response',
          details: { apiKeys: apiKeyDetails }
        };
      }

      // 检查当前配置模型是否存在
      const configuredModel = this.config?.model || 'gemini-2.5-flash';
      const modelExists = data.models.some((m: any) => m.name === `models/${configuredModel}` || m.name?.includes(configuredModel));

      if (!modelExists) {
        this.logger.warn(`Configured model ${configuredModel} not found in available models`);
      }

      // 计算可用的API Key数量（失败次数小于最大限制的）
      const availableKeys = this.apiKeys.filter(key => {
        const failures = this.keyFailures.get(key) || 0;
        return failures < this.maxFailuresPerKey;
      }).length;

      // 重置当前key的失败计数（因为测试成功）
      this.resetKeyFailure(currentKey);

      const apiKeyDetails = {
        total: this.apiKeys.length,
        available: availableKeys,
        currentIndex: this.currentKeyIndex,
        failures: Object.fromEntries(this.keyFailures)
      };

      return {
        available: true,
        details: {
          apiKeys: apiKeyDetails,
          modelsCount: data.models.length,
          configuredModel,
          modelExists
        }
      };
    } catch (error) {
      this.logger.error(`Gemini API health check failed with error: ${error.message}`);

      // 记录当前key的失败
      this.recordKeyFailure(currentKey);

      // 尝试切换到下一个key
      this.rotateToNextKey();

      const apiKeyDetails = {
        total: this.apiKeys.length,
        available: this.apiKeys.filter(key => {
          const failures = this.keyFailures.get(key) || 0;
          return failures < this.maxFailuresPerKey;
        }).length,
        currentIndex: this.currentKeyIndex,
        failures: Object.fromEntries(this.keyFailures)
      };

      return {
        available: false,
        error: error.message,
        details: {
          code: error.code,
          status: error.status,
          apiKeys: apiKeyDetails
        }
      };
    }
  }

  /**
   * 生成营销策略方案
   */
  async generateMarketingStrategy(options: GeminiGenerateOptions): Promise<{
    success: boolean;
    data?: GeminiStrategyResponse;
    error?: GeminiError;
    fallbackUsed?: boolean;
    isTruncated?: boolean;
  }> {
    const {
      campaignSummary,
      strategyType,
      useFallback = true,
      timeout = 30000,
    } = options;

    // 检查 API 可用性
    if (!useFallback && !this.isGeminiAvailable()) {
      return {
        success: false,
        error: {
          code: 'API_KEY_INVALID',
          message: 'Gemini API is not available and fallback is disabled',
        },
      };
    }

    // 构建提示词
    const prompt = this.buildStrategyPrompt(campaignSummary, strategyType);

    // 使用 REST API 生成内容
    this.logger.log('Generating marketing strategy via REST API');
    const result = await this.generateContentViaRest(prompt, {
      temperature: this.config?.temperature,
      maxTokens: this.config?.maxTokens,
      model: this.config?.model
    });

    if (result.text) {
      // 解析响应文本
      const parsedResponse = this.parseGeminiResponse(result.text);
      if (parsedResponse.success) {
        // 添加引擎标识
        const dataWithEngine = {
          ...parsedResponse.data,
          engine: AIEngine.GEMINI
        };
        return {
          success: true,
          data: dataWithEngine,
          isTruncated: result.isTruncated,
        };
      } else {
        this.logger.warn('Failed to parse REST API response, trying fallback');
        if (useFallback) {
          return this.generateFallbackStrategy(campaignSummary, strategyType);
        }
        return {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse Gemini response',
            details: result.text.substring(0, 500),
          },
        };
      }
    } else {
      this.logger.warn(`REST API generation failed: ${result.error}`);
      if (useFallback) {
        this.logger.warn('Gemini API not available, using fallback template');
        return this.generateFallbackStrategy(campaignSummary, strategyType);
      }
      return {
        success: false,
        error: {
          code: 'API_KEY_INVALID',
          message: `Gemini API generation failed: ${result.error}`,
        },
      };
    }
  }

  /**
   * 构建策略生成提示词（曜金级版本，千人千面深度全案）
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

    // 精简insights文本，减少冗余描述
    const insightsText = insights
      ? `活动洞察：策略${insights.totalStrategies}个，平均置信度${Number(insights.averageConfidenceScore || 0).toFixed(1)}，ROI预估${Number(insights.estimatedTotalROI || 0).toFixed(2)}%，完成率${insights.completionRate}%`
      : '暂无活动洞察数据';

    const strategyTypeText = strategyType
      ? `策略类型：${strategyType}`
      : '综合营销策略';

    return `角色定位：你现在是 LuminaMedia (灵曜智媒) 的首席营销战略官。你的职责是根据脱敏的用户画像数据，为拥有 600 万会员的大型商业综合体（或政府宣传部门）策划具备极高转化力的营销全案。

活动信息：
- 活动名称：${name}
- 活动类型：${campaignType}
- 目标受众：${JSON.stringify(targetAudience)}
- 总预算：${budget}元
- 活动时间：${dateRange}
- ${strategyTypeText}
- ${insightsText}

**强制性要求与内容厚度：**

1. **活动名称（必须包含吸引人的"钩子"）：**
   - 示例："灵曜之夜：寻找 600 万分之一的你"、"数智派对：解码 Z 世代消费基因"
   - 必须包含创意，避免普通命名

2. **目标人群分析（禁止泛泛描述）：**
   - 必须结合四大属性进行深度刻画：Z世代（社交活跃、颜值经济）、新手爸妈（育儿焦虑、品质追求）、消费性格（冲动型、理性型、体验型）
   - 提供具体的用户画像，包含人口统计、行为特征、心理需求

3. **小红书文案（300-500字强制要求）：**
   - 爆款标题：必须包含 Emoji，吸引眼球
   - 痛点描述：直击目标人群的痛点与焦虑
   - 活动亮点清单：至少 5 个核心亮点，用 Emoji 标记
   - 互动钩子：设计具体的用户互动机制（如抽奖、话题、打卡）
   - 标签体系：至少 10 个精准标签，覆盖品类、场景、人群、热点

4. **微信全案（深度方案，强制要求）：**
   - 推文大纲：3-5篇系列推文的主题与核心卖点，每篇都要有详细的内容规划
   - 线下美陈建议：实体场景的布置思路、互动装置设计，具体到布置区域和视觉元素
   - 会员权益设计：专属福利、等级体系、留存机制，包含具体的权益内容和激励措施
   - **⚠️ 严重警告**：wechatFullPlan 是 JSON 输出中的必填字段，必须完整填写所有子字段。如果缺少此字段，整个方案将被视为不合格。

5. **执行步骤（Step-by-step）：**
   - 详细的阶段划分：筹备期、预热期、引爆期、留存期
   - 每个阶段的具体任务、责任人、时间节点
   - 关键里程碑与交付物

6. **风险预警（具体化预案）：**
   - 天气风险：极端天气下的备选方案
   - 客流拥堵预案：人流量过大的疏导措施
   - 舆情风险：负面评价的应对策略
   - 执行风险：供应商、资源、人员的备用方案

7. **预算分配明细（精确到元）：**
   - 分项预算：内容制作、渠道推广、KOL合作、线下物料、技术开发、应急备用
   - 每项预算的详细说明与合理性论证
   - 预留 10-15% 的应急预算

**专业词汇与质感提升：**
- 在方案中自然融入以下专业词汇：**"数智赋能"、"私域留存"、"精准画像"、"转化闭环"、"场景重构"、"心智占领"**
- 体现数据驱动、技术赋能、用户为中心的现代营销理念

**⚠️ 微信全案强制生成要求：**
- **wechatFullPlan 字段是强制性的，必须生成**：缺少此字段将导致整个方案无效
- **必须包含所有子字段**：articleSeries（至少3篇文章）、offlineDecoration、membershipBenefits
- **内容必须具体可执行**：不要使用模板化或通用的描述，要提供针对本次活动定制的具体方案
- **检查清单**：确保在生成JSON后检查是否包含完整的wechatFullPlan字段

**输出 JSON 结构：**
**注意：以下所有字段都是必填的，特别是 wechatFullPlan 必须完整生成**
{
  "campaignName": "创意活动名称（含钩子）",
  "targetAudienceAnalysis": {
    "demographics": ["具体人群描述"],
    "interests": ["兴趣标签"],
    "painPoints": ["核心痛点"],
    "preferredChannels": ["偏好渠道"],
    "userPersonas": [
      {
        "name": "用户画像名称",
        "description": "详细描述",
        "behaviorTraits": ["行为特征"],
        "motivations": ["动机与需求"]
      }
    ]
  },
  "coreIdea": "核心创意理念（200-300字，体现数智赋能与创新思维）",
  "xhsContent": {
    "title": "爆款标题（含 Emoji）",
    "content": "300-500字完整文案，包含痛点描述、亮点清单、互动钩子",
    "hashtags": ["至少10个精准标签"],
    "suggestedImages": ["建议的图片类型与风格"]
  },
  "wechatFullPlan": { // ⚠️ 强制性字段：必须包含完整的微信全案方案
    "articleSeries": [ // 必须至少包含3篇文章，每篇都要有具体内容
      {
        "title": "推文标题（吸引人的标题）",
        "theme": "具体主题（如：新品首发、会员专享、限时优惠）",
        "keyPoints": ["核心卖点1", "核心卖点2", "核心卖点3"]
      },
      {
        "title": "第二篇推文标题",
        "theme": "具体主题",
        "keyPoints": ["核心卖点1", "核心卖点2"]
      },
      {
        "title": "第三篇推文标题",
        "theme": "具体主题",
        "keyPoints": ["核心卖点1", "核心卖点2"]
      }
    ],
    "offlineDecoration": "线下美陈建议（具体布置思路，如：入口处主题装置、互动拍照墙、产品展示区布置等）",
    "membershipBenefits": "会员权益设计（专属福利与留存机制，如：新会员专享礼、积分兑换、等级特权等）"
  },
  "recommendedExecutionTime": {
    "timeline": [
      {
        "phase": "阶段名称",
        "duration": "持续时间",
        "activities": ["具体活动"],
        "milestones": ["关键里程碑"]
      }
    ],
    "bestPostingTimes": ["最佳发布时间"],
    "seasonalConsiderations": ["季节性调整建议"]
  },
  "expectedPerformanceMetrics": {
    "engagementRate": 预期互动率,
    "conversionRate": 预期转化率,
    "expectedReach": 预期触达人数,
    "estimatedROI": 预期ROI百分比
  },
  "executionSteps": [
    {
      "step": 步骤序号,
      "description": "详细步骤描述",
      "responsible": "责任部门/人",
      "deadline": "截止时间",
      "deliverables": ["交付物"]
    }
  ],
  "riskAssessment": [
    {
      "risk": "具体风险描述",
      "probability": "发生概率（高/中/低）",
      "impact": "影响程度（高/中/低）",
      "mitigationStrategy": "应对策略",
      "contingencyPlan": "应急预案"
    }
  ],
  "budgetAllocation": [
    {
      "category": "预算类别",
      "amount": 具体金额（精确到元）,
      "percentage": 占比百分比,
      "justification": "合理性说明",
      "costBreakdown": ["费用明细"]
    }
  ]
}

**重要提示：**
1. 方案必须体现"千人千面"的深度定制化思维，拒绝模板化
2. 所有内容要求具体、可执行、可衡量
3. 专业性与创意性并重，体现"曜金级"商业价值
4. 总字数控制在2000-2500字，确保方案深度与完整性
5. **⚠️ wechatFullPlan字段必须生成**：这是核心输出字段，必须包含完整的articleSeries（至少3篇文章）、offlineDecoration和membershipBenefits子字段。这是强制要求，如果不包含此字段，方案将被拒绝。
6. **生成后检查**：在输出JSON前，请检查是否包含wechatFullPlan字段及其所有子字段
7. 只返回JSON，不包含任何解释性文字`;
  }

  /**
   * 清理JSON响应文本，移除Markdown代码块标签
   */
  private cleanJsonResponse(raw: string): string {
    // 移除 ```json 和 ``` 标签，并去除首尾空格
    return raw.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  /**
   * 物理级JSON修复函数 - 处理截断的JSON响应
   */
  private repairTruncatedJson(str: string): any {
    let jsonStr = str.trim();
    // 移除 markdown 标签
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

    // 如果没有以 } 结尾，暴力尝试补齐
    if (!jsonStr.endsWith('}')) {
      console.warn('>>> [LUMINA REPAIR] 方案被截断，正在执行物理缝合...');
      // 简单的递归补括号法，直到 JSON.parse 成功或尝试次数耗尽
      const suffixes = ['"', '"}', '"}}', '"}]}', ']}', '}'];
      for (const suffix of suffixes) {
        try {
          const testStr = jsonStr + suffix;
          return JSON.parse(testStr);
        } catch (e) {}
      }
    }
    return JSON.parse(jsonStr);
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
      // 1. 提取文字（text已经是提取出来的文本）
      let rawText = text;

      // 2. 暴力清洗 Markdown 标签
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      // 3. 使用物理级JSON修复函数
      const parsed = this.repairTruncatedJson(rawText);

      // 验证必需字段（曜金级版本增强）
      const requiredFields = [
        'campaignName',
        'targetAudienceAnalysis',
        'coreIdea',
        'xhsContent',
        'wechatFullPlan', // 指令强制要求微信全案
        'recommendedExecutionTime',
        'expectedPerformanceMetrics',
        'executionSteps',
        'riskAssessment',
        'budgetAllocation',
      ];

      for (const field of requiredFields) {
        if (!parsed[field]) {
          console.error(`🚨 缺失必需字段: ${field}`);
          console.error(`🚨 解析后的对象字段: ${Object.keys(parsed).join(', ')}`);
          console.error(`🚨 原始响应前500字符: ${text.substring(0, 500)}`);
          if (field === 'wechatFullPlan') {
            console.error(`🚨 严重: wechatFullPlan字段缺失! AI未遵循指令生成微信全案方案`);
            console.error(`🚨 检查提示词中的强制要求是否足够明确`);
          }
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // 特别检查wechatFullPlan的子字段
      if (parsed.wechatFullPlan) {
        const wechatFields = ['articleSeries', 'offlineDecoration', 'membershipBenefits'];
        for (const field of wechatFields) {
          if (!parsed.wechatFullPlan[field]) {
            console.warn(`⚠️ wechatFullPlan缺少子字段: ${field}`);
          }
        }

        // 检查articleSeries是否包含足够的内容
        if (parsed.wechatFullPlan.articleSeries && Array.isArray(parsed.wechatFullPlan.articleSeries)) {
          if (parsed.wechatFullPlan.articleSeries.length < 2) {
            console.warn(`⚠️ wechatFullPlan.articleSeries只有${parsed.wechatFullPlan.articleSeries.length}篇文章，建议至少3篇`);
          }
        }
      }

      return {
        success: true,
        data: parsed as GeminiStrategyResponse,
      };
    } catch (error) {
      this.logger.error(`Failed to parse response: ${error.message}`);
      this.logger.debug(`Raw response (full): ${text}`);
      this.logger.debug(`Response length: ${text.length} chars`);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 尝试修复不完整的JSON字符串
   */
  private tryRepairJson(jsonText: string): string | null {
    if (!jsonText || jsonText.trim() === '') {
      return null;
    }

    const trimmed = jsonText.trim();

    // 检查是否以{开头
    if (!trimmed.startsWith('{')) {
      return null;
    }

    // 检查括号平衡
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === '"' && !escaped) {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
      }
    }

    // 如果括号不平衡，尝试修复
    if (openBraces > 0 || openBrackets > 0) {
      this.logger.debug(`尝试修复JSON: 缺少${openBraces}个}和${openBrackets}个]`);

      let repaired = trimmed;
      // 添加缺失的闭合括号
      for (let i = 0; i < openBraces; i++) {
        repaired += '}';
      }
      for (let i = 0; i < openBrackets; i++) {
        repaired += ']';
      }

      // 尝试验证修复后的JSON
      try {
        JSON.parse(repaired);
        this.logger.warn(`JSON修复成功: 添加了${openBraces}个}和${openBrackets}个]`);
        return repaired;
      } catch (repairError) {
        this.logger.debug(`JSON修复失败: ${repairError.message}`);
        return null;
      }
    }

    return null;
  }

  /**
   * 工业级JSON自动修复函数 - 确保截断的JSON能被正确解析
   * 逻辑：先移除开头的```json和结尾的```，检查括号平衡，自动补齐缺失的闭合符号
   * 高级策略：如果截断在suggestedImages数组内，补齐顺序为："]}}"
   */
  private ensureJsonClosed(raw: string): string {
    if (!raw || raw.trim() === '') {
      return raw;
    }

    let text = raw.trim();

    // 1. 移除开头的```json和结尾的```
    text = text.replace(/^```json\s*/i, '').replace(/```$/g, '').trim();

    // 2. 检查是否需要修复
    if (!text.startsWith('{')) {
      // 尝试找到第一个{
      const firstBraceIndex = text.indexOf('{');
      if (firstBraceIndex !== -1) {
        text = text.substring(firstBraceIndex);
      } else {
        // 没有找到{，直接返回原始文本
        return raw;
      }
    }

    // 3. 检查括号平衡（基础检查）
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === '"' && !escaped) {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
      }
    }

    // 4. 高级修复策略：如果最后包含suggestedImages关键字且括号不平衡
    const hasSuggestedImages = text.includes('"suggestedImages"') || text.toLowerCase().includes('suggestedimages');

    // 5. 自动补齐缺失的闭合符号
    let repaired = text;
    if (openBraces > 0 || openBrackets > 0) {
      // 先添加缺失的]
      for (let i = 0; i < openBrackets; i++) {
        repaired += ']';
      }
      // 再添加缺失的}
      for (let i = 0; i < openBraces; i++) {
        repaired += '}';
      }

      // 记录修复日志
      console.log(`>>> [LUMINA REPAIR] Truncated JSON detected and auto-closed. Demo proceeding...`);
    }

    // 6. 简单检查：如果最后不是}，补齐一个}
    if (repaired.length > 0 && !repaired.endsWith('}')) {
      repaired += '}';
      console.log(`>>> [LUMINA REPAIR] Truncated JSON detected and auto-closed. Demo proceeding...`);
    }

    return repaired;
  }

  /**
   * JSON结构自愈函数 - 强力修复截断的JSON响应
   * 逻辑：先暴力清除所有Markdown标识，然后尝试修复不完整的JSON结构
   */
  private repairJsonString(str: string): string {
    // 1. 强力标签清洗：不管responseMimeType是否生效，先清除所有Markdown标识
    let repaired = str.trim();
    repaired = repaired.replace(/```json/g, '').replace(/```/g, '').trim();

    // 2. JSON结构自愈逻辑
    // 检查是否需要修复
    if (!repaired.endsWith('}')) {
      // 检查缺少的引号：如果末尾是属性名，补充 ": ""}
      if (repaired.includes('"xhsContent"')) {
        // 如果断在小红书文案里，尝试关闭字段和根对象
        repaired += '"}}';
      } else {
        // 通用修复：补充闭合括号
        repaired += '"}';
      }
    }

    // 3. 确保JSON以{开头，以}结尾
    if (!repaired.startsWith('{') && repaired.includes('{')) {
      const firstBraceIndex = repaired.indexOf('{');
      repaired = repaired.substring(firstBraceIndex);
    }

    if (!repaired.endsWith('}')) {
      repaired += '}';
    }

    // 4. 尝试解析验证（最多尝试5次）
    for (let i = 0; i < 5; i++) {
      try {
        JSON.parse(repaired);
        // 如果解析成功，记录修复日志
        if (i > 0) {
          console.log(`>>> [LUMINA REPAIR_JSON] JSON successfully repaired after ${i + 1} attempts`);
        }
        return repaired;
      } catch (error) {
        // 解析失败，尝试添加缺失的闭合括号
        if (!repaired.endsWith('}')) {
          repaired += '}';
        } else if (!repaired.endsWith(']}')) {
          repaired += ']}';
        } else {
          // 无法修复，返回原始修复后的字符串
          console.log(`>>> [LUMINA REPAIR_JSON] Failed to repair JSON after ${i + 1} attempts`);
          return repaired;
        }
      }
    }

    return repaired;
  }

  /**
   * "救命级"JSON 修复函数 - 为了应对万一发生的截断
   * 在 JSON.parse 报错时调用
   */
  private emergencyJsonRepair(str: string): string {
    let repaired = str.trim();
    // 移除可能存在的 Markdown 标签
    repaired = repaired.replace(/```json/g, '').replace(/```/g, '').trim();

    // 暴力补全：如果没以 } 结尾，根据内容深度强制补齐
    if (!repaired.endsWith('}')) {
      console.warn('>>> [LUMINA_REPAIR] Truncated JSON detected, performing emergency repair...');
      if (repaired.includes('"xhsContent"')) {
        repaired += '"}}'; // 假设断在小红书文案字符串中
      } else {
        repaired += '}';
      }
    }
    return repaired;
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
    isTruncated?: boolean;
  } {
    this.logger.log('Generating fallback marketing strategy for Gemini');

    const type = strategyType || '综合营销策略';
    const baseName = campaignSummary.name;

    const fallbackStrategy: GeminiStrategyResponse = {
      campaignName: `${baseName}（Gemini回退方案）`,
      targetAudienceAnalysis: {
        demographics: ['25-35岁', '一线城市', '中高收入群体'],
        interests: ['时尚美妆', '生活方式', '旅游美食'],
        painPoints: ['信息过载', '选择困难', '时间有限'],
        preferredChannels: ['小红书', '微信公众号', '抖音'],
        userPersonas: [
          {
            name: '时尚小白领莉莉',
            description: '25-30岁，一线城市白领，注重生活品质，喜欢在社交平台分享生活方式',
            behaviorTraits: ['高频使用小红书', '关注美妆穿搭', '喜欢参与线上活动'],
            motivations: ['寻求认同感', '追求生活品质', '社交展示']
          },
          {
            name: '新手妈妈小雅',
            description: '28-35岁，注重育儿品质，关注健康安全，消费决策理性',
            behaviorTraits: ['关注母婴内容', '信任专家推荐', '重视产品安全性'],
            motivations: ['宝宝健康', '育儿便利', '家庭幸福感']
          }
        ]
      },
      coreIdea: `这是一份基于 ${type} 的营销策略回退方案。由于 Gemini API 暂时不可用，我们提供了基于最佳实践的基础方案。建议在 API 恢复后重新生成更精准的策略。`,
      xhsContent: {
        title: `${baseName}｜${type}营销方案（Gemini回退）`,
        content: `大家好！今天分享我们的${baseName}营销方案✨\n\n🔹 核心目标：提升品牌曝光和用户互动\n🔹 目标人群：${campaignSummary.targetAudience?.description || '25-35岁时尚人群'}\n🔹 预算：${campaignSummary.budget}元\n\n💡 核心创意：\n通过内容营销和社区互动，打造品牌影响力。\n\n📅 执行计划：\n1. 第一阶段：内容预热\n2. 第二阶段：活动引爆\n3. 第三阶段：持续运营\n\n#${baseName.replace(/\s+/g, '')} #营销方案 #小红书运营 #品牌推广`,
        hashtags: ['营销方案', '小红书运营', '品牌推广', '内容营销'],
        suggestedImages: ['产品展示', '场景图', '用户证言', '数据图表'],
      },
      wechatFullPlan: {
        articleSeries: [
          {
            title: '【首发】探索新体验：XXXX的全新升级',
            theme: '品牌升级与创新',
            keyPoints: ['品牌故事', '产品特色', '用户体验']
          },
          {
            title: '【深度】行业洞察：XXXX如何引领潮流',
            theme: '行业分析与趋势',
            keyPoints: ['市场分析', '趋势预测', '竞争优势']
          },
          {
            title: '【互动】邀请您参与：XXXX共创计划',
            theme: '用户参与与共创',
            keyPoints: ['互动机制', '用户反馈', '共创成果']
          }
        ],
        offlineDecoration: '主题展区设计，结合品牌色系与互动装置，打造沉浸式体验空间',
        membershipBenefits: '三级会员体系：基础会员（注册即享）、银卡会员（消费累计）、金卡会员（年度活跃），对应不同权益与专属服务'
      },
      recommendedExecutionTime: {
        timeline: [
          {
            phase: '准备期',
            duration: '2周',
            activities: ['内容规划', '资源准备', '团队培训'],
            milestones: ['方案定稿', '资源到位', '团队培训完成']
          },
          {
            phase: '执行期',
            duration: '4周',
            activities: ['内容发布', '活动运营', '数据监测'],
            milestones: ['首波内容发布', '活动引爆', '数据达标']
          },
          {
            phase: '优化期',
            duration: '2周',
            activities: ['效果评估', '策略调整', '总结报告'],
            milestones: ['效果报告完成', '策略优化方案', '项目总结']
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
          deliverables: ['竞品分析报告', '目标用户画像']
        },
        {
          step: 2,
          description: '内容创意与脚本撰写',
          responsible: '内容团队',
          deadline: '第2周',
          deliverables: ['内容日历', '创意脚本', '视觉概念']
        },
        {
          step: 3,
          description: '素材制作与审核',
          responsible: '设计部',
          deadline: '第3周',
          deliverables: ['设计素材', '视频成品', '审核报告']
        },
        {
          step: 4,
          description: '渠道发布与推广',
          responsible: '运营部',
          deadline: '第4周',
          deliverables: ['渠道发布记录', '推广数据', '用户反馈']
        },
        {
          step: 5,
          description: '数据监测与优化',
          responsible: '数据分析',
          deadline: '持续',
          deliverables: ['数据日报', '优化建议', '结案报告']
        },
      ],
      riskAssessment: [
        {
          risk: '平台算法变化',
          probability: '中',
          impact: '高',
          mitigationStrategy: '多平台分发，降低单一平台依赖',
          contingencyPlan: '准备备用渠道，调整内容策略'
        },
        {
          risk: '预算超支',
          probability: '低',
          impact: '中',
          mitigationStrategy: '分阶段拨款，定期审计',
          contingencyPlan: '预留10%应急预算，优化资源分配'
        },
        {
          risk: '内容效果不佳',
          probability: '中',
          impact: '中',
          mitigationStrategy: 'A/B测试，快速迭代',
          contingencyPlan: '准备备选内容方案，调整发布时间'
        },
      ],
      budgetAllocation: [
        {
          category: '内容制作',
          amount: campaignSummary.budget * 0.4,
          percentage: 40,
          justification: '高质量内容是营销成功的基础',
          costBreakdown: ['文案撰写', '设计制作', '视频拍摄']
        },
        {
          category: '渠道推广',
          amount: campaignSummary.budget * 0.3,
          percentage: 30,
          justification: '包括小红书推广、微信广告等',
          costBreakdown: ['平台广告', 'KOL合作', '流量投放']
        },
        {
          category: '数据分析',
          amount: campaignSummary.budget * 0.15,
          percentage: 15,
          justification: '效果监测与优化调整',
          costBreakdown: ['监测工具', '分析服务', '报告制作']
        },
        {
          category: '应急备用',
          amount: campaignSummary.budget * 0.15,
          percentage: 15,
          justification: '应对突发情况和机会',
          costBreakdown: ['应急预算', '灵活调配', '机会捕捉']
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
      isTruncated: false,
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
    console.log(`>>> [generateContent] isGeminiAvailable: ${this.isGeminiAvailable()}`);
    if (!this.isGeminiAvailable()) {
      this.logger.warn(
        'Gemini API not available, trying REST API for content generation',
      );
      // 优先尝试直接REST API（绕过SDK问题）
      const result = await this.generateContentViaRest(prompt, {
        temperature: options.temperature || this.config?.temperature,
        maxTokens: options.maxTokens || this.config?.maxTokens,
        model: this.config?.model
      });

      console.log(`>>> [generateContent REST] Result: text=${result.text ? 'present' : 'empty'}, error=${result.error || 'none'}`);
      if (result.text) {
        // 解析响应文本
        const generatedContent = this.parseContentResponse(result.text, platform, options);
        const qualityAssessment = this.assessContentQuality(generatedContent, platform);

        return {
          success: true,
          content: generatedContent,
          qualityAssessment,
          processingTime: 0,
          modelUsed: this.config?.model || 'gemini-2.5-flash',
        };
      } else {
        this.logger.warn(`REST API generation failed: ${result.error}, using fallback content`);
        return this.generateFallbackContent(options);
      }
    }

    // 构建内容生成提示词
    const contentPrompt = this.buildContentPrompt(
      prompt,
      platform,
      tone,
      wordCount,
    );

    // 使用 REST API 生成内容
    this.logger.log(`Generating content for platform ${platform} via REST API`);
    const result = await this.generateContentViaRest(contentPrompt, {
      temperature: options.temperature || this.config?.temperature,
      maxTokens: options.maxTokens || this.config?.maxTokens,
      model: this.config?.model
    });

    if (result.text) {
      // 解析响应文本
      const generatedContent = this.parseContentResponse(result.text, platform, options);
      const qualityAssessment = this.assessContentQuality(generatedContent, platform);

      return {
        success: true,
        content: generatedContent,
        qualityAssessment,
        processingTime: 0,
        modelUsed: this.config?.model || 'gemini-2.5-flash',
      };
    } else {
      // 检查是否是API Key配额或无效错误
      if (result.error?.includes('API_KEY_INVALID') || result.error?.includes('QUOTA_EXCEEDED')) {
        const currentKey = this.apiKeys[this.currentKeyIndex];
        if (currentKey) {
          this.recordKeyFailure(currentKey);
          this.rotateToNextKey();
        }
      }
      this.logger.warn(`REST API generation failed: ${result.error}, using fallback content`);
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
            this.logger.log(`Successfully generated content for ${platform}, modelUsed: ${result.modelUsed}`);
            contents.push(result.content);
          } else {
            this.logger.error(`Failed to generate content for ${platform}: ${result.error?.message || 'Unknown error'}`);
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

      // 检查是否是API Key配额或无效错误
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('QUOTA_EXCEEDED')) {
        const currentKey = this.apiKeys[this.currentKeyIndex];
        if (currentKey) {
          this.recordKeyFailure(currentKey);
          this.rotateToNextKey();
        }
      }

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
6. estimatedReadingTime：预计阅读时间

请确保内容符合平台特点，风格一致，并且具有吸引力。
输出要求：仅返回JSON对象，不要包含任何额外文本或Markdown代码块。确保JSON结构完整闭合。`;
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

请生成包含以下内容的 JSON 格式输出：
1. title：吸引人的标题
2. content：完整的内容正文
3. hashtags：相关的话题标签数组
4. suggestedImages：建议的图片描述数组（可选）
5. wordCount：字数统计
6. estimatedReadingTime：预计阅读时间

输出要求：仅返回JSON对象，不要包含任何额外文本或Markdown代码块。确保JSON结构完整闭合。`;
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
      // 1. 提取文字
      let rawText = text;

      // 2. 暴力清洗 Markdown 标签
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      // 3. 使用物理级JSON修复函数
      const parsed = this.repairTruncatedJson(rawText);

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
      this.logger.debug(`Raw response (full): ${text}`);
      this.logger.debug(`Response length: ${text.length} chars`);

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
      case Platform.DOUYIN:
        // 抖音：简洁、热门话题、互动引导
        const hasHotTopic = /#(挑战|热门|话题)/.test(content.content);
        const isConcise = (content.wordCount || 0) < 200; // 短视频文案应简短
        const hasInteractionCall = /(关注|点赞|评论|分享)/.test(
          content.content,
        );
        return (
          (hasHotTopic ? 10 : 0) +
          (isConcise ? 10 : 0) +
          (hasInteractionCall ? 5 : 0)
        );
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
      case Platform.DOUYIN:
        return '平台特点：抖音，以短视频、强节奏、高视觉冲击力为特点。内容需要简洁有力、吸引眼球、适合15-60秒视频。建议使用热门话题、挑战标签和互动引导。';
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
      case Platform.DOUYIN:
        return ['12:00-14:00', '18:00-20:00', '21:00-23:00']; // 抖音用户活跃高峰在午休和晚间
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
      case Platform.DOUYIN:
        return '每日1-2次'; // 抖音内容更新快，需要更高频率
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
   * 使用直接REST API生成内容
   */
  private async generateContentViaRest(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }): Promise<{ text: string; error?: string; isTruncated?: boolean }> {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    if (!currentKey) {
      return { text: '', error: 'No API key available' };
    }

    const model = options?.model || this.config?.model || 'gemini-2.5-flash';
    const temperature = options?.temperature || this.config?.temperature || 0.7;
    const maxTokens = options?.maxTokens || this.config?.maxTokens || 8192;

    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;

    // 强制使用硬编码的 Body 结构：generationConfig 处于根层级
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: 8192, // 增加到8192以确保完整生成wechatFullPlan等所有字段
        temperature: 0.7
      }
    };

    try {
      this.logger.log(`Generating content via REST API with model: ${model}`);
      console.log(`>>> [REST API Debug] URL: ${url}, Key: ${currentKey.substring(0, 8)}...`);
      // 必须添加此行日志，我要在控制台亲眼看到发出去的结构
      console.log('>>> [CORE_CHECK] SENDING_TO_GOOGLE:', JSON.stringify(payload));
      // 设置60秒超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': currentKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`>>> [REST API Debug] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`REST API generation failed: HTTP ${response.status} ${response.statusText}`);
        return { text: '', error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`, isTruncated: false };
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        const finishReason = data.candidates[0].finishReason;

        // 记录finishReason用于调试
        this.logger.debug(`REST API generation completed. Finish reason: ${finishReason}, Text length: ${text.length}`);

        if (finishReason === 'MAX_TOKENS') {
          this.logger.warn(`Response may be truncated due to token limit. Finish reason: ${finishReason}, Text length: ${text.length}`);
        }

        // 添加成功日志
        console.log(`>>> [Lumina Success] Marketing Strategy Generated! Length: ${text.length} chars`);
        return { text, isTruncated: finishReason === 'MAX_TOKENS' };
      } else {
        this.logger.error('REST API response missing expected content');
        // 记录finishReason如果存在
        if (data.candidates && data.candidates[0] && data.candidates[0].finishReason) {
          this.logger.error(`Finish reason: ${data.candidates[0].finishReason}`);
        }
        return { text: '', error: 'Invalid response format', isTruncated: false };
      }
    } catch (error) {
      this.logger.error(`REST API generation error: ${error.message}`);
      return { text: '', error: error.message, isTruncated: false };
    }
  }

  /**
   * 生成回退内容（当API不可用时）
   */
  private generateFallbackContent(
    options: ContentGenerationOptions,
  ): ContentGenerationResult {
    this.logger.log(`Generating fallback content for platform: ${options.platform}, prompt: "${options.prompt.substring(0, 50)}..."`);

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
