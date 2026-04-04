import { MarketingStrategyService } from '../services/marketing-strategy.service';
import { ContentGenerationService } from '../services/content-generation.service';
import { GenerateStrategyDto } from '../dto/generate-strategy.dto';
import { GenerateStrategyContentDto } from '../dto/generate-strategy-content.dto';
import { Platform } from '../../../shared/enums/platform.enum';
export declare class MarketingStrategyController {
    private readonly marketingStrategyService;
    private readonly contentGenerationService;
    constructor(marketingStrategyService: MarketingStrategyService, contentGenerationService: ContentGenerationService);
    generateStrategy(generateStrategyDto: GenerateStrategyDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/marketing-strategy.entity").MarketingStrategy;
        insights: any;
        aiGenerated: boolean;
        isTruncated: boolean;
    }>;
    getStrategies(userId: string): Promise<import("../entities/marketing-strategy.entity").MarketingStrategy[]>;
    getCampaignStrategies(campaignId: string): Promise<{
        success: boolean;
        data: {
            campaignId: string;
            strategies: import("../entities/marketing-strategy.entity").MarketingStrategy[];
            summary: string;
        };
    }>;
    evaluateStrategy(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            strategy: import("../entities/marketing-strategy.entity").MarketingStrategy;
            evaluation: {
                feasibilityScore: number;
                expectedImpact: string;
                risks: string[];
                recommendations: string[];
            };
        };
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getRecommendedStrategies(userId: string): Promise<{
        success: boolean;
        data: {
            userId: string;
            recommendations: import("../entities/marketing-strategy.entity").MarketingStrategy[];
            summary: string;
        };
    }>;
    private generateStrategyInsights;
    private generateCampaignStrategySummary;
    private generateRecommendationsSummary;
    generateStrategyContent(id: string, generateStrategyContentDto: GenerateStrategyContentDto): Promise<{
        success: boolean;
        error: {
            code: string;
            message: string;
            details?: any;
        };
        message?: undefined;
        data?: undefined;
        processingTime?: undefined;
        modelUsed?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            strategyId: string;
            generatedContent: import("../interfaces/content-generation.interface").MarketingContent | undefined;
            contentPlatforms: Platform[];
        };
        processingTime: number | undefined;
        modelUsed: string | undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        message?: undefined;
        data?: undefined;
        processingTime?: undefined;
        modelUsed?: undefined;
    }>;
}
