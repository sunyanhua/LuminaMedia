"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingCampaignRepository = void 0;
const tenant_repository_1 = require("./tenant.repository");
const campaign_status_enum_1 = require("../enums/campaign-status.enum");
class MarketingCampaignRepository extends tenant_repository_1.TenantRepository {
    async findByStatus(status) {
        return this.createQueryBuilder('campaign')
            .where('campaign.status = :status', { status })
            .orderBy('campaign.createdAt', 'DESC')
            .getMany();
    }
    async findActiveCampaigns() {
        const now = new Date();
        return this.createQueryBuilder('campaign')
            .where('campaign.status = :status', { status: campaign_status_enum_1.CampaignStatus.ACTIVE })
            .andWhere('(campaign.startDate IS NULL OR campaign.startDate <= :now)')
            .andWhere('(campaign.endDate IS NULL OR campaign.endDate >= :now)')
            .setParameter('now', now)
            .orderBy('campaign.startDate', 'ASC')
            .getMany();
    }
    async findByUserAndProfile(userId, customerProfileId) {
        const query = this.createQueryBuilder('campaign').where('campaign.userId = :userId', { userId });
        if (customerProfileId) {
            query.andWhere('campaign.customerProfileId = :customerProfileId', {
                customerProfileId,
            });
        }
        return query.orderBy('campaign.createdAt', 'DESC').getMany();
    }
}
exports.MarketingCampaignRepository = MarketingCampaignRepository;
//# sourceMappingURL=marketing-campaign.repository.js.map