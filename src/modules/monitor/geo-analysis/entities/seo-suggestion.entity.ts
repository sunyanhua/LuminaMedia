import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum SuggestionType {
  KEYWORD = 'keyword',
  CONTENT = 'content',
  TECHNICAL = 'technical',
  LOCAL = 'local',
  LINK = 'link',
}

export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ImplementationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DEFERRED = 'deferred',
  CANCELLED = 'cancelled',
}

@Entity('seo_suggestions')
@Index(['tenantId', 'customerProfileId', 'suggestionType'])
@Index(['tenantId', 'targetRegionId'])
@Index(['tenantId', 'priority'])
@Index(['tenantId', 'implementationStatus'])
@Index(['tenantId', 'expectedImpact'])
@Index(['tenantId', 'createdAt'])
export class SeoSuggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  tenantId: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  customerProfileId: string; // 关联的客户档案ID

  @Column({ type: 'varchar', length: 36, nullable: true })
  targetRegionId: string; // 目标地区ID

  @Column({ type: 'varchar', length: 100 })
  targetRegionName: string; // 目标地区名称

  @Column({
    type: 'enum',
    enum: SuggestionType,
  })
  suggestionType: SuggestionType; // 建议类型

  @Column({ type: 'varchar', length: 200 })
  title: string; // 建议标题

  @Column({ type: 'text' })
  description: string; // 详细描述

  @Column({ type: 'json', nullable: true })
  details: {
    // 关键词建议
    keyword?: string;
    searchVolume?: number;
    competitionLevel?: 'low' | 'medium' | 'high';
    keywordDifficulty?: number;
    relatedKeywords?: string[];
    searchIntent?: 'informational' | 'commercial' | 'transactional' | 'navigational';

    // 内容建议
    contentTopic?: string;
    targetAudience?: string;
    contentFormat?: 'article' | 'video' | 'infographic' | 'podcast' | 'social_media';
    wordCount?: number;
    keyMessages?: string[];
    callToAction?: string;

    // 技术建议
    technicalIssue?: string;
    currentStatus?: string;
    recommendedAction?: string;
    affectedPages?: string[];
    implementationSteps?: string[];

    // 本地化建议
    localElement?: string;
    culturalContext?: string;
    languageVariation?: string;
    localReferences?: string[];
    regionalPreferences?: string[];

    // 链接建议
    linkType?: 'internal' | 'external';
    sourcePage?: string;
    targetPage?: string;
    anchorText?: string;
    linkPurpose?: 'authority' | 'relevance' | 'navigation';
  };

  @Column({ type: 'json', nullable: true })
  rationale: {
    dataSource: string;
    analysisMethod: string;
    supportingData: any;
    assumptions: string[];
    limitations: string[];
  }; // 建议依据

  @Column({ type: 'json', nullable: true })
  expectedBenefits: {
    trafficIncrease?: number; // 预计流量增长（%）
    rankingImprovement?: number; // 预计排名提升（位次）
    conversionIncrease?: number; // 预计转化率提升（%）
    brandVisibility?: string; // 品牌曝光度提升
    competitiveAdvantage?: string; // 竞争优势
    costSavings?: number; // 成本节约
  };

  @Column({ type: 'json', nullable: true })
  implementationPlan: {
    steps: {
      step: number;
      action: string;
      responsibleTeam?: string;
      estimatedEffort: number; // 预计工作量（小时）
      dependencies?: string[];
      deliverables?: string[];
    }[];
    totalEffort: number; // 总工作量（小时）
    estimatedCost?: number; // 预计成本
    requiredResources: string[]; // 所需资源
    potentialRisks: {
      risk: string;
      probability: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      mitigationStrategy: string;
    }[];
  };

  @Column({
    type: 'enum',
    enum: PriorityLevel,
    default: PriorityLevel.MEDIUM,
  })
  priority: PriorityLevel; // 优先级

  @Column({ type: 'float' })
  expectedImpact: number; // 预期影响（0-100）

  @Column({ type: 'float' })
  implementationDifficulty: number; // 实施难度（0-100）

  @Column({ type: 'float' })
  roiScore: number; // ROI评分（0-100）

  @Column({
    type: 'enum',
    enum: ImplementationStatus,
    default: ImplementationStatus.PENDING,
  })
  implementationStatus: ImplementationStatus; // 实施状态

  @Column({ type: 'timestamp', nullable: true })
  implementationStartDate: Date; // 实施开始日期

  @Column({ type: 'timestamp', nullable: true })
  implementationEndDate: Date; // 实施结束日期

  @Column({ type: 'varchar', length: 100, nullable: true })
  implementedBy: string; // 实施人

  @Column({ type: 'text', nullable: true })
  implementationNotes: string; // 实施笔记

  @Column({ type: 'json', nullable: true })
  actualResults: {
    actualTrafficIncrease?: number;
    actualRankingImprovement?: number;
    actualConversionIncrease?: number;
    userFeedback?: string;
    lessonsLearned?: string[];
  }; // 实际结果

  @Column({ type: 'float', nullable: true })
  actualRoi: number; // 实际ROI

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean; // 是否定期执行

  @Column({ type: 'varchar', length: 50, nullable: true })
  recurrencePattern: string; // 重复模式（cron表达式）

  @Column({ type: 'timestamp', nullable: true })
  nextRecurrenceDate: Date; // 下次执行日期

  @Column({ type: 'json', nullable: true })
  tags: string[]; // 标签

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // 是否活跃

  @Column({ type: 'json', nullable: true })
  relatedSuggestions: string[]; // 相关建议ID

  @Column({ type: 'json', nullable: true })
  attachments: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[]; // 附件

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;
}