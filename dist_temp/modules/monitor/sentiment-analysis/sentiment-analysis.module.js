"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentimentAnalysisModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("../../auth/auth.module");
const sentiment_analysis_service_1 = require("./services/sentiment-analysis.service");
const gemini_sentiment_provider_1 = require("./services/gemini-sentiment.provider");
const lexicon_sentiment_provider_1 = require("./services/lexicon-sentiment.provider");
const sentiment_analysis_controller_1 = require("./controllers/sentiment-analysis.controller");
const sentimentProviders = [
    gemini_sentiment_provider_1.GeminiSentimentProvider,
    lexicon_sentiment_provider_1.LexiconSentimentProvider,
    {
        provide: 'SENTIMENT_PROVIDERS',
        useFactory: (geminiProvider, lexiconProvider) => {
            return [geminiProvider, lexiconProvider];
        },
        inject: [gemini_sentiment_provider_1.GeminiSentimentProvider, lexicon_sentiment_provider_1.LexiconSentimentProvider],
    },
];
let SentimentAnalysisModule = class SentimentAnalysisModule {
};
exports.SentimentAnalysisModule = SentimentAnalysisModule;
exports.SentimentAnalysisModule = SentimentAnalysisModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, auth_module_1.AuthModule],
        controllers: [sentiment_analysis_controller_1.SentimentAnalysisController],
        providers: [...sentimentProviders, sentiment_analysis_service_1.SentimentAnalysisService],
        exports: [
            sentiment_analysis_service_1.SentimentAnalysisService,
            gemini_sentiment_provider_1.GeminiSentimentProvider,
            lexicon_sentiment_provider_1.LexiconSentimentProvider,
        ],
    })
], SentimentAnalysisModule);
//# sourceMappingURL=sentiment-analysis.module.js.map