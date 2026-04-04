import { UserBehaviorRepository } from '../../../shared/repositories/user-behavior.repository';
import { MarketingCampaignRepository } from '../../../shared/repositories/marketing-campaign.repository';
import { MarketingStrategyRepository } from '../../../shared/repositories/marketing-strategy.repository';
export declare class MockDataService {
    private userBehaviorRepository;
    private campaignRepository;
    private strategyRepository;
    constructor(userBehaviorRepository: UserBehaviorRepository, campaignRepository: MarketingCampaignRepository, strategyRepository: MarketingStrategyRepository);
    generateMockData(userId: string): Promise<{
        behaviors: number;
        campaigns: number;
        strategies: number;
    }>;
    private generateMockCampaigns;
    private generateMockBehaviors;
    private generateMockStrategies;
    resetMockData(userId?: string): Promise<{
        deleted: number;
    }>;
    getMockDataStatus(): Promise<{
        totalBehaviors: number;
        totalCampaigns: number;
        totalStrategies: number;
    }>;
}
