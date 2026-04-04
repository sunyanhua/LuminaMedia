"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DocumentPipelineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentPipelineService = void 0;
const common_1 = require("@nestjs/common");
const vector_search_service_1 = require("./vector-search.service");
let DocumentPipelineService = DocumentPipelineService_1 = class DocumentPipelineService {
    vectorSearchService;
    logger = new common_1.Logger(DocumentPipelineService_1.name);
    defaultChunkSize = 1000;
    chunkOverlap = 200;
    constructor(vectorSearchService) {
        this.vectorSearchService = vectorSearchService;
    }
    async processDocument(content, metadata) {
        try {
            this.logger.log(`开始处理文档: ${metadata.title || '未命名文档'}`);
            const extractedText = this.extractText(content, metadata);
            const cleanedText = this.cleanText(extractedText);
            const chunks = this.splitIntoChunks(cleanedText);
            const docIds = [];
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const chunkMetadata = {
                    ...metadata,
                    chunkIndex: i,
                    totalChunks: chunks.length,
                    chunkSize: chunk.length,
                };
                const doc = {
                    content: chunk,
                    metadata: chunkMetadata,
                    tenantId: metadata.tenantId,
                    industry: metadata.industry,
                    source: metadata.source,
                };
                const docId = await this.vectorSearchService.addDocument(doc);
                docIds.push(docId);
                this.logger.debug(`文档分块 ${i + 1}/${chunks.length} 处理完成，ID: ${docId}`);
            }
            this.logger.log(`文档处理完成，共 ${chunks.length} 个分块，文档ID: ${docIds.join(', ')}`);
            return docIds;
        }
        catch (error) {
            this.logger.error(`文档处理失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async processDocuments(documents) {
        const allDocIds = [];
        for (const doc of documents) {
            const docIds = await this.processDocument(doc.content, doc.metadata);
            allDocIds.push(docIds);
        }
        return allDocIds;
    }
    extractText(content, metadata) {
        return content;
    }
    cleanText(text) {
        let cleaned = text.replace(/\s+/g, ' ').trim();
        cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        cleaned = cleaned.replace(/<[^>]*>/g, '');
        cleaned = cleaned.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        return cleaned;
    }
    splitIntoChunks(text, chunkSize, overlap) {
        const size = chunkSize || this.defaultChunkSize;
        const overlapSize = overlap || this.chunkOverlap;
        if (text.length <= size) {
            return [text];
        }
        const chunks = [];
        let start = 0;
        while (start < text.length) {
            let end = start + size;
            if (end < text.length) {
                const sentenceEnd = this.findSentenceBoundary(text, end);
                if (sentenceEnd > start + size * 0.5) {
                    end = sentenceEnd;
                }
            }
            const chunk = text.substring(start, end).trim();
            if (chunk.length > 0) {
                chunks.push(chunk);
            }
            start = end - overlapSize;
            if (start < 0)
                start = 0;
            if (start >= text.length)
                break;
        }
        return chunks;
    }
    findSentenceBoundary(text, position) {
        const sentenceEndings = /[.!?。！？]\s+/g;
        let lastMatch = position;
        let searchPos = position;
        while (searchPos < text.length && searchPos < position + 100) {
            const match = sentenceEndings.exec(text.substring(searchPos));
            if (match) {
                lastMatch = searchPos + match.index + match[0].length;
                break;
            }
            searchPos += 50;
        }
        if (lastMatch === position) {
            const commaMatch = /[,;，；]\s+/g.exec(text.substring(position));
            if (commaMatch) {
                lastMatch = position + commaMatch.index + commaMatch[0].length;
            }
        }
        if (lastMatch === position) {
            lastMatch = Math.min(position + 50, text.length);
        }
        return lastMatch;
    }
    async calculateDocumentSimilarity(docId1, docId2) {
        try {
            const doc1 = await this.vectorSearchService.getDocument(docId1);
            const doc2 = await this.vectorSearchService.getDocument(docId2);
            if (!doc1 || !doc2) {
                return 0;
            }
            if (doc1.embedding && doc2.embedding) {
                return this.calculateTextSimilarity(doc1.content, doc2.content);
            }
            return this.calculateTextSimilarity(doc1.content, doc2.content);
        }
        catch (error) {
            this.logger.error(`计算文档相似度失败: ${error.message}`);
            return 0;
        }
    }
    calculateTextSimilarity(text1, text2) {
        const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(Boolean));
        const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(Boolean));
        if (words1.size === 0 && words2.size === 0)
            return 1;
        if (words1.size === 0 || words2.size === 0)
            return 0;
        const intersection = new Set([...words1].filter((x) => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    }
    async deleteDocumentWithChunks(docIds) {
        try {
            for (const docId of docIds) {
                await this.vectorSearchService.deleteDocument(docId);
            }
            this.logger.log(`删除 ${docIds.length} 个文档分块成功`);
        }
        catch (error) {
            this.logger.error(`删除文档分块失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateDocumentContent(docIds, newContent, metadata) {
        try {
            await this.deleteDocumentWithChunks(docIds);
            return await this.processDocument(newContent, metadata);
        }
        catch (error) {
            this.logger.error(`更新文档内容失败: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DocumentPipelineService = DocumentPipelineService;
exports.DocumentPipelineService = DocumentPipelineService = DocumentPipelineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vector_search_service_1.VectorSearchService])
], DocumentPipelineService);
//# sourceMappingURL=document-pipeline.service.js.map