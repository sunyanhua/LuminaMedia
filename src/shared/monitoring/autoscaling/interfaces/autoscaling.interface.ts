/**
 * 自动扩缩容系统接口定义
 */

/**
 * 扩缩容指标类型
 */
export enum ScalingMetricType {
  RESOURCE = 'resource',      // 资源指标（CPU、内存）
  POD = 'pod',                // Pod指标（自定义Pod指标）
  OBJECT = 'object',          // 对象指标（外部系统指标）
  BUSINESS = 'business',      // 业务指标（请求数、用户数等）
}

/**
 * 扩缩容指标定义
 */
export interface ScalingMetric {
  /** 指标名称 */
  name: string;
  /** 指标类型 */
  type: ScalingMetricType;
  /** 描述 */
  description: string;
  /** 目标值类型 */
  targetType: 'Utilization' | 'AverageValue' | 'Value';
  /** 目标值（百分比或绝对值） */
  targetValue: number;
  /** 指标来源 */
  source?: {
    /** 指标来源类型: resource, pods, external */
    type: string;
    /** 资源名称（如cpu, memory） */
    resourceName?: string;
    /** 指标选择器 */
    selector?: Record<string, string>;
  };
}

/**
 * 扩缩容行为配置
 */
export interface ScalingBehavior {
  /** 扩容行为 */
  scaleUp?: {
    /** 策略: 按数量扩容、按百分比扩容 */
    policies: ScalingPolicy[];
    /** 稳定窗口（秒） */
    stabilizationWindowSeconds?: number;
    /** 选择策略 */
    selectPolicy?: 'Max' | 'Min' | 'Disabled';
  };
  /** 缩容行为 */
  scaleDown?: {
    /** 策略: 按数量缩容、按百分比缩容 */
    policies: ScalingPolicy[];
    /** 稳定窗口（秒） */
    stabilizationWindowSeconds?: number;
    /** 选择策略 */
    selectPolicy?: 'Max' | 'Min' | 'Disabled';
  };
}

/**
 * 扩缩容策略
 */
export interface ScalingPolicy {
  /** 策略类型: Pods, Percent */
  type: 'Pods' | 'Percent';
  /** 值 */
  value: number;
  /** 周期（秒） */
  periodSeconds: number;
}

/**
 * 扩缩容规则
 */
export interface ScalingRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 目标部署 */
  targetDeployment: {
    /** 部署名称 */
    name: string;
    /** 命名空间 */
    namespace: string;
    /** API版本 */
    apiVersion: string;
    /** 类型 */
    kind: string;
  };
  /** 最小副本数 */
  minReplicas: number;
  /** 最大副本数 */
  maxReplicas: number;
  /** 指标列表 */
  metrics: ScalingMetric[];
  /** 行为配置 */
  behavior?: ScalingBehavior;
  /** 是否启用 */
  enabled: boolean;
  /** 最后评估时间 */
  lastEvaluatedAt?: Date;
  /** 当前副本数 */
  currentReplicas?: number;
  /** 期望副本数 */
  desiredReplicas?: number;
}

/**
 * 扩缩容事件类型
 */
export enum ScalingEventType {
  SCALE_UP = 'scale_up',        // 扩容
  SCALE_DOWN = 'scale_down',    // 缩容
  NO_SCALE = 'no_scale',        // 无需扩缩容
  ERROR = 'error',              // 错误
}

/**
 * 扩缩容事件
 */
