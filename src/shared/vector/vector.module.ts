import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QdrantAdapter } from './adapters/qdrant.adapter';
import { VectorSearchService } from './services/vector-search.service';
import { DocumentPipelineService } from './services/document-pipeline.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [QdrantAdapter, VectorSearchService, DocumentPipelineService],
  exports: [QdrantAdapter, VectorSearchService, DocumentPipelineService],
})
export class VectorModule {}
