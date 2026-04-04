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
var GeoAnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const geo_region_entity_1 = require("../entities/geo-region.entity");
const geo_analysis_result_entity_1 = require("../entities/geo-analysis-result.entity");
const seo_suggestion_entity_1 = require("../entities/seo-suggestion.entity");
const region_analysis_service_1 = require("./region-analysis.service");
const competitive_analysis_service_1 = require("./competitive-analysis.service");
const seo_suggestion_service_1 = require("./seo-suggestion.service");
let GeoAnalysisService = GeoAnalysisService_1 = class GeoAnalysisService {
    geoRegionRepository;
    geoAnalysisResultRepository;
    seoSuggestionRepository;
    regionAnalysisService;
    competitiveAnalysisService;
    seoSuggestionService;
    logger = new common_1.Logger(GeoAnalysisService_1.name);
    constructor(geoRegionRepository, geoAnalysisResultRepository, seoSuggestionRepository, regionAnalysisService, competitiveAnalysisService, seoSuggestionService) {
        this.geoRegionRepository = geoRegionRepository;
        this.geoAnalysisResultRepository = geoAnalysisResultRepository;
        this.seoSuggestionRepository = seoSuggestionRepository;
        this.regionAnalysisService = regionAnalysisService;
        this.competitiveAnalysisService = competitiveAnalysisService;
        this.seoSuggestionService = seoSuggestionService;
    }
    async analyze(request) {
        this.logger.log(`Starting geo-analysis for tenant: ${request.tenantId}`);
        const analysisRecord = this.geoAnalysisResultRepository.create({
            tenantId: request.tenantId,
            customerProfileId: request.customerProfileId,
            targetRegionId: request.targetRegionIds?.[0],
            targetRegionName: request.targetRegionNames?.[0],
            analysisType: request.analysisTypes[0],
            status: geo_analysis_result_entity_1.AnalysisStatus.PROCESSING,
            inputParameters: {
                timeRange: request.timeRange,
                competitors: request.competitors,
                industries: request.industries,
                keywords: request.keywords,
                metrics: request.metrics,
                regionLevel: request.regionLevel,
                dataSources: request.dataSources,
            },
            analysisStartedAt: new Date(),
        });
        const savedAnalysis = await this.geoAnalysisResultRepository.save(analysisRecord);
        try {
            const results = await this.executeAnalysis(savedAnalysis.id, request);
            await this.geoAnalysisResultRepository.update(savedAnalysis.id, {
                status: geo_analysis_result_entity_1.AnalysisStatus.COMPLETED,
                ...results,
                analysisCompletedAt: new Date(),
                processingTime: Date.now() - analysisRecord.analysisStartedAt.getTime(),
            });
            const response = {
                analysisId: savedAnalysis.id,
                status: geo_analysis_result_entity_1.AnalysisStatus.COMPLETED,
                results: results,
                visualizations: this.generateVisualizations(results),
                recommendations: this.generateRecommendations(results),
                metadata: {
                    processingTime: Date.now() - analysisRecord.analysisStartedAt.getTime(),
                    dataSourcesUsed: request.dataSources || ['internal', 'public'],
                    algorithmVersion: '1.0.0',
                    generatedAt: new Date(),
                },
            };
            return response;
        }
        catch (error) {
            this.logger.error(`Geo-analysis failed: ${error.message}`, error.stack);
            await this.geoAnalysisResultRepository.update(savedAnalysis.id, {
                status: geo_analysis_result_entity_1.AnalysisStatus.FAILED,
                errorMessage: error.message,
                analysisCompletedAt: new Date(),
            });
            throw error;
        }
    }
    async executeAnalysis(analysisId, request) {
        const results = {};
        const analysisTypes = request.analysisTypes;
        const targetRegions = await this.getTargetRegions(request);
        for (const analysisType of analysisTypes) {
            switch (analysisType) {
                case geo_analysis_result_entity_1.AnalysisType.REGIONAL_ANALYSIS:
                    results.regionalAnalysis =
                        await this.regionAnalysisService.analyzeRegions(targetRegions, request);
                    break;
                case geo_analysis_result_entity_1.AnalysisType.COMPETITIVE_ANALYSIS:
                    results.competitiveAnalysis =
                        await this.competitiveAnalysisService.analyzeCompetition(targetRegions, request);
                    break;
                case geo_analysis_result_entity_1.AnalysisType.SEO_SUGGESTION:
                    results.seoSuggestions =
                        await this.seoSuggestionService.generateSuggestions(targetRegions, request);
                    break;
                case geo_analysis_result_entity_1.AnalysisType.OPPORTUNITY_IDENTIFICATION:
                    results.opportunityIdentification = await this.identifyOpportunities(targetRegions, request);
                    break;
                case geo_analysis_result_entity_1.AnalysisType.TREND_ANALYSIS:
                    results.trendAnalysis = await this.analyzeTrends(targetRegions, request);
                    break;
            }
        }
        results.overallScore = this.calculateOverallScore(results);
        results.keyFindings = this.extractKeyFindings(results);
        results.recommendations = this.generateRecommendations(results);
        return results;
    }
    async getTargetRegions(request) {
        let query = this.geoRegionRepository
            .createQueryBuilder('region')
            .where('region.tenantId = :tenantId', { tenantId: request.tenantId })
            .andWhere('region.isActive = :isActive', { isActive: true });
        if (request.targetRegionIds && request.targetRegionIds.length > 0) {
            query = query.andWhere('region.id IN (:...ids)', {
                ids: request.targetRegionIds,
            });
        }
        else if (request.targetRegionNames &&
            request.targetRegionNames.length > 0) {
            query = query.andWhere('region.name IN (:...names)', {
                names: request.targetRegionNames,
            });
        }
        else if (request.regionLevel) {
            query = query.andWhere('region.regionLevel = :level', {
                level: request.regionLevel,
            });
        }
        const regions = await query.getMany();
        if (regions.length === 0) {
            throw new common_1.NotFoundException('No target regions found');
        }
        return regions;
    }
    async identifyOpportunities(regions, request) {
        const opportunities = {
            untappedMarkets: [],
            productGaps: [],
            partnershipOpportunities: [],
            innovationAreas: [],
        };
        for (const region of regions) {
            if (region.competitors && region.competitors.length > 0) {
                const marketCoverage = this.calculateMarketCoverage(region);
                if (marketCoverage < 0.7) {
                    opportunities.untappedMarkets.push({
                        region: region.name,
                        marketSize: region.gdp * 0.01,
                        growthPotential: region.economicIndicators?.growthRate || 0.05,
                        entryDifficulty: this.assessEntryDifficulty(region),
                        suggestedStrategy: this.generateMarketEntryStrategy(region),
                    });
                }
            }
            if (region.consumerBehavior &&
                region.consumerBehavior.favoriteCategories) {
                const productGaps = this.identifyProductGaps(region, request.industries);
                opportunities.productGaps.push(...productGaps);
            }
            if (region.competitors) {
                const partnershipOps = this.identifyPartnershipOpportunities(region);
                opportunities.partnershipOpportunities.push(...partnershipOps);
            }
            if (region.digitalInfrastructure) {
                const innovationAreas = this.identifyInnovationAreas(region);
                opportunities.innovationAreas.push(...innovationAreas);
            }
        }
        return opportunities;
    }
    async analyzeTrends(regions, request) {
        const trends = {
            historicalTrends: [],
            predictiveInsights: [],
            seasonalityPatterns: [],
            emergingTrends: [],
        };
        for (const region of regions) {
            trends.historicalTrends.push({
                metric: 'market_size',
                values: this.generateHistoricalData(12),
                trendDirection: 'up',
                growthRate: region.economicIndicators?.growthRate || 0.05,
            });
            trends.predictiveInsights.push({
                metric: 'customer_growth',
                forecast: this.generateForecastData(6),
                confidenceLevel: 0.8,
                keyDrivers: [
                    'economic_growth',
                    'digital_adoption',
                    'consumer_confidence',
                ],
            });
            trends.seasonalityPatterns.push({
                patternType: 'seasonal',
                months: ['January', 'May', 'October', 'December'],
                impactLevel: 'high',
                recommendations: ['增加季节性促销', '调整库存计划', '优化营销内容'],
            });
            trends.emergingTrends.push({
                trend: 'green_consumption',
                emergenceDate: new Date().toISOString(),
                adoptionRate: 0.3,
                potentialImpact: 'high',
            });
        }
        return trends;
    }
    calculateOverallScore(results) {
        let totalScore = 0;
        let weightSum = 0;
        if (results.regionalAnalysis) {
            totalScore += 30;
            weightSum += 40;
        }
        if (results.competitiveAnalysis) {
            totalScore += 25;
            weightSum += 30;
        }
        if (results.seoSuggestions) {
            totalScore += 20;
            weightSum += 20;
        }
        if (results.opportunityIdentification) {
            totalScore += 10;
            weightSum += 10;
        }
        return weightSum > 0 ? Math.round((totalScore / weightSum) * 100) : 0;
    }
    extractKeyFindings(results) {
        const findings = [];
        if (results.regionalAnalysis) {
            findings.push('目标地区具备良好的经济增长潜力和数字化基础');
            findings.push('年轻人口占比较高，消费潜力巨大');
        }
        if (results.competitiveAnalysis) {
            findings.push('市场竞争程度中等，存在差异化机会');
            findings.push('主要竞争对手在某些细分市场占据优势');
        }
        if (results.seoSuggestions) {
            findings.push('发现多个高价值低竞争关键词机会');
            findings.push('本地化内容优化将显著提升搜索排名');
        }
        if (results.opportunityIdentification) {
            findings.push('识别出3个未充分开发的市场细分');
            findings.push('合作伙伴关系建设将加速市场渗透');
        }
        return findings;
    }
    generateVisualizations(results) {
        const visualizations = [];
        if (results.regionalAnalysis) {
            visualizations.push({
                id: 'regional-map',
                type: 'map',
                title: '地区分布图',
                description: '显示目标地区的地理分布和关键指标',
                data: results.regionalAnalysis,
                format: 'html',
                interactive: true,
            });
        }
        if (results.competitiveAnalysis) {
            visualizations.push({
                id: 'competitive-chart',
                type: 'chart',
                title: '竞争格局图',
                description: '显示市场份额和竞争态势',
                data: results.competitiveAnalysis,
                format: 'svg',
                interactive: false,
            });
        }
        return visualizations;
    }
    generateRecommendations(results) {
        const recommendations = [];
        if (results.regionalAnalysis) {
            recommendations.push({
                id: 'rec-regional-1',
                category: 'marketing',
                title: '加强本地化营销',
                description: '针对目标地区的文化特点和消费习惯，制定本地化营销策略',
                priority: 'high',
                expectedImpact: 85,
                implementationDifficulty: 60,
                timeframe: '1-3个月',
                requiredResources: ['营销团队', '本地合作伙伴', '翻译服务'],
                relatedRegions: results.regionalAnalysis.map((r) => r.regionId),
            });
        }
        if (results.seoSuggestions) {
            recommendations.push({
                id: 'rec-seo-1',
                category: 'seo',
                title: '优化本地关键词',
                description: '针对目标地区的高搜索量关键词进行内容优化',
                priority: 'medium',
                expectedImpact: 75,
                implementationDifficulty: 40,
                timeframe: '2-4周',
                requiredResources: ['SEO专家', '内容团队', '分析工具'],
                relatedRegions: results.seoSuggestions.map((s) => s.targetRegionId),
            });
        }
        return recommendations;
    }
    calculateMarketCoverage(region) {
        if (!region.competitors || region.competitors.length === 0)
            return 0;
        const totalMarketShare = region.competitors.reduce((sum, comp) => sum + (comp.marketShare || 0), 0);
        return Math.min(1, totalMarketShare / 100);
    }
    assessEntryDifficulty(region) {
        const factors = [];
        if (region.competitionIntensity > 0.7)
            factors.push('high_competition');
        if (region.entryBarriers && region.entryBarriers.length > 3)
            factors.push('high_barriers');
        if (region.marketConcentration > 0.8)
            factors.push('high_concentration');
        if (factors.length >= 2)
            return 'high';
        if (factors.length === 1)
            return 'medium';
        return 'low';
    }
    generateMarketEntryStrategy(region) {
        if (region.competitionIntensity < 0.3) {
            return '直接进入市场，建立品牌认知';
        }
        else if (region.competitionIntensity < 0.6) {
            return '寻找差异化定位，瞄准细分市场';
        }
        else {
            return '考虑合作伙伴关系或收购现有玩家';
        }
    }
    identifyProductGaps(region, industries) {
        const gaps = [];
        if (region.consumerBehavior?.favoriteCategories) {
            const popularCategories = region.consumerBehavior.favoriteCategories;
            const potentialCategories = ['健康食品', '智能家居', '绿色出行'];
            potentialCategories.forEach((category) => {
                if (!popularCategories.includes(category)) {
                    gaps.push({
                        productCategory: category,
                        unmetNeeds: ['质量', '价格', '便利性'],
                        potentialDemand: 0.7,
                        competitiveLandscape: '新兴市场，竞争较少',
                    });
                }
            });
        }
        return gaps;
    }
    identifyPartnershipOpportunities(region) {
        const opportunities = [];
        if (region.competitors) {
            region.competitors.forEach((competitor) => {
                if (competitor.marketShare < 0.3) {
                    opportunities.push({
                        partnerType: '互补业务',
                        potentialPartners: [competitor.companyName],
                        synergies: ['客户共享', '技术互补', '渠道协同'],
                        contactStrategy: '通过行业协会建立联系',
                    });
                }
            });
        }
        return opportunities;
    }
    identifyInnovationAreas(region) {
        const areas = [];
        if (region.digitalInfrastructure?.internetPenetration > 0.7) {
            areas.push({
                area: '数字服务',
                technologyTrends: ['AI个性化', '区块链溯源', '物联网连接'],
                customerNeeds: ['便捷', '安全', '个性化'],
                competitiveAdvantage: '技术基础设施完善',
            });
        }
        return areas;
    }
    generateHistoricalData(months) {
        const data = [];
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                value: Math.random() * 100 + 50,
            });
        }
        return data;
    }
    generateForecastData(months) {
        const data = [];
        const now = new Date();
        for (let i = 1; i <= months; i++) {
            const date = new Date(now);
            date.setMonth(date.getMonth() + i);
            data.push({
                date: date.toISOString().split('T')[0],
                value: Math.random() * 100 + 150,
            });
        }
        return data;
    }
    async getAnalysisResult(analysisId) {
        const result = await this.geoAnalysisResultRepository.findOne({
            where: { id: analysisId },
        });
        if (!result) {
            throw new common_1.NotFoundException(`Analysis result ${analysisId} not found`);
        }
        return result;
    }
    async getRegions(tenantId, filters) {
        const query = this.geoRegionRepository
            .createQueryBuilder('region')
            .where('region.tenantId = :tenantId', { tenantId })
            .andWhere('region.isActive = :isActive', { isActive: true });
        if (filters?.regionLevel) {
            query.andWhere('region.regionLevel = :regionLevel', {
                regionLevel: filters.regionLevel,
            });
        }
        if (filters?.regionType) {
            query.andWhere('region.regionType = :regionType', {
                regionType: filters.regionType,
            });
        }
        return query.getMany();
    }
    async getSeoSuggestions(tenantId, filters) {
        const query = this.seoSuggestionRepository
            .createQueryBuilder('suggestion')
            .where('suggestion.tenantId = :tenantId', { tenantId })
            .andWhere('suggestion.isActive = :isActive', { isActive: true });
        if (filters?.suggestionType) {
            query.andWhere('suggestion.suggestionType = :suggestionType', {
                suggestionType: filters.suggestionType,
            });
        }
        if (filters?.priority) {
            query.andWhere('suggestion.priority = :priority', {
                priority: filters.priority,
            });
        }
        return query.orderBy('suggestion.expectedImpact', 'DESC').getMany();
    }
};
exports.GeoAnalysisService = GeoAnalysisService;
exports.GeoAnalysisService = GeoAnalysisService = GeoAnalysisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(geo_region_entity_1.GeoRegion)),
    __param(1, (0, typeorm_1.InjectRepository)(geo_analysis_result_entity_1.GeoAnalysisResult)),
    __param(2, (0, typeorm_1.InjectRepository)(seo_suggestion_entity_1.SeoSuggestion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        region_analysis_service_1.RegionAnalysisService,
        competitive_analysis_service_1.CompetitiveAnalysisService,
        seo_suggestion_service_1.SeoSuggestionService])
], GeoAnalysisService);
//# sourceMappingURL=geo-analysis.service.js.map