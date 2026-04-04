"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var KnowledgeDocumentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeDocumentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const knowledge_document_entity_1 = require("../../../entities/knowledge-document.entity");
const knowledge_document_repository_1 = require("../../../shared/repositories/knowledge-document.repository");
const vector_search_service_1 = require("../../../shared/vector/services/vector-search.service");
const tenant_context_service_1 = require("../../../shared/services/tenant-context.service");
let KnowledgeDocumentService = KnowledgeDocumentService_1 = class KnowledgeDocumentService {
    knowledgeDocumentRepository;
    vectorSearchService;
    configService;
    logger = new common_1.Logger(KnowledgeDocumentService_1.name);
    constructor(knowledgeDocumentRepository, vectorSearchService, configService) {
        this.knowledgeDocumentRepository = knowledgeDocumentRepository;
        this.vectorSearchService = vectorSearchService;
        this.configService = configService;
    }
    async createDocument(data, options) {
        try {
            this.logger.log(`创建新文档: ${data.title}`);
            if (!data.title || !data.content) {
                throw new common_1.BadRequestException('文档标题和内容为必填项');
            }
            const contentHash = crypto
                .createHash('sha256')
                .update(data.content)
                .digest('hex');
            const existingDoc = await this.knowledgeDocumentRepository.findByContentHash(contentHash);
            if (existingDoc) {
                throw new common_1.ConflictException('已存在相同内容的文档');
            }
            const tenantId = tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic();
            const currentUserId = tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic();
            const document = this.knowledgeDocumentRepository.create({
                tenantId,
                createdBy: currentUserId,
                title: data.title,
                content: data.content,
                summary: data.summary || this.generateSummary(data.content),
                sourceType: data.sourceType,
                sourceUrl: data.sourceUrl,
                fileInfo: data.fileInfo,
                category: data.category,
                tags: data.tags || [],
                language: data.language || 'zh-CN',
                metadata: data.metadata || {},
                status: knowledge_document_entity_1.DocumentStatus.DRAFT,
                processingStatus: knowledge_document_entity_1.DocumentProcessingStatus.PENDING,
                contentHash,
                qualityScore: this.assessDocumentQuality(data.content, data.metadata),
            });
            const savedDocument = await this.knowledgeDocumentRepository.save(document);
            const result = Array.isArray(savedDocument)
                ? savedDocument[0]
                : savedDocument;
            this.logger.log(`文档创建成功: ${result.id}`);
            if (options?.autoVectorize !== false) {
                this.processDocumentForVectorization(result.id).catch((error) => {
                    this.logger.error(`文档向量化处理失败: ${error.message}`, error.stack);
                });
            }
            return result;
        }
        catch (error) {
            this.logger.error(`创建文档失败: ${error.message}`, error.stack);
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('创建文档失败');
        }
    }
    async getDocument(documentId) {
        const document = await this.knowledgeDocumentRepository.findById(documentId);
        if (!document) {
            throw new common_1.NotFoundException(`文档不存在: ${documentId}`);
        }
        return document;
    }
    async updateDocument(documentId, updates) {
        try {
            this.logger.log(`更新文档: ${documentId}`);
            const document = await this.getDocument(documentId);
            if (updates.content && updates.content !== document.content) {
                const contentHash = crypto
                    .createHash('sha256')
                    .update(updates.content)
                    .digest('hex');
                updates['contentHash'] = contentHash;
                updates['qualityScore'] = this.assessDocumentQuality(updates.content, updates.metadata || document.metadata);
                updates['processingStatus'] = knowledge_document_entity_1.DocumentProcessingStatus.PENDING;
            }
            await this.knowledgeDocumentRepository.updateById(documentId, updates);
            if (updates.content && document.status === knowledge_document_entity_1.DocumentStatus.ACTIVE) {
                this.processDocumentForVectorization(documentId).catch((error) => {
                    this.logger.error(`文档重新向量化失败: ${error.message}`, error.stack);
                });
            }
            return await this.getDocument(documentId);
        }
        catch (error) {
            this.logger.error(`更新文档失败: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('更新文档失败');
        }
    }
    async deleteDocument(documentId) {
        try {
            this.logger.log(`删除文档: ${documentId}`);
            const document = await this.getDocument(documentId);
            if (document.vectorId) {
                try {
                    await this.vectorSearchService.deleteDocument(document.vectorId);
                    this.logger.debug(`已从向量数据库中删除文档: ${document.vectorId}`);
                }
                catch (error) {
                    this.logger.warn(`从向量数据库删除文档失败: ${error.message}`);
                }
            }
            await this.knowledgeDocumentRepository.updateById(documentId, {
                deletedAt: new Date(),
                status: knowledge_document_entity_1.DocumentStatus.ARCHIVED,
            });
            this.logger.log(`文档删除成功: ${documentId}`);
        }
        catch (error) {
            this.logger.error(`删除文档失败: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('删除文档失败');
        }
    }
    async batchDeleteDocuments(documentIds) {
        for (const documentId of documentIds) {
            try {
                await this.deleteDocument(documentId);
            }
            catch (error) {
                this.logger.error(`批量删除文档失败 ${documentId}: ${error.message}`);
            }
        }
    }
    async searchDocuments(query, filters) {
        const { category, sourceType, status, tags, limit = 50, offset = 0, } = filters || {};
        const whereConditions = {};
        if (category) {
            whereConditions.category = category;
        }
        if (sourceType) {
            whereConditions.sourceType = sourceType;
        }
        if (status) {
            whereConditions.status = status;
        }
        let documents;
        if (query) {
            documents = await this.knowledgeDocumentRepository.searchDocuments(query, {
                category,
                sourceType,
                limit,
            });
        }
        else {
            documents = await this.knowledgeDocumentRepository.find({
                where: whereConditions,
                take: limit,
                skip: offset,
                order: { updatedAt: 'DESC' },
            });
        }
        if (tags && tags.length > 0) {
            documents = documents.filter((doc) => doc.tags && tags.some((tag) => doc.tags.includes(tag)));
        }
        const total = await this.knowledgeDocumentRepository.count({
            where: whereConditions,
        });
        return { documents, total };
    }
    async importFileDocument(file, options) {
        try {
            this.logger.log(`导入文件文档: ${file.originalName}`);
            const content = await this.extractFileContent(file);
            const title = options?.title || file.originalName.replace(/\.[^/.]+$/, '');
            const metadata = {
                ...options?.metadata,
                extractionMethod: 'file-upload',
                extractedAt: new Date(),
                wordCount: this.countWords(content),
                readingTime: Math.ceil(this.countWords(content) / 200),
            };
            const document = await this.createDocument({
                title,
                content,
                sourceType: knowledge_document_entity_1.DocumentSourceType.FILE,
                fileInfo: {
                    originalName: file.originalName,
                    mimeType: file.mimeType,
                    size: file.size,
                    storagePath: file.storagePath,
                },
                category: options?.category,
                tags: options?.tags,
                language: options?.language,
                metadata,
            });
            await this.knowledgeDocumentRepository.updateById(document.id, {
                status: knowledge_document_entity_1.DocumentStatus.ACTIVE,
            });
            this.logger.log(`文件文档导入成功: ${document.id}`);
            return document;
        }
        catch (error) {
            this.logger.error(`导入文件文档失败: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('导入文件文档失败');
        }
    }
    async importUrlDocument(url, options) {
        try {
            this.logger.log(`导入URL文档: ${url}`);
            const crawlResult = await this.crawlUrlContent(url);
            const title = options?.title || crawlResult.title;
            const document = await this.createDocument({
                title,
                content: crawlResult.content,
                summary: this.generateSummary(crawlResult.content),
                sourceType: knowledge_document_entity_1.DocumentSourceType.URL,
                sourceUrl: url,
                category: options?.category,
                tags: options?.tags,
                language: options?.language,
                metadata: {
                    ...options?.metadata,
                    ...crawlResult.metadata,
                    extractionMethod: 'web-crawler',
                    extractedAt: new Date(),
                },
            });
            await this.knowledgeDocumentRepository.updateById(document.id, {
                status: knowledge_document_entity_1.DocumentStatus.ACTIVE,
            });
            this.logger.log(`URL文档导入成功: ${document.id}`);
            return document;
        }
        catch (error) {
            this.logger.error(`导入URL文档失败: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('导入URL文档失败');
        }
    }
    async importApiDocument(apiData, options) {
        try {
            this.logger.log(`导入API文档: ${apiData.title}`);
            const document = await this.createDocument({
                title: apiData.title,
                content: apiData.content,
                sourceType: knowledge_document_entity_1.DocumentSourceType.API,
                category: options?.category,
                tags: options?.tags,
                language: options?.language,
                metadata: {
                    ...options?.metadata,
                    ...apiData.metadata,
                    extractionMethod: 'api-integration',
                    extractedAt: new Date(),
                    wordCount: this.countWords(apiData.content),
                    readingTime: Math.ceil(this.countWords(apiData.content) / 200),
                },
            });
            await this.knowledgeDocumentRepository.updateById(document.id, {
                status: knowledge_document_entity_1.DocumentStatus.ACTIVE,
            });
            this.logger.log(`API文档导入成功: ${document.id}`);
            return document;
        }
        catch (error) {
            this.logger.error(`导入API文档失败: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('导入API文档失败');
        }
    }
    async batchImportDocuments(imports) {
        const results = [];
        for (const importItem of imports) {
            try {
                let document;
                switch (importItem.type) {
                    case 'file':
                        document = await this.importFileDocument(importItem.data, importItem.options);
                        break;
                    case 'url':
                        document = await this.importUrlDocument(importItem.data, importItem.options);
                        break;
                    case 'api':
                        document = await this.importApiDocument(importItem.data, importItem.options);
                        break;
                    case 'manual':
                        document = await this.createDocument({
                            title: importItem.data.title,
                            content: importItem.data.content,
                            sourceType: knowledge_document_entity_1.DocumentSourceType.MANUAL,
                            ...importItem.options,
                        });
                        break;
                    default:
                        throw new common_1.BadRequestException(`不支持的导入类型: ${importItem.type}`);
                }
                results.push(document);
            }
            catch (error) {
                this.logger.error(`批量导入文档失败: ${error.message}`);
            }
        }
        return results;
    }
    async processDocumentForVectorization(documentId) {
        try {
            this.logger.log(`处理文档向量化: ${documentId}`);
            const document = await this.getDocument(documentId);
            if (document.status !== knowledge_document_entity_1.DocumentStatus.ACTIVE) {
                this.logger.debug(`文档 ${documentId} 非活跃状态，跳过向量化`);
                return;
            }
            await this.knowledgeDocumentRepository.updateById(documentId, {
                processingStatus: knowledge_document_entity_1.DocumentProcessingStatus.EXTRACTING,
                extractedAt: new Date(),
            });
            const vectorDocument = {
                id: document.id,
                content: document.content,
                metadata: {
                    title: document.title,
                    sourceType: this.mapDocumentSourceType(document.sourceType),
                    sourceUrl: document.sourceUrl,
                    category: document.category,
                    tags: document.tags,
                    language: document.language,
                    ...document.metadata,
                },
            };
            const vectorId = await this.vectorSearchService.addDocument(vectorDocument);
            await this.knowledgeDocumentRepository.updateVectorInfo(documentId, vectorId);
            this.logger.log(`文档向量化完成: ${documentId} -> ${vectorId}`);
        }
        catch (error) {
            this.logger.error(`文档向量化失败: ${error.message}`, error.stack);
            await this.knowledgeDocumentRepository.updateById(documentId, {
                processingStatus: knowledge_document_entity_1.DocumentProcessingStatus.FAILED,
                processingError: error.message,
            });
            throw error;
        }
    }
    async processPendingDocuments(batchSize = 10) {
        try {
            this.logger.log(`批量处理待向量化文档，批量大小: ${batchSize}`);
            const pendingDocs = await this.knowledgeDocumentRepository.findPendingProcessing(batchSize);
            if (pendingDocs.length === 0) {
                this.logger.debug('没有待处理的文档');
                return;
            }
            this.logger.log(`找到 ${pendingDocs.length} 个待处理文档`);
            for (const doc of pendingDocs) {
                try {
                    await this.processDocumentForVectorization(doc.id);
                }
                catch (error) {
                    this.logger.error(`处理文档 ${doc.id} 失败: ${error.message}`);
                }
            }
        }
        catch (error) {
            this.logger.error(`批量处理文档失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getDocumentStats() {
        const [total, byStatus, byProcessingStatus, byCategory, bySourceType, qualityStats,] = await Promise.all([
            this.knowledgeDocumentRepository.count(),
            this.knowledgeDocumentRepository.getCountByStatus(),
            this.knowledgeDocumentRepository.getCountByProcessingStatus(),
            this.knowledgeDocumentRepository.getCategoryStats(),
            this.knowledgeDocumentRepository.getSourceTypeStats(),
            this.knowledgeDocumentRepository.getQualityStats(),
        ]);
        return {
            total,
            byStatus,
            byProcessingStatus,
            byCategory,
            bySourceType,
            qualityStats,
        };
    }
    async revectorizeAllDocuments() {
        const vectorizedDocs = await this.knowledgeDocumentRepository.findVectorizedDocuments();
        let processed = 0;
        let failed = 0;
        for (const doc of vectorizedDocs) {
            try {
                await this.knowledgeDocumentRepository.updateById(doc.id, {
                    processingStatus: knowledge_document_entity_1.DocumentProcessingStatus.PENDING,
                    vectorId: null,
                    vectorizedAt: null,
                });
                await this.processDocumentForVectorization(doc.id);
                processed++;
            }
            catch (error) {
                this.logger.error(`重新向量化文档 ${doc.id} 失败: ${error.message}`);
                failed++;
            }
        }
        return {
            total: vectorizedDocs.length,
            processed,
            failed,
        };
    }
    assessDocumentQuality(content, metadata) {
        const wordCount = this.countWords(content);
        const completeness = Math.min(100, (wordCount / 500) * 100);
        const relevance = metadata?.keywords ? 80 : 60;
        let freshness = 70;
        if (metadata?.publishDate) {
            const daysOld = (new Date().getTime() - new Date(metadata.publishDate).getTime()) /
                (1000 * 60 * 60 * 24);
            freshness = Math.max(0, 100 - (daysOld / 365) * 100);
        }
        const authority = metadata?.author ? 75 : 60;
        const readability = this.assessReadability(content);
        const overall = completeness * 0.2 +
            relevance * 0.2 +
            freshness * 0.2 +
            authority * 0.2 +
            readability * 0.2;
        return {
            completeness: Math.round(completeness),
            relevance: Math.round(relevance),
            freshness: Math.round(freshness),
            authority: Math.round(authority),
            readability: Math.round(readability),
            overall: Math.round(overall),
        };
    }
    assessReadability(content) {
        const sentences = content
            .split(/[.!?。！？]+/)
            .filter((s) => s.trim().length > 0);
        const words = content.split(/\s+/).filter((w) => w.length > 0);
        if (sentences.length === 0 || words.length === 0) {
            return 50;
        }
        const avgSentenceLength = words.length / sentences.length;
        const readability = 100 - avgSentenceLength * 2;
        return Math.max(0, Math.min(100, readability));
    }
    generateSummary(content, maxLength = 200) {
        if (content.length <= maxLength) {
            return content;
        }
        let summary = content.substring(0, maxLength);
        const lastPunctuation = Math.max(summary.lastIndexOf('。'), summary.lastIndexOf('！'), summary.lastIndexOf('？'), summary.lastIndexOf('.'), summary.lastIndexOf('!'), summary.lastIndexOf('?'));
        if (lastPunctuation > maxLength * 0.5) {
            summary = summary.substring(0, lastPunctuation + 1);
        }
        return summary + '...';
    }
    countWords(text) {
        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (text.match(/\b[a-zA-Z]+\b/g) || []).length;
        return chineseChars + englishWords;
    }
    async extractFileContent(file) {
        return `文件内容提取占位符: ${file.originalName}\n文件大小: ${file.size}字节\nMIME类型: ${file.mimeType}`;
    }
    async crawlUrlContent(url) {
        return {
            url,
            title: `抓取自: ${url}`,
            content: `网页内容占位符: ${url}\n这是从网页抓取的内容示例，实际实现时需要集成网页抓取库。`,
            metadata: {
                wordCount: 50,
                readingTime: 1,
                keywords: ['网页', '抓取', '示例'],
            },
        };
    }
    async getAllCategories() {
        return this.knowledgeDocumentRepository.getCategoryStats();
    }
    async getAllTags() {
        const documents = await this.knowledgeDocumentRepository.find({
            where: { status: knowledge_document_entity_1.DocumentStatus.ACTIVE },
            select: ['tags'],
        });
        const tagMap = new Map();
        documents.forEach((doc) => {
            if (doc.tags) {
                doc.tags.forEach((tag) => {
                    tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
                });
            }
        });
        return Array.from(tagMap.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    }
    async updateCategory(oldCategory, newCategory) {
        const documents = await this.knowledgeDocumentRepository.findByCategory(oldCategory);
        const documentIds = documents.map((doc) => doc.id);
        if (documentIds.length === 0) {
            return { updated: 0 };
        }
        await this.knowledgeDocumentRepository
            .createQueryBuilder()
            .update(knowledge_document_entity_1.KnowledgeDocument)
            .set({ category: newCategory })
            .where('id IN (:...ids)', { ids: documentIds })
            .execute();
        return { updated: documentIds.length };
    }
    async mergeTags(sourceTag, targetTag) {
        const documents = await this.knowledgeDocumentRepository.findByTag(sourceTag);
        let updatedCount = 0;
        for (const doc of documents) {
            if (doc.tags) {
                const updatedTags = doc.tags.filter((tag) => tag !== sourceTag);
                if (!updatedTags.includes(targetTag)) {
                    updatedTags.push(targetTag);
                }
                await this.knowledgeDocumentRepository.updateById(doc.id, {
                    tags: updatedTags,
                });
                updatedCount++;
            }
        }
        return { updated: updatedCount };
    }
    async suggestTags(documentId, limit = 5) {
        const document = await this.getDocument(documentId);
        const content = document.content;
        const words = content.split(/\s+/);
        const wordFrequency = new Map();
        words.forEach((word) => {
            if (word.length > 1) {
                const normalizedWord = word
                    .toLowerCase()
                    .replace(/[^\w\u4e00-\u9fa5]/g, '');
                if (normalizedWord.length > 1) {
                    wordFrequency.set(normalizedWord, (wordFrequency.get(normalizedWord) || 0) + 1);
                }
            }
        });
        const sortedWords = Array.from(wordFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit * 2)
            .map(([word]) => word);
        const stopWords = [
            '的',
            '了',
            '在',
            '是',
            '和',
            '与',
            '及',
            '等',
            '这个',
            '那个',
        ];
        const suggestedTags = sortedWords
            .filter((word) => !stopWords.includes(word))
            .slice(0, limit);
        return suggestedTags;
    }
    async suggestCategory(documentId) {
        const document = await this.getDocument(documentId);
        if (document.category) {
            return null;
        }
        const content = document.content;
        const categoryKeywords = {
            技术: ['编程', '代码', '算法', '开发', '软件', '硬件', '网络'],
            营销: ['推广', '广告', '品牌', '销售', '市场', '客户', '流量'],
            管理: ['团队', '领导', '战略', '规划', '组织', '效率', '绩效'],
            金融: ['投资', '股票', '基金', '银行', '保险', '理财', '经济'],
            教育: ['学习', '培训', '课程', '教学', '学生', '教师', '学校'],
        };
        const words = content.toLowerCase();
        let bestCategory = null;
        let maxMatches = 0;
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            const matches = keywords.filter((keyword) => words.includes(keyword.toLowerCase())).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                bestCategory = category;
            }
        }
        return maxMatches > 0 ? bestCategory : null;
    }
    async batchUpdateTags(documentIds, tagUpdates) {
        let updatedCount = 0;
        for (const documentId of documentIds) {
            try {
                const document = await this.getDocument(documentId);
                let tags = document.tags || [];
                if (tagUpdates.remove) {
                    tags = tags.filter((tag) => !tagUpdates.remove.includes(tag));
                }
                if (tagUpdates.add) {
                    tagUpdates.add.forEach((tag) => {
                        if (!tags.includes(tag)) {
                            tags.push(tag);
                        }
                    });
                }
                await this.knowledgeDocumentRepository.updateById(documentId, { tags });
                updatedCount++;
            }
            catch (error) {
                this.logger.error(`更新文档 ${documentId} 标签失败: ${error.message}`);
            }
        }
        return { updated: updatedCount };
    }
    mapDocumentSourceType(sourceType) {
        switch (sourceType) {
            case knowledge_document_entity_1.DocumentSourceType.FILE:
                return 'file';
            case knowledge_document_entity_1.DocumentSourceType.URL:
                return 'web';
            case knowledge_document_entity_1.DocumentSourceType.API:
                return 'api';
            case knowledge_document_entity_1.DocumentSourceType.MANUAL:
                return 'manual';
            default:
                return 'manual';
        }
    }
    async batchUpdateCategory(documentIds, category) {
        let updatedCount = 0;
        for (const documentId of documentIds) {
            try {
                await this.knowledgeDocumentRepository.updateById(documentId, {
                    category,
                });
                updatedCount++;
            }
            catch (error) {
                this.logger.error(`更新文档 ${documentId} 分类失败: ${error.message}`);
            }
        }
        return { updated: updatedCount };
    }
};
exports.KnowledgeDocumentService = KnowledgeDocumentService;
exports.KnowledgeDocumentService = KnowledgeDocumentService = KnowledgeDocumentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(knowledge_document_repository_1.KnowledgeDocumentRepository)),
    __metadata("design:paramtypes", [knowledge_document_repository_1.KnowledgeDocumentRepository,
        vector_search_service_1.VectorSearchService,
        config_1.ConfigService])
], KnowledgeDocumentService);
//# sourceMappingURL=knowledge-document.service.js.map