import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantFeatureToggle } from '../../../entities/feature-config.entity';

@Injectable()
export class TenantFeatureService {
  constructor(
    @InjectRepository(TenantFeatureToggle)
    private tenantFeatureToggleRepository: Repository<TenantFeatureToggle>,
  ) {}

  /**
   * 获取租户的所有功能开关
   */
  async getTenantFeatures(tenantId: string): Promise<TenantFeatureToggle[]> {
    return await this.tenantFeatureToggleRepository.find({
      where: { tenantId },
    });
  }

  /**
   * 获取特定租户的特定功能开关
   */
  async getTenantFeature(tenantId: string, featureKey: string): Promise<TenantFeatureToggle | null> {
    return await this.tenantFeatureToggleRepository.findOne({
      where: { tenantId, featureKey },
    });
  }

  /**
   * 为租户启用功能
   */
  async enableFeatureForTenant(tenantId: string, featureKey: string, quotaConfig?: any): Promise<TenantFeatureToggle> {
    return await this.setFeatureForTenant(tenantId, featureKey, true, quotaConfig);
  }

  /**
   * 为租户禁用功能
   */
  async disableFeatureForTenant(tenantId: string, featureKey: string): Promise<TenantFeatureToggle> {
    return await this.setFeatureForTenant(tenantId, featureKey, false);
  }

  /**
   * 设置租户功能开关状态
   */
  async setFeatureForTenant(
    tenantId: string,
    featureKey: string,
    isEnabled: boolean,
    quotaConfig?: any,
  ): Promise<TenantFeatureToggle> {
    let tenantFeature = await this.getTenantFeature(tenantId, featureKey);

    if (tenantFeature) {
      // 更新现有记录
      tenantFeature.isEnabled = isEnabled;
      if (quotaConfig) {
        tenantFeature.quotaConfig = quotaConfig;
      }
      tenantFeature.updatedAt = new Date();
    } else {
      // 创建新记录
      tenantFeature = this.tenantFeatureToggleRepository.create({
        tenantId,
        featureKey,
        isEnabled,
        quotaConfig,
      });
    }

    return await this.tenantFeatureToggleRepository.save(tenantFeature);
  }

  /**
   * 为租户批量设置功能
   */
  async batchSetFeaturesForTenant(
    tenantId: string,
    features: Array<{ featureKey: string; isEnabled: boolean; quotaConfig?: any }>,
  ): Promise<TenantFeatureToggle[]> {
    const results: TenantFeatureToggle[] = [];

    for (const feature of features) {
      const result = await this.setFeatureForTenant(
        tenantId,
        feature.featureKey,
        feature.isEnabled,
        feature.quotaConfig,
      );
      results.push(result);
    }

    return results;
  }

  /**
   * 为租户初始化默认功能设置
   */
  async initializeTenantFeatures(tenantId: string, defaultEnabledFeatures: string[]): Promise<TenantFeatureToggle[]> {
    const results: TenantFeatureToggle[] = [];

    for (const featureKey of defaultEnabledFeatures) {
      const result = await this.enableFeatureForTenant(tenantId, featureKey);
      results.push(result);
    }

    return results;
  }

  /**
   * 检查租户是否有特定功能的访问权限
   */
  async checkTenantFeatureAccess(tenantId: string, featureKey: string): Promise<boolean> {
    const tenantFeature = await this.getTenantFeature(tenantId, featureKey);

    // 如果租户没有特定配置，则允许访问（由全局功能配置决定）
    if (!tenantFeature) {
      return true;
    }

    return tenantFeature.isEnabled;
  }
}