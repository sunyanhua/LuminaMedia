import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum AnalysisType {
  REGIONAL_ANALYSIS = 'regional_analysis',
  COMPETITIVE_ANALYSIS = 'competitive_analysis',
  SEO_SUGGESTION = 'seo_suggestion',
  OPPORTUNITY_IDENTIFICATION = 'opportunity_identification',
  TREND_ANALYSIS = 'trend_analysis',
}

export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('geo_analysis_results')
@Index(['tenantId', 'customerProfileId', 'analysisType'])
@Index(['tenantId', 'targetRegionId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'createdAt'])
export class GeoAnalysisResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  tenantId: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  customerProfileId: string; // 关联的客户档案ID

  @Column({ type: 'varchar', length: 36, nullable: true })
  targetRegionId: string; // 目标地区ID

  @Column({ type: 'varchar', length: 100, nullable: true })
  targetRegionName: string; // 目标地区名称

  @Column({
    type: 'enum',
    enum: AnalysisType,
  })
  analysisType: AnalysisType; // 分析类型

  @Column({
    type: 'enum',
    enum: AnalysisStatus,
    default: AnalysisStatus.PENDING,
  })
  status: AnalysisStatus; // 分析状态

  @Column({ type: 'json', nullable: true })
  inputParameters: {
    timeRange?: {
      start: Date;
      end: Date;
    };
    competitors?: string[];
    industries?: string[];
    keywords?: string[];
    metrics?: string[];
    regionLevel?: string;
    dataSources?: string[];
  }; // 输入参数

  @Column({ type: 'json', nullable: true })
  regionalAnalysis: {
    demographicProfile: {
      populationDensity: number; // 人口密度
      ageStructure: Record<string, number>; // 年龄结构
      educationLevel: Record<string, number>; // 教育水平
      incomeDistribution: Record<string, number>; // 收入分布
    };
    economicProfile: {
      gdpGrowth: number; // GDP增长率
      industryStructure: Record<string, number>; // 产业结构
      consumptionLevel: number; // 消费水平指数
      investmentEnvironment: number; // 投资环境评分
    };
    culturalProfile: {
      languageDistribution: Record<string, number>; // 语言分布
      culturalCharacteristics: string[]; // 文化特征
      consumerPreferences: string[]; // 消费偏好
      mediaHabits: Record<string, number>; // 媒体习惯
    };
    digitalProfile: {
      internetPenetration: number; // 互联网普及率
      mobileUsage: number; // 移动设备使用率
      socialMediaActivity: Record<string, number>; // 社交媒体活跃度
      ecommerceAdoption: number; // 电商采用率
    };
  };

  @Column({ type: 'json', nullable: true })
  competitiveAnalysis: {
    marketSize: number; // 市场规模
    marketGrowth: number; // 市场增长率
    competitionIntensity: number; // 竞争强度（1-10）
    marketConcentration: number; // 市场集中度
    competitors: {
      name: string;
      marketShare: number;
      strengths: string[];
      weaknesses: string[];
      strategies: string[];
      threatLevel: 'low' | 'medium' | 'high';
    }[];
    barriersToEntry: string[]; // 进入壁垒
    competitiveAdvantages: string[]; // 竞争优势
  };

  @Column({ type: 'json', nullable: true })
  seoSuggestions: {
    keywordOpportunities: {
      keyword: string;
      searchVolume: number;
      competition: 'low' | 'medium' | 'high';
      opportunityScore: number; // 机会得分（0-100）
      suggestedActions: string[];
    }[];
    contentLocalization: {
      culturalElements: string[]; // 文化元素
      languageAdaptations: string[]; // 语言适配
      localReferences: string[]; // 本地引用
      seasonalContent: string[]; // 季节性内容
    };
    channelRecommendations: {
      channel: string;
      reach: number; // 覆盖率（%）
      engagement: number; // 参与度（%）
      costEffectiveness: 'low' | 'medium' | 'high';
      recommendedActions: string[];
    }[];
    technicalOptimizations: {
      area: string;
      currentStatus: string;
      recommendation: string;
      priority: 'low' | 'medium' | 'high';
      expectedImpact: string;
    }[];
  };

  @Column({ type: 'json', nullable: true })
  opportunityIdentification: {
    untappedMarkets: {
      region: string;
      marketSize: number;
      growthPotential: number;
      entryDifficulty: 'low' | 'medium' | 'high';
      suggestedStrategy: string;
    }[];
    productGaps: {
      productCategory: string;
      unmetNeeds: string[];
      potentialDemand: number;
      competitiveLandscape: string;
    }[];
    partnershipOpportunities: {
      partnerType: string;
      potentialPartners: string[];
      synergies: string[];
      contactStrategy: string;
    }[];
    innovationAreas: {
      area: string;
      technologyTrends: string[];
      customerNeeds: string[];
      competitiveAdvantage: string;
    }[];
  };

  @Column({ type: 'json', nullable: true })
  trendAnalysis: {
    historicalTrends: {
      metric: string;
      values: { date: string; value: number }[];
      trendDirection: 'up' | 'down' | 'stable';
      growthRate: number;
    }[];
    predictiveInsights: {
      metric: string;
      forecast: { date: string; value: number }[];
      confidenceLevel: number;
      keyDrivers: string[];
    }[];
    seasonalityPatterns: {
      patternType: string;
      months: string[];
      impactLevel: 'low' | 'medium' | 'high';
      recommendations: string[];
    }[];
    emergingTrends: {
      trend: string;
      emergenceDate: string;
      adoptionRate: number;
      potentialImpact: 'low' | 'medium' | 'high';
    }[];
  };

  @Column({ type: 'float', nullable: true })
  overallScore: number; // 总体评分（0-100）

  @Column({ type: 'json', nullable: true })
  keyFindings: string[]; // 关键发现

  @Column({ type: 'json', nullable: true })
  recommendations: {
    category: string;
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
    expectedImpact: string;
    timeframe: string;
    resourcesNeeded: string[];
  }[]; // 推荐建议

  @Column({ type: 'json', nullable: true })
  visualizations: {
    chartType: string;
    data: any;
    title: string;
    description: string;
  }[]; // 可视化数据

  @Column({ type: 'timestamp', nullable: true })
  analysisStartedAt: Date; // 分析开始时间

  @Column({ type: 'timestamp', nullable: true })
  analysisCompletedAt: Date; // 分析完成时间

  @Column({ type: 'int', nullable: true })
  processingTime: number; // 处理时间（毫秒）

  @Column({ type: 'text', nullable: true })
  errorMessage: string; // 错误信息

  @Column({ type: 'json', nullable: true })
  metadata: {
    dataSourcesUsed: string[];
    algorithmVersion: string;
    modelParameters: Record<string, any>;
    confidenceScores: Record<string, number>;
  }; // 元数据

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;
}
