import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GovernmentContent } from '../../entities/government-content.entity';
import { SocialInteraction } from '../../entities/social-interaction.entity';
import { CustomerProfile } from '../../entities/customer-profile.entity';
import { MarketingCampaign } from '../../entities/marketing-campaign.entity';
import { MarketingStrategy } from '../../entities/marketing-strategy.entity';
import { ContentDraft } from '../../entities/content-draft.entity';
import { MarketingCampaignRepository } from '../../shared/repositories/marketing-campaign.repository';
import { MarketingStrategyRepository } from '../../shared/repositories/marketing-strategy.repository';
import { GovernmentDemoService } from './services/government-demo.service';
import { AuthModule } from '../auth/auth.module';
import { SharedMarketingModule } from '../shared-marketing/shared-marketing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GovernmentContent,
      SocialInteraction,
      CustomerProfile,
      MarketingCampaign,
      MarketingStrategy,
      ContentDraft,
      MarketingCampaignRepository,
      MarketingStrategyRepository,
    ]),
    AuthModule,
    SharedMarketingModule,
  ],
  providers: [
    GovernmentDemoService,
    MarketingCampaignRepository,
    MarketingStrategyRepository,
  ],
  exports: [
    GovernmentDemoService,
    MarketingCampaignRepository,
    MarketingStrategyRepository,
  ],
})
export class GovernmentModule {}