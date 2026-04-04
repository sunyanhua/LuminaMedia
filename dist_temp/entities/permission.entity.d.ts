import { Role } from './role.entity';
export declare class Permission {
    id: string;
    module: string;
    action: string;
    description: string;
    tenantId: string;
    createdAt: Date;
    roles: Role[];
}
