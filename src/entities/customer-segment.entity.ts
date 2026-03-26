import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CustomerProfile } from './customer-profile.entity';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';

@Entity('customer_segments')
@Index(['customerProfileId', 'segmentName'])
@Index(['tenantId'])
export class CustomerSegment implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 36, default: 'default-tenant' })
  tenantId: string;

  @Column({ name: 'customer_profile_id', type: 'varchar', length: 36 })
  customerProfileId: string;

  @ManyToOne(() => CustomerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_profile_id' })
  customerProfile: CustomerProfile;

  @Column({ name: 'segment_name', type: 'varchar', length: 255 })
  segmentName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'criteria', type: 'json' })
  criteria: Record<string, any>;

  @Column({ name: 'member_count', type: 'int', default: 0 })
  memberCount: number;

  @Column({ name: 'member_ids', type: 'json', nullable: true })
  memberIds: string[];

  @Column({ name: 'segment_insights', type: 'json', nullable: true })
  segmentInsights: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
