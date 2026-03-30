import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import {
  ISentimentAnalysisService,
  SentimentAnalysisRequest,
  SentimentResult,
  SentimentTrendAnalysis,
  SentimentTrendPoint,
  SentimentAlertRule,
  SentimentAlert,
  ISentimentAnalysisProvider,
} from '../interfaces/sentiment-analysis.interface';

@Injectable()
export class SentimentAnalysisService implements ISentimentAnalysisService {
  private readonly logger = new Logger(SentimentAnalysisService.name);

  private providers: Map<string, ISentimentAnalysisProvider> = new Map();
  private defaultProvider: string = 'lexicon'; // 默认使用词典分析

  constructor(
    @Optional() @Inject('SENTIMENT_PROVIDERS') providers?: ISentimentAnalysisProvider[]
  ) {
    if (providers) {
      this.registerProviders(providers);
    }
  }

  /**
   * 注册情感分析提供商
   */
  registerProvider(provider: ISentimentAnalysisProvider): void {
    this.providers.set(provider.name, provider);
    this.logger.log(`注册情感分析提供商: ${provider.name}`);
  }

  /**
   * 注册多个情感分析提供商
   */
  registerProviders(providers: ISentimentAnalysisProvider[]): void {
    for (const provider of providers) {
      this.registerProvider(provider);
    }
  }

  /**
   * 设置默认提供商
   */
  setDefaultProvider(providerName: string): void {
    if (this.providers.has(providerName)) {
      this.defaultProvider = providerName;
      this.logger.log(`设置默认情感分析提供商为: ${providerName}`);
    } else {
      this.logger.warn(`提供商 ${providerName} 不存在，无法设置为默认`);
    }
  }

  /**
   * 获取情感分析提供商
   */
  private getProvider(providerName?: string): ISentimentAnalysisProvider {
    const name = providerName || this.defaultProvider;
    const provider = this.providers.get(name);

    if (!provider) {
      throw new Error(`情感分析提供商 ${name} 不存在`);
    }

    return provider;
  }

  /**
   * 分析单个文本的情感
   */
  async analyzeText(request: SentimentAnalysisRequest): Promise<SentimentResult> {
    const startTime = Date.now();

    try {
      // 选择提供商（可以根据行业、平台等条件智能选择）
      const providerName = this.selectProvider(request);
      const provider = this.getProvider(providerName);

      this.logger.debug(`使用 ${providerName} 提供商分析文本: ${request.text.substring(0, 50)}...`);

      // 调用提供商进行分析
      const analysisResult = await provider.analyze(request.text, {
        industry: request.industry,
        target: request.target,
        platform: request.platform,
      });

      // 构建完整结果
      const result: SentimentResult = {
        polarity: analysisResult.polarity,
        intensity: analysisResult.intensity || Math.abs(analysisResult.score),
        score: analysisResult.score,
        confidence: analysisResult.confidence,
        targets: analysisResult.targets || this.extractTargets(request.text, request.target),
        reasons: analysisResult.reasons || this.extractReasons(request.text, analysisResult.polarity),
        text: request.text,
        analyzedAt: new Date(),
      };

      const processingTime = Date.now() - startTime;
      this.logger.debug(`情感分析完成: ${result.polarity} (${result.score}), 耗时: ${processingTime}ms`);

      return result;
    } catch (error) {
      this.logger.error(`情感分析失败: ${error.message}`, error.stack);
      throw new Error(`情感分析失败: ${error.message}`);
    }
  }

