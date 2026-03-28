import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from '../../../entities/customer-profile.entity';

/**
 * 4维度用户画像数据结构
 * 对应任务清单中的 UserProfile4D 接口
 */
export interface UserProfile4D {
  // 基础生命周期维度
  basicLifecycle: {
    ageGroup?: '18-25' | '26-35' | '36-45' | '46+';
    education?: 'high_school' | 'bachelor' | 'master' | 'phd';
    familyRole?: 'single' | 'married_no_kids' | 'married_with_kids';
    potentialValue?: 'low' | 'medium' | 'high';
  };
  // 消费性格维度
  consumptionPersonality: {
    consumptionLevel?: 'low' | 'medium' | 'high' | 'premium';
    shoppingWidth?: 'narrow' | 'medium' | 'wide'; // 品类宽度
    decisionSpeed?: 'fast' | 'medium' | 'slow'; // 决策速度
  };
  // 实时状态维度
  realtimeStatus: {
    activityLevel?: number; // 0-100活跃度分数
    growthTrend?: 'declining' | 'stable' | 'growing' | 'fast_growing';
    engagementScore?: number; // 0-100参与度分数
  };
  // 社交与活动维度
  socialActivity: {
    fissionPotential?: 'low' | 'medium' | 'high'; // 裂变潜力
    activityPreference?: string[]; // 活动偏好标签
    socialInfluence?: number; // 社交影响力分数
  };
}

/**
 * 用户画像服务
 * 整合4维度标签数据生成完整的用户画像
 */
