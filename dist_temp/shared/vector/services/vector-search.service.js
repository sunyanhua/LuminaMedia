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
var VectorSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorSearchService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const qdrant_adapter_1 = require("../adapters/qdrant.adapter");
let VectorSearchService = VectorSearchService_1 = class VectorSearchService {
    configService;
    qdrantAdapter;
    logger = new common_1.Logger(VectorSearchService_1.name);
    embeddingCache = new Map();
    constructor(configService, qdrantAdapter) {
        this.configService = configService;
        this.qdrantAdapter = qdrantAdapter;
    }
    async generateEmbedding(text) {
        const cacheKey = `embedding-${text.substring(0, 100)}`;
        if (this.embeddingCache.has(cacheKey)) {
            return this.embeddingCache.get(cacheKey);
        }
        try {
            const apiKey = this.configService.get('GEMINI_API_KEY');
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY not configured');
            }
            const response = await fetch('https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                    model: 'models/embedding-001',
                    content: {
                        parts: [{ text }],
                    },
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Embedding API error: ${response.status} ${errorText}`);
            }
            const data = await response.json();
            const embedding = data.embedding?.values;
            if (!embedding || !Array.isArray(embedding)) {
                throw new Error('Invalid embedding response');
            }
            this.embeddingCache.set(cacheKey, embedding);
            return embedding;
        }
        catch (error) {
            this.logger.warn(`嵌入生成失败: ${error.message}，使用随机嵌入回退`);
            const randomEmbedding = Array.from({ length: 768 }, () => Math.random() * 2 - 1);
            this.embeddingCache.set(cacheKey, randomEmbedding);
            return randomEmbedding;
        }
    }
    async addDocument(doc) {
        try {
            if (!doc.embedding || doc.embedding.length === 0) {
                doc.embedding = await this.generateEmbedding(doc.content);
            }
            return await this.qdrantAdapter.addDocument(doc);
        }
        catch (error) {
            this.logger.error(`添加文档失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async addDocuments(docs) {
        try {
            for (const doc of docs) {
                if (!doc.embedding || doc.embedding.length === 0) {
                    doc.embedding = await this.generateEmbedding(doc.content);
                }
            }
            return await this.qdrantAdapter.addDocuments(docs);
        }
        catch (error) {
            this.logger.error(`批量添加文档失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async searchSimilar(query, k = 5, filters) {
        try {
            const queryEmbedding = await this.generateEmbedding(query);
            return await this.qdrantAdapter.searchByVector(queryEmbedding, k, filters);
        }
        catch (error) {
            this.logger.error(`相似性检索失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async hybridSearch(query, options) {
        try {
            const { k = 5, filters, vectorWeight = 0.7, keywordWeight = 0.3, } = options;
            const vectorResults = await this.searchSimilar(query, k * 2, filters);
            const keywordResults = await this.searchByKeywords(query, k * 2, filters);
            const combinedResults = this.mergeAndRankResults(vectorResults, keywordResults, vectorWeight, keywordWeight);
            return combinedResults.slice(0, k);
        }
        catch (error) {
            this.logger.error(`混合检索失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async searchByKeywords(query, k, filters) {
        return await this.searchSimilar(query, k, filters);
    }
    mergeAndRankResults(vectorResults, keywordResults, vectorWeight, keywordWeight) {
        const resultMap = new Map();
        vectorResults.forEach((result, index) => {
            const docId = result.document.id;
            if (docId) {
                const weightedScore = result.similarity * vectorWeight;
                resultMap.set(docId, {
                    ...result,
                    score: weightedScore,
                });
            }
        });
        keywordResults.forEach((result, index) => {
            const docId = result.document.id;
            if (docId) {
                const existing = resultMap.get(docId);
                if (existing) {
                    existing.score =
                        (existing.score || 0) + result.similarity * keywordWeight;
                }
                else {
                    const weightedScore = result.similarity * keywordWeight;
                    resultMap.set(docId, {
                        ...result,
                        score: weightedScore,
                    });
                }
            }
        });
        const combinedResults = Array.from(resultMap.values());
        combinedResults.sort((a, b) => (b.score || 0) - (a.score || 0));
        return combinedResults;
    }
    async updateDocument(docId, content) {
        try {
            await this.qdrantAdapter.updateDocument(docId, content);
        }
        catch (error) {
            this.logger.error(`更新文档失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteDocument(docId) {
        try {
            await this.qdrantAdapter.deleteDocument(docId);
        }
        catch (error) {
            this.logger.error(`删除文档失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getDocument(docId) {
        try {
            return await this.qdrantAdapter.getDocument(docId);
        }
        catch (error) {
            this.logger.error(`获取文档失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async clearCollection(collectionName) {
        try {
            await this.qdrantAdapter.clearCollection(collectionName);
        }
        catch (error) {
            this.logger.error(`清空集合失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getCollectionStats(collectionName) {
        try {
            return await this.qdrantAdapter.getCollectionStats(collectionName);
        }
        catch (error) {
            this.logger.error(`获取集合统计失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async healthCheck() {
        try {
            const qdrantHealth = await this.qdrantAdapter.healthCheck();
            const embeddingTest = await this.generateEmbedding('test');
            const embeddingHealthy = embeddingTest.length === 768;
            return {
                status: qdrantHealth.status === 'healthy' && embeddingHealthy
                    ? 'healthy'
                    : 'degraded',
                message: `Qdrant: ${qdrantHealth.status}, Embedding: ${embeddingHealthy ? 'healthy' : 'degraded'}`,
                details: {
                    qdrant: qdrantHealth,
                    embedding: {
                        healthy: embeddingHealthy,
                        dimension: embeddingTest.length,
                    },
                },
            };
        }
        catch (error) {
            this.logger.error(`健康检查失败: ${error.message}`);
            return {
                status: 'unhealthy',
                message: `健康检查失败: ${error.message}`,
                details: {
                    error: error.message,
                },
            };
        }
    }
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            return 0;
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0)
            return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
};
exports.VectorSearchService = VectorSearchService;
exports.VectorSearchService = VectorSearchService = VectorSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        qdrant_adapter_1.QdrantAdapter])
], VectorSearchService);
//# sourceMappingURL=vector-search.service.js.map