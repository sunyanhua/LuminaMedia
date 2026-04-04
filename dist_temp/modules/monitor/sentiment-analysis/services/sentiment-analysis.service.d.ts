import { ISentimentAnalysisService, SentimentAnalysisRequest, SentimentResult, SentimentTrendAnalysis, SentimentAlertRule, SentimentAlert, ISentimentAnalysisProvider } from '../interfaces/sentiment-analysis.interface';
export declare class SentimentAnalysisService implements ISentimentAnalysisService {
    private readonly logger;
    private providers;
    private defaultProvider;
    constructor(providers?: ISentimentAnalysisProvider[]);
    registerProvider(provider: ISentimentAnalysisProvider): void;
    registerProviders(providers: ISentimentAnalysisProvider[]): void;
    setDefaultProvider(providerName: string): void;
    private getProvider;
    analyzeText(request: SentimentAnalysisRequest): Promise<SentimentResult>;
    analyzeTexts(requests: SentimentAnalysisRequest[]): Promise<SentimentResult[]>;
    analyzeTrend(texts: Array<{
        text: string;
        timestamp: Date;
    }>, options?: {
        timeInterval?: 'hour' | 'day' | 'week' | 'month';
        industry?: string;
    }): Promise<SentimentTrendAnalysis>;
    checkAlerts(texts: Array<{
        text: string;
        timestamp: Date;
    }>, rules: SentimentAlertRule[]): Promise<SentimentAlert[]>;
    private selectProvider;
    private extractTargets;
    private extractReasons;
    private groupRequests;
    private groupByTimeInterval;
    private getTimeLabel;
    private parseTimeLabel;
    private calculateTrendDirection;
    private calculateTrendMagnitude;
    private detectKeyEvents;
    private checkRule;
    private evaluateCondition;
    getProvidersHealth(): Promise<Record<string, {
        healthy: boolean;
        message?: string;
    }>>;
}