  /**
   * 批量分析文本情感
   */
  async analyzeTexts(requests: SentimentAnalysisRequest[]): Promise<SentimentResult[]> {
    const startTime = Date.now();
    const results: SentimentResult[] = [];

    this.logger.log(`开始批量分析 ${requests.length} 个文本的情感`);

    // 分组处理（按平台、行业等）
    const groups = this.groupRequests(requests);

    for (const [groupKey, groupRequests] of groups) {
      this.logger.debug(`处理组 ${groupKey}: ${groupRequests.length} 个文本`);

      // 选择适合该组的提供商
      const providerName = this.selectProvider(groupRequests[0]);
      const provider = this.getProvider(providerName);

      try {
        // 提取文本
        const texts = groupRequests.map(req => req.text);

        // 批量分析
        const analysisResults = await provider.analyzeBatch(texts, {
          industry: groupRequests[0].industry,
          platform: groupRequests[0].platform,
        });

        // 构建结果
        for (let i = 0; i < groupRequests.length; i++) {
          const request = groupRequests[i];
          const analysisResult = analysisResults[i];

          const result: SentimentResult = {
            polarity: analysisResult.polarity,
            intensity: analysisResult.intensity || Math.abs(analysisResult.score),
            score: analysisResult.score,
            confidence: analysisResult.confidence,
            targets: analysisResult.targets || this.extractTargets(request.text, request.target),
            reasons: analysisResult.reasons || this.extractReasons(request.text, analysisResult.polarity),
            text: request.text,
            analyzedAt: new Date(),
          };

          results.push(result);
        }
      } catch (error) {
        this.logger.error(`组 ${groupKey} 分析失败: ${error.message}`);

        // 为失败的请求提供默认结果
        for (const request of groupRequests) {
          const fallbackResult: SentimentResult = {
            polarity: 'neutral',
            intensity: 0.5,
            score: 0,
            confidence: 0.3,
            targets: this.extractTargets(request.text, request.target),
            reasons: [],
            text: request.text,
            analyzedAt: new Date(),
          };
          results.push(fallbackResult);
        }
      }
    }

    const processingTime = Date.now() - startTime;
    this.logger.log(`批量分析完成: ${results.length} 个结果, 耗时: ${processingTime}ms`);

    return results;
  }

  /**
   * 分析情感趋势
   */
  async analyzeTrend(
    texts: Array<{ text: string; timestamp: Date }>,
    options?: {
      timeInterval?: 'hour' | 'day' | 'week' | 'month';
      industry?: string;
    }
  ): Promise<SentimentTrendAnalysis> {
    const startTime = Date.now();

    try {
      this.logger.log(`开始分析情感趋势: ${texts.length} 个文本`);

      // 默认按天分组
      const interval = options?.timeInterval || 'day';
      const industry = options?.industry;

      // 按时间间隔分组
      const timeGroups = this.groupByTimeInterval(texts, interval);

      // 分析每个时间段的情感
      const trendPoints: SentimentTrendPoint[] = [];
      let totalPositive = 0;
      let totalNegative = 0;
      let totalNeutral = 0;

      for (const [timeLabel, groupTexts] of timeGroups) {
        if (groupTexts.length === 0) continue;

        // 分析该时间段的所有文本
        const requests: SentimentAnalysisRequest[] = groupTexts.map(item => ({
          text: item.text,
          industry,
          platform: 'unknown',
        }));

        const results = await this.analyzeTexts(requests);

        // 计算统计信息
        const positiveCount = results.filter(r => r.polarity === 'positive').length;
        const negativeCount = results.filter(r => r.polarity === 'negative').length;
        const neutralCount = results.filter(r => r.polarity === 'neutral').length;

        const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

        const trendPoint = {
          timestamp: this.parseTimeLabel(timeLabel, interval),
          averageScore,
          positiveRatio: positiveCount / results.length,
          negativeRatio: negativeCount / results.length,
          neutralRatio: neutralCount / results.length,
          sampleCount: results.length,
        };

        trendPoints.push(trendPoint);

        // 累加总体统计
        totalPositive += positiveCount;
        totalNegative += negativeCount;
        totalNeutral += neutralCount;
      }

      // 按时间排序
      trendPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // 分析趋势方向
      const trendDirection = this.calculateTrendDirection(trendPoints);
      const trendMagnitude = this.calculateTrendMagnitude(trendPoints);

      // 识别关键事件点（情感突变）
      const keyEvents = this.detectKeyEvents(trendPoints);

      const totalSamples = totalPositive + totalNegative + totalNeutral;

      const result: SentimentTrendAnalysis = {
        period: {
          start: trendPoints[0]?.timestamp || new Date(),
          end: trendPoints[trendPoints.length - 1]?.timestamp || new Date(),
        },
        trends: trendPoints,
        overallSentiment: {
          positive: totalPositive,
          negative: totalNegative,
          neutral: totalNeutral,
          total: totalSamples,
        },
        trendDirection,
        trendMagnitude,
        keyEvents,
      };

      const processingTime = Date.now() - startTime;
      this.logger.log(`情感趋势分析完成: ${trendPoints.length} 个时间点, 耗时: ${processingTime}ms`);

      return result;
    } catch (error) {
      this.logger.error(`情感趋势分析失败: ${error.message}`, error.stack);
      throw new Error(`情感趋势分析失败: ${error.message}`);
    }
  }

