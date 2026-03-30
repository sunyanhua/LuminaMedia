import { Injectable, Logger } from '@nestjs/common';
import { ISentimentAnalysisProvider } from '../interfaces/sentiment-analysis.interface';

/**
 * 情感词典配置
 */
export interface SentimentLexiconConfig {
  /**
   * 正面词词典
   */
  positiveWords: Set<string>;

  /**
   * 负面词词典
   */
  negativeWords: Set<string>;

  /**
   * 否定词词典（如"不"、"没有"）
   */
  negationWords: Set<string>;

  /**
   * 强度词词典（如"非常"、"极其"）
   */
  intensityWords: Map<string, number>;

  /**
   * 行业特定词典
   */
  industryWords?: Map<
    string,
    { sentiment: 'positive' | 'negative'; weight: number }
  >;

  /**
   * 情感对象词典
   */
  targetWords?: Set<string>;
}

/**
 * 基于词典的情感分析提供商
 */
@Injectable()
export class LexiconSentimentProvider implements ISentimentAnalysisProvider {
  private readonly logger = new Logger(LexiconSentimentProvider.name);
  readonly name = 'lexicon';

  private lexicons: Map<string, SentimentLexiconConfig> = new Map();
  private defaultLexicon: SentimentLexiconConfig;

  constructor() {
    this.initializeDefaultLexicon();
    this.initializeIndustryLexicons();
  }

  /**
   * 初始化默认词典
   */
  private initializeDefaultLexicon(): void {
    // 基础中文情感词典
    const positiveWords = new Set([
      '好',
      '优秀',
      '满意',
      '喜欢',
      '爱',
      '赞',
      '棒',
      '不错',
      '精彩',
      '完美',
      '出色',
      '卓越',
      '优良',
      '高品质',
      '高效',
      '便捷',
      '舒适',
      '愉快',
      '高兴',
      '惊喜',
      '推荐',
      '支持',
      '感谢',
      '感激',
      '佩服',
      '欣赏',
      '羡慕',
      '期待',
      '希望',
      '信心',
      '乐观',
      '积极',
      '正面',
      '有利',
      '有益',
      '有帮助',
      '有价值',
      '成功',
      '胜利',
      '成就',
      '进步',
      '发展',
      '提升',
      '改善',
      '优化',
      '创新',
      '领先',
      '先进',
      '现代',
      '时尚',
      '美观',
      '漂亮',
      '优雅',
      '精致',
      '细腻',
      '温柔',
      '体贴',
      '周到',
      '专业',
      '可靠',
      '稳定',
      '安全',
      '放心',
      '信任',
    ]);

    const negativeWords = new Set([
      '差',
      '糟糕',
      '烂',
      '坏',
      '差劲',
      '不满意',
      '讨厌',
      '恨',
      '厌恶',
      '反感',
      '失望',
      '沮丧',
      '伤心',
      '难过',
      '痛苦',
      '愤怒',
      '生气',
      '恼火',
      '烦躁',
      '焦虑',
      '担心',
      '害怕',
      '恐惧',
      '怀疑',
      '质疑',
      '批评',
      '指责',
      '抱怨',
      '投诉',
      '抗议',
      '反对',
      '拒绝',
      '否定',
      '消极',
      '负面',
      '不利',
      '有害',
      '危险',
      '风险',
      '问题',
      '故障',
      '错误',
      '缺陷',
      '不足',
      '缺点',
      '弱点',
      '失败',
      '挫折',
      '损失',
      '损害',
      '伤害',
      '威胁',
      '挑战',
      '困难',
      '障碍',
      '复杂',
      '混乱',
      '模糊',
      '不清晰',
      '不稳定',
      '不可靠',
      '不安全',
      '不放心',
    ]);

    const negationWords = new Set([
      '不',
      '没',
      '没有',
      '无',
      '非',
      '未',
      '勿',
      '莫',
      '别',
      '不要',
      '不会',
      '不能',
      '不可',
      '不行',
      '不必',
      '不用',
      '从未',
      '毫无',
      '毫无意义',
    ]);

    const intensityWords = new Map([
      ['非常', 1.5],
      ['极其', 1.8],
      ['极度', 1.8],
      ['十分', 1.3],
      ['特别', 1.4],
      ['相当', 1.2],
      ['比较', 1.1],
      ['稍微', 0.8],
      ['有点', 0.9],
      ['略微', 0.8],
      ['完全', 1.5],
      ['绝对', 1.6],
      ['彻底', 1.5],
      ['根本', 1.4],
      ['简直', 1.3],
      ['太', 1.4],
      ['真', 1.2],
      ['好', 1.1],
      ['超', 1.3],
      ['巨', 1.3],
    ]);

    this.defaultLexicon = {
      positiveWords,
      negativeWords,
      negationWords,
      intensityWords,
    };
  }

