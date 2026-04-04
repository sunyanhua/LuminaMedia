import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
export declare const PERMISSIONS_KEY = "permissions";
export interface RequiredPermission {
    module: string;
    action: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                email: string;
                tenantId: string;
                permissions?: Array<{
                    module: string;
                    action: string;
                }>;
                roles?: Array<{
                    name: string;
                }>;
            };
        }
    }
}
export declare class PermissionsGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
