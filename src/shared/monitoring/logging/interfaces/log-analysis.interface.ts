/**
 * 日志分析结果接口
 */
export interface LogAnalysisResult {
  /** 时间范围 */
  timeRange: {
    from: string;
    to: string;
  };

  /** 日志统计 */
  statistics: {
    totalLogs: number;
    byLevel: Record<string, number>;
    byModule: Record<string, number>;
    byStatus: Record<string, number>;
    errors: number;
    warnings: number;
  };

  /** 趋势数据 */
  trends: {
    hourly: Array<{
      hour: string;
      count: number;
      errors: number;
    }>;
    daily: Array<{
      day: string;
      count: number;
      errors: number;
    }>;
  };

  /** 错误分析 */
  errorAnalysis: {
    topErrors: Array<{
      errorCode: string;
      errorMessage: string;
      count: number;
      lastOccurred: string;
    }>;
    errorRate: number;
  };

  /** 性能分析 */
  performanceAnalysis: {
    averageDuration: number;
    p95Duration: number;
    p99Duration: number;
    slowOperations: Array<{
      module: string;
      action: string;
      averageDuration: number;
      count: number;
    }>;
  };

  /** 建议 */
  recommendations: Array<{
    type: 'error' | 'performance' | 'security' | 'usage';
    priority: 'high' | 'medium' | 'low';
    description: string;
    suggestion: string;
  }>;
}

/**
 * 日志查询选项
 */
export interface LogQueryOptions {
  /** 时间范围 */
  from?: string;
  to?: string;

  /** 过滤条件 */
  filters?: {
    level?: string | string[];
    module?: string | string[];
    status?: string | string[];
    userId?: string;
    tenantId?: string;
    errorCode?: string;
  };

  /** 分页 */
  pagination?: {
    page: number;
    pageSize: number;
  };

  /** 排序 */
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };

  /** 聚合选项 */
  aggregations?: string[];
}

/**
 * 日志告警规则
 */
export interface LogAlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  condition: LogAlertCondition;
  actions: LogAlertAction[];
  notificationChannels: string[];
  cooldownPeriod: number; // 冷却时间（分钟）
  lastTriggered?: string;
}

/**
 * 日志告警条件
 */
export interface LogAlertCondition {
  type: 'threshold' | 'pattern' | 'anomaly' | 'absence';
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'neq' | 'contains' | 'regex';
  value: any;
  window: string; // 时间窗口，如 "5m", "1h", "1d"
  occurrences: number; // 触发所需发生次数
}

/**
 * 日志告警动作
 */
export interface LogAlertAction {
  type: 'notification' | 'webhook' | 'script' | 'log';
  target: string;
  parameters: Record<string, any>;
}
