/**
 * 告警规则类型
 */
export enum AlertRuleType {
  THRESHOLD = 'threshold',      // 阈值告警
  ANOMALY = 'anomaly',          // 异常检测
  ABSENCE = 'absence',          // 数据缺失
  COMPOSITE = 'composite',      // 复合规则
}

/**
 * 告警严重级别
 */
export enum AlertSeverity {
  INFO = 'info',          // 信息
  WARNING = 'warning',    // 警告
  ERROR = 'error',        // 错误
  CRITICAL = 'critical',  // 严重
}

/**
 * 告警规则条件
 */
export interface AlertCondition {
  /** 指标名称 */
  metric: string;
  /** 操作符: >, <, >=, <=, ==, != */
  operator: string;
  /** 阈值 */
  threshold: number;
  /** 时间窗口（秒） */
  timeWindow?: number;
  /** 聚合函数: avg, sum, min, max, count */
  aggregation?: string;
}

/**
 * 告警规则
 */
export interface AlertRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 规则描述 */
  description: string;
  /** 规则类型 */
  type: AlertRuleType;
  /** 条件列表 */
  conditions: AlertCondition[];
  /** 严重级别 */
  severity: AlertSeverity;
  /** 是否启用 */
  enabled: boolean;
  /** 静默期（秒） */
  silencePeriod?: number;
  /** 最后触发时间 */
  lastTriggeredAt?: Date;
  /** 触发次数 */
  triggerCount?: number;
}

/**
 * 告警实例
 */
export interface AlertInstance {
  /** 告警ID */
  id: string;
  /** 规则ID */
  ruleId: string;
  /** 规则名称 */
  ruleName: string;
  /** 严重级别 */
  severity: AlertSeverity;
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 触发时间 */
  triggeredAt: Date;
  /** 指标值 */
  metricValue: number;
  /** 阈值 */
  threshold: number;
  /** 恢复时间（如果已恢复） */
  recoveredAt?: Date;
  /** 是否已恢复 */
  recovered: boolean;
  /** 额外数据 */
  extraData?: Record<string, any>;
}

/**
 * 告警渠道类型
 */
export enum AlertChannelType {
  EMAIL = 'email',
  DINGTALK = 'dingtalk',
  WECHAT = 'wechat',
  SLACK = 'slack',
  SMS = 'sms',
  WEBHOOK = 'webhook',
  DASHBOARD = 'dashboard',
  CONSOLE = 'console',
}

/**
 * 告警渠道配置
 */
export interface AlertChannel {
  /** 渠道ID */
  id: string;
  /** 渠道类型 */
  type: AlertChannelType;
  /** 渠道名称 */
  name: string;
  /** 配置数据 */
  config: Record<string, any>;
  /** 是否启用 */
  enabled: boolean;
}

/**
 * 告警通知
 */
export interface AlertNotification {
  /** 通知ID */
  id: string;
  /** 告警实例ID */
  alertId: string;
  /** 渠道ID */
  channelId: string;
  /** 发送时间 */
  sentAt: Date;
  /** 发送状态 */
  status: 'pending' | 'sent' | 'failed';
  /** 错误信息 */
  errorMessage?: string;
}

/**
 * 预定义告警规则
 */
export const PREDEFINED_ALERT_RULES: AlertRule[] = [
  {
    id: 'high_response_time',
    name: '高响应时间告警',
    description: 'API响应时间P99超过2秒',
    type: AlertRuleType.THRESHOLD,
    conditions: [
      {
        metric: 'http_request_duration_ms',
        operator: '>',
        threshold: 2000,
        timeWindow: 300, // 5分钟
        aggregation: 'p99',
      },
    ],
    severity: AlertSeverity.WARNING,
    enabled: true,
    silencePeriod: 300, // 5分钟
  },
  {
    id: 'high_error_rate',
    name: '高错误率告警',
    description: 'API错误率超过5%',
    type: AlertRuleType.THRESHOLD,
    conditions: [
      {
        metric: 'http_errors_total',
        operator: '>',
        threshold: 0.05,
        timeWindow: 300,
        aggregation: 'rate',
      },
    ],
    severity: AlertSeverity.ERROR,
    enabled: true,
    silencePeriod: 300,
  },
  {
    id: 'low_throughput',
    name: '低吞吐量告警',
    description: '每分钟请求数低于100',
    type: AlertRuleType.THRESHOLD,
    conditions: [
      {
        metric: 'http_requests_total',
        operator: '<',
        threshold: 100,
        timeWindow: 60,
        aggregation: 'rate',
      },
    ],
    severity: AlertSeverity.INFO,
    enabled: true,
    silencePeriod: 300,
  },
  {
    id: 'database_slow_query',
    name: '数据库慢查询告警',
    description: '数据库查询耗时超过1秒',
    type: AlertRuleType.THRESHOLD,
    conditions: [
      {
        metric: 'database_query_duration_ms',
        operator: '>',
        threshold: 1000,
        timeWindow: 300,
        aggregation: 'p95',
      },
    ],
    severity: AlertSeverity.WARNING,
    enabled: true,
    silencePeriod: 300,
  },
  {
    id: 'ai_service_degradation',
    name: 'AI服务降级告警',
    description: 'AI请求成功率低于90%',
    type: AlertRuleType.THRESHOLD,
    conditions: [
      {
        metric: 'ai_requests_total',
        operator: '<',
        threshold: 0.9,
        timeWindow: 300,
        aggregation: 'success_rate',
      },
    ],
    severity: AlertSeverity.ERROR,
    enabled: true,
    silencePeriod: 300,
  },
];