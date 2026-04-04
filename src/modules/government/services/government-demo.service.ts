import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GovernmentContent } from '../../../entities/government-content.entity';
import { SocialInteraction } from '../../../entities/social-interaction.entity';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { MarketingCampaign } from '../../../entities/marketing-campaign.entity';
import { MarketingStrategy } from '../../../entities/marketing-strategy.entity';
import { MarketingCampaignRepository } from '../../../shared/repositories/marketing-campaign.repository';
import { MarketingStrategyRepository } from '../../../shared/repositories/marketing-strategy.repository';
import { ContentDraft } from '../../../entities/content-draft.entity';
import { CustomerType } from '../../../shared/enums/customer-type.enum';
import { Industry } from '../../../shared/enums/industry.enum';

@Injectable()
export class GovernmentDemoService {
  constructor(
    @InjectRepository(GovernmentContent)
    private governmentContentRepository: Repository<GovernmentContent>,
    @InjectRepository(SocialInteraction)
    private socialInteractionRepository: Repository<SocialInteraction>,
    @InjectRepository(CustomerProfile)
    private customerProfileRepository: Repository<CustomerProfile>,
    @InjectRepository(MarketingCampaignRepository)
    private marketingCampaignRepository: MarketingCampaignRepository,
    @InjectRepository(MarketingStrategyRepository)
    private marketingStrategyRepository: MarketingStrategyRepository,
    @InjectRepository(ContentDraft)
    private contentDraftRepository: Repository<ContentDraft>,
  ) {}

  /**
   * 生成政务版演示数据
   */
  async generateGovernmentDemoData(tenantId: string): Promise<void> {
    // 清除现有的非预置数据（防止重复生成）
    await this.clearGovernmentDemoData(tenantId);

    // 生成政府内容数据
    await this.generateGovernmentContent(tenantId);

    // 生成舆情数据
    await this.generateSocialMonitoringData(tenantId);

    // 生成地理分析结果
    await this.generateGeographicAnalysisData(tenantId);

    // 生成政务相关的客户画像
    await this.generateGovernmentCustomerProfiles(tenantId);
  }

  /**
   * 清除政务版演示数据
   */
  async clearGovernmentDemoData(tenantId: string): Promise<void> {
    // 删除非预置的政府内容
    await this.governmentContentRepository.delete({
      tenantId,
      isPreset: false,
    });

    // 删除非预置的社交互动数据
    await this.socialInteractionRepository.delete({
      tenantId,
      isPreset: false,
    });

    // 删除非预置的客户档案
    await this.customerProfileRepository.delete({
      tenantId,
      isPreset: false,
    });

    // 删除非预置的营销活动（在政务版中可能代表政策宣传活动）
    const campaigns = await this.marketingCampaignRepository.find({
      where: { tenantId, isPreset: false }
    });
    await this.marketingCampaignRepository.remove(campaigns);
  }

  /**
   * 生成政府内容数据
   */
  private async generateGovernmentContent(tenantId: string): Promise<void> {
    const governmentContents = [
      {
        title: '关于加强数字化政务服务的通知',
        content: '为进一步推进政务服务数字化转型，提高办事效率，现就有关事项通知如下：1. 推进一体化政务服务平台建设；2. 完善电子证照共享机制；3. 强化数据安全保障。',
        category: '政策法规',
        publishDate: new Date('2026-03-15'),
        author: '市政府办公室',
        status: 'published' as const,
        tags: ['数字化', '政务服务', '政策'],
        isPreset: false,
        demoScenario: 'government-demo',
        tenantId,
      },
      {
        title: '2026年第一季度财政预算执行情况',
        content: '本市2026年第一季度财政预算执行情况良好，收入同比增长8.5%，支出结构持续优化，民生领域投入占比达72%。',
        category: '财政公开',
        publishDate: new Date('2026-04-01'),
        author: '市财政局',
        status: 'published' as const,
        tags: ['财政', '预算', '执行情况'],
        isPreset: false,
        demoScenario: 'government-demo',
        tenantId,
      },
      {
        title: '关于推进智慧城市建设项目的意见',
        content: '智慧城市建设是提升城市治理现代化水平的重要抓手，各地各部门要高度重视，统筹规划，分步实施，确保项目建设取得实效。',
        category: '发展规划',
        publishDate: new Date('2026-03-20'),
        author: '市发改委',
        status: 'published' as const,
        tags: ['智慧城市', '规划', '建设'],
        isPreset: false,
        demoScenario: 'government-demo',
        tenantId,
      },
      {
        title: '环境保护专项行动实施方案',
        content: '为深入打好污染防治攻坚战，决定在全市开展环境保护专项行动，重点整治工业污染、生活污水和大气污染等问题。',
        category: '环境保护',
        publishDate: new Date('2026-03-25'),
        author: '市环保局',
        status: 'published' as const,
        tags: ['环保', '污染治理', '专项行动'],
        isPreset: false,
        demoScenario: 'government-demo',
        tenantId,
      },
    ];

    await this.governmentContentRepository.save(governmentContents);
  }

