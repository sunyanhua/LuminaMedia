import { PlatformType, CollectionMethod, CollectedDataItem } from '../../interfaces/data-collection.interface';

/**
 * 平台采集器接口
 * 所有平台采集器必须实现此接口
 */
export interface PlatformCollector {
  /**
   * 获取平台类型
   */
  getPlatform(): PlatformType;

  /**
   * 获取支持的采集方法
   */
  getSupportedMethods(): CollectionMethod[];

  /**
   * 验证凭证
   */
  validateCredentials(credentials: any): Promise<boolean>;

  /**
   * 执行数据采集
   */
  collect(data: {
    credentials: any;
    config: any;
  }): Promise<CollectedDataItem[]>;

  /**
   * 测试连接
   */
  testConnection(credentials: any): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }>;

  /**
   * 获取API使用统计（如果适用）
   */
  getApiUsage?(credentials: any): Promise<{
    dailyLimit: number;
    remaining: number;
    resetAt: Date;
  }>;
}

/**
 * 采集器配置
 */
export interface CollectorConfig {
  /**
   * 是否启用
   */
  enabled: boolean;

  /**
   * 采集频率（分钟）
   */
  frequency: number;

  /**
   * 每次采集最大结果数
   */
  maxResultsPerRun: number;

  /**
   * 是否使用代理
   */
  useProxy: boolean;

  /**
   * 代理区域
   */
  proxyRegion?: string;

  /**
   * 合规级别
   */
  complianceLevel: 'strict' | 'moderate' | 'flexible';
}