import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CrawlTask } from './crawl-task.entity';

// 队列项状态
export enum CrawlQueueStatus {
  PENDING = 'PENDING',        // 待处理
  PROCESSING = 'PROCESSING',  // 处理中
  COMPLETED = 'COMPLETED',    // 已完成
  FAILED = 'FAILED',         // 失败
}

@Entity('crawl_queues')
@Index(['taskId', 'status'])
@Index(['url'])
export class CrawlQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @ManyToOne(() => CrawlTask, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: CrawlTask;

  @Column({ name: 'url', type: 'varchar', length: 2000 })
  url: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CrawlQueueStatus,
    default: CrawlQueueStatus.PENDING,
  })
  status: CrawlQueueStatus;

  @Column({ name: 'priority', type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'error', type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
