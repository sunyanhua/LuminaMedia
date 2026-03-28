import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TenantContextService } from '../../../shared/services/tenant-context.service';

export interface TenantRequest extends Request {
  tenantId?: string;
}

interface JwtPayload {
  sub: string;
  username?: string;
  email?: string;
  tenantId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: TenantRequest, res: Response, next: NextFunction) {
    // 1. 尝试从JWT令牌获取tenantId（已认证用户）
    const authHeader = (req as Request).headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = this.jwtService.verify<JwtPayload>(token);
        if (payload.tenantId) {
          req.tenantId = payload.tenantId;
        }
      } catch (_error) {
        // 令牌无效，忽略
      }
    }

    // 2. 尝试从请求头获取（用于服务间调用或未认证请求）
    if (!req.tenantId && (req as Request).headers['x-tenant-id']) {
      req.tenantId = (req as Request).headers['x-tenant-id'] as string;
    }

    // 3. 默认租户（如果都没有）
    if (!req.tenantId) {
      req.tenantId = 'default-tenant';
    }

    // 4. 设置AsyncLocalStorage上下文
    TenantContextService.runWithContext({ tenantId: req.tenantId }, () => {
      next();
    });
  }
}
