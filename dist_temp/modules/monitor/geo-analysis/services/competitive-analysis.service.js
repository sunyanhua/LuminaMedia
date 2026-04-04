"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CompetitiveAnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitiveAnalysisService = void 0;
const common_1 = require("@nestjs/common");
let CompetitiveAnalysisService = CompetitiveAnalysisService_1 = class CompetitiveAnalysisService {
    logger = new common_1.Logger(CompetitiveAnalysisService_1.name);
    async analyzeCompetition(regions, request) {
        this.logger.log(`Analyzing competition for ${regions.length} regions`);
        const competitiveAnalysis = {
            marketOverview: {
                size: 0,
                growth: 0,
                trends: [],
                drivers: [],
            },
            competitorAnalysis: {
                competitors: [],
                competitiveMatrix: {
                    dimensions: [],
                    positions: [],
                },
                marketShareDistribution: [],
            },
            competitivePositioning: {
                ourPosition: {
                    differentiation: [],
                    valueProposition: [],
                    targetSegments: [],
                    pricingStrategy: '',
                    distributionChannels: [],
                },
                recommendedPosition: {
                    differentiation: [],
                    valueProposition: [],
                    targetSegments: [],
                    pricingStrategy: '',
                    distributionChannels: [],
                },
                positioningStrategy: [],
            },
        };
        const allCompetitors = new Map();
        let totalMarketSize = 0;
        let totalGrowth = 0;
        for (const region of regions) {
            const marketSize = this.calculateMarketSize(region);
            const marketGrowth = this.calculateMarketGrowth(region);
            totalMarketSize += marketSize;
            totalGrowth += marketGrowth;
            if (region.competitors) {
                region.competitors.forEach((comp) => {
                    const key = `${comp.companyName}-${region.id}`;
                    if (!allCompetitors.has(key)) {
                        allCompetitors.set(key, {
                            ...comp,
                            regions: [region.id],
                            regionalMarketShare: comp.marketShare || 0,
                        });
                    }
                    else {
                        const existing = allCompetitors.get(key);
                        existing.regions.push(region.id);
                        existing.regionalMarketShare =
                            (existing.regionalMarketShare + (comp.marketShare || 0)) / 2;
                    }
                });
            }
        }
        competitiveAnalysis.marketOverview.size = totalMarketSize;
        competitiveAnalysis.marketOverview.growth =
            regions.length > 0 ? totalGrowth / regions.length : 0;
        competitiveAnalysis.marketOverview.trends = this.identifyMarketTrends(regions, request);
        competitiveAnalysis.marketOverview.drivers = this.identifyMarketDrivers(regions, request);
        const competitors = Array.from(allCompetitors.values());
        competitiveAnalysis.competitorAnalysis.competitors =
            this.analyzeCompetitors(competitors, regions, request);
        competitiveAnalysis.competitorAnalysis.competitiveMatrix =
            this.buildCompetitiveMatrix(competitiveAnalysis.competitorAnalysis.competitors, request);
        competitiveAnalysis.competitorAnalysis.marketShareDistribution =
            this.calculateMarketShareDistribution(competitiveAnalysis.competitorAnalysis.competitors);
        competitiveAnalysis.competitivePositioning.ourPosition =
            this.assessOurPosition(request);
        competitiveAnalysis.competitivePositioning.recommendedPosition =
            this.recommendPositioning(competitiveAnalysis.competitorAnalysis.competitors, request);
        competitiveAnalysis.competitivePositioning.positioningStrategy =
            this.developPositioningStrategy(competitiveAnalysis.competitivePositioning.ourPosition, competitiveAnalysis.competitivePositioning.recommendedPosition);
        return competitiveAnalysis;
    }
    calculateMarketSize(region) {
        let size = 0;
        if (region.gdp) {
            size += region.gdp * 0.1;
        }
        if (region.population) {
            size += region.population * 5000;
        }
        if (size === 0) {
            size = region.area ? region.area * 1000000 : 100000000;
        }
        return size;
    }
    calculateMarketGrowth(region) {
        if (region.economicIndicators?.growthRate) {
            return region.economicIndicators.growthRate;
        }
        if (region.gdpPerCapita) {
            if (region.gdpPerCapita < 10000)
                return 0.08;
            if (region.gdpPerCapita < 30000)
                return 0.05;
            return 0.03;
        }
        return 0.05;
    }
    identifyMarketTrends(regions, request) {
        const trends = new Set();
        for (const region of regions) {
            if (region.digitalInfrastructure?.internetPenetration &&
                region.digitalInfrastructure.internetPenetration > 0.7) {
                trends.add('数字化加速');
                trends.add('线上消费增长');
            }
            if (region.gdpPerCapita && region.gdpPerCapita > 30000) {
                trends.add('消费升级');
                trends.add('品质追求');
            }
            if (this.getYoungPopulationRatio(region) > 0.6) {
                trends.add('年轻消费群体崛起');
                trends.add('个性化需求增加');
            }
            if (region.culturalData?.customs?.some((c) => c.includes('环保') || c.includes('绿色'))) {
                trends.add('绿色消费意识增强');
            }
        }
        if (request.industries) {
            request.industries.forEach((industry) => {
                if (industry.includes('科技') || industry.includes('数字')) {
                    trends.add('技术创新驱动');
                    trends.add('产品迭代加速');
                }
                if (industry.includes('零售') || industry.includes('消费')) {
                    trends.add('全渠道零售');
                    trends.add('体验式消费');
                }
                if (industry.includes('服务')) {
                    trends.add('服务个性化');
                    trends.add('体验至上');
                }
            });
        }
        return Array.from(trends).slice(0, 10);
    }
    identifyMarketDrivers(regions, request) {
        const drivers = new Set();
        const hasHighGrowth = regions.some((r) => r.economicIndicators?.growthRate &&
            r.economicIndicators.growthRate > 0.07);
        if (hasHighGrowth) {
            drivers.add('经济增长');
            drivers.add('收入水平提升');
        }
        const totalPopulation = regions.reduce((sum, r) => sum + (r.population || 0), 0);
        if (totalPopulation > 10000000) {
            drivers.add('人口规模');
            drivers.add('市场基数大');
        }
        const youngPopulation = regions.some((r) => this.getYoungPopulationRatio(r) > 0.65);
        if (youngPopulation) {
            drivers.add('年轻人口');
            drivers.add('消费活力强');
        }
        const highDigital = regions.some((r) => r.digitalInfrastructure?.internetPenetration &&
            r.digitalInfrastructure.internetPenetration > 0.8);
        if (highDigital) {
            drivers.add('数字化普及');
            drivers.add('技术基础设施完善');
        }
        drivers.add('消费政策支持');
        drivers.add('市场开放程度提高');
        const culturalOpenness = regions.some((r) => {
            const openness = this.assessCulturalOpenness(r);
            return openness === 'high' || openness === 'medium';
        });
        if (culturalOpenness) {
            drivers.add('文化开放');
            drivers.add('新事物接受度高');
        }
        return Array.from(drivers).slice(0, 8);
    }
    analyzeCompetitors(competitors, regions, request) {
        return competitors.map((comp) => {
            const analysis = {
                name: comp.companyName,
                marketShare: comp.marketShare || this.estimateMarketShare(comp, regions),
                strengths: comp.strengths || this.inferStrengths(comp, regions),
                weaknesses: comp.weaknesses || this.inferWeaknesses(comp, regions),
                strategies: comp.strategies || this.inferStrategies(comp, regions),
                threatLevel: comp.threatLevel || this.assessThreatLevel(comp, regions, request),
                customerSatisfaction: this.estimateCustomerSatisfaction(comp, regions),
                digitalPresence: this.assessDigitalPresence(comp, regions),
                geographicCoverage: comp.regions || [],
                financialHealth: this.assessFinancialHealth(comp),
                innovationCapability: this.assessInnovationCapability(comp, regions),
                brandStrength: this.assessBrandStrength(comp, regions),
            };
            return analysis;
        });
    }
    buildCompetitiveMatrix(competitors, request) {
        const dimensions = this.selectCompetitiveDimensions(request);
        const positions = competitors.map((comp) => ({
            competitor: comp.name,
            scores: dimensions.map((dim) => this.scoreCompetitorOnDimension(comp, dim)),
        }));
        positions.push({
            competitor: '我们',
            scores: dimensions.map((dim) => this.scoreOurPositionOnDimension(dim, competitors, request)),
        });
        return {
            dimensions,
            positions,
        };
    }
    calculateMarketShareDistribution(competitors) {
        const totalShare = competitors.reduce((sum, comp) => sum + (comp.marketShare || 0), 0);
        return competitors
            .map((comp) => ({
            competitor: comp.name,
            share: comp.marketShare || 0,
            percentage: totalShare > 0 ? ((comp.marketShare || 0) / totalShare) * 100 : 0,
            trend: this.determineShareTrend(comp),
        }))
            .sort((a, b) => b.share - a.share)
            .slice(0, 10);
    }
    assessOurPosition(request) {
        return {
            differentiation: ['技术领先', '客户服务优质', '产品创新'],
            valueProposition: ['提供一站式解决方案', '高性价比', '快速响应市场变化'],
            targetSegments: request.industries?.map((ind) => `${ind}行业客户`) || [
                '中小企业',
                '成长型企业',
            ],
            pricingStrategy: '价值导向定价',
            distributionChannels: ['直销', '线上平台', '合作伙伴'],
        };
    }
    recommendPositioning(competitors, request) {
        const gaps = this.identifyCompetitiveGaps(competitors, request);
        return {
            differentiation: gaps.differentiationOpportunities,
            valueProposition: gaps.valuePropositionOpportunities,
            targetSegments: this.identifyUnderservedSegments(competitors, request),
            pricingStrategy: this.recommendPricingStrategy(competitors, request),
            distributionChannels: this.recommendDistributionChannels(competitors, request),
        };
    }
    developPositioningStrategy(currentPosition, recommendedPosition) {
        const strategies = [];
        const newDifferentiations = recommendedPosition.differentiation.filter((diff) => !currentPosition.differentiation.includes(diff));
        if (newDifferentiations.length > 0) {
            strategies.push(`强化${newDifferentiations[0]}作为核心差异化优势`);
        }
        const newValueProps = recommendedPosition.valueProposition.filter((vp) => !currentPosition.valueProposition.includes(vp));
        if (newValueProps.length > 0) {
            strategies.push(`在营销沟通中突出${newValueProps[0]}`);
        }
        const newSegments = recommendedPosition.targetSegments.filter((seg) => !currentPosition.targetSegments.includes(seg));
        if (newSegments.length > 0) {
            strategies.push(`开拓${newSegments[0]}市场`);
        }
        if (recommendedPosition.pricingStrategy !== currentPosition.pricingStrategy) {
            strategies.push(`采用${recommendedPosition.pricingStrategy}`);
        }
        const newChannels = recommendedPosition.distributionChannels.filter((ch) => !currentPosition.distributionChannels.includes(ch));
        if (newChannels.length > 0) {
            strategies.push(`拓展${newChannels[0]}渠道`);
        }
        return strategies.length > 0 ? strategies : ['维持现有定位，优化执行效率'];
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
    assessCulturalOpenness(region) {
        const factors = [];
        if (region.culturalData?.dialects &&
            region.culturalData.dialects.length > 2) {
            factors.push('language_diversity');
        }
        if (region.englishName) {
            factors.push('international_presence');
        }
        if (factors.length >= 2)
            return 'high';
        if (factors.length === 1)
            return 'medium';
        return 'low';
    }
    estimateMarketShare(competitor, regions) {
        let baseShare = 5;
        if (competitor.strengths && competitor.strengths.length > 3) {
            baseShare += 5;
        }
        if (competitor.regions && competitor.regions.length > 1) {
            baseShare += competitor.regions.length * 2;
        }
        if (competitor.regionalMarketShare) {
            baseShare = competitor.regionalMarketShare;
        }
        return Math.min(30, baseShare);
    }
    inferStrengths(competitor, regions) {
        const strengths = [];
        if (competitor.regions && competitor.regions.length > 3) {
            strengths.push('广泛的地域覆盖');
            strengths.push('规模化运营能力');
        }
        if (competitor.industry) {
            strengths.push(`${competitor.industry}行业经验丰富`);
        }
        if (strengths.length === 0) {
            strengths.push('本地市场熟悉度高');
            strengths.push('客户关系稳固');
        }
        return strengths;
    }
    inferWeaknesses(competitor, regions) {
        const weaknesses = [];
        if (competitor.regions && competitor.regions.length === 1) {
            weaknesses.push('市场覆盖有限');
            weaknesses.push('地域依赖性高');
        }
        if (!competitor.strengths || competitor.strengths.length < 2) {
            weaknesses.push('资源相对有限');
            weaknesses.push('品牌知名度不足');
        }
        if (weaknesses.length === 0) {
            weaknesses.push('技术创新能力待提升');
            weaknesses.push('数字化水平有限');
        }
        return weaknesses;
    }
    inferStrategies(competitor, regions) {
        const strategies = [];
        if (competitor.strengths?.some((s) => s.includes('成本') || s.includes('价格'))) {
            strategies.push('成本领先策略');
        }
        if (competitor.strengths?.some((s) => s.includes('技术') || s.includes('创新'))) {
            strategies.push('差异化策略');
            strategies.push('技术创新驱动');
        }
        if (competitor.regions && competitor.regions.length > 1) {
            strategies.push('市场扩张策略');
        }
        if (strategies.length === 0) {
            strategies.push('客户关系深耕');
            strategies.push('服务差异化');
        }
        return strategies;
    }
    assessThreatLevel(competitor, regions, request) {
        let threatScore = 0;
        if (competitor.marketShare) {
            if (competitor.marketShare > 20)
                threatScore += 3;
            else if (competitor.marketShare > 10)
                threatScore += 2;
            else if (competitor.marketShare > 5)
                threatScore += 1;
        }
        if (competitor.regions) {
            const overlap = competitor.regions.filter((r) => regions.some((region) => region.id === r)).length;
            if (overlap > 0)
                threatScore += 2;
        }
        if (competitor.strengths && competitor.strengths.length > 3) {
            threatScore += 2;
        }
        if (competitor.weaknesses && competitor.weaknesses.length > 3) {
            threatScore -= 1;
        }
        if (request.industries && competitor.industry) {
            const industryMatch = request.industries.some((ind) => competitor.industry.includes(ind) ||
                ind.includes(competitor.industry));
            if (industryMatch)
                threatScore += 2;
        }
        if (threatScore >= 5)
            return 'high';
        if (threatScore >= 3)
            return 'medium';
        return 'low';
    }
    estimateCustomerSatisfaction(competitor, regions) {
        let satisfaction = 70;
        if (competitor.strengths) {
            satisfaction += competitor.strengths.length * 2;
        }
        if (competitor.weaknesses) {
            satisfaction -= competitor.weaknesses.length * 3;
        }
        if (competitor.strengths?.some((s) => s.includes('服务') || s.includes('客户'))) {
            satisfaction += 10;
        }
        return Math.max(0, Math.min(100, satisfaction));
    }
    assessDigitalPresence(competitor, regions) {
        let presence = 50;
        const digitalRegions = regions.filter((r) => r.digitalInfrastructure?.internetPenetration &&
            r.digitalInfrastructure.internetPenetration > 0.7);
        const competitorInDigital = digitalRegions.some((r) => competitor.regions?.includes(r.id));
        if (competitorInDigital)
            presence += 20;
        if (competitor.strengths?.some((s) => s.includes('数字') ||
            s.includes('线上') ||
            s.includes('技术') ||
            s.includes('创新'))) {
            presence += 15;
        }
        if (competitor.weaknesses?.some((w) => w.includes('数字') || w.includes('线上') || w.includes('技术'))) {
            presence -= 10;
        }
        return Math.max(0, Math.min(100, presence));
    }
    assessFinancialHealth(competitor) {
        const indicators = [];
        if (competitor.marketShare && competitor.marketShare > 15) {
            indicators.push('strong_market_position');
        }
        if (competitor.regions && competitor.regions.length > 3) {
            indicators.push('diversified_revenue');
        }
        if (competitor.weaknesses?.some((w) => w.includes('财务') || w.includes('资金') || w.includes('成本'))) {
            indicators.push('financial_concerns');
        }
        if (indicators.includes('financial_concerns')) {
            return 'risky';
        }
        else if (indicators.includes('strong_market_position') &&
            indicators.includes('diversified_revenue')) {
            return 'healthy';
        }
        else {
            return 'stable';
        }
    }
    assessInnovationCapability(competitor, regions) {
        const factors = [];
        if (competitor.strengths?.some((s) => s.includes('创新') || s.includes('研发') || s.includes('技术'))) {
            factors.push('innovation_strength');
        }
        if (competitor.strategies?.some((s) => s.includes('创新') || s.includes('技术'))) {
            factors.push('innovation_strategy');
        }
        const innovativeRegions = regions.filter((r) => this.assessInnovationAdoption(r) === 'early');
        const competitorInInnovative = innovativeRegions.some((r) => competitor.regions?.includes(r.id));
        if (competitorInInnovative) {
            factors.push('innovative_environment');
        }
        if (factors.length >= 2)
            return 'high';
        if (factors.length === 1)
            return 'medium';
        return 'low';
    }
    assessInnovationAdoption(region) {
        const digitalScore = (region.digitalInfrastructure?.internetPenetration || 0) * 100;
        const economicScore = region.gdpPerCapita ? region.gdpPerCapita / 1000 : 0;
        const totalScore = digitalScore + economicScore;
        if (totalScore > 120)
            return 'early';
        if (totalScore > 80)
            return 'mainstream';
        return 'lagging';
    }
    assessBrandStrength(competitor, regions) {
        const factors = [];
        if (competitor.marketShare && competitor.marketShare > 10) {
            factors.push('market_share');
        }
        if (competitor.regions && competitor.regions.length > 2) {
            factors.push('geographic_reach');
        }
        if (competitor.strengths?.some((s) => s.includes('品牌') || s.includes('知名') || s.includes('声誉'))) {
            factors.push('brand_strength');
        }
        if (factors.length >= 2)
            return 'strong';
        if (factors.length === 1)
            return 'moderate';
        return 'weak';
    }
    selectCompetitiveDimensions(request) {
        const defaultDimensions = [
            'price_competitiveness',
            'product_quality',
            'customer_service',
            'innovation',
            'brand_strength',
            'distribution_reach',
            'digital_capability',
        ];
        const industryDimensions = {
            科技: ['innovation', 'technical_support', 'product_features'],
            零售: ['price_competitiveness', 'store_experience', 'product_variety'],
            服务: ['customer_service', 'response_time', 'customization'],
        };
        let dimensions = [...defaultDimensions];
        if (request.industries) {
            request.industries.forEach((ind) => {
                if (industryDimensions[ind]) {
                    dimensions = [...dimensions, ...industryDimensions[ind]];
                }
            });
        }
        return [...new Set(dimensions)].slice(0, 8);
    }
    scoreCompetitorOnDimension(competitor, dimension) {
        let score = 50;
        switch (dimension) {
            case 'price_competitiveness':
                if (competitor.strategies?.some((s) => s.includes('成本') || s.includes('价格'))) {
                    score += 20;
                }
                break;
            case 'product_quality':
                if (competitor.strengths?.some((s) => s.includes('质量') || s.includes('品质'))) {
                    score += 15;
                }
                break;
            case 'customer_service':
                if (competitor.strengths?.some((s) => s.includes('服务') || s.includes('客户'))) {
                    score += 20;
                }
                break;
            case 'innovation':
                if (this.assessInnovationCapability(competitor, []) === 'high') {
                    score += 25;
                }
                else if (this.assessInnovationCapability(competitor, []) === 'medium') {
                    score += 10;
                }
                break;
            case 'brand_strength':
                const brandStrength = this.assessBrandStrength(competitor, []);
                if (brandStrength === 'strong')
                    score += 25;
                else if (brandStrength === 'moderate')
                    score += 10;
                break;
            case 'distribution_reach':
                if (competitor.regions && competitor.regions.length > 3) {
                    score += 20;
                }
                break;
            case 'digital_capability':
                const digitalPresence = this.assessDigitalPresence(competitor, []);
                score += (digitalPresence - 50) / 2;
                break;
            case 'technical_support':
                if (competitor.strengths?.some((s) => s.includes('技术') || s.includes('支持'))) {
                    score += 15;
                }
                break;
            case 'store_experience':
                score += 40;
                break;
            case 'response_time':
                if (competitor.strengths?.some((s) => s.includes('快速') || s.includes('响应'))) {
                    score += 20;
                }
                break;
            case 'customization':
                if (competitor.strengths?.some((s) => s.includes('定制') || s.includes('个性化'))) {
                    score += 15;
                }
                break;
        }
        return Math.max(0, Math.min(100, score));
    }
    scoreOurPositionOnDimension(dimension, competitors, request) {
        const ourScores = {
            price_competitiveness: 70,
            product_quality: 80,
            customer_service: 85,
            innovation: 75,
            brand_strength: 65,
            distribution_reach: 60,
            digital_capability: 80,
            technical_support: 75,
            store_experience: 70,
            response_time: 80,
            customization: 70,
        };
        return ourScores[dimension] || 65;
    }
    determineShareTrend(competitor) {
        const factors = [];
        if (this.assessInnovationCapability(competitor, []) === 'high') {
            factors.push('innovative');
        }
        if (this.assessDigitalPresence(competitor, []) > 70) {
            factors.push('digital_strong');
        }
        if (competitor.regions && competitor.regions.length > 3) {
            factors.push('expanding');
        }
        if (factors.length >= 2)
            return 'increasing';
        if (factors.length === 1)
            return 'stable';
        return 'decreasing';
    }
    identifyCompetitiveGaps(competitors, request) {
        const gaps = {
            differentiationOpportunities: [],
            valuePropositionOpportunities: [],
        };
        const commonWeaknesses = this.findCommonWeaknesses(competitors);
        commonWeaknesses.forEach((weakness) => {
            if (weakness.includes('数字') ||
                weakness.includes('线上') ||
                weakness.includes('技术')) {
                gaps.differentiationOpportunities.push('数字化领先');
                gaps.valuePropositionOpportunities.push('一站式数字解决方案');
            }
            if (weakness.includes('服务') || weakness.includes('响应')) {
                gaps.differentiationOpportunities.push('卓越客户服务');
                gaps.valuePropositionOpportunities.push('7x24小时快速响应');
            }
            if (weakness.includes('定制') || weakness.includes('个性化')) {
                gaps.differentiationOpportunities.push('高度定制化');
                gaps.valuePropositionOpportunities.push('个性化产品服务');
            }
        });
        if (request.industries?.some((ind) => ind.includes('科技') || ind.includes('数字'))) {
            const techCompetitors = competitors.filter((comp) => comp.strengths?.some((s) => s.includes('技术') || s.includes('创新')));
            if (techCompetitors.length < competitors.length * 0.3) {
                gaps.differentiationOpportunities.push('技术创新');
                gaps.valuePropositionOpportunities.push('前沿技术应用');
            }
        }
        if (gaps.differentiationOpportunities.length === 0) {
            gaps.differentiationOpportunities.push('综合解决方案提供商');
            gaps.valuePropositionOpportunities.push('性价比最优选择');
        }
        return gaps;
    }
    findCommonWeaknesses(competitors) {
        const weaknessCount = new Map();
        competitors.forEach((comp) => {
            if (comp.weaknesses) {
                comp.weaknesses.forEach((weakness) => {
                    weaknessCount.set(weakness, (weaknessCount.get(weakness) || 0) + 1);
                });
            }
        });
        const threshold = competitors.length / 2;
        return Array.from(weaknessCount.entries())
            .filter(([_, count]) => count >= threshold)
            .map(([weakness, _]) => weakness);
    }
    identifyUnderservedSegments(competitors, request) {
        const segments = new Set();
        if (request.industries) {
            request.industries.forEach((industry) => {
                segments.add(`${industry}中小企业`);
                segments.add(`新兴${industry}企业`);
            });
        }
        const competitorSegments = new Set();
        competitors.forEach((comp) => {
            if (comp.targetSegments) {
                comp.targetSegments.forEach((seg) => competitorSegments.add(seg));
            }
        });
        const potentialSegments = [
            '初创企业',
            '数字化转型中的传统企业',
            '跨境业务企业',
            '特定垂直行业',
            '偏远地区客户',
        ];
        potentialSegments.forEach((seg) => {
            if (!competitorSegments.has(seg)) {
                segments.add(seg);
            }
        });
        return Array.from(segments).slice(0, 5);
    }
    recommendPricingStrategy(competitors, request) {
        const pricingStrategies = new Map();
        competitors.forEach((comp) => {
            if (comp.strategies) {
                comp.strategies.forEach((strategy) => {
                    if (strategy.includes('价格') ||
                        strategy.includes('成本') ||
                        strategy.includes('定价')) {
                        if (strategy.includes('领先') || strategy.includes('低')) {
                            pricingStrategies.set('cost_leadership', (pricingStrategies.get('cost_leadership') || 0) + 1);
                        }
                        else if (strategy.includes('差异') || strategy.includes('溢价')) {
                            pricingStrategies.set('premium', (pricingStrategies.get('premium') || 0) + 1);
                        }
                        else if (strategy.includes('价值')) {
                            pricingStrategies.set('value_based', (pricingStrategies.get('value_based') || 0) + 1);
                        }
                    }
                });
            }
        });
        const costLeadershipCount = pricingStrategies.get('cost_leadership') || 0;
        const premiumCount = pricingStrategies.get('premium') || 0;
        const valueBasedCount = pricingStrategies.get('value_based') || 0;
        if (costLeadershipCount <= premiumCount &&
            costLeadershipCount <= valueBasedCount) {
            return '成本领先定价';
        }
        else if (premiumCount <= costLeadershipCount &&
            premiumCount <= valueBasedCount) {
            return '溢价定价';
        }
        else {
            return '价值导向定价';
        }
    }
    recommendDistributionChannels(competitors, request) {
        const channels = new Set();
        const competitorChannels = new Map();
        competitors.forEach((comp) => {
            if (comp.distributionChannels) {
                comp.distributionChannels.forEach((channel) => {
                    competitorChannels.set(channel, (competitorChannels.get(channel) || 0) + 1);
                });
            }
        });
        const allChannels = [
            '直销',
            '线上平台',
            '代理商',
            '经销商',
            '合作伙伴',
            '零售门店',
            '电子商务',
        ];
        allChannels.forEach((channel) => {
            const count = competitorChannels.get(channel) || 0;
            if (count < competitors.length * 0.3) {
                channels.add(channel);
            }
        });
        if (channels.size === 0) {
            channels.add('社交媒体直销');
            channels.add('直播电商');
            channels.add('订阅制服务');
        }
        return Array.from(channels).slice(0, 3);
    }
};
exports.CompetitiveAnalysisService = CompetitiveAnalysisService;
exports.CompetitiveAnalysisService = CompetitiveAnalysisService = CompetitiveAnalysisService_1 = __decorate([
    (0, common_1.Injectable)()
], CompetitiveAnalysisService);
//# sourceMappingURL=competitive-analysis.service.js.map