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
import { AccountStatus } from '../shared/enums/account-status.enum';

@Entity('social_accounts')
export class SocialAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.socialAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: Platform,
  })
  platform: Platform;

  @Column({ name: 'account_name' })
  accountName: string;

  @Column({ type: 'json' })
  credentials: Record<string, any>;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt: Date;

  @OneToMany(() => PublishTask, (task) => task.account)
  publishTasks: PublishTask[];
}
