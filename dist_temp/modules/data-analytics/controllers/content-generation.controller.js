"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentGenerationController = void 0;
const common_1 = require("@nestjs/common");
const content_generation_service_1 = require("../services/content-generation.service");
const gemini_service_1 = require("../services/gemini.service");
const generate_text_dto_1 = require("../dto/generate-text.dto");
const generate_marketing_content_dto_1 = require("../dto/generate-marketing-content.dto");
const platform_enum_1 = require("../../../shared/enums/platform.enum");
let ContentGenerationController = class ContentGenerationController {
    contentGenerationService;
    geminiService;
    constructor(contentGenerationService, geminiService) {
        this.contentGenerationService = contentGenerationService;
        this.geminiService = geminiService;
    }
    async generateText(generateTextDto) {
        try {
            const result = await this.contentGenerationService.generateContent({
                prompt: generateTextDto.prompt,
                platform: generateTextDto.platform,
                tone: generateTextDto.tone,
                wordCount: generateTextDto.wordCount,
                includeHashtags: generateTextDto.includeHashtags,
                includeImageSuggestions: generateTextDto.includeImageSuggestions,
                temperature: generateTextDto.temperature,
                maxTokens: generateTextDto.maxTokens,
            });
            return {
                success: result.success,
                data: result.content,
                qualityAssessment: result.qualityAssessment,
                processingTime: result.processingTime,
                modelUsed: result.modelUsed,
                error: result.error,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'CONTROLLER_ERROR',
                    message: error.message || 'Failed to generate text',
                },
            };
        }
    }
    async generateMarketingContent(generateMarketingContentDto) {
        console.log('Received DTO:', JSON.stringify(generateMarketingContentDto));
        try {
            const campaignSummary = {
                id: generateMarketingContentDto.campaignId,
                name: generateMarketingContentDto.campaignName,
                campaignType: generateMarketingContentDto.campaignType,
                targetAudience: generateMarketingContentDto.targetAudience,
                budget: generateMarketingContentDto.budget,
                userId: generateMarketingContentDto.userId,
                startDate: generateMarketingContentDto.startDate
                    ? new Date(generateMarketingContentDto.startDate)
                    : undefined,
                endDate: generateMarketingContentDto.endDate
                    ? new Date(generateMarketingContentDto.endDate)
                    : undefined,
            };
            console.log('Generated campaignSummary:', JSON.stringify(campaignSummary));
            console.log('DTO targetAudience:', generateMarketingContentDto.targetAudience);
            const result = await this.contentGenerationService.generateMarketingContent({
                campaignSummary: campaignSummary,
                targetPlatforms: generateMarketingContentDto.targetPlatforms,
                contentTypes: generateMarketingContentDto.contentTypes,
                tone: generateMarketingContentDto.tone,
                quantity: generateMarketingContentDto.quantity,
            });
            return {
                success: result.success,
                marketingContent: result.marketingContent,
                processingTime: result.processingTime,
                modelUsed: result.modelUsed,
                error: result.error,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'CONTROLLER_ERROR',
                    message: error.message || 'Failed to generate marketing content',
                },
            };
        }
    }
    async getTemplates(platform) {
        try {
            let templates;
            if (platform) {
                templates =
                    this.contentGenerationService.getTemplatesByPlatform(platform);
            }
            else {
                templates = this.contentGenerationService.getAllTemplates();
            }
            return {
                success: true,
                data: templates,
                count: templates.length,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'CONTROLLER_ERROR',
                    message: error.message || 'Failed to get templates',
                },
            };
        }
    }
    async getStatus() {
        const isAvailable = this.geminiService.isGeminiAvailable();
        return {
            success: true,
            data: {
                geminiAvailable: isAvailable,
                service: 'content-generation',
                timestamp: new Date().toISOString(),
            },
        };
    }
    async getHealth() {
        const health = await this.geminiService.checkGeminiHealth();
        return {
            success: health.available,
            data: {
                geminiAvailable: health.available,
                timestamp: new Date().toISOString(),
                error: health.error,
                details: health.details,
            },
        };
    }
};
exports.ContentGenerationController = ContentGenerationController;
__decorate([
    (0, common_1.Post)('generate/text'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_text_dto_1.GenerateTextDto]),
    __metadata("design:returntype", Promise)
], ContentGenerationController.prototype, "generateText", null);
__decorate([
    (0, common_1.Post)('generate/marketing-content'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_marketing_content_dto_1.GenerateMarketingContentDto]),
    __metadata("design:returntype", Promise)
], ContentGenerationController.prototype, "generateMarketingContent", null);
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Query)('platform')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentGenerationController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentGenerationController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentGenerationController.prototype, "getHealth", null);
exports.ContentGenerationController = ContentGenerationController = __decorate([
    (0, common_1.Controller)('api/v1/content-generation'),
    __metadata("design:paramtypes", [content_generation_service_1.ContentGenerationService,
        gemini_service_1.GeminiService])
], ContentGenerationController);
//# sourceMappingURL=content-generation.controller.js.map