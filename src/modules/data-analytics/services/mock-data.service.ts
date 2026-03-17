import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBehavior } from '../entities/user-behavior.entity';
import { MarketingCampaign } from '../entities/marketing-campaign.entity';
import { MarketingStrategy } from '../entities/marketing-strategy.entity';
import { UserBehaviorEvent } from '../../../shared/enums/user-behavior-event.enum';
import { CampaignType } from '../../../shared/enums/campaign-type.enum';
import { CampaignStatus } from '../../../shared/enums/campaign-status.enum';
import { StrategyType } from '../../../shared/enums/strategy-type.enum';
import { GenerationMethod } from '../../../shared/enums/generation-method.enum';

@Injectable()
export class MockDataService {
  constructor(
    @InjectRepository(UserBehavior)
    private userBehaviorRepository: Repository<UserBehavior>,
    @InjectRepository(MarketingCampaign)
    private campaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(MarketingStrategy)
    private strategyRepository: Repository<MarketingStrategy>,
  ) {}

  async generateMockData(userId: string): Promise<{
    behaviors: number;
    campaigns: number;
    strategies: number;
  }> {
    // 生成营销活动
    const campaigns = await this.generateMockCampaigns(userId);

    // 生成用户行为数据
    const behaviors = await this.generateMockBehaviors(userId);

    // 生成营销策略
    const strategies = await this.generateMockStrategies(campaigns);

    return {
      behaviors,
      campaigns: campaigns.length,
      strategies,
    };
  }

  private async generateMockCampaigns(
    userId: string,
  ): Promise<MarketingCampaign[]> {
    const campaignTemplates = [
      {
        name: '小红书春季美妆推广',
        campaignType: CampaignType.ONLINE,
        targetAudience: {
          ageRange: [18, 35],
          gender: 'female',
          interests: ['美妆', '护肤', '时尚'],
          platforms: ['小红书'],
        },
        budget: 50000,
        status: CampaignStatus.ACTIVE,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-06-30'),
      },
      {
        name: '微信公众号内容矩阵建设',
        campaignType: CampaignType.ONLINE,
        targetAudience: {
          ageRange: [25, 45],
          gender: 'both',
          interests: ['科技', '商业', '职场'],
          platforms: ['微信公众号'],
        },
        budget: 30000,
        status: CampaignStatus.ACTIVE,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      },
      {
        name: '线上线下混合新品发布会',
        campaignType: CampaignType.HYBRID,
        targetAudience: {
          ageRange: [20, 40],
          gender: 'both',
          interests: ['数码', '科技'],
          platforms: ['小红书', '微信公众号', '线下'],
        },
        budget: 100000,
        status: CampaignStatus.DRAFT,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-15'),
      },
      {
        name: '品牌形象提升活动',
        campaignType: CampaignType.OFFLINE,
        targetAudience: {
          ageRange: [30, 50],
          gender: 'both',
          interests: ['商务', '高端消费'],
          platforms: ['线下活动'],
        },
        budget: 80000,
        status: CampaignStatus.COMPLETED,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-28'),
      },
    ];

    const campaigns: MarketingCampaign[] = [];
    for (const template of campaignTemplates) {
      const campaign = this.campaignRepository.create({
        userId,
        ...template,
      });
      const savedCampaign = await this.campaignRepository.save(campaign);
      campaigns.push(savedCampaign);
    }

    return campaigns;
  }

  private async generateMockBehaviors(userId: string): Promise<number> {
    const events: UserBehaviorEvent[] = Object.values(UserBehaviorEvent);
    const sessionCount = 8;
    const days = 30; // 最近30天
    let totalEvents = 0;

    for (let day = days; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      // 每天可能有1-3个会话
      const dailySessions = Math.floor(Math.random() * 3) + 1;

      for (let session = 0; session < dailySessions; session++) {
        const sessionId = `session_${userId}_${date.toISOString().split('T')[0]}_${session}`;
        const sessionEvents = Math.floor(Math.random() * 8) + 3; // 每个会话3-10个事件

        for (let i = 0; i < sessionEvents; i++) {
          const eventType = events[Math.floor(Math.random() * events.length)];
          const hour = Math.floor(Math.random() * 12) + 8; // 8am-8pm
          const minute = Math.floor(Math.random() * 60);

          const timestamp = new Date(date);
          timestamp.setHours(hour, minute, Math.floor(Math.random() * 60));

          const eventData: Record<string, any> = {};
          if (eventType === UserBehaviorEvent.PAGE_VIEW) {
            eventData.page = ['/dashboard', '/analytics', '/campaigns'][
              Math.floor(Math.random() * 3)
            ];
            eventData.duration = Math.floor(Math.random() * 120) + 30; // 30-150秒
          } else if (eventType === UserBehaviorEvent.CONTENT_CREATE) {
            eventData.contentType = ['article', 'video', 'image'][
              Math.floor(Math.random() * 3)
            ];
            eventData.length = Math.floor(Math.random() * 1000) + 500; // 字数或时长
          }

          const behavior = this.userBehaviorRepository.create({
            userId,
            sessionId,
            eventType,
            eventData,
            timestamp,
          });

          await this.userBehaviorRepository.save(behavior);
          totalEvents++;
        }
      }
    }

    return totalEvents;
  }

