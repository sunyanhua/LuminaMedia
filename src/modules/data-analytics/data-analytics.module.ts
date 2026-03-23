import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBehavior } from './entities/user-behavior.entity';
import { MarketingCampaign } from './entities/marketing-campaign.entity';
import { MarketingStrategy } from './entities/marketing-strategy.entity';
import { CustomerProfile } from '../../entities/customer-profile.entity';
import { CustomerSegment } from '../../entities/customer-segment.entity';
import { DataImportJob } from '../../entities/data-import-job.entity';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserBehavior,
      MarketingCampaign,
      MarketingStrategy,
      CustomerProfile,
      CustomerSegment,
    ]),
    CustomerDataModule,
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
