import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module'; // 导入AuthModule以使用FeatureGuard
import { CustomerProfile } from '../../entities/customer-profile.entity';
import { DataImportJob } from '../../entities/data-import-job.entity';
import { CustomerSegment } from '../../entities/customer-segment.entity';
// 自定义Repository导入
import { CustomerProfileRepository } from '../../shared/repositories/customer-profile.repository';
import { DataImportJobRepository } from '../../shared/repositories/data-import-job.repository';
import { CustomerSegmentRepository } from '../../shared/repositories/customer-segment.repository';
// 服务导入
import { CustomerProfileService } from './services/customer-profile.service';
import { DataImportService } from './services/data-import.service';
import { CustomerAnalyticsService } from './services/customer-analytics.service';
// 控制器导入
import { CustomerProfileController } from './controllers/customer-profile.controller';
import { DataImportController } from './controllers/data-import.controller';
import { CustomerAnalyticsController } from './controllers/customer-analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerProfile,
      DataImportJob,
      CustomerSegment,
      CustomerProfileRepository,
      DataImportJobRepository,
      CustomerSegmentRepository,
    ]),
    AuthModule, // 添加AuthModule导入
  ],
  controllers: [
    CustomerProfileController,
    DataImportController,
    CustomerAnalyticsController,
  ],
  providers: [
    CustomerProfileService,
    DataImportService,
    CustomerAnalyticsService,
  ],
  exports: [
    CustomerProfileService,
    DataImportService,
    CustomerAnalyticsService,
    TypeOrmModule.forFeature([
      CustomerProfile,
      DataImportJob,
      CustomerSegment,
      CustomerProfileRepository,
      DataImportJobRepository,
      CustomerSegmentRepository,
    ]),
  ],
})
export class CustomerDataModule {}
