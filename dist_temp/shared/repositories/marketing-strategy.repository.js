"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingStrategyRepository = void 0;
const tenant_repository_1 = require("./tenant.repository");
class MarketingStrategyRepository extends tenant_repository_1.TenantRepository {
    async findByCampaign(campaignId) {
        return this.createQueryBuilder('strategy')
            .where('strategy.campaignId = :campaignId', { campaignId })
            .orderBy('strategy.createdAt', 'ASC')
            .getMany();
    }
    async findByType(strategyType) {
        return this.createQueryBuilder('strategy')
            .where('strategy.strategyType = :strategyType', { strategyType })
            .orderBy('strategy.confidenceScore', 'DESC')
            .getMany();
    }
    async findHighConfidenceStrategies(minScore = 80) {
        return this.createQueryBuilder('strategy')
            .where('CAST(strategy.confidenceScore AS DECIMAL) >= :minScore', {
            minScore,
        })
            .orderBy('strategy.confidenceScore', 'DESC')
            .getMany();
    }
    async findByCustomerProfile(customerProfileId) {
        return this.createQueryBuilder('strategy')
            .where('strategy.customerProfileId = :customerProfileId', {
            customerProfileId,
        })
            .orderBy('strategy.createdAt', 'DESC')
            .getMany();
    }
}
exports.MarketingStrategyRepository = MarketingStrategyRepository;
//# sourceMappingURL=marketing-strategy.repository.js.map