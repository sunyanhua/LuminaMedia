"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIEngineModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const data_analytics_module_1 = require("../data-analytics/data-analytics.module");
const vector_module_1 = require("../../shared/vector/vector.module");
const analysis_agent_service_1 = require("./agents/analysis/services/analysis-agent.service");
const knowledge_retrieval_service_1 = require("./agents/analysis/services/knowledge-retrieval.service");
const strategy_agent_service_1 = require("./agents/strategy/services/strategy-agent.service");
const copywriting_agent_service_1 = require("./agents/copywriting/services/copywriting-agent.service");
const agent_workflow_service_1 = require("./agents/workflow/services/agent-workflow.service");
let AIEngineModule = class AIEngineModule {
};
exports.AIEngineModule = AIEngineModule;
exports.AIEngineModule = AIEngineModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, data_analytics_module_1.DataAnalyticsModule, vector_module_1.VectorModule],
        controllers: [],
        providers: [
            analysis_agent_service_1.AnalysisAgentService,
            knowledge_retrieval_service_1.KnowledgeRetrievalService,
            strategy_agent_service_1.StrategyAgentService,
            copywriting_agent_service_1.CopywritingAgentService,
            agent_workflow_service_1.AgentWorkflowService,
        ],
        exports: [
            analysis_agent_service_1.AnalysisAgentService,
            knowledge_retrieval_service_1.KnowledgeRetrievalService,
            strategy_agent_service_1.StrategyAgentService,
            copywriting_agent_service_1.CopywritingAgentService,
            agent_workflow_service_1.AgentWorkflowService,
        ],
    })
], AIEngineModule);
//# sourceMappingURL=ai-engine.module.js.map