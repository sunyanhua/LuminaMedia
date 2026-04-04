import { ConfigService } from '@nestjs/config';
import { VectorSearchService } from '../../../../../shared/vector/services/vector-search.service';
export declare class KnowledgeRetrievalService {
    private configService;
    private vectorSearchService;
    private readonly logger;
    private readonly embeddingsCache;
    private readonly knowledgeBase;
    constructor(configService: ConfigService, vectorSearchService: VectorSearchService);
    private initializeKnowledgeBase;
    retrieveRelevantKnowledge(query: string, industry: string, limit?: number): Promise<string[]>;
    private getMockKnowledge;
    private getFallbackKnowledge;
    generateAnalysisWithKnowledge(query: string, industry: string, baseAnalysis: string): Promise<string>;
    private buildEnhancedPrompt;
    evaluateRelevance(knowledge: string, query: string, industry: string): Promise<number>;
    generateEmbedding(text: string): Promise<number[]>;
    private cosineSimilarity;
    retrieveByVector(query: string, industry: string, limit?: number): Promise<string[]>;
    private fallbackVectorRetrieval;
    private manageContextWindow;
    recordFeedback(query: string, retrievedKnowledge: string[], feedback: {
        relevanceScores?: number[];
        clickedIndex?: number;
        searchSatisfaction?: number;
    }): Promise<void>;
    private retrieveByKeywords;
    batchRetrieve(queries: string[], industry: string, limitPerQuery?: number): Promise<Record<string, string[]>>;
}
