import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('feature_configs')
export class FeatureConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  featureKey: string;

  @Column()
  featureName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tenantType?: string; // 'business', 'government', 'all'

  @Column({ type: 'json', nullable: true })
  configData?: any; // Additional configuration data

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('tenant_feature_toggles')
export class TenantFeatureToggle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  tenantId: string;

  @Column({ type: 'varchar', length: 100 })
  featureKey: string;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ type: 'json', nullable: true })
  quotaConfig?: any; // Quota configuration for this tenant-feature combination

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}