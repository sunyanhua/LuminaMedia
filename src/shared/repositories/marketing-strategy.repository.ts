import { TenantRepository } from './tenant.repository';
import { MarketingStrategy } from '../../modules/data-analytics/entities/marketing-strategy.entity';
import { StrategyType } from '../enums/strategy-type.enum';

/**
 * MarketingStrategy实体的租户感知Repository
 */
export class MarketingStrategyRepository extends TenantRepository<MarketingStrategy> {
  // 可以添加实体特定的查询方法
  async findByCampaign(campaignId: string): Promise<MarketingStrategy[]> {
    return this.createQueryBuilder('strategy')
      .where('strategy.campaignId = :campaignId', { campaignId })
      .orderBy('strategy.createdAt', 'ASC')
      .getMany();
  }

  async findByType(strategyType: StrategyType): Promise<MarketingStrategy[]> {
    return this.createQueryBuilder('strategy')
      .where('strategy.strategyType = :strategyType', { strategyType })
      .orderBy('strategy.confidenceScore', 'DESC')
      .getMany();
  }

  async findHighConfidenceStrategies(minScore: number = 80): Promise<MarketingStrategy[]> {
    return this.createQueryBuilder('strategy')
      .where('CAST(strategy.confidenceScore AS DECIMAL) >= :minScore', { minScore })
      .orderBy('strategy.confidenceScore', 'DESC')
      .getMany();
  }

  async findByCustomerProfile(customerProfileId: string): Promise<MarketingStrategy[]> {
    return this.createQueryBuilder('strategy')
      .where('strategy.customerProfileId = :customerProfileId', { customerProfileId })
      .orderBy('strategy.createdAt', 'DESC')
      .getMany();
  }
}