import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { CustomerSegment } from '../../../entities/customer-segment.entity';
import { DataImportJob } from '../../../entities/data-import-job.entity';
import { MarketingCampaign } from '../entities/marketing-campaign.entity';
import { MarketingStrategy } from '../entities/marketing-strategy.entity';
import { UserBehavior } from '../entities/user-behavior.entity';
import { CustomerProfileRepository } from '../../../shared/repositories/customer-profile.repository';
import { CustomerSegmentRepository } from '../../../shared/repositories/customer-segment.repository';
import { DataImportJobRepository } from '../../../shared/repositories/data-import-job.repository';
import { MarketingCampaignRepository } from '../../../shared/repositories/marketing-campaign.repository';
import { MarketingStrategyRepository } from '../../../shared/repositories/marketing-strategy.repository';
import { UserBehaviorRepository } from '../../../shared/repositories/user-behavior.repository';
import { ContentGenerationService } from './content-generation.service';
import { MarketingStrategyService } from './marketing-strategy.service';
import { TenantContextService } from '../../../shared/services/tenant-context.service';
import { Platform } from '../../../shared/enums/platform.enum';
import { CampaignType } from '../../../shared/enums/campaign-type.enum';
import { CampaignStatus } from '../../../shared/enums/campaign-status.enum';
import { StrategyType } from '../../../shared/enums/strategy-type.enum';
import { GenerationMethod } from '../../../shared/enums/generation-method.enum';
import { CustomerType } from '../../../shared/enums/customer-type.enum';
import { Industry } from '../../../shared/enums/industry.enum';

/**
 * DEMO 演示服务
 *
 * 提供一键演示功能，包括：
 * 1. 创建模拟客户档案
 * 2. 生成客户分群
 * 3. 创建营销活动
 * 4. 生成营销策略
 * 5. 生成营销内容
 */
