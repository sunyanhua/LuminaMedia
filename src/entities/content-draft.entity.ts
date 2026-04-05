import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { PublishTask } from './publish-task.entity';
import { Topic } from './topic.entity';
import { Platform } from '../shared/enums/platform.enum';
import { GenerationMethod } from '../shared/enums/generation-method.enum';

// 内容状态枚举
export enum ContentStatus {
  DRAFT = 'draft', // 草稿
  PENDING_EDIT = 'pending_edit', // 初审
  PENDING_MANAGER = 'pending_manager', // 复审
  PENDING_LEGAL = 'pending_legal', // 终审
  APPROVED = 'approved', // 已通过
  PUBLISHED = 'published', // 已发布
  REJECTED = 'rejected', // 已退回
}

@Entity('content_drafts')
@Index(['tenantId'])
export class ContentDraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tenant_id',
    type: 'varchar',
    length: 36,
    default: 'default-tenant',
  })
  tenantId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @ManyToOne(() => Topic, { onDelete: 'CASCADE', eager: false, nullable: true })
  @JoinColumn({ name: 'topic_id' })
  topic: Promise<Topic>;

  @Column({
    name: 'platform_type',
    type: 'enum',
    enum: Platform,
  })
  platformType: Platform;

  @Column({ name: 'topic_id', nullable: true })
  topicId: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ name: 'cover_image', nullable: true })
  coverImage: string;

  @Column({ name: 'media_urls', type: 'json', nullable: true })
  mediaUrls: string[];

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({
    name: 'generated_by',
    type: 'enum',
    enum: GenerationMethod,
    nullable: true,
  })
  generatedBy: GenerationMethod;

  @Column({
    type: 'enum',
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;

  @Column({
    name: 'publish_order',
    type: 'int',
    nullable: true,
  })
  publishOrder: number;

  @Column({
    name: 'publish_scheduled_at',
    type: 'timestamp',
    nullable: true,
  })
  publishScheduledAt: Date;

  @Column({
    name: 'quality_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  qualityScore: number;

  @Column({
    name: 'ai_generated_content',
    type: 'json',
    nullable: true,
  })
  aiGeneratedContent: Record<string, any>;

  @Column({ default: false })
  isPreset: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  demoScenario?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PublishTask, (task) => task.draft, { eager: false })
  publishTasks: Promise<PublishTask[]>;
}
