import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Topic } from './topic.entity';
import { Sentiment } from './sentiment.entity';

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum TenantType {
  BUSINESS = 'business',
  GOVERNMENT = 'government',
  DEMO_BUSINESS = 'demo_business',
  DEMO_GOVERNMENT = 'demo_government',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: TenantType,
    default: TenantType.BUSINESS,
  })
  tenantType: TenantType;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.ACTIVE,
  })
  status: TenantStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Topic, (topic) => topic.tenant)
  topics: Promise<Topic[]>;

  @OneToMany(() => Sentiment, (sentiment) => sentiment.tenant)
  sentiments: Promise<Sentiment[]>;
}
