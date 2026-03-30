/**
 * 情感分析结果
 */
export interface SentimentResult {
  /**
   * 情感极性
   */
  polarity: 'positive' | 'negative' | 'neutral';

  /**
   * 情感强度（0-1，1表示最强）
   */
  intensity: number;

  /**
   * 情感分数（-1到1，-1最负面，1最正面）
   */
  score: number;

  /**
   * 置信度（0-1）
   */
  confidence: number;

  /**
   * 情感对象（如品牌、产品、服务等）
   */
  targets?: string[];

  /**
   * 情感原因（如质量问题、价格问题等）
   */
  reasons?: string[];

  /**
   * 原始文本
   */
  text: string;

  /**
   * 分析时间
   */
  analyzedAt: Date;
}

/**
 * 情感分析请求
 */
export interface SentimentAnalysisRequest {
  /**
   * 待分析文本
   */
  text: string;

  /**
   * 文本来源平台
   */
  platform?: string;

  /**
   * 行业领域（用于定制化分析）
   */
  industry?: string;

  /**
   * 情感对象（可选，用于针对性分析）
   */
  target?: string;
}

/**
 * 情感趋势数据点
 */
export interface SentimentTrendPoint {
  /**
   * 时间点
   */
  timestamp: Date;

  /**
   * 平均情感分数
   */
  averageScore: number;

  /**
   * 正面比例
   */
  positiveRatio: number;

  /**
   * 负面比例
   */
  negativeRatio: number;

  /**
   * 中性比例
   */
  neutralRatio: number;

  /**
   * 样本数量
   */
  sampleCount: number;
}

/**
 * 情感趋势分析结果
 */
export interface SentimentTrendAnalysis {
  /**
   * 趋势时间段
   */
  period: {
    start: Date;
    end: Date;
  };

  /**
   * 趋势数据点
   */
  trends: SentimentTrendPoint[];

  /**
   * 总体情感统计
   */
  overallSentiment: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  };

  /**
   * 情感变化趋势（上升、下降、稳定）
   */
  trendDirection: 'rising' | 'falling' | 'stable';

  /**
   * 变化幅度（0-1）
   */
  trendMagnitude: number;

  /**
   * 关键事件点（情感突变的时间点）
   */
  keyEvents?: Array<{
    timestamp: Date;
    scoreChange: number;
    description: string;
  }>;
}

/**
 * 情感预警规则
 */
export interface SentimentAlertRule {
  /**
   * 规则ID
   */
  id: string;

  /**
   * 规则名称
   */
  name: string;

  /**
   * 触发条件
   */
  condition: {
    /**
     * 指标类型：negative_ratio, average_score, etc.
     */
    metric: 'negative_ratio' | 'average_score' | 'volume_spike';

    /**
     * 操作符：>, <, >=, <=, ==
     */
    operator: string;

    /**
     * 阈值
     */
    threshold: number;

    /**
     * 时间窗口（分钟）
     */
    timeWindow?: number;

    /**
     * 最小样本数
     */
    minSamples?: number;
  };

  /**
   * 预警级别
   */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /**
   * 通知渠道
   */
  channels: string[];

  /**
   * 是否启用
   */
  enabled: boolean;
}

/**
 * 情感预警
 */
export interface SentimentAlert {
  /**
   * 预警ID
   */
  id: string;

  /**
   * 规则ID
   */
  ruleId: string;

  /**
   * 预警级别
   */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /**
   * 触发时间
   */
  triggeredAt: Date;

  /**
   * 相关数据
   */
  data: {
    /**
     * 当前指标值
     */
    currentValue: number;

    /**
     * 阈值
     */
    threshold: number;

    /**
     * 时间窗口
     */
    timeWindow?: number;

    /**
     * 样本数量
     */
    sampleCount?: number;

    /**
     * 相关文本示例
     */
    examples?: string[];

    /**
     * 情感分布
     */
    sentimentDistribution?: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };

  /**
   * 状态
   */
  status: 'active' | 'acknowledged' | 'resolved';

  /**
   * 确认信息
   */
  acknowledgedBy?: string;
  acknowledgedAt?: Date;

  /**
   * 解决信息
   */
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

/**
 * 情感分析服务接口
 */
export interface ISentimentAnalysisService {
  /**
   * 分析单个文本的情感
   */
  analyzeText(request: SentimentAnalysisRequest): Promise<SentimentResult>;

  /**
   * 批量分析文本情感
   */
  analyzeTexts(requests: SentimentAnalysisRequest[]): Promise<SentimentResult[]>;

  /**
   * 分析情感趋势
   */
  analyzeTrend(
    texts: Array<{ text: string; timestamp: Date }>,
    options?: {
      timeInterval?: 'hour' | 'day' | 'week' | 'month';
      industry?: string;
    }
  ): Promise<SentimentTrendAnalysis>;

  /**
   * 检查预警规则
   */
  checkAlerts(
    texts: Array<{ text: string; timestamp: Date }>,
    rules: SentimentAlertRule[]
  ): Promise<SentimentAlert[]>;
}

/**
 * 情感分析提供商接口
 */
export interface ISentimentAnalysisProvider {
  /**
   * 提供商名称
   */
  readonly name: string;

  /**
   * 分析文本情感
   */
  analyze(text: string, options?: any): Promise<{
    polarity: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
    intensity?: number;
    targets?: string[];
    reasons?: string[];
  }>;

  /**
   * 批量分析
   */
  analyzeBatch(texts: string[], options?: any): Promise<any[]>;

  /**
   * 健康检查
   */
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}