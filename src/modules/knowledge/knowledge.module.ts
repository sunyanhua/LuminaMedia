import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { EnterpriseProfile } from '../../entities/enterprise-profile.entity';
import { KnowledgeDocument } from '../../entities/knowledge-document.entity';
import { TenantProfile } from '../../entities/tenant-profile.entity';
import { ReferenceInfo } from '../../entities/reference-info.entity';
import { CrawlTask } from '../../entities/crawl-task.entity';
import { CrawlQueue } from '../../entities/crawl-queue.entity';
import { CrawlService } from './services/crawl.service';
import { CrawlController } from './controllers/crawl.controller';
import { EnterpriseProfileRepository } from '../../shared/repositories/enterprise-profile.repository';
import { KnowledgeDocumentRepository } from '../../shared/repositories/knowledge-document.repository';
import { CustomerProfileRepository } from '../../shared/repositories/customer-profile.repository';
import { EnterpriseProfileAnalysisService } from './services/enterprise-profile-analysis.service';
import { KnowledgeDocumentService } from './services/knowledge-document.service';
import { TenantProfileService } from './services/tenant-profile.service';
import { ReferenceInfoService } from './services/reference-info.service';
import { ReferenceCrawlerService } from './services/reference-crawler.service';
import { ReferenceInfoController } from './controllers/reference-info.controller';
import { EnterpriseProfileController } from './controllers/enterprise-profile.controller';
import { KnowledgeDocumentController } from './controllers/knowledge-document.controller';
import { TenantProfileController } from './controllers/tenant-profile.controller';
import { KnowledgeRetrievalService } from '../ai-engine/agents/analysis/services/knowledge-retrieval.service';
import { VectorSearchService } from '../../shared/vector/services/vector-search.service';
import { VectorModule } from '../../shared/vector/vector.module';
import { AIEngineModule } from '../ai-engine/ai-engine.module';
import { DataAnalyticsModule } from '../data-analytics/data-analytics.module';
import { TenantContextService } from '../../shared/services/tenant-context.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EnterpriseProfile,
      KnowledgeDocument,
      TenantProfile,
      ReferenceInfo,
      CrawlTask,
      CrawlQueue,
    ]),
    HttpModule,
    ScheduleModule.forRoot(),
    VectorModule,
    AIEngineModule,
    DataAnalyticsModule,
  ],
  controllers: [
    EnterpriseProfileController,
    KnowledgeDocumentController,
    TenantProfileController,
    ReferenceInfoController,
    CrawlController,
  ],
  providers: [
    EnterpriseProfileAnalysisService,
    KnowledgeDocumentService,
    TenantProfileService,
    ReferenceInfoService,
    ReferenceCrawlerService,
    KnowledgeRetrievalService,
    VectorSearchService,
    TenantContextService,
    KnowledgeDocumentRepository,
    EnterpriseProfileRepository,
    CustomerProfileRepository,
    CrawlService,
  ],
  exports: [
    EnterpriseProfileAnalysisService,
    KnowledgeDocumentService,
    TenantProfileService,
    ReferenceInfoService,
    ReferenceCrawlerService,
    KnowledgeDocumentRepository,
    EnterpriseProfileRepository,
    CustomerProfileRepository,
  ],
})
export class KnowledgeModule {}
