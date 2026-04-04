import { ConfigService } from '@nestjs/config';
import { GeminiService } from '../../../../data-analytics/services/gemini.service';
import { QwenService } from '../../../../data-analytics/services/qwen.service';
import { StrategyAgentInput, StrategyAgentOutput } from '../interfaces/strategy-agent.interface';
export declare class StrategyAgentService {
    private readonly configService;
    private readonly geminiService;
    private readonly qwenService;
    private readonly logger;
    private readonly defaultAiEngine;
    constructor(configService: ConfigService, geminiService: GeminiService, qwenService: QwenService);
    execute(input: StrategyAgentInput): Promise<StrategyAgentOutput>;
    private buildStrategyPrompt;
    private extractIndustryContext;
    private determineScenario;
    private determineCampaignType;
    private generateStrategyWithAI;
    private parseStrategyResponse;
    private adjustStrategyWithConstraints;
    private generateFallbackStrategy;
}
