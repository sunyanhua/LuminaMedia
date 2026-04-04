import { UserBehaviorRepository } from '../../../shared/repositories/user-behavior.repository';
import { MarketingCampaignRepository } from '../../../shared/repositories/marketing-campaign.repository';
import { MarketingStrategyRepository } from '../../../shared/repositories/marketing-strategy.repository';
import { DateRange } from '../interfaces/date-range.interface';
import { BehaviorAnalytics, EngagementMetrics, CampaignInsights } from '../interfaces/behavior-analytics.interface';
export declare class AnalyticsService {
    private userBehaviorRepository;
    private campaignRepository;
    private strategyRepository;
    constructor(userBehaviorRepository: UserBehaviorRepository, campaignRepository: MarketingCampaignRepository, strategyRepository: MarketingStrategyRepository);
    analyzeUserBehavior(userId: string, dateRange: DateRange): Promise<BehaviorAnalytics>;
    generateCampaignInsights(campaignId: string): Promise<CampaignInsights>;
    calculateEngagementMetrics(userId: string): Promise<EngagementMetrics>;
    private calculateSessionDurations;
}
