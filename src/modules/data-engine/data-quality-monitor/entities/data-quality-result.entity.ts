import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('data_quality_results')
export class DataQualityResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rule_id', length: 36 })
  @Index()
  ruleId: string;

  @Column({ name: 'rule_name', length: 200 })
  ruleName: string;

  @Column({ name: 'table_name', length: 100 })
  tableName: string;

  @Column({ name: 'field_name', length: 100, nullable: true })
  fieldName: string | null;

  @Column({ name: 'metric_value', type: 'decimal', precision: 10, scale: 6 })
  metricValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 3 })
  threshold: number;

  @Column({ type: 'varchar', length: 20 })
  severity: string; // 'info', 'warning', 'error'

  @Column({ type: 'boolean' })
  passed: boolean;

  @Column({ name: 'execution_time', type: 'timestamp' })
  @Index()
  executionTime: Date;

  @Column({ type: 'json', nullable: true })
  details: Record<string, any> | null;
}
