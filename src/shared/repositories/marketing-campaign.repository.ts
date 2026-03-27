import { TenantRepository } from './tenant.repository';
import { MarketingCampaign } from '../../modules/data-analytics/entities/marketing-campaign.entity';
import { CampaignStatus } from '../enums/campaign-status.enum';

/**
 * MarketingCampaign实体的租户感知Repository
 */
export class MarketingCampaignRepository extends TenantRepository<MarketingCampaign> {
  // 可以添加实体特定的查询方法
  async findByStatus(status: CampaignStatus): Promise<MarketingCampaign[]> {
    return this.createQueryBuilder('campaign')
      .where('campaign.status = :status', { status })
      .orderBy('campaign.createdAt', 'DESC')
      .getMany();
  }

  async findActiveCampaigns(): Promise<MarketingCampaign[]> {
    const now = new Date();
    return this.createQueryBuilder('campaign')
      .where('campaign.status = :status', { status: CampaignStatus.ACTIVE })
      .andWhere('(campaign.startDate IS NULL OR campaign.startDate <= :now)')
      .andWhere('(campaign.endDate IS NULL OR campaign.endDate >= :now)')
      .setParameter('now', now)
      .orderBy('campaign.startDate', 'ASC')
      .getMany();
  }

  async findByUserAndProfile(
    userId: string,
    customerProfileId?: string,
  ): Promise<MarketingCampaign[]> {
    const query = this.createQueryBuilder('campaign').where(
      'campaign.userId = :userId',
      { userId },
    );

    if (customerProfileId) {
      query.andWhere('campaign.customerProfileId = :customerProfileId', {
        customerProfileId,
      });
    }

    return query.orderBy('campaign.createdAt', 'DESC').getMany();
  }
}