  /**
   * 检查预警规则
   */
  async checkAlerts(
    texts: Array<{ text: string; timestamp: Date }>,
    rules: SentimentAlertRule[]
  ): Promise<SentimentAlert[]> {
    const alerts: SentimentAlert[] = [];
    const enabledRules = rules.filter(rule => rule.enabled);

    if (enabledRules.length === 0) {
      return alerts;
    }

    this.logger.log(`检查 ${enabledRules.length} 个预警规则`);

    // 分析文本情感
    const requests: SentimentAnalysisRequest[] = texts.map(item => ({
      text: item.text,
      timestamp: item.timestamp,
    }));

    const results = await this.analyzeTexts(requests);

    // 按规则检查
    for (const rule of enabledRules) {
      try {
        const alert = this.checkRule(rule, results);
        if (alert) {
          alerts.push(alert);
        }
      } catch (error) {
        this.logger.error(`检查规则 ${rule.name} 失败: ${error.message}`);
      }
    }

    this.logger.log(`发现 ${alerts.length} 个预警`);
    return alerts;
  }

  /**
   * 选择提供商
   */
  private selectProvider(request: SentimentAnalysisRequest): string {
    // 简单的选择逻辑
    // 可以根据文本长度、行业、平台等选择最适合的提供商

    // 如果文本很短，使用词典分析
    if (request.text.length < 20) {
      return 'lexicon';
    }

    // 如果指定了行业且词典支持该行业，使用词典分析
    if (request.industry && request.industry !== 'generic') {
      return 'lexicon';
    }

    // 否则使用默认提供商
    return this.defaultProvider;
  }

  /**
   * 提取情感对象
   */
  private extractTargets(text: string, specifiedTarget?: string): string[] {
    const targets: string[] = [];

    // 如果指定了目标，优先使用
    if (specifiedTarget) {
      targets.push(specifiedTarget);
    }

    // 简单提取：常见的情感对象关键词
    const targetKeywords = [
      '产品', '服务', '质量', '价格', '客服', '物流', '包装',
      '品牌', '公司', '商家', '店铺', '餐厅', '酒店', '景区',
      '软件', '应用', '系统', '网站', '平台', '功能', '性能'
    ];

    for (const keyword of targetKeywords) {
      if (text.includes(keyword)) {
        targets.push(keyword);
      }
    }

    return targets.slice(0, 5); // 最多返回5个
  }

  /**
   * 提取情感原因
   */
  private extractReasons(text: string, polarity: 'positive' | 'negative' | 'neutral'): string[] {
    const reasons: string[] = [];

    // 简单的关键词匹配
    const reasonPatterns = [
      { pattern: /质量(好|优秀|差|糟糕)/, reason: '质量问题' },
      { pattern: /价格(便宜|实惠|贵|高昂)/, reason: '价格问题' },
      { pattern: /服务(好|周到|差|态度差)/, reason: '服务问题' },
      { pattern: /物流(快|及时|慢|延误)/, reason: '物流问题' },
      { pattern: /包装(完好|精美|破损|简陋)/, reason: '包装问题' },
      { pattern: /设计(美观|时尚|丑|过时)/, reason: '设计问题' },
      { pattern: /性能(强大|流畅|差|卡顿)/, reason: '性能问题' },
      { pattern: /功能(丰富|齐全|少|缺失)/, reason: '功能问题' },
    ];

    for (const { pattern, reason } of reasonPatterns) {
      if (pattern.test(text)) {
        reasons.push(reason);
      }
    }

    return reasons.slice(0, 3); // 最多返回3个
  }

