/**
 * APM服务接口定义
 */
export interface ApmService {
  /**
   * 启动APM代理
   */
  start(): Promise<void>;

  /**
   * 停止APM代理
   */
  stop(): Promise<void>;

  /**
   * 记录自定义追踪
   * @param operation 操作名称
   * @param tags 标签
   * @param logs 日志
   */
  createCustomTrace(operation: string, tags?: Record<string, any>, logs?: Record<string, any>): void;

  /**
   * 记录错误
   * @param error 错误对象
   * @param context 上下文信息
   */
  recordError(error: Error, context?: Record<string, any>): void;

  /**
   * 记录业务指标
   * @param name 指标名称
   * @param value 指标值
   * @param tags 标签
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void;
}

/**
 * APM配置接口
 */
export interface ApmConfig {
  /** 服务名称 */
  serviceName: string;
  /** 服务实例名称 */
  serviceInstance: string;
  /** SkyWalking OAP服务器地址 */
  oapServer: string;
  /** 采样率 (0-1) */
  sampleRate?: number;
  /** 是否启用 */
  enabled: boolean;
}