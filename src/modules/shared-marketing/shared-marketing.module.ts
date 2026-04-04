import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingCampaign } from '../data-analytics/entities/marketing-campaign.entity';
import { MarketingStrategy } from '../data-analytics/entities/marketing-strategy.entity';
import { MarketingCampaignRepository } from '../../shared/repositories/marketing-campaign.repository';
import { MarketingStrategyRepository } from '../../shared/repositories/marketing-strategy.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketingCampaign,
      MarketingStrategy,
      MarketingCampaignRepository,
      MarketingStrategyRepository,
    ])
  ],
  providers: [
    MarketingCampaignRepository,
    MarketingStrategyRepository,
  ],
  exports: [
    TypeOrmModule.forFeature([
      MarketingCampaign,
      MarketingStrategy,
      MarketingCampaignRepository,
      MarketingStrategyRepository,
    ]),
    MarketingCampaignRepository,
    MarketingStrategyRepository,
  ],
})
export class SharedMarketingModule {}