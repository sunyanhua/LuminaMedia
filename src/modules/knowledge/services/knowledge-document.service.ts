import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, In } from 'typeorm';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { htmlToText } from 'html-to-text';

import {
  KnowledgeDocument,
  DocumentSourceType,
  FileType,
  DocumentStatus,
  DocumentProcessingStatus,
  FileInfo,
  DocumentMetadata,
  DocumentQualityScore,
} from '../../../entities/knowledge-document.entity';
import { KnowledgeDocumentRepository } from '../../../shared/repositories/knowledge-document.repository';
import { VectorSearchService } from '../../../shared/vector/services/vector-search.service';
import { Document } from '../../../shared/vector/interfaces/vector-search.interface';
import { TenantContextService } from '../../../shared/services/tenant-context.service';

// 文档导入选项
export interface DocumentImportOptions {
  title?: string;
  category?: string;
  tags?: string[];
  language?: string;
  metadata?: Partial<DocumentMetadata>;
  isPublic?: boolean;
  accessControl?: string[];
}

// 文件上传结果
export interface FileUploadResult {
  originalName: string;
  storagePath: string;
  mimeType: string;
  size: number;
}

// URL抓取结果
export interface UrlCrawlResult {
  url: string;
  title: string;
  content: string;
  metadata: {
    author?: string;
    publishDate?: Date;
    wordCount: number;
    readingTime: number;
    keywords?: string[];
  };
}

/**
 * 知识库文档管理服务
 * 负责文档的CRUD、多源导入、分类管理、质量评估和向量化处理
 */
@Injectable()
export class KnowledgeDocumentService {
  private readonly logger = new Logger(KnowledgeDocumentService.name);

  constructor(
    @InjectRepository(KnowledgeDocumentRepository)
    private knowledgeDocumentRepository: KnowledgeDocumentRepository,
    private vectorSearchService: VectorSearchService,
    private configService: ConfigService,
  ) {}

  /**
   * 创建新文档
   */
  async createDocument(
    data: {
      title: string;
      content: string;
      summary?: string;
      sourceType: DocumentSourceType;
      sourceUrl?: string;
      fileInfo?: FileInfo;
      category?: string;
      tags?: string[];
      language?: string;
      metadata?: DocumentMetadata;
    },
    options?: { autoVectorize?: boolean },
  ): Promise<KnowledgeDocument> {
    try {
      this.logger.log(`创建新文档: ${data.title}`);

      // 检查必填字段
      if (!data.title || !data.content) {
        throw new BadRequestException('文档标题和内容为必填项');
      }

      // 计算内容哈希（用于去重）
      const contentHash = crypto
        .createHash('sha256')
        .update(data.content)
        .digest('hex');

      // 检查是否已存在相同内容的文档
      const existingDoc =
        await this.knowledgeDocumentRepository.findByContentHash(contentHash);
      if (existingDoc) {
        throw new ConflictException('已存在相同内容的文档');
      }

      // 获取当前租户和用户
      const tenantId = TenantContextService.getCurrentTenantIdStatic();
      const currentUserId = TenantContextService.getCurrentTenantIdStatic(); // TODO: 需要获取当前用户ID

      // 确定文件类型
      const fileType = this.determineFileTypeFromSource(
        data.sourceType,
        data.fileInfo?.mimeType,
      );

      // 创建文档实体
      const document = this.knowledgeDocumentRepository.create({
        tenantId,
        createdBy: currentUserId,
        title: data.title,
        content: data.content,
        summary: data.summary || this.generateSummary(data.content),
        sourceType: data.sourceType,
        sourceUrl: data.sourceUrl,
        fileType,
        fileInfo: data.fileInfo,
        category: data.category,
        tags: data.tags || [],
        language: data.language || 'zh-CN',
        metadata: data.metadata || {},
        status: DocumentStatus.DRAFT,
        processingStatus: DocumentProcessingStatus.PENDING,
        contentHash,
        qualityScore: this.assessDocumentQuality(data.content, data.metadata),
      } as any);

      const savedDocument =
        await this.knowledgeDocumentRepository.save(document);
      // TypeORM的save方法可能返回数组，确保获取单个实体
      const result = Array.isArray(savedDocument)
        ? savedDocument[0]
        : savedDocument;
      this.logger.log(`文档创建成功: ${result.id}`);

      // 如果启用自动向量化，则启动处理
      if (options?.autoVectorize !== false) {
        this.processDocumentForVectorization(result.id).catch((error) => {
          this.logger.error(
            `文档向量化处理失败: ${error.message}`,
            error.stack,
          );
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`创建文档失败: ${error.message}`, error.stack);
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('创建文档失败');
    }
  }

  /**
   * 获取文档详情
   */
  async getDocument(documentId: string): Promise<KnowledgeDocument> {
    const document =
      await this.knowledgeDocumentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`文档不存在: ${documentId}`);
    }
    return document;
  }

