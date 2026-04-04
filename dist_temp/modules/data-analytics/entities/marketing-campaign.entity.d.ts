import { User } from '../../../entities/user.entity';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { CampaignType } from '../../../shared/enums/campaign-type.enum';
import { CampaignStatus } from '../../../shared/enums/campaign-status.enum';
import { MarketingStrategy } from './marketing-strategy.entity';
import { TenantEntity } from '../../../shared/interfaces/tenant-entity.interface';
export declare class MarketingCampaign implements TenantEntity {
    id: string;
    userId: string;
    user: User;
    customerProfileId: string;
    customerProfile: CustomerProfile;
    tenantId: string;
    name: string;
    campaignType: CampaignType;
    targetAudience: Record<string, any>;
    budget: number;
    status: CampaignStatus;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    strategies: MarketingStrategy[];
}
