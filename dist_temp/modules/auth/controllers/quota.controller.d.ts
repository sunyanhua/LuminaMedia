import { QuotaService } from '../services/quota.service';
import { TenantQuota } from '../../../entities/tenant-quota.entity';
import { CreateQuotaDto, UpdateQuotaDto, ResetQuotaDto, QuotaQueryDto } from '../dto/quota.dto';
export declare class QuotaController {
    private readonly quotaService;
    constructor(quotaService: QuotaService);
    getQuotas(query: QuotaQueryDto): Promise<{
        data: TenantQuota[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getCurrentQuotas(req: any): Promise<Array<{
        featureKey: string;
        usedCount: number;
        maxCount: number;
        remaining: number;
        quotaPeriod: 'daily' | 'weekly' | 'monthly';
        resetTime?: Date;
    }>>;
    getQuotaHistory(tenantId?: string, featureKey?: string): Promise<{
        message: string;
        data: any[];
    }>;
    resetQuota(resetQuotaDto: ResetQuotaDto): Promise<{
        success: boolean;
        message: string;
    }>;
    createQuota(createQuotaDto: CreateQuotaDto): Promise<TenantQuota>;
    updateQuota(tenantId: string, featureKey: string, updateQuotaDto: UpdateQuotaDto): Promise<TenantQuota>;
    deleteQuota(tenantId: string, featureKey: string): Promise<void>;
    getQuotaDetail(tenantId: string, featureKey: string): Promise<{
        usedCount: number;
        maxCount: number;
        remaining: number;
        resetTime?: Date;
        quotaPeriod: 'daily' | 'weekly' | 'monthly';
    }>;
}