  /**
   * 初始化行业词典
   */
  private initializeIndustryLexicons(): void {
    // 电商行业词典
    const ecommerceLexicon: SentimentLexiconConfig = {
      ...this.defaultLexicon,
      industryWords: new Map([
        ['物流快', { sentiment: 'positive', weight: 1.2 }],
        ['送货及时', { sentiment: 'positive', weight: 1.1 }],
        ['包装完好', { sentiment: 'positive', weight: 1.0 }],
        ['正品', { sentiment: 'positive', weight: 1.3 }],
        ['假货', { sentiment: 'negative', weight: 1.5 }],
        ['物流慢', { sentiment: 'negative', weight: 1.2 }],
        ['包装破损', { sentiment: 'negative', weight: 1.1 }],
        ['客服态度差', { sentiment: 'negative', weight: 1.4 }],
        ['退货困难', { sentiment: 'negative', weight: 1.3 }],
        ['价格实惠', { sentiment: 'positive', weight: 1.2 }],
        ['价格虚高', { sentiment: 'negative', weight: 1.2 }],
        ['质量好', { sentiment: 'positive', weight: 1.3 }],
        ['质量差', { sentiment: 'negative', weight: 1.3 }],
      ]),
      targetWords: new Set([
        '物流',
        '包装',
        '客服',
        '价格',
        '质量',
        '商品',
        '店铺',
      ]),
    };

    // 餐饮行业词典
    const foodLexicon: SentimentLexiconConfig = {
      ...this.defaultLexicon,
      industryWords: new Map([
        ['好吃', { sentiment: 'positive', weight: 1.3 }],
        ['美味', { sentiment: 'positive', weight: 1.4 }],
        ['新鲜', { sentiment: 'positive', weight: 1.2 }],
        ['干净卫生', { sentiment: 'positive', weight: 1.3 }],
        ['难吃', { sentiment: 'negative', weight: 1.4 }],
        ['不新鲜', { sentiment: 'negative', weight: 1.3 }],
        ['脏乱差', { sentiment: 'negative', weight: 1.5 }],
        ['服务好', { sentiment: 'positive', weight: 1.2 }],
        ['服务差', { sentiment: 'negative', weight: 1.3 }],
        ['环境好', { sentiment: 'positive', weight: 1.1 }],
        ['环境差', { sentiment: 'negative', weight: 1.2 }],
        ['价格合理', { sentiment: 'positive', weight: 1.1 }],
        ['价格贵', { sentiment: 'negative', weight: 1.2 }],
      ]),
      targetWords: new Set([
        '味道',
        '服务',
        '环境',
        '价格',
        '卫生',
        '菜品',
        '餐厅',
      ]),
    };

    this.lexicons.set('ecommerce', ecommerceLexicon);
    this.lexicons.set('food', foodLexicon);
    this.lexicons.set('餐饮', foodLexicon);
  }

  /**
   * 分析单个文本情感
   */
  async analyze(
    text: string,
    options?: any,
  ): Promise<{
    polarity: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
    intensity?: number;
  }> {
    try {
      const industry = options?.industry || 'generic';
      const lexicon = this.getLexiconForIndustry(industry);

      // 分词（简单的中文分词，按字符分割）
      const tokens = this.tokenizeChinese(text);

      // 分析情感
      const result = this.analyzeTokens(tokens, lexicon);

      return {
        polarity: result.polarity,
        score: result.score,
        confidence: result.confidence,
        intensity: result.intensity,
      };
    } catch (error) {
      this.logger.error(`词典情感分析失败: ${error.message}`);
      return {
        polarity: 'neutral',
        score: 0,
        confidence: 0.3,
        intensity: 0.5,
      };
    }
  }

