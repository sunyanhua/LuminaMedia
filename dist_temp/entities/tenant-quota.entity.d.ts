export declare class TenantQuota {
    id: number;
    tenantId: string;
    featureKey: string;
    usedCount: number;
    maxCount: number;
    quotaPeriod: 'daily' | 'weekly' | 'monthly';
    resetTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}
