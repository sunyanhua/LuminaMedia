/**
 * 模块服务接口
 * 定义模块间通信的基础契约
 */
export interface IModuleService {
  /**
   * 初始化模块
   */
  initialize(): Promise<void>;

  /**
   * 获取模块名称
   */
  getModuleName(): string;

  /**
   * 获取模块版本
   */
  getModuleVersion(): string;

  /**
   * 检查模块健康状态
   */
  healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: Record<string, any>;
  }>;

  /**
   * 获取模块依赖的其他模块
   */
  getDependencies(): string[];

  /**
   * 清理模块资源
   */
  cleanup(): Promise<void>;
}
