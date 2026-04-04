import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('marketing_strategies')
export class MarketingStrategy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, default: 'content-marketing' })
  type: 'content-marketing' | 'social-media' | 'email-marketing' | 'seo' | 'paid-advertising' | 'influencer';

  @Column({ type: 'json', nullable: true })
  targetAudience?: any;

  @Column({ type: 'json', nullable: true })
  channels?: any[];

  @Column({ type: 'json', nullable: true })
  tactics?: any[];

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: 'draft' | 'active' | 'completed' | 'archived';

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