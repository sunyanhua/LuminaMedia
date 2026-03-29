import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { TaskStatus, PlatformType, CollectionMethod } from '../interfaces/data-collection.interface';

@Entity('data_collection_tasks')
@Index(['platform', 'status'])
@Index(['scheduledAt', 'status'])
export class DataCollectionTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  tenantId: string;

  @Column({
    type: 'enum',
    enum: PlatformType,
    comment: '目标平台: wechat, weibo, xiaohongshu, douyin, news, forum'
  })
  platform: PlatformType;

  @Column({
    type: 'enum',
    enum: CollectionMethod,
    default: CollectionMethod.API,
    comment: '采集方式: API, RSS, CRAWLER'
  })
  method: CollectionMethod;

  @Column({ type: 'json', nullable: true })
  config: {
    target?: string; // 公众号ID、微博用户ID、URL等
    keywords?: string[];
    dateRange?: { start: Date; end: Date };
    maxResults?: number;
    apiCredentials?: any;
  };

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status: TaskStatus;

  @Column({ type: 'int', default: 0 })
  progress: number; // 0-100

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'json', nullable: true })
  result: {
    collectedCount: number;
    failedCount: number;
    totalCount: number;
    dataIds?: string[];
    summary?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;
}