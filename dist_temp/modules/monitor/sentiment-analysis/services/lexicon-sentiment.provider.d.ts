import { ISentimentAnalysisProvider } from '../interfaces/sentiment-analysis.interface';
export interface SentimentLexiconConfig {
    positiveWords: Set<string>;
    negativeWords: Set<string>;
    negationWords: Set<string>;
    intensityWords: Map<string, number>;
    industryWords?: Map<string, {
        sentiment: 'positive' | 'negative';
        weight: number;
    }>;
    targetWords?: Set<string>;
}
export declare class LexiconSentimentProvider implements ISentimentAnalysisProvider {
    private readonly logger;
    readonly name = "lexicon";
    private lexicons;
    private defaultLexicon;
    constructor();
    private initializeDefaultLexicon;
    private initializeIndustryLexicons;
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
    private getLexiconForIndustry;
    private tokenizeChinese;
    private analyzeTokens;
    private isSentimentWord;
    addCustomLexicon(industry: string, config: Partial<SentimentLexiconConfig>): void;
}
