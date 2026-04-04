import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBehavior } from './entities/user-behavior.entity';
import { MarketingCampaign } from '../../entities/marketing-campaign.entity';
import { MarketingStrategy } from '../../entities/marketing-strategy.entity';
import { CustomerProfile } from '../../entities/customer-profile.entity';
import { CustomerSegment } from '../../entities/customer-segment.entity';
import { DataImportJob } from '../../entities/data-import-job.entity';
import { ContentDraft } from '../../entities/content-draft.entity';
import { GovernmentContent } from '../../entities/government-content.entity';
import { SocialInteraction } from '../../entities/social-interaction.entity';
import { Tenant } from '../../entities/tenant.entity';
import { UserBehaviorRepository } from '../../shared/repositories/user-behavior.repository';
import { MarketingCampaignRepository } from '../../shared/repositories/marketing-campaign.repository';
import { MarketingStrategyRepository } from '../../shared/repositories/marketing-strategy.repository';
import { CustomerProfileRepository } from '../../shared/repositories/customer-profile.repository';
import { CustomerSegmentRepository } from '../../shared/repositories/customer-segment.repository';
import { DataImportJobRepository } from '../../shared/repositories/data-import-job.repository';
import { ContentDraftRepository } from '../../shared/repositories/content-draft.repository';
import { TenantContextService } from '../../shared/services/tenant-context.service';
import { AnalyticsService } from './services/analytics.service';
import { MarketingStrategyService } from './services/marketing-strategy.service';
import { MockDataService } from './services/mock-data.service';
import { ReportService } from './services/report.service';
import { GeminiService } from './services/gemini.service';
import { QwenService } from './services/qwen.service';
import { ContentGenerationService } from './services/content-generation.service';
import { DemoService } from './services/demo.service';
import { DemoResetService } from './services/demo-reset.service';
import { UserBehaviorController } from './controllers/user-behavior.controller';
import { MarketingCampaignController } from './controllers/marketing-campaign.controller';
import { MarketingStrategyController } from './controllers/marketing-strategy.controller';
import { MockDataController } from './controllers/mock-data.controller';
import { ReportController } from './controllers/report.controller';
import { ContentGenerationController } from './controllers/content-generation.controller';
import { DemoController } from './controllers/demo.controller';
import { CustomerDataModule } from '../customer-data/customer-data.module';
import { AuthModule } from '../auth/auth.module';
import { SharedMarketingModule } from '../shared-marketing/shared-marketing.module';
// import { GovernmentModule } from '../government/government.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserBehavior,
      MarketingCampaign,
      MarketingStrategy,
      CustomerProfile,
      CustomerSegment,
      DataImportJob,
      ContentDraft,
      GovernmentContent,
      SocialInteraction,
      Tenant,
      UserBehaviorRepository,
      MarketingCampaignRepository,
      MarketingStrategyRepository,
      CustomerProfileRepository,
      CustomerSegmentRepository,
      DataImportJobRepository,
      ContentDraftRepository,
    ]),
    CustomerDataModule,
    AuthModule,
    SharedMarketingModule,
    // GovernmentModule, // 注释掉GovernmentModule导入以避免循环依赖
  ],
  controllers: [
    UserBehaviorController,
    MarketingCampaignController,
    MarketingStrategyController,
    MockDataController,
    ReportController,
    ContentGenerationController,
    DemoController,
  ],
  providers: [
    AnalyticsService,
    MarketingStrategyService,
    MockDataService,
    ReportService,
    GeminiService,
    QwenService,
    ContentGenerationService,
    DemoService,
    DemoResetService,
    TenantContextService,
  ],
  exports: [
    AnalyticsService,
    MarketingStrategyService,
    MockDataService,
    ReportService,
    GeminiService,
    QwenService,
    ContentGenerationService,
    DemoService,
    DemoResetService,
    TypeOrmModule.forFeature([
      UserBehavior,
      MarketingCampaign,
      MarketingStrategy,
      CustomerProfile,
      CustomerSegment,
      DataImportJob,
      ContentDraft,
      GovernmentContent,
      SocialInteraction,
      Tenant,
      UserBehaviorRepository,
      MarketingCampaignRepository,
      MarketingStrategyRepository,
      CustomerProfileRepository,
      CustomerSegmentRepository,
      DataImportJobRepository,
      ContentDraftRepository,
    ]),
  ],
})
export class DataAnalyticsModule {}