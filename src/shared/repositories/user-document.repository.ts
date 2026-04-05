import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserDocument } from '../../entities/user-document.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserDocumentRepository extends BaseRepository<UserDocument> {
  constructor(private dataSource: DataSource) {
    super(UserDocument, dataSource.createEntityManager(), dataSource.createQueryRunner());
  }

  /**
   * 根据用户ID查询文档列表
   */
  async findByUserId(
    userId: string,
    options?: {
      reportType?: string;
      fileType?: string;
      limit?: number;
      offset?: number;
      includePublic?: boolean;
    },
  ): Promise<[UserDocument[], number]> {
    const query = this.createQueryBuilder('doc')
      .where('doc.userId = :userId', { userId })
      .andWhere('doc.deletedAt IS NULL');

    if (options?.reportType) {
      query.andWhere('doc.reportType = :reportType', { reportType: options.reportType });
    }

    if (options?.fileType) {
      query.andWhere('doc.fileType = :fileType', { fileType: options.fileType });
    }

    if (!options?.includePublic) {
      query.andWhere('doc.isPublic = false');
    }

    return query
      .orderBy('doc.createdAt', 'DESC')
      .skip(options?.offset || 0)
      .take(options?.limit || 20)
      .getManyAndCount();
  }

  /**
   * 根据提取状态查询文档
   */
  async findByExtractionStatus(
    status: string,
    limit?: number,
  ): Promise<UserDocument[]> {
    return this.createQueryBuilder('doc')
      .where('doc.extractionStatus = :status', { status })
      .andWhere('doc.deletedAt IS NULL')
      .orderBy('doc.createdAt', 'ASC')
      .limit(limit || 10)
      .getMany();
  }

  /**
   * 获取用户文档统计
   */
  async getUserDocumentStats(userId: string): Promise<{
    total: number;
    byFileType: Record<string, number>;
    byReportType: Record<string, number>;
    byExtractionStatus: Record<string, number>;
  }> {
    const query = this.createQueryBuilder('doc')
      .where('doc.userId = :userId', { userId })
      .andWhere('doc.deletedAt IS NULL');

    const documents = await query.getMany();

    const byFileType: Record<string, number> = {};
    const byReportType: Record<string, number> = {};
    const byExtractionStatus: Record<string, number> = {};

    documents.forEach(doc => {
      // 按文件类型统计
      const fileType = doc.fileType || 'unknown';
      byFileType[fileType] = (byFileType[fileType] || 0) + 1;

      // 按报告类型统计
      const reportType = doc.reportType || 'none';
      byReportType[reportType] = (byReportType[reportType] || 0) + 1;

      // 按提取状态统计
      const status = doc.extractionStatus || 'unknown';
      byExtractionStatus[status] = (byExtractionStatus[status] || 0) + 1;
    });

    return {
      total: documents.length,
      byFileType,
      byReportType,
      byExtractionStatus,
    };
  }

  /**
   * 查找需要处理的文档（用于后台任务）
   */
  async findDocumentsNeedingProcessing(limit = 10): Promise<UserDocument[]> {
    return this.createQueryBuilder('doc')
      .where('doc.extractionStatus IN (:...statuses)', {
        statuses: ['pending', 'failed'],
      })
      .andWhere('doc.deletedAt IS NULL')
      .andWhere('doc.fileType IN (:...fileTypes)', {
        fileTypes: ['word', 'pdf', 'text', 'markdown'],
      })
      .orderBy('doc.createdAt', 'ASC')
      .limit(limit)
      .getMany();
  }

  /**
   * 更新文档提取状态
   */
  async updateExtractionStatus(
    documentId: string,
    status: string,
    errorMessage?: string,
    content?: string,
    summary?: string,
    keywords?: string[],
  ): Promise<void> {
    await this.update(documentId, {
      extractionStatus: status,
      extractionError: errorMessage,
      content,
      summary,
      keywords,
    });
  }
}