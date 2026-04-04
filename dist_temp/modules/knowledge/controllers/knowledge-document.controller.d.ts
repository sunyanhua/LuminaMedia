import type { MulterFile } from 'src/shared/types/multer-file.interface';
import { KnowledgeDocumentService } from '../services/knowledge-document.service';
import { KnowledgeDocument, DocumentSourceType, DocumentStatus, DocumentProcessingStatus } from '../../../entities/knowledge-document.entity';
import { DocumentImportOptions } from '../services/knowledge-document.service';
declare class CreateDocumentDto {
    title: string;
    content: string;
    summary?: string;
    sourceType: DocumentSourceType;
    sourceUrl?: string;
    category?: string;
    tags?: string[];
    language?: string;
    metadata?: any;
}
declare class UpdateDocumentDto {
    title?: string;
    content?: string;
    summary?: string;
    category?: string;
    tags?: string[];
    language?: string;
    metadata?: any;
    status?: DocumentStatus;
    isPublic?: boolean;
    accessControl?: string[];
    processingStatus?: DocumentProcessingStatus;
    vectorId?: string | null;
    processingError?: string;
    vectorizedAt?: Date;
}
declare class ImportFileDto {
    category?: string;
    tags?: string | string[];
    language?: string;
    isPublic?: boolean;
    accessControl?: string[];
}
declare class ImportUrlDto {
    url: string;
    category?: string;
    tags?: string[];
    language?: string;
    isPublic?: boolean;
    accessControl?: string[];
}
declare class ImportApiDto {
    title: string;
    content: string;
    metadata?: any;
    category?: string;
    tags?: string[];
    language?: string;
    isPublic?: boolean;
    accessControl?: string[];
}
declare class BatchImportDto {
    imports: Array<{
        type: 'file' | 'url' | 'api' | 'manual';
        data: any;
        options?: DocumentImportOptions;
    }>;
}
declare class BatchUpdateTagsDto {
    documentIds: string[];
    add?: string[];
    remove?: string[];
}
declare class BatchUpdateCategoryDto {
    documentIds: string[];
    category: string;
}
declare class UpdateCategoryDto {
    newCategory: string;
}
declare class MergeTagsDto {
    targetTag: string;
}
export declare class KnowledgeDocumentController {
    private readonly knowledgeDocumentService;
    constructor(knowledgeDocumentService: KnowledgeDocumentService);
    createDocument(createDocumentDto: CreateDocumentDto): Promise<KnowledgeDocument>;
    getDocument(id: string): Promise<KnowledgeDocument>;
    updateDocument(id: string, updateDocumentDto: UpdateDocumentDto): Promise<KnowledgeDocument>;
    deleteDocument(id: string): Promise<void>;
    batchDeleteDocuments(documentIds: string[]): Promise<void>;
    searchDocuments(query?: string, category?: string, sourceType?: DocumentSourceType, status?: DocumentStatus, tags?: string, limit?: number, offset?: number): Promise<{
        documents: KnowledgeDocument[];
        total: number;
    }>;
    importFileDocument(file: MulterFile, importFileDto: ImportFileDto): Promise<KnowledgeDocument>;
    importUrlDocument(importUrlDto: ImportUrlDto): Promise<KnowledgeDocument>;
    importApiDocument(importApiDto: ImportApiDto): Promise<KnowledgeDocument>;
    batchImportDocuments(batchImportDto: BatchImportDto): Promise<KnowledgeDocument[]>;
    processPendingDocuments(batchSize?: number): Promise<void>;
    getDocumentStats(): Promise<any>;
    revectorizeAllDocuments(): Promise<{
        total: number;
        processed: number;
        failed: number;
    }>;
    getAllCategories(): Promise<Array<{
        category: string;
        count: number;
    }>>;
    getAllTags(): Promise<Array<{
        tag: string;
        count: number;
    }>>;
    updateCategory(category: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        updated: number;
    }>;
    mergeTags(sourceTag: string, mergeTagsDto: MergeTagsDto): Promise<{
        updated: number;
    }>;
    suggestTags(id: string, limit?: number): Promise<string[]>;
    suggestCategory(id: string): Promise<string | null>;
    batchUpdateTags(batchUpdateTagsDto: BatchUpdateTagsDto): Promise<{
        updated: number;
    }>;
    batchUpdateCategory(batchUpdateCategoryDto: BatchUpdateCategoryDto): Promise<{
        updated: number;
    }>;
    getProcessingStatus(id: string): Promise<{
        processingStatus: string;
        vectorId?: string;
        vectorizedAt?: Date;
        processingError?: string;
    }>;
    triggerVectorization(id: string): Promise<void>;
}
export {};
