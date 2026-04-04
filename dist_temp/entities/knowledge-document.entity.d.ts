import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';
import { User } from './user.entity';
export declare enum DocumentSourceType {
    FILE = "file",
    URL = "url",
    API = "api",
    MANUAL = "manual"
}
export declare enum DocumentStatus {
    DRAFT = "draft",
    PROCESSING = "processing",
    ACTIVE = "active",
    ARCHIVED = "archived"
}
export declare enum DocumentProcessingStatus {
    PENDING = "pending",
    EXTRACTING = "extracting",
    VECTORIZED = "vectorized",
    ANALYZED = "analyzed",
    FAILED = "failed"
}
export interface FileInfo {
    originalName: string;
    mimeType: string;
    size: number;
    storagePath: string;
    encoding?: string;
}
export interface DocumentMetadata {
    author?: string;
    publishDate?: Date;
    wordCount?: number;
    pageCount?: number;
    readingTime?: number;
    keywords?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    confidence?: number;
    extractionMethod?: string;
    extractedAt?: Date;
    [key: string]: any;
}
export interface DocumentQualityScore {
    completeness: number;
    relevance: number;
    freshness: number;
    authority: number;
    readability: number;
    overall: number;
}
export declare class KnowledgeDocument implements TenantEntity {
    id: string;
    tenantId: string;
    createdBy: string;
    creator: User;
    title: string;
    content: string;
    summary: string;
    sourceType: DocumentSourceType;
    sourceUrl: string;
    fileInfo: FileInfo;
    category: string;
    tags: string[];
    language: string;
    metadata: DocumentMetadata;
    status: DocumentStatus;
    processingStatus: DocumentProcessingStatus;
    processingError: string;
    vectorId: string;
    qualityScore: DocumentQualityScore;
    version: number;
    isPublic: boolean;
    accessControl: string[];
    contentHash: string;
    extractedAt: Date;
    vectorizedAt: Date;
    analyzedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    isVectorized(): boolean;
    isAnalyzed(): boolean;
    isSearchable(): boolean;
}
