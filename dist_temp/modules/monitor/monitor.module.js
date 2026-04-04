"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorModule = void 0;
const common_1 = require("@nestjs/common");
const sentiment_analysis_module_1 = require("./sentiment-analysis/sentiment-analysis.module");
const geo_analysis_module_1 = require("./geo-analysis/geo-analysis.module");
let MonitorModule = class MonitorModule {
};
exports.MonitorModule = MonitorModule;
exports.MonitorModule = MonitorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sentiment_analysis_module_1.SentimentAnalysisModule,
            geo_analysis_module_1.GeoAnalysisModule,
        ],
        controllers: [],
        providers: [],
        exports: [
            sentiment_analysis_module_1.SentimentAnalysisModule,
            geo_analysis_module_1.GeoAnalysisModule,
        ],
    })
], MonitorModule);
//# sourceMappingURL=monitor.module.js.map