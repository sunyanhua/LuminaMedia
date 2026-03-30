/**
 * 向量搜索服务接口
 * 提供向量数据库的抽象层，支持文档向量化存储和检索
 */
export interface VectorSearchService {
  /**
   * 添加文档到向量库
   * @param doc 文档对象
   * @returns 文档ID
   */
  addDocument(doc: Document): Promise<string>;

  /**
   * 批量添加文档
   * @param docs 文档数组
   * @returns 文档ID数组
   */
  addDocuments(docs: Document[]): Promise<string[]>;

  /**
   * 相似性检索
   * @param query 查询文本
   * @param k 返回结果数量
   * @param filters 过滤条件
   * @returns 搜索结果数组
   */
  searchSimilar(
    query: string,
    k: number,
    filters?: SearchFilters,
  ): Promise<SearchResult[]>;

  /**
   * 混合检索（向量+关键词）
   * @param query 查询文本
   * @param options 搜索选项
   * @returns 搜索结果数组
   */
  hybridSearch(
    query: string,
    options: HybridSearchOptions,
  ): Promise<SearchResult[]>;

  /**
   * 更新文档向量
   * @param docId 文档ID
   * @param content 新的文档内容
   */
  updateDocument(docId: string, content: string): Promise<void>;

  /**
   * 删除文档
   * @param docId 文档ID
   */
  deleteDocument(docId: string): Promise<void>;

  /**
   * 获取文档信息
   * @param docId 文档ID
   */
  getDocument(docId: string): Promise<Document | null>;

  /**
   * 清空向量库
   * @param collectionName 集合名称
   */
  clearCollection(collectionName?: string): Promise<void>;

  /**
   * 获取集合统计信息
   * @param collectionName 集合名称
   */
  getCollectionStats(collectionName?: string): Promise<CollectionStats>;

  /**
   * 健康检查
   */
  healthCheck(): Promise<HealthStatus>;
}

/**
 * 文档接口
 */
export interface Document {
  id?: string;
  content: string;
  embedding?: number[];
  metadata: DocumentMetadata;
  tenantId?: string;
  industry?: string;
  source?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 文档元数据
 */
export interface DocumentMetadata {
  title?: string;
  author?: string;
  sourceType?: 'file' | 'web' | 'api' | 'manual';
  sourceUrl?: string;
  language?: string;
  tags?: string[];
  category?: string;
  pageCount?: number;
  fileSize?: number;
  [key: string]: any;
}

/**
 * 搜索过滤器
 */
export interface SearchFilters {
  tenantId?: string;
  industry?: string;
  source?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  minSimilarity?: number;
  metadataFilters?: Record<string, any>;
}

/**
 * 搜索结果
 */
export interface SearchResult {
  document: Document;
  similarity: number;
  score?: number; // 混合搜索的加权分数
}

/**
 * 混合搜索选项
 */
export interface HybridSearchOptions {
  k?: number;
  filters?: SearchFilters;
  vectorWeight?: number; // 向量相似度权重 (0-1)
  keywordWeight?: number; // 关键词权重 (0-1)
  useReranking?: boolean; // 是否使用重排序
}

/**
 * 集合统计信息
 */
export interface CollectionStats {
  collectionName: string;
  documentCount: number;
  vectorDimension: number;
  storageSize: number;
  indexed: boolean;
  lastIndexedAt?: Date;
}

/**
 * 健康状态
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: {
    version?: string;
    uptime?: number;
    memoryUsage?: NodeJS.MemoryUsage;
    [key: string]: any;
  };
}
