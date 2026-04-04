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
import { Platform } from '../shared/enums/platform.enum';
import { GenerationMethod } from '../shared/enums/generation-method.enum';

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

  @Column({
    name: 'platform_type',
    type: 'enum',
    enum: Platform,
  })
  platformType: Platform;

  @Column()
  title: string;

  @Column('text')
  content: string;

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