@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);

  constructor(
    @InjectRepository(CustomerProfile)
    private customerProfileRepository: Repository<CustomerProfile>,
    @InjectRepository(CustomerSegment)
    private customerSegmentRepository: Repository<CustomerSegment>,
    @InjectRepository(DataImportJob)
    private dataImportJobRepository: Repository<DataImportJob>,
    @InjectRepository(MarketingCampaign)
    private marketingCampaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(MarketingStrategy)
    private marketingStrategyRepository: Repository<MarketingStrategy>,
    @InjectRepository(UserBehavior)
    private userBehaviorRepository: Repository<UserBehavior>,
    private readonly contentGenerationService: ContentGenerationService,
    private readonly marketingStrategyService: MarketingStrategyService,
  ) {}

  /**
   * 创建商场客户营销方案演示
   */
  async createMallCustomerDemo(
    userId: string = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  ): Promise<{
    customerProfile: CustomerProfile;
    segments: CustomerSegment[];
    campaign: MarketingCampaign;
    strategies: MarketingStrategy[];
    contentGenerationResult?: any;
  }> {
    this.logger.log(`Creating mall customer demo for user: ${userId}`);

    try {
      // 1. 创建模拟客户档案
      const customerProfile = await this.createDemoCustomerProfile(userId);

      // 2. 创建客户分群
      const segments = await this.createDemoSegments(customerProfile.id);

      // 3. 创建营销活动
      const campaign = await this.createDemoCampaign(
        userId,
        customerProfile.id,
      );

      // 4. 生成营销策略
      const strategies = await this.generateDemoStrategies(campaign.id);

      // 5. 为第一个策略生成营销内容
      let contentGenerationResult = null;
      if (strategies.length > 0) {
        contentGenerationResult = await this.generateDemoContent(
          campaign,
          strategies[0],
        );
      }

      return {
        customerProfile,
        segments,
        campaign,
        strategies,
        contentGenerationResult,
      };
    } catch (error) {
      this.logger.error(`Failed to create demo: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 创建演示客户档案
   */
  private async createDemoCustomerProfile(
    userId: string,
  ): Promise<CustomerProfile> {
    const profileData: Partial<CustomerProfile> = {
      customerName: '商场顾客数据',
      customerType: CustomerType.INDIVIDUAL,
      industry: Industry.RETAIL,
      dataSources: [
        {
          type: 'CSV',
          path: 'demo-data/mall_customers.csv',
          recordCount: 1000,
        },
        {
          type: 'POS',
          path: 'pos-system-export-2026-q1.csv',
          recordCount: 12500,
        },
        {
          type: 'LOYALTY',
          path: 'loyalty-program-members.json',
          recordCount: 850,
        },
      ],
      profileData: {
        totalCustomers: 1000,
        activeCustomers: 780,
        avgAge: 32.5,
        ageDistribution: {
          '18-25': 25,
          '26-35': 40,
          '36-45': 20,
          '46-55': 10,
          '56+': 5,
        },
        genderDistribution: { male: 45, female: 55 },
        avgAnnualIncome: 85000,
        incomeDistribution: {
          '0-50000': 20,
          '50001-100000': 45,
          '100001-200000': 25,
          '200001+': 10,
        },
        avgSpendingScore: 50.2,
        spendingScoreDistribution: {
          '0-20': 15,
          '21-40': 25,
          '41-60': 30,
          '61-80': 20,
          '81-100': 10,
        },
        topCategories: [
          '服饰',
          '美妆',
          '餐饮',
          '娱乐',
          '家居',
          '数码',
          '儿童用品',
          '健身',
        ],
        categorySpending: {
          服饰: 28,
          美妆: 22,
          餐饮: 18,
          娱乐: 15,
          家居: 8,
          数码: 5,
          儿童用品: 3,
          健身: 1,
        },
        locationDistribution: {
          北京: 30,
          上海: 25,
          广东: 20,
          浙江: 10,
          江苏: 8,
          其他: 7,
        },
        membershipStatus: {
          普通会员: 60,
          银卡会员: 25,
          金卡会员: 10,
          白金会员: 5,
        },
        description:
          '基于1000条商场顾客消费记录的模拟数据，包含详细的人口统计、消费习惯和偏好分析',
      },
      behaviorInsights: {
        peakHours: ['14:00-16:00', '19:00-21:00'],
        peakWeekdays: ['周六', '周日'],
        averageVisitFrequency: '每周1.5次',
        visitFrequencyDistribution: {
          '每周<1次': 25,
          '每周1-2次': 40,
          '每周3-4次': 25,
          '每周5+次': 10,
        },
        averageTransactionValue: 350,
        transactionValueDistribution: {
          '0-200': 30,
          '201-500': 40,
          '501-1000': 20,
          '1001+': 10,
        },
        preferredPaymentMethods: {
          移动支付: 65,
          信用卡: 20,
          现金: 10,
          其他: 5,
        },
        crossCategoryShopping: 42, // 跨品类购物比例
        repeatPurchaseRate: 38, // 复购率
        customerLifetimeValue: 2500,
        churnRiskScore: 22, // 流失风险分数（越低越好）
        engagementMetrics: {
          appOpenRate: 45,
          pushNotificationOpenRate: 32,
          emailOpenRate: 28,
          socialMediaEngagement: 18,
        },
      },
      userId,
    };

    const profile = this.customerProfileRepository.create(profileData);
    return await this.customerProfileRepository.save(profile);
  }

  /**
   * 创建演示客户分群
   */
  private async createDemoSegments(
    customerProfileId: string,
  ): Promise<CustomerSegment[]> {
    const segmentsData = [
      {
        segmentName: '高价值VIP客户',
        description: '高收入高消费群体，注重品质和体验，对价格不敏感',
        criteria: {
          minSpendingScore: 70,
          minAnnualIncome: 100000,
          minTransactionValue: 800,
        },
        memberCount: 150,
        segmentInsights: {
          preferences: [
            '奢侈品',
            '高端餐饮',
            '专属服务',
            '定制体验',
            '私人购物',
          ],
          channels: [
            '会员专属活动',
            '一对一顾问',
            '微信VIP群',
            '专属客服热线',
            '高级会员APP',
          ],
          averageTransactionValue: 1200,
          visitFrequency: '每周2.5次',
          customerLifetimeValue: 8500,
          retentionRate: 0.92,
          crossCategoryRatio: 0.68,
        },
        marketingRecommendations: {
          personalizedOffers: true,
          exclusiveEvents: true,
          earlyAccess: true,
          conciergeService: true,
          giftWithPurchase: true,
        },
      },
      {
        segmentName: '年轻时尚族群',
        description: '18-30岁年轻人群，追求时尚和社交，受网红/KOL影响大',
        criteria: { maxAge: 30, minSpendingScore: 60, maxAnnualIncome: 80000 },
        memberCount: 300,
        segmentInsights: {
          preferences: [
            '潮流服饰',
            '网红餐饮',
            '社交活动',
            '限量商品',
            '体验消费',
          ],
          channels: [
            '小红书',
            '抖音',
            '微信朋友圈',
            '微博',
            'B站',
            'Instagram',
          ],
          averageTransactionValue: 450,
          visitFrequency: '每周2次',
          customerLifetimeValue: 3200,
          retentionRate: 0.78,
          crossCategoryRatio: 0.55,
        },
        marketingRecommendations: {
          socialMediaCampaigns: true,
          KOLCollaborations: true,
          limitedEditionProducts: true,
          experientialMarketing: true,
          userGeneratedContent: true,
        },
      },
      {
        segmentName: '家庭消费群体',
        description: '30-50岁家庭人群，注重实用性和性价比，以家庭需求为导向',
        criteria: {
          minAge: 30,
          maxAge: 50,
          hasFamily: true,
          hasChildren: true,
        },
        memberCount: 350,
        segmentInsights: {
          preferences: [
            '儿童用品',
            '家庭餐饮',
            '家居用品',
            '健康食品',
            '教育服务',
          ],
          channels: [
            '微信公众号',
            '社区活动',
            '亲子社群',
            '家长群',
            '本地生活平台',
          ],
          averageTransactionValue: 650,
          visitFrequency: '每周1.8次',
          customerLifetimeValue: 4200,
          retentionRate: 0.85,
          crossCategoryRatio: 0.72,
        },
        marketingRecommendations: {
          familyBundles: true,
          loyaltyPrograms: true,
          weekendPromotions: true,
          childFriendlyActivities: true,
          communityEngagement: true,
        },
      },
      {
        segmentName: '价值寻求者',
        description: '价格敏感型顾客，关注促销和折扣，追求高性价比',
        criteria: {
          maxSpendingScore: 40,
          maxTransactionValue: 300,
          preferDiscounts: true,
        },
        memberCount: 120,
        segmentInsights: {
          preferences: [
            '折扣商品',
            '促销活动',
            '会员日特惠',
            '积分兑换',
            '团购',
          ],
          channels: [
            '促销APP',
            '优惠券平台',
            '会员短信',
            '店内海报',
            '导购推荐',
          ],
          averageTransactionValue: 220,
          visitFrequency: '每周1.2次',
          customerLifetimeValue: 1800,
          retentionRate: 0.65,
          crossCategoryRatio: 0.38,
        },
        marketingRecommendations: {
          targetedDiscounts: true,
          flashSales: true,
          bundleDeals: true,
          loyaltyPointsMultiplier: true,
          priceMatchGuarantee: true,
        },
      },
      {
        segmentName: '数字化原住民',
        description: '高度依赖数字渠道，偏好移动支付和线上购物，技术接受度高',
        criteria: {
          techSavvy: true,
          preferMobilePayments: true,
          onlineShoppingFrequency: 'high',
        },
        memberCount: 80,
        segmentInsights: {
          preferences: [
            '线上购物',
            '移动支付',
            '自助结账',
            'AR试妆',
            '智能推荐',
          ],
          channels: [
            '商场APP',
            '微信小程序',
            '支付宝生活号',
            '电商平台',
            '社交媒体广告',
          ],
          averageTransactionValue: 520,
          visitFrequency: '每周1.5次',
          customerLifetimeValue: 2900,
          retentionRate: 0.81,
          crossCategoryRatio: 0.61,
        },
        marketingRecommendations: {
          mobileAppFeatures: true,
          personalizedRecommendations: true,
          digitalCoupons: true,
          augmentedReality: true,
          seamlessOmnichannel: true,
        },
      },
    ];

    const segments = segmentsData.map((data) => {
      return this.customerSegmentRepository.create({
        customerProfileId,
        segmentName: data.segmentName,
        description: data.description,
        criteria: data.criteria,
        memberCount: data.memberCount,
        segmentInsights: data.segmentInsights,
      });
    });

    return await this.customerSegmentRepository.save(segments);
  }

  /**
   * 创建演示营销活动
   */
  private async createDemoCampaign(
    userId: string,
    customerProfileId: string,
  ): Promise<MarketingCampaign> {
    const campaignData: Partial<MarketingCampaign> = {
      userId,
      customerProfileId,
      name: '商场春季焕新购物节',
      campaignType: CampaignType.HYBRID,
      targetAudience: {
        demographics: {
          ageRange: [18, 55],
          gender: 'both',
          incomeLevel: 'middle_to_high',
          location: ['北京', '上海', '广东', '浙江', '江苏'],
          educationLevel: 'college+',
        },
        interests: [
          '购物',
          '时尚',
          '美食',
          '娱乐',
          '生活方式',
          '家庭',
          '健康',
          '旅行',
        ],
        behavior: {
          visitFrequency: 'weekly',
          spendingLevel: 'medium_to_high',
          preferredTime: 'weekends',
          preferredChannels: ['商场APP', '微信', '小红书', '线下门店'],
          loyaltyStatus: ['普通会员', '银卡会员', '金卡会员'],
        },
        psychographics: {
          values: ['品质生活', '家庭幸福', '社交认同', '自我提升'],
          lifestyle: ['都市白领', '年轻家庭', '时尚达人', '品质追求者'],
          personality: ['外向社交', '追求新颖', '注重实用', '价值敏感'],
        },
      },
      budget: 200000,
      status: CampaignStatus.ACTIVE,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-06-30'),
    };

    const campaign = this.marketingCampaignRepository.create(campaignData);
    return await this.marketingCampaignRepository.save(campaign);
  }

  /**
   * 生成演示营销策略
   */
  private async generateDemoStrategies(
    campaignId: string,
  ): Promise<MarketingStrategy[]> {
    const strategyTypes = [
      StrategyType.CONTENT,
      StrategyType.CHANNEL,
      StrategyType.TIMING,
      StrategyType.BUDGET_ALLOCATION,
    ];

    const strategies: MarketingStrategy[] = [];

    for (const strategyType of strategyTypes) {
      try {
        const result = await this.marketingStrategyService.generateStrategy(
          campaignId,
          strategyType,
          GenerationMethod.AI_GENERATED,
          true, // 使用Gemini
        );
        strategies.push(result.strategy);
      } catch (error) {
        this.logger.warn(
          `Failed to generate strategy type ${strategyType}: ${error.message}`,
        );
        // 如果AI生成失败，创建模拟策略
        const fallbackStrategy = await this.createFallbackStrategy(
          campaignId,
          strategyType,
        );
        strategies.push(fallbackStrategy);
      }
    }

    return strategies;
  }

  /**
   * 创建回退策略（当AI生成失败时使用）
   */
  private async createFallbackStrategy(
    campaignId: string,
    strategyType: StrategyType,
  ): Promise<MarketingStrategy> {
    const strategyData: Partial<MarketingStrategy> = {
      campaignId,
      strategyType,
      description: `演示用的${strategyType}策略`,
      implementationPlan: {
        steps: ['第一步', '第二步', '第三步'],
        timeline: '4周',
      },
      expectedROI: String(25 + Math.random() * 20),
      confidenceScore: String(70 + Math.floor(Math.random() * 20)),
      generatedBy: GenerationMethod.TEMPLATE,
    };

    const strategy = this.marketingStrategyRepository.create(strategyData);
    return await this.marketingStrategyRepository.save(strategy);
  }

  /**
   * 生成演示营销内容
   */
  private async generateDemoContent(
    campaign: MarketingCampaign,
    strategy: MarketingStrategy,
  ): Promise<any> {
    try {
      const campaignSummary = {
        id: campaign.id,
        name: campaign.name,
        campaignType: campaign.campaignType,
        targetAudience: campaign.targetAudience,
        budget: campaign.budget,
        userId: campaign.userId,
        insights: {
          totalStrategies: 4,
          averageConfidenceScore: 75,
          strategyTypeDistribution: {
            CONTENT: 1,
            CHANNEL: 1,
            TIMING: 1,
            BUDGET_ALLOCATION: 1,
          },
          estimatedTotalROI: 120,
          completionRate: 25,
        },
      };

      const result =
        await this.contentGenerationService.generateMarketingContent({
          campaignSummary: campaignSummary as any,
          targetPlatforms: [Platform.XHS, Platform.WECHAT_MP],
          contentTypes: ['promotional', 'educational'],
          tone: 'friendly',
          quantity: 2,
        });

      // 更新策略的生成内容ID和内容平台
      if (result.success && result.marketingContent) {
        strategy.generatedContentIds = result.marketingContent.contents.map(
          (c) => c.title,
        );
        strategy.contentPlatforms =
          result.marketingContent.recommendedPostingSchedule.map(
            (s) => s.platform,
          );
        await this.marketingStrategyRepository.save(strategy);
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to generate demo content: ${error.message}`);
      return {
        success: false,
        error: {
          code: 'DEMO_CONTENT_ERROR',
          message: 'Failed to generate demo content',
        },
      };
    }
  }

  /**
   * 获取演示状态
   */
  getDemoStatus(): {
    available: boolean;
    features: string[];
    requirements: string[];
  } {
    return {
      available: true,
      features: [
        '客户档案创建',
        '客户分群分析',
        '营销活动策划',
        'AI营销策略生成',
        '多平台内容生成',
      ],
      requirements: [
        'MySQL数据库连接',
        'Gemini API密钥（可选，支持回退模式）',
        'Node.js运行环境',
      ],
    };
  }

  /**
   * 重置演示数据（删除创建的演示数据）
   */
  async resetDemoData(
    userId: string = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  ): Promise<{ deleted: number }> {
    this.logger.log(`Resetting demo data for user: ${userId}`);

    let deleted = 0;

    // 先获取客户档案，以便后续使用
    const profiles = await this.customerProfileRepository.find({
      where: { userId },
    });
    const profileIds = profiles.length > 0 ? profiles.map((p) => p.id) : [];

    // 1. 删除用户行为数据
    const userBehaviors = await this.userBehaviorRepository.find({
      where: { userId },
    });
    deleted += userBehaviors.length;
    if (userBehaviors.length > 0) {
      await this.userBehaviorRepository.remove(userBehaviors);
    }

    // 2. 删除演示活动（级联删除策略）
    const campaigns = await this.marketingCampaignRepository.find({
      where: { userId },
    });
    deleted += campaigns.length;
    await this.marketingCampaignRepository.remove(campaigns);

    // 3. 删除演示客户分群
    const segments = await this.customerSegmentRepository
      .createQueryBuilder('segment')
      .innerJoin('segment.customerProfile', 'profile')
      .where('profile.userId = :userId', { userId })
      .getMany();
    deleted += segments.length;
    await this.customerSegmentRepository.remove(segments);

    // 4. 删除没有活动的营销策略（通过客户档案关联）
    if (profileIds.length > 0) {
      const orphanStrategies = await this.marketingStrategyRepository
        .createQueryBuilder('strategy')
        .where(
          'strategy.campaignId IS NULL AND strategy.customerProfileId IN (:...profileIds)',
          { profileIds },
        )
        .getMany();
      deleted += orphanStrategies.length;
      if (orphanStrategies.length > 0) {
        await this.marketingStrategyRepository.remove(orphanStrategies);
      }
    }

    // 5. 删除数据导入任务
    if (profileIds.length > 0) {
      const importJobs = await this.dataImportJobRepository
        .createQueryBuilder('job')
        .where('job.customerProfileId IN (:...profileIds)', { profileIds })
        .getMany();
      deleted += importJobs.length;
      if (importJobs.length > 0) {
        await this.dataImportJobRepository.remove(importJobs);
      }
    }

    // 6. 删除演示客户档案
    deleted += profiles.length;
    await this.customerProfileRepository.remove(profiles);

    return { deleted };
  }

  /**
   * 获取演示进度
   */
  async getDemoProgress(
    userId: string = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  ): Promise<{
    completedScenarios: number;
    totalScenarios: number;
    currentScenario?: string;
    progressPercentage: number;
    completedSteps: number;
    totalSteps: number;
    stepProgress: Array<{
      step: number;
      name: string;
      completed: boolean;
      timestamp?: string;
    }>;
    recentActivity: Array<{
      action: string;
      timestamp: string;
      details: string;
    }>;
  }> {
    try {
      // 查询用户创建的演示数据
      const profiles = await this.customerProfileRepository.count({
        where: { userId },
      });
      const campaigns = await this.marketingCampaignRepository.count({
        where: { userId },
      });
      const strategies = await this.marketingStrategyRepository.count({
        where: { campaign: { userId } },
      });
      const segments = await this.customerSegmentRepository
        .createQueryBuilder('segment')
        .innerJoin('segment.customerProfile', 'profile')
        .where('profile.userId = :userId', { userId })
        .getCount();

      // 计算进度
      const totalScenarios = 1; // 目前只有一个演示场景
      const completedScenarios = profiles > 0 && campaigns > 0 ? 1 : 0;

      // 步骤进度：数据导入 -> 客户分析 -> 客户分群 -> 活动策划 -> 策略生成 -> 内容生成
      const totalSteps = 6;
      let completedSteps = 0;
      const stepProgress = [
        {
          step: 1,
          name: '数据导入',
          completed: profiles > 0,
          timestamp: undefined,
        },
        {
          step: 2,
          name: '客户分析',
          completed: profiles > 0,
          timestamp: undefined,
        },
        {
          step: 3,
          name: '客户分群',
          completed: segments > 0,
          timestamp: undefined,
        },
        {
          step: 4,
          name: '活动策划',
          completed: campaigns > 0,
          timestamp: undefined,
        },
        {
          step: 5,
          name: '策略生成',
          completed: strategies > 0,
          timestamp: undefined,
        },
        { step: 6, name: '内容生成', completed: false, timestamp: undefined }, // 需要检查内容生成
      ];

      completedSteps = stepProgress.filter((step) => step.completed).length;

      // 获取最近活动
      const recentActivity: Array<{
        action: string;
        timestamp: string;
        details: string;
      }> = [];
      if (profiles > 0) {
        recentActivity.push({
          action: '客户档案创建',
          timestamp: new Date().toISOString(),
          details: '商场顾客数据导入完成',
        });
      }
      if (segments > 0) {
        recentActivity.push({
          action: '客户分群分析',
          timestamp: new Date().toISOString(),
          details: `${segments}个客户分群创建完成`,
        });
      }
      if (campaigns > 0) {
        recentActivity.push({
          action: '营销活动策划',
          timestamp: new Date().toISOString(),
          details: '商场春季焕新购物节活动创建',
        });
      }
      if (strategies > 0) {
        recentActivity.push({
          action: 'AI策略生成',
          timestamp: new Date().toISOString(),
          details: `${strategies}个营销策略生成完成`,
        });
      }

      return {
        completedScenarios,
        totalScenarios,
        currentScenario: completedScenarios > 0 ? 'mall-customer' : undefined,
        progressPercentage: Math.round((completedSteps / totalSteps) * 100),
        completedSteps,
        totalSteps,
        stepProgress,
        recentActivity: recentActivity.slice(0, 5), // 只返回最近5个活动
      };
    } catch (error) {
      this.logger.error(`Failed to get demo progress: ${error.message}`);
      // 返回默认进度
      return {
        completedScenarios: 0,
        totalScenarios: 1,
        progressPercentage: 0,
        completedSteps: 0,
        totalSteps: 6,
        stepProgress: [
          { step: 1, name: '数据导入', completed: false, timestamp: undefined },
          { step: 2, name: '客户分析', completed: false, timestamp: undefined },
          { step: 3, name: '客户分群', completed: false, timestamp: undefined },
          { step: 4, name: '活动策划', completed: false, timestamp: undefined },
          { step: 5, name: '策略生成', completed: false, timestamp: undefined },
          { step: 6, name: '内容生成', completed: false, timestamp: undefined },
        ],
        recentActivity: [],
      };
    }
  }

  /**
   * 获取演示结果
   */
  async getDemoResults(
    userId: string = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  ): Promise<{
    customerProfile?: any;
    segments?: any[];
    campaign?: any;
    strategies?: any[];
    contentGeneration?: any;
    summary: {
      totalDataPoints: number;
      analysisCompleted: boolean;
      strategiesGenerated: number;
      contentGenerated: boolean;
      overallScore: number;
    };
  }> {
    try {
      // 查询演示数据
      const profile = await this.customerProfileRepository.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      let segments: any[] = [];
      let campaign: any = null;
      let strategies: any[] = [];

      if (profile) {
        segments = await this.customerSegmentRepository.find({
          where: { customerProfileId: profile.id },
          take: 5,
        });

        campaign = await this.marketingCampaignRepository.findOne({
          where: { userId, customerProfileId: profile.id },
          order: { createdAt: 'DESC' },
        });

        if (campaign) {
          strategies = await this.marketingStrategyRepository.find({
            where: { campaignId: campaign.id },
            take: 10,
          });
        }
      }

      // 计算摘要
      const totalDataPoints =
        (profile?.profileData?.totalCustomers || 0) +
        segments.length +
        strategies.length;
      const analysisCompleted = !!profile;
      const strategiesGenerated = strategies.length;
      const contentGenerated = strategies.some(
        (s) => s.generatedContentIds && s.generatedContentIds.length > 0,
      );

      // 计算总体评分
      let overallScore = 0;
      if (analysisCompleted) overallScore += 30;
      if (segments.length >= 3) overallScore += 20;
      if (campaign) overallScore += 20;
      if (strategiesGenerated >= 4) overallScore += 20;
      if (contentGenerated) overallScore += 10;

      return {
        customerProfile: profile,
        segments,
        campaign,
        strategies,
        contentGeneration: contentGenerated
          ? {
              success: true,
              count: strategies.filter((s) => s.generatedContentIds?.length > 0)
                .length,
            }
          : null,
        summary: {
          totalDataPoints,
          analysisCompleted,
          strategiesGenerated,
          contentGenerated,
          overallScore,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get demo results: ${error.message}`);
      return {
        summary: {
          totalDataPoints: 0,
          analysisCompleted: false,
          strategiesGenerated: 0,
          contentGenerated: false,
          overallScore: 0,
        },
      };
    }
  }

  /**
   * 验证演示结果
   */
  async validateDemoResults(
    userId: string = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  ): Promise<{
    valid: boolean;
    score: number;
    feedback: string[];
    improvements: string[];
    validationChecks: Array<{
      check: string;
      passed: boolean;
      details: string;
    }>;
  }> {
    try {
      const results = await this.getDemoResults(userId);
      const validationChecks: Array<{
        check: string;
        passed: boolean;
        details: string;
      }> = [];

      // 检查1: 客户档案是否存在
      validationChecks.push({
        check: '客户档案创建',
        passed: !!results.customerProfile,
        details: results.customerProfile
          ? '客户档案已成功创建'
          : '未找到客户档案',
      });

      // 检查2: 客户分群是否创建
      validationChecks.push({
        check: '客户分群分析',
        passed: (results.segments?.length || 0) >= 3,
        details: `创建了${results.segments?.length || 0}个客户分群${(results.segments?.length || 0) >= 3 ? '，符合要求' : '，建议至少创建3个分群'}`,
      });

      // 检查3: 营销活动是否存在
      validationChecks.push({
        check: '营销活动策划',
        passed: !!results.campaign,
        details: results.campaign ? '营销活动已成功创建' : '未找到营销活动',
      });

      // 检查4: 营销策略是否生成
      validationChecks.push({
        check: '营销策略生成',
        passed: (results.strategies?.length || 0) >= 4,
        details: `生成了${results.strategies?.length || 0}个营销策略${(results.strategies?.length || 0) >= 4 ? '，符合要求' : '，建议至少生成4个策略'}`,
      });

      // 检查5: 内容是否生成
      validationChecks.push({
        check: '营销内容生成',
        passed: results.summary.contentGenerated,
        details: results.summary.contentGenerated
          ? '营销内容已生成'
          : '未生成营销内容',
      });

      // 计算总分
      const passedChecks = validationChecks.filter(
        (check) => check.passed,
      ).length;
      const totalChecks = validationChecks.length;
      const score = Math.round((passedChecks / totalChecks) * 100);

      // 生成反馈
      const feedback: string[] = [];
      const improvements: string[] = [];

      if (score >= 80) {
        feedback.push('演示流程执行良好，各项检查基本通过');
        feedback.push('数据分析完整，营销方案准备就绪');
      } else if (score >= 60) {
        feedback.push('演示流程基本完成，部分环节需要优化');
        feedback.push('核心功能可用，建议完善细节');
      } else {
        feedback.push('演示流程完成度较低，需要重新执行');
        feedback.push('建议按照步骤顺序完成演示');
      }

      // 根据未通过的检查生成改进建议
      validationChecks.forEach((check) => {
        if (!check.passed) {
          improvements.push(`改进建议：${check.details}`);
        }
      });

      // 添加通用改进建议
      if (score < 100) {
        improvements.push('建议检查数据导入的完整性和准确性');
        improvements.push('可以尝试生成更多类型的营销策略');
        improvements.push('考虑为不同平台生成定制化内容');
      }

      return {
        valid: score >= 70,
        score,
        feedback,
        improvements,
        validationChecks,
      };
    } catch (error) {
      this.logger.error(`Failed to validate demo results: ${error.message}`);
      return {
        valid: false,
        score: 0,
        feedback: ['验证过程发生错误'],
        improvements: ['请检查演示数据状态，重新执行演示流程'],
        validationChecks: [],
      };
    }
  }

  /**
   * 生成演示报告
   */
  async generateDemoReport(
    userId: string = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  ): Promise<{
    reportUrl: string;
    html: string;
    pdfUrl?: string;
    generatedAt: string;
    reportId: string;
  }> {
    try {
      const results = await this.getDemoResults(userId);
      const validation = await this.validateDemoResults(userId);

      // 生成报告ID
      const reportId = `demo-report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 生成HTML报告
      const html = this.generateHtmlReport(results, validation);

      // 生成报告URL（模拟）
      const reportUrl = `/api/v1/analytics/demo/reports/${reportId}`;
      const pdfUrl = `${reportUrl}.pdf`;

      return {
        reportUrl,
        html,
        pdfUrl,
        generatedAt: new Date().toISOString(),
        reportId,
      };
    } catch (error) {
      this.logger.error(`Failed to generate demo report: ${error.message}`);

      // 返回错误报告
      return {
        reportUrl: '/api/v1/analytics/demo/reports/error',
        html: '<h1>演示报告生成失败</h1><p>生成演示报告时发生错误。</p>',
        generatedAt: new Date().toISOString(),
        reportId: `error-${Date.now()}`,
      };
    }
  }

  /**
   * 生成HTML报告（私有方法）
   */
  private generateHtmlReport(results: any, validation: any): string {
    const customerProfile = results.customerProfile;
    const segments = results.segments || [];
    const campaign = results.campaign;
    const strategies = results.strategies || [];

    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LuminaMedia 演示报告</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px; }
        .section-title { color: #4a5568; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
        .stat-card { background: #f7fafc; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #667eea; }
        .stat-label { color: #718096; margin-top: 10px; }
        .validation-check { padding: 10px; margin-bottom: 10px; border-radius: 5px; }
        .check-passed { background: #c6f6d5; border-left: 4px solid #38a169; }
        .check-failed { background: #fed7d7; border-left: 4px solid #e53e3e; }
        .score-badge { display: inline-block; padding: 10px 20px; background: #4c51bf; color: white; border-radius: 20px; font-size: 1.2em; }
        .segment-list { list-style-type: none; padding: 0; }
        .segment-item { padding: 15px; margin-bottom: 10px; background: #edf2f7; border-radius: 5px; }
        .strategy-item { padding: 15px; margin-bottom: 10px; background: #fff5f5; border-radius: 5px; }
        .footer { text-align: center; margin-top: 50px; color: #718096; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LuminaMedia 客户数据面板演示报告</h1>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        <div class="score-badge">验证分数: ${validation.score}/100</div>
    </div>

    <div class="section">
        <h2 class="section-title">📊 演示概览</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${results.summary.totalDataPoints}</div>
                <div class="stat-label">数据点总数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${segments.length}</div>
                <div class="stat-label">客户分群</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${strategies.length}</div>
                <div class="stat-label">营销策略</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${results.summary.contentGenerated ? '✅' : '❌'}</div>
                <div class="stat-label">内容生成</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">✅ 验证结果</h2>
        <p>演示流程有效性: <strong>${validation.valid ? '通过' : '未通过'}</strong></p>
        ${validation.validationChecks
          .map(
            (check: any) => `
        <div class="validation-check ${check.passed ? 'check-passed' : 'check-failed'}">
            <strong>${check.check}:</strong> ${check.passed ? '✅ 通过' : '❌ 未通过'} - ${check.details}
        </div>
        `,
          )
          .join('')}
    </div>

    <div class="section">
        <h2 class="section-title">👥 客户分群分析</h2>
        <ul class="segment-list">
            ${segments
              .map(
                (segment: any) => `
            <li class="segment-item">
                <strong>${segment.segmentName}</strong> - ${segment.description}<br>
                成员数量: ${segment.memberCount || 'N/A'}
            </li>
            `,
              )
              .join('')}
        </ul>
    </div>

    <div class="section">
        <h2 class="section-title">🎯 营销策略生成</h2>
        <div>
            ${strategies
              .map(
                (strategy: any, index: number) => `
            <div class="strategy-item">
                <strong>策略 ${index + 1}:</strong> ${strategy.strategyType}<br>
                置信度: ${strategy.confidenceScore || 'N/A'}% | 预期ROI: ${strategy.expectedROI || 'N/A'}%
            </div>
            `,
              )
              .join('')}
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">💡 反馈与建议</h2>
        <h3>反馈:</h3>
        <ul>
            ${validation.feedback.map((item: string) => `<li>${item}</li>`).join('')}
        </ul>
        <h3>改进建议:</h3>
        <ul>
            ${validation.improvements.map((item: string) => `<li>${item}</li>`).join('')}
        </ul>
    </div>

    <div class="footer">
        <p>报告ID: ${new Date().getTime()}</p>
        <p>© 2026 LuminaMedia - AI驱动的自动化内容矩阵管理系统</p>
        <p>本报告由系统自动生成，数据仅供参考</p>
    </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * 执行演示步骤
   */
  async executeDemoStep(
    step: number,
    userId: string = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    stepData?: any,
  ): Promise<{
    success: boolean;
    step: number;
    stepName: string;
    result?: any;
    message: string;
    nextStep?: number;
    completed: boolean;
  }> {
    try {
      this.logger.log(`Executing demo step ${step} for user: ${userId}`);

      // 检查步骤有效性
      if (step < 1 || step > 6) {
        return {
          success: false,
          step,
          stepName: '未知步骤',
          message: '步骤编号必须在1-6之间',
          completed: false,
        };
      }

      // 步骤定义
      const stepDefinitions = [
        { step: 1, name: '数据导入', method: 'createDemoCustomerProfile' },
        { step: 2, name: '客户分析', method: 'analyzeCustomerData' },
        { step: 3, name: '客户分群', method: 'createDemoSegments' },
        { step: 4, name: '活动策划', method: 'createDemoCampaign' },
        { step: 5, name: '策略生成', method: 'generateDemoStrategies' },
        { step: 6, name: '内容生成', method: 'generateDemoContent' },
      ];

      const stepDef = stepDefinitions[step - 1];
      let result: any = null;
      let message = '步骤执行成功';
      const nextStep: number | undefined = step < 6 ? step + 1 : undefined;

      // 获取或创建客户档案（用于后续步骤）
      let customerProfile = await this.customerProfileRepository.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      // 执行步骤
      switch (step) {
        case 1: // 数据导入 - 创建客户档案
          if (!customerProfile) {
            customerProfile = await this.createDemoCustomerProfile(userId);
            result = customerProfile;
            message = '客户档案创建成功';
          } else {
            result = customerProfile;
            message = '客户档案已存在，使用现有档案';
          }
          break;

        case 2: // 客户分析 - 分析客户数据
          if (!customerProfile) {
            return {
              success: false,
              step,
              stepName: stepDef.name,
              message: '请先执行步骤1：数据导入',
              completed: false,
            };
          }
          // 客户分析已包含在客户档案创建中
          result = customerProfile.profileData;
          message = '客户数据分析完成';
          break;

        case 3: // 客户分群 - 创建客户分群
          if (!customerProfile) {
            return {
              success: false,
              step,
              stepName: stepDef.name,
              message: '请先执行步骤1：数据导入',
              completed: false,
            };
          }
          const segments = await this.createDemoSegments(customerProfile.id);
          result = segments;
          message = `创建了${segments.length}个客户分群`;
          break;

        case 4: // 活动策划 - 创建营销活动
          if (!customerProfile) {
            return {
              success: false,
              step,
              stepName: stepDef.name,
              message: '请先执行步骤1：数据导入',
              completed: false,
            };
          }
          const campaign = await this.createDemoCampaign(
            userId,
            customerProfile.id,
          );
          result = campaign;
          message = `营销活动"${campaign.name}"创建成功`;
          break;

        case 5: // 策略生成 - 生成营销策略
          if (!customerProfile) {
            return {
              success: false,
              step,
              stepName: stepDef.name,
              message: '请先执行步骤1：数据导入',
              completed: false,
            };
          }
          // 获取最近的活动
          const campaignForStrategies =
            await this.marketingCampaignRepository.findOne({
              where: { userId, customerProfileId: customerProfile.id },
              order: { createdAt: 'DESC' },
            });
          if (!campaignForStrategies) {
            return {
              success: false,
              step,
              stepName: stepDef.name,
              message: '请先执行步骤4：活动策划',
              completed: false,
            };
          }
          const strategies = await this.generateDemoStrategies(
            campaignForStrategies.id,
          );
          result = strategies;
          message = `生成了${strategies.length}个营销策略`;
          break;

        case 6: // 内容生成 - 生成营销内容
          if (!customerProfile) {
            return {
              success: false,
              step,
              stepName: stepDef.name,
              message: '请先执行步骤1：数据导入',
              completed: false,
            };
          }
          // 获取最近的活动和策略
          const campaignForContent =
            await this.marketingCampaignRepository.findOne({
              where: { userId, customerProfileId: customerProfile.id },
              order: { createdAt: 'DESC' },
            });
          if (!campaignForContent) {
            return {
              success: false,
              step,
              stepName: stepDef.name,
              message: '请先执行步骤4：活动策划',
              completed: false,
            };
          }
          const strategiesForContent =
            await this.marketingStrategyRepository.find({
              where: { campaignId: campaignForContent.id },
              take: 1,
            });
          if (strategiesForContent.length === 0) {
            return {
              success: false,
              step,
              stepName: stepDef.name,
              message: '请先执行步骤5：策略生成',
              completed: false,
            };
          }
          const contentResult = await this.generateDemoContent(
            campaignForContent,
            strategiesForContent[0],
          );
          result = contentResult;
          message = contentResult.success
            ? '营销内容生成成功'
            : '营销内容生成失败';
          break;

        default:
          return {
            success: false,
            step,
            stepName: stepDef.name,
            message: '未知步骤',
            completed: false,
          };
      }

      // 记录用户行为（暂时注释掉，因为TypeScript编译错误）
      // try {
      //   const userBehavior = this.userBehaviorRepository.create({
      //     userId,
      //     eventType: 'CAMPAIGN_CREATE', // 使用现有枚举值
      //     details: {
      //       step,
      //       stepName: stepDef.name,
      //       result: result ? (typeof result === 'object' ? { ...result } : result) : null,
      //       timestamp: new Date().toISOString(),
      //     },
      //     timestamp: new Date(),
      //     sessionId: `demo-session-${userId}`,
      //   });
      //   await this.userBehaviorRepository.save(userBehavior);
      // } catch (behaviorError) {
      //   this.logger.warn(`Failed to log user behavior: ${behaviorError.message}`);
      // }

      return {
        success: true,
        step,
        stepName: stepDef.name,
        result,
        message,
        nextStep,
        completed: step === 6,
      };
    } catch (error) {
      this.logger.error(
        `Failed to execute demo step ${step}: ${error.message}`,
      );

      return {
        success: false,
        step,
        stepName: '步骤执行失败',
        message: `步骤执行失败: ${error.message}`,
        completed: false,
      };
    }
  }
}
