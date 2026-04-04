import { ConfigService } from '@nestjs/config';
import { QdrantAdapter } from '../adapters/qdrant.adapter';
import { VectorSearchService as IVectorSearchService, Document, SearchFilters, SearchResult, HybridSearchOptions, CollectionStats, HealthStatus } from '../interfaces/vector-search.interface';
export declare class VectorSearchService implements IVectorSearchService {
    private configService;
    private qdrantAdapter;
    private readonly logger;
    private readonly embeddingCache;
    constructor(configService: ConfigService, qdrantAdapter: QdrantAdapter);
    generateEmbedding(text: string): Promise<number[]>;
    addDocument(doc: Document): Promise<string>;
    addDocuments(docs: Document[]): Promise<string[]>;
    searchSimilar(query: string, k?: number, filters?: SearchFilters): Promise<SearchResult[]>;
    hybridSearch(query: string, options: HybridSearchOptions): Promise<SearchResult[]>;
    private searchByKeywords;
    private mergeAndRankResults;
    updateDocument(docId: string, content: string): Promise<void>;
    deleteDocument(docId: string): Promise<void>;
    getDocument(docId: string): Promise<Document | null>;
    clearCollection(collectionName?: string): Promise<void>;
    getCollectionStats(collectionName?: string): Promise<CollectionStats>;
    healthCheck(): Promise<HealthStatus>;
    private cosineSimilarity;
}
