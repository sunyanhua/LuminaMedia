import { Injectable } from '@nestjs/common';
import { TenantRepository } from './tenant.repository';
import {
  KnowledgeDocument,
  DocumentStatus,
  DocumentProcessingStatus,
  DocumentSourceType,
} from '../../entities/knowledge-document.entity';
import { DataSource } from 'typeorm';

/**
 * KnowledgeDocument实体的租户感知Repository
 * 提供知识库文档的特定查询方法
 */
@Injectable()
export class KnowledgeDocumentRepository extends TenantRepository<KnowledgeDocument> {
  constructor(private dataSource: DataSource) {
    super(
      KnowledgeDocument,
      dataSource.createEntityManager(),
      dataSource.createQueryRunner(),
    );
  }

  /**
   * 根据状态查找文档
   */
  async findByStatus(status: DocumentStatus): Promise<KnowledgeDocument[]> {
    return this.createQueryBuilder('doc')
      .where('doc.status = :status', { status })
      .orderBy('doc.updated_at', 'DESC')
      .getMany();
  }

  /**
   * 根据处理状态查找文档
   */
  async findByProcessingStatus(
    processingStatus: DocumentProcessingStatus,
  ): Promise<KnowledgeDocument[]> {
    return this.createQueryBuilder('doc')
      .where('doc.processingStatus = :processingStatus', { processingStatus })
      .orderBy('doc.updated_at', 'DESC')
      .getMany();
  }

  /**
   * 根据来源类型查找文档
   */
  async findBySourceType(
    sourceType: DocumentSourceType,
  ): Promise<KnowledgeDocument[]> {
    return this.createQueryBuilder('doc')
      .where('doc.sourceType = :sourceType', { sourceType })
      .orderBy('doc.created_at', 'DESC')
      .getMany();
  }

  /**
   * 根据分类查找文档
   */
  async findByCategory(category: string): Promise<KnowledgeDocument[]> {
    return this.createQueryBuilder('doc')
      .where('doc.category = :category', { category })
      .orderBy('doc.created_at', 'DESC')
      .getMany();
  }

  /**
   * 根据标签查找文档（标签数组包含指定标签）
   */
  async findByTag(tag: string): Promise<KnowledgeDocument[]> {
    return this.createQueryBuilder('doc')
      .where('JSON_CONTAINS(doc.tags, :tag)', { tag: JSON.stringify(tag) })
      .orderBy('doc.created_at', 'DESC')
      .getMany();
  }

  /**
   * 根据内容哈希查找文档（用于去重）
   */
  async findByContentHash(
    contentHash: string,
  ): Promise<KnowledgeDocument | null> {
    return this.createQueryBuilder('doc')
      .where('doc.contentHash = :contentHash', { contentHash })
      .getOne();
  }

  /**
   * 查找已向量化的文档
   */
  async findVectorizedDocuments(limit?: number): Promise<KnowledgeDocument[]> {
    const queryBuilder = this.createQueryBuilder('doc')
      .where('doc.processingStatus IN (:...statuses)', {
        statuses: [
          DocumentProcessingStatus.VECTORIZED,
          DocumentProcessingStatus.ANALYZED,
        ],
      })
      .andWhere('doc.status = :activeStatus', {
        activeStatus: DocumentStatus.ACTIVE,
      })
      .orderBy('doc.vectorizedAt', 'DESC');

    if (limit) {
      queryBuilder.take(limit);
    }

    return queryBuilder.getMany();
  }

  /**
   * 查找待处理的文档（未向量化或处理失败）
   */
  async findPendingProcessing(limit?: number): Promise<KnowledgeDocument[]> {
    const queryBuilder = this.createQueryBuilder('doc')
      .where('doc.processingStatus IN (:...statuses)', {
        statuses: [
          DocumentProcessingStatus.PENDING,
          DocumentProcessingStatus.FAILED,
        ],
      })
      .andWhere('doc.status = :activeStatus', {
        activeStatus: DocumentStatus.ACTIVE,
      })
      .orderBy('doc.created_at', 'ASC');

    if (limit) {
      queryBuilder.take(limit);
    }

    return queryBuilder.getMany();
  }

  /**
   * 搜索文档（标题和内容模糊搜索）
   */
  async searchDocuments(
    query: string,
    options?: {
      category?: string;
      sourceType?: DocumentSourceType;
      limit?: number;
    },
  ): Promise<KnowledgeDocument[]> {
    const { category, sourceType, limit = 50 } = options || {};

    const queryBuilder = this.createQueryBuilder('doc')
      .where('(doc.title LIKE :query OR doc.content LIKE :query)', {
        query: `%${query}%`,
      })
      .andWhere('doc.status = :activeStatus', {
        activeStatus: DocumentStatus.ACTIVE,
      })
      .orderBy('doc.updated_at', 'DESC');

    if (category) {
      queryBuilder.andWhere('doc.category = :category', { category });
    }

    if (sourceType) {
      queryBuilder.andWhere('doc.sourceType = :sourceType', { sourceType });
    }

    if (limit) {
      queryBuilder.take(limit);
    }

    return queryBuilder.getMany();
  }

