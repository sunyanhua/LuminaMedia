"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const enterprise_profile_entity_1 = require("../../entities/enterprise-profile.entity");
const knowledge_document_entity_1 = require("../../entities/knowledge-document.entity");
const enterprise_profile_repository_1 = require("../../shared/repositories/enterprise-profile.repository");
const knowledge_document_repository_1 = require("../../shared/repositories/knowledge-document.repository");
const customer_profile_repository_1 = require("../../shared/repositories/customer-profile.repository");
const enterprise_profile_analysis_service_1 = require("./services/enterprise-profile-analysis.service");
const knowledge_document_service_1 = require("./services/knowledge-document.service");
const enterprise_profile_controller_1 = require("./controllers/enterprise-profile.controller");
const knowledge_document_controller_1 = require("./controllers/knowledge-document.controller");
const knowledge_retrieval_service_1 = require("../ai-engine/agents/analysis/services/knowledge-retrieval.service");
const vector_search_service_1 = require("../../shared/vector/services/vector-search.service");
const vector_module_1 = require("../../shared/vector/vector.module");
const ai_engine_module_1 = require("../ai-engine/ai-engine.module");
let KnowledgeModule = class KnowledgeModule {
};
exports.KnowledgeModule = KnowledgeModule;
exports.KnowledgeModule = KnowledgeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                enterprise_profile_entity_1.EnterpriseProfile,
                knowledge_document_entity_1.KnowledgeDocument,
                enterprise_profile_repository_1.EnterpriseProfileRepository,
                knowledge_document_repository_1.KnowledgeDocumentRepository,
                customer_profile_repository_1.CustomerProfileRepository,
            ]),
            vector_module_1.VectorModule,
            ai_engine_module_1.AIEngineModule,
        ],
        controllers: [enterprise_profile_controller_1.EnterpriseProfileController, knowledge_document_controller_1.KnowledgeDocumentController],
        providers: [
            enterprise_profile_analysis_service_1.EnterpriseProfileAnalysisService,
            knowledge_document_service_1.KnowledgeDocumentService,
            knowledge_retrieval_service_1.KnowledgeRetrievalService,
            vector_search_service_1.VectorSearchService,
        ],
        exports: [enterprise_profile_analysis_service_1.EnterpriseProfileAnalysisService, knowledge_document_service_1.KnowledgeDocumentService],
    })
], KnowledgeModule);
//# sourceMappingURL=knowledge.module.js.map