import { User } from './user.entity';
import { CustomerType } from '../shared/enums/customer-type.enum';
import { Industry } from '../shared/enums/industry.enum';
import { DataImportJob } from './data-import-job.entity';
import { CustomerSegment } from './customer-segment.entity';
import { MarketingCampaign } from '../modules/data-analytics/entities/marketing-campaign.entity';
import { MarketingStrategy } from '../modules/data-analytics/entities/marketing-strategy.entity';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';
export declare class CustomerProfile implements TenantEntity {
    id: string;
    tenantId: string;
    userId: string;
    user: User;
    customerName: string;
    customerType: CustomerType;
    industry: Industry;
    dataSources: Record<string, any>;
    profileData: Record<string, any>;
    behaviorInsights: Record<string, any>;
    isPreset: boolean;
    demoScenario?: string;
    createdAt: Date;
    updatedAt: Date;
    importJobs: DataImportJob[];
    segments: CustomerSegment[];
    campaigns: MarketingCampaign[];
    strategies: MarketingStrategy[];
}
