"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoAnalysisModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../../auth/auth.module");
const geo_region_entity_1 = require("./entities/geo-region.entity");
const geo_analysis_result_entity_1 = require("./entities/geo-analysis-result.entity");
const seo_suggestion_entity_1 = require("./entities/seo-suggestion.entity");
const geo_analysis_service_1 = require("./services/geo-analysis.service");
const region_analysis_service_1 = require("./services/region-analysis.service");
const competitive_analysis_service_1 = require("./services/competitive-analysis.service");
const seo_suggestion_service_1 = require("./services/seo-suggestion.service");
const geo_analysis_controller_1 = require("./controllers/geo-analysis.controller");
const geo_report_controller_1 = require("./controllers/geo-report.controller");
let GeoAnalysisModule = class GeoAnalysisModule {
};
exports.GeoAnalysisModule = GeoAnalysisModule;
exports.GeoAnalysisModule = GeoAnalysisModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([geo_region_entity_1.GeoRegion, geo_analysis_result_entity_1.GeoAnalysisResult, seo_suggestion_entity_1.SeoSuggestion]),
            auth_module_1.AuthModule,
        ],
        controllers: [geo_analysis_controller_1.GeoAnalysisController, geo_report_controller_1.GeoReportController],
        providers: [
            geo_analysis_service_1.GeoAnalysisService,
            region_analysis_service_1.RegionAnalysisService,
            competitive_analysis_service_1.CompetitiveAnalysisService,
            seo_suggestion_service_1.SeoSuggestionService,
        ],
        exports: [
            geo_analysis_service_1.GeoAnalysisService,
            region_analysis_service_1.RegionAnalysisService,
            competitive_analysis_service_1.CompetitiveAnalysisService,
            seo_suggestion_service_1.SeoSuggestionService,
            typeorm_1.TypeOrmModule,
        ],
    })
], GeoAnalysisModule);
//# sourceMappingURL=geo-analysis.module.js.map