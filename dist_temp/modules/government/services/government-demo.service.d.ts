import { Repository } from 'typeorm';
import { GovernmentContent } from '../../../entities/government-content.entity';
import { SocialInteraction } from '../../../entities/social-interaction.entity';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { MarketingCampaignRepository } from '../../../shared/repositories/marketing-campaign.repository';
import { MarketingStrategyRepository } from '../../../shared/repositories/marketing-strategy.repository';
import { ContentDraft } from '../../../entities/content-draft.entity';
export declare class GovernmentDemoService {
    private governmentContentRepository;
    private socialInteractionRepository;
    private customerProfileRepository;
    private marketingCampaignRepository;
    private marketingStrategyRepository;
    private contentDraftRepository;
    constructor(governmentContentRepository: Repository<GovernmentContent>, socialInteractionRepository: Repository<SocialInteraction>, customerProfileRepository: Repository<CustomerProfile>, marketingCampaignRepository: MarketingCampaignRepository, marketingStrategyRepository: MarketingStrategyRepository, contentDraftRepository: Repository<ContentDraft>);
    generateGovernmentDemoData(tenantId: string): Promise<void>;
    clearGovernmentDemoData(tenantId: string): Promise<void>;
    private generateGovernmentContent;
    private generateSocialMonitoringData;
    private generateGeographicAnalysisData;
    private generateGovernmentCustomerProfiles;
    private generateRandomGovernmentComment;
    getGovernmentDemoStats(tenantId: string): Promise<{
        governmentContents: number;
        socialInteractions: number;
        customerProfiles: number;
        geographicAnalyses: number;
    }>;
}
