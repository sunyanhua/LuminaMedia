import { Repository } from 'typeorm';
import { TenantQuota } from '../../../entities/tenant-quota.entity';
import { QuotaQueryDto } from '../dto/quota.dto';
export declare class QuotaService {
    private tenantQuotaRepository;
    constructor(tenantQuotaRepository: Repository<TenantQuota>);
    checkQuota(tenantId: string, featureKey: string): Promise<{
        hasQuota: boolean;
        remaining: number;
    }>;
    consumeQuota(tenantId: string, featureKey: string): Promise<boolean>;
    getQuotaInfo(tenantId: string, featureKey: string): Promise<{
        usedCount: number;
        maxCount: number;
        remaining: number;
        resetTime?: Date;
    }>;
    resetQuota(tenantId: string, featureKey: string): Promise<void>;
    resetQuotasForTenant(tenantId: string): Promise<void>;
    setQuota(tenantId: string, featureKey: string, maxCount: number, quotaPeriod?: 'daily' | 'weekly' | 'monthly'): Promise<TenantQuota>;
    getOrCreateQuotaRecord(tenantId: string, featureKey: string): Promise<TenantQuota>;
    private maybeResetQuota;
    private calculateNextResetTime;
    getQuotas(query: QuotaQueryDto): Promise<{
        data: TenantQuota[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getAllQuotas(): Promise<TenantQuota[]>;
    getTenantQuotaUsage(tenantId: string): Promise<Array<{
        featureKey: string;
        usedCount: number;
        maxCount: number;
        remaining: number;
        quotaPeriod: 'daily' | 'weekly' | 'monthly';
        resetTime?: Date;
    }>>;
    getFeatureQuotas(featureKey: string): Promise<TenantQuota[]>;
    deleteQuota(tenantId: string, featureKey: string): Promise<void>;
}
