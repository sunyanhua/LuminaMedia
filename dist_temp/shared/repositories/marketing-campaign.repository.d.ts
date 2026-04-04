import { TenantRepository } from './tenant.repository';
import { MarketingCampaign } from '../../modules/data-analytics/entities/marketing-campaign.entity';
import { CampaignStatus } from '../enums/campaign-status.enum';
export declare class MarketingCampaignRepository extends TenantRepository<MarketingCampaign> {
    findByStatus(status: CampaignStatus): Promise<MarketingCampaign[]>;
    findActiveCampaigns(): Promise<MarketingCampaign[]>;
    findByUserAndProfile(userId: string, customerProfileId?: string): Promise<MarketingCampaign[]>;
}
