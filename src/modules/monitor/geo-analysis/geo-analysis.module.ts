import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoRegion } from './entities/geo-region.entity';
import { GeoAnalysisResult } from './entities/geo-analysis-result.entity';
import { SeoSuggestion } from './entities/seo-suggestion.entity';
import { GeoAnalysisService } from './services/geo-analysis.service';
import { RegionAnalysisService } from './services/region-analysis.service';
import { CompetitiveAnalysisService } from './services/competitive-analysis.service';
import { SeoSuggestionService } from './services/seo-suggestion.service';
import { GeoAnalysisController } from './controllers/geo-analysis.controller';
import { GeoReportController } from './controllers/geo-report.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeoRegion, GeoAnalysisResult, SeoSuggestion]),
  ],
  controllers: [GeoAnalysisController, GeoReportController],
  providers: [
    GeoAnalysisService,
    RegionAnalysisService,
    CompetitiveAnalysisService,
    SeoSuggestionService,
  ],
  exports: [
    GeoAnalysisService,
    RegionAnalysisService,
    CompetitiveAnalysisService,
    SeoSuggestionService,
    TypeOrmModule,
  ],
})
export class GeoAnalysisModule {}
