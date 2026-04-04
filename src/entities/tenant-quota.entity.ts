import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenant_quotas')
export class TenantQuota {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  tenantId: string;

  @Column({ type: 'varchar', length: 100 })
  featureKey: string;

  @Column({ type: 'int', default: 0 })
  usedCount: number;

  @Column({ type: 'int', default: 100 })
  maxCount: number; // 最大配额数量

  @Column({ type: 'varchar', length: 50, default: 'daily' })
  quotaPeriod: 'daily' | 'weekly' | 'monthly'; // 配额周期

  @Column({ type: 'datetime', nullable: true })
  resetTime?: Date; // 配额重置时间

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}