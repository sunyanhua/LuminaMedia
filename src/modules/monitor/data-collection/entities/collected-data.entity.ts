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
  DataStatus,
} from '../interfaces/data-collection.interface';

@Entity('collected_data')
@Index(['platform', 'sourceId'], { unique: true })
@Index(['tenantId', 'publishDate'])
@Index(['tenantId', 'collectedAt'])
@Index(['tenantId', 'sentimentScore'])
export class CollectedData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  tenantId: string;

  @Column({
    type: 'enum',
    enum: PlatformType,
  })
  platform: PlatformType;

  @Column({ type: 'varchar', length: 255 })
  sourceId: string; // 平台上的唯一ID

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  author: string;

  @Column({ type: 'timestamp', nullable: true })
  publishDate: Date;

  @Column({ type: 'timestamp' })
  collectedAt: Date;

  @Column({ type: 'json' })
  metadata: {
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
    sentiment?: number;
    language?: string;
    region?: string;
    tags?: string[];
    categories?: string[];
    mediaUrls?: string[];
    rawData?: any;
  };

  @Column({
    type: 'enum',
    enum: DataStatus,
    default: DataStatus.RAW,
  })
  status: DataStatus;

  @Column({ type: 'float', default: 0 })
  qualityScore: number; // 0-100

  @Column({ type: 'float', nullable: true })
  sentimentScore: number; // -1 到 1

  @Column({ type: 'varchar', length: 20, nullable: true })
  sentimentLabel: string; // positive, negative, neutral

  @Column({ type: 'json', nullable: true })
  entities: {
    persons?: string[];
    organizations?: string[];
    locations?: string[];
    products?: string[];
    events?: string[];
  };

  @Column({ type: 'json', nullable: true })
  topics: string[];

  @Column({ type: 'boolean', default: false })
  isHot: boolean;

  @Column({ type: 'int', default: 0 })
  hotnessScore: number;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deletedBy: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  taskId: string; // 关联的采集任务ID

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;
}