  private async generateMockStrategies(
    campaigns: MarketingCampaign[],
  ): Promise<number> {
    let totalStrategies = 0;
    const strategyTypes = Object.values(StrategyType);

    for (const campaign of campaigns) {
      // 每个活动生成2-4个策略
      const strategyCount = Math.floor(Math.random() * 3) + 2;

      for (let i = 0; i < strategyCount; i++) {
        const strategyType =
          strategyTypes[Math.floor(Math.random() * strategyTypes.length)];

        const strategyTemplates: Record<StrategyType, any> = {
          [StrategyType.CONTENT]: {
            description: `为${campaign.name}制定的内容策略`,
            implementationPlan: {
              focus: ['用户故事', '产品教程', '行业洞察'],
              frequency: '每周2-3篇',
              format: ['图文', '短视频', '长文章'],
            },
            expectedROI: 25 + Math.random() * 25,
            confidenceScore: 70 + Math.floor(Math.random() * 25),
          },
          [StrategyType.CHANNEL]: {
            description: `${campaign.name}的渠道分配策略`,
            implementationPlan: {
              primaryChannel: '小红书',
              secondaryChannels: ['微信公众号', '微博'],
              budgetSplit: {
                primary: 60,
                secondary: 40,
              },
            },
            expectedROI: 30 + Math.random() * 20,
            confidenceScore: 75 + Math.floor(Math.random() * 20),
          },
          [StrategyType.TIMING]: {
            description: `${campaign.name}的最佳发布时间策略`,
            implementationPlan: {
              bestDays: ['周一', '周三', '周五'],
              bestHours: ['09:00-11:00', '19:00-21:00'],
              seasonalAdjustments: true,
            },
            expectedROI: 20 + Math.random() * 15,
            confidenceScore: 65 + Math.floor(Math.random() * 20),
          },
          [StrategyType.BUDGET_ALLOCATION]: {
            description: `${campaign.name}的预算优化策略`,
            implementationPlan: {
              monthlyAllocation: campaign.budget / 12,
              contingency: 10,
              performanceBasedAdjustment: true,
            },
            expectedROI: 35 + Math.random() * 15,
            confidenceScore: 80 + Math.floor(Math.random() * 15),
          },
        };

        const template = strategyTemplates[strategyType];
        const strategy = this.strategyRepository.create({
          campaignId: campaign.id,
          strategyType,
          description: template.description,
          implementationPlan: template.implementationPlan,
          expectedROI: template.expectedROI,
          confidenceScore: template.confidenceScore,
          generatedBy: GenerationMethod.AI_GENERATED,
        });

        await this.strategyRepository.save(strategy);
        totalStrategies++;
      }
    }

    return totalStrategies;
  }

  async resetMockData(userId?: string): Promise<{ deleted: number }> {
    let totalDeleted = 0;

    if (userId) {
      // 删除指定用户的模拟数据
      const behaviorResult = await this.userBehaviorRepository.delete({
        userId,
      });
      const campaignResult = await this.campaignRepository.delete({ userId });
      // 策略会通过外键级联删除
      totalDeleted =
        (behaviorResult.affected || 0) + (campaignResult.affected || 0);
    } else {
      // 删除所有模拟数据
      const behaviorResult = await this.userBehaviorRepository.clear();
      const campaignResult = await this.campaignRepository.clear();
      const strategyResult = await this.strategyRepository.clear();
      totalDeleted = 3; // 表示三个表都被清空
    }

    return { deleted: totalDeleted };
  }

  async getMockDataStatus(): Promise<{
    totalBehaviors: number;
    totalCampaigns: number;
    totalStrategies: number;
  }> {
    const [totalBehaviors, totalCampaigns, totalStrategies] = await Promise.all(
      [
        this.userBehaviorRepository.count(),
        this.campaignRepository.count(),
        this.strategyRepository.count(),
      ],
    );

    return {
      totalBehaviors,
      totalCampaigns,
      totalStrategies,
    };
  }
}
