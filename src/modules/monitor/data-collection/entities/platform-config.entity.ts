import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  PlatformType,
  CollectionMethod,
} from '../interfaces/data-collection.interface';
import type {
  PlatformCredentials,
  CollectionConfig,
} from '../interfaces/data-collection.interface';

@Entity('platform_configs')
@Index(['platform', 'tenantId'], { unique: true })
export class PlatformConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  tenantId: string;

  @Column({
    type: 'enum',
    enum: PlatformType,
  })
  platform: PlatformType;

  @Column({
    type: 'enum',
    enum: CollectionMethod,
    default: CollectionMethod.API,
  })
  primaryMethod: CollectionMethod;

  @Column({ type: 'json', nullable: true })
  credentials: PlatformCredentials;

  @Column({ type: 'json', default: {} })
  config: CollectionConfig;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  successCount: number;

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccessAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastFailureAt: Date;

  @Column({ type: 'text', nullable: true })
  lastErrorMessage: string;

  @Column({ type: 'float', default: 0 })
  successRate: number; // 0-100

  @Column({ type: 'int', default: 0 })
  totalCollected: number;

  @Column({ type: 'timestamp', nullable: true })
  lastCollectionAt: Date;

  @Column({ type: 'json', nullable: true })
  apiLimits: {
    dailyLimit: number;
    remaining: number;
    resetAt: Date;
    rateLimit: number; // 请求/秒
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;
}
