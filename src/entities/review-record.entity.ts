import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ContentDraft } from './content-draft.entity';
import { User } from './user.entity';
import { ReviewStep } from '../shared/enums/review-step.enum';
import { ReviewStatus } from '../shared/enums/review-status.enum';
import { UserRole } from '../shared/enums/user-role.enum';

@Entity('review_records')
@Index(['tenantId'])
@Index(['contentDraftId'])
@Index(['reviewerId'])
@Index(['status'])
@Index(['reviewStep'])
export class ReviewRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tenant_id',
    type: 'varchar',
    length: 36,
    default: 'default-tenant',
  })
  tenantId: string;

  @Column({ name: 'content_draft_id' })
  contentDraftId: string;

  @ManyToOne(() => ContentDraft, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'content_draft_id' })
  contentDraft: Promise<ContentDraft>;

  @Column({ name: 'reviewer_id' })
  reviewerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: Promise<User>;

  @Column({
    name: 'reviewer_role',
    type: 'enum',
    enum: UserRole,
  })
  reviewerRole: UserRole;

  @Column({
    name: 'review_step',
    type: 'enum',
    enum: ReviewStep,
  })
  reviewStep: ReviewStep;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;
}