import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { FeatureConfig, TenantFeatureToggle } from '../../../entities/feature-config.entity';

@Injectable()
export class FeatureConfigService {
  constructor(
    @InjectRepository(FeatureConfig)
    private featureConfigRepository: Repository<FeatureConfig>,
    @InjectRepository(TenantFeatureToggle)
    private tenantFeatureToggleRepository: Repository<TenantFeatureToggle>,
  ) {}

  /**
   * 获取所有功能配置
   */
  async getAllFeatureConfigs(): Promise<FeatureConfig[]> {
    return await this.featureConfigRepository.find();
  }

  /**
   * 根据功能键获取功能配置
   */
  async getFeatureConfigByKey(featureKey: string): Promise<FeatureConfig | null> {
    return await this.featureConfigRepository.findOne({
      where: { featureKey },
    });
  }

  /**
   * 创建新的功能配置
   */
  async createFeatureConfig(data: Partial<FeatureConfig>): Promise<FeatureConfig> {
    // 检查功能键是否已存在
    const existing = await this.featureConfigRepository.findOne({
      where: { featureKey: data.featureKey },
    });

    if (existing) {
      throw new Error(`Feature with key ${data.featureKey} already exists`);
    }

    const featureConfig = this.featureConfigRepository.create(data);
    return await this.featureConfigRepository.save(featureConfig);
  }

  /**
   * 更新功能配置
   */
  async updateFeatureConfig(featureKey: string, data: Partial<FeatureConfig>): Promise<FeatureConfig> {
    const featureConfig = await this.getFeatureConfigByKey(featureKey);

    if (!featureConfig) {
      throw new Error(`Feature with key ${featureKey} not found`);
    }

    Object.assign(featureConfig, data);
    return await this.featureConfigRepository.save(featureConfig);
  }

  /**
   * 删除功能配置
   */
  async deleteFeatureConfig(featureKey: string): Promise<void> {
    const result = await this.featureConfigRepository.delete({ featureKey });

    if (result.affected === 0) {
      throw new Error(`Feature with key ${featureKey} not found`);
    }
  }

  /**
   * 初始化默认功能配置
   */
  async initializeDefaultFeatures(): Promise<void> {
    const defaultFeatures = [
      {
        featureKey: 'ai-analysis',
        featureName: 'AI数据分析',
        description: 'AI驱动的数据分析功能',
        isEnabled: true,
        tenantType: 'all',
      },
      {
        featureKey: 'ai-planning',
        featureName: 'AI智能策划',
        description: 'AI驱动的营销策划功能',
        isEnabled: true,
        tenantType: 'all',
      },
      {
        featureKey: 'ai-copywriting',
        featureName: 'AI智能文案',
        description: 'AI驱动的文案生成功能',
        isEnabled: true,
        tenantType: 'all',
      },
      {
        featureKey: 'matrix-publishing',
        featureName: '矩阵发布',
        description: '多渠道内容发布功能',
        isEnabled: true,
        tenantType: 'all',
      },
      {
        featureKey: 'customer-profile',
        featureName: '客户画像',
        description: '客户画像分析功能',
        isEnabled: true,
        tenantType: 'all',
      },
      {
        featureKey: 'social-monitoring',
        featureName: '舆情监测',
        description: '社交媒体舆情监测功能',
        isEnabled: true,
        tenantType: 'all',
      },
      {
        featureKey: 'data-visualization',
        featureName: '数据可视化',
        description: '数据可视化图表功能',
        isEnabled: true,
        tenantType: 'all',
      },
      {
        featureKey: 'workflow-management',
        featureName: '工作流管理',
        description: '内容审核工作流功能',
        isEnabled: true,
        tenantType: 'all',
      },
      {
        featureKey: 'government-content',
        featureName: '政务内容管理',
        description: '政务版专用内容管理功能',
        isEnabled: true,
        tenantType: 'government',
      },
    ];

    for (const featureData of defaultFeatures) {
      try {
        await this.createFeatureConfig(featureData);
      } catch (error) {
        // 如果功能已存在，则跳过
        if (error.message.includes('already exists')) {
          continue;
        }
        throw error;
      }
    }
  }

  /**
   * 检查租户是否可以使用某个功能
   */
  async canTenantUseFeature(tenantId: string, featureKey: string): Promise<boolean> {
    // 首先检查功能是否存在且全局启用
    const globalFeature = await this.getFeatureConfigByKey(featureKey);
    if (!globalFeature || !globalFeature.isEnabled) {
      return false;
    }

    // 检查租户特定的功能开关
    const tenantToggle = await this.tenantFeatureToggleRepository.findOne({
      where: {
        tenantId,
        featureKey,
      },
    });

    // 如果没有特定的租户配置，则使用全局设置
    if (!tenantToggle) {
      // 检查租户类型限制
      if (globalFeature.tenantType && globalFeature.tenantType !== 'all') {
        return globalFeature.tenantType === (tenantId.includes('government') ? 'government' : 'business');
      }
      return true;
    }

    return tenantToggle.isEnabled;
  }
}