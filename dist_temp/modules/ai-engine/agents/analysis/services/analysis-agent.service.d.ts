import { ConfigService } from '@nestjs/config';
import { GeminiService } from '../../../../data-analytics/services/gemini.service';
import { QwenService } from '../../../../data-analytics/services/qwen.service';
import { AnalysisAgentInput, AnalysisAgentOutput } from '../interfaces/analysis-agent.interface';
export declare class AnalysisAgentService {
    private readonly configService;
    private readonly geminiService;
    private readonly qwenService;
    private readonly logger;
    private readonly defaultAiEngine;
    constructor(configService: ConfigService, geminiService: GeminiService, qwenService: QwenService);
    execute(input: AnalysisAgentInput): Promise<AnalysisAgentOutput>;
    private buildAnalysisPrompt;
    private summarizeCustomerProfiles;
    private countDistribution;
    private formatDistribution;
    private generateAnalysisWithAI;
    private parseAnalysisResponse;
    private enrichWithDataInsights;
    private generateFallbackAnalysis;
}
