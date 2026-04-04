import { VectorSearchService } from './vector-search.service';
import { DocumentMetadata } from '../interfaces/vector-search.interface';
export declare class DocumentPipelineService {
    private vectorSearchService;
    private readonly logger;
    private readonly defaultChunkSize;
    private readonly chunkOverlap;
    constructor(vectorSearchService: VectorSearchService);
    processDocument(content: string, metadata: DocumentMetadata): Promise<string[]>;
    processDocuments(documents: Array<{
        content: string;
        metadata: DocumentMetadata;
    }>): Promise<string[][]>;
    private extractText;
    private cleanText;
    private splitIntoChunks;
    private findSentenceBoundary;
    calculateDocumentSimilarity(docId1: string, docId2: string): Promise<number>;
    private calculateTextSimilarity;
    deleteDocumentWithChunks(docIds: string[]): Promise<void>;
    updateDocumentContent(docIds: string[], newContent: string, metadata: DocumentMetadata): Promise<string[]>;
}
