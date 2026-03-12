import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PublishTask } from './publish-task.entity';
import { Platform } from '../shared/enums/platform.enum';

@Entity('content_drafts')
export class ContentDraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.contentDrafts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

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

  @OneToMany(() => PublishTask, (task) => task.draft)
  publishTasks: PublishTask[];
}