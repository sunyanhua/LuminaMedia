/**
 * 指标数据类型
 */
export interface MetricValue {
  /** 指标名称 */
  name: string;
  /** 指标值 */
  value: number;
  /** 时间戳 */
  timestamp: Date;
  /** 标签 */
  tags?: Record<string, string>;
  /** 指标类型 */
  type: MetricType;
}

/**
 * 指标类型
 */
export enum MetricType {
  COUNTER = 'counter', // 计数器（只增不减）
  GAUGE = 'gauge', // 仪表盘（可增可减）
  HISTOGRAM = 'histogram', // 直方图
  SUMMARY = 'summary', // 摘要
}

/**
 * 业务指标定义
 */
export interface BusinessMetric {
  /** 指标名称 */
  name: string;
  /** 描述 */
  description: string;
  /** 指标类型 */
  type: MetricType;
  /** 默认标签 */
  defaultTags?: Record<string, string>;
  /** 聚合窗口（秒） */
  aggregationWindow?: number;
}

/**
 * 指标收集器接口
 */
export interface MetricsCollector {
  /**
   * 记录指标
   */
  record(metric: MetricValue): Promise<void>;

  /**
   * 记录业务指标
   */
  recordBusinessMetric(
    name: string,
    value: number,
    tags?: Record<string, string>,
  ): Promise<void>;

  /**
   * 获取指标值
   */
  getMetric(
    name: string,
    tags?: Record<string, string>,
  ): Promise<MetricValue | null>;

  /**
   * 获取指标时间序列
   */
  getTimeSeries(
    name: string,
    startTime: Date,
    endTime: Date,
    tags?: Record<string, string>,
  ): Promise<MetricValue[]>;

  /**
   * 获取所有指标定义
   */
  getMetrics(): BusinessMetric[];
}

/**
 * 预定义业务指标
 */
export const PREDEFINED_METRICS: BusinessMetric[] = [
  {
    name: 'http_requests_total',
    description: 'HTTP请求总数',
    type: MetricType.COUNTER,
    defaultTags: { protocol: 'http' },
  },
  {
    name: 'http_request_duration_ms',
    description: 'HTTP请求耗时（毫秒）',
    type: MetricType.HISTOGRAM,
    defaultTags: { protocol: 'http' },
  },
  {
    name: 'http_errors_total',
    description: 'HTTP错误总数',
    type: MetricType.COUNTER,
    defaultTags: { protocol: 'http' },
  },
  {
    name: 'database_queries_total',
    description: '数据库查询总数',
    type: MetricType.COUNTER,
    defaultTags: { type: 'query' },
  },
  {
    name: 'database_query_duration_ms',
    description: '数据库查询耗时（毫秒）',
    type: MetricType.HISTOGRAM,
    defaultTags: { type: 'query' },
  },
  {
    name: 'active_users',
    description: '活跃用户数',
    type: MetricType.GAUGE,
    defaultTags: {},
  },
  {
    name: 'content_published_total',
    description: '内容发布总数',
    type: MetricType.COUNTER,
    defaultTags: {},
  },
  {
    name: 'ai_requests_total',
    description: 'AI请求总数',
    type: MetricType.COUNTER,
    defaultTags: { provider: 'gemini' },
  },
  {
    name: 'ai_request_duration_ms',
    description: 'AI请求耗时（毫秒）',
    type: MetricType.HISTOGRAM,
    defaultTags: { provider: 'gemini' },
  },
  {
    name: 'queue_length',
    description: '任务队列长度',
    type: MetricType.GAUGE,
    defaultTags: { queue: 'publish' },
  },
];
