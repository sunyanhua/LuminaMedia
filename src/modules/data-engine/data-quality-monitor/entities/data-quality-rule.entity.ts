import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('data_quality_rules')
export class DataQualityRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ name: 'table_name', length: 100 })
  tableName: string;

  @Column({ name: 'field_name', length: 100, nullable: true })
  fieldName: string | null;

  @Column({ type: 'text' })
  condition: string;

  @Column({ type: 'decimal', precision: 5, scale: 3 })
  threshold: number;

  @Column({ type: 'varchar', length: 20 })
  severity: string; // 'info', 'warning', 'error'

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  schedule: string | null; // cron expression

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
