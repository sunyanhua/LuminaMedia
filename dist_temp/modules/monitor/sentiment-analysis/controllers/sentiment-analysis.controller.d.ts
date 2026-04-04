import { SentimentAnalysisService } from '../services/sentiment-analysis.service';
import { SentimentAnalysisRequest, SentimentResult, SentimentTrendAnalysis, SentimentAlertRule, SentimentAlert } from '../interfaces/sentiment-analysis.interface';
declare class SentimentAnalysisRequestDto implements SentimentAnalysisRequest {
    text: string;
    platform?: string;
    industry?: string;
    target?: string;
}
declare class BatchSentimentAnalysisRequestDto {
    requests: SentimentAnalysisRequestDto[];
}
declare class SentimentTrendRequestDto {
    texts: Array<{
        text: string;
        timestamp: string;
    }>;
    timeInterval?: 'hour' | 'day' | 'week' | 'month';
    industry?: string;
}
declare class AlertCheckRequestDto {
    texts: Array<{
        text: string;
        timestamp: string;
    }>;
    rules: SentimentAlertRule[];
}
export declare class SentimentAnalysisController {
    private readonly sentimentService;
    constructor(sentimentService: SentimentAnalysisService);
    analyzeText(request: SentimentAnalysisRequestDto): Promise<SentimentResult>;
    analyzeTexts(request: BatchSentimentAnalysisRequestDto): Promise<SentimentResult[]>;
    analyzeTrend(request: SentimentTrendRequestDto): Promise<SentimentTrendAnalysis>;
    checkAlerts(request: AlertCheckRequestDto): Promise<SentimentAlert[]>;
    healthCheck(): Promise<{
        status: string;
        providers: any;
    }>;
    getProviders(): Promise<{
        providers: string[];
    }>;
    testAnalysis(request: SentimentAnalysisRequestDto): Promise<{
        success: boolean;
        result?: SentimentResult;
        error?: string;
    }>;
}
export {};
