import { Module } from '@nestjs/common';
import { ExcelParserService } from './excel-parser.service';
import { ApiDataReceiverService } from './api-data-receiver.service';

@Module({
  providers: [ExcelParserService, ApiDataReceiverService],
  exports: [ExcelParserService, ApiDataReceiverService],
})
export class DataImportModule {}