  /**
   * 获取分类统计
   */
  async getCategoryStats(): Promise<
    Array<{ category: string; count: number }>
  > {
    const results = await this.createQueryBuilder('doc')
      .select('doc.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('doc.category IS NOT NULL')
      .andWhere('doc.status = :activeStatus', {
        activeStatus: DocumentStatus.ACTIVE,
      })
      .groupBy('doc.category')
      .orderBy('count', 'DESC')
      .getRawMany();

    return results.map((row) => ({
      category: row.category,
      count: parseInt(row.count, 10),
    }));
  }

  /**
   * 获取来源类型统计
   */
  async getSourceTypeStats(): Promise<
    Array<{ sourceType: string; count: number }>
  > {
    const results = await this.createQueryBuilder('doc')
      .select('doc.sourceType', 'sourceType')
      .addSelect('COUNT(*)', 'count')
      .where('doc.status = :activeStatus', {
        activeStatus: DocumentStatus.ACTIVE,
      })
      .groupBy('doc.sourceType')
      .orderBy('count', 'DESC')
      .getRawMany();

    return results.map((row) => ({
      sourceType: row.sourceType,
      count: parseInt(row.count, 10),
    }));
  }

  /**
   * 获取文档质量评分统计
   */
  async getQualityStats(): Promise<{
    avgOverall: number;
    avgCompleteness: number;
    avgRelevance: number;
    avgFreshness: number;
    avgAuthority: number;
    avgReadability: number;
  }> {
    const result = await this.createQueryBuilder('doc')
      .select("AVG(JSON_EXTRACT(doc.quality_score, '$.overall'))", 'avgOverall')
      .addSelect(
        "AVG(JSON_EXTRACT(doc.quality_score, '$.completeness'))",
        'avgCompleteness',
      )
      .addSelect(
        "AVG(JSON_EXTRACT(doc.quality_score, '$.relevance'))",
        'avgRelevance',
      )
      .addSelect(
        "AVG(JSON_EXTRACT(doc.quality_score, '$.freshness'))",
        'avgFreshness',
      )
      .addSelect(
        "AVG(JSON_EXTRACT(doc.quality_score, '$.authority'))",
        'avgAuthority',
      )
      .addSelect(
        "AVG(JSON_EXTRACT(doc.quality_score, '$.readability'))",
        'avgReadability',
      )
      .where('doc.quality_score IS NOT NULL')
      .andWhere('doc.status = :activeStatus', {
        activeStatus: DocumentStatus.ACTIVE,
      })
      .getRawOne();

    return {
      avgOverall: parseFloat(result?.avgOverall) || 0,
      avgCompleteness: parseFloat(result?.avgCompleteness) || 0,
      avgRelevance: parseFloat(result?.avgRelevance) || 0,
      avgFreshness: parseFloat(result?.avgFreshness) || 0,
      avgAuthority: parseFloat(result?.avgAuthority) || 0,
      avgReadability: parseFloat(result?.avgReadability) || 0,
    };
  }

  /**
   * 批量更新文档处理状态
   */
  async batchUpdateProcessingStatus(
    documentIds: string[],
    processingStatus: DocumentProcessingStatus,
    errorMessage?: string,
  ): Promise<void> {
    if (documentIds.length === 0) return;

    await this.createQueryBuilder()
      .update(KnowledgeDocument)
      .set({
        processingStatus,
        processingError: errorMessage || undefined,
        updatedAt: () => 'CURRENT_TIMESTAMP',
      })
      .where('id IN (:...ids)', { ids: documentIds })
      .execute();
  }

  /**
   * 更新文档向量信息
   */
  async updateVectorInfo(
    documentId: string,
    vectorId: string,
    processingStatus: DocumentProcessingStatus = DocumentProcessingStatus.VECTORIZED,
  ): Promise<void> {
    await this.createQueryBuilder()
      .update(KnowledgeDocument)
      .set({
        vectorId,
        processingStatus,
        vectorizedAt: () => 'CURRENT_TIMESTAMP',
        updatedAt: () => 'CURRENT_TIMESTAMP',
      })
      .where('id = :id', { id: documentId })
      .execute();
  }

  /**
   * 获取文档数量统计（按状态）
   */
  async getCountByStatus(): Promise<Array<{ status: string; count: number }>> {
    const results = await this.createQueryBuilder('doc')
      .select('doc.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('doc.status')
      .getRawMany();

    return results.map((row) => ({
      status: row.status,
      count: parseInt(row.count, 10),
    }));
  }

  /**
   * 获取文档数量统计（按处理状态）
   */
  async getCountByProcessingStatus(): Promise<
    Array<{ processingStatus: string; count: number }>
  > {
    const results = await this.createQueryBuilder('doc')
      .select('doc.processingStatus', 'processingStatus')
      .addSelect('COUNT(*)', 'count')
      .groupBy('doc.processingStatus')
      .getRawMany();

    return results.map((row) => ({
      processingStatus: row.processingStatus,
      count: parseInt(row.count, 10),
    }));
  }
}
