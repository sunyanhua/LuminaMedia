"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RegionAnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionAnalysisService = void 0;
const common_1 = require("@nestjs/common");
let RegionAnalysisService = RegionAnalysisService_1 = class RegionAnalysisService {
    logger = new common_1.Logger(RegionAnalysisService_1.name);
    async analyzeRegions(regions, request) {
        this.logger.log(`Analyzing ${regions.length} regions`);
        const regionalAnalysis = {
            demographicProfile: {
                summary: '',
                keyInsights: [],
                data: [],
            },
            economicProfile: {
                summary: '',
                keyInsights: [],
                data: [],
            },
            culturalProfile: {
                summary: '',
                keyInsights: [],
                data: [],
            },
            digitalProfile: {
                summary: '',
                keyInsights: [],
                data: [],
            },
            regionalComparison: {
                comparisonMetrics: [],
                regionRankings: [],
                strengthsByRegion: {},
                weaknessesByRegion: {},
            },
        };
        for (const region of regions) {
            const demographicAnalysis = this.analyzeDemographics(region);
            regionalAnalysis.demographicProfile.data.push(demographicAnalysis);
            const economicAnalysis = this.analyzeEconomy(region);
            regionalAnalysis.economicProfile.data.push(economicAnalysis);
            const culturalAnalysis = this.analyzeCulture(region);
            regionalAnalysis.culturalProfile.data.push(culturalAnalysis);
            const digitalAnalysis = this.analyzeDigital(region);
            regionalAnalysis.digitalProfile.data.push(digitalAnalysis);
            regionalAnalysis.regionalComparison.strengthsByRegion[region.id] =
                this.identifyStrengths(region);
            regionalAnalysis.regionalComparison.weaknessesByRegion[region.id] =
                this.identifyWeaknesses(region);
        }
        regionalAnalysis.demographicProfile.summary =
            this.generateDemographicSummary(regionalAnalysis.demographicProfile.data);
        regionalAnalysis.demographicProfile.keyInsights =
            this.extractDemographicInsights(regionalAnalysis.demographicProfile.data);
        regionalAnalysis.economicProfile.summary = this.generateEconomicSummary(regionalAnalysis.economicProfile.data);
        regionalAnalysis.economicProfile.keyInsights = this.extractEconomicInsights(regionalAnalysis.economicProfile.data);
        regionalAnalysis.culturalProfile.summary = this.generateCulturalSummary(regionalAnalysis.culturalProfile.data);
        regionalAnalysis.culturalProfile.keyInsights = this.extractCulturalInsights(regionalAnalysis.culturalProfile.data);
        regionalAnalysis.digitalProfile.summary = this.generateDigitalSummary(regionalAnalysis.digitalProfile.data);
        regionalAnalysis.digitalProfile.keyInsights = this.extractDigitalInsights(regionalAnalysis.digitalProfile.data);
        regionalAnalysis.regionalComparison.comparisonMetrics =
            this.selectComparisonMetrics(request);
        regionalAnalysis.regionalComparison.regionRankings = this.rankRegions(regions, request);
        return regionalAnalysis;
    }
    analyzeDemographics(region) {
        return {
            regionId: region.id,
            regionName: region.name,
            population: region.population || 0,
            density: region.population && region.area ? region.population / region.area : 0,
            ageDistribution: region.demographicData?.ageDistribution || {},
            genderRatio: region.demographicData?.genderRatio || 1.0,
            educationLevel: region.demographicData?.educationLevel || {},
            incomeDistribution: region.demographicData?.householdIncome || {},
            householdSize: 3.2,
            urbanizationRate: region.demographicData?.urbanizationRate || 0.6,
            demographicScore: this.calculateDemographicScore(region),
            growthPotential: this.assessDemographicGrowthPotential(region),
        };
    }
    analyzeEconomy(region) {
        return {
            regionId: region.id,
            regionName: region.name,
            gdp: region.gdp || 0,
            gdpPerCapita: region.gdpPerCapita || 0,
            growthRate: region.economicIndicators?.growthRate || 0.05,
            industryStructure: region.economicIndicators || {
                primaryIndustry: 0,
                secondaryIndustry: 0,
                tertiaryIndustry: 0,
            },
            unemploymentRate: region.economicIndicators?.unemploymentRate || 0.05,
            inflationRate: region.economicIndicators?.inflationRate || 0.02,
            consumptionIndex: this.calculateConsumptionIndex(region),
            investmentIndex: this.calculateInvestmentIndex(region),
            economicStability: this.assessEconomicStability(region),
            developmentStage: this.determineDevelopmentStage(region),
        };
    }
    analyzeCulture(region) {
        return {
            regionId: region.id,
            regionName: region.name,
            languages: this.parseLanguageData(region.culturalData),
            religions: this.parseReligionData(region.culturalData),
            festivals: region.culturalData?.festivals || [],
            customs: region.culturalData?.customs || [],
            taboos: region.culturalData?.taboos || [],
            values: this.inferCulturalValues(region),
            mediaConsumption: this.estimateMediaConsumption(region),
            entertainmentPreferences: this.estimateEntertainmentPreferences(region),
            culturalOpenness: this.assessCulturalOpenness(region),
            traditionModernityBalance: this.assessTraditionModernityBalance(region),
        };
    }
    analyzeDigital(region) {
        return {
            regionId: region.id,
            regionName: region.name,
            internetPenetration: region.digitalInfrastructure?.internetPenetration || 0.5,
            smartphonePenetration: region.digitalInfrastructure?.smartphonePenetration || 0.6,
            socialMediaUsage: region.digitalInfrastructure?.socialMediaUsage || {},
            ecommerceAdoption: region.digitalInfrastructure?.ecommercePlatforms
                ? 0.7
                : 0.3,
            digitalPaymentUsage: this.estimateDigitalPaymentUsage(region),
            onlineTimePerDay: this.estimateOnlineTime(region),
            popularApps: region.digitalInfrastructure?.popularApps || [],
            preferredDevices: this.estimatePreferredDevices(region),
            digitalLiteracy: this.assessDigitalLiteracy(region),
            innovationAdoption: this.assessInnovationAdoption(region),
        };
    }
    identifyStrengths(region) {
        const strengths = [];
        if (region.population && region.population > 1000000) {
            strengths.push('人口规模大，市场潜力巨大');
        }
        if (region.demographicData?.ageDistribution &&
            this.getYoungPopulationRatio(region) > 0.6) {
            strengths.push('年轻人口占比高，消费活力强');
        }
        if (region.gdpPerCapita && region.gdpPerCapita > 80000) {
            strengths.push('人均GDP高，消费能力强');
        }
        if (region.economicIndicators?.growthRate &&
            region.economicIndicators.growthRate > 0.07) {
            strengths.push('经济增长迅速，市场扩张快');
        }
        if (region.digitalInfrastructure?.internetPenetration &&
            region.digitalInfrastructure.internetPenetration > 0.8) {
            strengths.push('互联网普及率高，数字化基础好');
        }
        if (region.digitalInfrastructure?.smartphonePenetration &&
            region.digitalInfrastructure.smartphonePenetration > 0.8) {
            strengths.push('智能手机普及率高，移动端机会多');
        }
        if (region.culturalData &&
            region.culturalData.festivals &&
            region.culturalData.festivals.length > 5) {
            strengths.push('文化资源丰富，节庆营销机会多');
        }
        return strengths;
    }
    identifyWeaknesses(region) {
        const weaknesses = [];
        if (region.population && region.population < 500000) {
            weaknesses.push('人口规模较小，市场规模有限');
        }
        if (this.getAgingPopulationRatio(region) > 0.2) {
            weaknesses.push('老龄化程度较高，消费增长可能放缓');
        }
        if (region.economicIndicators?.unemploymentRate &&
            region.economicIndicators.unemploymentRate > 0.08) {
            weaknesses.push('失业率较高，消费能力受限');
        }
        if (region.economicIndicators?.inflationRate &&
            region.economicIndicators.inflationRate > 0.05) {
            weaknesses.push('通货膨胀压力大，购买力可能下降');
        }
        if (region.digitalInfrastructure?.internetPenetration &&
            region.digitalInfrastructure.internetPenetration < 0.5) {
            weaknesses.push('互联网普及率低，数字渠道受限');
        }
        if (region.competitionIntensity && region.competitionIntensity > 0.8) {
            weaknesses.push('市场竞争激烈，进入门槛高');
        }
        return weaknesses;
    }
    calculateDemographicScore(region) {
        let score = 50;
        if (region.population) {
            if (region.population > 5000000)
                score += 20;
            else if (region.population > 1000000)
                score += 10;
        }
        const youngRatio = this.getYoungPopulationRatio(region);
        if (youngRatio > 0.7)
            score += 15;
        else if (youngRatio > 0.6)
            score += 10;
        if (region.demographicData?.educationLevel) {
            const higherEdu = region.demographicData.educationLevel['大学'] || 0;
            if (higherEdu > 0.3)
                score += 10;
        }
        return Math.min(100, score);
    }
    assessDemographicGrowthPotential(region) {
        const youngRatio = this.getYoungPopulationRatio(region);
        const urbanizationRate = region.demographicData?.urbanizationRate || 0;
        if (youngRatio > 0.7 && urbanizationRate < 0.7)
            return 'high';
        if (youngRatio > 0.6 || urbanizationRate < 0.8)
            return 'medium';
        return 'low';
    }
    calculateConsumptionIndex(region) {
        let index = 50;
        if (region.gdpPerCapita) {
            if (region.gdpPerCapita > 100000)
                index += 30;
            else if (region.gdpPerCapita > 50000)
                index += 20;
            else if (region.gdpPerCapita > 20000)
                index += 10;
        }
        if (region.consumerBehavior?.averageSpending) {
            if (region.consumerBehavior.averageSpending > 5000)
                index += 20;
            else if (region.consumerBehavior.averageSpending > 2000)
                index += 10;
        }
        return Math.min(100, index);
    }
    calculateInvestmentIndex(region) {
        let index = 50;
        if (region.economicIndicators?.growthRate) {
            if (region.economicIndicators.growthRate > 0.08)
                index += 20;
            else if (region.economicIndicators.growthRate > 0.05)
                index += 10;
        }
        if (region.economicIndicators?.unemploymentRate) {
            if (region.economicIndicators.unemploymentRate < 0.04)
                index += 15;
            else if (region.economicIndicators.unemploymentRate < 0.06)
                index += 10;
        }
        return Math.min(100, index);
    }
    assessEconomicStability(region) {
        const factors = [];
        if (region.economicIndicators?.inflationRate &&
            region.economicIndicators.inflationRate < 0.03) {
            factors.push('low_inflation');
        }
        if (region.economicIndicators?.unemploymentRate &&
            region.economicIndicators.unemploymentRate < 0.05) {
            factors.push('low_unemployment');
        }
        if (region.economicIndicators?.growthRate &&
            region.economicIndicators.growthRate > 0.04) {
            factors.push('positive_growth');
        }
        if (factors.length >= 2)
            return 'high';
        if (factors.length === 1)
            return 'medium';
        return 'low';
    }
    determineDevelopmentStage(region) {
        if (!region.gdpPerCapita)
            return 'developing';
        if (region.gdpPerCapita > 20000)
            return 'developed';
        if (region.gdpPerCapita > 10000)
            return 'emerging';
        return 'developing';
    }
    parseLanguageData(culturalData) {
        if (!culturalData?.dominantLanguage)
            return { 普通话: 100 };
        return {
            [culturalData.dominantLanguage]: 80,
            ...(culturalData.dialects?.reduce((acc, dialect) => {
                acc[dialect] = 20 / (culturalData.dialects.length || 1);
                return acc;
            }, {}) || {}),
        };
    }
    parseReligionData(culturalData) {
        if (!culturalData?.religions || culturalData.religions.length === 0) {
            return { 无宗教: 60, 佛教: 20, 基督教: 10, 其他: 10 };
        }
        const distribution = {};
        const perReligion = 100 / culturalData.religions.length;
        culturalData.religions.forEach((religion) => {
            distribution[religion] = perReligion;
        });
        return distribution;
    }
    inferCulturalValues(region) {
        const values = [];
        if (region.culturalData?.customs) {
            if (region.culturalData.customs.some((c) => c.includes('家庭') || c.includes('孝'))) {
                values.push('家庭观念强');
            }
            if (region.culturalData.customs.some((c) => c.includes('节俭') || c.includes('节约'))) {
                values.push('注重节俭');
            }
        }
        if (region.gdpPerCapita && region.gdpPerCapita > 15000) {
            values.push('追求品质生活');
            values.push('重视体验消费');
        }
        return values.length > 0 ? values : ['传统价值观', '社区意识', '务实精神'];
    }
    estimateMediaConsumption(region) {
        const defaultConsumption = {
            电视: 40,
            互联网: 80,
            社交媒体: 70,
            报纸: 10,
            广播: 15,
        };
        if (region.digitalInfrastructure?.socialMediaUsage) {
            return {
                ...defaultConsumption,
                ...region.digitalInfrastructure.socialMediaUsage,
            };
        }
        if (region.digitalInfrastructure?.internetPenetration) {
            const internetPenetration = region.digitalInfrastructure.internetPenetration;
            defaultConsumption.互联网 = internetPenetration * 100;
            defaultConsumption.社交媒体 = internetPenetration * 80;
            defaultConsumption.电视 = 100 - internetPenetration * 60;
        }
        return defaultConsumption;
    }
    estimateEntertainmentPreferences(region) {
        const preferences = ['电影', '音乐', '短视频'];
        if (region.consumerBehavior?.favoriteCategories) {
            preferences.push(...region.consumerBehavior.favoriteCategories.filter((cat) => ['游戏', '旅游', '美食', '健身'].includes(cat)));
        }
        const youngRatio = this.getYoungPopulationRatio(region);
        if (youngRatio > 0.7) {
            preferences.push('电竞', '直播', '二次元文化');
        }
        else if (youngRatio < 0.4) {
            preferences.push('养生', '旅游', '传统文化');
        }
        return preferences;
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
        if (region.digitalInfrastructure?.popularApps?.some((app) => app.includes('国际') || app.includes('global'))) {
            factors.push('global_apps');
        }
        if (factors.length >= 2)
            return 'high';
        if (factors.length === 1)
            return 'medium';
        return 'low';
    }
    assessTraditionModernityBalance(region) {
        const traditionalIndicators = region.culturalData?.customs?.length || 0;
        const modernIndicators = region.digitalInfrastructure?.internetPenetration || 0;
        if (traditionalIndicators > 5 && modernIndicators < 0.5)
            return 'traditional';
        if (traditionalIndicators < 2 && modernIndicators > 0.8)
            return 'modern';
        return 'balanced';
    }
    estimateDigitalPaymentUsage(region) {
        if (region.consumerBehavior?.mobilePaymentRate) {
            return region.consumerBehavior.mobilePaymentRate;
        }
        if (region.digitalInfrastructure?.internetPenetration) {
            return region.digitalInfrastructure.internetPenetration * 0.8;
        }
        return 0.5;
    }
    estimateOnlineTime(region) {
        if (region.digitalInfrastructure?.internetPenetration) {
            return region.digitalInfrastructure.internetPenetration * 4 + 1;
        }
        return 2.5;
    }
    estimatePreferredDevices(region) {
        const devices = ['智能手机'];
        if (region.digitalInfrastructure?.internetPenetration &&
            region.digitalInfrastructure.internetPenetration > 0.7) {
            devices.push('平板电脑', '笔记本电脑');
        }
        if (region.gdpPerCapita && region.gdpPerCapita > 30000) {
            devices.push('智能手表', '智能家居设备');
        }
        return devices;
    }
    assessDigitalLiteracy(region) {
        if (!region.digitalInfrastructure?.internetPenetration)
            return 'medium';
        if (region.digitalInfrastructure.internetPenetration > 0.8 &&
            region.digitalInfrastructure.smartphonePenetration > 0.9) {
            return 'high';
        }
        else if (region.digitalInfrastructure.internetPenetration > 0.6 ||
            region.digitalInfrastructure.smartphonePenetration > 0.7) {
            return 'medium';
        }
        else {
            return 'low';
        }
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
    getAgingPopulationRatio(region) {
        if (!region.demographicData?.ageDistribution)
            return 0.1;
        const distribution = region.demographicData.ageDistribution;
        let agingRatio = 0;
        for (const [range, percentage] of Object.entries(distribution)) {
            if (range.includes('56') ||
                range.includes('60') ||
                range.includes('65')) {
                agingRatio += Number(percentage);
            }
        }
        return agingRatio / 100;
    }
    generateDemographicSummary(data) {
        if (data.length === 0)
            return '无可用人口统计数据';
        const totalPopulation = data.reduce((sum, item) => sum + (item.population || 0), 0);
        const avgYoungRatio = data.reduce((sum, item) => sum + (this.getYoungPopulationRatioFromData(item) || 0), 0) / data.length;
        return `目标地区总人口约${Math.round(totalPopulation / 10000)}万人，平均年轻人口（18-35岁）占比${Math.round(avgYoungRatio * 100)}%，具备良好的人口结构和消费潜力。`;
    }
    getYoungPopulationRatioFromData(item) {
        if (item.ageDistribution) {
            let youngRatio = 0;
            for (const [range, percentage] of Object.entries(item.ageDistribution)) {
                if (range.includes('18') ||
                    range.includes('25') ||
                    range.includes('35')) {
                    youngRatio += Number(percentage);
                }
            }
            return youngRatio / 100;
        }
        return 0.5;
    }
    extractDemographicInsights(data) {
        const insights = [];
        if (data.length > 0) {
            const avgDensity = data.reduce((sum, item) => sum + (item.density || 0), 0) / data.length;
            if (avgDensity > 1000) {
                insights.push('人口密度高，适合密集型服务和零售业态');
            }
            const avgUrbanization = data.reduce((sum, item) => sum + (item.urbanizationRate || 0), 0) /
                data.length;
            if (avgUrbanization > 0.7) {
                insights.push('城镇化水平高，城市消费特征明显');
            }
        }
        return insights.length > 0
            ? insights
            : ['人口结构相对均衡，适合大众化产品和服务'];
    }
    generateEconomicSummary(data) {
        if (data.length === 0)
            return '无可用经济统计数据';
        const avgGdpPerCapita = data.reduce((sum, item) => sum + (item.gdpPerCapita || 0), 0) /
            data.length;
        const avgGrowth = data.reduce((sum, item) => sum + (item.growthRate || 0), 0) / data.length;
        return `目标地区人均GDP约${Math.round(avgGdpPerCapita)}元，平均经济增长率${Math.round(avgGrowth * 100)}%，经济活力和消费能力${avgGdpPerCapita > 50000 ? '较强' : '中等'}`;
    }
    extractEconomicInsights(data) {
        const insights = [];
        if (data.length > 0) {
            const avgConsumption = data.reduce((sum, item) => sum + (item.consumptionIndex || 0), 0) /
                data.length;
            if (avgConsumption > 70) {
                insights.push('消费指数高，消费者购买意愿强烈');
            }
            const stableRegions = data.filter((item) => item.economicStability === 'high').length;
            if (stableRegions > data.length * 0.7) {
                insights.push('经济稳定性好，投资风险较低');
            }
        }
        return insights.length > 0 ? insights : ['经济环境稳定，适合长期市场布局'];
    }
    generateCulturalSummary(data) {
        if (data.length === 0)
            return '无可用文化统计数据';
        const avgOpenness = data.filter((item) => item.culturalOpenness === 'high').length /
            data.length;
        const traditionalRegions = data.filter((item) => item.traditionModernityBalance === 'traditional').length;
        return `目标地区文化开放度${avgOpenness > 0.5 ? '较高' : '中等'}，${traditionalRegions > 0 ? '部分' : '较少'}地区保持较强传统特色，${avgOpenness > 0.7 ? '适合国际化品牌进入' : '需要注重本地化适配'}`;
    }
    extractCulturalInsights(data) {
        const insights = [];
        if (data.length > 0) {
            const balancedRegions = data.filter((item) => item.traditionModernityBalance === 'balanced').length;
            if (balancedRegions > data.length * 0.5) {
                insights.push('传统与现代文化平衡，产品设计需兼顾两者');
            }
            const mediaDiversity = data.some((item) => Object.keys(item.mediaConsumption || {}).length > 3);
            if (mediaDiversity) {
                insights.push('媒体消费多样化，需要多渠道营销策略');
            }
        }
        return insights.length > 0
            ? insights
            : ['文化特征多元，建议进行深入的本地化市场研究'];
    }
    generateDigitalSummary(data) {
        if (data.length === 0)
            return '无可用数字化统计数据';
        const avgInternet = data.reduce((sum, item) => sum + (item.internetPenetration || 0), 0) /
            data.length;
        const avgSmartphone = data.reduce((sum, item) => sum + (item.smartphonePenetration || 0), 0) /
            data.length;
        return `目标地区互联网普及率${Math.round(avgInternet * 100)}%，智能手机普及率${Math.round(avgSmartphone * 100)}%，数字化基础${avgInternet > 0.7 ? '良好' : '一般'}，${avgSmartphone > 0.8 ? '移动端机会突出' : '需要兼顾传统渠道'}`;
    }
    extractDigitalInsights(data) {
        const insights = [];
        if (data.length > 0) {
            const earlyAdopters = data.filter((item) => item.innovationAdoption === 'early').length;
            if (earlyAdopters > 0) {
                insights.push('存在创新早期采用者群体，适合推出新技术产品');
            }
            const highLiteracy = data.filter((item) => item.digitalLiteracy === 'high').length;
            if (highLiteracy > data.length * 0.5) {
                insights.push('数字素养普遍较高，复杂数字产品接受度好');
            }
        }
        return insights.length > 0
            ? insights
            : ['数字化水平中等，建议提供渐进式的数字解决方案'];
    }
    selectComparisonMetrics(request) {
        const defaultMetrics = [
            'gdp_per_capita',
            'population_density',
            'internet_penetration',
            'consumption_index',
        ];
        const customMetrics = request.metrics || [];
        return [...defaultMetrics, ...customMetrics].slice(0, 10);
    }
    rankRegions(regions, request) {
        return regions
            .map((region) => {
            const scores = this.calculateRegionScores(region);
            const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) /
                Object.keys(scores).length;
            return {
                regionId: region.id,
                regionName: region.name,
                rank: 0,
                score: Math.round(totalScore),
                keyStrengths: this.identifyStrengths(region).slice(0, 3),
                keyWeaknesses: this.identifyWeaknesses(region).slice(0, 3),
            };
        })
            .sort((a, b) => b.score - a.score)
            .map((item, index) => ({ ...item, rank: index + 1 }));
    }
    calculateRegionScores(region) {
        return {
            demographic: this.calculateDemographicScore(region),
            economic: this.calculateEconomicScore(region),
            cultural: this.calculateCulturalScore(region),
            digital: this.calculateDigitalScore(region),
            competitive: this.calculateCompetitiveScore(region),
        };
    }
    calculateEconomicScore(region) {
        let score = 50;
        if (region.gdpPerCapita) {
            if (region.gdpPerCapita > 100000)
                score += 25;
            else if (region.gdpPerCapita > 50000)
                score += 15;
            else if (region.gdpPerCapita > 20000)
                score += 5;
        }
        if (region.economicIndicators?.growthRate) {
            score += Math.min(20, region.economicIndicators.growthRate * 200);
        }
        return Math.min(100, score);
    }
    calculateCulturalScore(region) {
        let score = 60;
        if (region.culturalData) {
            if (region.culturalData.festivals &&
                region.culturalData.festivals.length > 3)
                score += 10;
            if (region.culturalData.customs && region.culturalData.customs.length > 5)
                score += 10;
        }
        const openness = this.assessCulturalOpenness(region);
        if (openness === 'high')
            score += 20;
        else if (openness === 'medium')
            score += 10;
        return Math.min(100, score);
    }
    calculateDigitalScore(region) {
        let score = 50;
        if (region.digitalInfrastructure?.internetPenetration) {
            score += region.digitalInfrastructure.internetPenetration * 30;
        }
        if (region.digitalInfrastructure?.smartphonePenetration) {
            score += region.digitalInfrastructure.smartphonePenetration * 20;
        }
        return Math.min(100, score);
    }
    calculateCompetitiveScore(region) {
        let score = 70;
        if (region.competitionIntensity) {
            score -= region.competitionIntensity * 40;
        }
        if (region.competitors && region.competitors.length > 5) {
            score -= 10;
        }
        return Math.max(0, Math.min(100, score));
    }
};
exports.RegionAnalysisService = RegionAnalysisService;
exports.RegionAnalysisService = RegionAnalysisService = RegionAnalysisService_1 = __decorate([
    (0, common_1.Injectable)()
], RegionAnalysisService);
//# sourceMappingURL=region-analysis.service.js.map