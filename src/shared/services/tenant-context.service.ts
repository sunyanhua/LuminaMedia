import { Injectable, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
}

@Injectable()
export class TenantContextService {
  private static readonly asyncLocalStorage =
    new AsyncLocalStorage<TenantContext>();

  /**
   * 设置当前请求的租户上下文
   */
  static runWithContext(context: TenantContext, fn: () => void): void {
    this.asyncLocalStorage.run(context, fn);
  }

  /**
   * 获取当前租户ID（实例方法）
   */
  getCurrentTenantId(): string {
    return TenantContextService.getCurrentTenantIdStatic();
  }

  /**
   * 获取当前租户ID（别名方法，兼容旧代码）
   */
  getTenantId(): string {
    return this.getCurrentTenantId();
  }

  /**
   * 获取当前租户ID（静态方法）
   */
  static getCurrentTenantIdStatic(): string {
    const context = this.asyncLocalStorage.getStore();
    if (!context) {
      // 如果没有上下文，返回默认租户（开发环境）
      return 'default-tenant';
    }
    return context.tenantId;
  }

  /**
   * 获取AsyncLocalStorage实例（供中间件使用）
   */
  static get asyncStorage(): AsyncLocalStorage<TenantContext> {
    return this.asyncLocalStorage;
  }
}

export default TenantContextService;
