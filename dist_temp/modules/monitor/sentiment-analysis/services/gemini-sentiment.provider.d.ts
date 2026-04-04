import { ConfigService } from '@nestjs/config';
import { ISentimentAnalysisProvider } from '../interfaces/sentiment-analysis.interface';
export declare class GeminiSentimentProvider implements ISentimentAnalysisProvider {
    private configService;
    private readonly logger;
    readonly name = "gemini";
    constructor(configService: ConfigService);
    analyze(text: string, options?: any): Promise<{
        polarity: 'positive' | 'negative' | 'neutral';
        score: number;
        confidence: number;
        intensity?: number;
    }>;
    analyzeBatch(texts: string[], options?: any): Promise<any[]>;
    healthCheck(): Promise<{
        healthy: boolean;
        message?: string;
    }>;
    private buildSentimentPrompt;
    private callGeminiApi;
    private parseGeminiResponse;
    private extractSentimentFromText;
}
