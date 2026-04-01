import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import {
  VectorSearchService,
  Document,
  SearchFilters,
  SearchResult,
  HybridSearchOptions,
  CollectionStats,
  HealthStatus,
} from '../interfaces/vector-search.interface';

/**
 * Qdrant向量数据库适配器
 * 实现VectorSearchService接口，提供Qdrant向量数据库的集成
 */
@Injectable()
export class QdrantAdapter implements VectorSearchService, OnModuleInit {
  private readonly logger = new Logger(QdrantAdapter.name);
  private client: QdrantClient;
  private defaultCollectionName = 'knowledge_base';
  private vectorDimension = 768; // 默认向量维度，与Gemini Embedding一致

  constructor(private configService: ConfigService) {}

  /**
   * 模块初始化：连接Qdrant数据库
   */
  async onModuleInit() {
    try {
      await this.initialize();
    } catch (error) {
      this.logger.warn(
        `Qdrant初始化失败，向量搜索功能不可用: ${error.message}`,
      );
    }
  }

  /**
   * 初始化Qdrant客户端
   */
  private async initialize(): Promise<void> {
    try {
      const host = this.configService.get<string>('QDRANT_HOST') || 'localhost';
      const port = this.configService.get<number>('QDRANT_PORT') || 6333;
      const apiKey = this.configService.get<string>('QDRANT_API_KEY');
      // 从环境变量中获取认证启用状态（处理字符串形式的布尔值）
      const enableAuthRaw = this.configService.get<string | boolean>('QDRANT_ENABLE_AUTH');
      // 解析布尔值：支持 "true", "false", true, false
      let enableAuth: boolean | undefined;
      if (enableAuthRaw !== undefined && enableAuthRaw !== null) {
        enableAuth = enableAuthRaw === 'true' || enableAuthRaw === true;
      }

      // 如果没有定义QDRANT_ENABLE_AUTH，默认认为应该禁用认证（开发环境）
      const useAuth = enableAuth !== undefined ? enableAuth : !!(apiKey && apiKey.trim() !== '');

      const options: any = {
        host,
        port,
      };

      // 仅当启用了认证并且提供了有效的密钥时才添加API密钥
      if (useAuth && apiKey && apiKey.trim() !== '') {
        options.apiKey = apiKey.trim();
      }

      // 如果明确禁用了认证，确保不设置任何认证信息
      if (enableAuth === false) {
        this.logger.log('Qdrant认证已明确禁用，使用无认证连接');
        // 不设置apiKey
      }

      this.client = new QdrantClient(options);

      // 测试连接
      await this.healthCheck();

      // 确保默认集合存在
      await this.ensureCollectionExists(this.defaultCollectionName);

      this.logger.log(
        `Qdrant适配器初始化完成，连接到 ${host}:${port}，集合：${this.defaultCollectionName}，认证：${useAuth ? '已启用' : '已禁用'}`,
      );
    } catch (error) {
      this.logger.error(
        `Qdrant适配器初始化失败: ${error.message}`,
        error.stack,
      );
      // 不抛出错误，而是记录错误，让应用可以继续运行（Qdrant作为可选服务）
    }
  }

