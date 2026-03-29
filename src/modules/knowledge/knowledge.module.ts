import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnterpriseProfile } from '../../entities/enterprise-profile.entity';
import { KnowledgeDocument } from '../../entities/knowledge-document.entity';
import { EnterpriseProfileRepository } from '../../shared/repositories/enterprise-profile.repository';
import { KnowledgeDocumentRepository } from '../../shared/repositories/knowledge-document.repository';
import { CustomerProfileRepository } from '../../shared/repositories/customer-profile.repository';
import { EnterpriseProfileAnalysisService } from './services/enterprise-profile-analysis.service';
import { KnowledgeDocumentService } from './services/knowledge-document.service';
import { EnterpriseProfileController } from './controllers/enterprise-profile.controller';
import { KnowledgeDocumentController } from './controllers/knowledge-document.controller';
import { KnowledgeRetrievalService } from '../ai-engine/agents/analysis/services/knowledge-retrieval.service';
import { VectorSearchService } from '../../shared/vector/services/vector-search.service';
import { VectorModule } from '../../shared/vector/vector.module';
import { AIEngineModule } from '../ai-engine/ai-engine.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EnterpriseProfile,
      KnowledgeDocument,
      EnterpriseProfileRepository,
      KnowledgeDocumentRepository,
      CustomerProfileRepository,
    ]),
    VectorModule,
    AIEngineModule,
  ],
  controllers: [EnterpriseProfileController, KnowledgeDocumentController],
  providers: [
    EnterpriseProfileAnalysisService,
    KnowledgeDocumentService,
    KnowledgeRetrievalService,
    VectorSearchService,
  ],
  exports: [EnterpriseProfileAnalysisService, KnowledgeDocumentService],
})
export class KnowledgeModule {}
