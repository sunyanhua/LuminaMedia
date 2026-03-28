import { Module } from '@nestjs/common';
import { DataImportModule } from './import/data-import.module';
import { FieldMappingModule } from './field-mapping/field-mapping.module';
import { TagCalculationModule } from './tag-calculation/tag-calculation.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { DataQualityMonitorModule } from './data-quality-monitor/data-quality-monitor.module';

@Module({
  imports: [
    DataImportModule,
    FieldMappingModule,
    TagCalculationModule,
    UserProfileModule,
    DataQualityMonitorModule,
  ],
  controllers: [],
  providers: [],
  exports: [
    DataImportModule,
    FieldMappingModule,
    TagCalculationModule,
    UserProfileModule,
    DataQualityMonitorModule,
  ],
})
export class DataEngineModule {}
