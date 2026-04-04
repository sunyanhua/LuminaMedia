import { ConfigService } from '@nestjs/config';
import { KnowledgeDocument, DocumentSourceType, DocumentStatus, DocumentProcessingStatus, FileInfo, DocumentMetadata, DocumentQualityScore } from '../../../entities/knowledge-document.entity';
import { KnowledgeDocumentRepository } from '../../../shared/repositories/knowledge-document.repository';
import { VectorSearchService } from '../../../shared/vector/services/vector-search.service';
export interface DocumentImportOptions {
    title?: string;
    category?: string;
    tags?: string[];
    language?: string;
    metadata?: Partial<DocumentMetadata>;
    isPublic?: boolean;
    accessControl?: string[];
}
export interface FileUploadResult {
    originalName: string;
    storagePath: string;
    mimeType: string;
    size: number;
}
export interface UrlCrawlResult {
    url: string;
    title: string;
    content: string;
    metadata: {
        author?: string;
        publishDate?: Date;
        wordCount: number;
        readingTime: number;
        keywords?: string[];
    };
}
export declare class KnowledgeDocumentService {
    private knowledgeDocumentRepository;
    private vectorSearchService;
    private configService;
    private readonly logger;
    constructor(knowledgeDocumentRepository: KnowledgeDocumentRepository, vectorSearchService: VectorSearchService, configService: ConfigService);
    createDocument(data: {
        title: string;
        content: string;
        summary?: string;
        sourceType: DocumentSourceType;
        sourceUrl?: string;
        fileInfo?: FileInfo;
        category?: string;
        tags?: string[];
        language?: string;
        metadata?: DocumentMetadata;
    }, options?: {
        autoVectorize?: boolean;
    }): Promise<KnowledgeDocument>;
    getDocument(documentId: string): Promise<KnowledgeDocument>;
    updateDocument(documentId: string, updates: Partial<{
        title: string;
        content: string;
        summary: string;
        category: string;
        tags: string[];
        language: string;
        metadata: DocumentMetadata;
        status: DocumentStatus;
        isPublic: boolean;
        accessControl: string[];
        processingStatus: DocumentProcessingStatus;
        processingError: string;
        vectorId: string | null;
        vectorizedAt: Date;
        contentHash: string;
        qualityScore: DocumentQualityScore;
    }>): Promise<KnowledgeDocument>;
    deleteDocument(documentId: string): Promise<void>;
    batchDeleteDocuments(documentIds: string[]): Promise<void>;
    searchDocuments(query: string, filters?: {
        category?: string;
        sourceType?: DocumentSourceType;
        status?: DocumentStatus;
        tags?: string[];
        limit?: number;
        offset?: number;
    }): Promise<{
        documents: KnowledgeDocument[];
        total: number;
    }>;
    importFileDocument(file: FileUploadResult, options?: DocumentImportOptions): Promise<KnowledgeDocument>;
    importUrlDocument(url: string, options?: DocumentImportOptions): Promise<KnowledgeDocument>;
    importApiDocument(apiData: {
        title: string;
        content: string;
        metadata?: Record<string, any>;
    }, options?: DocumentImportOptions): Promise<KnowledgeDocument>;
    batchImportDocuments(imports: Array<{
        type: 'file' | 'url' | 'api' | 'manual';
        data: any;
        options?: DocumentImportOptions;
    }>): Promise<KnowledgeDocument[]>;
    private processDocumentForVectorization;
    processPendingDocuments(batchSize?: number): Promise<void>;
    getDocumentStats(): Promise<{
        total: number;
        byStatus: Array<{
            status: string;
            count: number;
        }>;
        byProcessingStatus: Array<{
            processingStatus: string;
            count: number;
        }>;
        byCategory: Array<{
            category: string;
            count: number;
        }>;
        bySourceType: Array<{
            sourceType: string;
            count: number;
        }>;
        qualityStats: {
            avgOverall: number;
            avgCompleteness: number;
            avgRelevance: number;
            avgFreshness: number;
            avgAuthority: number;
            avgReadability: number;
        };
    }>;
    revectorizeAllDocuments(): Promise<{
        total: number;
        processed: number;
        failed: number;
    }>;
    private assessDocumentQuality;
    private assessReadability;
    private generateSummary;
    private countWords;
    private extractFileContent;
    private crawlUrlContent;
    getAllCategories(): Promise<Array<{
        category: string;
        count: number;
    }>>;
    getAllTags(): Promise<Array<{
        tag: string;
        count: number;
    }>>;
    updateCategory(oldCategory: string, newCategory: string): Promise<{
        updated: number;
    }>;
    mergeTags(sourceTag: string, targetTag: string): Promise<{
        updated: number;
    }>;
    suggestTags(documentId: string, limit?: number): Promise<string[]>;
    suggestCategory(documentId: string): Promise<string | null>;
    batchUpdateTags(documentIds: string[], tagUpdates: {
        add?: string[];
        remove?: string[];
    }): Promise<{
        updated: number;
    }>;
    private mapDocumentSourceType;
    batchUpdateCategory(documentIds: string[], category: string): Promise<{
        updated: number;
    }>;
}
