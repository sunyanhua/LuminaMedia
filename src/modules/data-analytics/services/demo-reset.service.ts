import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { MarketingCampaign } from '../../../entities/marketing-campaign.entity';
import { MarketingStrategy } from '../../../entities/marketing-strategy.entity';
import { ContentDraft } from '../../../entities/content-draft.entity';
import { GovernmentContent } from '../../../entities/government-content.entity';
import { SocialInteraction } from '../../../entities/social-interaction.entity';
import { Tenant } from '../../../entities/tenant.entity';

@Injectable()
export class DemoResetService {
  constructor(
    private dataSource: DataSource, // 使用DataSource来执行事务操作
    @InjectRepository(CustomerProfile)
    private customerProfileRepository: Repository<CustomerProfile>,
    @InjectRepository(MarketingCampaign)
    private marketingCampaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(MarketingStrategy)
    private marketingStrategyRepository: Repository<MarketingStrategy>,
    @InjectRepository(ContentDraft)
    private contentDraftRepository: Repository<ContentDraft>,
    @InjectRepository(GovernmentContent)
    private governmentContentRepository: Repository<GovernmentContent>,
    @InjectRepository(SocialInteraction)
    private socialInteractionRepository: Repository<SocialInteraction>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * 重置演示租户的数据
   */
  async resetDemoData(tenantId: string): Promise<void> {
    // 确认是演示租户
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant || !tenantId.includes('demo')) {
      throw new Error(`Tenant ${tenantId} is not a demo tenant`);
    }

    // 在事务中执行所有删除操作
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // 删除非预置的客户档案
      await transactionalEntityManager.getRepository(CustomerProfile)
        .delete({
          tenantId,
          isPreset: false, // 只删除非预置数据
        });

      // 删除非预置的营销活动
      await transactionalEntityManager.getRepository(MarketingCampaign)
        .delete({
          tenantId,
          isPreset: false, // 只删除非预置数据
        });

      // 删除非预置的营销策略
      await transactionalEntityManager.getRepository(MarketingStrategy)
        .delete({
          tenantId,
          isPreset: false, // 只删除非预置数据
        });

      // 删除非预置的内容草稿
      await transactionalEntityManager.getRepository(ContentDraft)
        .delete({
          tenantId,
          isPreset: false, // 只删除非预置数据
        });

      // 删除非预置的政府内容（如果是政务版演示租户）
      if (tenantId.includes('government')) {
        await transactionalEntityManager.getRepository(GovernmentContent)
          .delete({
            tenantId,
            isPreset: false, // 只删除非预置数据
          });
      }

      // 删除非预置的社交互动数据
      await transactionalEntityManager.getRepository(SocialInteraction)
        .delete({
          tenantId,
          isPreset: false, // 只删除非预置数据
        });
    });
  }

  /**
   * 重置所有演示租户的数据
   */
  async resetAllDemoData(): Promise<void> {
    // 获取所有演示租户
    const demoTenants = await this.tenantRepository.find({
      where: [
        { id: 'demo-business-001' },
        { id: 'demo-government-001' },
      ],
    });

    for (const tenant of demoTenants) {
      await this.resetDemoData(tenant.id);
    }
  }

  /**
   * 检查租户是否为演示租户
   */
  async isDemoTenant(tenantId: string): Promise<boolean> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    return tenant ? tenantId.includes('demo') : false;
  }

  /**
   * 获取演示租户的数据统计
   */
  async getDemoDataStats(tenantId: string): Promise<{
    customerProfiles: number;
    marketingCampaigns: number;
    marketingStrategies: number;
    contentDrafts: number;
    governmentContents?: number;
    socialInteractions: number;
    presetDataCount: number;
  }> {
    const [
      customerProfiles,
      marketingCampaigns,
      marketingStrategies,
      contentDrafts,
      governmentContents,
      socialInteractions,
      presetData
    ] = await Promise.all([
      this.customerProfileRepository.count({ where: { tenantId } }),
      this.marketingCampaignRepository.count({ where: { tenantId } }),
      this.marketingStrategyRepository.count({ where: { tenantId } }),
      this.contentDraftRepository.count({ where: { tenantId } }),
      tenantId.includes('government')
        ? this.governmentContentRepository.count({ where: { tenantId } })
        : Promise.resolve(0),
      this.socialInteractionRepository.count({ where: { tenantId } }),
      // Count all preset data across all entity types
      Promise.all([
        this.customerProfileRepository.count({ where: { tenantId, isPreset: true } }),
        this.marketingCampaignRepository.count({ where: { tenantId, isPreset: true } }),
        this.marketingStrategyRepository.count({ where: { tenantId, isPreset: true } }),
        this.contentDraftRepository.count({ where: { tenantId, isPreset: true } }),
        tenantId.includes('government')
          ? this.governmentContentRepository.count({ where: { tenantId, isPreset: true } })
          : Promise.resolve(0),
        this.socialInteractionRepository.count({ where: { tenantId, isPreset: true } }),
      ]).then(results => results.reduce((sum, count) => sum + count, 0))
    ]);

    return {
      customerProfiles,
      marketingCampaigns,
      marketingStrategies,
      contentDrafts,
      governmentContents,
      socialInteractions,
      presetDataCount: presetData,
    };
  }

  /**
   * 为演示租户重新生成预置数据（如果意外删除了的话）
   */
  async regeneratePresetData(tenantId: string): Promise<void> {
    // 检查是否为演示租户
    if (!await this.isDemoTenant(tenantId)) {
      throw new Error(`Tenant ${tenantId} is not a demo tenant`);
    }

    // 如果预置数据不存在，则创建一些基本的预置数据
    const presetCount = await this.customerProfileRepository.count({
      where: { tenantId, isPreset: true },
    });

    if (presetCount === 0) {
      // 创建一些基本的预置客户档案数据
      const presetProfiles = [
        {
          name: '张三',
          email: 'zhangsan@example.com',
          phone: '13800138001',
          age: 30,
          gender: 'male',
          location: '北京',
          interests: ['科技', '金融'],
          behaviorTags: ['活跃用户', '高价值客户'],
          spendingLevel: 'high',
          tenantId,
          isPreset: true,
          demoScenario: tenantId.includes('government') ? 'government-demo' : 'business-demo',
        },
        {
          name: '李四',
          email: 'lisi@example.com',
          phone: '13800138002',
          age: 25,
          gender: 'female',
          location: '上海',
          interests: ['时尚', '美容'],
          behaviorTags: ['新用户', '潜力客户'],
          spendingLevel: 'medium',
          tenantId,
          isPreset: true,
          demoScenario: tenantId.includes('government') ? 'government-demo' : 'business-demo',
        },
      ];

      await this.customerProfileRepository.insert(presetProfiles);
    }
  }
}