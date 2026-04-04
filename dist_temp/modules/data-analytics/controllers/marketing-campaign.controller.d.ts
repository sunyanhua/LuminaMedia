import { MarketingCampaign } from '../entities/marketing-campaign.entity';
import { AnalyticsService } from '../services/analytics.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { CampaignStatus } from '../../../shared/enums/campaign-status.enum';
import { MarketingCampaignRepository } from '../../../shared/repositories/marketing-campaign.repository';
export declare class MarketingCampaignController {
    private campaignRepository;
    private readonly analyticsService;
    constructor(campaignRepository: MarketingCampaignRepository, analyticsService: AnalyticsService);
    createCampaign(createCampaignDto: CreateCampaignDto): Promise<{
        success: boolean;
        message: string;
        data: MarketingCampaign;
    }>;
    getCampaigns(userId?: string, status?: CampaignStatus, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            campaigns: MarketingCampaign[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getCampaign(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: MarketingCampaign;
        message?: undefined;
    }>;
    updateCampaign(id: string, updateData: Partial<MarketingCampaign>): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: MarketingCampaign;
    }>;
    analyzeCampaign(id: string): Promise<{
        success: boolean;
        message: string;
        data: import("../interfaces/behavior-analytics.interface").CampaignInsights;
        recommendations: string[];
    } | {
        success: boolean;
        message: any;
        data?: undefined;
        recommendations?: undefined;
    }>;
    private generateRecommendations;
}
