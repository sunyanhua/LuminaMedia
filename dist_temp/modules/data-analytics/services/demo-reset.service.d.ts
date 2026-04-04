import { Repository, DataSource } from 'typeorm';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { MarketingCampaign } from '../../../entities/marketing-campaign.entity';
import { MarketingStrategy } from '../../../entities/marketing-strategy.entity';
import { ContentDraft } from '../../../entities/content-draft.entity';
import { GovernmentContent } from '../../../entities/government-content.entity';
import { SocialInteraction } from '../../../entities/social-interaction.entity';
import { Tenant } from '../../../entities/tenant.entity';
export declare class DemoResetService {
    private dataSource;
    private customerProfileRepository;
    private marketingCampaignRepository;
    private marketingStrategyRepository;
    private contentDraftRepository;
    private governmentContentRepository;
    private socialInteractionRepository;
    private tenantRepository;
    constructor(dataSource: DataSource, customerProfileRepository: Repository<CustomerProfile>, marketingCampaignRepository: Repository<MarketingCampaign>, marketingStrategyRepository: Repository<MarketingStrategy>, contentDraftRepository: Repository<ContentDraft>, governmentContentRepository: Repository<GovernmentContent>, socialInteractionRepository: Repository<SocialInteraction>, tenantRepository: Repository<Tenant>);
    resetDemoData(tenantId: string): Promise<void>;
    resetAllDemoData(): Promise<void>;
    isDemoTenant(tenantId: string): Promise<boolean>;
    getDemoDataStats(tenantId: string): Promise<{
        customerProfiles: number;
        marketingCampaigns: number;
        marketingStrategies: number;
        contentDrafts: number;
        governmentContents?: number;
        socialInteractions: number;
        presetDataCount: number;
    }>;
    regeneratePresetData(tenantId: string): Promise<void>;
}
