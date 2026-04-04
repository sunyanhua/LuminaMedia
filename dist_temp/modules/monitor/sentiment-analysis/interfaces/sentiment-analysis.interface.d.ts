export interface SentimentResult {
    polarity: 'positive' | 'negative' | 'neutral';
    intensity: number;
    score: number;
    confidence: number;
    targets?: string[];
    reasons?: string[];
    text: string;
    analyzedAt: Date;
}
export interface SentimentAnalysisRequest {
    text: string;
    platform?: string;
    industry?: string;
    target?: string;
}
export interface SentimentTrendPoint {
    timestamp: Date;
    averageScore: number;
    positiveRatio: number;
    negativeRatio: number;
    neutralRatio: number;
    sampleCount: number;
}
export interface SentimentTrendAnalysis {
    period: {
        start: Date;
        end: Date;
    };
    trends: SentimentTrendPoint[];
    overallSentiment: {
        positive: number;
        negative: number;
        neutral: number;
        total: number;
    };
    trendDirection: 'rising' | 'falling' | 'stable';
    trendMagnitude: number;
    keyEvents?: Array<{
        timestamp: Date;
        scoreChange: number;
        description: string;
    }>;
}
export interface SentimentAlertRule {
    id: string;
    name: string;
    condition: {
        metric: 'negative_ratio' | 'average_score' | 'volume_spike';
        operator: string;
        threshold: number;
        timeWindow?: number;
        minSamples?: number;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    channels: string[];
    enabled: boolean;
}
export interface SentimentAlert {
    id: string;
    ruleId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    triggeredAt: Date;
    data: {
        currentValue: number;
        threshold: number;
        timeWindow?: number;
        sampleCount?: number;
        examples?: string[];
        sentimentDistribution?: {
            positive: number;
            negative: number;
            neutral: number;
        };
    };
    status: 'active' | 'acknowledged' | 'resolved';
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    resolvedBy?: string;
    resolvedAt?: Date;
    resolutionNotes?: string;
}
export interface ISentimentAnalysisService {
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
}
export interface ISentimentAnalysisProvider {
    readonly name: string;
    analyze(text: string, options?: any): Promise<{
        polarity: 'positive' | 'negative' | 'neutral';
        score: number;
        confidence: number;
        intensity?: number;
        targets?: string[];
        reasons?: string[];
    }>;
    analyzeBatch(texts: string[], options?: any): Promise<any[]>;
    healthCheck(): Promise<{
        healthy: boolean;
        message?: string;
    }>;
}
