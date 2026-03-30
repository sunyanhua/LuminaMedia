/**
 * 结构化日志接口定义
 * 符合任务10.2中定义的结构化日志规范
 */
export interface StructuredLog {
  /** 时间戳 - ISO 8601格式 */
  timestamp: string;

  /** 日志级别 */
  level: 'debug' | 'info' | 'warn' | 'error' | 'verbose';

  /** 服务名称 */
  service: string;

  /** 模块名称 */
  module: string;

  /** 操作动作 */
  action: string;

  /** 用户ID（可选） */
  userId?: string;

  /** 租户ID（可选） */
  tenantId?: string;

  /** 耗时（毫秒，可选） */
  duration?: number;

  /** 状态 */
  status: 'success' | 'failure' | 'partial';

  /** 错误码（可选） */
  errorCode?: string;

  /** 错误信息（可选） */
  errorMessage?: string;

  /** 请求ID */
  requestId: string;

  /** 额外信息（可选） */
  extra?: Record<string, any>;

  /** 环境信息 */
  environment: string;

  /** 主机信息 */
  hostname?: string;

  /** 应用版本 */
  version?: string;
}
