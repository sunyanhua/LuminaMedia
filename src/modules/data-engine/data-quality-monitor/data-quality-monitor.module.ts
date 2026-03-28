import { Module } from '@nestjs/common';
import { DataQualityMonitorService } from './data-quality-monitor.service';
import { DataQualityMonitorController } from './data-quality-monitor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataQualityRule } from './entities/data-quality-rule.entity';
import { DataQualityResult } from './entities/data-quality-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DataQualityRule, DataQualityResult])],
  controllers: [DataQualityMonitorController],
  providers: [DataQualityMonitorService],
  exports: [DataQualityMonitorService],
})
export class DataQualityMonitorModule {}
