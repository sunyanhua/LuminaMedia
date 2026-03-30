import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';
import { User } from './user.entity';
import { PublishTask } from './publish-task.entity';
import { PlatformType } from '../modules/publish/interfaces/platform-adapter.interface';
import { AccountStatus } from '../shared/enums/account-status.enum';

@Entity('social_accounts')
@Index(['tenantId'])
export class SocialAccount {
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

  @ManyToOne(() => User, (user) => user.socialAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: PlatformType,
  })
  platform: PlatformType;

  @Column({ name: 'account_name' })
  accountName: string;

  @Column({ name: 'platform_user_id', type: 'varchar', length: 255, nullable: true })
  platformUserId: string;

  @Column({ name: 'platform_user_name', type: 'varchar', length: 255, nullable: true })
  platformUserName: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ name: 'encrypted_credentials', type: 'text' })
  encryptedCredentials: string;

  @Column({ name: 'credential_hash', type: 'varchar', length: 64, nullable: true })
  credentialHash: string;

  @Column({ name: 'config', type: 'json', nullable: true })
  config: Record<string, any>;

  @Column({ name: 'quota_info', type: 'json', nullable: true })
  quotaInfo: Record<string, any>;

  @Column({ name: 'webhook_url', type: 'varchar', length: 500, nullable: true })
  webhookUrl: string;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled: boolean;

  @Column({ name: 'last_tested_at', type: 'timestamp', nullable: true })
  lastTestedAt: Date;

  @Column({ name: 'test_result', type: 'json', nullable: true })
  testResult: Record<string, any>;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

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
