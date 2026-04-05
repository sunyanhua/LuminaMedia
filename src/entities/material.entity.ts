import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';
import { Topic } from './topic.entity';

export enum MaterialType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  TEXT = 'text',
  AUDIO = 'audio',
  OTHER = 'other',
}

@Entity('materials')
@Index(['tenantId'])
@Index(['topicId'])
export class Material implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', default: 'default-tenant' })
  tenantId: string;

  @Column({ name: 'topic_id' })
  topicId: string;

  @Column({
    type: 'enum',
    enum: MaterialType,
    default: MaterialType.IMAGE,
  })
  type: MaterialType;

  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'file_name', nullable: true })
  fileName: string;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize: number;

  @Column({ name: 'file_type', nullable: true })
  fileType: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Topic, (topic) => topic.materials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id', referencedColumnName: 'id' })
  topic: Topic;
}