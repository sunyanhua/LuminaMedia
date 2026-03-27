import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../../entities/user.entity';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { CampaignType } from '../../../shared/enums/campaign-type.enum';
import { CampaignStatus } from '../../../shared/enums/campaign-status.enum';
import { MarketingStrategy } from './marketing-strategy.entity';
import { TenantEntity } from '../../../shared/interfaces/tenant-entity.interface';

@Entity('marketing_campaigns')
@Index(['userId', 'status'])
@Index(['customerProfileId', 'status'])
@Index(['startDate', 'endDate'])
@Index(['tenantId'])
export class MarketingCampaign implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'customer_profile_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  customerProfileId: string;

  @ManyToOne(() => CustomerProfile, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'customer_profile_id' })
  customerProfile: CustomerProfile;

  @Column({
    name: 'tenant_id',
    type: 'varchar',
    length: 36,
    default: 'default-tenant',
  })
  tenantId: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({
    name: 'campaign_type',
    type: 'enum',
    enum: CampaignType,
  })
  campaignType: CampaignType;

  @Column({ name: 'target_audience', type: 'json', nullable: true })
  targetAudience: Record<string, any>;

  @Column({
    name: 'budget',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  budget: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => MarketingStrategy, (strategy) => strategy.campaign)
  strategies: MarketingStrategy[];
}
