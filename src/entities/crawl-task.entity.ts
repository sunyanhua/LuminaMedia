import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';

// 抓取模式
export enum CrawlMode {
  SINGLE = 'SINGLE',    // 单页抓取
  PROJECT = 'PROJECT',  // 专题抓取
  SITE = 'SITE',        // 整站抓取
}

// 任务状态
export enum CrawlTaskStatus {
  PENDING = 'PENDING',      // 待处理
  RUNNING = 'RUNNING',      // 运行中
  COMPLETED = 'COMPLETED',  // 已完成
  CANCELLED = 'CANCELLED',  // 已取消
  FAILED = 'FAILED',        // 失败
}

@Entity('crawl_tasks')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'createdAt'])
export class CrawlTask implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 36 })
  tenantId: string;

  @Column({ name: 'source_url', type: 'varchar', length: 2000 })
  sourceUrl: string;

  @Column({
    name: 'mode',
    type: 'enum',
    enum: CrawlMode,
    default: CrawlMode.SINGLE,
  })
  mode: CrawlMode;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CrawlTaskStatus,
    default: CrawlTaskStatus.PENDING,
  })
  status: CrawlTaskStatus;

  @Column({ name: 'total_urls', type: 'int', default: 0 })
  totalUrls: number;

  @Column({ name: 'crawled_count', type: 'int', default: 0 })
  crawledCount: number;

  @Column({ name: 'failed_count', type: 'int', default: 0 })
  failedCount: number;

  @Column({ name: 'started_at', type: 'datetime', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'category', type: 'varchar', length: 255, nullable: true })
  category: string | null;
}
