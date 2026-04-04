import { Permission } from './permission.entity';
import { UserRole } from './user-role.entity';
export declare class Role {
    id: string;
    name: string;
    description: string;
    tenantId: string;
    createdAt: Date;
    userRoles: UserRole[];
    permissions: Permission[];
}
