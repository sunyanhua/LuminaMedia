import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * 租户守卫
 * 检查请求中是否包含有效的租户ID
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // 从请求头或用户信息中获取租户ID
    const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;

    if (!tenantId) {
      return false;
    }

    // 将租户ID附加到请求对象
    request.tenantId = tenantId;

    return true;
  }
}
