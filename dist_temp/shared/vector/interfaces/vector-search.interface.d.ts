export interface VectorSearchService {
    addDocument(doc: Document): Promise<string>;
    addDocuments(docs: Document[]): Promise<string[]>;
    searchSimilar(query: string, k: number, filters?: SearchFilters): Promise<SearchResult[]>;
    hybridSearch(query: string, options: HybridSearchOptions): Promise<SearchResult[]>;
    updateDocument(docId: string, content: string): Promise<void>;
    deleteDocument(docId: string): Promise<void>;
    getDocument(docId: string): Promise<Document | null>;
    clearCollection(collectionName?: string): Promise<void>;
    getCollectionStats(collectionName?: string): Promise<CollectionStats>;
    healthCheck(): Promise<HealthStatus>;
}
export interface Document {
    id?: string;
    content: string;
    embedding?: number[];
    metadata: DocumentMetadata;
    tenantId?: string;
    industry?: string;
    source?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface DocumentMetadata {
    title?: string;
    author?: string;
    sourceType?: 'file' | 'web' | 'api' | 'manual';
    sourceUrl?: string;
    language?: string;
    tags?: string[];
    category?: string;
    pageCount?: number;
    fileSize?: number;
    [key: string]: any;
}
export interface SearchFilters {
    tenantId?: string;
    industry?: string;
    source?: string;
    tags?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    minSimilarity?: number;
    metadataFilters?: Record<string, any>;
}
export interface SearchResult {
    document: Document;
    similarity: number;
    score?: number;
}
export interface HybridSearchOptions {
    k?: number;
    filters?: SearchFilters;
    vectorWeight?: number;
    keywordWeight?: number;
    useReranking?: boolean;
}
export interface CollectionStats {
    collectionName: string;
    documentCount: number;
    vectorDimension: number;
    storageSize: number;
    indexed: boolean;
    lastIndexedAt?: Date;
}
export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    details?: {
        version?: string;
        uptime?: number;
        memoryUsage?: NodeJS.MemoryUsage;
        [key: string]: any;
    };
}