export interface ScalingEvent {
  /** 事件ID */
  id: string;
  /** 规则ID */
  ruleId: string;
  /** 事件类型 */
  type: ScalingEventType;
  /** 事件时间 */
  timestamp: Date;
  /** 当前副本数 */
  currentReplicas: number;
  /** 期望副本数 */
  desiredReplicas: number;
  /** 指标值 */
  metricValues: Array<{
    metric: string;
    currentValue: number;
    targetValue: number;
  }>;
  /** 原因 */
  reason: string;
  /** 消息 */
  message: string;
  /** 是否成功 */
  successful: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 扩缩容决策
 */
export interface ScalingDecision {
  /** 规则ID */
  ruleId: string;
  /** 评估时间 */
  timestamp: Date;
  /** 当前副本数 */
  currentReplicas: number;
  /** 计算出的副本数 */
  calculatedReplicas: number;
  /** 最终决策副本数（考虑min/max限制） */
  finalReplicas: number;
  /** 指标评估结果 */
  metricEvaluations: Array<{
    metric: ScalingMetric;
    currentValue: number;
    targetValue: number;
    calculatedReplicas: number;
  }>;
  /** 是否需要扩缩容 */
  needsScaling: boolean;
  /** 扩缩容方向: up, down, none */
  direction: 'up' | 'down' | 'none';
  /** 扩缩容数量 */
  scaleAmount: number;
}

/**
 * 预定义扩缩容指标
 */
export const PREDEFINED_SCALING_METRICS: ScalingMetric[] = [
  {
    name: 'cpu_utilization',
    type: ScalingMetricType.RESOURCE,
    description: 'CPU利用率',
    targetType: 'Utilization',
    targetValue: 70, // 70%利用率
    source: {
      type: 'resource',
      resourceName: 'cpu',
    },
  },
  {
    name: 'memory_utilization',
    type: ScalingMetricType.RESOURCE,
    description: '内存利用率',
    targetType: 'Utilization',
    targetValue: 80, // 80%利用率
    source: {
      type: 'resource',
      resourceName: 'memory',
    },
  },
  {
    name: 'http_requests_per_second',
    type: ScalingMetricType.POD,
    description: '每秒HTTP请求数',
    targetType: 'AverageValue',
    targetValue: 100, // 每秒100个请求
    source: {
      type: 'pods',
      selector: { metric: 'http_requests_total' },
    },
  },
  {
    name: 'active_users',
    type: ScalingMetricType.BUSINESS,
    description: '活跃用户数',
    targetType: 'AverageValue',
    targetValue: 1000, // 每副本1000活跃用户
    source: {
      type: 'external',
    },
  },
  {
    name: 'queue_length',
    type: ScalingMetricType.BUSINESS,
    description: '任务队列长度',
    targetType: 'AverageValue',
    targetValue: 100, // 每副本100个队列任务
    source: {
      type: 'external',
    },
  },
];

/**
 * 预定义扩缩容规则
 */
export const PREDEFINED_SCALING_RULES: ScalingRule[] = [
  {
    id: 'backend-autoscaling',
    name: '后端服务自动扩缩容',
    targetDeployment: {
      name: 'lumina-backend',
      namespace: 'default',
      apiVersion: 'apps/v1',
      kind: 'Deployment',
    },
    minReplicas: 2,
    maxReplicas: 10,
    metrics: [
      {
        name: 'cpu_utilization',
        type: ScalingMetricType.RESOURCE,
        description: 'CPU利用率',
        targetType: 'Utilization',
        targetValue: 70,
        source: {
          type: 'resource',
          resourceName: 'cpu',
        },
      },
      {
        name: 'http_requests_per_second',
        type: ScalingMetricType.POD,
        description: '每秒HTTP请求数',
        targetType: 'AverageValue',
        targetValue: 100,
        source: {
          type: 'pods',
          selector: { metric: 'http_requests_total' },
        },
      },
    ],
    behavior: {
      scaleUp: {
        policies: [
          { type: 'Pods', value: 2, periodSeconds: 60 },
          { type: 'Percent', value: 100, periodSeconds: 60 },
        ],
        stabilizationWindowSeconds: 0,
        selectPolicy: 'Max',
      },
      scaleDown: {
        policies: [
          { type: 'Pods', value: 1, periodSeconds: 300 },
          { type: 'Percent', value: 50, periodSeconds: 300 },
        ],
        stabilizationWindowSeconds: 300,
        selectPolicy: 'Max',
      },
    },
    enabled: true,
  },
  {
    id: 'dashboard-autoscaling',
    name: '前端仪表板自动扩缩容',
    targetDeployment: {
      name: 'lumina-dashboard',
      namespace: 'default',
      apiVersion: 'apps/v1',
      kind: 'Deployment',
    },
    minReplicas: 1,
    maxReplicas: 5,
    metrics: [
      {
        name: 'cpu_utilization',
        type: ScalingMetricType.RESOURCE,
        description: 'CPU利用率',
        targetType: 'Utilization',
        targetValue: 70,
        source: {
          type: 'resource',
          resourceName: 'cpu',
        },
      },
      {
        name: 'active_users',
        type: ScalingMetricType.BUSINESS,
        description: '活跃用户数',
        targetType: 'AverageValue',
        targetValue: 500,
        source: {
          type: 'external',
        },
      },
    ],
    enabled: true,
  },
];

/**
 * 扩缩容提供商接口
 */
export interface ScalingProvider {
  /**
   * 提供商名称
   */
  getName(): string;

  /**
   * 检查提供商是否可用
   */
  isAvailable(): Promise<boolean>;

  /**
   * 获取当前副本数
   */
  getCurrentReplicas(deployment: {
    name: string;
    namespace: string;
    apiVersion: string;
    kind: string;
  }): Promise<number>;

  /**
   * 调整副本数
   */
  scaleDeployment(
    deployment: {
      name: string;
      namespace: string;
      apiVersion: string;
      kind: string;
    },
    replicas: number,
  ): Promise<boolean>;

  /**
   * 获取指标值
   */
  getMetricValue(metric: ScalingMetric): Promise<number>;

  /**
   * 获取部署状态
   */
  getDeploymentStatus(deployment: {
    name: string;
    namespace: string;
    apiVersion: string;
    kind: string;
  }): Promise<{
    availableReplicas: number;
    readyReplicas: number;
    updatedReplicas: number;
    conditions: Array<{
      type: string;
      status: string;
      reason?: string;
      message?: string;
    }>;
  }>;
}

/**
 * 扩缩容决策引擎接口
 */
export interface ScalingDecisionEngine {
  /**
   * 评估扩缩容规则
   */
  evaluateRule(rule: ScalingRule): Promise<ScalingDecision>;

  /**
   * 执行扩缩容决策
   */
  executeDecision(decision: ScalingDecision): Promise<ScalingEvent>;

  /**
   * 获取所有规则的最新决策
   */
  getRecentDecisions(ruleId?: string, limit?: number): Promise<ScalingDecision[]>;

  /**
   * 获取所有事件
   */
  getRecentEvents(ruleId?: string, limit?: number): Promise<ScalingEvent[]>;
}