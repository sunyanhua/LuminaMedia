import { User } from './user.entity';
export declare enum TenantStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    PENDING = "pending"
}
export declare enum TenantType {
    BUSINESS = "business",
    GOVERNMENT = "government",
    DEMO_BUSINESS = "demo_business",
    DEMO_GOVERNMENT = "demo_government"
}
export declare class Tenant {
    id: string;
    name: string;
    tenantType: TenantType;
    status: TenantStatus;
    createdAt: Date;
    updatedAt: Date;
    users: User[];
}
