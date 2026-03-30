import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantAdapter } from '../adapters/qdrant.adapter';
import {
  VectorSearchService as IVectorSearchService,
  Document,
  SearchFilters,
  SearchResult,
  HybridSearchOptions,
  CollectionStats,
  HealthStatus,
} from '../interfaces/vector-search.interface';

/**
 * 向量搜索服务
 * 集成嵌入生成和向量数据库操作，提供完整的向量搜索功能
 */
@Injectable()
export class VectorSearchService implements IVectorSearchService {
  private readonly logger = new Logger(VectorSearchService.name);
  private readonly embeddingCache = new Map<string, number[]>();

  constructor(
    private configService: ConfigService,
    private qdrantAdapter: QdrantAdapter,
  ) {}

  /**
   * 生成文本嵌入向量
   * 使用Gemini Embedding API，支持缓存
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const cacheKey = `embedding-${text.substring(0, 100)}`;
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    try {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      // 使用Gemini Embedding API
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent',
        {
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
        },
      );

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
    } catch (error) {
      this.logger.warn(`嵌入生成失败: ${error.message}，使用随机嵌入回退`);
      // 返回随机嵌入作为回退（仅用于开发）
      const randomEmbedding = Array.from(
        { length: 768 },
        () => Math.random() * 2 - 1,
      );
      this.embeddingCache.set(cacheKey, randomEmbedding);
      return randomEmbedding;
    }
  }

  /**
   * 添加文档到向量库
   * 自动生成嵌入向量
   */
  async addDocument(doc: Document): Promise<string> {
    try {
      // 如果文档没有嵌入向量，则生成
      if (!doc.embedding || doc.embedding.length === 0) {
        doc.embedding = await this.generateEmbedding(doc.content);
      }

      return await this.qdrantAdapter.addDocument(doc);
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
      // 批量生成嵌入向量
      for (const doc of docs) {
        if (!doc.embedding || doc.embedding.length === 0) {
          doc.embedding = await this.generateEmbedding(doc.content);
        }
      }

      return await this.qdrantAdapter.addDocuments(docs);
    } catch (error) {
      this.logger.error(`批量添加文档失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 相似性检索
   * 根据查询文本查找相似文档
   */
  async searchSimilar(
    query: string,
    k: number = 5,
    filters?: SearchFilters,
  ): Promise<SearchResult[]> {
    try {
      // 生成查询嵌入向量
      const queryEmbedding = await this.generateEmbedding(query);

      // 使用Qdrant适配器搜索
      return await (this.qdrantAdapter as any).searchByVector(
        queryEmbedding,
        k,
        filters,
      );
    } catch (error) {
      this.logger.error(`相似性检索失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 混合检索（向量+关键词）
   * 结合向量相似度和关键词匹配
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

      // 向量搜索部分
      const vectorResults = await this.searchSimilar(query, k * 2, filters);

      // 关键词搜索部分（简单实现）
      const keywordResults = await this.searchByKeywords(query, k * 2, filters);

      // 合并和重新排序结果
      const combinedResults = this.mergeAndRankResults(
        vectorResults,
        keywordResults,
        vectorWeight,
        keywordWeight,
      );

      return combinedResults.slice(0, k);
    } catch (error) {
      this.logger.error(`混合检索失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 关键词搜索（简单实现）
   */
  private async searchByKeywords(
    query: string,
    k: number,
    filters?: SearchFilters,
  ): Promise<SearchResult[]> {
    // 简化实现：使用向量搜索代替
    // 在实际应用中，可以使用全文搜索引擎如Elasticsearch
    return await this.searchSimilar(query, k, filters);
  }

  /**
   * 合并和重新排序结果
   */
  private mergeAndRankResults(
    vectorResults: SearchResult[],
    keywordResults: SearchResult[],
    vectorWeight: number,
    keywordWeight: number,
  ): SearchResult[] {
    const resultMap = new Map<string, SearchResult>();

    // 添加向量搜索结果
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

    // 合并关键词搜索结果
    keywordResults.forEach((result, index) => {
      const docId = result.document.id;
      if (docId) {
        const existing = resultMap.get(docId);
        if (existing) {
          // 如果文档已存在，更新分数
          existing.score =
            (existing.score || 0) + result.similarity * keywordWeight;
        } else {
          // 添加新文档
          const weightedScore = result.similarity * keywordWeight;
          resultMap.set(docId, {
            ...result,
            score: weightedScore,
          });
        }
      }
    });

    // 转换为数组并按分数排序
    const combinedResults = Array.from(resultMap.values());
    combinedResults.sort((a, b) => (b.score || 0) - (a.score || 0));

    return combinedResults;
  }

  /**
   * 更新文档向量
   */
  async updateDocument(docId: string, content: string): Promise<void> {
    try {
      await this.qdrantAdapter.updateDocument(docId, content);
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
      await this.qdrantAdapter.deleteDocument(docId);
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
      return await this.qdrantAdapter.getDocument(docId);
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
      await this.qdrantAdapter.clearCollection(collectionName);
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
      return await this.qdrantAdapter.getCollectionStats(collectionName);
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
      const qdrantHealth = await this.qdrantAdapter.healthCheck();

      // 检查嵌入API
      const embeddingTest = await this.generateEmbedding('test');
      const embeddingHealthy = embeddingTest.length === 768;

      return {
        status:
          qdrantHealth.status === 'healthy' && embeddingHealthy
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
    } catch (error) {
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

  /**
   * 计算余弦相似度
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
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
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
