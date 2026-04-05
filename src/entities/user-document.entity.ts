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
import { User } from './user.entity';

// 文件类型枚举
export enum UserDocumentFileType {
  WORD = 'word', // Word文档
  PDF = 'pdf', // PDF文档
  EXCEL = 'excel', // Excel文档
  PPT = 'ppt', // PowerPoint文档
  MARKDOWN = 'markdown', // Markdown文档
  TEXT = 'text', // 纯文本
  OTHER = 'other', // 其他类型
}

// 报告类型枚举（用于自定义报告生成）
export enum CustomReportType {
  WORK_SUMMARY = 'work_summary', // 工作总结
  ACTIVITY_REVIEW = 'activity_review', // 活动复盘
  RESEARCH_ANALYSIS = 'research_analysis', // 调研分析
  POLICY_INTERPRETATION = 'policy_interpretation', // 政策解读
  OTHER = 'other', // 其他
}

@Entity('user_documents')
@Index(['userId'])
@Index(['fileType'])
@Index(['createdAt'])
export class UserDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 用户ID
  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  // 关联用户实体
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 文档标题
  @Column({ type: 'varchar', length: 500 })
  title: string;

  // 文件存储URL（OSS或本地存储路径）
  @Column({ name: 'file_url', type: 'varchar', length: 2000 })
  fileUrl: string;

  // 文件类型
  @Column({
    name: 'file_type',
    type: 'enum',
    enum: UserDocumentFileType,
    default: UserDocumentFileType.OTHER,
  })
  fileType: UserDocumentFileType;

  // 文件信息（原始文件名、大小等）
  @Column({ name: 'file_info', type: 'json', nullable: true })
  fileInfo: {
    originalName: string;
    mimeType: string;
    size: number;
    encoding?: string;
  };

  // 文档描述
  @Column({ type: 'text', nullable: true })
  description: string;

  // 文档内容（提取的文本内容，用于AI分析）
  @Column({ type: 'longtext', nullable: true })
  content: string;

  // 提取状态
  @Column({
    name: 'extraction_status',
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  extractionStatus: 'pending' | 'processing' | 'completed' | 'failed';

  // 提取错误信息
  @Column({ name: 'extraction_error', type: 'text', nullable: true })
  extractionError: string;

  // 关键词（AI提取）
  @Column({ type: 'json', nullable: true })
  keywords: string[];

  // 摘要（AI生成）
  @Column({ type: 'text', nullable: true })
  summary: string;

  // 自定义报告类型（如果用于生成报告）
  @Column({
    name: 'report_type',
    type: 'enum',
    enum: CustomReportType,
    nullable: true,
  })
  reportType: CustomReportType;

  // 生成的报告ID（关联到Report实体）
  @Column({ name: 'generated_report_id', type: 'varchar', length: 36, nullable: true })
  generatedReportId: string;

  // 是否公开（其他用户可见）
  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 软删除标记
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}