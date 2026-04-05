import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';

// 参考信息状态
export enum ReferenceInfoStatus {
  NEW = 'new', // 新抓取
  ADOPTED = 'adopted', // 已采用
  MODIFIED = 'modified', // 已修改后采用
  IGNORED = 'ignored', // 已忽略
}

@Entity('reference_infos')
@Index(['tenantId'])
@Index(['status'])
@Index(['publishTime'])
@Index(['relevance'])
@Index(['isAdopted'])
export class ReferenceInfo implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tenant_id',
    type: 'varchar',
    length: 36,
    default: 'default-tenant',
  })
  tenantId: string;

  // 创建者（可选）
  @Column({ name: 'created_by', type: 'varchar', length: 36, nullable: true })
  createdBy: string;

  // 标题
  @Column({ type: 'varchar', length: 500 })
  title: string;

  // 摘要
  @Column({ type: 'text', nullable: true })
  summary: string;

  // 完整内容
  @Column({ type: 'longtext', nullable: true })
  content: string;

  // 来源URL
  @Column({ name: 'source_url', type: 'varchar', length: 2000, nullable: true })
  sourceUrl: string;

  // 来源名称（网站名）
  @Column({ name: 'source_name', type: 'varchar', length: 200, nullable: true })
  sourceName: string;

  // 发布时间
  @Column({ name: 'publish_time', type: 'timestamp', nullable: true })
  publishTime: Date;

  // 相关度评分（0-100）
  @Column({ type: 'int', default: 0 })
  relevance: number;

  // 是否已采用
  @Column({ name: 'is_adopted', type: 'boolean', default: false })
  isAdopted: boolean;

  // 状态
  @Column({
    type: 'enum',
    enum: ReferenceInfoStatus,
    default: ReferenceInfoStatus.NEW,
  })
  status: ReferenceInfoStatus;

  // 采用时间
  @Column({ name: 'adopted_at', type: 'timestamp', nullable: true })
  adoptedAt: Date;

  // 采用用户ID
  @Column({ name: 'adopted_by', type: 'varchar', length: 36, nullable: true })
  adoptedBy: string;

  // 修改意见（当状态为MODIFIED时存储用户修改意见）
  @Column({ name: 'modification_notes', type: 'text', nullable: true })
  modificationNotes: string;

  // AI生成的内容（基于修改意见生成）
  @Column({ name: 'generated_content', type: 'longtext', nullable: true })
  generatedContent: string;

  // 忽略原因
  @Column({ name: 'ignore_reason', type: 'varchar', length: 500, nullable: true })
  ignoreReason: string;

  // 元数据（JSON存储，如抓取时间、抓取工具等）
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  // 关键词（JSON数组）
  @Column({ type: 'json', nullable: true })
  keywords: string[];

  // 分类标签
  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 软删除标记
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  // 辅助方法：检查是否已处理
  isProcessed(): boolean {
    return this.status !== ReferenceInfoStatus.NEW;
  }

  // 辅助方法：检查是否可被采用
  canBeAdopted(): boolean {
    return this.status === ReferenceInfoStatus.NEW;
  }

  // 辅助方法：标记为已采用
  markAsAdopted(userId: string): void {
    this.isAdopted = true;
    this.status = ReferenceInfoStatus.ADOPTED;
    this.adoptedAt = new Date();
    this.adoptedBy = userId;
  }

  // 辅助方法：标记为已修改
  markAsModified(userId: string, notes: string, generatedContent?: string): void {
    this.isAdopted = true;
    this.status = ReferenceInfoStatus.MODIFIED;
    this.adoptedAt = new Date();
    this.adoptedBy = userId;
    this.modificationNotes = notes;
    if (generatedContent) {
      this.generatedContent = generatedContent;
    }
  }

  // 辅助方法：标记为已忽略
  markAsIgnored(reason?: string): void {
    this.status = ReferenceInfoStatus.IGNORED;
    this.isAdopted = false;
    this.ignoreReason = reason;
  }
}