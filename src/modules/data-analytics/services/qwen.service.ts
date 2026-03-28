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
    const keys = rawKeys
      .split(',')
      .map((k) => {
        // 物理级正则表达式清洗：只保留字母、数字、下划线和破折号
        const cleaned = k.replace(/[^a-zA-Z0-9_-]/g, '');
        this.logger.debug(`正则表达式清洗后Key长度：${cleaned.length}`);
        return cleaned;
      })
      .filter((k) => k.length > 10) // 阿里云API Key长度通常较短
      .filter((k) => k.startsWith('sk-')); // 阿里云DashScope API Key以sk-开头
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
      this.logger.debug(
        `[Lumina AI Qwen] Using Key: ${key.substring(0, 6)}... (索引: ${this.currentKeyIndex})`,
      );
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
    this.logger.warn(
      `API Key失败记录: ${key.substring(0, 8)}... (失败次数: ${currentFailures + 1}/${this.maxFailuresPerKey})`,
    );

    // 如果达到最大失败次数，尝试切换到下一个key
    if (currentFailures + 1 >= this.maxFailuresPerKey) {
      this.logger.warn(
        `API Key ${key.substring(0, 8)}... 已达到最大失败次数，将尝试下一个key`,
      );
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

    this.logger.log(
      `轮转API Key: 从索引 ${oldIndex} 切换到 ${this.currentKeyIndex}`,
    );
    // Qwen API不需要重新初始化
  }

  /**
   * 使用当前选中的API Key初始化Qwen连接
   */
  private async initializeWithCurrentKey(): Promise<boolean> {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    this.logger.debug(
      `[Lumina AI Qwen] Initializing with Key: ${currentKey.substring(0, 6)}... (index: ${this.currentKeyIndex})`,
    );
    if (!currentKey) {
      this.isAvailable = false;
      return false;
    }

    try {
      this.config = {
        apiKeys: this.apiKeys,
        model: this.configService.get<string>('QWEN_MODEL', 'qwen-plus'),
        temperature: this.configService.get<number>('QWEN_TEMPERATURE', 0.7),
        maxTokens: this.configService.get<number>('QWEN_MAX_TOKENS', 2048),
        topP: this.configService.get<number>('GEMINI_TOP_P', 0.95), // 复用Gemini配置
        topK: this.configService.get<number>('GEMINI_TOP_K', 40), // 复用Gemini配置
        timeout: 30000, // 30秒超时
      };

      // 测试连接：使用阿里云DashScope OpenAI兼容模式测试API Key有效性
      const apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/models';
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${currentKey}`,
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

      this.logger.log(
        `QwenService使用API Key索引 ${this.currentKeyIndex} 初始化成功，模型: ${this.config.model}`,
      );
      this.logger.debug(
        `当前可用API Key数量: ${this.apiKeys.length}, 当前索引: ${this.currentKeyIndex}`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `使用API Key索引 ${this.currentKeyIndex} 初始化失败: ${error.message}`,
      );
      this.recordKeyFailure(currentKey);
      this.isAvailable = false;
      return false;
    }
  }

  private async initialize() {
    // 测试环境特殊处理：跳过API验证，直接标记为可用
    if (process.env.NODE_ENV === 'test') {
      this.logger.log('测试环境：跳过Qwen API验证，标记服务为可用');
      this.isAvailable = true;
      this.apiKeys = ['test-key-1', 'test-key-2']; // 模拟API密钥
      return;
    }

    // 解析多个API Key
    const apiKeyString = this.configService.get<string>(
      'DASHSCOPE_API_KEY',
      '',
    );
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
    const rotationMode = this.configService.get<string>(
      'QWEN_KEY_ROTATION',
      'sequential',
    );
    this.keyRotationMode = rotationMode === 'random' ? 'random' : 'sequential';
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
    isTruncated?: boolean;
  }> {
    const startTime = Date.now();
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
      model: this.config?.model,
      // temperature 和 maxTokens 已硬编码，不再传递
    });

    if (result.text) {
      this.logger.error(
        `[QWEN DEBUG] 开始解析响应文本，长度: ${result.text.length}`,
      );
      console.error(
        `[QWEN DEBUG CONSOLE] 开始解析响应文本，长度: ${result.text.length}`,
      );
      console.error(
        `[QWEN DEBUG CONSOLE] 响应文本前500字符: ${result.text.substring(0, 500)}`,
      );
      console.error(
        `[QWEN DEBUG CONSOLE] result对象键: ${Object.keys(result).join(', ')}`,
      );
      console.error(
        `[QWEN DEBUG CONSOLE] result.isTruncated: ${result.isTruncated}`,
      );
      // 解析响应文本（复用GeminiService的解析逻辑）
      const parsedResponse = this.parseQwenResponse(result.text);
      if (parsedResponse.success) {
        // 添加引擎标识
        const dataWithEngine = {
          ...parsedResponse.data,
          engine: AIEngine.QWEN,
        };
        // 成功日志
        const duration = Date.now() - startTime;
        this.logger.log(
          `>>> [QWEN SUCCESS] 灵曜大脑已连接，方案生成用时: ${duration}ms。`,
        );
        return {
          success: true,
          data: dataWithEngine,
          isTruncated: result.isTruncated || false,
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
          isTruncated: result.isTruncated || false,
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
        isTruncated: result.isTruncated || false,
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

**系统指令（必须严格遵守）：**
1. **必须生成完整的JSON输出**，包含所有必填字段
2. **wechatFullPlan字段是强制性的** - 必须包含完整的微信全案方案，包含articleSeries（至少3篇文章）、offlineDecoration、membershipBenefits子字段
3. **如果缺少wechatFullPlan字段，整个方案将被拒绝**
4. **只返回JSON，不包含任何解释性文字**

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

**⚠️ 输出 JSON 结构警告：**
**必须严格按照以下结构生成完整JSON，所有字段都是强制性的，特别是 wechatFullPlan 字段必须完整生成。如果你不生成 wechatFullPlan 字段，整个响应将被视为无效。**
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
  "wechatFullPlan": { // ⚠️⚠️⚠️ 强制警告：这是最核心的必填字段！必须生成完整的微信全案方案，包含所有子字段！如果缺少此字段，整个方案无效！
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
   * 物理级JSON修复函数 - 处理截断的JSON响应
   */
  private repairTruncatedJson(str: string): any {
    let jsonStr = str.trim();
    // 移除 markdown 标签
    jsonStr = jsonStr
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // 如果没有以 } 结尾，暴力尝试补齐
    if (!jsonStr.endsWith('}')) {
      this.logger.warn('>>> [LUMINA REPAIR] 方案被截断，正在执行物理缝合...');
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
   * 解析 Qwen 响应文本为 JSON
   */
  private parseQwenResponse(text: string): {
    success: boolean;
    data?: GeminiStrategyResponse;
    error?: string;
  } {
    try {
      this.logger.error(
        `[parseQwenResponse] START 输入文本长度: ${text.length}`,
      );
      console.error(`[PARSE_QWEN_CONSOLE] START 输入文本长度: ${text.length}`);
      console.error(
        `[PARSE_QWEN_CONSOLE] 输入文本前200字符: ${text.substring(0, 200)}`,
      );
      this.logger.log(`[parseQwenResponse] 输入文本长度: ${text.length}`);
      this.logger.log(
        `[parseQwenResponse] 输入文本前500字符: ${text.substring(0, 500)}`,
      );
      this.logger.log(
        `[parseQwenResponse] 完整响应（前1000字符）: ${text.substring(0, Math.min(1000, text.length))}`,
      );
      // 尝试多种格式提取JSON
      let jsonText = text;

      // 1. 尝试匹配Markdown代码块（支持多种格式）
      const codeBlockPatterns = [
        /```json\s*\n([\s\S]*?)\n```/, // 标准格式：```json\n{...}\n```
        /```json\s*([\s\S]*?)```/, // 紧凑格式：```json{...}```
        /```\s*\n([\s\S]*?)\n```/, // 无语言标记：```\n{...}\n```
      ];

      for (const pattern of codeBlockPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          jsonText = match[1].trim();
          break;
        }
      }

      // 2. 如果代码块匹配失败，尝试提取JSON对象
      if (jsonText === text) {
        const jsonObjectMatch = text.match(/(\{[\s\S]*\})/);
        if (jsonObjectMatch && jsonObjectMatch[1]) {
          jsonText = jsonObjectMatch[1].trim();
        }
      }

      // 3. 尝试解析JSON，使用物理级JSON修复函数
      const parsed = this.repairTruncatedJson(jsonText);
      this.logger.log(
        `[parseQwenResponse] 解析后的对象键: ${Object.keys(parsed).join(', ')}`,
      );
      this.logger.error(
        `[parseQwenResponse] 🔍 DEBUG 解析对象包含 wechatFullPlan? ${'wechatFullPlan' in parsed}, 值: ${JSON.stringify(parsed.wechatFullPlan)}`,
      );

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

      this.logger.log(
        `[parseQwenResponse] 开始验证必需字段，共${requiredFields.length}个字段`,
      );

      for (const field of requiredFields) {
        this.logger.log(
          `[parseQwenResponse] 检查字段: ${field}, 值: ${JSON.stringify(parsed[field])?.substring(0, 100)}`,
        );

        // 更严格的检查：字段必须存在且不是空对象或空数组
        if (parsed[field] === undefined || parsed[field] === null) {
          this.logger.error(
            `🚨 缺失必需字段: ${field} (值为 ${parsed[field]})`,
          );
          this.logger.error(
            `🚨 解析后的对象字段: ${Object.keys(parsed).join(', ')}`,
          );
          this.logger.error(`🚨 原始响应前500字符: ${text.substring(0, 500)}`);
          if (field === 'wechatFullPlan') {
            this.logger.error(
              `🚨 严重: wechatFullPlan字段缺失! AI未遵循指令生成微信全案方案`,
            );
            this.logger.error(`🚨 检查提示词中的强制要求是否足够明确`);
          }
          throw new Error(`Missing required field: ${field}`);
        }

        // 对于对象字段，检查是否为空对象
        if (
          field === 'wechatFullPlan' &&
          typeof parsed[field] === 'object' &&
          Object.keys(parsed[field]).length === 0
        ) {
          this.logger.warn(
            `⚠️ wechatFullPlan字段存在但为空对象，可能AI生成了空结构`,
          );
        }
      }

      this.logger.log(`[parseQwenResponse] 所有必需字段验证通过`);

      // 特别检查wechatFullPlan的子字段
      if (parsed.wechatFullPlan) {
        const wechatFields = [
          'articleSeries',
          'offlineDecoration',
          'membershipBenefits',
        ];
        for (const field of wechatFields) {
          if (!parsed.wechatFullPlan[field]) {
            this.logger.warn(`⚠️ wechatFullPlan缺少子字段: ${field}`);
          }
        }

        // 检查articleSeries是否包含足够的内容
        if (
          parsed.wechatFullPlan.articleSeries &&
          Array.isArray(parsed.wechatFullPlan.articleSeries)
        ) {
          if (parsed.wechatFullPlan.articleSeries.length < 2) {
            this.logger.warn(
              `⚠️ wechatFullPlan.articleSeries只有${parsed.wechatFullPlan.articleSeries.length}篇文章，建议至少3篇`,
            );
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
    isTruncated?: boolean;
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
        userPersonas: [
          {
            name: '时尚小白领莉莉',
            description:
              '25-30岁，一线城市白领，注重生活品质，喜欢在社交平台分享生活方式',
            behaviorTraits: [
              '高频使用小红书',
              '关注美妆穿搭',
              '喜欢参与线上活动',
            ],
            motivations: ['寻求认同感', '追求生活品质', '社交展示'],
          },
          {
            name: '新手妈妈小雅',
            description: '28-35岁，注重育儿品质，关注健康安全，消费决策理性',
            behaviorTraits: ['关注母婴内容', '信任专家推荐', '重视产品安全性'],
            motivations: ['宝宝健康', '育儿便利', '家庭幸福感'],
          },
        ],
      },
      coreIdea: `这是一份基于 ${type} 的营销策略回退方案。由于 Qwen API 暂时不可用，我们提供了基于最佳实践的基础方案。建议在 API 恢复后重新生成更精准的策略。`,
      xhsContent: {
        title: `${baseName}｜${type}营销方案（Qwen回退）`,
        content: `大家好！今天分享我们的${baseName}营销方案✨\n\n🔹 核心目标：提升品牌曝光和用户互动\n🔹 目标人群：${campaignSummary.targetAudience?.description || '25-35岁时尚人群'}\n🔹 预算：${campaignSummary.budget}元\n\n💡 核心创意：\n通过内容营销和社区互动，打造品牌影响力。\n\n📅 执行计划：\n1. 第一阶段：内容预热\n2. 第二阶段：活动引爆\n3. 第三阶段：持续运营\n\n#${baseName.replace(/\s+/g, '')} #营销方案 #小红书运营 #品牌推广`,
        hashtags: ['营销方案', '小红书运营', '品牌推广', '内容营销'],
        suggestedImages: ['产品展示', '场景图', '用户证言', '数据图表'],
      },
      wechatFullPlan: {
        articleSeries: [
          {
            title: '【首发】探索新体验：XXXX的全新升级',
            theme: '品牌升级与创新',
            keyPoints: ['品牌故事', '产品特色', '用户体验'],
          },
          {
            title: '【深度】行业洞察：XXXX如何引领潮流',
            theme: '行业分析与趋势',
            keyPoints: ['市场分析', '趋势预测', '竞争优势'],
          },
          {
            title: '【互动】邀请您参与：XXXX共创计划',
            theme: '用户参与与共创',
            keyPoints: ['互动机制', '用户反馈', '共创成果'],
          },
        ],
        offlineDecoration:
          '主题展区设计，结合品牌色系与互动装置，打造沉浸式体验空间',
        membershipBenefits:
          '三级会员体系：基础会员（注册即享）、银卡会员（消费累计）、金卡会员（年度活跃），对应不同权益与专属服务',
      },
      recommendedExecutionTime: {
        timeline: [
          {
            phase: '准备期',
            duration: '2周',
            activities: ['内容规划', '资源准备', '团队培训'],
            milestones: ['方案定稿', '资源到位', '团队培训完成'],
          },
          {
            phase: '执行期',
            duration: '4周',
            activities: ['内容发布', '活动运营', '数据监测'],
            milestones: ['首波内容发布', '活动引爆', '数据达标'],
          },
          {
            phase: '优化期',
            duration: '2周',
            activities: ['效果评估', '策略调整', '总结报告'],
            milestones: ['效果报告完成', '策略优化方案', '项目总结'],
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
          deliverables: ['竞品分析报告', '目标用户画像'],
        },
        {
          step: 2,
          description: '内容创意与脚本撰写',
          responsible: '内容团队',
          deadline: '第2周',
          deliverables: ['内容日历', '创意脚本', '视觉概念'],
        },
        {
          step: 3,
          description: '素材制作与审核',
          responsible: '设计部',
          deadline: '第3周',
          deliverables: ['设计素材', '视频成品', '审核报告'],
        },
        {
          step: 4,
          description: '渠道发布与推广',
          responsible: '运营部',
          deadline: '第4周',
          deliverables: ['渠道发布记录', '推广数据', '用户反馈'],
        },
        {
          step: 5,
          description: '数据监测与优化',
          responsible: '数据分析',
          deadline: '持续',
          deliverables: ['数据日报', '优化建议', '结案报告'],
        },
      ],
      riskAssessment: [
        {
          risk: '平台算法变化',
          probability: '中',
          impact: '高',
          mitigationStrategy: '多平台分发，降低单一平台依赖',
          contingencyPlan: '准备备用渠道，调整内容策略',
        },
        {
          risk: '预算超支',
          probability: '低',
          impact: '中',
          mitigationStrategy: '分阶段拨款，定期审计',
          contingencyPlan: '预留10%应急预算，优化资源分配',
        },
        {
          risk: '内容效果不佳',
          probability: '中',
          impact: '中',
          mitigationStrategy: 'A/B测试，快速迭代',
          contingencyPlan: '准备备选内容方案，调整发布时间',
        },
      ],
      budgetAllocation: [
        {
          category: '内容制作',
          amount: campaignSummary.budget * 0.4,
          percentage: 40,
          justification: '高质量内容是营销成功的基础',
          costBreakdown: ['文案撰写', '设计制作', '视频拍摄'],
        },
        {
          category: '渠道推广',
          amount: campaignSummary.budget * 0.3,
          percentage: 30,
          justification: '包括小红书推广、微信广告等',
          costBreakdown: ['平台广告', 'KOL合作', '流量投放'],
        },
        {
          category: '数据分析',
          amount: campaignSummary.budget * 0.15,
          percentage: 15,
          justification: '效果监测与优化调整',
          costBreakdown: ['监测工具', '分析服务', '报告制作'],
        },
        {
          category: '应急备用',
          amount: campaignSummary.budget * 0.15,
          percentage: 15,
          justification: '应对突发情况和机会',
          costBreakdown: ['应急预算', '灵活调配', '机会捕捉'],
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
      isTruncated: false,
    };
  }

  /**
   * 使用 OpenAI 兼容模式 REST API 生成内容
   */
  private async generateContentViaRest(
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    },
  ): Promise<{ text: string; error?: string; isTruncated?: boolean }> {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    if (!currentKey) {
      return { text: '', error: 'No API key available' };
    }

    const model = options?.model || this.config?.model || 'qwen-plus';
    // 硬编码 temperature 为 0.7，确保是浮点数
    const temperature = 0.7;
    // 硬编码 max_tokens 为 3000，确保完整生成wechatFullPlan等所有字段
    const maxTokens = 3000;

    // 阿里云DashScope OpenAI兼容模式端点
    const url =
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

    const payload = {
      model,
      messages: [
        {
          role: 'system',
          content:
            '你是一个专业的营销策略专家，请根据用户提供的活动信息生成详细的营销策略方案。输出必须是完整的JSON格式。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
      top_p: 0.95, // 必须显式写 0.95
      response_format: { type: 'json_object' }, // 开启阿里云的原生 JSON 模式
      // top_k: this.config?.topK || 40, // OpenAI API不支持top_k参数
    };

    try {
      this.logger.log(
        `Generating content via Qwen REST API with model: ${model}`,
      );
      this.logger.log(`[QWEN DEBUG] URL: ${url}`);
      this.logger.log(`[QWEN DEBUG] Payload model: ${payload.model}`);
      this.logger.log(
        `[QWEN DEBUG] Current key (first 10 chars): ${currentKey.substring(0, 10)}...`,
      );
      this.logger.log(
        `[QWEN DEBUG] Payload messages length: ${JSON.stringify(payload.messages).length}`,
      );

      // 使用代理（如果配置了环境变量）
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
      const fetchOptions: any = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      if (proxyUrl) {
        this.logger.log(`[QWEN DEBUG] Using proxy: ${proxyUrl}`);
        try {
          // 动态导入 HttpsProxyAgent，避免在不需要代理的环境中报错
          const { HttpsProxyAgent } = require('https-proxy-agent');
          const agent = new HttpsProxyAgent(proxyUrl);
          fetchOptions.agent = agent;
        } catch (proxyError) {
          this.logger.warn(
            `Failed to create proxy agent: ${proxyError.message}`,
          );
        }
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Qwen REST API generation failed: HTTP ${response.status} ${response.statusText}`,
        );
        return {
          text: '',
          error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
          isTruncated: false,
        };
      }

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const text = data.choices[0].message.content;
        const finishReason = data.choices[0].finish_reason;
        const isTruncated = finishReason === 'length'; // OpenAI API中'length'表示因令牌限制截断

        if (isTruncated) {
          this.logger.warn(
            `Qwen API response truncated. Finish reason: ${finishReason}, Text length: ${text.length}`,
          );
        }

        return { text, isTruncated };
      } else {
        this.logger.error('Qwen REST API response missing expected content');
        return {
          text: '',
          error: 'Invalid response format',
          isTruncated: false,
        };
      }
    } catch (error) {
      this.logger.error(`Qwen REST API generation error: ${error.message}`);
      return { text: '', error: error.message, isTruncated: false };
    }
  }
}
