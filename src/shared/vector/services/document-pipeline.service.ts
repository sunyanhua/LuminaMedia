import { Injectable, Logger } from '@nestjs/common';
import { VectorSearchService } from './vector-search.service';
import {
  Document,
  DocumentMetadata,
} from '../interfaces/vector-search.interface';

/**
 * 文档处理流水线服务
 * 负责文档的文本提取、分块处理、向量化
 */
@Injectable()
export class DocumentPipelineService {
  private readonly logger = new Logger(DocumentPipelineService.name);
  private readonly defaultChunkSize = 1000; // 字符数
  private readonly chunkOverlap = 200; // 重叠字符数

  constructor(private vectorSearchService: VectorSearchService) {}

  /**
   * 处理文档（完整流程）
   * @param content 文档内容
   * @param metadata 文档元数据
   * @returns 文档ID数组（每个分块一个ID）
   */
  async processDocument(
    content: string,
    metadata: DocumentMetadata,
  ): Promise<string[]> {
    try {
      this.logger.log(`开始处理文档: ${metadata.title || '未命名文档'}`);

      // 1. 文本提取（这里假设content已经是纯文本）
      const extractedText = this.extractText(content, metadata);

      // 2. 文本清洗
      const cleanedText = this.cleanText(extractedText);

      // 3. 分块处理
      const chunks = this.splitIntoChunks(cleanedText);

      // 4. 向量化和存储
      const docIds: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkMetadata: DocumentMetadata = {
          ...metadata,
          chunkIndex: i,
          totalChunks: chunks.length,
          chunkSize: chunk.length,
        };

        const doc: Document = {
          content: chunk,
          metadata: chunkMetadata,
          tenantId: metadata.tenantId,
          industry: metadata.industry,
          source: metadata.source,
        };

        const docId = await this.vectorSearchService.addDocument(doc);
        docIds.push(docId);

        this.logger.debug(
          `文档分块 ${i + 1}/${chunks.length} 处理完成，ID: ${docId}`,
        );
      }

      this.logger.log(
        `文档处理完成，共 ${chunks.length} 个分块，文档ID: ${docIds.join(', ')}`,
      );
      return docIds;
    } catch (error) {
      this.logger.error(`文档处理失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 批量处理文档
   */
  async processDocuments(
    documents: Array<{ content: string; metadata: DocumentMetadata }>,
  ): Promise<string[][]> {
    const allDocIds: string[][] = [];

    for (const doc of documents) {
      const docIds = await this.processDocument(doc.content, doc.metadata);
      allDocIds.push(docIds);
    }

    return allDocIds;
  }

  /**
   * 文本提取（简化版本）
   * 在实际应用中，需要支持PDF、Word、Excel等格式
   */
  private extractText(content: string, metadata: DocumentMetadata): string {
    // 这里简单返回内容，实际需要根据格式提取文本
    // 可以集成第三方库如pdf-parse、mammoth等
    return content;
  }

  /**
   * 文本清洗
   */
  private cleanText(text: string): string {
    // 1. 去除多余空白字符
    let cleaned = text.replace(/\s+/g, ' ').trim();

    // 2. 移除不可见字符
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    // 3. 标准化换行符
    cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 4. 移除HTML标签（如果存在）
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // 5. 标准化标点符号
    cleaned = cleaned.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

    return cleaned;
  }

  /**
   * 分块处理
   * 将长文本分割为适合向量化的块
   */
  private splitIntoChunks(
    text: string,
    chunkSize?: number,
    overlap?: number,
  ): string[] {
    const size = chunkSize || this.defaultChunkSize;
    const overlapSize = overlap || this.chunkOverlap;

    if (text.length <= size) {
      return [text];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start + size;

      // 如果不在文本末尾，尝试在句子边界处分割
      if (end < text.length) {
        // 查找最近的句子结束位置
        const sentenceEnd = this.findSentenceBoundary(text, end);
        if (sentenceEnd > start + size * 0.5) {
          // 如果找到合适的句子边界，使用它
          end = sentenceEnd;
        }
      }

      const chunk = text.substring(start, end).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      // 移动起始位置，考虑重叠
      start = end - overlapSize;
      if (start < 0) start = 0;
      if (start >= text.length) break;
    }

    return chunks;
  }

  /**
   * 查找句子边界
   */
  private findSentenceBoundary(text: string, position: number): number {
    // 句子结束标点
    const sentenceEndings = /[.!?。！？]\s+/g;
    let lastMatch = position;

    // 从位置开始向后查找
    let searchPos = position;
    while (searchPos < text.length && searchPos < position + 100) {
      const match = sentenceEndings.exec(text.substring(searchPos));
      if (match) {
        lastMatch = searchPos + match.index + match[0].length;
        break;
      }
      searchPos += 50;
    }

    // 如果找不到句子边界，尝试在逗号或分号处分割
    if (lastMatch === position) {
      const commaMatch = /[,;，；]\s+/g.exec(text.substring(position));
      if (commaMatch) {
        lastMatch = position + commaMatch.index + commaMatch[0].length;
      }
    }

    // 如果还是找不到，使用默认位置
    if (lastMatch === position) {
      lastMatch = Math.min(position + 50, text.length);
    }

    return lastMatch;
  }

  /**
   * 计算文档相似度（基于内容）
   */
  async calculateDocumentSimilarity(
    docId1: string,
    docId2: string,
  ): Promise<number> {
    try {
      const doc1 = await this.vectorSearchService.getDocument(docId1);
      const doc2 = await this.vectorSearchService.getDocument(docId2);

      if (!doc1 || !doc2) {
        return 0;
      }

      // 如果文档有嵌入向量，可以直接计算相似度
      if (doc1.embedding && doc2.embedding) {
        // 这里需要向量搜索服务提供相似度计算功能
        // 暂时使用简单的文本相似度
        return this.calculateTextSimilarity(doc1.content, doc2.content);
      }

      // 使用文本相似度作为回退
      return this.calculateTextSimilarity(doc1.content, doc2.content);
    } catch (error) {
      this.logger.error(`计算文档相似度失败: ${error.message}`);
      return 0;
    }
  }

  /**
   * 计算文本相似度（简单实现，基于Jaccard相似度）
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(Boolean));
    const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(Boolean));

    if (words1.size === 0 && words2.size === 0) return 1;
    if (words1.size === 0 || words2.size === 0) return 0;

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * 删除文档及其所有分块
   */
  async deleteDocumentWithChunks(docIds: string[]): Promise<void> {
    try {
      for (const docId of docIds) {
        await this.vectorSearchService.deleteDocument(docId);
      }
      this.logger.log(`删除 ${docIds.length} 个文档分块成功`);
    } catch (error) {
      this.logger.error(`删除文档分块失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 更新文档内容
   */
  async updateDocumentContent(
    docIds: string[],
    newContent: string,
    metadata: DocumentMetadata,
  ): Promise<string[]> {
    try {
      // 先删除旧的分块
      await this.deleteDocumentWithChunks(docIds);

      // 重新处理文档
      return await this.processDocument(newContent, metadata);
    } catch (error) {
      this.logger.error(`更新文档内容失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
