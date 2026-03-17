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
import { SourceType } from '../shared/enums/source-type.enum';
import { DataImportStatus } from '../shared/enums/data-import-status.enum';

@Entity('data_import_jobs')
@Index(['customerProfileId', 'status'])
@Index(['createdAt'])
export class DataImportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_profile_id', type: 'varchar', length: 36 })
  customerProfileId: string;

  @ManyToOne(() => CustomerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_profile_id' })
  customerProfile: CustomerProfile;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: SourceType,
    default: SourceType.CSV,
  })
  sourceType: SourceType;

  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: true })
  filePath: string | null;

  @Column({
    name: 'original_filename',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  originalFilename: string | null;

  @Column({ name: 'record_count', type: 'int', default: 0 })
  recordCount: number;

  @Column({ name: 'success_count', type: 'int', default: 0 })
  successCount: number;

  @Column({ name: 'failed_count', type: 'int', default: 0 })
  failedCount: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: DataImportStatus,
    default: DataImportStatus.PENDING,
  })
  status: DataImportStatus;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'validation_errors', type: 'json', nullable: true })
  validationErrors: Record<string, any>[];

  @Column({ name: 'summary', type: 'json', nullable: true })
  summary: Record<string, any>;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'import_data', type: 'json', nullable: true })
  importData: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;
}
