export declare class CreateQuotaDto {
    tenantId: string;
    featureKey: string;
    maxCount: number;
    quotaPeriod?: 'daily' | 'weekly' | 'monthly';
}
export declare class UpdateQuotaDto {
    maxCount?: number;
    quotaPeriod?: 'daily' | 'weekly' | 'monthly';
}
export declare class ResetQuotaDto {
    tenantId?: string;
    featureKey?: string;
}
export declare class QuotaQueryDto {
    tenantId?: string;
    featureKey?: string;
    quotaPeriod?: 'daily' | 'weekly' | 'monthly';
    page?: number;
    pageSize?: number;
}
