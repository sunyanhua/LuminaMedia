"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SeoSuggestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoSuggestionService = void 0;
const common_1 = require("@nestjs/common");
let SeoSuggestionService = SeoSuggestionService_1 = class SeoSuggestionService {
    logger = new common_1.Logger(SeoSuggestionService_1.name);
    async generateSuggestions(regions, request) {
        this.logger.log(`Generating SEO suggestions for ${regions.length} regions`);
        const seoSuggestions = {
            keywordOpportunities: [],
            contentLocalization: {
                culturalElements: [],
                languageAdaptations: [],
                localReferences: [],
                seasonalContent: [],
            },
            channelRecommendations: [],
            technicalOptimizations: [],
        };
        for (const region of regions) {
            const keywordOpportunities = this.analyzeKeywordOpportunities(region, request);
            seoSuggestions.keywordOpportunities.push(...keywordOpportunities);
            const localizationSuggestions = this.generateLocalizationSuggestions(region);
            seoSuggestions.contentLocalization.culturalElements.push(...localizationSuggestions.culturalElements);
            seoSuggestions.contentLocalization.languageAdaptations.push(...localizationSuggestions.languageAdaptations);
            seoSuggestions.contentLocalization.localReferences.push(...localizationSuggestions.localReferences);
            seoSuggestions.contentLocalization.seasonalContent.push(...localizationSuggestions.seasonalContent);
            const channelRecommendations = this.recommendChannels(region);
            seoSuggestions.channelRecommendations.push(...channelRecommendations);
            const technicalOptimizations = this.suggestTechnicalOptimizations(region);
            seoSuggestions.technicalOptimizations.push(...technicalOptimizations);
        }
        seoSuggestions.keywordOpportunities = this.deduplicateAndRankKeywords(seoSuggestions.keywordOpportunities);
        seoSuggestions.channelRecommendations = this.deduplicateAndRankChannels(seoSuggestions.channelRecommendations);
        seoSuggestions.technicalOptimizations =
            this.prioritizeTechnicalOptimizations(seoSuggestions.technicalOptimizations);
        return seoSuggestions;
    }
    analyzeKeywordOpportunities(region, request) {
        const opportunities = [];
        const baseKeywords = this.generateBaseKeywords(region, request);
        baseKeywords.forEach((keyword) => {
            opportunities.push({
                keyword,
                searchVolume: this.estimateSearchVolume(keyword, region),
                competition: this.assessKeywordCompetition(keyword, region),
                opportunityScore: this.calculateOpportunityScore(keyword, region),
                suggestedActions: this.suggestKeywordActions(keyword, region),
            });
        });
        const longTailKeywords = this.generateLongTailKeywords(region, request);
        longTailKeywords.forEach((keyword) => {
            opportunities.push({
                keyword,
                searchVolume: this.estimateSearchVolume(keyword, region),
                competition: this.assessKeywordCompetition(keyword, region),
                opportunityScore: this.calculateOpportunityScore(keyword, region),
                suggestedActions: this.suggestKeywordActions(keyword, region),
            });
        });
        const questionKeywords = this.generateQuestionKeywords(region, request);
        questionKeywords.forEach((keyword) => {
            opportunities.push({
                keyword,
                searchVolume: this.estimateSearchVolume(keyword, region),
                competition: this.assessKeywordCompetition(keyword, region),
                opportunityScore: this.calculateOpportunityScore(keyword, region),
                suggestedActions: this.suggestKeywordActions(keyword, region),
            });
        });
        return opportunities;
    }
    generateBaseKeywords(region, request) {
        const keywords = [];
        if (request.industries) {
            request.industries.forEach((industry) => {
                keywords.push(`${region.name}${industry}`);
                keywords.push(`${industry} ${region.name}`);
                keywords.push(`${region.name}${industry}服务`);
                keywords.push(`${region.name}${industry}公司`);
            });
        }
        const productsServices = this.inferProductsServices(region, request);
        productsServices.forEach((product) => {
            keywords.push(`${region.name}${product}`);
            keywords.push(`${product} ${region.name}`);
        });
        keywords.push(`${region.name}解决方案`);
        keywords.push(`${region.name}专业服务`);
        return keywords.slice(0, 10);
    }
    generateLongTailKeywords(region, request) {
        const keywords = [];
        if (request.industries) {
            request.industries.forEach((industry) => {
                keywords.push(`${region.name}${industry}哪家好`);
                keywords.push(`${region.name}${industry}价格`);
                keywords.push(`${region.name}${industry}怎么样`);
                keywords.push(`${region.name}${industry}推荐`);
            });
        }
        keywords.push(`${region.name}最好的`);
        keywords.push(`${region.name}性价比最高的`);
        keywords.push(`${region.name}专业`);
        const needs = this.identifyRegionalNeeds(region);
        needs.forEach((need) => {
            keywords.push(`${region.name}${need}`);
            keywords.push(`${need} ${region.name}`);
        });
        return keywords.slice(0, 15);
    }
    generateQuestionKeywords(region, request) {
        const keywords = [];
        if (request.industries) {
            request.industries.forEach((industry) => {
                keywords.push(`如何在${region.name}选择${industry}`);
                keywords.push(`${region.name}${industry}怎么选`);
                keywords.push(`${region.name}${industry}注意事项`);
            });
        }
        keywords.push(`${region.name}有什么优势`);
        keywords.push(`${region.name}哪些公司好`);
        keywords.push(`${region.name}特点是什么`);
        keywords.push(`为什么选择${region.name}`);
        keywords.push(`${region.name}的优势在哪里`);
        return keywords.slice(0, 10);
    }
    generateLocalizationSuggestions(region) {
        return {
            culturalElements: this.identifyCulturalElements(region),
            languageAdaptations: this.suggestLanguageAdaptations(region),
            localReferences: this.suggestLocalReferences(region),
            seasonalContent: this.suggestSeasonalContent(region),
        };
    }
    recommendChannels(region) {
        const recommendations = [];
        if (region.digitalInfrastructure) {
            if (region.digitalInfrastructure.socialMediaUsage) {
                Object.entries(region.digitalInfrastructure.socialMediaUsage).forEach(([platform, usage]) => {
                    if (Number(usage) > 30) {
                        recommendations.push({
                            channel: platform,
                            reach: Number(usage),
                            engagement: this.estimateEngagement(platform, region),
                            costEffectiveness: this.assessCostEffectiveness(platform, region),
                            recommendedActions: this.suggestChannelActions(platform, region),
                        });
                    }
                });
            }
            if (region.digitalInfrastructure.ecommercePlatforms) {
                region.digitalInfrastructure.ecommercePlatforms.forEach((platform) => {
                    recommendations.push({
                        channel: platform,
                        reach: this.estimateEcommerceReach(platform, region),
                        engagement: 65,
                        costEffectiveness: 'medium',
                        recommendedActions: [
                            `在${platform}开设官方店铺`,
                            `优化${platform}商品详情页`,
                            `参与${platform}促销活动`,
                        ],
                    });
                });
            }
        }
        if (region.consumerBehavior?.preferredChannels) {
            region.consumerBehavior.preferredChannels.forEach((channel) => {
                if (!recommendations.some((rec) => rec.channel === channel)) {
                    recommendations.push({
                        channel,
                        reach: 70,
                        engagement: 60,
                        costEffectiveness: 'high',
                        recommendedActions: [
                            `加强${channel}渠道建设`,
                            `优化${channel}用户体验`,
                            `跟踪${channel}转化效果`,
                        ],
                    });
                }
            });
        }
        return recommendations;
    }
    suggestTechnicalOptimizations(region) {
        const optimizations = [];
        if (region.digitalInfrastructure?.smartphonePenetration &&
            region.digitalInfrastructure.smartphonePenetration > 0.7) {
            optimizations.push({
                area: '移动端优化',
                currentStatus: '待优化',
                recommendation: '实现响应式设计，优化移动端加载速度',
                priority: 'high',
                expectedImpact: '提升移动端用户体验，增加移动流量',
            });
        }
        optimizations.push({
            area: '本地化SEO',
            currentStatus: '基础',
            recommendation: `添加${region.name}地区页面，优化地区相关元标签`,
            priority: 'medium',
            expectedImpact: `提升在${region.name}地区的搜索排名`,
        });
        optimizations.push({
            area: '页面性能',
            currentStatus: '待评估',
            recommendation: '压缩图片，减少HTTP请求，启用浏览器缓存',
            priority: 'medium',
            expectedImpact: '提升页面加载速度，改善用户体验',
        });
        optimizations.push({
            area: '结构化数据',
            currentStatus: '未实施',
            recommendation: '添加本地业务结构化数据，丰富搜索结果展示',
            priority: 'low',
            expectedImpact: '增强搜索结果吸引力，提升点击率',
        });
        return optimizations;
    }
    inferProductsServices(region, request) {
        const productsServices = [];
        if (request.industries) {
            request.industries.forEach((industry) => {
                if (industry.includes('科技')) {
                    productsServices.push('软件开发', '技术支持', 'IT咨询');
                }
                else if (industry.includes('零售')) {
                    productsServices.push('商品销售', '零售服务', '购物体验');
                }
                else if (industry.includes('服务')) {
                    productsServices.push('专业服务', '咨询服务', '定制服务');
                }
                else {
                    productsServices.push(`${industry}服务`, `${industry}解决方案`);
                }
            });
        }
        if (region.economicIndicators) {
            if (region.economicIndicators.tertiaryIndustry > 50) {
                productsServices.push('商业服务', '专业咨询', '金融服务');
            }
            if (region.economicIndicators.secondaryIndustry > 40) {
                productsServices.push('工业产品', '制造服务', '供应链服务');
            }
        }
        if (region.consumerBehavior?.favoriteCategories) {
            productsServices.push(...region.consumerBehavior.favoriteCategories);
        }
        return [...new Set(productsServices)].slice(0, 8);
    }
    identifyRegionalNeeds(region) {
        const needs = [];
        if (region.gdpPerCapita) {
            if (region.gdpPerCapita < 20000) {
                needs.push('性价比产品', '基础服务', '实用解决方案');
            }
            else if (region.gdpPerCapita < 50000) {
                needs.push('品质产品', '专业服务', '个性化解决方案');
            }
            else {
                needs.push('高端产品', '定制服务', '创新解决方案');
            }
        }
        if (region.digitalInfrastructure?.internetPenetration) {
            if (region.digitalInfrastructure.internetPenetration < 0.5) {
                needs.push('线下服务', '实体体验', '传统渠道产品');
            }
            else if (region.digitalInfrastructure.internetPenetration < 0.8) {
                needs.push('线上线下结合', '数字化服务', '便捷解决方案');
            }
            else {
                needs.push('纯线上服务', '智能产品', '创新科技解决方案');
            }
        }
        if (region.culturalData?.customs) {
            if (region.culturalData.customs.some((c) => c.includes('传统') || c.includes('保守'))) {
                needs.push('可靠产品', '稳定服务', '经过验证的解决方案');
            }
            if (region.culturalData.customs.some((c) => c.includes('创新') || c.includes('开放'))) {
                needs.push('创新产品', '前沿服务', '突破性解决方案');
            }
        }
        return needs.length > 0 ? needs : ['优质产品', '可靠服务', '全面解决方案'];
    }
    estimateSearchVolume(keyword, region) {
        let volume = 100;
        if (keyword.length > 10)
            volume *= 0.3;
        else if (keyword.length > 6)
            volume *= 0.6;
        if (region.population) {
            volume *= Math.min(region.population / 1000000, 10);
        }
        if (region.digitalInfrastructure?.internetPenetration) {
            volume *= region.digitalInfrastructure.internetPenetration * 1.5;
        }
        if (keyword.includes('如何') ||
            keyword.includes('怎么') ||
            keyword.includes('为什么')) {
            volume *= 0.5;
        }
        return Math.round(volume);
    }
    assessKeywordCompetition(keyword, region) {
        let competitionScore = 0;
        if (keyword.length <= 4)
            competitionScore += 3;
        else if (keyword.length <= 6)
            competitionScore += 2;
        else if (keyword.length <= 8)
            competitionScore += 1;
        const commercialTerms = [
            '公司',
            '服务',
            '价格',
            '购买',
            '销售',
            '代理',
            '加盟',
        ];
        if (commercialTerms.some((term) => keyword.includes(term))) {
            competitionScore += 2;
        }
        if (region.competitionIntensity) {
            competitionScore += Math.round(region.competitionIntensity * 3);
        }
        if (competitionScore >= 4)
            return 'high';
        if (competitionScore >= 2)
            return 'medium';
        return 'low';
    }
    calculateOpportunityScore(keyword, region) {
        const searchVolume = this.estimateSearchVolume(keyword, region);
        const competition = this.assessKeywordCompetition(keyword, region);
        let opportunity = searchVolume;
        switch (competition) {
            case 'low':
                opportunity *= 1.5;
                break;
            case 'medium':
                opportunity *= 1.0;
                break;
            case 'high':
                opportunity *= 0.5;
                break;
        }
        const commercialTerms = ['公司', '服务', '价格', '购买', '销售'];
        if (commercialTerms.some((term) => keyword.includes(term))) {
            opportunity *= 1.3;
        }
        if (keyword.length > 8) {
            opportunity *= 1.2;
        }
        return Math.min(100, Math.round(opportunity / 10));
    }
    suggestKeywordActions(keyword, region) {
        const actions = [];
        actions.push(`创建针对"${keyword}"的专题页面`);
        actions.push(`在现有页面中自然融入"${keyword}"`);
        if (keyword.includes('如何') || keyword.includes('怎么')) {
            actions.push(`创作"${keyword}"教程类文章`);
            actions.push(`制作"${keyword}"视频教程`);
        }
        else if (keyword.includes('为什么') || keyword.includes('原因')) {
            actions.push(`撰写"${keyword}"分析文章`);
            actions.push(`创建"${keyword}"常见问题解答`);
        }
        else {
            actions.push(`撰写"${keyword}"详细介绍`);
            actions.push(`创建"${keyword}"产品/服务页面`);
        }
        actions.push(`添加${region.name}地区相关内容`);
        return actions.slice(0, 4);
    }
    identifyCulturalElements(region) {
        const elements = [];
        if (region.culturalData) {
            if (region.culturalData.dominantLanguage) {
                elements.push(`使用${region.culturalData.dominantLanguage}`);
            }
            if (region.culturalData.dialects &&
                region.culturalData.dialects.length > 0) {
                elements.push(`考虑${region.culturalData.dialects[0]}方言表达`);
            }
            if (region.culturalData.festivals &&
                region.culturalData.festivals.length > 0) {
                elements.push(`融入${region.culturalData.festivals[0]}节庆元素`);
            }
            if (region.culturalData.customs &&
                region.culturalData.customs.length > 0) {
                elements.push(`尊重${region.culturalData.customs[0]}等当地习俗`);
            }
        }
        if (elements.length === 0) {
            elements.push('使用当地常见表达方式');
            elements.push('考虑地方文化特色');
            elements.push('尊重当地传统价值观');
        }
        return elements;
    }
    suggestLanguageAdaptations(region) {
        const adaptations = [];
        if (region.culturalData?.dialects &&
            region.culturalData.dialects.length > 0) {
            adaptations.push(`提供${region.culturalData.dialects[0]}方言版本`);
            adaptations.push(`使用${region.culturalData.dialects[0]}特色词汇`);
        }
        adaptations.push('采用当地人熟悉的表达方式');
        adaptations.push('避免可能引起误解的词汇');
        adaptations.push('使用当地常用的称呼方式');
        adaptations.push('遵循当地的礼貌用语习惯');
        return adaptations;
    }
    suggestLocalReferences(region) {
        const references = [];
        references.push(`提及${region.name}的知名地标`);
        references.push(`关联${region.name}的特色景点`);
        references.push(`引用${region.name}的知名企业`);
        references.push(`提及${region.name}的重要机构`);
        references.push(`引用${region.name}的行业专家`);
        references.push(`提及${region.name}的成功案例`);
        references.push(`关联${region.name}的近期活动`);
        references.push(`提及${region.name}的发展规划`);
        return references;
    }
    suggestSeasonalContent(region) {
        const seasonalContent = [];
        if (region.culturalData?.festivals) {
            region.culturalData.festivals.forEach((festival) => {
                seasonalContent.push(`${festival}特别促销`);
                seasonalContent.push(`${festival}主题内容`);
                seasonalContent.push(`${festival}文化解读`);
            });
        }
        seasonalContent.push('春季新品推广');
        seasonalContent.push('夏季清凉特辑');
        seasonalContent.push('秋季收获主题');
        seasonalContent.push('冬季温暖关怀');
        seasonalContent.push(`${region.name}旅游旺季攻略`);
        seasonalContent.push(`${region.name}特色季节产品`);
        return seasonalContent.slice(0, 6);
    }
    estimateEngagement(platform, region) {
        let engagement = 50;
        const platformEngagement = {
            微信: 70,
            微博: 60,
            抖音: 75,
            小红书: 65,
            知乎: 55,
            B站: 70,
        };
        if (platformEngagement[platform]) {
            engagement = platformEngagement[platform];
        }
        if (region.digitalInfrastructure?.internetPenetration) {
            engagement *= region.digitalInfrastructure.internetPenetration;
        }
        const youngRatio = this.getYoungPopulationRatio(region);
        if (youngRatio > 0.6) {
            engagement *= 1.2;
        }
        return Math.min(100, Math.round(engagement));
    }
    getYoungPopulationRatio(region) {
        if (!region.demographicData?.ageDistribution)
            return 0.5;
        const distribution = region.demographicData.ageDistribution;
        let youngRatio = 0;
        for (const [range, percentage] of Object.entries(distribution)) {
            if (range.includes('18') ||
                range.includes('25') ||
                range.includes('35')) {
                youngRatio += Number(percentage);
            }
        }
        return youngRatio / 100;
    }
    assessCostEffectiveness(platform, region) {
        const effectiveness = {
            微信: 'high',
            微博: 'medium',
            抖音: 'high',
            小红书: 'medium',
            知乎: 'low',
            B站: 'medium',
        };
        let result = effectiveness[platform] || 'medium';
        if (region.gdpPerCapita && region.gdpPerCapita > 50000) {
            if (result === 'high')
                result = 'medium';
            else if (result === 'medium')
                result = 'low';
        }
        return result;
    }
    suggestChannelActions(platform, region) {
        const actions = [];
        actions.push(`创建${platform}官方账号`);
        actions.push(`定期发布${platform}内容`);
        switch (platform) {
            case '微信':
                actions.push('建立微信群与用户互动');
                actions.push('开发微信小程序提供服务');
                break;
            case '微博':
                actions.push('参与微博热点话题');
                actions.push('与微博大V合作推广');
                break;
            case '抖音':
                actions.push('制作抖音短视频内容');
                actions.push('开展抖音直播活动');
                break;
            case '小红书':
                actions.push('发布小红书种草笔记');
                actions.push('合作小红书达人推广');
                break;
            case '知乎':
                actions.push('回答知乎相关问题');
                actions.push('发布知乎专栏文章');
                break;
            case 'B站':
                actions.push('制作B站视频教程');
                actions.push('参与B站社区互动');
                break;
            default:
                actions.push(`优化${platform}内容策略`);
                actions.push(`监测${platform}效果数据`);
        }
        actions.push(`发布${region.name}相关内容`);
        return actions.slice(0, 4);
    }
    estimateEcommerceReach(platform, region) {
        let reach = 40;
        const platformReach = {
            淘宝: 80,
            天猫: 70,
            京东: 75,
            拼多多: 85,
            抖音电商: 60,
        };
        if (platformReach[platform]) {
            reach = platformReach[platform];
        }
        if (region.digitalInfrastructure?.internetPenetration) {
            reach *= region.digitalInfrastructure.internetPenetration;
        }
        if (region.gdpPerCapita && region.gdpPerCapita > 30000) {
            reach *= 1.2;
        }
        return Math.min(100, Math.round(reach));
    }
    deduplicateAndRankKeywords(keywordOpportunities) {
        const uniqueMap = new Map();
        keywordOpportunities.forEach((opp) => {
            if (!uniqueMap.has(opp.keyword)) {
                uniqueMap.set(opp.keyword, opp);
            }
            else {
                const existing = uniqueMap.get(opp.keyword);
                if (opp.opportunityScore > existing.opportunityScore) {
                    uniqueMap.set(opp.keyword, opp);
                }
            }
        });
        return Array.from(uniqueMap.values())
            .sort((a, b) => b.opportunityScore - a.opportunityScore)
            .slice(0, 20);
    }
    deduplicateAndRankChannels(channelRecommendations) {
        const uniqueMap = new Map();
        channelRecommendations.forEach((rec) => {
            if (!uniqueMap.has(rec.channel)) {
                uniqueMap.set(rec.channel, rec);
            }
            else {
                const existing = uniqueMap.get(rec.channel);
                if (rec.reach > existing.reach) {
                    uniqueMap.set(rec.channel, rec);
                }
            }
        });
        return Array.from(uniqueMap.values())
            .map((rec) => ({
            ...rec,
            compositeScore: (rec.reach * rec.engagement) / 100,
        }))
            .sort((a, b) => b.compositeScore - a.compositeScore)
            .slice(0, 10);
    }
    prioritizeTechnicalOptimizations(technicalOptimizations) {
        const uniqueMap = new Map();
        technicalOptimizations.forEach((opt) => {
            if (!uniqueMap.has(opt.area)) {
                uniqueMap.set(opt.area, opt);
            }
            else {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                const existing = uniqueMap.get(opt.area);
                const existingPriority = priorityOrder[existing.priority] || 0;
                const newPriority = priorityOrder[opt.priority] || 0;
                if (newPriority > existingPriority) {
                    uniqueMap.set(opt.area, opt);
                }
            }
        });
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return Array.from(uniqueMap.values())
            .sort((a, b) => {
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0)
                return priorityDiff;
            return b.expectedImpact.localeCompare(a.expectedImpact);
        })
            .slice(0, 10);
    }
};
exports.SeoSuggestionService = SeoSuggestionService;
exports.SeoSuggestionService = SeoSuggestionService = SeoSuggestionService_1 = __decorate([
    (0, common_1.Injectable)()
], SeoSuggestionService);
//# sourceMappingURL=seo-suggestion.service.js.map