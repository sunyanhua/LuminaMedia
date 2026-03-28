import { Module } from '@nestjs/common';
import { FieldMappingService } from './field-mapping.service';
import { FieldMappingController } from './field-mapping.controller';
import { DataAnalyticsModule } from '../../data-analytics/data-analytics.module';

@Module({
  imports: [
    DataAnalyticsModule, // 引入GeminiService
  ],
  controllers: [FieldMappingController],
  providers: [FieldMappingService],
  exports: [FieldMappingService],
})
export class FieldMappingModule {}