  /**
   * 生成舆情监测数据
   */
  private async generateSocialMonitoringData(tenantId: string): Promise<void> {
    // 生成与政府内容相关的社交互动数据
    const socialInteractions: Partial<SocialInteraction>[] = [];

    // 为每条政府内容生成相关社交互动
    for (let i = 0; i < 4; i++) {
      const baseDate = new Date('2026-03-15');
      baseDate.setDate(baseDate.getDate() + i * 3); // 错开时间

      // 生成评论数据
      for (let j = 0; j < 5; j++) {
        socialInteractions.push({
          platform: 'weibo',
          interactionType: 'comment',
          targetId: (i + 1).toString(), // 关联到上面的政府内容
          targetUrl: `/api/government-content/${i + 1}`,
          content: this.generateRandomGovernmentComment(),
          sourceUser: `user_${i}_${j}`,
          timestamp: new Date(baseDate.getTime() + j * 3600000), // 每小时一个评论
          sentiment: Math.random() > 0.3 ? 'positive' : 'negative', // 70%正面，30%负面
          engagementCount: Math.floor(Math.random() * 10) + 1,
          isPreset: false,
          demoScenario: 'government-demo',
          tenantId,
        });
      }

      // 生成转发数据
      for (let j = 0; j < 3; j++) {
        socialInteractions.push({
          platform: 'weibo',
          interactionType: 'share',
          targetId: (i + 1).toString(),
          targetUrl: `/api/government-content/${i + 1}`,
          content: `转发: ${this.generateRandomGovernmentComment()}`,
          sourceUser: `user_share_${i}_${j}`,
          timestamp: new Date(baseDate.getTime() + (j + 5) * 3600000),
          sentiment: 'neutral',
          engagementCount: Math.floor(Math.random() * 5) + 1,
          isPreset: false,
          demoScenario: 'government-demo',
          tenantId,
        });
      }
    }

    await this.socialInteractionRepository.save(socialInteractions);
  }

  /**
   * 生成地理分析数据
   */
  private async generateGeographicAnalysisData(tenantId: string): Promise<void> {
    // 生成基于地理位置的分析数据
    const geographicLocations = [
      { city: '北京市', district: '朝阳区', longitude: 116.4074, latitude: 39.9042 },
      { city: '北京市', district: '海淀区', longitude: 116.3106, latitude: 39.9928 },
      { city: '上海市', district: '浦东新区', longitude: 121.4737, latitude: 31.2304 },
      { city: '深圳市', district: '南山区', longitude: 113.9440, latitude: 22.5447 },
      { city: '广州市', district: '天河区', longitude: 113.3215, latitude: 23.1196 },
    ];

    const geographicData: Partial<GovernmentContent>[] = [];
    for (const location of geographicLocations) {
      // 为每个地区生成舆情分布
      for (let i = 0; i < 3; i++) {
        geographicData.push({
          title: `${location.district}关于数字化政务服务的舆情`,
          content: `在${location.city}${location.district}地区，市民对数字化政务服务的关注度为${Math.floor(Math.random() * 50) + 50}%，满意度为${Math.floor(Math.random() * 30) + 70}%。`,
          category: '舆情地理分析',
          publishDate: new Date('2026-04-01'),
          author: '舆情分析系统',
          status: 'published' as const,
          tags: ['舆情', '地理分析', location.district],
          isPreset: false,
          demoScenario: 'government-demo',
          tenantId,
        });
      }
    }

    await this.governmentContentRepository.save(geographicData);
  }