  /**
   * 更新文档
   */
  async updateDocument(
    documentId: string,
    updates: Partial<{
      title: string;
      content: string;
      summary: string;
      category: string;
      tags: string[];
      language: string;
      metadata: DocumentMetadata;
      status: DocumentStatus;
      isPublic: boolean;
      accessControl: string[];
      processingStatus: DocumentProcessingStatus;
      processingError: string;
      vectorId: string | null;
      vectorizedAt: Date;
      contentHash: string;
      qualityScore: DocumentQualityScore;
    }>,
  ): Promise<KnowledgeDocument> {
    try {
      this.logger.log(`更新文档: ${documentId}`);

      const document = await this.getDocument(documentId);

      // 如果内容有更新，重新计算哈希和质量评分
      if (updates.content && updates.content !== document.content) {
        const contentHash = crypto
          .createHash('sha256')
          .update(updates.content)
          .digest('hex');
        updates['contentHash'] = contentHash;
        updates['qualityScore'] = this.assessDocumentQuality(
          updates.content,
          updates.metadata || document.metadata,
        );
        updates['processingStatus'] = DocumentProcessingStatus.PENDING; // 需要重新向量化
      }

      // 更新文档
      await this.knowledgeDocumentRepository.updateById(
        documentId,
        updates as any,
      );

      // 如果内容已更新且文档为活跃状态，重新向量化
      if (updates.content && document.status === DocumentStatus.ACTIVE) {
        this.processDocumentForVectorization(documentId).catch((error) => {
          this.logger.error(
            `文档重新向量化失败: ${error.message}`,
            error.stack,
          );
        });
      }

      return await this.getDocument(documentId);
    } catch (error) {
      this.logger.error(`更新文档失败: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('更新文档失败');
    }
  }

  /**
   * 删除文档（软删除）
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      this.logger.log(`删除文档: ${documentId}`);

      const document = await this.getDocument(documentId);

      // 从向量数据库中删除
      if (document.vectorId) {
        try {
          await this.vectorSearchService.deleteDocument(document.vectorId);
          this.logger.debug(`已从向量数据库中删除文档: ${document.vectorId}`);
        } catch (error) {
          this.logger.warn(`从向量数据库删除文档失败: ${error.message}`);
        }
      }

      // 软删除：标记删除时间
      await this.knowledgeDocumentRepository.updateById(documentId, {
        deletedAt: new Date(),
        status: DocumentStatus.ARCHIVED,
      } as any);

      this.logger.log(`文档删除成功: ${documentId}`);
    } catch (error) {
      this.logger.error(`删除文档失败: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('删除文档失败');
    }
  }

  /**
   * 批量删除文档
   */
  async batchDeleteDocuments(documentIds: string[]): Promise<void> {
    for (const documentId of documentIds) {
      try {
        await this.deleteDocument(documentId);
      } catch (error) {
        this.logger.error(`批量删除文档失败 ${documentId}: ${error.message}`);
      }
    }
  }

  /**
   * 搜索文档
   */
  async searchDocuments(
    query: string,
    filters?: {
      category?: string;
      sourceType?: DocumentSourceType;
      status?: DocumentStatus;
      tags?: string[];
      limit?: number;
      offset?: number;
    },
  ): Promise<{ documents: KnowledgeDocument[]; total: number }> {
    const {
      category,
      sourceType,
      status,
      tags,
      limit = 50,
      offset = 0,
    } = filters || {};

    // 构建查询条件
    const whereConditions: any = {};

    if (category) {
      whereConditions.category = category;
    }

    if (sourceType) {
      whereConditions.sourceType = sourceType;
    }

    if (status) {
      whereConditions.status = status;
    }

    // 文本搜索
    let documents: KnowledgeDocument[];
    if (query) {
      documents = await this.knowledgeDocumentRepository.searchDocuments(
        query,
        {
          category,
          sourceType,
          limit,
        },
      );
    } else {
      // 无查询文本时，获取所有文档
      documents = await this.knowledgeDocumentRepository.find({
        where: whereConditions,
        take: limit,
        skip: offset,
        order: { updated_at: 'DESC' },
      });
    }

    // 标签过滤（如果指定了标签）
    if (tags && tags.length > 0) {
      documents = documents.filter(
        (doc) => doc.tags && tags.some((tag) => doc.tags.includes(tag)),
      );
    }

    // 获取总数
    const total = await this.knowledgeDocumentRepository.count({
      where: whereConditions,
    });

    return { documents, total };
  }

  /**
   * 导入文件文档
   */
  async importFileDocument(
    file: FileUploadResult,
    options?: DocumentImportOptions,
  ): Promise<KnowledgeDocument> {
    try {
      this.logger.log(`导入文件文档: ${file.originalName}`);

      // 提取文件内容（这里需要实现文件内容提取逻辑）
      const content = await this.extractFileContent(file);
      const title =
        options?.title || file.originalName.replace(/\.[^/.]+$/, ''); // 移除扩展名

      // 提取文件元数据
      const metadata: DocumentMetadata = {
        ...options?.metadata,
        extractionMethod: 'file-upload',
        extractedAt: new Date(),
        wordCount: this.countWords(content),
        readingTime: Math.ceil(this.countWords(content) / 200), // 假设阅读速度200字/分钟
      };

      // 创建文档
      const document = await this.createDocument({
        title,
        content,
        sourceType: DocumentSourceType.FILE,
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

      // 自动激活文档
      await this.knowledgeDocumentRepository.updateById(document.id, {
        status: DocumentStatus.ACTIVE,
      });

      this.logger.log(`文件文档导入成功: ${document.id}`);
      return document;
    } catch (error) {
      this.logger.error(`导入文件文档失败: ${error.message}`, error.stack);
      throw new InternalServerErrorException('导入文件文档失败');
    }
  }

  /**
   * 导入URL文档
   */
  async importUrlDocument(
    url: string,
    options?: DocumentImportOptions,
  ): Promise<KnowledgeDocument> {
    try {
      this.logger.log(`导入URL文档: ${url}`);

      // 抓取URL内容（这里需要实现网页抓取逻辑）
      const crawlResult = await this.crawlUrlContent(url);
      const title = options?.title || crawlResult.title;

      // 创建文档
      const document = await this.createDocument({
        title,
        content: crawlResult.content,
        summary: this.generateSummary(crawlResult.content),
        sourceType: DocumentSourceType.URL,
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

      // 自动激活文档
      await this.knowledgeDocumentRepository.updateById(document.id, {
        status: DocumentStatus.ACTIVE,
      });

      this.logger.log(`URL文档导入成功: ${document.id}`);
      return document;
    } catch (error) {
      this.logger.error(`导入URL文档失败: ${error.message}`, error.stack);
      throw new InternalServerErrorException('导入URL文档失败');
    }
  }

  /**
   * 导入API文档
   */
  async importApiDocument(
    apiData: {
      title: string;
      content: string;
      metadata?: Record<string, any>;
    },
    options?: DocumentImportOptions,
  ): Promise<KnowledgeDocument> {
    try {
      this.logger.log(`导入API文档: ${apiData.title}`);

      const document = await this.createDocument({
        title: apiData.title,
        content: apiData.content,
        sourceType: DocumentSourceType.API,
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

      // 自动激活文档
      await this.knowledgeDocumentRepository.updateById(document.id, {
        status: DocumentStatus.ACTIVE,
      });

      this.logger.log(`API文档导入成功: ${document.id}`);
      return document;
    } catch (error) {
      this.logger.error(`导入API文档失败: ${error.message}`, error.stack);
      throw new InternalServerErrorException('导入API文档失败');
    }
  }

  /**
   * 批量导入文档
   */
  async batchImportDocuments(
    imports: Array<{
      type: 'file' | 'url' | 'api' | 'manual';
      data: any;
      options?: DocumentImportOptions;
    }>,
  ): Promise<KnowledgeDocument[]> {
    const results: KnowledgeDocument[] = [];

    for (const importItem of imports) {
      try {
        let document: KnowledgeDocument;

        switch (importItem.type) {
          case 'file':
            document = await this.importFileDocument(
              importItem.data,
              importItem.options,
            );
            break;
          case 'url':
            document = await this.importUrlDocument(
              importItem.data,
              importItem.options,
            );
            break;
          case 'api':
            document = await this.importApiDocument(
              importItem.data,
              importItem.options,
            );
            break;
          case 'manual':
            document = await this.createDocument({
              title: importItem.data.title,
              content: importItem.data.content,
              sourceType: DocumentSourceType.MANUAL,
              ...importItem.options,
            });
            break;
          default:
            throw new BadRequestException(
              `不支持的导入类型: ${importItem.type}`,
            );
        }

        results.push(document);
      } catch (error) {
        this.logger.error(`批量导入文档失败: ${error.message}`);
        // 继续处理其他文档
      }
    }

    return results;
  }

  /**
   * 处理文档向量化
   */
  private async processDocumentForVectorization(
    documentId: string,
  ): Promise<void> {
    try {
      this.logger.log(`处理文档向量化: ${documentId}`);

      const document = await this.getDocument(documentId);

      // 跳过非活跃状态的文档
      if (document.status !== DocumentStatus.ACTIVE) {
        this.logger.debug(`文档 ${documentId} 非活跃状态，跳过向量化`);
        return;
      }

      // 更新处理状态
      await this.knowledgeDocumentRepository.updateById(documentId, {
        processingStatus: DocumentProcessingStatus.EXTRACTING,
        extractedAt: new Date(),
      });

      // 准备向量数据库文档
      const vectorDocument: Document = {
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

      // 添加到向量数据库
      const vectorId =
        await this.vectorSearchService.addDocument(vectorDocument);

      // 更新向量信息
      await this.knowledgeDocumentRepository.updateVectorInfo(
        documentId,
        vectorId,
      );

      this.logger.log(`文档向量化完成: ${documentId} -> ${vectorId}`);
    } catch (error) {
      this.logger.error(`文档向量化失败: ${error.message}`, error.stack);

      // 更新失败状态
      await this.knowledgeDocumentRepository.updateById(documentId, {
        processingStatus: DocumentProcessingStatus.FAILED,
        processingError: error.message,
      });

      throw error;
    }
  }

  /**
   * 批量处理待向量化文档
   */
  async processPendingDocuments(batchSize: number = 10): Promise<void> {
    try {
      this.logger.log(`批量处理待向量化文档，批量大小: ${batchSize}`);

      const pendingDocs =
        await this.knowledgeDocumentRepository.findPendingProcessing(batchSize);

      if (pendingDocs.length === 0) {
        this.logger.debug('没有待处理的文档');
        return;
      }

      this.logger.log(`找到 ${pendingDocs.length} 个待处理文档`);

      for (const doc of pendingDocs) {
        try {
          await this.processDocumentForVectorization(doc.id);
        } catch (error) {
          this.logger.error(`处理文档 ${doc.id} 失败: ${error.message}`);
          // 继续处理下一个文档
        }
      }
    } catch (error) {
      this.logger.error(`批量处理文档失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取文档统计信息
   */
  async getDocumentStats(): Promise<{
    total: number;
    byStatus: Array<{ status: string; count: number }>;
    byProcessingStatus: Array<{ processingStatus: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
    bySourceType: Array<{ sourceType: string; count: number }>;
    qualityStats: {
      avgOverall: number;
      avgCompleteness: number;
      avgRelevance: number;
      avgFreshness: number;
      avgAuthority: number;
      avgReadability: number;
    };
  }> {
    const [
      total,
      byStatus,
      byProcessingStatus,
      byCategory,
      bySourceType,
      qualityStats,
    ] = await Promise.all([
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

  /**
   * 重新向量化所有文档
   */
  async revectorizeAllDocuments(): Promise<{
    total: number;
    processed: number;
    failed: number;
  }> {
    const vectorizedDocs =
      await this.knowledgeDocumentRepository.findVectorizedDocuments();

    let processed = 0;
    let failed = 0;

    for (const doc of vectorizedDocs) {
      try {
        // 重置处理状态
        await this.knowledgeDocumentRepository.updateById(doc.id, {
          processingStatus: DocumentProcessingStatus.PENDING,
          vectorId: null as any,
          vectorizedAt: null as any,
        });

        // 重新处理
        await this.processDocumentForVectorization(doc.id);
        processed++;
      } catch (error) {
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

  /**
   * 评估文档质量
   */
  private assessDocumentQuality(
    content: string,
    metadata?: DocumentMetadata,
  ): DocumentQualityScore {
    // 简化版质量评估
    // 实际应该使用更复杂的算法

    const wordCount = this.countWords(content);

    // 完整性：基于内容长度和结构
    const completeness = Math.min(100, (wordCount / 500) * 100); // 500字为完整文档

    // 相关性：基于元数据（如果有）
    const relevance = metadata?.keywords ? 80 : 60; // 如果有关键词，相关性更高

    // 新鲜度：基于发布日期（如果有）
    let freshness = 70; // 默认值
    if (metadata?.publishDate) {
      const daysOld =
        (new Date().getTime() - new Date(metadata.publishDate).getTime()) /
        (1000 * 60 * 60 * 24);
      freshness = Math.max(0, 100 - (daysOld / 365) * 100); // 一年内为新鲜
    }

    // 权威性：基于作者和来源
    const authority = metadata?.author ? 75 : 60;

    // 可读性：基于句子长度和复杂度
    const readability = this.assessReadability(content);

    // 综合评分
    const overall =
      completeness * 0.2 +
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

  /**
   * 评估可读性
   */
  private assessReadability(content: string): number {
    // 简化版可读性评估
    const sentences = content
      .split(/[.!?。！？]+/)
      .filter((s) => s.trim().length > 0);
    const words = content.split(/\s+/).filter((w) => w.length > 0);

    if (sentences.length === 0 || words.length === 0) {
      return 50;
    }

    const avgSentenceLength = words.length / sentences.length;

    // 句子长度越短，可读性越高（简单评估）
    const readability = 100 - avgSentenceLength * 2;
    return Math.max(0, Math.min(100, readability));
  }

  /**
   * 生成文档摘要
   */
  private generateSummary(content: string, maxLength: number = 200): string {
    if (content.length <= maxLength) {
      return content;
    }

    // 简单摘要：取前maxLength个字符，确保在句子边界处截断
    let summary = content.substring(0, maxLength);
    const lastPunctuation = Math.max(
      summary.lastIndexOf('。'),
      summary.lastIndexOf('！'),
      summary.lastIndexOf('？'),
      summary.lastIndexOf('.'),
      summary.lastIndexOf('!'),
      summary.lastIndexOf('?'),
    );

    if (lastPunctuation > maxLength * 0.5) {
      // 如果找到标点且在摘要后半部分
      summary = summary.substring(0, lastPunctuation + 1);
    }

    return summary + '...';
  }

  /**
   * 计算字数
   */
  private countWords(text: string): number {
    // 简单的中英文单词计数
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/\b[a-zA-Z]+\b/g) || []).length;
    return chineseChars + englishWords;
  }

  /**
   * 提取文件内容
   */
  private async extractFileContent(file: FileUploadResult): Promise<string> {
    try {
      // 检查文件是否存在
      try {
        await fs.access(file.storagePath);
      } catch {
        this.logger.warn(`文件不存在: ${file.storagePath}`);
        return `文件内容提取失败: 文件不存在\n文件名: ${file.originalName}`;
      }

      // 根据文件类型提取内容
      const mimeType = file.mimeType.toLowerCase();
      const ext = path.extname(file.originalName).toLowerCase();

      // 文本文件直接读取
      if (
        mimeType.includes('text/plain') ||
        mimeType.includes('text/markdown') ||
        mimeType.includes('text/html') ||
        ext === '.txt' ||
        ext === '.md' ||
        ext === '.html'
      ) {
        const content = await fs.readFile(file.storagePath, 'utf-8');
        return content;
      }

      // PDF、Word等格式暂不支持内容提取，返回模拟内容
      // 在实际应用中应集成相应的解析库（如pdf-parse、mammoth等）
      return `文件内容提取（DEMO版）\n文件名: ${file.originalName}\n文件大小: ${file.size}字节\nMIME类型: ${file.mimeType}\n\n说明：DEMO版本仅支持文本文件内容提取，对于PDF、Word等格式需要集成专业解析库。`;
    } catch (error) {
      this.logger.error(`提取文件内容失败: ${error.message}`, error.stack);
      return `文件内容提取失败: ${error.message}\n文件名: ${file.originalName}`;
    }
  }

  /**
   * 抓取URL内容
   */
  private async crawlUrlContent(url: string): Promise<UrlCrawlResult> {
    try {
      this.logger.log(`开始抓取网页内容: ${url}`);

      // 验证URL格式
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        throw new Error('无效的URL格式');
      }

      // 发送HTTP请求
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        maxRedirects: 5,
        validateStatus: (status) => status < 500,
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = response.data as string;
      const $ = cheerio.load(html);

      // 提取标题
      let title = $('title').text().trim() ||
                  $('meta[property=”og:title”]').attr('content') ||
                  $('meta[name=”title”]').attr('content') ||
                  `网页标题: ${url}`;

      // 提取主要内容
      let content = '';
      const articleElement = $('article').first();
      const mainElement = $('main').first();
      const contentElement = articleElement.length > 0 ? articleElement : mainElement;

      if (contentElement.length > 0) {
        content = htmlToText(contentElement.html() || '', {
          wordwrap: false,
          selectors: [
            { selector: 'a', options: { ignoreImage: true, ignoreHref: true } },
            { selector: 'img', format: 'skip' },
            { selector: 'script', format: 'skip' },
            { selector: 'style', format: 'skip' },
          ],
        });
      } else {
        // 回退：查找最大的文本段落
        content = htmlToText(html, {
          wordwrap: false,
          selectors: [
            { selector: 'a', options: { ignoreImage: true, ignoreHref: true } },
            { selector: 'img', format: 'skip' },
            { selector: 'script', format: 'skip' },
            { selector: 'style', format: 'skip' },
            { selector: 'nav', format: 'skip' },
            { selector: 'header', format: 'skip' },
            { selector: 'footer', format: 'skip' },
            { selector: 'aside', format: 'skip' },
          ],
        });
      }

      // 提取作者
      const author = $('meta[name=”author”]').attr('content') ||
                     $('meta[property=”article:author”]').attr('content') ||
                     $('[rel=”author”]').text().trim() ||
                     undefined;

      // 提取发布日期
      const publishDateStr = $('meta[property=”article:published_time”]').attr('content') ||
                            $('meta[name=”publishdate”]').attr('content') ||
                            $('meta[name=”date”]').attr('content') ||
                            undefined;
      const publishDate = publishDateStr ? new Date(publishDateStr) : undefined;

      // 提取关键词
      const keywordsStr = $('meta[name=”keywords”]').attr('content');
      const keywords = keywordsStr
        ? keywordsStr.split(',').map(k => k.trim()).filter(Boolean)
        : undefined;

      const wordCount = this.countWords(content);
      const readingTime = Math.ceil(wordCount / 200);

      this.logger.log(`网页抓取成功: ${url}, 字数: ${wordCount}`);

      return {
        url,
        title,
        content: content.trim(),
        metadata: {
          author,
          publishDate,
          wordCount,
          readingTime,
          keywords,
        },
      };
    } catch (error) {
      this.logger.error(`抓取网页内容失败: ${error.message}`, error.stack);
      // 降级保存：返回基本信息，不影响文档创建
      return {
        url,
        title: `抓取自: ${url}`,
        content: '',
        metadata: {
          wordCount: 0,
          readingTime: 0,
          keywords: [],
        },
      };
    }
  }

  /**
   * 获取所有分类
   */
  async getAllCategories(): Promise<
    Array<{ category: string; count: number }>
  > {
    return this.knowledgeDocumentRepository.getCategoryStats();
  }

  /**
   * 获取所有标签（去重）
   */
  async getAllTags(): Promise<Array<{ tag: string; count: number }>> {
    const documents = await this.knowledgeDocumentRepository.find({
      where: { status: DocumentStatus.ACTIVE },
      select: ['tags'],
    });

    const tagMap = new Map<string, number>();
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

  /**
   * 更新分类名称（批量更新文档分类）
   */
  async updateCategory(
    oldCategory: string,
    newCategory: string,
  ): Promise<{ updated: number }> {
    const documents =
      await this.knowledgeDocumentRepository.findByCategory(oldCategory);
    const documentIds = documents.map((doc) => doc.id);

    if (documentIds.length === 0) {
      return { updated: 0 };
    }

    await this.knowledgeDocumentRepository
      .createQueryBuilder()
      .update(KnowledgeDocument)
      .set({ category: newCategory })
      .where('id IN (:...ids)', { ids: documentIds })
      .execute();

    return { updated: documentIds.length };
  }

  /**
   * 合并标签
   */
  async mergeTags(
    sourceTag: string,
    targetTag: string,
  ): Promise<{ updated: number }> {
    const documents =
      await this.knowledgeDocumentRepository.findByTag(sourceTag);
    let updatedCount = 0;

    for (const doc of documents) {
      if (doc.tags) {
        // 移除源标签，添加目标标签（如果不存在）
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

  /**
   * 获取文档建议标签（基于内容分析）
   */
  async suggestTags(documentId: string, limit: number = 5): Promise<string[]> {
    const document = await this.getDocument(documentId);
    const content = document.content;

    // 简单标签提取：提取高频名词
    // 实际应该使用更复杂的NLP技术
    const words = content.split(/\s+/);
    const wordFrequency = new Map<string, number>();

    words.forEach((word) => {
      if (word.length > 1) {
        // 忽略单字
        const normalizedWord = word
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5]/g, '');
        if (normalizedWord.length > 1) {
          wordFrequency.set(
            normalizedWord,
            (wordFrequency.get(normalizedWord) || 0) + 1,
          );
        }
      }
    });

    // 按频率排序
    const sortedWords = Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit * 2) // 取两倍数量用于筛选
      .map(([word]) => word);

    // 过滤常见停用词（简单实现）
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

  /**
   * 获取分类建议（基于内容分析）
   */
  async suggestCategory(documentId: string): Promise<string | null> {
    const document = await this.getDocument(documentId);

    // 简单分类建议：如果已有分类，返回null；否则基于内容关键词建议
    if (document.category) {
      return null;
    }

    const content = document.content;

    // 简单关键词匹配分类（实际应该使用机器学习模型）
    const categoryKeywords: Record<string, string[]> = {
      技术: ['编程', '代码', '算法', '开发', '软件', '硬件', '网络'],
      营销: ['推广', '广告', '品牌', '销售', '市场', '客户', '流量'],
      管理: ['团队', '领导', '战略', '规划', '组织', '效率', '绩效'],
      金融: ['投资', '股票', '基金', '银行', '保险', '理财', '经济'],
      教育: ['学习', '培训', '课程', '教学', '学生', '教师', '学校'],
    };

    const words = content.toLowerCase();
    let bestCategory: string | null = null;
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter((keyword) =>
        words.includes(keyword.toLowerCase()),
      ).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
      }
    }

    return maxMatches > 0 ? bestCategory : null;
  }

  /**
   * 批量更新文档标签
   */
  async batchUpdateTags(
    documentIds: string[],
    tagUpdates: { add?: string[]; remove?: string[] },
  ): Promise<{ updated: number }> {
    let updatedCount = 0;

    for (const documentId of documentIds) {
      try {
        const document = await this.getDocument(documentId);
        let tags = document.tags || [];

        // 移除标签
        if (tagUpdates.remove) {
          tags = tags.filter((tag) => !tagUpdates.remove!.includes(tag));
        }

        // 添加标签（去重）
        if (tagUpdates.add) {
          tagUpdates.add.forEach((tag) => {
            if (!tags.includes(tag)) {
              tags.push(tag);
            }
          });
        }

        await this.knowledgeDocumentRepository.updateById(documentId, { tags });
        updatedCount++;
      } catch (error) {
        this.logger.error(`更新文档 ${documentId} 标签失败: ${error.message}`);
      }
    }

    return { updated: updatedCount };
  }

  /**
   * 映射文档来源类型到向量数据库元数据类型
   */
  private mapDocumentSourceType(
    sourceType: DocumentSourceType,
  ): 'file' | 'web' | 'api' | 'manual' {
    switch (sourceType) {
      case DocumentSourceType.FILE:
        return 'file';
      case DocumentSourceType.URL:
        return 'web'; // URL映射为web
      case DocumentSourceType.API:
        return 'api';
      case DocumentSourceType.MANUAL:
        return 'manual';
      default:
        return 'manual'; // 默认值
    }
  }

  /**
   * 批量更新文档分类
   */
  async batchUpdateCategory(
    documentIds: string[],
    category: string,
  ): Promise<{ updated: number }> {
    let updatedCount = 0;

    for (const documentId of documentIds) {
      try {
        await this.knowledgeDocumentRepository.updateById(documentId, {
          category,
        });
        updatedCount++;
      } catch (error) {
        this.logger.error(`更新文档 ${documentId} 分类失败: ${error.message}`);
      }
    }

    return { updated: updatedCount };
  }

  /**
   * 根据mimeType确定文件类型
   */
  private determineFileType(mimeType: string): FileType {
    const mime = mimeType.toLowerCase();
    if (mime.includes('word') || mime.includes('doc')) {
      return FileType.WORD;
    } else if (mime.includes('pdf')) {
      return FileType.PDF;
    } else if (
      mime.includes('markdown') ||
      mime.includes('md') ||
      mime.includes('text/markdown')
    ) {
      return FileType.MARKDOWN;
    } else if (mime.includes('text/plain') || mime.includes('txt')) {
      return FileType.MARKDOWN; // 纯文本视为Markdown
    } else {
      return FileType.OTHER;
    }
  }

  /**
   * 根据sourceType确定文件类型
   */
  private determineFileTypeFromSource(
    sourceType: DocumentSourceType,
    mimeType?: string,
  ): FileType | null {
    switch (sourceType) {
      case DocumentSourceType.FILE:
        return mimeType ? this.determineFileType(mimeType) : FileType.OTHER;
      case DocumentSourceType.URL:
        return FileType.WEB_PAGE;
      case DocumentSourceType.API:
      case DocumentSourceType.MANUAL:
        return null; // 无文件类型
      default:
        return null;
    }
  }
}
