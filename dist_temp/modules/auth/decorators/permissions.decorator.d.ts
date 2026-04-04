import { RequiredPermission } from '../guards/permissions.guard';
export declare const Permissions: (...permissions: RequiredPermission[]) => import("@nestjs/common").CustomDecorator<string>;
