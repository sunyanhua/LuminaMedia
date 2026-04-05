import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';
import { User } from './user.entity';

// 文档来源类型
export enum DocumentSourceType {
  FILE = 'file', // 文件上传
  URL = 'url', // 网址抓取
  API = 'api', // API集成
  MANUAL = 'manual', // 手动输入
}

// 文件类型（针对文件上传）
export enum FileType {
  WORD = 'word', // Word文档
  PDF = 'pdf', // PDF文档
  MARKDOWN = 'markdown', // Markdown文档
  WEB_PAGE = 'web_page', // 网页（用于网页采集）
  OTHER = 'other', // 其他类型
}

// 文档分类
export enum DocumentCategory {
  POLICY = 'policy', // 政策文件
  HISTORICAL_ARTICLE = 'historical_article', // 历史文章
  REFERENCE_MATERIAL = 'reference_material', // 参考资料
  OTHER = 'other', // 其他
}

// 文档状态
export enum DocumentStatus {
  DRAFT = 'draft', // 草稿
  PROCESSING = 'processing', // 处理中
  ACTIVE = 'active', // 活跃
  ARCHIVED = 'archived', // 归档
}

// 文档处理状态
export enum DocumentProcessingStatus {
  PENDING = 'pending', // 待处理
  EXTRACTING = 'extracting', // 文本提取中
  VECTORIZED = 'vectorized', // 已向量化
  ANALYZED = 'analyzed', // 已分析
  FAILED = 'failed', // 处理失败
}

// 文件信息接口（用于文件上传）
export interface FileInfo {
  originalName: string; // 原始文件名
  mimeType: string; // MIME类型
  size: number; // 文件大小（字节）
  storagePath: string; // 存储路径
  encoding?: string; // 编码
}

// 文档元数据
export interface DocumentMetadata {
  author?: string; // 作者
  publishDate?: Date; // 发布日期
  wordCount?: number; // 字数
  pageCount?: number; // 页数
  readingTime?: number; // 阅读时间（分钟）
  keywords?: string[]; // 关键词
  sentiment?: 'positive' | 'neutral' | 'negative'; // 情感倾向
  confidence?: number; // 分析置信度
  extractionMethod?: string; // 提取方法
  extractedAt?: Date; // 提取时间
  [key: string]: any; // 扩展字段
}

// 文档质量评分
export interface DocumentQualityScore {
  completeness: number; // 完整性（0-100）
  relevance: number; // 相关性（0-100）
  freshness: number; // 新鲜度（0-100）
  authority: number; // 权威性（0-100）
  readability: number; // 可读性（0-100）
  overall: number; // 综合评分（0-100）
}

@Entity('knowledge_documents')
@Index(['tenantId'])
@Index(['sourceType'])
@Index(['category'])
@Index(['status'])
@Index(['processingStatus'])
@Index(['createdAt'])
@Index(['vectorId']) // 用于快速查找向量化文档
export class KnowledgeDocument implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tenant_id',
    type: 'varchar',
    length: 36,
    default: 'default-tenant',
  })
  tenantId: string;

  // 创建者
  @Column({ name: 'created_by', type: 'varchar', length: 36, nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  // 文档标题
  @Column({ type: 'varchar', length: 500 })
  title: string;

  // 文档内容（纯文本）
  @Column({ type: 'longtext', nullable: true })
  content: string;

  // 文档摘要
  @Column({ type: 'text', nullable: true })
  summary: string;

  // 来源类型
  @Column({
    name: 'source_type',
    type: 'enum',
    enum: DocumentSourceType,
    default: DocumentSourceType.MANUAL,
  })
  sourceType: DocumentSourceType;

  // 来源URL（如果是网址或API）
  @Column({ name: 'source_url', type: 'varchar', length: 2000, nullable: true })
  sourceUrl: string;

  // 文件类型（针对文件上传）
  @Column({
    name: 'file_type',
    type: 'enum',
    enum: FileType,
    nullable: true,
  })
  fileType: FileType;

  // 文件信息（如果是文件上传）
  @Column({ name: 'file_info', type: 'json', nullable: true })
  fileInfo: FileInfo;

  // 分类
  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  // 标签（JSON数组）
  @Column({ type: 'json', nullable: true })
  tags: string[];

  // 语言
  @Column({ type: 'varchar', length: 10, default: 'zh-CN' })
  language: string;

  // 元数据（JSON）
  @Column({ type: 'json', nullable: true })
  metadata: DocumentMetadata;

  // 文档状态
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  // 文档处理状态
  @Column({
    name: 'processing_status',
    type: 'enum',
    enum: DocumentProcessingStatus,
    default: DocumentProcessingStatus.PENDING,
  })
  processingStatus: DocumentProcessingStatus;

  // 处理错误信息
  @Column({ name: 'processing_error', type: 'text', nullable: true })
  processingError: string;

  // 向量数据库中的文档ID
  @Column({ name: 'vector_id', type: 'varchar', length: 100, nullable: true })
  vectorId: string;

  // 质量评分（JSON）
  @Column({ name: 'quality_score', type: 'json', nullable: true })
  qualityScore: DocumentQualityScore;

  // 版本号
  @Column({ type: 'int', default: 1 })
  version: number;

  // 是否公开（所有租户可见）
  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic: boolean;

  // 访问权限（JSON数组：角色或用户ID）
  @Column({ name: 'access_control', type: 'json', nullable: true })
  accessControl: string[];

  // 文档哈希（用于去重）
  @Column({ name: 'content_hash', type: 'varchar', length: 64, nullable: true })
  contentHash: string;

  // 文本提取时间
  @Column({ name: 'extracted_at', type: 'timestamp', nullable: true })
  extractedAt: Date;

  // 向量化时间
  @Column({ name: 'vectorized_at', type: 'timestamp', nullable: true })
  vectorizedAt: Date;

  // 分析时间
  @Column({ name: 'analyzed_at', type: 'timestamp', nullable: true })
  analyzedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 软删除标记
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  // 辅助方法：检查文档是否已向量化
  isVectorized(): boolean {
    return (
      this.processingStatus === DocumentProcessingStatus.VECTORIZED ||
      this.processingStatus === DocumentProcessingStatus.ANALYZED
    );
  }

  // 辅助方法：检查文档是否已分析
  isAnalyzed(): boolean {
    return this.processingStatus === DocumentProcessingStatus.ANALYZED;
  }

  // 辅助方法：检查文档是否可搜索
  isSearchable(): boolean {
    return this.status === DocumentStatus.ACTIVE && this.isVectorized();
  }
}
