/**
 * 报告类型
 */
export enum ReportType {
  DAILY = 'daily', // 日报
  WEEKLY = 'weekly', // 周报
  MONTHLY = 'monthly', // 月报
  PERFORMANCE = 'performance', // 性能报告
  SECURITY = 'security', // 安全报告
  BUSINESS = 'business', // 业务报告
}

/**
 * 报告状态
 */
export enum ReportStatus {
  PENDING = 'pending', // 待生成
  GENERATING = 'generating', // 生成中
  COMPLETED = 'completed', // 已完成
  FAILED = 'failed', // 失败
}

/**
 * 报告格式
 */
export enum ReportFormat {
  HTML = 'html',
  PDF = 'pdf',
  JSON = 'json',
  CSV = 'csv',
  MARKDOWN = 'markdown',
}

/**
 * 性能指标分析
 */
export interface PerformanceMetrics {
  /** 响应时间P95（毫秒） */
  responseTimeP95: number;
  /** 响应时间P99（毫秒） */
  responseTimeP99: number;
  /** 平均响应时间（毫秒） */
  responseTimeAvg: number;
  /** 请求成功率 */
  successRate: number;
  /** 错误率 */
  errorRate: number;
  /** 吞吐量（请求/秒） */
  throughput: number;
  /** 并发用户数 */
  concurrentUsers: number;
  /** CPU使用率 */
  cpuUsage: number;
  /** 内存使用率 */
  memoryUsage: number;
}

/**
 * 业务指标分析
 */
export interface BusinessMetrics {
  /** 活跃用户数 */
  activeUsers: number;
  /** 新用户数 */
  newUsers: number;
  /** 内容发布数 */
  contentPublished: number;
  /** AI请求数 */
  aiRequests: number;
  /** 数据库查询数 */
  databaseQueries: number;
  /** 发布成功率 */
  publishSuccessRate: number;
  /** 用户满意度评分 */
  userSatisfaction?: number;
}

/**
 * 报告内容
 */
export interface ReportContent {
  /** 报告标题 */
  title: string;
  /** 报告摘要 */
  summary: string;
  /** 报告时间段 */
  period: {
    start: Date;
    end: Date;
  };
  /** 性能指标 */
  performance: PerformanceMetrics;
  /** 业务指标 */
  business: BusinessMetrics;
  /** 告警统计 */
  alerts: {
    total: number;
    bySeverity: Record<string, number>;
    topRules: Array<{ ruleId: string; count: number }>;
  };
  /** 问题识别 */
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
    impact: string;
  }>;
  /** 趋势分析 */
  trends: Array<{
    metric: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  }>;
  /** 建议 */
  recommendations: string[];
  /** 原始数据 */
  rawData?: Record<string, any>;
}

/**
 * 报告定义
 */
export interface ReportDefinition {
  /** 报告ID */
  id: string;
  /** 报告名称 */
  name: string;
  /** 报告类型 */
  type: ReportType;
  /** 报告描述 */
  description: string;
  /** 生成周期（cron表达式） */
  schedule?: string;
  /** 报告格式 */
  format: ReportFormat[];
  /** 接收人 */
  recipients?: string[];
  /** 是否启用 */
  enabled: boolean;
  /** 保留天数 */
  retentionDays?: number;
  /** 模板路径 */
  templatePath?: string;
}

/**
 * 报告实例
 */
export interface ReportInstance {
  /** 实例ID */
  id: string;
  /** 报告定义ID */
  definitionId: string;
  /** 报告名称 */
  name: string;
  /** 报告类型 */
  type: ReportType;
  /** 报告状态 */
  status: ReportStatus;
  /** 报告格式 */
  format: ReportFormat;
  /** 报告内容 */
  content?: ReportContent;
  /** 生成开始时间 */
  generationStartedAt?: Date;
  /** 生成完成时间 */
  generationCompletedAt?: Date;
  /** 报告文件路径 */
  filePath?: string;
  /** 文件大小 */
  fileSize?: number;
  /** 错误信息 */
  errorMessage?: string;
  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * 预定义报告
 */
export const PREDEFINED_REPORTS: ReportDefinition[] = [
  {
    id: 'daily_performance',
    name: '每日性能报告',
    type: ReportType.DAILY,
    description: '每日系统性能指标报告',
    schedule: '0 0 * * *', // 每天午夜
    format: [ReportFormat.HTML, ReportFormat.PDF],
    recipients: ['devops@example.com'],
    enabled: true,
    retentionDays: 30,
  },
  {
    id: 'weekly_business',
    name: '每周业务报告',
    type: ReportType.WEEKLY,
    description: '每周业务指标和用户活动报告',
    schedule: '0 0 * * 1', // 每周一午夜
    format: [ReportFormat.HTML, ReportFormat.PDF],
    recipients: ['management@example.com', 'product@example.com'],
    enabled: true,
    retentionDays: 90,
  },
  {
    id: 'monthly_summary',
    name: '月度总结报告',
    type: ReportType.MONTHLY,
    description: '月度系统性能和业务总结报告',
    schedule: '0 0 1 * *', // 每月第一天午夜
    format: [ReportFormat.HTML, ReportFormat.PDF, ReportFormat.JSON],
    recipients: ['executive@example.com', 'devops@example.com'],
    enabled: true,
    retentionDays: 365,
  },
  {
    id: 'performance_health',
    name: '性能健康报告',
    type: ReportType.PERFORMANCE,
    description: '系统性能健康度评估报告',
    schedule: '0 */6 * * *', // 每6小时
    format: [ReportFormat.HTML],
    recipients: ['devops@example.com'],
    enabled: true,
    retentionDays: 7,
  },
];
