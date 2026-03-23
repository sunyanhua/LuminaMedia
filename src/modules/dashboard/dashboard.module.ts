import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { CustomerProfile } from '../../entities/customer-profile.entity';
import { DataImportJob } from '../../entities/data-import-job.entity';
import { CustomerSegment } from '../../entities/customer-segment.entity';
import { UserBehavior } from '../data-analytics/entities/user-behavior.entity';
import { MarketingCampaign } from '../data-analytics/entities/marketing-campaign.entity';
import { MarketingStrategy } from '../data-analytics/entities/marketing-strategy.entity';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      CustomerProfile,
      DataImportJob,
      CustomerSegment,
      UserBehavior,
      MarketingCampaign,
      MarketingStrategy,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
