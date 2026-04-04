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
var ContentGenerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentGenerationService = void 0;
const common_1 = require("@nestjs/common");
const gemini_service_1 = require("./gemini.service");
const platform_enum_1 = require("../../../shared/enums/platform.enum");
let ContentGenerationService = ContentGenerationService_1 = class ContentGenerationService {
    geminiService;
    logger = new common_1.Logger(ContentGenerationService_1.name);
    contentTemplates = [
        {
            id: 'template-xhs-product',
            name: '小红书产品介绍模板',
            platform: platform_enum_1.Platform.XHS,
            templateType: 'product_intro',
            promptTemplate: '请为以下产品生成小红书风格的产品介绍文案：\n\n产品名称：{productName}\n产品特点：{productFeatures}\n目标人群：{targetAudience}\n\n要求：\n1. 突出产品核心卖点\n2. 使用亲切、真实的语气\n3. 包含Emoji和话题标签\n4. 提供使用场景建议',
            exampleOutput: '✨发现宝藏好物｜{productName}真的绝了！\n\n最近挖到的{productName}简直是我的心头好💕\n{productFeatures}\n\n适合人群：{targetAudience}\n\n#好物分享 #种草 #小红书好物',
            defaultTone: 'casual',
            suggestedHashtags: ['好物分享', '种草', '小红书好物'],
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
        },
        {
            id: 'template-wechat-article',
            name: '微信公众号文章模板',
            platform: platform_enum_1.Platform.WECHAT_MP,
            templateType: 'educational',
            promptTemplate: '请基于以下主题生成微信公众号文章：\n\n文章主题：{topic}\n核心观点：{mainPoints}\n目标读者：{targetReaders}\n\n要求：\n1. 结构清晰，有引言、正文、结论\n2. 提供有价值的深度内容\n3. 使用专业但易懂的语言\n4. 包含数据或案例支持',
            exampleOutput: '# {topic}\n\n## 引言\n{introduction}\n\n## 正文\n{mainContent}\n\n## 结论\n{conclusion}',
            defaultTone: 'professional',
            suggestedHashtags: [],
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
        },
        {
            id: 'template-promotional',
            name: '促销活动通用模板',
            platform: platform_enum_1.Platform.XHS,
            templateType: 'promotional',
            promptTemplate: '请为以下促销活动生成推广文案：\n\n活动名称：{campaignName}\n活动时间：{campaignPeriod}\n优惠内容：{offerDetails}\n参与方式：{participationMethod}\n\n要求：\n1. 突出优惠力度\n2. 营造紧迫感\n3. 清晰说明参与方式\n4. 吸引用户立即行动',
            exampleOutput: '🎉限时福利｜{campaignName}重磅来袭！\n\n活动时间：{campaignPeriod}\n优惠内容：{offerDetails}\n\n参与方式：{participationMethod}\n\n抓紧时间，错过等一年！\n\n#促销活动 #限时优惠 #福利',
            defaultTone: 'friendly',
            suggestedHashtags: ['促销活动', '限时优惠', '福利'],
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
        },
    ];
    constructor(geminiService) {
        this.geminiService = geminiService;
    }
    async generateContent(options) {
        this.logger.log(`Generating content for platform: ${options.platform}`);
        try {
            const result = await this.geminiService.generateContent(options);
            if (result.success && result.content) {
                const enhancedAssessment = this.enhanceQualityAssessment(result.qualityAssessment, result.content, options.platform);
                return {
                    ...result,
                    qualityAssessment: enhancedAssessment,
                };
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Content generation failed: ${error.message}`);
            return {
                success: false,
                error: {
                    code: 'SERVICE_ERROR',
                    message: 'Content generation service error',
                    details: error.message,
                },
            };
        }
    }
    async generateMarketingContent(options) {
        this.logger.log(`Generating marketing content for campaign: ${options.campaignSummary.name}`);
        try {
            const result = await this.geminiService.generateMarketingContent(options);
            if (result.success && result.marketingContent) {
                const consistencyScore = this.evaluateCrossPlatformConsistency(result.marketingContent.contents);
                const optimizedSchedule = this.optimizePostingSchedule(result.marketingContent.recommendedPostingSchedule, options.campaignSummary);
                const enhancedMarketingContent = {
                    ...result.marketingContent,
                    consistencyScore,
                    recommendedPostingSchedule: optimizedSchedule,
                };
                return {
                    ...result,
                    marketingContent: enhancedMarketingContent,
                };
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Marketing content generation failed: ${error.message}`);
            return {
                success: false,
                error: {
                    code: 'SERVICE_ERROR',
                    message: 'Marketing content generation service error',
                    details: error.message,
                },
            };
        }
    }
    async generateContentWithTemplate(templateId, templateVariables, customOptions) {
        this.logger.log(`Generating content with template: ${templateId}`);
        const template = this.contentTemplates.find((t) => t.id === templateId);
        if (!template) {
            return {
                success: false,
                error: {
                    code: 'TEMPLATE_NOT_FOUND',
                    message: `Content template not found: ${templateId}`,
                },
            };
        }
        try {
            let prompt = template.promptTemplate;
            for (const [key, value] of Object.entries(templateVariables)) {
                prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
            }
            const options = {
                prompt,
                platform: template.platform,
                tone: customOptions?.tone || template.defaultTone || 'casual',
                includeHashtags: true,
                includeImageSuggestions: true,
                ...customOptions,
            };
            const result = await this.generateContent(options);
            if (result.success && result.content) {
                if (template.suggestedHashtags &&
                    template.suggestedHashtags.length > 0) {
                    const existingHashtags = result.content.hashtags || [];
                    const combinedHashtags = [
                        ...new Set([...existingHashtags, ...template.suggestedHashtags]),
                    ];
                    result.content.hashtags = combinedHashtags;
                }
                result.content.templateId = templateId;
                result.content.templateName = template.name;
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Template-based content generation failed: ${error.message}`);
            return {
                success: false,
                error: {
                    code: 'TEMPLATE_ERROR',
                    message: 'Error processing template',
                    details: error.message,
                },
            };
        }
    }
    async batchGenerateContent(optionsList) {
        this.logger.log(`Batch generating ${optionsList.length} content items`);
        const results = [];
        for (const options of optionsList) {
            try {
                const result = await this.generateContent(options);
                results.push(result);
            }
            catch (error) {
                this.logger.error(`Batch item failed: ${error.message}`);
                results.push({
                    success: false,
                    error: {
                        code: 'BATCH_ITEM_ERROR',
                        message: 'Batch generation item failed',
                        details: error.message,
                    },
                });
            }
        }
        return results;
    }
    async assessContentQuality(content, platform) {
        this.logger.log(`Assessing content quality for platform: ${platform}`);
        const baseAssessment = this.performBaseQualityAssessment(content, platform);
        const platformSpecificScore = this.evaluatePlatformSpecificQuality(content, platform);
        const finalScore = Math.round(baseAssessment.score * 0.6 + platformSpecificScore * 0.4);
        const improvementSuggestions = this.generateDetailedImprovementSuggestions(content, platform, finalScore);
        return {
            score: finalScore,
            metrics: {
                ...baseAssessment.metrics,
                platformFit: platformSpecificScore,
            },
            feedback: this.generateDetailedFeedback(finalScore, content, platform),
            improvementSuggestions,
        };
    }
    getAllTemplates() {
        return [...this.contentTemplates];
    }
    getTemplatesByPlatform(platform) {
        return this.contentTemplates.filter((template) => template.platform === platform);
    }
    getTemplatesByType(templateType) {
        return this.contentTemplates.filter((template) => template.templateType === templateType);
    }
    addTemplate(template) {
        const newTemplate = {
            ...template,
            id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.contentTemplates.push(newTemplate);
        this.logger.log(`New template added: ${newTemplate.id}`);
        return newTemplate;
    }
    updateTemplate(templateId, updates) {
        const templateIndex = this.contentTemplates.findIndex((t) => t.id === templateId);
        if (templateIndex === -1) {
            return null;
        }
        const updatedTemplate = {
            ...this.contentTemplates[templateIndex],
            ...updates,
            updatedAt: new Date(),
        };
        this.contentTemplates[templateIndex] = updatedTemplate;
        this.logger.log(`Template updated: ${templateId}`);
        return updatedTemplate;
    }
    deleteTemplate(templateId) {
        const initialLength = this.contentTemplates.length;
        this.contentTemplates = this.contentTemplates.filter((t) => t.id !== templateId);
        const deleted = this.contentTemplates.length < initialLength;
        if (deleted) {
            this.logger.log(`Template deleted: ${templateId}`);
        }
        return deleted;
    }
    enhanceQualityAssessment(baseAssessment, content, platform) {
        if (!baseAssessment) {
            return this.performBaseQualityAssessment(content, platform);
        }
        const engagementPotential = this.evaluateEngagementPotential(content);
        const conversionPotential = this.evaluateConversionPotential(content, platform);
        const enhancedScore = Math.round(baseAssessment.score * 0.7 +
            engagementPotential * 0.15 +
            conversionPotential * 0.15);
        const enhancedMetrics = {
            ...baseAssessment.metrics,
            engagementPotential,
            conversionPotential,
        };
        const enhancedFeedback = this.generateEnhancedFeedback(baseAssessment.feedback, engagementPotential, conversionPotential);
        return {
            score: enhancedScore,
            metrics: enhancedMetrics,
            feedback: enhancedFeedback,
            improvementSuggestions: baseAssessment.improvementSuggestions,
        };
    }
    performBaseQualityAssessment(content, platform) {
        const wordCount = content.wordCount || 0;
        const titleLength = content.title?.length || 0;
        const hashtagCount = content.hashtags?.length || 0;
        let score = 50;
        if (wordCount > 100 && wordCount < 1000)
            score += 10;
        if (titleLength > 5 && titleLength < 50)
            score += 10;
        if (hashtagCount >= 3 && hashtagCount <= 10)
            score += 10;
        if (content.content && content.content.length > 0)
            score += 20;
        const platformFit = this.evaluatePlatformFit(content, platform);
        score += platformFit / 2;
        score = Math.max(0, Math.min(100, score));
        return {
            score,
            metrics: {
                readability: Math.min(100, score + 10),
                engagement: Math.min(100, score + 5),
                relevance: Math.min(100, score + 15),
                originality: Math.min(100, score),
                platformFit,
            },
            feedback: `内容质量评估：${score}/100`,
            improvementSuggestions: this.generateBasicImprovementSuggestions(content, platform, score),
        };
    }
    evaluatePlatformFit(content, platform) {
        switch (platform) {
            case platform_enum_1.Platform.XHS: {
                const hasEmoji = /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(content.content);
                const paragraphCount = (content.content.match(/\n\n/g) || []).length;
                return (hasEmoji ? 20 : 0) + (paragraphCount > 1 ? 15 : 0) + 50;
            }
            case platform_enum_1.Platform.WECHAT_MP: {
                const hasStructure = /#{1,3}\s/.test(content.content) || content.content.includes('\n\n');
                const isLongForm = (content.wordCount || 0) > 500;
                return (hasStructure ? 20 : 0) + (isLongForm ? 15 : 0) + 55;
            }
            default:
                return 60;
        }
    }
    evaluatePlatformSpecificQuality(content, platform) {
        switch (platform) {
            case platform_enum_1.Platform.XHS: {
                const interactiveElements = this.countInteractiveElements(content.content);
                const visualElements = content.suggestedImages?.length || 0;
                const trendingKeywords = this.checkTrendingKeywords(content.content, content.hashtags || []);
                return Math.min(100, 50 +
                    interactiveElements * 5 +
                    visualElements * 3 +
                    trendingKeywords * 2);
            }
            case platform_enum_1.Platform.WECHAT_MP: {
                const depthScore = this.evaluateContentDepth(content.content);
                const professionalTerms = this.countProfessionalTerms(content.content);
                const valueScore = this.evaluateContentValue(content.content);
                return Math.min(100, 55 + depthScore * 10 + professionalTerms * 2 + valueScore * 8);
            }
            default:
                return 60;
        }
    }
    evaluateCrossPlatformConsistency(contents) {
        if (contents.length <= 1)
            return 100;
        const themes = contents.map((c) => this.extractMainTheme(c.content));
        const firstTheme = themes[0];
        let matchingThemes = 0;
        for (const theme of themes) {
            if (theme === firstTheme ||
                this.calculateThemeSimilarity(theme, firstTheme) > 0.5) {
                matchingThemes++;
            }
        }
        const consistency = (matchingThemes / contents.length) * 100;
        return Math.round(consistency);
    }
    optimizePostingSchedule(schedule, campaignSummary) {
        const budget = campaignSummary.budget || 0;
        const campaignType = campaignSummary.campaignType;
        return schedule.map((item) => {
            const bestTimes = [...item.bestTimes];
            let frequency = item.frequency;
            if (budget > 50000) {
                frequency = this.increaseFrequency(frequency);
            }
            else if (budget < 10000) {
                frequency = this.decreaseFrequency(frequency);
            }
            if (campaignType === 'ONLINE') {
                if (!bestTimes.some((t) => t.includes('20:00'))) {
                    bestTimes.push('20:00-22:00');
                }
            }
            return {
                ...item,
                bestTimes,
                frequency,
            };
        });
    }
    evaluateEngagementPotential(content) {
        let score = 50;
        const hasQuestions = /\?/.test(content.content);
        if (hasQuestions)
            score += 10;
        const hasCallToAction = /欢迎|分享|评论|点赞|关注/.test(content.content);
        if (hasCallToAction)
            score += 10;
        const emotionalWords = this.countEmotionalWords(content.content);
        score += Math.min(15, emotionalWords * 3);
        return Math.min(100, score);
    }
    evaluateConversionPotential(content, platform) {
        let score = 40;
        const purchaseWords = this.countPurchaseWords(content.content);
        score += Math.min(20, purchaseWords * 4);
        const hasDiscount = /优惠|折扣|促销|特价|福利/.test(content.content);
        if (hasDiscount)
            score += 10;
        if (platform === platform_enum_1.Platform.XHS) {
            const seedingWords = this.countSeedingWords(content.content);
            score += Math.min(15, seedingWords * 3);
        }
        return Math.min(100, score);
    }
    generateDetailedFeedback(score, content, platform) {
        if (score >= 85) {
            return `优秀！您的内容在${platform}平台上表现出色，预计会有很高的参与度和转化效果。`;
        }
        else if (score >= 70) {
            return `良好！内容质量不错，但在${platform}平台的某些特定优化方面还有提升空间。`;
        }
        else if (score >= 60) {
            return `合格！基本符合${platform}平台的要求，建议根据改进建议进行优化。`;
        }
        else {
            return `需要改进！内容在${platform}平台上的适配度不足，建议重新构思或大幅修改。`;
        }
    }
    generateEnhancedFeedback(baseFeedback, engagementPotential, conversionPotential) {
        let feedback = baseFeedback;
        if (engagementPotential >= 80) {
            feedback += ' 内容具有很强的互动潜力，预计用户参与度会很高。';
        }
        if (conversionPotential >= 80) {
            feedback += ' 内容转化潜力优秀，有望带来明显的业务效果。';
        }
        else if (conversionPotential < 60) {
            feedback += ' 建议加强转化相关元素的设置。';
        }
        return feedback;
    }
    generateBasicImprovementSuggestions(content, platform, score) {
        const suggestions = [];
        if (score < 70) {
            suggestions.push('增加内容长度和细节描述');
            suggestions.push('优化标题吸引力');
        }
        if ((content.hashtags || []).length < 3) {
            suggestions.push('添加更多相关话题标签');
        }
        switch (platform) {
            case platform_enum_1.Platform.XHS:
                if (!content.content.includes('✨') &&
                    !content.content.includes('💕')) {
                    suggestions.push('考虑添加Emoji增强视觉吸引力');
                }
                break;
            case platform_enum_1.Platform.WECHAT_MP:
                if (!content.content.includes('\n\n')) {
                    suggestions.push('使用更多段落提高可读性');
                }
                break;
        }
        return suggestions.slice(0, 3);
    }
    generateDetailedImprovementSuggestions(content, platform, score) {
        const suggestions = this.generateBasicImprovementSuggestions(content, platform, score);
        if (score < 80) {
            suggestions.push('检查并优化开头段落，确保立即吸引读者');
            suggestions.push('增加数据或案例支持，提升可信度');
        }
        if (platform === platform_enum_1.Platform.XHS && score < 75) {
            suggestions.push('尝试使用更多互动式问题句');
            suggestions.push('考虑添加用户证言或使用场景');
        }
        if (platform === platform_enum_1.Platform.WECHAT_MP && score < 75) {
            suggestions.push('添加小标题，改善内容结构');
            suggestions.push('考虑加入相关数据图表或统计信息');
        }
        return suggestions.slice(0, 5);
    }
    increaseFrequency(frequency) {
        if (frequency.includes('每周')) {
            const match = frequency.match(/\d+/);
            if (match) {
                const current = parseInt(match[0], 10);
                return `每周${current + 2}次`;
            }
        }
        return frequency;
    }
    decreaseFrequency(frequency) {
        if (frequency.includes('每周')) {
            const match = frequency.match(/\d+/);
            if (match) {
                const current = parseInt(match[0], 10);
                return `每周${Math.max(1, current - 1)}次`;
            }
        }
        return frequency;
    }
    countInteractiveElements(text) {
        const patterns = [
            /\?/g,
            /欢迎|分享|评论|点赞|关注/g,
            /投票|问卷|测试/g,
        ];
        let count = 0;
        for (const pattern of patterns) {
            const matches = text.match(pattern);
            count += matches ? matches.length : 0;
        }
        return count;
    }
    checkTrendingKeywords(text, hashtags) {
        const trendingKeywords = [
            '爆款',
            '热门',
            '网红',
            '必买',
            '推荐',
            '新品',
            '限时',
            '独家',
            '必备',
            '神器',
        ];
        const allText = text + ' ' + hashtags.join(' ');
        let count = 0;
        for (const keyword of trendingKeywords) {
            if (allText.includes(keyword)) {
                count++;
            }
        }
        return count;
    }
    evaluateContentDepth(text) {
        const paragraphCount = (text.match(/\n\n/g) || []).length;
        const sentenceCount = (text.match(/[。！？]/g) || []).length;
        const wordCount = text.length;
        if (wordCount > 1000 && paragraphCount > 5 && sentenceCount > 20) {
            return 1.0;
        }
        else if (wordCount > 500 && paragraphCount > 3 && sentenceCount > 10) {
            return 0.7;
        }
        else if (wordCount > 200 && paragraphCount > 1 && sentenceCount > 5) {
            return 0.4;
        }
        return 0.2;
    }
    countProfessionalTerms(text) {
        const professionalTerms = [
            '策略',
            '方案',
            '优化',
            '效果',
            '指标',
            '转化',
            '留存',
            '增长',
            '漏斗',
            'ROI',
            'KPI',
            'UV',
            'PV',
            'CTR',
            'CPA',
        ];
        let count = 0;
        for (const term of professionalTerms) {
            if (text.includes(term)) {
                count++;
            }
        }
        return count;
    }
    evaluateContentValue(text) {
        const valueIndicators = [
            '如何',
            '教程',
            '指南',
            '步骤',
            '方法',
            '技巧',
            '经验',
            '案例',
            '数据',
            '分析',
            '建议',
            '解决方案',
            '最佳实践',
        ];
        let count = 0;
        for (const indicator of valueIndicators) {
            if (text.includes(indicator)) {
                count++;
            }
        }
        if (count >= 5)
            return 1.0;
        if (count >= 3)
            return 0.7;
        if (count >= 1)
            return 0.4;
        return 0.1;
    }
    extractMainTheme(text) {
        const sentences = text.split(/[。！？]/);
        if (sentences.length === 0)
            return '未知主题';
        return sentences[0].substring(0, 50);
    }
    calculateThemeSimilarity(theme1, theme2) {
        const words1 = new Set(theme1.toLowerCase().split(/\W+/));
        const words2 = new Set(theme2.toLowerCase().split(/\W+/));
        const intersection = new Set([...words1].filter((x) => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return union.size === 0 ? 0 : intersection.size / union.size;
    }
    countEmotionalWords(text) {
        const emotionalWords = [
            '惊喜',
            '感动',
            '开心',
            '幸福',
            '满意',
            '期待',
            '兴奋',
            '激动',
            '温暖',
            '美好',
            '值得',
            '推荐',
            '喜欢',
            '爱',
            '赞',
        ];
        let count = 0;
        for (const word of emotionalWords) {
            if (text.includes(word)) {
                count++;
            }
        }
        return count;
    }
    countPurchaseWords(text) {
        const purchaseWords = [
            '购买',
            '下单',
            '订购',
            '抢购',
            '秒杀',
            '优惠',
            '折扣',
            '促销',
            '特价',
            '省钱',
            '划算',
            '超值',
            '性价比',
            '包邮',
            '赠品',
        ];
        let count = 0;
        for (const word of purchaseWords) {
            if (text.includes(word)) {
                count++;
            }
        }
        return count;
    }
    countSeedingWords(text) {
        const seedingWords = [
            '种草',
            '拔草',
            '安利',
            '推荐',
            '必入',
            '宝藏',
            '神仙',
            '绝了',
            '好用',
            '回购',
            '无限回购',
            '空瓶',
            '铁皮',
            '心头好',
            '真爱',
        ];
        let count = 0;
        for (const word of seedingWords) {
            if (text.includes(word)) {
                count++;
            }
        }
        return count;
    }
};
exports.ContentGenerationService = ContentGenerationService;
exports.ContentGenerationService = ContentGenerationService = ContentGenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => gemini_service_1.GeminiService))),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService])
], ContentGenerationService);
//# sourceMappingURL=content-generation.service.js.map