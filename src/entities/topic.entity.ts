import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
import { Material } from './material.entity';

export enum TopicSource {
  AI_RECOMMENDATION = 'ai_recommendation',
  MANUAL_CREATION = 'manual_creation',
  REFERENCE_INFO = 'reference_info',
}

export enum TopicStatus {
  DRAFT = 'draft',
  SELECTED = 'selected',
  ARCHIVED = 'archived',
}

@Entity('topics')
@Index(['tenantId'])
export class Topic implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', default: 'default-tenant' })
  tenantId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TopicSource,
    default: TopicSource.MANUAL_CREATION,
  })
  source: TopicSource;

  @Column({
    type: 'enum',
    enum: TopicStatus,
    default: TopicStatus.DRAFT,
  })
  status: TopicStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.topics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
  tenant: Tenant;

  @ManyToOne(() => User, (user) => user.topics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @OneToMany(() => Material, (material) => material.topic)
  materials: Material[];
}
