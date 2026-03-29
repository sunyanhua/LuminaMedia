import { Module } from '@nestjs/common';
import { DataCollectionModule } from './data-collection/data-collection.module';
import { SentimentAnalysisModule } from './sentiment-analysis/sentiment-analysis.module';
import { GeoAnalysisModule } from './geo-analysis/geo-analysis.module';

@Module({
  imports: [
    // DataCollectionModule, // temporarily disabled due to compilation errors
    SentimentAnalysisModule,
    GeoAnalysisModule,
  ],
  controllers: [],
  providers: [],
  exports: [
    // DataCollectionModule,
    SentimentAnalysisModule,
    GeoAnalysisModule,
  ],
})
export class MonitorModule {}