  /**
   * 分组请求
   */
  private groupRequests(requests: SentimentAnalysisRequest[]): Map<string, SentimentAnalysisRequest[]> {
    const groups = new Map<string, SentimentAnalysisRequest[]>();

    for (const request of requests) {
      // 使用行业和平台作为分组键
      const groupKey = `${request.industry || 'generic'}-${request.platform || 'unknown'}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }

      groups.get(groupKey)!.push(request);
    }

    return groups;
  }

  /**
   * 按时间间隔分组
   */
  private groupByTimeInterval(
    texts: Array<{ text: string; timestamp: Date }>,
    interval: 'hour' | 'day' | 'week' | 'month'
  ): Map<string, Array<{ text: string; timestamp: Date }>> {
    const groups = new Map<string, Array<{ text: string; timestamp: Date }>>();

    for (const item of texts) {
      const timeLabel = this.getTimeLabel(item.timestamp, interval);

      if (!groups.has(timeLabel)) {
        groups.set(timeLabel, []);
      }

      groups.get(timeLabel)!.push(item);
    }

    return groups;
  }

  /**
   * 获取时间标签
   */
  private getTimeLabel(timestamp: Date, interval: 'hour' | 'day' | 'week' | 'month'): string {
    const date = new Date(timestamp);

    switch (interval) {
      case 'hour':
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`;
      case 'day':
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      case 'week':
        // 简化：返回年份和周数
        const weekNumber = Math.floor(date.getDate() / 7) + 1;
        return `${date.getFullYear()}-W${weekNumber}`;
      case 'month':
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      default:
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }
  }

  /**
   * 解析时间标签
   */
  private parseTimeLabel(timeLabel: string, interval: 'hour' | 'day' | 'week' | 'month'): Date {
    try {
      switch (interval) {
        case 'hour':
          return new Date(timeLabel.replace(' ', 'T') + ':00');
        case 'day':
          return new Date(timeLabel + 'T00:00:00');
        case 'week':
          // 简化：假设是第一周的第一天
          const [year, week] = timeLabel.split('-W');
          return new Date(`${year}-01-01T00:00:00`);
        case 'month':
          return new Date(`${timeLabel}-01T00:00:00`);
        default:
          return new Date(timeLabel + 'T00:00:00');
      }
    } catch (error) {
      this.logger.warn(`无法解析时间标签 ${timeLabel}: ${error.message}`);
      return new Date();
    }
  }

  /**
   * 计算趋势方向
   */
  private calculateTrendDirection(trendPoints: any[]): 'rising' | 'falling' | 'stable' {
    if (trendPoints.length < 2) {
      return 'stable';
    }

    // 使用线性回归判断趋势
    const n = trendPoints.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      const x = i;
      const y = trendPoints[i].averageScore;

      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    if (slope > 0.01) {
      return 'rising';
    } else if (slope < -0.01) {
      return 'falling';
    } else {
      return 'stable';
    }
  }

  /**
   * 计算趋势幅度
   */
  private calculateTrendMagnitude(trendPoints: any[]): number {
    if (trendPoints.length < 2) {
      return 0;
    }

    // 计算分数变化的幅度
    let totalChange = 0;
    for (let i = 1; i < trendPoints.length; i++) {
      totalChange += Math.abs(trendPoints[i].averageScore - trendPoints[i - 1].averageScore);
    }

    // 归一化到0-1
    const avgChange = totalChange / (trendPoints.length - 1);
    return Math.min(1, avgChange * 2); // 假设平均变化0.5对应幅度1
  }

