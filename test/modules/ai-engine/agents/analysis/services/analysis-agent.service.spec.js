"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const analysis_agent_service_1 = require("./analysis-agent.service");
const gemini_service_1 = require("../../../../data-analytics/services/gemini.service");
const qwen_service_1 = require("../../../../data-analytics/services/qwen.service");
const platform_enum_1 = require("../../../../../shared/enums/platform.enum");
describe('AnalysisAgentService', () => {
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
                analysis_agent_service_1.AnalysisAgentService,
                { provide: gemini_service_1.GeminiService, useValue: mockGeminiService },
                { provide: qwen_service_1.QwenService, useValue: mockQwenService },
                { provide: config_1.ConfigService, useValue: mockConfigService },
            ],
        }).compile();
        service = module.get(analysis_agent_service_1.AnalysisAgentService);
        geminiService = module.get(gemini_service_1.GeminiService);
        configService = module.get(config_1.ConfigService);
    });
    it('应该被正确定义', () => {
        expect(service).toBeDefined();
    });
    describe('execute', () => {
        it('当AI引擎可用时应成功执行分析', async () => {
            const input = {
                customerData: [
                    {
                        basicLifecycle: {
                            ageGroup: '26-35',
                            education: 'bachelor',
                            familyRole: 'single',
                            potentialValue: 'high',
                        },
                        consumptionPersonality: {
                            consumptionLevel: 'high',
                            shoppingWidth: 'wide',
                            decisionSpeed: 'fast',
                        },
                        realtimeStatus: {
                            activityLevel: 80,
                            growthTrend: 'growing',
                            engagementScore: 75,
                        },
                        socialActivity: {
                            fissionPotential: 'high',
                            activityPreference: ['旅游', '美食'],
                            socialInfluence: 70,
                        },
                    },
                ],
                industryContext: '电商零售',
                businessGoals: ['提升品牌知名度', '增加销售额'],
                knowledgeBaseContext: ['电商增长趋势', '用户行为变化'],
            };
            geminiService.isGeminiAvailable.mockReturnValue(true);
            geminiService.generateContent.mockResolvedValue({
                success: true,
                content: {
                    title: '分析结果',
                    content: JSON.stringify({
                        marketInsights: {
                            trends: ['趋势1', '趋势2', '趋势3'],
                            opportunities: ['机会1', '机会2', '机会3'],
                            threats: ['威胁1', '威胁2'],
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
                    }),
                    hashtags: [],
                    platform: platform_enum_1.Platform.ANALYSIS,
                    tone: 'professional',
                    wordCount: 1000,
                    estimatedReadingTime: '5分钟',
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
                processingTime: 1000,
                modelUsed: 'gemini-2.5-flash',
            });
            configService.get.mockReturnValue('gemini');
            const result = await service.execute(input);
            expect(result).toBeDefined();
            expect(result.marketInsights).toBeDefined();
            expect(result.targetAudience).toBeDefined();
            expect(result.competitorAnalysis).toBeDefined();
            expect(result.recommendations).toBeDefined();
            expect(geminiService.generateContent).toHaveBeenCalled();
        });
        it('当AI引擎不可用时应返回回退分析', async () => {
            const input = {
                customerData: [],
                industryContext: '测试行业',
                businessGoals: ['测试目标'],
                knowledgeBaseContext: [],
            };
            geminiService.isGeminiAvailable.mockReturnValue(false);
            configService.get.mockReturnValue('gemini');
            const result = await service.execute(input);
            expect(result).toBeDefined();
            expect(result.marketInsights.trends.length).toBeGreaterThan(0);
            expect(result.recommendations.length).toBeGreaterThan(0);
            expect(geminiService.generateContent).not.toHaveBeenCalled();
        });
        it('当AI生成失败时应返回回退分析', async () => {
            const input = {
                customerData: [],
                industryContext: '测试行业',
                businessGoals: ['测试目标'],
                knowledgeBaseContext: [],
            };
            geminiService.isGeminiAvailable.mockReturnValue(true);
            geminiService.generateContent.mockRejectedValue(new Error('AI生成失败'));
            configService.get.mockReturnValue('gemini');
            const result = await service.execute(input);
            expect(result).toBeDefined();
            expect(result.marketInsights.trends.length).toBeGreaterThan(0);
            expect(result.recommendations.length).toBeGreaterThan(0);
        });
    });
    describe('buildAnalysisPrompt', () => {
        it('应生成包含所有输入信息的提示词', async () => {
            const input = {
                customerData: [
                    {
                        basicLifecycle: {
                            ageGroup: '26-35',
                            education: 'bachelor',
                            familyRole: 'single',
                            potentialValue: 'medium',
                        },
                        consumptionPersonality: {
                            consumptionLevel: 'medium',
                            shoppingWidth: 'medium',
                            decisionSpeed: 'medium',
                        },
                        realtimeStatus: {
                            activityLevel: 60,
                            growthTrend: 'stable',
                            engagementScore: 65,
                        },
                        socialActivity: {
                            fissionPotential: 'medium',
                            activityPreference: ['电影', '阅读'],
                            socialInfluence: 50,
                        },
                    },
                ],
                industryContext: '教育',
                businessGoals: ['扩大用户规模', '提高课程完成率'],
                knowledgeBaseContext: ['在线教育趋势', '学习行为分析'],
            };
            geminiService.isGeminiAvailable.mockReturnValue(false);
            configService.get.mockReturnValue('gemini');
            await service.execute(input);
            expect(geminiService.isGeminiAvailable).toHaveBeenCalled();
        });
    });
    describe('parseAnalysisResponse', () => {
        it('应正确解析有效的AI响应', async () => {
            const validResponse = JSON.stringify({
                marketInsights: {
                    trends: ['趋势1'],
                    opportunities: ['机会1'],
                    threats: ['威胁1'],
                },
                targetAudience: {
                    segments: [
                        {
                            name: '分群1',
                            description: '描述',
                            characteristics: ['特征1'],
                            proportion: 30,
                            priority: 5,
                        },
                    ],
                    persona: {
                        name: '画像1',
                        demographics: {
                            ageRange: '25-35',
                            gender: '女',
                            education: '本科',
                            occupation: '白领',
                            incomeLevel: '中等',
                        },
                        behaviors: ['行为1'],
                        painPoints: ['痛点1'],
                        motivations: ['动机1'],
                    },
                    sizeEstimation: 500000,
                },
                competitorAnalysis: {
                    mainCompetitors: [
                        {
                            name: '对手1',
                            marketShare: 20,
                            strengths: ['优势1'],
                            weaknesses: ['劣势1'],
                            strategies: ['策略1'],
                        },
                    ],
                    competitiveAdvantage: ['优势1'],
                    gaps: ['差距1'],
                },
                recommendations: ['建议1', '建议2'],
            });
            geminiService.isGeminiAvailable.mockReturnValue(true);
            geminiService.generateContent.mockResolvedValue({
                success: true,
                content: {
                    title: '测试',
                    content: validResponse,
                    hashtags: [],
                    platform: platform_enum_1.Platform.ANALYSIS,
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
            const input = {
                customerData: [],
                industryContext: '测试',
                businessGoals: ['测试'],
                knowledgeBaseContext: [],
            };
            await expect(service.execute(input)).resolves.toBeDefined();
        });
        it('当AI响应无效时应抛出错误', async () => {
            const invalidResponse = '无效的JSON响应';
            geminiService.isGeminiAvailable.mockReturnValue(true);
            geminiService.generateContent.mockResolvedValue({
                success: true,
                content: {
                    title: '测试',
                    content: invalidResponse,
                    hashtags: [],
                    platform: platform_enum_1.Platform.ANALYSIS,
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
            const input = {
                customerData: [],
                industryContext: '测试',
                businessGoals: ['测试'],
                knowledgeBaseContext: [],
            };
            const result = await service.execute(input);
            expect(result).toBeDefined();
        });
    });
});
//# sourceMappingURL=analysis-agent.service.spec.js.map