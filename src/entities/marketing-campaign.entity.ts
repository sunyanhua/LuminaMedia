import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('marketing_campaigns')
export class MarketingCampaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';

  @Column({ type: 'datetime', nullable: true })
  startDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate?: Date;

  @Column({ type: 'json', nullable: true })
  objectives?: any;

  @Column({ type: 'json', nullable: true })
  budget?: any;

  @Column({ type: 'varchar', length: 100, default: 'default-tenant' })
  tenantId: string;

  @Column({ default: false })
  isPreset: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  demoScenario?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}