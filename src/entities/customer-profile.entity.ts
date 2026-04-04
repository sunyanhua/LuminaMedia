import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { CustomerType } from '../shared/enums/customer-type.enum';
import { Industry } from '../shared/enums/industry.enum';
import { DataImportJob } from './data-import-job.entity';
import { CustomerSegment } from './customer-segment.entity';
import { MarketingCampaign } from '../modules/data-analytics/entities/marketing-campaign.entity';
import { MarketingStrategy } from '../modules/data-analytics/entities/marketing-strategy.entity';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';

@Entity('customer_profiles')
@Index(['userId', 'customerType'])
@Index(['industry', 'createdAt'])
@Index(['tenantId'])
export class CustomerProfile implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tenant_id',
    type: 'varchar',
    length: 36,
    default: 'default-tenant',
  })
  tenantId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'customer_name', type: 'varchar', length: 255 })
  customerName: string;

  @Column({
    name: 'customer_type',
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.ENTERPRISE,
  })
  customerType: CustomerType;

  @Column({
    name: 'industry',
    type: 'enum',
    enum: Industry,
    default: Industry.OTHER,
  })
  industry: Industry;

  @Column({ name: 'data_sources', type: 'json', nullable: true })
  dataSources: Record<string, any>;

  @Column({ name: 'profile_data', type: 'json', nullable: true })
  profileData: Record<string, any>;

  @Column({ name: 'behavior_insights', type: 'json', nullable: true })
  behaviorInsights: Record<string, any>;

  @Column({ default: false })
  isPreset: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  demoScenario?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  @OneToMany(() => DataImportJob, (importJob) => importJob.customerProfile)
  importJobs: DataImportJob[];

  @OneToMany(() => CustomerSegment, (segment) => segment.customerProfile)
  segments: CustomerSegment[];

  @OneToMany(() => MarketingCampaign, (campaign) => campaign.customerProfile)
  campaigns: MarketingCampaign[];

  @OneToMany(() => MarketingStrategy, (strategy) => strategy.customerProfile)
  strategies: MarketingStrategy[];
}