@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
  ) {}

  // 标签到维度字段的映射配置
  private readonly tagMapping = {
    // 基础生命周期维度映射
    basicLifecycle: {
      age_group: 'ageGroup',
      education: 'education',
      family_role: 'familyRole',
      potential_value: 'potentialValue',
    },
    // 消费性格维度映射
    consumptionPersonality: {
      consumption_level: 'consumptionLevel',
      shopping_width: 'shoppingWidth',
      decision_speed: 'decisionSpeed',
    },
    // 实时状态维度映射
    realtimeStatus: {
      activity_level: 'activityLevel',
      growth_trend: 'growthTrend',
      engagement_score: 'engagementScore',
    },
    // 社交与活动维度映射
    socialActivity: {
      fission_potential: 'fissionPotential',
      activity_preference: 'activityPreference',
      social_influence: 'socialInfluence',
    },
  };

  /**
   * 获取单个客户的4维度用户画像
   * @param customerId 客户ID
   * @returns 完整的4维度用户画像
   */
  async getUserProfile(customerId: string): Promise<UserProfile4D> {
    this.logger.log(`获取客户画像: ${customerId}`);

    const profile = await this.customerProfileRepository.findOne({
      where: { id: customerId },
    });

    if (!profile) {
      throw new NotFoundException(`客户 ${customerId} 不存在`);
    }

    // 从profileData中提取标签数据
    const tags = this.extractTagsFromProfileData(profile.profileData);

    // 构建4维度画像
    return this.buildUserProfile4D(tags, profile);
  }

  /**
   * 批量获取客户画像
   * @param customerIds 客户ID数组
   * @returns 客户画像映射
   */
  async getBatchUserProfiles(
    customerIds: string[],
  ): Promise<Record<string, UserProfile4D>> {
    this.logger.log(`批量获取客户画像: ${customerIds.length} 个客户`);

    const profiles = await this.customerProfileRepository.find({
      where: customerIds.map((id) => ({ id })),
    });

    const result: Record<string, UserProfile4D> = {};

    for (const profile of profiles) {
      const tags = this.extractTagsFromProfileData(profile.profileData);
      result[profile.id] = this.buildUserProfile4D(tags, profile);
    }

    return result;
  }

  /**
   * 根据画像维度筛选客户
   * @param filters 维度筛选条件
   * @returns 符合条件的客户ID列表
   */
  async filterCustomersByProfile(
    filters: Partial<UserProfile4D>,
  ): Promise<string[]> {
    this.logger.log(`根据画像维度筛选客户: ${JSON.stringify(filters)}`);

    if (!filters || Object.keys(filters).length === 0) {
      return [];
    }

    // 构建查询条件
    const queryBuilder =
      this.customerProfileRepository.createQueryBuilder('cp');

    // 遍历筛选条件，将其转换为JSON路径查询
    const conditions = this.buildProfileConditions(filters);

    if (conditions.length === 0) {
      return [];
    }

    // 应用所有条件
    conditions.forEach((condition, index) => {
      if (index === 0) {
        queryBuilder.where(condition.sql, condition.parameters);
      } else {
        queryBuilder.andWhere(condition.sql, condition.parameters);
      }
    });

    // 执行查询，获取客户ID
    const results = await queryBuilder.select('cp.id').getMany();
    return results.map((profile) => profile.id);
  }

  /**
   * 获取画像统计摘要
   * @param customerIds 客户ID数组（可选，为空则统计所有客户）
   * @returns 各维度的统计摘要
   */
  async getProfileSummary(customerIds?: string[]): Promise<{
    basicLifecycle: Record<string, number>;
    consumptionPersonality: Record<string, number>;
    realtimeStatus: Record<string, number>;
    socialActivity: Record<string, number>;
    totalCustomers: number;
  }> {
    this.logger.log(`获取画像统计摘要`);
    // TODO: 实现统计摘要计算
    return {
      basicLifecycle: {},
      consumptionPersonality: {},
      realtimeStatus: {},
      socialActivity: {},
      totalCustomers: 0,
    };
  }

  /**
   * 从profileData中提取标签数据
   */
  private extractTagsFromProfileData(
    profileData: Record<string, any>,
  ): Record<string, any> {
    if (!profileData || !profileData.tags) {
      return {};
    }

    // 确保tags是对象
    const tags = profileData.tags;
    if (typeof tags !== 'object') {
      return {};
    }

    // 提取标签值
    const result: Record<string, any> = {};
    for (const [tagName, tagData] of Object.entries(tags)) {
      if (tagData && typeof tagData === 'object' && 'value' in tagData) {
        result[tagName] = tagData.value;
      } else {
        result[tagName] = tagData;
      }
    }

    return result;
  }

  /**
   * 根据标签数据构建4维度用户画像
   */
  private buildUserProfile4D(
    tags: Record<string, any>,
    profile: CustomerProfile,
  ): UserProfile4D {
    // 合并标签数据和profileData中的基础信息
    const allData = this.mergeProfileData(profile.profileData, tags);

    // 初始化4维度对象
    const userProfile: UserProfile4D = {
      basicLifecycle: {},
      consumptionPersonality: {},
      realtimeStatus: {},
      socialActivity: {},
    };

    // 遍历映射配置，将数据填充到对应维度
    for (const [dimension, fieldMapping] of Object.entries(this.tagMapping)) {
      for (const [sourceField, targetField] of Object.entries(fieldMapping)) {
        if (allData[sourceField] !== undefined) {
          // 获取值并应用必要的转换
          const value = this.transformValueForField(
            dimension as keyof UserProfile4D,
            targetField,
            allData[sourceField],
          );
          // @ts-ignore
          userProfile[dimension][targetField] = value;
        }
      }
    }

    return userProfile;
  }

  /**
   * 合并profileData中的标签和其他基础信息
   */
  private mergeProfileData(
    profileData: Record<string, any> | null | undefined,
    tags: Record<string, any>,
  ): Record<string, any> {
    const result: Record<string, any> = { ...tags };

    if (!profileData || typeof profileData !== 'object') {
      return result;
    }

    // 从profileData根字段提取基础信息
    // 这些字段可能直接存储在profileData中，而不是tags里
    const rootFields = [
      'age_group',
      'education',
      'family_role',
      'potential_value',
    ];
    for (const field of rootFields) {
      if (profileData[field] !== undefined && result[field] === undefined) {
        result[field] = profileData[field];
      }
    }

    // 从profileData的特定路径提取其他信息
    const dataPaths = {
      activity_level: ['activity', 'level'],
      engagement_score: ['engagement', 'score'],
      social_influence: ['social', 'influence_score'],
    };

    for (const [field, path] of Object.entries(dataPaths)) {
      if (result[field] === undefined) {
        let value: any = profileData;
        for (const key of path) {
          if (value && typeof value === 'object' && key in value) {
            value = value[key];
          } else {
            value = undefined;
            break;
          }
        }
        if (value !== undefined) {
          result[field] = value;
        }
      }
    }

    return result;
  }

  /**
   * 根据字段类型转换值
   */
  private transformValueForField(
    dimension: keyof UserProfile4D,
    field: string,
    value: any,
  ): any {
    // 特殊字段处理
    if (dimension === 'realtimeStatus' && field === 'activityLevel') {
      return this.normalizeActivityLevel(value);
    }
    if (dimension === 'realtimeStatus' && field === 'engagementScore') {
      return this.normalizeEngagementScore(value);
    }
    if (dimension === 'socialActivity' && field === 'socialInfluence') {
      return this.normalizeSocialInfluence(value);
    }
    if (dimension === 'socialActivity' && field === 'activityPreference') {
      return this.parseActivityPreference(value);
    }

    // 枚举字段验证
    if (dimension === 'basicLifecycle') {
      if (field === 'ageGroup') {
        const validValues = ['18-25', '26-35', '36-45', '46+'];
        if (typeof value === 'string' && validValues.includes(value)) {
          return value as UserProfile4D['basicLifecycle']['ageGroup'];
        }
      }
      if (field === 'education') {
        const validValues = ['high_school', 'bachelor', 'master', 'phd'];
        if (typeof value === 'string' && validValues.includes(value)) {
          return value as UserProfile4D['basicLifecycle']['education'];
        }
      }
      if (field === 'familyRole') {
        const validValues = ['single', 'married_no_kids', 'married_with_kids'];
        if (typeof value === 'string' && validValues.includes(value)) {
          return value as UserProfile4D['basicLifecycle']['familyRole'];
        }
      }
      if (field === 'potentialValue') {
        const validValues = ['low', 'medium', 'high'];
        if (typeof value === 'string' && validValues.includes(value)) {
          return value as UserProfile4D['basicLifecycle']['potentialValue'];
        }
      }
    }

    if (dimension === 'consumptionPersonality') {
      if (field === 'consumptionLevel') {
        const validValues = ['low', 'medium', 'high', 'premium'];
        if (typeof value === 'string' && validValues.includes(value)) {
          return value as UserProfile4D['consumptionPersonality']['consumptionLevel'];
        }
      }
      if (field === 'shoppingWidth') {
        const validValues = ['narrow', 'medium', 'wide'];
        if (typeof value === 'string' && validValues.includes(value)) {
          return value as UserProfile4D['consumptionPersonality']['shoppingWidth'];
        }
      }
      if (field === 'decisionSpeed') {
        const validValues = ['fast', 'medium', 'slow'];
        if (typeof value === 'string' && validValues.includes(value)) {
          return value as UserProfile4D['consumptionPersonality']['decisionSpeed'];
        }
      }
    }

    if (dimension === 'realtimeStatus' && field === 'growthTrend') {
      const validValues = ['declining', 'stable', 'growing', 'fast_growing'];
      if (typeof value === 'string' && validValues.includes(value)) {
        return value as UserProfile4D['realtimeStatus']['growthTrend'];
      }
    }

    if (dimension === 'socialActivity' && field === 'fissionPotential') {
      const validValues = ['low', 'medium', 'high'];
      if (typeof value === 'string' && validValues.includes(value)) {
        return value as UserProfile4D['socialActivity']['fissionPotential'];
      }
    }

    // 默认返回原始值
    return value;
  }

  /**
   * 标准化活跃度分数 (0-100)
   */
  private normalizeActivityLevel(activityLevel: any): number | undefined {
    if (typeof activityLevel === 'number') {
      return Math.max(0, Math.min(100, activityLevel));
    }

    if (typeof activityLevel === 'string') {
      // 将文本活跃度转换为分数
      const mapping: Record<string, number> = {
        very_low: 20,
        low: 40,
        medium: 60,
        high: 80,
        very_high: 95,
      };
      return mapping[activityLevel.toLowerCase()];
    }

    return undefined;
  }

  /**
   * 标准化参与度分数 (0-100)
   */
  private normalizeEngagementScore(engagementScore: any): number | undefined {
    if (typeof engagementScore === 'number') {
      return Math.max(0, Math.min(100, engagementScore));
    }
    return undefined;
  }

  /**
   * 标准化社交影响力分数 (0-100)
   */
  private normalizeSocialInfluence(socialInfluence: any): number | undefined {
    if (typeof socialInfluence === 'number') {
      return Math.max(0, Math.min(100, socialInfluence));
    }
    return undefined;
  }

  /**
   * 解析活动偏好标签
   */
  private parseActivityPreference(activityPreference: any): string[] {
    if (Array.isArray(activityPreference)) {
      return activityPreference.filter((item) => typeof item === 'string');
    }

    if (typeof activityPreference === 'string') {
      try {
        const parsed = JSON.parse(activityPreference);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => typeof item === 'string');
        }
      } catch {
        // 如果不是JSON，按逗号分割
        return activityPreference
          .split(',')
          .map((item: string) => item.trim())
          .filter(Boolean);
      }
    }

    return [];
  }

  /**
   * 构建画像筛选条件
   */
  private buildProfileConditions(
    filters: Partial<UserProfile4D>,
  ): Array<{ sql: string; parameters: Record<string, any> }> {
    const conditions: Array<{ sql: string; parameters: Record<string, any> }> =
      [];

    // 反转映射：从维度字段到标签字段
    const reverseMapping: Record<string, string> = {};
    for (const [dimension, fieldMap] of Object.entries(this.tagMapping)) {
      for (const [sourceField, targetField] of Object.entries(fieldMap)) {
        reverseMapping[`${dimension}.${targetField}`] = sourceField;
      }
    }

    // 遍历筛选条件
    for (const [dimension, dimensionFilters] of Object.entries(filters)) {
      if (!dimensionFilters || typeof dimensionFilters !== 'object') {
        continue;
      }

      for (const [field, value] of Object.entries(dimensionFilters)) {
        if (value === undefined || value === null) {
          continue;
        }

        const mappingKey = `${dimension}.${field}`;
        const tagField = reverseMapping[mappingKey];

        if (!tagField) {
          this.logger.warn(`未找到字段映射: ${mappingKey}`);
          continue;
        }

        // 构建JSON路径查询
        // 标签存储在 profile_data->'$.tags.tagField.value'
        const paramName = `param_${tagField}`;
        conditions.push({
          sql: `JSON_UNQUOTE(JSON_EXTRACT(cp.profile_data, '$.tags."${tagField}".value')) = :${paramName}`,
          parameters: { [paramName]: value },
        });
      }
    }

    return conditions;
  }
}
