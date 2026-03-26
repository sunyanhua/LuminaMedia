import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { MarketingCampaign } from './marketing-campaign.entity';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { StrategyType } from '../../../shared/enums/strategy-type.enum';
import { GenerationMethod } from '../../../shared/enums/generation-method.enum';
import { Platform } from '../../../shared/enums/platform.enum';
import { AIEngine } from '../interfaces/gemini.interface';
import { TenantEntity } from '../../../shared/interfaces/tenant-entity.interface';

@Entity('marketing_strategies')
@Index(['campaignId'])
@Index(['customerProfileId'])
@Index(['strategyType'])
@Index(['confidenceScore'])
@Index(['tenantId'])
export class MarketingStrategy implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 36, default: 'default-tenant' })
  tenantId: string;

  @Column({ name: 'campaign_id', type: 'varchar', length: 36 })
  campaignId: string;

  @ManyToOne(() => MarketingCampaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: MarketingCampaign;

  @Column({
    name: 'customer_profile_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  customerProfileId: string;

  @ManyToOne(() => CustomerProfile, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'customer_profile_id' })
  customerProfile: CustomerProfile;

  @Column({
    name: 'strategy_type',
    type: 'enum',
    enum: StrategyType,
  })
  strategyType: StrategyType;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'implementation_plan', type: 'json', nullable: true })
  implementationPlan: Record<string, any>;

  @Column({
    name: 'expected_roi',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  expectedROI: string;

  @Column({ name: 'confidence_score', type: 'varchar', length: 255, nullable: true })
  confidenceScore: string;

  @Column({
    name: 'generated_by',
    type: 'enum',
    enum: GenerationMethod,
    default: GenerationMethod.AI_GENERATED,
  })
  generatedBy: GenerationMethod;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'campaign_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  campaignName: string;

  @Column({ name: 'target_audience_analysis', type: 'json', nullable: true })
  targetAudienceAnalysis: Record<string, any>;

  @Column({ name: 'core_idea', type: 'text', nullable: true })
  coreIdea: string;

  @Column({ name: 'xhs_content', type: 'text', nullable: true })
  xhsContent: string;

  @Column({ name: 'wechat_full_plan', type: 'json', nullable: true })
  wechatFullPlan: Record<string, any>;

  @Column({ name: 'recommended_execution_time', type: 'json', nullable: true })
  recommendedExecutionTime: Record<string, any>;

  @Column({
    name: 'expected_performance_metrics',
    type: 'json',
    nullable: true,
  })
  expectedPerformanceMetrics: Record<string, any>;

  @Column({ name: 'execution_steps', type: 'json', nullable: true })
  executionSteps: Record<string, any>;

  @Column({ name: 'risk_assessment', type: 'json', nullable: true })
  riskAssessment: Record<string, any>;

  @Column({ name: 'budget_allocation', type: 'json', nullable: true })
  budgetAllocation: Record<string, any>;

  @Column({ name: 'ai_response_raw', type: 'text', nullable: true })
  aiResponseRaw: string;

  @Column({
    name: 'ai_engine',
    type: 'enum',
    enum: AIEngine,
    nullable: true,
    default: AIEngine.FALLBACK,
  })
  aiEngine: AIEngine;

  @Column({
    name: 'generated_content_ids',
    type: 'json',
    nullable: true,
  })
  generatedContentIds: string[];

  @Column({
    name: 'content_platforms',
    type: 'json',
    nullable: true,
  })
  contentPlatforms: Platform[];
}