  /**
   * 确保集合存在，如果不存在则创建
   */
  private async ensureCollectionExists(collectionName: string): Promise<void> {
    try {
      const collections = await this.client.getCollections();
      const collectionExists = collections.collections.some(
        (col) => col.name === collectionName,
      );

      if (!collectionExists) {
        this.logger.log(`创建向量集合: ${collectionName}`);
        await this.client.createCollection(collectionName, {
          vectors: {
            size: this.vectorDimension,
            distance: 'Cosine', // 余弦相似度
          },
        });
        this.logger.log(`集合 ${collectionName} 创建成功`);
      }
    } catch (error) {
      this.logger.error(`确保集合存在失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 添加文档到向量库
   */
  async addDocument(doc: Document): Promise<string> {
    try {
      const documentId =
        doc.id ||
        `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 准备向量点
      const point = {
        id: documentId,
        vector: doc.embedding || [], // 如果没有提供嵌入向量，稍后需要生成
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
    } catch (error) {
      this.logger.error(`添加文档失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 批量添加文档
   */
  async addDocuments(docs: Document[]): Promise<string[]> {
    try {
      const points = docs.map((doc) => {
        const documentId =
          doc.id ||
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
    } catch (error) {
      this.logger.error(`批量添加文档失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 相似性检索
   */
  async searchSimilar(
    query: string,
    k: number = 5,
    filters?: SearchFilters,
  ): Promise<SearchResult[]> {
    try {
      // 注意：这个实现需要查询文本的嵌入向量
      // 在实际使用中，需要先调用嵌入生成服务将query转换为向量
      // 这里假设调用者会提供查询向量，我们这里简化处理
      this.logger.warn(
        'searchSimilar需要查询向量，请使用hybridSearch或提供嵌入向量',
      );
      return [];
    } catch (error) {
      this.logger.error(`相似性检索失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 混合检索（向量+关键词）
   */
  async hybridSearch(
    query: string,
    options: HybridSearchOptions,
  ): Promise<SearchResult[]> {
    try {
      const {
        k = 5,
        filters,
        vectorWeight = 0.7,
        keywordWeight = 0.3,
      } = options;

      // 构建过滤条件
      const filterConditions: any = {};

      if (filters) {
        const mustConditions: any[] = [];

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

      // 执行向量搜索（需要查询向量）
      // 这里简化实现，实际需要嵌入向量
      // 暂时返回空结果，实际集成时需要嵌入服务
      this.logger.warn('hybridSearch需要查询向量，待嵌入服务集成后实现');
      return [];
    } catch (error) {
      this.logger.error(`混合检索失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 更新文档向量
   */
  async updateDocument(docId: string, content: string): Promise<void> {
    try {
      // 获取现有文档
      const existingDoc = await this.getDocument(docId);
      if (!existingDoc) {
        throw new Error(`文档 ${docId} 不存在`);
      }

      // 更新文档内容
      existingDoc.content = content;
      existingDoc.updatedAt = new Date();

      // 重新添加文档（覆盖）
      await this.addDocument(existingDoc);

      this.logger.debug(`文档更新成功: ${docId}`);
    } catch (error) {
      this.logger.error(`更新文档失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 删除文档
   */
  async deleteDocument(docId: string): Promise<void> {
    try {
      await this.client.delete(this.defaultCollectionName, {
        wait: true,
        points: [docId],
      });

      this.logger.debug(`文档删除成功: ${docId}`);
    } catch (error) {
      this.logger.error(`删除文档失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取文档信息
   */
  async getDocument(docId: string): Promise<Document | null> {
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
      const payload = point.payload as any;

      return {
        id: point.id as string,
        content: payload.content || '',
        metadata: payload.metadata || {},
        tenantId: payload.tenantId,
        industry: payload.industry,
        source: payload.source,
        createdAt: payload.createdAt ? new Date(payload.createdAt) : undefined,
        updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : undefined,
      };
    } catch (error) {
      this.logger.error(`获取文档失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 清空向量库
   */
  async clearCollection(collectionName?: string): Promise<void> {
    try {
      const targetCollection = collectionName || this.defaultCollectionName;
      await this.client.deleteCollection(targetCollection);

      // 重新创建集合
      await this.ensureCollectionExists(targetCollection);

      this.logger.log(`集合 ${targetCollection} 已清空并重新创建`);
    } catch (error) {
      this.logger.error(`清空集合失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取集合统计信息
   */
  async getCollectionStats(collectionName?: string): Promise<CollectionStats> {
    try {
      const targetCollection = collectionName || this.defaultCollectionName;
      const info = await this.client.getCollection(targetCollection);

      return {
        collectionName: targetCollection,
        documentCount: info.points_count || 0,
        vectorDimension: (info.config.params?.vectors as any)?.size || 0,
        storageSize: info.points_count || 0,
        indexed: true, // Qdrant默认索引
        lastIndexedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`获取集合统计失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<HealthStatus> {
    try {
      await this.client.getCollections();

      return {
        status: 'healthy',
        message: 'Qdrant连接正常',
        details: {
          version: '1.x', // Qdrant版本需要从API获取
          uptime: Date.now(), // 简化处理
        },
      };
    } catch (error) {
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

  /**
   * 搜索相似向量（使用向量直接搜索）
   * 内部方法，需要查询向量
   */
  async searchByVector(
    queryVector: number[],
    k: number = 5,
    filters?: SearchFilters,
  ): Promise<SearchResult[]> {
    try {
      // 构建过滤条件
      const filterConditions: any = {};

      if (filters) {
        const mustConditions: any[] = [];

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

      // 执行向量搜索
      const searchParams: any = {
        vector: queryVector,
        limit: k,
        with_payload: true,
        with_vector: false,
      };

      if (Object.keys(filterConditions).length > 0) {
        searchParams.filter = filterConditions;
      }

      const response = await this.client.search(
        this.defaultCollectionName,
        searchParams,
      );

      return response.map((result) => ({
        document: {
          id: result.id as string,
          content: (result.payload as any)?.content || '',
          metadata: (result.payload as any)?.metadata || {},
          tenantId: (result.payload as any)?.tenantId,
          industry: (result.payload as any)?.industry,
          source: (result.payload as any)?.source,
          createdAt: (result.payload as any)?.createdAt
            ? new Date((result.payload as any).createdAt)
            : undefined,
          updatedAt: (result.payload as any)?.updatedAt
            ? new Date((result.payload as any).updatedAt)
            : undefined,
        },
        similarity: result.score || 0,
      }));
    } catch (error) {
      this.logger.error(`向量搜索失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
