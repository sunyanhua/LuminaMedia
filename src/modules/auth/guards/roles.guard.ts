import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import type { Request } from 'express';

export const ROLES_KEY = 'roles';

interface UserWithRoles {
  roles?: Array<{ name: string }>;
}

// Extend Express Request type globally
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        tenantId: string;
        permissions?: Array<{ module: string; action: string }>;
        roles?: Array<{ name: string }>;
      };
    }
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const user: UserWithRoles = request.user as UserWithRoles;

    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return false;
    }

    const userRoles = user.roles.map((role) => role.name);
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