  /**
   * 生成政务相关的客户画像
   */
  private async generateGovernmentCustomerProfiles(tenantId: string): Promise<void> {
    const governmentProfiles: Partial<CustomerProfile>[] = [
      {
        customerName: '政务工作者A',
        userId: 'gov-user-a',
        customerType: CustomerType.ENTERPRISE,
        industry: Industry.GOVERNMENT,
        dataSources: { type: 'gov-employee', department: '政务服务管理局' },
        profileData: { age: 35, gender: 'male', location: '北京市', interests: ['政策解读', '政务服务', '信息化建设'] },
        behaviorInsights: { tags: ['政策关注者', '政府工作人员'], spendingLevel: 'low' },
        isPreset: false,
        demoScenario: 'government-demo',
        tenantId,
      },
      {
        customerName: '政务工作者B',
        userId: 'gov-user-b',
        customerType: CustomerType.ENTERPRISE,
        industry: Industry.GOVERNMENT,
        dataSources: { type: 'gov-employee', department: '大数据中心' },
        profileData: { age: 28, gender: 'female', location: '上海市', interests: ['智慧城市', '大数据应用', '数字治理'] },
        behaviorInsights: { tags: ['数字政府倡导者', '年轻公务员'], spendingLevel: 'medium' },
        isPreset: false,
        demoScenario: 'government-demo',
        tenantId,
      },
      {
        customerName: '政策研究员',
        userId: 'gov-researcher',
        customerType: CustomerType.ENTERPRISE,
        industry: Industry.RESEARCH,
        dataSources: { type: 'researcher', department: '政策研究室' },
        profileData: { age: 42, gender: 'male', location: '深圳市', interests: ['政策研究', '社会治理', '改革创新'] },
        behaviorInsights: { tags: ['政策专家', '深度思考者'], spendingLevel: 'medium' },
        isPreset: false,
        demoScenario: 'government-demo',
        tenantId,
      },
      {
        customerName: '市民代表',
        userId: 'citizen-representative',
        customerType: CustomerType.INDIVIDUAL,
        industry: Industry.PUBLIC_SERVICE,
        dataSources: { type: 'citizen' },
        profileData: { age: 38, gender: 'female', location: '广州市', interests: ['公共服务', '便民措施', '政务透明'] },
        behaviorInsights: { tags: ['积极市民', '政务参与者'], spendingLevel: 'high' },
        isPreset: false,
        demoScenario: 'government-demo',
        tenantId,
      },
    ];

    // 使用save而不是直接插入对象
    for (const profile of governmentProfiles) {
      await this.customerProfileRepository.save(profile);
    }
  }

  /**
   * 生成随机的政务相关评论
   */
  private generateRandomGovernmentComment(): string {
    const comments = [
      '支持政府数字化改革，期待更好的服务体验',
      '政策解读很到位，希望能加快落实进度',
      '政务服务平台使用方便，点赞',
      '建议进一步简化办事流程',
      '信息公开做得很好，值得推广',
      '希望更多业务能实现网上办理',
      '数字化政务服务是大势所趋',
      '期待更多便民利民措施',
      '政府工作效率有了明显提升',
      '政务公开透明度不断提高'
    ];

    return comments[Math.floor(Math.random() * comments.length)];
  }

  /**
   * 获取政务版演示数据统计
   */
  async getGovernmentDemoStats(tenantId: string): Promise<{
    governmentContents: number;
    socialInteractions: number;
    customerProfiles: number;
    geographicAnalyses: number;
  }> {
    const [
      governmentContents,
      socialInteractions,
      customerProfiles,
      geographicAnalyses
    ] = await Promise.all([
      this.governmentContentRepository.count({
        where: { tenantId, demoScenario: 'government-demo' }
      }),
      this.socialInteractionRepository.count({
        where: { tenantId, demoScenario: 'government-demo' }
      }),
      this.customerProfileRepository.count({
        where: { tenantId, demoScenario: 'government-demo' }
      }),
      this.governmentContentRepository.count({
        where: {
          tenantId,
          demoScenario: 'government-demo',
          category: '舆情地理分析'
        }
      })
    ]);

    return {
      governmentContents,
      socialInteractions,
      customerProfiles,
      geographicAnalyses,
    };
  }
}