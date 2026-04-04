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
var QdrantAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QdrantAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const js_client_rest_1 = require("@qdrant/js-client-rest");
let QdrantAdapter = QdrantAdapter_1 = class QdrantAdapter {
    configService;
    logger = new common_1.Logger(QdrantAdapter_1.name);
    client;
    defaultCollectionName = 'knowledge_base';
    vectorDimension = 768;
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        try {
            await this.initialize();
        }
        catch (error) {
            this.logger.warn(`Qdrant初始化失败，向量搜索功能不可用: ${error.message}`);
        }
    }
    async initialize() {
        try {
            const host = this.configService.get('QDRANT_HOST') || 'localhost';
            const port = this.configService.get('QDRANT_PORT') || 6333;
            const apiKey = this.configService.get('QDRANT_API_KEY');
            const enableAuthRaw = this.configService.get('QDRANT_ENABLE_AUTH');
            let enableAuth;
            if (enableAuthRaw !== undefined && enableAuthRaw !== null) {
                enableAuth = enableAuthRaw === 'true' || enableAuthRaw === true;
            }
            const useAuth = enableAuth !== undefined ? enableAuth : !!(apiKey && apiKey.trim() !== '');
            const options = {
                host,
                port,
            };
            if (useAuth && apiKey && apiKey.trim() !== '') {
                options.apiKey = apiKey.trim();
            }
            if (enableAuth === false) {
                this.logger.log('Qdrant认证已明确禁用，使用无认证连接');
            }
            this.client = new js_client_rest_1.QdrantClient(options);
            await this.healthCheck();
            await this.ensureCollectionExists(this.defaultCollectionName);
            this.logger.log(`Qdrant适配器初始化完成，连接到 ${host}:${port}，集合：${this.defaultCollectionName}，认证：${useAuth ? '已启用' : '已禁用'}`);
        }
        catch (error) {
            this.logger.error(`Qdrant适配器初始化失败: ${error.message}`, error.stack);
        }
    }
    async ensureCollectionExists(collectionName) {
        try {
            const collections = await this.client.getCollections();
            const collectionExists = collections.collections.some((col) => col.name === collectionName);
            if (!collectionExists) {
                this.logger.log(`创建向量集合: ${collectionName}`);
                await this.client.createCollection(collectionName, {
                    vectors: {
                        size: this.vectorDimension,
                        distance: 'Cosine',
                    },
                });
                this.logger.log(`集合 ${collectionName} 创建成功`);
            }
        }
        catch (error) {
            this.logger.error(`确保集合存在失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async addDocument(doc) {
        try {
            const documentId = doc.id ||
                `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const point = {
                id: documentId,
                vector: doc.embedding || [],
                payload: {
                    content: doc.content,
                    metadata: doc.metadata,
                    tenantId: doc.tenantId,
                    industry: doc.industry,
                    source: doc.source,
                    createdAt: doc.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            };
            await this.client.upsert(this.defaultCollectionName, {
                wait: true,
                points: [point],
            });
            this.logger.debug(`文档添加成功: ${documentId}`);
            return documentId;
        }
        catch (error) {
            this.logger.error(`添加文档失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async addDocuments(docs) {
        try {
            const points = docs.map((doc) => {
                const documentId = doc.id ||
                    `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                return {
                    id: documentId,
                    vector: doc.embedding || [],
                    payload: {
                        content: doc.content,
                        metadata: doc.metadata,
                        tenantId: doc.tenantId,
                        industry: doc.industry,
                        source: doc.source,
                        createdAt: doc.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                };
            });
            await this.client.upsert(this.defaultCollectionName, {
                wait: true,
                points,
            });
            const docIds = points.map((point) => point.id);
            this.logger.debug(`批量添加 ${docs.length} 个文档成功`);
            return docIds;
        }
        catch (error) {
            this.logger.error(`批量添加文档失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async searchSimilar(query, k = 5, filters) {
        try {
            this.logger.warn('searchSimilar需要查询向量，请使用hybridSearch或提供嵌入向量');
            return [];
        }
        catch (error) {
            this.logger.error(`相似性检索失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async hybridSearch(query, options) {
        try {
            const { k = 5, filters, vectorWeight = 0.7, keywordWeight = 0.3, } = options;
            const filterConditions = {};
            if (filters) {
                const mustConditions = [];
                if (filters.tenantId) {
                    mustConditions.push({
                        key: 'tenantId',
                        match: { value: filters.tenantId },
                    });
                }
                if (filters.industry) {
                    mustConditions.push({
                        key: 'industry',
                        match: { value: filters.industry },
                    });
                }
                if (filters.source) {
                    mustConditions.push({
                        key: 'source',
                        match: { value: filters.source },
                    });
                }
                if (filters.tags && filters.tags.length > 0) {
                    mustConditions.push({
                        key: 'metadata.tags',
                        match: { any: filters.tags },
                    });
                }
                if (mustConditions.length > 0) {
                    filterConditions.must = mustConditions;
                }
            }
            this.logger.warn('hybridSearch需要查询向量，待嵌入服务集成后实现');
            return [];
        }
        catch (error) {
            this.logger.error(`混合检索失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateDocument(docId, content) {
        try {
            const existingDoc = await this.getDocument(docId);
            if (!existingDoc) {
                throw new Error(`文档 ${docId} 不存在`);
            }
            existingDoc.content = content;
            existingDoc.updatedAt = new Date();
            await this.addDocument(existingDoc);
            this.logger.debug(`文档更新成功: ${docId}`);
        }
        catch (error) {
            this.logger.error(`更新文档失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteDocument(docId) {
        try {
            await this.client.delete(this.defaultCollectionName, {
                wait: true,
                points: [docId],
            });
            this.logger.debug(`文档删除成功: ${docId}`);
        }
        catch (error) {
            this.logger.error(`删除文档失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getDocument(docId) {
        try {
            const response = await this.client.retrieve(this.defaultCollectionName, {
                ids: [docId],
                with_payload: true,
                with_vector: false,
            });
            if (!response || response.length === 0) {
                return null;
            }
            const point = response[0];
            const payload = point.payload;
            return {
                id: point.id,
                content: payload.content || '',
                metadata: payload.metadata || {},
                tenantId: payload.tenantId,
                industry: payload.industry,
                source: payload.source,
                createdAt: payload.createdAt ? new Date(payload.createdAt) : undefined,
                updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : undefined,
            };
        }
        catch (error) {
            this.logger.error(`获取文档失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async clearCollection(collectionName) {
        try {
            const targetCollection = collectionName || this.defaultCollectionName;
            await this.client.deleteCollection(targetCollection);
            await this.ensureCollectionExists(targetCollection);
            this.logger.log(`集合 ${targetCollection} 已清空并重新创建`);
        }
        catch (error) {
            this.logger.error(`清空集合失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getCollectionStats(collectionName) {
        try {
            const targetCollection = collectionName || this.defaultCollectionName;
            const info = await this.client.getCollection(targetCollection);
            return {
                collectionName: targetCollection,
                documentCount: info.points_count || 0,
                vectorDimension: info.config.params?.vectors?.size || 0,
                storageSize: info.points_count || 0,
                indexed: true,
                lastIndexedAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`获取集合统计失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async healthCheck() {
        try {
            await this.client.getCollections();
            return {
                status: 'healthy',
                message: 'Qdrant连接正常',
                details: {
                    version: '1.x',
                    uptime: Date.now(),
                },
            };
        }
        catch (error) {
            this.logger.error(`Qdrant健康检查失败: ${error.message}`);
            return {
                status: 'unhealthy',
                message: `Qdrant连接失败: ${error.message}`,
                details: {
                    error: error.message,
                },
            };
        }
    }
    async searchByVector(queryVector, k = 5, filters) {
        try {
            const filterConditions = {};
            if (filters) {
                const mustConditions = [];
                if (filters.tenantId) {
                    mustConditions.push({
                        key: 'tenantId',
                        match: { value: filters.tenantId },
                    });
                }
                if (filters.industry) {
                    mustConditions.push({
                        key: 'industry',
                        match: { value: filters.industry },
                    });
                }
                if (filters.source) {
                    mustConditions.push({
                        key: 'source',
                        match: { value: filters.source },
                    });
                }
                if (filters.tags && filters.tags.length > 0) {
                    mustConditions.push({
                        key: 'metadata.tags',
                        match: { any: filters.tags },
                    });
                }
                if (mustConditions.length > 0) {
                    filterConditions.must = mustConditions;
                }
            }
            const searchParams = {
                vector: queryVector,
                limit: k,
                with_payload: true,
                with_vector: false,
            };
            if (Object.keys(filterConditions).length > 0) {
                searchParams.filter = filterConditions;
            }
            const response = await this.client.search(this.defaultCollectionName, searchParams);
            return response.map((result) => ({
                document: {
                    id: result.id,
                    content: result.payload?.content || '',
                    metadata: result.payload?.metadata || {},
                    tenantId: result.payload?.tenantId,
                    industry: result.payload?.industry,
                    source: result.payload?.source,
                    createdAt: result.payload?.createdAt
                        ? new Date(result.payload.createdAt)
                        : undefined,
                    updatedAt: result.payload?.updatedAt
                        ? new Date(result.payload.updatedAt)
                        : undefined,
                },
                similarity: result.score || 0,
            }));
        }
        catch (error) {
            this.logger.error(`向量搜索失败: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.QdrantAdapter = QdrantAdapter;
exports.QdrantAdapter = QdrantAdapter = QdrantAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QdrantAdapter);
//# sourceMappingURL=qdrant.adapter.js.map