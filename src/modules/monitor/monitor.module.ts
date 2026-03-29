import { Module } from '@nestjs/common';
import { DataCollectionModule } from './data-collection/data-collection.module';
import { SentimentAnalysisModule } from './sentiment-analysis/sentiment-analysis.module';

@Module({
  imports: [
    DataCollectionModule,
    SentimentAnalysisModule,
  ],
  controllers: [],
  providers: [],
  exports: [
    DataCollectionModule,
    SentimentAnalysisModule,
  ],
})
export class MonitorModule {}
