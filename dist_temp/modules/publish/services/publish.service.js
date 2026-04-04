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
var PublishService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const platform_adapter_factory_1 = require("../adapters/platform-adapter.factory");
const platform_adapter_interface_1 = require("../interfaces/platform-adapter.interface");
const wechat_formatter_service_1 = require("./wechat-formatter.service");
const ai_image_generator_service_1 = require("./ai-image-generator.service");
let PublishService = PublishService_1 = class PublishService {
    adapterFactory;
    eventEmitter;
    wechatFormatterService;
    aiImageGeneratorService;
    logger = new common_1.Logger(PublishService_1.name);
    adapters = new Map();
    platformConfigs = [];
    constructor(adapterFactory, eventEmitter, wechatFormatterService, aiImageGeneratorService) {
        this.adapterFactory = adapterFactory;
        this.eventEmitter = eventEmitter;
        this.wechatFormatterService = wechatFormatterService;
        this.aiImageGeneratorService = aiImageGeneratorService;
    }
    async onModuleInit() {
        this.logger.log('Initializing PublishService...');
        try {
            this.platformConfigs = await this.loadPlatformConfigs();
            this.adapters = this.adapterFactory.createAdapters(this.platformConfigs);
            await this.adapterFactory.initializeAdapters(this.adapters);
            this.logger.log(`PublishService initialized with ${this.adapters.size} platform adapters`);
        }
        catch (error) {
            this.logger.error(`Failed to initialize PublishService: ${error.message}`, error.stack);
        }
    }
    async onModuleDestroy() {
        this.logger.log('Cleaning up PublishService...');
        await this.adapterFactory.cleanupAdapters(this.adapters);
        this.adapters.clear();
    }
    async publishToPlatform(platformType, content) {
        this.logger.log(`Publishing content to platform: ${platformType}`);
        const adapter = this.getAdapter(platformType);
        if (!adapter) {
            throw new Error(`No adapter available for platform: ${platformType}`);
        }
        let processedContent = content;
        try {
            processedContent = await this.preprocessContent(platformType, content);
            this.eventEmitter.emit('publish.before', {
                platformType,
                content: processedContent,
                timestamp: new Date(),
            });
            const result = await adapter.publishContent(processedContent);
            this.eventEmitter.emit('publish.after', {
                platformType,
                content: processedContent,
                result,
                timestamp: new Date(),
            });
            await this.recordPublishResult(platformType, processedContent, result);
            this.logger.log(`Content published to ${platformType}, publishId: ${result.publishId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to publish content to ${platformType}: ${error.message}`, error.stack);
            this.eventEmitter.emit('publish.failed', {
                platformType,
                content: processedContent,
                error: error.message,
                timestamp: new Date(),
            });
            throw error;
        }
    }
    async publishToPlatforms(platformTypes, content) {
        this.logger.log(`Publishing content to ${platformTypes.length} platforms`);
        const results = new Map();
        const errors = [];
        const publishPromises = platformTypes.map(async (platformType) => {
            try {
                const result = await this.publishToPlatform(platformType, content);
                results.set(platformType, result);
            }
            catch (error) {
                errors.push({ platform: platformType, error: error.message });
                this.logger.error(`Failed to publish to ${platformType}: ${error.message}`);
            }
        });
        await Promise.allSettled(publishPromises);
        if (errors.length > 0) {
            this.logger.warn(`Publish completed with ${errors.length} errors out of ${platformTypes.length} platforms`);
            this.eventEmitter.emit('publish.partial_failure', {
                content,
                results: Array.from(results.entries()),
                errors,
                timestamp: new Date(),
            });
        }
        else {
            this.logger.log(`Successfully published to all ${platformTypes.length} platforms`);
        }
        return results;
    }
    async publishToAllPlatforms(content) {
        const enabledPlatforms = this.getEnabledPlatforms();
        return this.publishToPlatforms(enabledPlatforms, content);
    }
    async getPublishStatus(platformType, publishId) {
        const adapter = this.getAdapter(platformType);
        if (!adapter) {
            throw new Error(`No adapter available for platform: ${platformType}`);
        }
        return adapter.getPublishStatus(publishId);
    }
    async getPublishStatuses(publishRecords) {
        const statuses = new Map();
        const errors = [];
        const statusPromises = publishRecords.map(async (record) => {
            try {
                const status = await this.getPublishStatus(record.platformType, record.publishId);
                statuses.set(record.platformType, status);
            }
            catch (error) {
                errors.push({
                    platform: record.platformType,
                    publishId: record.publishId,
                    error: error.message,
                });
            }
        });
        await Promise.allSettled(statusPromises);
        if (errors.length > 0) {
            this.logger.warn(`Failed to get status for ${errors.length} publish records`);
        }
        return statuses;
    }
    async deleteContent(platformType, publishId) {
        const adapter = this.getAdapter(platformType);
        if (!adapter) {
            throw new Error(`No adapter available for platform: ${platformType}`);
        }
        try {
            await adapter.deleteContent(publishId);
            this.eventEmitter.emit('publish.deleted', {
                platformType,
                publishId,
                timestamp: new Date(),
            });
            this.logger.log(`Content deleted from ${platformType}, publishId: ${publishId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete content from ${platformType}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteContents(records) {
        const results = new Map();
        const deletePromises = records.map(async (record) => {
            try {
                await this.deleteContent(record.platformType, record.publishId);
                results.set(record.platformType, true);
            }
            catch (error) {
                this.logger.error(`Failed to delete content from ${record.platformType}: ${error.message}`);
                results.set(record.platformType, false);
            }
        });
        await Promise.allSettled(deletePromises);
        return results;
    }
    async getPlatformHealth(platformType) {
        const adapter = this.getAdapter(platformType);
        if (!adapter) {
            throw new Error(`No adapter available for platform: ${platformType}`);
        }
        return adapter.healthCheck();
    }
    async getAllPlatformsHealth() {
        const healthStatuses = new Map();
        for (const [platformType, adapter] of this.adapters.entries()) {
            try {
                const health = await adapter.healthCheck();
                healthStatuses.set(platformType, health);
            }
            catch (error) {
                this.logger.error(`Failed to get health for platform ${platformType}: ${error.message}`);
                healthStatuses.set(platformType, {
                    status: 'unhealthy',
                    message: `Failed to check health: ${error.message}`,
                    lastChecked: new Date(),
                });
            }
        }
        return healthStatuses;
    }
    async getPlatformStats(platformType) {
        const adapter = this.getAdapter(platformType);
        if (!adapter) {
            throw new Error(`No adapter available for platform: ${platformType}`);
        }
        return adapter.getPlatformStats();
    }
    async getAllPlatformsStats() {
        const stats = new Map();
        for (const [platformType, adapter] of this.adapters.entries()) {
            try {
                const platformStats = await adapter.getPlatformStats();
                stats.set(platformType, platformStats);
            }
            catch (error) {
                this.logger.error(`Failed to get stats for platform ${platformType}: ${error.message}`);
            }
        }
        return stats;
    }
    async addPlatformConfig(config) {
        const validation = this.adapterFactory.validateConfig(config);
        if (!validation.valid) {
            throw new Error(`Invalid platform config: ${validation.errors.join(', ')}`);
        }
        const existingIndex = this.platformConfigs.findIndex((c) => c.type === config.type);
        if (existingIndex >= 0) {
            this.platformConfigs[existingIndex] = config;
            this.logger.log(`Updated platform config for: ${config.type}`);
        }
        else {
            this.platformConfigs.push(config);
            this.logger.log(`Added new platform config for: ${config.type}`);
        }
        if (config.enabled) {
            const adapter = this.adapterFactory.createAdapter(config);
            await adapter.initialize();
            this.adapters.set(config.type, adapter);
            this.logger.log(`Adapter created and initialized for platform: ${config.type}`);
        }
        else {
            if (this.adapters.has(config.type)) {
                const adapter = this.adapters.get(config.type);
                await adapter.cleanup();
                this.adapters.delete(config.type);
                this.logger.log(`Adapter removed for disabled platform: ${config.type}`);
            }
        }
    }
    async removePlatformConfig(platformType) {
        if (this.adapters.has(platformType)) {
            const adapter = this.adapters.get(platformType);
            await adapter.cleanup();
            this.adapters.delete(platformType);
        }
        this.platformConfigs = this.platformConfigs.filter((c) => c.type !== platformType);
        this.logger.log(`Removed platform config for: ${platformType}`);
    }
    getPlatformConfigs() {
        return [...this.platformConfigs];
    }
    getEnabledPlatforms() {
        return this.platformConfigs
            .filter((config) => config.enabled)
            .map((config) => config.type);
    }
    getAdapter(platformType) {
        return this.adapters.get(platformType);
    }
    getAdapters() {
        return new Map(this.adapters);
    }
    async loadPlatformConfigs() {
        return [];
    }
    async recordPublishResult(platformType, content, result) {
        this.logger.log(`Publish recorded: ${platformType} - ${result.publishId} - ${result.status}`);
    }
    async preprocessContent(platformType, content) {
        const processedContent = { ...content };
        if (platformType === platform_adapter_interface_1.PlatformType.WECHAT) {
            try {
                const formatOptions = {
                    enableAdvancedFormatting: true,
                    enableQualityCheck: true,
                    generateImageSuggestions: true,
                };
                const formattedResult = await this.wechatFormatterService.formatContent(processedContent.content, formatOptions);
                processedContent.content = formattedResult.html;
                processedContent.metadata = {
                    ...processedContent.metadata,
                    wechatFormatting: {
                        qualityScore: formattedResult.qualityReport.score,
                        wordCount: formattedResult.wordCount,
                        imageCount: formattedResult.imageCount,
                        issues: formattedResult.qualityReport.issues,
                        suggestions: formattedResult.qualityReport.suggestions,
                        formattedAt: formattedResult.formattedAt,
                    },
                };
                if ((!processedContent.coverImages ||
                    processedContent.coverImages.length === 0) &&
                    formattedResult.qualityReport.score >= 60) {
                    try {
                        const imageSuggestions = await this.aiImageGeneratorService.generateImageSuggestions(formattedResult.plainText, 3);
                        if (imageSuggestions.length > 0) {
                            const bestSuggestion = imageSuggestions[0];
                            if (bestSuggestion.imageData || bestSuggestion.imageUrl) {
                                processedContent.metadata = {
                                    ...processedContent.metadata,
                                    aiImageSuggestions: imageSuggestions.map((suggestion) => ({
                                        prompt: suggestion.prompt,
                                        description: suggestion.description,
                                        relevanceScore: suggestion.relevanceScore,
                                        suggestedPosition: suggestion.suggestedPosition,
                                    })),
                                };
                                this.logger.log(`AI image suggestions generated for WeChat content: ${imageSuggestions.length} options`);
                            }
                        }
                    }
                    catch (imageError) {
                        this.logger.warn(`Failed to generate AI image suggestions: ${imageError.message}`);
                    }
                }
                this.logger.log(`WeChat content preprocessed: quality score ${formattedResult.qualityReport.score}`);
            }
            catch (formatError) {
                this.logger.error(`Failed to preprocess WeChat content: ${formatError.message}`, formatError.stack);
            }
        }
        return processedContent;
    }
    validatePublishContent(content) {
        const errors = [];
        if (!content.title || content.title.trim().length === 0) {
            errors.push('Content title is required');
        }
        if (!content.content || content.content.trim().length === 0) {
            errors.push('Content body is required');
        }
        if (content.title && content.title.length > 200) {
            errors.push('Content title must be less than 200 characters');
        }
        if (content.content && content.content.length > 10000) {
            errors.push('Content body must be less than 10000 characters');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
};
exports.PublishService = PublishService;
exports.PublishService = PublishService = PublishService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_adapter_factory_1.PlatformAdapterFactory,
        event_emitter_1.EventEmitter2,
        wechat_formatter_service_1.WechatFormatterService,
        ai_image_generator_service_1.AIImageGeneratorService])
], PublishService);
//# sourceMappingURL=publish.service.js.map