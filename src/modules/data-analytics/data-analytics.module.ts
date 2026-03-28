import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBehavior } from './entities/user-behavior.entity';
import { MarketingCampaign } from './entities/marketing-campaign.entity';
import { MarketingStrategy } from './entities/marketing-strategy.entity';
import { CustomerProfile } from '../../entities/customer-profile.entity';
import { CustomerSegment } from '../../entities/customer-segment.entity';
import { DataImportJob } from '../../entities/data-import-job.entity';
import { UserBehaviorRepository } from '../../shared/repositories/user-behavior.repository';
import { MarketingCampaignRepository } from '../../shared/repositories/marketing-campaign.repository';
import { MarketingStrategyRepository } from '../../shared/repositories/marketing-strategy.repository';
import { CustomerProfileRepository } from '../../shared/repositories/customer-profile.repository';
import { CustomerSegmentRepository } from '../../shared/repositories/customer-segment.repository';
import { DataImportJobRepository } from '../../shared/repositories/data-import-job.repository';
import { TenantContextService } from '../../shared/services/tenant-context.service';
import { AnalyticsService } from './services/analytics.service';
import { MarketingStrategyService } from './services/marketing-strategy.service';
import { MockDataService } from './services/mock-data.service';
import { ReportService } from './services/report.service';
import { GeminiService } from './services/gemini.service';
import { QwenService } from './services/qwen.service';
import { ContentGenerationService } from './services/content-generation.service';
import { DemoService } from './services/demo.service';
import { UserBehaviorController } from './controllers/user-behavior.controller';
import { MarketingCampaignController } from './controllers/marketing-campaign.controller';
import { MarketingStrategyController } from './controllers/marketing-strategy.controller';
import { MockDataController } from './controllers/mock-data.controller';
import { ReportController } from './controllers/report.controller';
import { ContentGenerationController } from './controllers/content-generation.controller';
import { DemoController } from './controllers/demo.controller';
import { CustomerDataModule } from '../customer-data/customer-data.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserBehavior,
      MarketingCampaign,
      MarketingStrategy,
      CustomerProfile,
      CustomerSegment,
      DataImportJob,
      UserBehaviorRepository,
      MarketingCampaignRepository,
      MarketingStrategyRepository,
      CustomerProfileRepository,
      CustomerSegmentRepository,
      DataImportJobRepository,
    ]),
    CustomerDataModule,
    AuthModule,
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
  ],
})
export class DataAnalyticsModule {}
