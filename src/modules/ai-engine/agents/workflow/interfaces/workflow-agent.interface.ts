import { AnalysisAgentOutput } from '../../analysis/interfaces/analysis-agent.interface';
import { StrategyAgentOutput } from '../../strategy/interfaces/strategy-agent.interface';
import { CopywritingAgentOutput } from '../../copywriting/interfaces/copywriting-agent.interface';

/**
 * Agent工作流引擎输入参数
 */
export interface AgentWorkflowInput {
  /** 客户数据样本 */
  customerData: any[]; // 实际类型应为UserProfile4D[]，但为简化先使用any[]
  /** 行业背景 */
  industryContext: string;
  /** 业务目标 */
  businessGoals: string[];
  /** 预算约束（可选） */
  budgetConstraints?: {
    maxBudget: number;
    currency?: string;
  };
  /** 时间范围（可选） */
  timeline?: {
    startDate: Date;
    endDate: Date;
  };
  /** 平台规格（可选） */
  platformSpecs?: any[];
  /** 品牌指南（可选） */
  brandGuidelines?: any;
  /** 禁忌词列表（可选） */
  forbiddenWords?: string[];
}

/**
 * Agent工作流引擎输出结果
 */
export interface AgentWorkflowOutput {
  /** 分析阶段结果 */
  analysis: AnalysisAgentOutput;
  /** 策划阶段结果 */
  strategy: StrategyAgentOutput;
  /** 文案阶段结果 */
  copywriting: CopywritingAgentOutput;
  /** 工作流执行状态 */
  workflowStatus: {
    /** 执行是否成功 */
    success: boolean;
    /** 总耗时（毫秒） */
    totalDuration: number;
    /** 各阶段耗时 */
    stageDurations: {
      analysis: number;
      strategy: number;
      copywriting: number;
    };
    /** 错误信息（如果有） */
    error?: string;
  };
  /** 工作流执行ID（用于追踪） */
  executionId: string;
  /** 时间戳 */
  timestamp: Date;
}

/**
 * 工作流执行状态
 */
export enum WorkflowExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

/**
 * 工作流步骤状态
 */
export interface WorkflowStepStatus {
  stepName: string;
  status: WorkflowExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
  input?: any;
  output?: any;
}

/**
 * 工作流审计日志项
 */
export interface WorkflowAuditLog {
  executionId: string;
  timestamp: Date;
  action: string;
  actor: string; // 'system' | 'user' | 'agent'
  details: any;
  stepName?: string;
  previousStatus?: WorkflowExecutionStatus;
  newStatus?: WorkflowExecutionStatus;
}

/**
 * 工作流配置
 */
export interface WorkflowConfig {
  /** 是否启用人工干预 */
  enableHumanIntervention: boolean;
  /** 超时设置（毫秒） */
  timeouts: {
    analysis: number;
    strategy: number;
    copywriting: number;
    total: number;
  };
  /** 重试配置 */
  retry: {
    maxAttempts: number;
    backoffFactor: number;
  };
  /** 日志级别 */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
