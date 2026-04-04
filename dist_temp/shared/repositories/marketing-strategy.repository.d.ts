import { TenantRepository } from './tenant.repository';
import { MarketingStrategy } from '../../modules/data-analytics/entities/marketing-strategy.entity';
import { StrategyType } from '../enums/strategy-type.enum';
export declare class MarketingStrategyRepository extends TenantRepository<MarketingStrategy> {
    findByCampaign(campaignId: string): Promise<MarketingStrategy[]>;
    findByType(strategyType: StrategyType): Promise<MarketingStrategy[]>;
    findHighConfidenceStrategies(minScore?: number): Promise<MarketingStrategy[]>;
    findByCustomerProfile(customerProfileId: string): Promise<MarketingStrategy[]>;
}
