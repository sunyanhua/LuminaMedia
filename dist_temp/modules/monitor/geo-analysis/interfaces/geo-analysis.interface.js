"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImplementationStatus = exports.SuggestionType = exports.PriorityLevel = exports.RegionType = exports.RegionLevel = exports.AnalysisStatus = exports.AnalysisType = void 0;
var geo_analysis_result_entity_1 = require("../entities/geo-analysis-result.entity");
Object.defineProperty(exports, "AnalysisType", { enumerable: true, get: function () { return geo_analysis_result_entity_1.AnalysisType; } });
Object.defineProperty(exports, "AnalysisStatus", { enumerable: true, get: function () { return geo_analysis_result_entity_1.AnalysisStatus; } });
var geo_region_entity_1 = require("../entities/geo-region.entity");
Object.defineProperty(exports, "RegionLevel", { enumerable: true, get: function () { return geo_region_entity_1.RegionLevel; } });
Object.defineProperty(exports, "RegionType", { enumerable: true, get: function () { return geo_region_entity_1.RegionType; } });
var seo_suggestion_entity_1 = require("../entities/seo-suggestion.entity");
Object.defineProperty(exports, "PriorityLevel", { enumerable: true, get: function () { return seo_suggestion_entity_1.PriorityLevel; } });
Object.defineProperty(exports, "SuggestionType", { enumerable: true, get: function () { return seo_suggestion_entity_1.SuggestionType; } });
Object.defineProperty(exports, "ImplementationStatus", { enumerable: true, get: function () { return seo_suggestion_entity_1.ImplementationStatus; } });
//# sourceMappingURL=geo-analysis.interface.js.map