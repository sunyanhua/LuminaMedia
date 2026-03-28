import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CustomerProfile } from '../../../entities/customer-profile.entity';

export interface TagCalculationResult {
  success: boolean;
  processedCount: number;
  error?: string;
  executionTime: number;
  tagUpdates: Record<string, number>;
}

export interface TagDefinition {
  name: string;
  description: string;
  sqlTemplate: string;
  refreshInterval: 'daily' | 'weekly' | 'monthly' | 'manual';
  dependsOn?: string[];
  parameters?: Record<string, any>;
}

@Injectable()
export class TagCalculatorService {
  private readonly logger = new Logger(TagCalculatorService.name);
  private calculationInProgress = false;

  constructor(
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 执行标签计算
   * @param tagName 标签名称（如果为空则计算所有标签）
   * @param forceRecalculate 是否强制重新计算
   */
  async calculateTags(
    tagName?: string,
    forceRecalculate: boolean = false,
  ): Promise<TagCalculationResult> {
    const startTime = Date.now();
    this.logger.log(`开始计算标签: ${tagName || '所有标签'}`);

    // 防止并发计算
    if (this.calculationInProgress) {
      throw new Error('标签计算正在进行中，请稍后再试');
    }

    try {
      this.calculationInProgress = true;
      const result: TagCalculationResult = {
        success: true,
        processedCount: 0,
        executionTime: 0,
        tagUpdates: {},
      };

      const tagDefinitions = this.getTagDefinitions();
      const tagsToCalculate = tagName
        ? tagDefinitions.filter((def) => def.name === tagName)
        : tagDefinitions;

      if (tagsToCalculate.length === 0) {
        throw new Error(`标签 ${tagName} 未找到`);
      }

      // 处理依赖关系，按顺序计算
      const sortedTags = this.sortTagsByDependency(tagsToCalculate);

      for (const tagDef of sortedTags) {
        this.logger.log(`计算标签: ${tagDef.name}`);
        const tagStartTime = Date.now();

        // 执行SQL计算
        const tagResults = await this.executeTagCalculation(tagDef);
        this.logger.log(
          `标签 ${tagDef.name} 计算结果: ${tagResults.length} 条记录`,
        );

        // 批量更新客户画像
        let updateCount = 0;
        for (const result of tagResults) {
          await this.updateCustomerTags(
            result.customerId,
            tagDef.name,
            result.tagValue,
          );
          updateCount++;
        }

        result.tagUpdates[tagDef.name] = updateCount;
        result.processedCount += updateCount;

        const tagTime = Date.now() - tagStartTime;
        this.logger.log(
          `标签 ${tagDef.name} 计算完成，耗时: ${tagTime}ms，更新: ${updateCount} 条记录`,
        );
      }

      const executionTime = Date.now() - startTime;
      result.executionTime = executionTime;

      this.logger.log(
        `标签计算完成，总耗时: ${executionTime}ms，处理记录: ${result.processedCount}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`标签计算失败: ${error.message}`, error.stack);
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        processedCount: 0,
        error: error.message,
        executionTime,
        tagUpdates: {},
      };
    } finally {
      this.calculationInProgress = false;
    }
  }

  /**
   * 获取标签定义列表
   */
  getTagDefinitions(): TagDefinition[] {
    // 标准4维度标签定义
    return [
      {
        name: 'consumption_level',
        description: '消费等级标签（基于RFM模型）',
        sqlTemplate: `
          WITH user_stats AS (
            SELECT
              cp.id as customer_id,
              COALESCE(JSON_EXTRACT(cp.profile_data, '$.purchase_amount_total'), 0) as total_spent,
              COALESCE(JSON_EXTRACT(cp.profile_data, '$.purchase_count'), 0) as purchase_count,
              COALESCE(JSON_EXTRACT(cp.profile_data, '$.last_purchase_days_ago'), 999) as recency,
              NTILE(4) OVER (ORDER BY COALESCE(JSON_EXTRACT(cp.profile_data, '$.purchase_amount_total'), 0) DESC) as spending_quartile
            FROM customer_profiles cp
            WHERE cp.profile_data IS NOT NULL
          )
          SELECT customer_id,
            CASE
              WHEN spending_quartile = 1 THEN 'high'
              WHEN spending_quartile = 2 THEN 'medium_high'
              WHEN spending_quartile = 3 THEN 'medium_low'
              ELSE 'low'
            END as tag_value
          FROM user_stats
          WHERE total_spent > 0
        `,
        refreshInterval: 'daily',
      },
      {
        name: 'activity_level',
        description: '活跃度标签',
        sqlTemplate: `
          WITH activity_stats AS (
            SELECT
              cp.id as customer_id,
              COALESCE(JSON_EXTRACT(cp.profile_data, '$.login_count_30d'), 0) as login_count,
              COALESCE(JSON_EXTRACT(cp.profile_data, '$.content_interactions_30d'), 0) as interactions,
              ROW_NUMBER() OVER (ORDER BY
                COALESCE(JSON_EXTRACT(cp.profile_data, '$.login_count_30d'), 0) +
                COALESCE(JSON_EXTRACT(cp.profile_data, '$.content_interactions_30d'), 0) DESC
              ) as rank,
              COUNT(*) OVER () as total_count
            FROM customer_profiles cp
          )
          SELECT customer_id,
            CASE
              WHEN rank <= total_count * 0.2 THEN 'very_high'
              WHEN rank <= total_count * 0.4 THEN 'high'
              WHEN rank <= total_count * 0.6 THEN 'medium'
              WHEN rank <= total_count * 0.8 THEN 'low'
              ELSE 'very_low'
            END as tag_value
          FROM activity_stats
        `,
        refreshInterval: 'daily',
      },
      {
        name: 'growth_trend',
        description: '增长趋势标签',
        sqlTemplate: `
          WITH trend_data AS (
            SELECT
              cp.id as customer_id,
              COALESCE(JSON_EXTRACT(cp.profile_data, '$.purchase_amount_current_month'), 0) as current_month,
              COALESCE(JSON_EXTRACT(cp.profile_data, '$.purchase_amount_previous_month'), 0) as prev_month,
              CASE
                WHEN COALESCE(JSON_EXTRACT(cp.profile_data, '$.purchase_amount_previous_month'), 0) = 0 THEN 0
                ELSE (COALESCE(JSON_EXTRACT(cp.profile_data, '$.purchase_amount_current_month'), 0) -
                      COALESCE(JSON_EXTRACT(cp.profile_data, '$.purchase_amount_previous_month'), 0)) /
                      COALESCE(JSON_EXTRACT(cp.profile_data, '$.purchase_amount_previous_month'), 0)
              END as growth_rate
            FROM customer_profiles cp
          )
          SELECT customer_id,
            CASE
              WHEN growth_rate > 0.3 THEN 'fast_growing'
              WHEN growth_rate > 0.1 THEN 'growing'
              WHEN growth_rate > -0.1 THEN 'stable'
              ELSE 'declining'
            END as tag_value
          FROM trend_data
        `,
        refreshInterval: 'weekly',
        dependsOn: ['consumption_level'],
      },
      {
        name: 'fission_potential',
        description: '裂变潜力标签',
        sqlTemplate: `
          WITH social_data AS (
            SELECT
              cp.id as customer_id,
              COALESCE(JSON_EXTRACT(cp.profile_data, '$.social_share_count'), 0) as share_count,
              COALESCE(JSON_EXTRACT(cp.profile_data, '$.referral_count'), 0) as referral_count,
              COALESCE(JSON_EXTRACT(cp.profile_data, '$.social_influence_score'), 0) as influence_score,
              (COALESCE(JSON_EXTRACT(cp.profile_data, '$.social_share_count'), 0) * 0.4 +
               COALESCE(JSON_EXTRACT(cp.profile_data, '$.referral_count'), 0) * 0.4 +
               COALESCE(JSON_EXTRACT(cp.profile_data, '$.social_influence_score'), 0) * 0.2) as fission_score
            FROM customer_profiles cp
          )
          SELECT customer_id,
            CASE
              WHEN fission_score >= 8 THEN 'high'
              WHEN fission_score >= 5 THEN 'medium'
              ELSE 'low'
            END as tag_value
          FROM social_data
        `,
        refreshInterval: 'weekly',
      },
    ];
  }

  /**
   * 根据依赖关系排序标签
   */
  private sortTagsByDependency(tags: TagDefinition[]): TagDefinition[] {
    const sorted: TagDefinition[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (tag: TagDefinition) => {
      if (visited.has(tag.name)) return;
      if (visiting.has(tag.name)) {
        throw new Error(`检测到循环依赖: ${tag.name}`);
      }

      visiting.add(tag.name);

      // 先处理依赖
      if (tag.dependsOn) {
        for (const depName of tag.dependsOn) {
          const depTag = tags.find((t) => t.name === depName);
          if (depTag) {
            visit(depTag);
          }
        }
      }

      visiting.delete(tag.name);
      visited.add(tag.name);
      sorted.push(tag);
    };

    for (const tag of tags) {
      visit(tag);
    }

    return sorted;
  }

  /**
   * 执行单个标签的SQL计算
   */
  private async executeTagCalculation(
    tagDef: TagDefinition,
  ): Promise<{ customerId: string; tagValue: any }[]> {
    this.logger.log(`执行标签计算: ${tagDef.name}`);

    try {
      // 执行原始SQL查询
      const results = await this.dataSource.query(tagDef.sqlTemplate);
      return results.map((row: any) => ({
        customerId: row.customer_id,
        tagValue: row.tag_value,
      }));
    } catch (error) {
      this.logger.error(
        `SQL执行失败 (${tagDef.name}): ${error.message}`,
        error.stack,
      );
      throw new Error(`标签 ${tagDef.name} 计算失败: ${error.message}`);
    }
  }

  /**
   * 更新客户画像中的标签数据
   */
  private async updateCustomerTags(
    customerId: string,
    tagName: string,
    tagValue: any,
  ): Promise<void> {
    try {
      // 获取当前profile_data
      const profile = await this.customerProfileRepository.findOne({
        where: { id: customerId },
      });

      if (!profile) {
        this.logger.warn(`客户 ${customerId} 不存在，跳过标签更新`);
        return;
      }

      // 初始化profile_data结构
      let profileData = profile.profileData || {};
      if (typeof profileData === 'string') {
        try {
          profileData = JSON.parse(profileData);
        } catch {
          profileData = {};
        }
      }

      // 初始化tags对象
      if (!profileData.tags) {
        profileData.tags = {};
      }

      // 更新标签值
      profileData.tags[tagName] = {
        value: tagValue,
        updatedAt: new Date().toISOString(),
      };

      // 保存更新
      profile.profileData = profileData;
      await this.customerProfileRepository.save(profile);
    } catch (error) {
      this.logger.error(
        `更新客户 ${customerId} 标签失败: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 批量更新标签（性能优化版本）
   */
  private async batchUpdateCustomerTags(
    updates: Array<{ customerId: string; tagName: string; tagValue: any }>,
  ): Promise<number> {
    if (updates.length === 0) {
      return 0;
    }

    // 按客户分组
    const customerUpdates = new Map<string, Record<string, any>>();
    for (const update of updates) {
      if (!customerUpdates.has(update.customerId)) {
        customerUpdates.set(update.customerId, {});
      }
      const tags = customerUpdates.get(update.customerId)!;
      tags[update.tagName] = {
        value: update.tagValue,
        updatedAt: new Date().toISOString(),
      };
    }

    // 批量更新
    let successCount = 0;
    for (const [customerId, tags] of customerUpdates.entries()) {
      try {
        await this.customerProfileRepository
          .createQueryBuilder()
          .update(CustomerProfile)
          .set({
            profileData: () => `JSON_SET(
              COALESCE(profile_data, '{}'),
              '$.tags',
              JSON_MERGE_PATCH(
                COALESCE(JSON_EXTRACT(profile_data, '$.tags'), '{}'),
                '${JSON.stringify(tags)}'
              )
            )`,
          })
          .where('id = :customerId', { customerId })
          .execute();
        successCount++;
      } catch (error) {
        this.logger.error(
          `批量更新客户 ${customerId} 标签失败: ${error.message}`,
        );
      }
    }

    return successCount;
  }
}