  /**
   * 检测关键事件点
   */
  private detectKeyEvents(trendPoints: any[]): Array<{
    timestamp: Date;
    scoreChange: number;
    description: string;
  }> {
    const keyEvents: Array<{
      timestamp: Date;
      scoreChange: number;
      description: string;
    }> = [];

    if (trendPoints.length < 2) {
      return keyEvents;
    }

    // 检测显著变化点（变化超过阈值）
    const threshold = 0.3; // 分数变化阈值

    for (let i = 1; i < trendPoints.length; i++) {
      const prevScore = trendPoints[i - 1].averageScore;
      const currScore = trendPoints[i].averageScore;
      const scoreChange = currScore - prevScore;
      const absChange = Math.abs(scoreChange);

      if (absChange > threshold) {
        const direction = scoreChange > 0 ? '上升' : '下降';
        const magnitude = Math.round(absChange * 100);

        keyEvents.push({
          timestamp: trendPoints[i].timestamp,
          scoreChange,
          description: `情感分数显著${direction} ${magnitude}%`,
        });
      }
    }

    return keyEvents;
  }

  /**
   * 检查单个规则
   */
  private checkRule(rule: SentimentAlertRule, results: SentimentResult[]): SentimentAlert | null {
    const { condition } = rule;

    // 根据时间窗口过滤结果
    let filteredResults = results;
    if (condition.timeWindow) {
      const windowStart = new Date(Date.now() - condition.timeWindow * 60 * 1000);
      filteredResults = results.filter(r => r.analyzedAt >= windowStart);
    }

    // 检查最小样本数
    if (condition.minSamples && filteredResults.length < condition.minSamples) {
      return null;
    }

    // 计算指标值
    let metricValue: number;

    switch (condition.metric) {
      case 'negative_ratio':
        const negativeCount = filteredResults.filter(r => r.polarity === 'negative').length;
        metricValue = filteredResults.length > 0 ? negativeCount / filteredResults.length : 0;
        break;

      case 'average_score':
        const totalScore = filteredResults.reduce((sum, r) => sum + r.score, 0);
        metricValue = filteredResults.length > 0 ? totalScore / filteredResults.length : 0;
        break;

      case 'volume_spike':
        // 简化：返回样本数量
        metricValue = filteredResults.length;
        break;

      default:
        this.logger.warn(`未知的预警指标: ${condition.metric}`);
        return null;
    }

    // 检查条件
    const shouldAlert = this.evaluateCondition(metricValue, condition.operator, condition.threshold);

    if (shouldAlert) {
      // 收集相关文本示例
      const examples = filteredResults
        .slice(0, 3)
        .map(r => r.text.substring(0, 50) + '...');

      // 计算情感分布
      const positiveCount = filteredResults.filter(r => r.polarity === 'positive').length;
      const negativeCount = filteredResults.filter(r => r.polarity === 'negative').length;
      const neutralCount = filteredResults.filter(r => r.polarity === 'neutral').length;

      const alert: SentimentAlert = {
        id: `${rule.id}-${Date.now()}`,
        ruleId: rule.id,
        severity: rule.severity,
        triggeredAt: new Date(),
        data: {
          currentValue: metricValue,
          threshold: condition.threshold,
          timeWindow: condition.timeWindow,
          sampleCount: filteredResults.length,
          examples,
          sentimentDistribution: {
            positive: positiveCount,
            negative: negativeCount,
            neutral: neutralCount,
          },
        },
        status: 'active',
      };

      this.logger.warn(`触发预警: ${rule.name}, 指标值: ${metricValue}, 阈值: ${condition.threshold}`);
      return alert;
    }

    return null;
  }

  /**
   * 评估条件
   */
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>':
        return value > threshold;
      case '<':
        return value < threshold;
      case '>=':
        return value >= threshold;
      case '<=':
        return value <= threshold;
      case '==':
        return Math.abs(value - threshold) < 0.001; // 浮点数比较
      default:
        this.logger.warn(`未知的操作符: ${operator}`);
        return false;
    }
  }

  /**
   * 获取所有提供商健康状态
   */
  async getProvidersHealth(): Promise<Record<string, { healthy: boolean; message?: string }>> {
    const healthResults: Record<string, { healthy: boolean; message?: string }> = {};

    for (const [name, provider] of this.providers) {
      try {
        const health = await provider.healthCheck();
        healthResults[name] = health;
      } catch (error) {
        healthResults[name] = {
          healthy: false,
          message: `健康检查异常: ${error.message}`,
        };
      }
    }

    return healthResults;
  }
}