import { ConfigService } from '@nestjs/config';
import { MarketingStrategy } from '../entities/marketing-strategy.entity';
import { StrategyType } from '../../../shared/enums/strategy-type.enum';
import { GenerationMethod } from '../../../shared/enums/generation-method.enum';
import { GeminiService } from './gemini.service';
import { QwenService } from './qwen.service';
import { MarketingCampaignRepository } from '../../../shared/repositories/marketing-campaign.repository';
import { MarketingStrategyRepository } from '../../../shared/repositories/marketing-strategy.repository';
export declare class MarketingStrategyService {
    private campaignRepository;
    private strategyRepository;
    private readonly configService;
    private readonly geminiService;
    private readonly qwenService;
    private readonly logger;
    constructor(campaignRepository: MarketingCampaignRepository, strategyRepository: MarketingStrategyRepository, configService: ConfigService, geminiService: GeminiService, qwenService: QwenService);
    generateStrategy(campaignId: string, strategyType?: StrategyType, generatedBy?: GenerationMethod, useGemini?: boolean): Promise<{
        strategy: MarketingStrategy;
        isTruncated: boolean;
    }>;
    private getCampaignInsights;
    private generateFallbackStrategy;
    private createStrategyFromGeminiResponse;
    private createStrategyFromAIResponse;
    private calculateConfidenceScore;
    private generateImplementationPlan;
    evaluateStrategy(strategyId: string): Promise<{
        strategy: MarketingStrategy;
        evaluation: {
            feasibilityScore: number;
            expectedImpact: string;
            risks: string[];
            recommendations: string[];
        };
    }>;
    getRecommendedStrategies(userId: string): Promise<MarketingStrategy[]>;
    getCampaignStrategies(campaignId: string): Promise<MarketingStrategy[]>;
    getStrategies(userId: string): Promise<MarketingStrategy[]>;
    getStrategyById(id: string): Promise<MarketingStrategy | null>;
}
