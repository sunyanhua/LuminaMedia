import { TenantRepository } from './tenant.repository';
import { KnowledgeDocument, DocumentStatus, DocumentProcessingStatus, DocumentSourceType } from '../../entities/knowledge-document.entity';
export declare class KnowledgeDocumentRepository extends TenantRepository<KnowledgeDocument> {
    findByStatus(status: DocumentStatus): Promise<KnowledgeDocument[]>;
    findByProcessingStatus(processingStatus: DocumentProcessingStatus): Promise<KnowledgeDocument[]>;
    findBySourceType(sourceType: DocumentSourceType): Promise<KnowledgeDocument[]>;
    findByCategory(category: string): Promise<KnowledgeDocument[]>;
    findByTag(tag: string): Promise<KnowledgeDocument[]>;
    findByContentHash(contentHash: string): Promise<KnowledgeDocument | null>;
    findVectorizedDocuments(limit?: number): Promise<KnowledgeDocument[]>;
    findPendingProcessing(limit?: number): Promise<KnowledgeDocument[]>;
    searchDocuments(query: string, options?: {
        category?: string;
        sourceType?: DocumentSourceType;
        limit?: number;
    }): Promise<KnowledgeDocument[]>;
    getCategoryStats(): Promise<Array<{
        category: string;
        count: number;
    }>>;
    getSourceTypeStats(): Promise<Array<{
        sourceType: string;
        count: number;
    }>>;
    getQualityStats(): Promise<{
        avgOverall: number;
        avgCompleteness: number;
        avgRelevance: number;
        avgFreshness: number;
        avgAuthority: number;
        avgReadability: number;
    }>;
    batchUpdateProcessingStatus(documentIds: string[], processingStatus: DocumentProcessingStatus, errorMessage?: string): Promise<void>;
    updateVectorInfo(documentId: string, vectorId: string, processingStatus?: DocumentProcessingStatus): Promise<void>;
    getCountByStatus(): Promise<Array<{
        status: string;
        count: number;
    }>>;
    getCountByProcessingStatus(): Promise<Array<{
        processingStatus: string;
        count: number;
    }>>;
}
