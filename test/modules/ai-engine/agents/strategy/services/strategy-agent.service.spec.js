"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const strategy_agent_service_1 = require("./strategy-agent.service");
const gemini_service_1 = require("../../../../data-analytics/services/gemini.service");
const qwen_service_1 = require("../../../../data-analytics/services/qwen.service");
const platform_enum_1 = require("../../../../../shared/enums/platform.enum");
describe('StrategyAgentService', () => {
    let service;
    let geminiService;
    let configService;
    beforeEach(async () => {
        const mockGeminiService = {
            isGeminiAvailable: jest.fn(),
            generateContent: jest.fn(),
        };
        const mockQwenService = {};
        const mockConfigService = {
            get: jest.fn().mockReturnValue('gemini'),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                strategy_agent_service_1.StrategyAgentService,
                { provide: gemini_service_1.GeminiService, useValue: mockGeminiService },
                { provide: qwen_service_1.QwenService, useValue: mockQwenService },
                { provide: config_1.ConfigService, useValue: mockConfigService },
            ],
        }).compile();
        service = module.get(strategy_agent_service_1.StrategyAgentService);
        geminiService = module.get(gemini_service_1.GeminiService);
        configService = module.get(config_1.ConfigService);
    });
    it('应该被正确定义', () => {
        expect(service).toBeDefined();
    });
    describe('execute', () => {
        it('当AI引擎可用时应成功执行策划', async () => {
            const analysisResults = {
                marketInsights: {
                    trends: ['数字化转型加速', '个性化需求增长', '社交电商兴起'],
                    opportunities: ['AI营销工具', '个性化推荐', '社交裂变'],
                    threats: ['竞争加剧', '隐私法规趋严'],
                },
                targetAudience: {
                    segments: [
                        {
                            name: '核心用户',
                            description: '高价值用户群体',
                            characteristics: ['高活跃度', '高消费'],
                            proportion: 20,
                            priority: 5,
                        },
                    ],
                    persona: {
                        name: '典型用户',
                        demographics: {
                            ageRange: '25-35岁',
                            gender: '女',
                            education: '本科',
                            occupation: '白领',
                            incomeLevel: '中等收入',
                        },
                        behaviors: ['频繁购物', '关注品牌'],
                        painPoints: ['选择困难', '时间有限'],
                        motivations: ['品质生活', '社交认可'],
                    },
                    sizeEstimation: 1000000,
                },
                competitorAnalysis: {
                    mainCompetitors: [
                        {
                            name: '竞争对手A',
                            marketShare: 25,
                            strengths: ['品牌强', '渠道广'],
                            weaknesses: ['创新慢', '价格高'],
                            strategies: ['品牌营销', '渠道扩张'],
                        },
                    ],
                    competitiveAdvantage: ['技术先进', '用户体验好'],
                    gaps: ['品牌知名度低', '市场份额小'],
                },
                recommendations: ['建议1', '建议2', '建议3', '建议4', '建议5'],
            };
            const input = {
                analysisResults,
                currentEvents: [
                    {
                        id: 'event1',
                        title: '行业展会',
                        description: '年度行业展览会',
                        date: '2026-04-15',
                        relevance: 'high',
                        tags: ['展会', '行业', '交流'],
                    },
                ],
                holidays: [
                    {
                        name: '劳动节',
                        date: '2026-05-01',
                        type: 'national',
                        description: '五一劳动节假期',
                        marketingOpportunity: true,
                    },
                ],
                budgetConstraints: {
                    totalBudget: 100000,
                    currency: 'CNY',
                    breakdown: [
                        { channel: 'social_media', amount: 30000, percentage: 30 },
                        { channel: 'content', amount: 25000, percentage: 25 },
                        { channel: 'ads', amount: 45000, percentage: 45 },
                    ],
                    constraints: ['预算有限', 'ROI要求高'],
                },
                timeline: {
                    startDate: '2026-04-01',
                    endDate: '2026-06-30',
                    durationDays: 91,
                },
            };
            geminiService.isGeminiAvailable.mockReturnValue(true);
            geminiService.generateContent.mockResolvedValue({
                success: true,
                content: {
                    title: '策划方案',
                    content: JSON.stringify({
                        campaignTheme: {
                            name: '数字创新营销战役',
                            slogan: '创新引领未来',
                            visualStyle: '现代科技风格，蓝白主色调',
                            keyMessages: ['技术创新', '用户体验', '价值创造'],
                            toneOfVoice: 'professional',
                        },
                        marketingStrategy: {
                            objectives: [
                                '品牌知名度提升30%',
                                '获取5000销售线索',
                                '实现300万销售额',
                            ],
                            tactics: [
                                {
                                    name: '内容营销',
                                    description: '通过高质量内容建立思想领导力',
                                    targetAudience: ['决策者', '行业专家'],
                                    channels: ['官网', '行业媒体', '社交媒体'],
                                    timeline: { startWeek: 1, endWeek: 12 },
                                    successMetrics: ['阅读量', '分享数', '线索数'],
                                    requiredResources: ['内容团队', '设计支持'],
                                },
                            ],
                            channels: [
                                {
                                    channel: 'wechat',
                                    name: '微信公众号',
                                    targetAudience: ['现有客户', '行业从业者'],
                                    budgetAllocation: 30000,
                                    percentage: 30,
                                    keyActions: ['每周推送', '线上活动', '用户互动'],
                                    metrics: ['阅读量', '关注增长', '互动率'],
                                },
                            ],
                            targetAudienceSegments: ['核心用户', '潜力用户'],
                        },
                        activityPlan: {
                            timeline: [
                                {
                                    weekNumber: 1,
                                    dateRange: '第1周',
                                    keyActivities: ['项目启动', '资源准备'],
                                    deliverables: ['计划书', '分工表'],
                                    responsibleParty: '项目经理',
                                },
                            ],
                            keyActions: ['建立机制', '制定流程', '设置监测'],
                            dependencies: ['设计资源', '内容审核', '技术支持'],
                            riskMitigation: ['备用供应商', '应急预案', '快速决策'],
                        },
                        budgetPlan: {
                            totalBudget: 100000,
                            currency: 'CNY',
                            breakdown: [
                                {
                                    category: '内容制作',
                                    subcategory: '文章/视频',
                                    amount: 30000,
                                    percentage: 30,
                                    justification: '基础内容',
                                },
                            ],
                            roiEstimation: 2.5,
                            roiExplanation: '预期回报',
                            contingencyBudget: 10000,
                        },
                        successMetrics: {
                            kpis: [
                                {
                                    name: '品牌曝光',
                                    target: 1000000,
                                    unit: '次',
                                    measurementMethod: '媒体监测',
                                },
                            ],
                            measurementTimeline: ['前测', '中测', '后测'],
                            reportingFrequency: 'weekly',
                        },
                        riskAssessment: {
                            risks: [
                                {
                                    description: '预算风险',
                                    probability: 'medium',
                                    impact: 'high',
                                    mitigationStrategy: '预算控制',
                                },
                            ],
                            overallRiskLevel: 'medium',
                        },
                    }),
                    hashtags: [],
                    platform: platform_enum_1.Platform.STRATEGY,
                    tone: 'professional',
                    wordCount: 2000,
                    estimatedReadingTime: '10分钟',
                },
                qualityAssessment: {
                    score: 85,
                    metrics: {
                        readability: 90,
                        engagement: 80,
                        relevance: 85,
                        originality: 80,
                        platformFit: 85,
                    },
                    feedback: '质量优秀',
                    improvementSuggestions: [],
                },
                processingTime: 1500,
                modelUsed: 'gemini-2.5-flash',
            });
            configService.get.mockReturnValue('gemini');
            const result = await service.execute(input);
            expect(result).toBeDefined();
            expect(result.campaignTheme).toBeDefined();
            expect(result.marketingStrategy).toBeDefined();
            expect(result.activityPlan).toBeDefined();
            expect(result.budgetPlan).toBeDefined();
            expect(geminiService.generateContent).toHaveBeenCalled();
        });
        it('当AI引擎不可用时应返回回退策划', async () => {
            const analysisResults = {
                marketInsights: {
                    trends: ['趋势1'],
                    opportunities: ['机会1'],
                    threats: ['威胁1'],
                },
                targetAudience: {
                    segments: [
                        {
                            name: '测试分群',
                            description: '测试描述',
                            characteristics: ['测试特征'],
                            proportion: 100,
                            priority: 1,
                        },
                    ],
                    persona: {
                        name: '测试画像',
                        demographics: {
                            ageRange: '25-35',
                            gender: '女',
                            education: '本科',
                            occupation: '白领',
                            incomeLevel: '中等',
                        },
                        behaviors: ['测试行为'],
                        painPoints: ['测试痛点'],
                        motivations: ['测试动机'],
                    },
                    sizeEstimation: 50000,
                },
                competitorAnalysis: {
                    mainCompetitors: [
                        {
                            name: '测试对手',
                            marketShare: 10,
                            strengths: ['测试优势'],
                            weaknesses: ['测试劣势'],
                            strategies: ['测试策略'],
                        },
                    ],
                    competitiveAdvantage: ['测试优势'],
                    gaps: ['测试差距'],
                },
                recommendations: ['测试建议'],
            };
            const input = {
                analysisResults,
                currentEvents: [],
                holidays: [],
                budgetConstraints: {
                    totalBudget: 50000,
                    currency: 'CNY',
                    breakdown: [{ channel: 'test', amount: 50000, percentage: 100 }],
                    constraints: [],
                },
                timeline: {
                    startDate: '2026-01-01',
                    endDate: '2026-01-31',
                    durationDays: 31,
                },
            };
            geminiService.isGeminiAvailable.mockReturnValue(false);
            configService.get.mockReturnValue('gemini');
            const result = await service.execute(input);
            expect(result).toBeDefined();
            expect(result.campaignTheme.name).toBeDefined();
            expect(result.marketingStrategy.objectives.length).toBeGreaterThan(0);
            expect(result.budgetPlan.totalBudget).toBe(input.budgetConstraints.totalBudget);
            expect(geminiService.generateContent).not.toHaveBeenCalled();
        });
        it('当AI生成失败时应返回回退策划', async () => {
            const analysisResults = {
                marketInsights: {
                    trends: ['趋势1'],
                    opportunities: ['机会1'],
                    threats: ['威胁1'],
                },
                targetAudience: {
                    segments: [],
                    persona: {
                        name: '测试',
                        demographics: {
                            ageRange: '25-35',
                            gender: '女',
                            education: '本科',
                            occupation: '白领',
                            incomeLevel: '中等',
                        },
                        behaviors: [],
                        painPoints: [],
                        motivations: [],
                    },
                    sizeEstimation: 0,
                },
                competitorAnalysis: {
                    mainCompetitors: [],
                    competitiveAdvantage: [],
                    gaps: [],
                },
                recommendations: [],
            };
            const input = {
                analysisResults,
                currentEvents: [],
                holidays: [],
                budgetConstraints: {
                    totalBudget: 10000,
                    currency: 'CNY',
                    breakdown: [{ channel: 'test', amount: 10000, percentage: 100 }],
                    constraints: [],
                },
                timeline: {
                    startDate: '2026-01-01',
                    endDate: '2026-01-07',
                    durationDays: 7,
                },
            };
            geminiService.isGeminiAvailable.mockReturnValue(true);
            geminiService.generateContent.mockRejectedValue(new Error('AI生成失败'));
            configService.get.mockReturnValue('gemini');
            const result = await service.execute(input);
            expect(result).toBeDefined();
            expect(result.campaignTheme.name).toBeDefined();
            expect(result.marketingStrategy.objectives.length).toBeGreaterThan(0);
        });
    });
    describe('parseStrategyResponse', () => {
        it('应正确解析有效的AI响应', async () => {
            const validResponse = JSON.stringify({
                campaignTheme: {
                    name: '测试活动',
                    slogan: '测试口号',
                    visualStyle: '测试风格',
                    keyMessages: ['消息1', '消息2'],
                    toneOfVoice: 'professional',
                },
                marketingStrategy: {
                    objectives: ['目标1', '目标2'],
                    tactics: [
                        {
                            name: '战术1',
                            description: '描述',
                            targetAudience: ['受众1'],
                            channels: ['渠道1'],
                            timeline: { startWeek: 1, endWeek: 4 },
                            successMetrics: ['指标1'],
                            requiredResources: ['资源1'],
                        },
                    ],
                    channels: [
                        {
                            channel: 'wechat',
                            name: '微信',
                            targetAudience: ['受众1'],
                            budgetAllocation: 10000,
                            percentage: 50,
                            keyActions: ['行动1'],
                            metrics: ['指标1'],
                        },
                    ],
                    targetAudienceSegments: ['分群1'],
                },
                activityPlan: {
                    timeline: [
                        {
                            weekNumber: 1,
                            dateRange: '第1周',
                            keyActivities: ['活动1'],
                            deliverables: ['交付物1'],
                            responsibleParty: '负责人',
                        },
                    ],
                    keyActions: ['关键行动1'],
                    dependencies: ['依赖1'],
                    riskMitigation: ['缓解1'],
                },
                budgetPlan: {
                    totalBudget: 20000,
                    currency: 'CNY',
                    breakdown: [
                        {
                            category: '类别1',
                            subcategory: '子类1',
                            amount: 10000,
                            percentage: 50,
                            justification: '理由1',
                        },
                    ],
                    roiEstimation: 2.0,
                    roiExplanation: '解释',
                    contingencyBudget: 2000,
                },
            });
            geminiService.isGeminiAvailable.mockReturnValue(true);
            geminiService.generateContent.mockResolvedValue({
                success: true,
                content: {
                    title: '测试',
                    content: validResponse,
                    hashtags: [],
                    platform: platform_enum_1.Platform.STRATEGY,
                    tone: 'professional',
                    wordCount: 100,
                    estimatedReadingTime: '1分钟',
                },
                qualityAssessment: {
                    score: 80,
                    metrics: {
                        readability: 80,
                        engagement: 80,
                        relevance: 80,
                        originality: 80,
                        platformFit: 80,
                    },
                    feedback: '良好',
                    improvementSuggestions: [],
                },
                processingTime: 100,
                modelUsed: 'gemini',
            });
            configService.get.mockReturnValue('gemini');
            const analysisResults = {
                marketInsights: { trends: [], opportunities: [], threats: [] },
                targetAudience: {
                    segments: [],
                    persona: {
                        name: '测试',
                        demographics: {
                            ageRange: '25-35',
                            gender: '女',
                            education: '本科',
                            occupation: '白领',
                            incomeLevel: '中等',
                        },
                        behaviors: [],
                        painPoints: [],
                        motivations: [],
                    },
                    sizeEstimation: 0,
                },
                competitorAnalysis: {
                    mainCompetitors: [],
                    competitiveAdvantage: [],
                    gaps: [],
                },
                recommendations: [],
            };
            const input = {
                analysisResults,
                currentEvents: [],
                holidays: [],
                budgetConstraints: {
                    totalBudget: 20000,
                    currency: 'CNY',
                    breakdown: [{ channel: 'test', amount: 20000, percentage: 100 }],
                    constraints: [],
                },
                timeline: {
                    startDate: '2026-01-01',
                    endDate: '2026-01-31',
                    durationDays: 31,
                },
            };
            const result = await service.execute(input);
            expect(result).toBeDefined();
            expect(result.campaignTheme.name).toBe('测试活动');
            expect(result.budgetPlan.totalBudget).toBe(20000);
        });
        it('当AI响应缺少必需字段时应补充默认值', async () => {
            const partialResponse = JSON.stringify({
                campaignTheme: {
                    name: '测试活动',
                    slogan: '测试口号',
                    visualStyle: '测试风格',
                    keyMessages: [],
                    toneOfVoice: 'professional',
                },
                marketingStrategy: {
                    objectives: ['目标1'],
                    tactics: [],
                    channels: [],
                    targetAudienceSegments: [],
                },
                activityPlan: {
                    timeline: [],
                    keyActions: [],
                    dependencies: [],
                    riskMitigation: [],
                },
                budgetPlan: {
                    totalBudget: 10000,
                    currency: 'CNY',
                    breakdown: [],
                    roiEstimation: 1.5,
                    roiExplanation: '测试',
                    contingencyBudget: 1000,
                },
            });
            geminiService.isGeminiAvailable.mockReturnValue(true);
            geminiService.generateContent.mockResolvedValue({
                success: true,
                content: {
                    title: '测试',
                    content: partialResponse,
                    hashtags: [],
                    platform: platform_enum_1.Platform.STRATEGY,
                    tone: 'professional',
                    wordCount: 100,
                    estimatedReadingTime: '1分钟',
                },
                qualityAssessment: {
                    score: 80,
                    metrics: {
                        readability: 80,
                        engagement: 80,
                        relevance: 80,
                        originality: 80,
                        platformFit: 80,
                    },
                    feedback: '良好',
                    improvementSuggestions: [],
                },
                processingTime: 100,
                modelUsed: 'gemini',
            });
            configService.get.mockReturnValue('gemini');
            const analysisResults = {
                marketInsights: { trends: [], opportunities: [], threats: [] },
                targetAudience: {
                    segments: [],
                    persona: {
                        name: '测试',
                        demographics: {
                            ageRange: '25-35',
                            gender: '女',
                            education: '本科',
                            occupation: '白领',
                            incomeLevel: '中等',
                        },
                        behaviors: [],
                        painPoints: [],
                        motivations: [],
                    },
                    sizeEstimation: 0,
                },
                competitorAnalysis: {
                    mainCompetitors: [],
                    competitiveAdvantage: [],
                    gaps: [],
                },
                recommendations: [],
            };
            const input = {
                analysisResults,
                currentEvents: [],
                holidays: [],
                budgetConstraints: {
                    totalBudget: 10000,
                    currency: 'CNY',
                    breakdown: [{ channel: 'test', amount: 10000, percentage: 100 }],
                    constraints: [],
                },
                timeline: {
                    startDate: '2026-01-01',
                    endDate: '2026-01-07',
                    durationDays: 7,
                },
            };
            const result = await service.execute(input);
            expect(result).toBeDefined();
            expect(result.successMetrics).toBeDefined();
            expect(result.successMetrics.kpis.length).toBeGreaterThan(0);
            expect(result.riskAssessment).toBeDefined();
            expect(result.riskAssessment.risks.length).toBeGreaterThan(0);
        });
    });
    describe('adjustStrategyWithConstraints', () => {
        it('应根据预算约束调整策划方案', async () => {
            const analysisResults = {
                marketInsights: { trends: [], opportunities: [], threats: [] },
                targetAudience: {
                    segments: [],
                    persona: {
                        name: '测试',
                        demographics: {
                            ageRange: '25-35',
                            gender: '女',
                            education: '本科',
                            occupation: '白领',
                            incomeLevel: '中等',
                        },
                        behaviors: [],
                        painPoints: [],
                        motivations: [],
                    },
                    sizeEstimation: 0,
                },
                competitorAnalysis: {
                    mainCompetitors: [],
                    competitiveAdvantage: [],
                    gaps: [],
                },
                recommendations: [],
            };
            const input = {
                analysisResults,
                currentEvents: [],
                holidays: [],
                budgetConstraints: {
                    totalBudget: 50000,
                    currency: 'CNY',
                    breakdown: [{ channel: 'test', amount: 50000, percentage: 100 }],
                    constraints: [],
                },
                timeline: {
                    startDate: '2026-01-01',
                    endDate: '2026-03-01',
                    durationDays: 60,
                },
            };
            geminiService.isGeminiAvailable.mockReturnValue(false);
            configService.get.mockReturnValue('gemini');
            const result = await service.execute(input);
            expect(result.budgetPlan.totalBudget).toBe(50000);
            expect(result.budgetPlan.breakdown[0].amount).toBe(50000 * 0.3);
            expect(result.successMetrics.kpis[0].target).toBeDefined();
        });
    });
});
//# sourceMappingURL=strategy-agent.service.spec.js.map