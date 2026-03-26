import { Module } from '@nestjs/common';
import { DataImportModule } from './import/data-import.module';

@Module({
  imports: [DataImportModule],
  controllers: [],
  providers: [],
  exports: [DataImportModule],
})
export class DataEngineModule {}