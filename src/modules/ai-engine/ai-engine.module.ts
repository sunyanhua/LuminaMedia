import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataAnalyticsModule } from '../data-analytics/data-analytics.module';
import { AnalysisAgentService } from './agents/analysis/services/analysis-agent.service';
import { KnowledgeRetrievalService } from './agents/analysis/services/knowledge-retrieval.service';
import { StrategyAgentService } from './agents/strategy/services/strategy-agent.service';
import { CopywritingAgentService } from './agents/copywriting/services/copywriting-agent.service';
import { AgentWorkflowService } from './agents/workflow/services/agent-workflow.service';

@Module({
  imports: [ConfigModule, DataAnalyticsModule],
  controllers: [],
  providers: [
    AnalysisAgentService,
    KnowledgeRetrievalService,
    StrategyAgentService,
    CopywritingAgentService,
    AgentWorkflowService,
  ],
  exports: [
    AnalysisAgentService,
    KnowledgeRetrievalService,
    StrategyAgentService,
    CopywritingAgentService,
    AgentWorkflowService,
  ],
})
export class AIEngineModule {}
