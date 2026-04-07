import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';
import { Tenant } from './tenant.entity';

export enum ReportType {
  SENTIMENT_DAILY = 'sentiment_daily', // 舆情监测日报
  SENTIMENT_WEEKLY = 'sentiment_weekly', // 舆情监测周报
  WECHAT_MONTHLY = 'wechat_monthly', // 公众号运营月报
  SPREAD_ANALYSIS = 'spread_analysis', // 传播分析报告
  CUSTOM = 'custom', // 自定义报告
}

export enum ReportStatus {
  GENERATING = 'generating', // 生成中
  COMPLETED = 'completed', // 已完成
  FAILED = 'failed', // 生成失败
}

@Entity('reports')
@Index(['tenantId'])
export class Report implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', default: 'default-tenant' })
  tenantId: string;

  @Column({
    type: 'enum',
    enum: ReportType,
    comment: '报告类型：舆情日报、舆情周报、公众号月报、传播分析、自定义',
  })
  type: ReportType;

  @Column({ comment: '报告标题' })
  title: string;

  @Column({ name: 'start_date', type: 'timestamp', comment: '报告统计开始时间' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', comment: '报告统计结束时间' })
  endDate: Date;

  @Column('json', { nullable: true, comment: '报告内容数据（JSON格式）' })
  content: any;

  @Column('json', { nullable: true, comment: '图表数据（JSON格式）' })
  charts: any;

  @Column('text', { nullable: true, comment: '分析结论和建议' })
  analysis: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.GENERATING,
    comment: '报告生成状态',
  })
  status: ReportStatus;

  @Column({ name: 'generated_by', nullable: true, comment: '生成者用户ID' })
  generatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'file_url', nullable: true, comment: '导出文件URL（如Word文档）' })
  fileUrl: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
  tenant: Tenant;
}