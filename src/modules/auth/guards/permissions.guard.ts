import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import type { Request } from 'express';

export const PERMISSIONS_KEY = 'permissions';

export interface RequiredPermission {
  module: string;
  action: string;
}

interface UserWithPermissions {
  permissions?: Array<{ module: string; action: string }>;
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
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      RequiredPermission[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const user: UserWithPermissions = request.user as UserWithPermissions;

    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      return false;
    }

    const userPermissions = user.permissions.map((perm) => ({
      module: perm.module,
      action: perm.action,
    }));

    return requiredPermissions.every((requiredPerm) =>
      userPermissions.some(
        (userPerm) =>
          userPerm.module === requiredPerm.module &&
          userPerm.action === requiredPerm.action,
      ),
    );
  }
}
