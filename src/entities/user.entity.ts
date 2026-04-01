import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { SocialAccount } from './social-account.entity';
import { ContentDraft } from './content-draft.entity';
import { UserRole } from './user-role.entity';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';

@Entity('users')
@Index(['tenantId'])
export class User implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'tenant_id', default: 'default-tenant' })
  tenantId: string;

  @OneToMany(() => SocialAccount, (account) => account.user)
  socialAccounts: SocialAccount[];

  @OneToMany(() => ContentDraft, (draft) => draft.user)
  contentDrafts: Promise<ContentDraft[]>;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];
}
