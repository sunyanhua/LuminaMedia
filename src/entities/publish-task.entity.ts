import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContentDraft } from './content-draft.entity';
import { SocialAccount } from './social-account.entity';
import { TaskStatus } from '../shared/enums/task-status.enum';

@Entity('publish_tasks')
@Index(['tenantId'])
export class PublishTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 36, default: 'default-tenant' })
  tenantId: string;

  @Column({ name: 'draft_id' })
  draftId: string;

  @ManyToOne(() => ContentDraft, (draft) => draft.publishTasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'draft_id' })
  draft: ContentDraft;

  @Column({ name: 'account_id' })
  accountId: string;

  @ManyToOne(() => SocialAccount, (account) => account.publishTasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: SocialAccount;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({ name: 'scheduled_at', nullable: true })
  scheduledAt: Date;

  @Column({ name: 'published_at', nullable: true })
  publishedAt: Date;

  @Column({ name: 'post_url', nullable: true })
  postUrl: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;
}
