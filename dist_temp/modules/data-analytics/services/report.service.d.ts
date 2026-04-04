import { UserBehaviorRepository } from '../../../shared/repositories/user-behavior.repository';
import { MarketingCampaignRepository } from '../../../shared/repositories/marketing-campaign.repository';
import { MarketingStrategyRepository } from '../../../shared/repositories/marketing-strategy.repository';
export interface ReportData {
    summary: {
        totalUsers?: number;
        totalCampaigns: number;
        totalStrategies: number;
        totalBehaviors: number;
        timeRange: {
            start: Date;
            end: Date;
        };
    };
    metrics: {
        engagementRate: number;
        campaignCompletionRate: number;
        averageStrategyConfidence: number;
        averageROI: number;
    };
    charts: {
        dailyActivity: Array<{
            date: string;
            count: number;
        }>;
        eventDistribution: Array<{
            event: string;
            count: number;
        }>;
        campaignStatus: Array<{
            status: string;
            count: number;
        }>;
        strategyTypes: Array<{
            type: string;
            count: number;
        }>;
    };
    recommendations: string[];
}
export declare class ReportService {
    private userBehaviorRepository;
    private campaignRepository;
    private strategyRepository;
    constructor(userBehaviorRepository: UserBehaviorRepository, campaignRepository: MarketingCampaignRepository, strategyRepository: MarketingStrategyRepository);
    generateBehaviorReport(userId: string): Promise<ReportData>;
    generateCampaignReport(campaignId: string): Promise<ReportData>;
    exportReport(reportId: string, format?: 'json' | 'pdf'): Promise<any>;
    private buildReportData;
    private calculateDailyActivity;
    private calculateEventDistribution;
    private calculateCampaignStatus;
    private calculateStrategyTypes;
    private calculateEngagementRate;
    private calculateCampaignCompletionRate;
    private calculateAverageStrategyConfidence;
    private calculateAverageROI;
    private generateRecommendations;
}
