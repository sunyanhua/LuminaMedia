import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VectorSearchService, Document, SearchFilters, SearchResult, HybridSearchOptions, CollectionStats, HealthStatus } from '../interfaces/vector-search.interface';
export declare class QdrantAdapter implements VectorSearchService, OnModuleInit {
    private configService;
    private readonly logger;
    private client;
    private defaultCollectionName;
    private vectorDimension;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initialize;
    private ensureCollectionExists;
    addDocument(doc: Document): Promise<string>;
    addDocuments(docs: Document[]): Promise<string[]>;
    searchSimilar(query: string, k?: number, filters?: SearchFilters): Promise<SearchResult[]>;
    hybridSearch(query: string, options: HybridSearchOptions): Promise<SearchResult[]>;
    updateDocument(docId: string, content: string): Promise<void>;
    deleteDocument(docId: string): Promise<void>;
    getDocument(docId: string): Promise<Document | null>;
    clearCollection(collectionName?: string): Promise<void>;
    getCollectionStats(collectionName?: string): Promise<CollectionStats>;
    healthCheck(): Promise<HealthStatus>;
    searchByVector(queryVector: number[], k?: number, filters?: SearchFilters): Promise<SearchResult[]>;
}