  /**
   * 批量分析文本情感
   */
  async analyzeBatch(texts: string[], options?: any): Promise<any[]> {
    const results: any[] = [];
    for (const text of texts) {
      try {
        const result = await this.analyze(text, options);
        results.push(result);
      } catch (error) {
        this.logger.error(`批量分析失败: ${error.message}`);
        results.push({
          polarity: 'neutral',
          score: 0,
          confidence: 0.3,
          intensity: 0.5,
          error: error.message,
        });
      }
    }
    return results;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      // 测试正面文本
      const positiveText = '这个产品非常好，我非常喜欢！';
      const positiveResult = await this.analyze(positiveText);

      // 测试负面文本
      const negativeText = '这个产品质量很差，很不满意。';
      const negativeResult = await this.analyze(negativeText);

      // 验证结果
      if (
        positiveResult.polarity === 'positive' &&
        positiveResult.score > 0 &&
        negativeResult.polarity === 'negative' &&
        negativeResult.score < 0
      ) {
        return { healthy: true, message: '词典情感分析服务正常' };
      } else {
        return {
          healthy: false,
          message: `词典情感分析结果异常: 正面文本得分${positiveResult.score}, 负面文本得分${negativeResult.score}`,
        };
      }
    } catch (error) {
      return { healthy: false, message: `健康检查失败: ${error.message}` };
    }
  }

  /**
   * 获取行业词典
   */
  private getLexiconForIndustry(industry: string): SentimentLexiconConfig {
    return this.lexicons.get(industry) || this.defaultLexicon;
  }

  /**
   * 简单的中文分词
   */
  private tokenizeChinese(text: string): string[] {
    // 移除标点符号，按字符分割
    const cleaned = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ');
    const tokens = cleaned.split(/\s+/).filter((token) => token.length > 0);

    // 对于中文，还可以考虑按字符分割以获得更细粒度
    const charTokens: string[] = [];
    for (const token of tokens) {
      if (/^[\u4e00-\u9fa5]+$/.test(token)) {
        // 纯中文，按字符分割
        charTokens.push(...token.split(''));
      } else {
        charTokens.push(token);
      }
    }

    return charTokens;
  }

  /**
   * 分析令牌情感
   */
  private analyzeTokens(
    tokens: string[],
    lexicon: SentimentLexiconConfig,
  ): {
    polarity: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
    intensity: number;
  } {
    let positiveScore = 0;
    let negativeScore = 0;
    let totalWeight = 0;
    let intensityMultiplier = 1;

    // 检查否定词和强度词的影响
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // 检查是否为强度词
      if (lexicon.intensityWords.has(token)) {
        intensityMultiplier *= lexicon.intensityWords.get(token) || 1;
        continue;
      }

      // 检查是否为否定词
      let isNegated = false;
      if (lexicon.negationWords.has(token)) {
        isNegated = true;
        // 查找否定词影响的范围（通常是后面的1-2个词）
        const lookahead = Math.min(2, tokens.length - i - 1);
        // 这里简化处理，实际应用中可能需要更复杂的逻辑
      }

      // 检查行业特定词汇
      let tokenSentiment: 'positive' | 'negative' | null = null;
      let tokenWeight = 1;

      if (lexicon.industryWords && lexicon.industryWords.has(token)) {
        const industryWord = lexicon.industryWords.get(token)!;
        tokenSentiment = industryWord.sentiment;
        tokenWeight = industryWord.weight;
      } else if (lexicon.positiveWords.has(token)) {
        tokenSentiment = 'positive';
        tokenWeight = 1;
      } else if (lexicon.negativeWords.has(token)) {
        tokenSentiment = 'negative';
        tokenWeight = 1;
      }

      if (tokenSentiment) {
        const score = tokenWeight * intensityMultiplier * (isNegated ? -1 : 1);

        if (tokenSentiment === 'positive') {
          positiveScore += score;
        } else {
          negativeScore += score;
        }

        totalWeight += tokenWeight;
      }

      // 重置强度乘数（如果下一个词不是情感词，强度词的影响可能减弱）
      if (i > 0 && !this.isSentimentWord(token, lexicon)) {
        intensityMultiplier = 1;
      }
    }

    // 计算最终分数
    const rawScore = positiveScore - negativeScore;
    const maxPossibleScore = totalWeight * 2; // 假设最大强度为2

    // 归一化到-1到1
    const normalizedScore =
      maxPossibleScore > 0 ? rawScore / maxPossibleScore : 0;

    // 确定极性
    let polarity: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (normalizedScore > 0.1) {
      polarity = 'positive';
    } else if (normalizedScore < -0.1) {
      polarity = 'negative';
    }

    // 计算置信度（基于找到的情感词数量和分数大小）
    const confidence = Math.min(
      1,
      totalWeight * 0.3 + Math.abs(normalizedScore) * 0.7,
    );

    // 计算强度（分数的绝对值）
    const intensity = Math.abs(normalizedScore);

    return {
      polarity,
      score: normalizedScore,
      confidence,
      intensity,
    };
  }

  /**
   * 判断是否为情感词
   */
  private isSentimentWord(
    token: string,
    lexicon: SentimentLexiconConfig,
  ): boolean {
    return (
      lexicon.positiveWords.has(token) ||
      lexicon.negativeWords.has(token) ||
      !!(lexicon.industryWords && lexicon.industryWords.has(token))
    );
  }

  /**
   * 添加自定义词典
   */
  addCustomLexicon(
    industry: string,
    config: Partial<SentimentLexiconConfig>,
  ): void {
    const baseLexicon = this.getLexiconForIndustry('generic');
    const customLexicon: SentimentLexiconConfig = {
      positiveWords: new Set([
        ...baseLexicon.positiveWords,
        ...(config.positiveWords || []),
      ]),
      negativeWords: new Set([
        ...baseLexicon.negativeWords,
        ...(config.negativeWords || []),
      ]),
      negationWords: new Set([
        ...baseLexicon.negationWords,
        ...(config.negationWords || []),
      ]),
      intensityWords: new Map([
        ...baseLexicon.intensityWords,
        ...(config.intensityWords || []),
      ]),
      industryWords: config.industryWords,
      targetWords: config.targetWords,
    };

    this.lexicons.set(industry, customLexicon);
  }
}
