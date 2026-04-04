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
exports.CustomerAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_profile_entity_1 = require("../../../entities/customer-profile.entity");
const customer_segment_entity_1 = require("../../../entities/customer-segment.entity");
const data_import_job_entity_1 = require("../../../entities/data-import-job.entity");
const data_import_status_enum_1 = require("../../../shared/enums/data-import-status.enum");
let CustomerAnalyticsService = class CustomerAnalyticsService {
    customerProfileRepository;
    customerSegmentRepository;
    dataImportJobRepository;
    constructor(customerProfileRepository, customerSegmentRepository, dataImportJobRepository) {
        this.customerProfileRepository = customerProfileRepository;
        this.customerSegmentRepository = customerSegmentRepository;
        this.dataImportJobRepository = dataImportJobRepository;
    }
    async generateCustomerProfileAnalysis(profileId) {
        const profile = await this.customerProfileRepository.findOne({
            where: { id: profileId },
            relations: ['segments', 'importJobs'],
        });
        if (!profile) {
            throw new common_1.NotFoundException(`Customer profile ${profileId} not found`);
        }
        const importJobs = await this.dataImportJobRepository.find({
            where: { customerProfileId: profileId },
        });
        const totalRecords = importJobs.reduce((sum, job) => sum + job.recordCount, 0);
        const completedImports = importJobs.filter((job) => job.status === data_import_status_enum_1.DataImportStatus.SUCCESS).length;
        return {
            profileId: profile.id,
            profileName: profile.customerName,
            industry: profile.industry,
            analysisTimestamp: new Date().toISOString(),
            dataSummary: {
                totalImportJobs: importJobs.length,
                completedImports,
                totalRecords,
                dataFreshness: this.calculateDataFreshness(importJobs),
                dataCompleteness: this.calculateDataCompleteness(importJobs),
            },
            demographicAnalysis: this.generateDemographicAnalysis(profile),
            behavioralAnalysis: this.generateBehavioralAnalysis(profile),
            consumptionAnalysis: this.generateConsumptionAnalysis(profile),
            segmentationAnalysis: await this.generateSegmentationAnalysis(profileId),
            keyInsights: this.generateKeyInsights(profile, importJobs),
            recommendations: this.generateRecommendations(profile),
        };
    }
    calculateDataFreshness(importJobs) {
        if (importJobs.length === 0)
            return 'No data';
        const completedJobs = importJobs.filter((job) => job.status === data_import_status_enum_1.DataImportStatus.SUCCESS);
        if (completedJobs.length === 0)
            return 'No completed imports';
        const latestJob = completedJobs.reduce((latest, job) => job.completedAt && (!latest || job.completedAt > latest)
            ? job.completedAt
            : latest, null);
        if (!latestJob)
            return 'Unknown';
        const daysAgo = Math.floor((Date.now() - latestJob.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo === 0)
            return 'Today';
        if (daysAgo === 1)
            return 'Yesterday';
        if (daysAgo < 7)
            return `${daysAgo} days ago`;
        if (daysAgo < 30)
            return `${Math.floor(daysAgo / 7)} weeks ago`;
        return `${Math.floor(daysAgo / 30)} months ago`;
    }
    calculateDataCompleteness(importJobs) {
        if (importJobs.length === 0)
            return 0;
        const totalRecords = importJobs.reduce((sum, job) => sum + job.recordCount, 0);
        const processedRecords = importJobs.reduce((sum, job) => sum + (job.successCount + job.failedCount), 0);
        if (totalRecords === 0)
            return 0;
        return Math.round((processedRecords / totalRecords) * 100);
    }
    generateDemographicAnalysis(profile) {
        const profileData = profile.profileData || {};
        return {
            customerBaseSize: profileData.demographic?.totalCustomers || 15000,
            genderDistribution: profileData.demographic?.genderDistribution || {
                male: 42,
                female: 58,
            },
            ageDistribution: profileData.demographic?.ageDistribution || {
                '18-25': 22,
                '26-35': 35,
                '36-45': 28,
                '46-55': 12,
                '56+': 3,
            },
            geographicDistribution: profileData.demographic?.locationDistribution || {
                '5km内': 65,
                '5-10km': 25,
                '10km+': 10,
            },
            insights: [
                '女性客户占比58%，是主要消费群体',
                '26-45岁客户占比63%，是消费主力军',
                '5公里内客户占比65%，商圈辐射范围有提升空间',
                '年轻客户（18-35岁）占比57%，市场年轻化趋势明显',
            ],
        };
    }
    generateBehavioralAnalysis(profile) {
        const profileData = profile.profileData || {};
        return {
            visitPatterns: {
                averageFrequency: profileData.behavior?.averageVisitFrequency || 2.8,
                averageDuration: profileData.behavior?.averageStayDuration || 2.1,
                peakHours: profileData.behavior?.peakHours || [
                    '11:00-13:00',
                    '18:00-20:00',
                ],
                peakDays: profileData.behavior?.peakDays || ['周六', '周日'],
            },
            engagementMetrics: {
                memberPenetration: profileData.loyalty?.memberPenetration || 72,
                averageTenure: profileData.loyalty?.averageMemberTenure || 18,
                retentionRates: profileData.loyalty?.retentionRate || {
                    '1个月': 85,
                    '3个月': 72,
                    '6个月': 58,
                    '12个月': 42,
                },
            },
            channelPreferences: {
                inStore: 78,
                mobileApp: 45,
                website: 32,
                socialMedia: 28,
            },
            insights: [
                '周末客流量是工作日的2.3倍，但工作日客单价更高',
                '平均每月到店2.8次，客户粘性良好',
                '会员渗透率72%，有提升空间',
                '12个月留存率仅42%，需关注客户流失问题',
            ],
        };
    }
    generateConsumptionAnalysis(profile) {
        const profileData = profile.profileData || {};
        return {
            spendingPatterns: {
                averageMonthlySpend: profileData.consumption?.averageMonthlySpend || 320,
                averageTransactionValue: 156,
                spendingDistribution: profileData.consumption?.topCategories || [
                    { category: '餐饮', spend: 45, frequency: 3.2 },
                    { category: '服饰', spend: 28, frequency: 0.8 },
                    { category: '娱乐', spend: 15, frequency: 1.5 },
                    { category: '家居', spend: 8, frequency: 0.3 },
                    { category: '其他', spend: 4, frequency: 0.5 },
                ],
            },
            paymentMethods: profileData.consumption?.paymentMethods || {
                mobilePay: 68,
                creditCard: 22,
                cash: 8,
                other: 2,
            },
            seasonality: {
                peakMonths: ['March', 'May', 'October', 'December'],
                lowMonths: ['January', 'February', 'August'],
                holidayImpact: 35,
            },
            customerLifetimeValue: {
                averageCLV: 3840,
                highValueThreshold: 8000,
                highValuePercentage: 18,
            },
            insights: [
                '餐饮消费占比最高（45%），是引流关键品类',
                '移动支付占比68%，数字化消费习惯成熟',
                '服饰类消费频率低但客单价高，有提升空间',
                '高价值客户（CLV>8000）占比18%，贡献约45%的总销售额',
            ],
        };
    }
    async generateSegmentationAnalysis(profileId) {
        const segments = await this.customerSegmentRepository.find({
            where: { customerProfileId: profileId },
        });
        if (segments.length === 0) {
            return {
                segmentCount: 0,
                message: 'No customer segments defined',
            };
        }
        const totalMembers = segments.reduce((sum, segment) => sum + segment.memberCount, 0);
        return {
            segmentCount: segments.length,
            totalMembers,
            segmentDetails: segments.map((segment) => ({
                name: segment.segmentName,
                memberCount: segment.memberCount,
                percentage: totalMembers > 0
                    ? Math.round((segment.memberCount / totalMembers) * 100)
                    : 0,
                description: segment.description,
                criteria: segment.criteria,
            })),
            insights: [
                `高频高价值客户占比${segments.find((s) => s.segmentName === '高频高价值客户')?.memberCount || (0 / totalMembers) * 100}%，是核心价值群体`,
                `年轻时尚族占比${segments.find((s) => s.segmentName === '年轻时尚族')?.memberCount || (0 / totalMembers) * 100}%，增长潜力最大`,
                `潜在流失客户占比${segments.find((s) => s.segmentName === '潜在流失客户')?.memberCount || (0 / totalMembers) * 100}%，需制定留存策略`,
            ],
        };
    }
    generateKeyInsights(profile, importJobs) {
        const insights = [];
        const dataCompleteness = this.calculateDataCompleteness(importJobs);
        if (dataCompleteness < 80) {
            insights.push(`数据完整性有待提升（当前${dataCompleteness}%），建议补充缺失数据`);
        }
        else {
            insights.push(`数据质量良好，完整性达${dataCompleteness}%`);
        }
        if (profile.industry === 'RETAIL') {
            insights.push('零售行业客户注重购物体验和便利性，线上线下融合是关键');
            insights.push('年轻客户占比高，社交媒体和移动端接触点尤为重要');
        }
        if (profile.customerType === 'ENTERPRISE') {
            insights.push('企业客户数据规模大，需建立系统化的数据分析流程');
            insights.push('B2B场景下，客户决策链更长，需要多触点跟踪');
        }
        insights.push('移动支付渗透率高，数字化会员体系是提升复购的关键');
        insights.push('周末客流集中但工作日价值更高，需平衡客流与客单价');
        insights.push('高价值客户占比虽小但贡献大，应优先服务与维护');
        return insights;
    }
    generateRecommendations(profile) {
        const recommendations = [
            {
                priority: 'high',
                category: '数据质量',
                recommendation: '补充客户联系方式字段，提升数据完整性至95%以上',
                expectedImpact: '提高营销活动触达率30-40%',
                timeframe: '1个月内',
            },
            {
                priority: 'high',
                category: '客户留存',
                recommendation: '为潜在流失客户设计专属召回活动，提供个性化优惠',
                expectedImpact: '降低客户流失率15-20%',
                timeframe: '2个月内',
            },
            {
                priority: 'medium',
                category: '营销优化',
                recommendation: '针对高频高价值客户推出VIP专属服务计划',
                expectedImpact: '提升高价值客户复购率25-30%',
                timeframe: '3个月内',
            },
            {
                priority: 'medium',
                category: '渠道扩展',
                recommendation: '开发线上商城和移动应用，拓展非周末时段销售',
                expectedImpact: '增加线上销售额20-25%',
                timeframe: '6个月内',
            },
            {
                priority: 'low',
                category: '数据分析',
                recommendation: '建立自动化报表系统，实时监控关键业务指标',
                expectedImpact: '减少人工分析时间50%，提升决策效率',
                timeframe: '3个月内',
            },
        ];
        if (profile.industry === 'RETAIL') {
            recommendations.push({
                priority: 'high',
                category: '零售优化',
                recommendation: '优化卖场布局和动线设计，提升客户停留时间和交叉销售',
                expectedImpact: '提高客单价15-20%',
                timeframe: '2个月内',
            });
        }
        return recommendations;
    }
    async performCustomerSegmentation(profileId, segmentationRules) {
        const profile = await this.customerProfileRepository.findOne({
            where: { id: profileId },
        });
        if (!profile) {
            throw new common_1.NotFoundException(`Customer profile ${profileId} not found`);
        }
        const rules = segmentationRules || this.getDefaultSegmentationRules();
        const segments = await this.generateSegmentationResults(profileId, rules);
        await this.customerSegmentRepository.delete({
            customerProfileId: profileId,
        });
        const savedSegments = [];
        for (const segmentData of segments) {
            const segment = this.customerSegmentRepository.create({
                customerProfileId: profileId,
                ...segmentData,
            });
            const savedSegment = (await this.customerSegmentRepository.save(segment));
            savedSegments.push(savedSegment);
        }
        return savedSegments;
    }
    getDefaultSegmentationRules() {
        return {
            rules: [
                {
                    name: '高频高价值客户',
                    conditions: [
                        { field: 'monthly_visits', operator: '>=', value: 8 },
                        { field: 'average_spend', operator: '>=', value: 500 },
                        { field: 'member_level', operator: 'in', value: ['钻石', '白金'] },
                    ],
                },
                {
                    name: '年轻时尚族',
                    conditions: [
                        { field: 'age', operator: 'between', value: [18, 30] },
                        {
                            field: 'interests',
                            operator: 'contains_any',
                            value: ['时尚', '美食', '娱乐'],
                        },
                    ],
                },
                {
                    name: '家庭消费者',
                    conditions: [
                        { field: 'family_size', operator: '>=', value: 3 },
                        {
                            field: 'purchase_categories',
                            operator: 'contains_any',
                            value: ['母婴', '家居', '食品'],
                        },
                    ],
                },
            ],
            evaluationOrder: 'sequential',
            defaultSegment: '其他客户',
        };
    }
    async generateSegmentationResults(profileId, rules) {
        return [
            {
                segmentName: '高频高价值客户',
                criteria: {
                    monthlyVisits: { min: 8 },
                    averageSpend: { min: 500 },
                    memberLevel: ['钻石', '白金'],
                },
                memberCount: 1200,
                description: '每月到店8次以上，平均消费500元以上的高价值客户',
            },
            {
                segmentName: '年轻时尚族',
                criteria: {
                    ageRange: [18, 30],
                    interests: ['时尚', '美食', '娱乐'],
                    visitTime: ['周末', '晚上'],
                },
                memberCount: 3500,
                description: '18-30岁，追求时尚和娱乐的年轻客户群体',
            },
            {
                segmentName: '家庭消费者',
                criteria: {
                    familySize: { min: 3 },
                    purchaseCategories: ['母婴', '家居', '食品'],
                    visitTime: ['周末下午'],
                },
                memberCount: 4200,
                description: '以家庭为单位的消费群体，注重生活品质',
            },
            {
                segmentName: '商务人士',
                criteria: {
                    occupation: ['白领', '企业家'],
                    visitTime: ['工作日午餐', '工作日下班后'],
                    spendPattern: '稳定',
                },
                memberCount: 1800,
                description: '工作日到店的商务人士，消费稳定',
            },
            {
                segmentName: '潜在流失客户',
                criteria: {
                    lastVisitDays: { min: 60 },
                    engagementScore: { max: 30 },
                },
                memberCount: 2300,
                description: '超过60天未到店，参与度低的潜在流失客户',
            },
        ];
    }
    async getDashboardData(profileId) {
        const profile = await this.customerProfileRepository.findOne({
            where: { id: profileId },
        });
        if (!profile) {
            throw new common_1.NotFoundException(`Customer profile ${profileId} not found`);
        }
        const importJobs = await this.dataImportJobRepository.find({
            where: { customerProfileId: profileId },
        });
        const segments = await this.customerSegmentRepository.find({
            where: { customerProfileId: profileId },
        });
        const totalRecords = importJobs.reduce((sum, job) => sum + job.recordCount, 0);
        const totalSegments = segments.length;
        const totalMembers = segments.reduce((sum, segment) => sum + segment.memberCount, 0);
        return {
            overview: {
                profileName: profile.customerName,
                industry: profile.industry,
                customerType: profile.customerType,
                dataSources: Object.keys(profile.dataSources || {}).length,
            },
            metrics: {
                totalRecords,
                totalSegments,
                totalMembers,
                dataCompleteness: this.calculateDataCompleteness(importJobs),
                segmentationCoverage: totalRecords > 0
                    ? Math.round((totalMembers / totalRecords) * 100)
                    : 0,
            },
            recentActivity: {
                lastImport: importJobs.length > 0 ? importJobs[0].createdAt : null,
                lastAnalysis: new Date(),
                segmentUpdate: segments.length > 0 ? segments[0].createdAt : null,
            },
            quickInsights: [
                totalRecords > 10000
                    ? '大数据量，适合深度学习分析'
                    : '中等数据量，适合规则分析',
                totalSegments >= 5
                    ? '客户分群完善，可支持精细化营销'
                    : '建议增加客户分群维度',
                this.calculateDataCompleteness(importJobs) >= 90
                    ? '数据质量良好'
                    : '数据质量有待提升',
            ],
        };
    }
    async getCustomerSegments(profileId) {
        return await this.customerSegmentRepository.find({
            where: { customerProfileId: profileId },
            order: { createdAt: 'DESC' },
        });
    }
    async getSegmentDetail(profileId, segmentId) {
        const segment = await this.customerSegmentRepository.findOne({
            where: { id: segmentId, customerProfileId: profileId },
        });
        if (!segment) {
            throw new Error(`Customer segment ${segmentId} not found for profile ${profileId}`);
        }
        return segment;
    }
    async updateSegment(profileId, segmentId, updates) {
        const segment = await this.getSegmentDetail(profileId, segmentId);
        Object.assign(segment, updates);
        segment.updatedAt = new Date();
        return await this.customerSegmentRepository.save(segment);
    }
    async deleteSegment(profileId, segmentId) {
        const result = await this.customerSegmentRepository.delete({
            id: segmentId,
            customerProfileId: profileId,
        });
        if (result.affected === 0) {
            throw new Error(`Customer segment ${segmentId} not found for profile ${profileId}`);
        }
    }
    async getRadarChartData(profileId) {
        const profile = await this.customerProfileRepository.findOne({
            where: { id: profileId },
        });
        if (!profile) {
            throw new common_1.NotFoundException(`Customer profile ${profileId} not found`);
        }
        const profileData = profile.profileData || {};
        return {
            indicator: [
                { name: '年轻客户比例', max: 100 },
                { name: '女性客户比例', max: 100 },
                { name: '本地客户比例', max: 100 },
                { name: '消费水平', max: 100 },
                { name: '活跃度', max: 100 },
                { name: '忠诚度', max: 100 },
            ],
            seriesData: [
                {
                    value: [
                        this.calculateYoungCustomerRatio(profileData),
                        this.calculateFemaleCustomerRatio(profileData),
                        this.calculateLocalCustomerRatio(profileData),
                        this.calculateSpendingLevel(profileData),
                        this.calculateActivityLevel(profileData),
                        this.calculateLoyaltyLevel(profileData),
                    ],
                    name: '客户画像',
                },
            ],
            industryBenchmark: this.getIndustryBenchmark(profile.industry),
        };
    }
    async getScatterChartData(profileId) {
        const dataPoints = [];
        const customerCount = 100;
        for (let i = 0; i < customerCount; i++) {
            const visitFrequency = Math.floor(Math.random() * 20) + 1;
            const spendingPerVisit = Math.floor(Math.random() * 500) + 50;
            const totalSpending = visitFrequency * spendingPerVisit;
            dataPoints.push({
                visitFrequency,
                spendingPerVisit,
                totalSpending,
                customerSegment: this.assignCustomerSegment(visitFrequency, totalSpending),
                customerId: `CUST${10000 + i}`,
            });
        }
        return {
            dataPoints,
            segments: {
                高频高价值: { color: '#fbbf24' },
                高频低价值: { color: '#38bdf8' },
                低频高价值: { color: '#10b981' },
                低频低价值: { color: '#8b5cf6' },
            },
            correlation: this.calculateCorrelation(dataPoints),
            insights: [
                '高频高价值客户占比约15%，贡献约45%的总消费额',
                '低频高价值客户客单价最高，但复购率低',
                '高频低价值客户粘性高，适合提升客单价',
            ],
        };
    }
    async getHeatmapChartData(profileId) {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const data = [];
        for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
            for (const hour of hours) {
                let value = 10 + Math.random() * 20;
                if (dayIndex < 5 && hour >= 10 && hour <= 18) {
                    value += 30 + Math.random() * 30;
                }
                if (dayIndex >= 5 && hour >= 18 && hour <= 22) {
                    value += 40 + Math.random() * 40;
                }
                if (hour >= 0 && hour <= 6) {
                    value *= 0.3;
                }
                data.push([dayIndex, hour, Math.round(value)]);
            }
        }
        return {
            xAxis: hours.map((h) => `${h}:00`),
            yAxis: days,
            data,
            peakPeriods: this.identifyPeakPeriods(data, days, hours),
            recommendations: [
                '工作日10-18点客户活跃度高，适合推送促销信息',
                '周末晚上18-22点是黄金时段，适合举办线上活动',
                '凌晨时段客户活跃度低，适合进行系统维护',
            ],
        };
    }
    async getFunnelChartData(profileId) {
        const funnelStages = [
            {
                name: '知晓',
                value: 10000,
                description: '通过广告、推荐等渠道知晓品牌',
            },
            { name: '访问', value: 6500, description: '访问线上平台或线下门店' },
            { name: '注册', value: 3200, description: '注册成为会员或关注账号' },
            { name: '首次消费', value: 1800, description: '完成首次购买或体验' },
            { name: '复购', value: 950, description: '完成第二次及以上消费' },
            { name: '忠诚客户', value: 420, description: '定期消费并推荐他人' },
        ];
        const conversionRates = [];
        for (let i = 0; i < funnelStages.length - 1; i++) {
            const rate = (funnelStages[i + 1].value / funnelStages[i].value) * 100;
            conversionRates.push({
                from: funnelStages[i].name,
                to: funnelStages[i + 1].name,
                rate: Math.round(rate * 10) / 10,
            });
        }
        return {
            funnelStages,
            conversionRates,
            totalConversionRate: Math.round((funnelStages[funnelStages.length - 1].value /
                funnelStages[0].value) *
                1000) / 10,
            bottlenecks: this.identifyFunnelBottlenecks(conversionRates),
            optimizationSuggestions: [
                '访问→注册转化率偏低，建议简化注册流程',
                '首次消费→复购转化率是关键，建议加强客户关系管理',
                '忠诚客户占比仍有提升空间，建议推出会员权益计划',
            ],
        };
    }
    async getSankeyChartData(profileId) {
        const segments = await this.customerSegmentRepository.find({
            where: { customerProfileId: profileId },
        });
        const nodes = segments.map((segment) => segment.segmentName);
        nodes.push('新增客户', '流失客户');
        const links = [
            { source: '新增客户', target: '高频高价值客户', value: 150 },
            { source: '新增客户', target: '年轻时尚族', value: 320 },
            { source: '年轻时尚族', target: '高频高价值客户', value: 85 },
            { source: '年轻时尚族', target: '家庭消费者', value: 120 },
            { source: '家庭消费者', target: '高频高价值客户', value: 65 },
            { source: '高频高价值客户', target: '流失客户', value: 25 },
            { source: '年轻时尚族', target: '流失客户', value: 95 },
            { source: '家庭消费者', target: '流失客户', value: 75 },
            { source: '商务人士', target: '高频高价值客户', value: 45 },
            { source: '商务人士', target: '流失客户', value: 60 },
            { source: '潜在流失客户', target: '流失客户', value: 180 },
            { source: '高频高价值客户', target: '潜在流失客户', value: 40 },
        ];
        return {
            nodes: nodes.map((name) => ({ name })),
            links,
            totalFlowIn: links
                .filter((l) => l.target === '流失客户')
                .reduce((sum, l) => sum + l.value, 0),
            totalFlowOut: links
                .filter((l) => l.source === '新增客户')
                .reduce((sum, l) => sum + l.value, 0),
            netGrowth: this.calculateNetGrowth(links),
            retentionInsights: [
                '年轻时尚族流失率较高，需加强年轻客户粘性',
                '高频高价值客户留存良好，应继续维护',
                '潜在流失客户转化是关键，需制定召回策略',
            ],
        };
    }
    async getAllChartData(profileId) {
        const [radarData, scatterData, heatmapData, funnelData, sankeyData] = await Promise.all([
            this.getRadarChartData(profileId),
            this.getScatterChartData(profileId),
            this.getHeatmapChartData(profileId),
            this.getFunnelChartData(profileId),
            this.getSankeyChartData(profileId),
        ]);
        return {
            radar: radarData,
            scatter: scatterData,
            heatmap: heatmapData,
            funnel: funnelData,
            sankey: sankeyData,
            generatedAt: new Date().toISOString(),
            profileId,
        };
    }
    calculateYoungCustomerRatio(profileData) {
        const ageDistribution = profileData.demographic?.ageDistribution || {};
        const youngRatio = (ageDistribution['18-25'] || 0) + (ageDistribution['26-35'] || 0);
        return Math.min(100, Math.round(youngRatio));
    }
    calculateFemaleCustomerRatio(profileData) {
        const genderDistribution = profileData.demographic?.genderDistribution || {};
        return genderDistribution.female || 50;
    }
    calculateLocalCustomerRatio(profileData) {
        const locationDistribution = profileData.demographic?.locationDistribution || {};
        return locationDistribution['5km内'] || 60;
    }
    calculateSpendingLevel(profileData) {
        const avgSpend = profileData.consumption?.averageMonthlySpend || 320;
        return Math.min(100, Math.round((avgSpend / 500) * 100));
    }
    calculateActivityLevel(profileData) {
        const avgFrequency = profileData.behavior?.averageVisitFrequency || 2.8;
        return Math.min(100, Math.round((avgFrequency / 8) * 100));
    }
    calculateLoyaltyLevel(profileData) {
        const retentionRate = profileData.loyalty?.retentionRate || {};
        const sixMonthRetention = retentionRate['6个月'] || 58;
        return Math.min(100, Math.round(sixMonthRetention));
    }
    getIndustryBenchmark(industry) {
        const benchmarks = {
            RETAIL: {
                youngRatio: 55,
                femaleRatio: 60,
                localRatio: 65,
                spending: 65,
                activity: 70,
                loyalty: 62,
            },
            ECOMMERCE: {
                youngRatio: 68,
                femaleRatio: 55,
                localRatio: 45,
                spending: 75,
                activity: 80,
                loyalty: 58,
            },
            FOOD_BEVERAGE: {
                youngRatio: 62,
                femaleRatio: 58,
                localRatio: 75,
                spending: 55,
                activity: 85,
                loyalty: 65,
            },
            EDUCATION: {
                youngRatio: 72,
                femaleRatio: 52,
                localRatio: 80,
                spending: 45,
                activity: 60,
                loyalty: 70,
            },
        };
        return benchmarks[industry] || benchmarks.RETAIL;
    }
    assignCustomerSegment(visitFrequency, totalSpending) {
        const avgSpendingPerVisit = totalSpending / visitFrequency;
        if (visitFrequency >= 8 && avgSpendingPerVisit >= 300)
            return '高频高价值';
        if (visitFrequency >= 8 && avgSpendingPerVisit < 300)
            return '高频低价值';
        if (visitFrequency < 8 && avgSpendingPerVisit >= 300)
            return '低频高价值';
        return '低频低价值';
    }
    calculateCorrelation(dataPoints) {
        const n = dataPoints.length;
        const sumX = dataPoints.reduce((sum, p) => sum + p.visitFrequency, 0);
        const sumY = dataPoints.reduce((sum, p) => sum + p.spendingPerVisit, 0);
        const sumXY = dataPoints.reduce((sum, p) => sum + p.visitFrequency * p.spendingPerVisit, 0);
        const sumX2 = dataPoints.reduce((sum, p) => sum + p.visitFrequency * p.visitFrequency, 0);
        const sumY2 = dataPoints.reduce((sum, p) => sum + p.spendingPerVisit * p.spendingPerVisit, 0);
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        return denominator === 0
            ? 0
            : Math.round((numerator / denominator) * 100) / 100;
    }
    identifyPeakPeriods(data, days, hours) {
        const periods = data.map(([dayIndex, hour, value]) => ({
            day: days[dayIndex],
            hour: `${hour}:00`,
            value,
        }));
        return periods.sort((a, b) => b.value - a.value).slice(0, 5);
    }
    identifyFunnelBottlenecks(conversionRates) {
        const bottlenecks = [];
        const lowestRate = Math.min(...conversionRates.map((cr) => cr.rate));
        for (const cr of conversionRates) {
            if (cr.rate === lowestRate) {
                bottlenecks.push(`${cr.from}→${cr.to}（转化率仅${cr.rate}%）`);
            }
        }
        return bottlenecks;
    }
    calculateNetGrowth(links) {
        const inflow = links
            .filter((l) => l.target === '流失客户')
            .reduce((sum, l) => sum + l.value, 0);
        const outflow = links
            .filter((l) => l.source === '新增客户')
            .reduce((sum, l) => sum + l.value, 0);
        return outflow - inflow;
    }
};
exports.CustomerAnalyticsService = CustomerAnalyticsService;
exports.CustomerAnalyticsService = CustomerAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_profile_entity_1.CustomerProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_segment_entity_1.CustomerSegment)),
    __param(2, (0, typeorm_1.InjectRepository)(data_import_job_entity_1.DataImportJob)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CustomerAnalyticsService);
//# sourceMappingURL=customer-analytics.service.js.map