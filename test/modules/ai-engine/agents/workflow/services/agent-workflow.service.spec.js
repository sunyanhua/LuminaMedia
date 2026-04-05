"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const agent_workflow_service_1 = require("./agent-workflow.service");
const analysis_agent_service_1 = require("../../analysis/services/analysis-agent.service");
const strategy_agent_service_1 = require("../../strategy/services/strategy-agent.service");
const copywriting_agent_service_1 = require("../../copywriting/services/copywriting-agent.service");
const knowledge_retrieval_service_1 = require("../../analysis/services/knowledge-retrieval.service");
const workflow_agent_interface_1 = require("../interfaces/workflow-agent.interface");
const mockAnalysisAgentService = {
    execute: jest.fn(),
};
const mockStrategyAgentService = {
    execute: jest.fn(),
};
const mockCopywritingAgentService = {
    execute: jest.fn(),
};
const mockConfigService = {
    get: jest.fn(),
};
const mockKnowledgeRetrievalService = {
    retrieveRelevantKnowledge: jest.fn(),
};
describe('AgentWorkflowService', () => {
    let service;
    let analysisAgent;
    let strategyAgent;
    let copywritingAgent;
    let configService;
    beforeEach(async () => {
        jest.clearAllMocks();
        mockConfigService.get.mockImplementation((key, defaultValue) => {
            const configMap = {
                WORKFLOW_ENABLE_HUMAN_INTERVENTION: false,
                WORKFLOW_ANALYSIS_TIMEOUT: 30000,
                WORKFLOW_STRATEGY_TIMEOUT: 30000,
                WORKFLOW_COPYWRITING_TIMEOUT: 30000,
                WORKFLOW_TOTAL_TIMEOUT: 120000,
                WORKFLOW_MAX_RETRY_ATTEMPTS: 3,
                WORKFLOW_LOG_LEVEL: 'info',
                AI_ENGINE: 'gemini',
            };
            return configMap[key] || defaultValue;
        });
        mockKnowledgeRetrievalService.retrieveRelevantKnowledge.mockResolvedValue([
            '电商市场规模持续增长',
            '个性化推荐提升转化率',
            '社交媒体营销成为重要渠道',
        ]);
        mockAnalysisAgentService.execute.mockResolvedValue({
            marketInsights: {
                trends: ['趋势1', '趋势2', '趋势3'],
                opportunities: ['机会1', '机会2', '机会3'],
                threats: ['威胁1', '威胁2'],
            },
            targetAudience: {
                segments: [
                    {
                        name: '核心用户',
                        description: '高活跃度用户',
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
                    behaviors: ['使用社交媒体', '关注品牌'],
                    painPoints: ['信息过载', '缺乏个性化'],
                    motivations: ['寻求优质产品', '希望专属体验'],
                },
                sizeEstimation: 1000000,
            },
            competitorAnalysis: {
                mainCompetitors: [
                    {
                        name: '竞争对手A',
                        marketShare: 25,
                        strengths: ['品牌强', '渠道广'],
                        weaknesses: ['创新慢', '体验一般'],
                        strategies: ['品牌营销', '渠道扩张'],
                    },
                ],
                competitiveAdvantage: ['技术驱动', '数据精准'],
                gaps: ['品牌待提升', '覆盖待扩大'],
            },
            recommendations: ['建议1', '建议2', '建议3', '建议4', '建议5'],
        });
        mockStrategyAgentService.execute.mockResolvedValue({
            campaignTheme: {
                name: '品牌焕新活动',
                slogan: '焕新体验，卓越未来',
                visualStyle: '现代简约',
            },
            marketingStrategy: {
                objectives: ['提升品牌认知', '增加用户参与'],
                tactics: [
                    {
                        name: '社交媒体营销',
                        description: '通过社交媒体发布内容',
                        channels: ['微信', '微博'],
                    },
                ],
                channels: [
                    {
                        name: '微信公众号',
                        description: '发布图文内容',
                        priority: 5,
                    },
                ],
            },
            activityPlan: {
                timeline: [
                    {
                        date: new Date(),
                        action: '活动启动',
                        description: '发布活动主题',
                    },
                ],
                keyActions: ['内容创作', '渠道发布'],
                dependencies: ['设计资源', '技术开发'],
            },
            budgetPlan: {
                totalBudget: 50000,
                breakdown: [
                    {
                        category: '内容创作',
                        amount: 20000,
                        percentage: 40,
                    },
                ],
                roiEstimation: 1.5,
            },
        });
        mockCopywritingAgentService.execute.mockResolvedValue({
            platformContents: {
                wechat: {
                    title: '品牌焕新，体验升级',
                    content: '我们很高兴推出全新的品牌体验...',
                    summary: '品牌升级带来更好体验',
                    hashtags: ['#品牌焕新', '#体验升级'],
                },
                xiaohongshu: {
                    title: '亲测好用的品牌焕新体验',
                    content: '今天来分享一个超赞的品牌焕新体验...',
                    summary: '个人体验分享',
                    hashtags: ['#好物分享', '#品牌推荐'],
                },
                weibo: {
                    title: '#品牌焕新# 全新体验上线',
                    content: '期待已久的品牌焕新终于来了...',
                    summary: '品牌焕新公告',
                    hashtags: ['#品牌焕新', '#全新体验'],
                },
                douyin: {
                    title: '品牌焕新，一镜到底',
                    content: '点击观看品牌焕新全过程...',
                    summary: '视频展示焕新过程',
                    hashtags: ['#品牌焕新', '#一镜到底'],
                },
            },
            visualSuggestions: {
                coverImages: [
                    {
                        description: '品牌焕新主题封面',
                        style: '现代简约',
                        colorPalette: ['#FF6B6B', '#4ECDC4'],
                        aspectRatio: '16:9',
                    },
                ],
                contentImages: [
                    {
                        description: '产品展示图',
                        style: '干净简洁',
                        colorPalette: ['#FFFFFF', '#F0F0F0'],
                        aspectRatio: '4:3',
                    },
                ],
                videoScripts: [
                    {
                        title: '品牌焕新故事',
                        duration: 60,
                        scenes: [
                            {
                                scene: 1,
                                description: '开场展示旧品牌',
                                duration: 10,
                                visuals: ['旧品牌标识', '用户反馈画面'],
                            },
                        ],
                        voiceover: '品牌焕新，体验升级...',
                    },
                ],
                colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
            },
            schedulingPlan: {
                publishSchedule: [
                    {
                        platform: 'wechat',
                        scheduledTime: new Date(),
                        contentType: 'article',
                    },
                ],
                contentCalendar: [
                    {
                        date: new Date(),
                        events: ['品牌焕新活动启动'],
                    },
                ],
                optimizationTips: [
                    '选择高峰时段发布',
                    '使用热门话题标签',
                    '互动引导增加参与',
                ],
            },
            complianceCheck: {
                platformRules: [
                    {
                        rule: '广告标识',
                        check: true,
                        details: '内容包含广告标识',
                    },
                ],
                legalReview: [
                    {
                        aspect: '版权',
                        check: true,
                        details: '内容无版权问题',
                    },
                ],
                riskAssessment: 'low',
            },
        });
        const module = await testing_1.Test.createTestingModule({
            providers: [
                agent_workflow_service_1.AgentWorkflowService,
                {
                    provide: analysis_agent_service_1.AnalysisAgentService,
                    useValue: mockAnalysisAgentService,
                },
                {
                    provide: strategy_agent_service_1.StrategyAgentService,
                    useValue: mockStrategyAgentService,
                },
                {
                    provide: copywriting_agent_service_1.CopywritingAgentService,
                    useValue: mockCopywritingAgentService,
                },
                {
                    provide: config_1.ConfigService,
                    useValue: mockConfigService,
                },
                {
                    provide: knowledge_retrieval_service_1.KnowledgeRetrievalService,
                    useValue: mockKnowledgeRetrievalService,
                },
            ],
        }).compile();
        service = module.get(agent_workflow_service_1.AgentWorkflowService);
        analysisAgent = module.get(analysis_agent_service_1.AnalysisAgentService);
        strategyAgent = module.get(strategy_agent_service_1.StrategyAgentService);
        copywritingAgent = module.get(copywriting_agent_service_1.CopywritingAgentService);
        configService = module.get(config_1.ConfigService);
        jest.spyOn(common_1.Logger.prototype, 'log').mockImplementation(() => undefined);
        jest.spyOn(common_1.Logger.prototype, 'debug').mockImplementation(() => undefined);
        jest.spyOn(common_1.Logger.prototype, 'error').mockImplementation(() => undefined);
        jest.spyOn(common_1.Logger.prototype, 'warn').mockImplementation(() => undefined);
    });
    it('应该正确定义服务', () => {
        expect(service).toBeDefined();
        expect(analysisAgent).toBeDefined();
        expect(strategyAgent).toBeDefined();
        expect(copywritingAgent).toBeDefined();
        expect(configService).toBeDefined();
    });
    describe('executeCampaignWorkflow', () => {
        it('应该成功执行完整的工作流', async () => {
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
                            activityLevel: 70,
                            growthTrend: 'stable',
                            engagementScore: 65,
                        },
                        socialActivity: {
                            fissionPotential: 'medium',
                            activityPreference: ['线上活动'],
                            socialInfluence: 50,
                        },
                    },
                ],
                industryContext: '电商',
                businessGoals: ['提升销售额', '增加用户粘性'],
                budgetConstraints: { maxBudget: 50000 },
                timeline: {
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            };
            const result = await service.executeCampaignWorkflow(input);
            expect(result).toHaveProperty('executionId');
            expect(result.executionId).toMatch(/^wf_/);
            expect(result).toHaveProperty('analysis');
            expect(result).toHaveProperty('strategy');
            expect(result).toHaveProperty('copywriting');
            expect(result).toHaveProperty('workflowStatus');
            expect(result.workflowStatus.success).toBe(true);
            expect(result.workflowStatus.totalDuration).toBeGreaterThan(0);
            expect(result.workflowStatus.stageDurations).toHaveProperty('analysis');
            expect(result.workflowStatus.stageDurations).toHaveProperty('strategy');
            expect(result.workflowStatus.stageDurations).toHaveProperty('copywriting');
            expect(result).toHaveProperty('timestamp');
            expect(mockAnalysisAgentService.execute).toHaveBeenCalledTimes(1);
            expect(mockStrategyAgentService.execute).toHaveBeenCalledTimes(1);
            expect(mockCopywritingAgentService.execute).toHaveBeenCalledTimes(1);
            const status = service.getWorkflowStatus(result.executionId);
            expect(status).toBeDefined();
            expect(status?.status).toBe(workflow_agent_interface_1.WorkflowExecutionStatus.COMPLETED);
            expect(status?.steps).toHaveLength(3);
            expect(status?.logs.length).toBeGreaterThan(0);
        });
        it('应该处理分析阶段失败的情况', async () => {
            mockAnalysisAgentService.execute.mockRejectedValueOnce(new Error('分析服务不可用'));
            const input = {
                customerData: [],
                industryContext: '电商',
                businessGoals: ['提升销售额'],
            };
            await expect(service.executeCampaignWorkflow(input)).rejects.toThrow('AI Agent工作流执行失败: 分析服务不可用');
            const executionId = 'test_execution_id';
        });
        it('在启用人工干预时应返回降级结果', async () => {
            mockConfigService.get.mockImplementation((key) => {
                if (key === 'WORKFLOW_ENABLE_HUMAN_INTERVENTION')
                    return true;
                return null;
            });
            const module = await testing_1.Test.createTestingModule({
                providers: [
                    agent_workflow_service_1.AgentWorkflowService,
                    {
                        provide: analysis_agent_service_1.AnalysisAgentService,
                        useValue: mockAnalysisAgentService,
                    },
                    {
                        provide: strategy_agent_service_1.StrategyAgentService,
                        useValue: mockStrategyAgentService,
                    },
                    {
                        provide: copywriting_agent_service_1.CopywritingAgentService,
                        useValue: mockCopywritingAgentService,
                    },
                    {
                        provide: config_1.ConfigService,
                        useValue: mockConfigService,
                    },
                    {
                        provide: knowledge_retrieval_service_1.KnowledgeRetrievalService,
                        useValue: mockKnowledgeRetrievalService,
                    },
                ],
            }).compile();
            const serviceWithIntervention = module.get(agent_workflow_service_1.AgentWorkflowService);
            jest.spyOn(common_1.Logger.prototype, 'log').mockImplementation(() => undefined);
            mockAnalysisAgentService.execute.mockRejectedValueOnce(new Error('分析服务不可用'));
            const input = {
                customerData: [],
                industryContext: '电商',
                businessGoals: ['提升销售额'],
            };
            const result = await serviceWithIntervention.executeCampaignWorkflow(input);
            expect(result).toBeDefined();
            expect(result.workflowStatus.success).toBe(false);
            expect(result.workflowStatus.error).toBeDefined();
            expect(result.analysis).toBeDefined();
            expect(result.strategy).toBeDefined();
            expect(result.copywriting).toBeDefined();
        });
        it('应该处理超时情况', async () => {
            mockAnalysisAgentService.execute.mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve({}), 100)));
            const input = {
                customerData: [],
                industryContext: '电商',
                businessGoals: ['提升销售额'],
            };
            mockConfigService.get.mockImplementation((key) => {
                if (key === 'WORKFLOW_ANALYSIS_TIMEOUT')
                    return 10;
                return null;
            });
            const module = await testing_1.Test.createTestingModule({
                providers: [
                    agent_workflow_service_1.AgentWorkflowService,
                    {
                        provide: analysis_agent_service_1.AnalysisAgentService,
                        useValue: mockAnalysisAgentService,
                    },
                    {
                        provide: strategy_agent_service_1.StrategyAgentService,
                        useValue: mockStrategyAgentService,
                    },
                    {
                        provide: copywriting_agent_service_1.CopywritingAgentService,
                        useValue: mockCopywritingAgentService,
                    },
                    {
                        provide: config_1.ConfigService,
                        useValue: mockConfigService,
                    },
                    {
                        provide: knowledge_retrieval_service_1.KnowledgeRetrievalService,
                        useValue: mockKnowledgeRetrievalService,
                    },
                ],
            }).compile();
            const serviceWithShortTimeout = module.get(agent_workflow_service_1.AgentWorkflowService);
            jest.spyOn(common_1.Logger.prototype, 'log').mockImplementation(() => undefined);
            await expect(serviceWithShortTimeout.executeCampaignWorkflow(input)).rejects.toThrow('分析阶段超时');
        });
    });
    describe('工作流控制方法', () => {
        let executionId;
        beforeEach(async () => {
            const input = {
                customerData: [],
                industryContext: '电商',
                businessGoals: ['测试'],
            };
            const result = await service.executeCampaignWorkflow(input);
            executionId = result.executionId;
            jest.clearAllMocks();
        });
        it('应该能获取工作流状态', () => {
            const status = service.getWorkflowStatus(executionId);
            expect(status).toBeDefined();
            expect(status?.status).toBe(workflow_agent_interface_1.WorkflowExecutionStatus.COMPLETED);
            expect(status?.steps).toHaveLength(3);
            expect(status?.input).toBeDefined();
            expect(status?.output).toBeDefined();
        });
        it('应该返回不存在的执行状态为null', () => {
            const status = service.getWorkflowStatus('non_existent_id');
            expect(status).toBeNull();
        });
        it('应该能获取审计日志', () => {
            const logs = service.getAuditLogs(executionId);
            expect(Array.isArray(logs)).toBe(true);
            expect(logs.length).toBeGreaterThan(0);
            expect(logs[0]).toHaveProperty('action');
            expect(logs[0]).toHaveProperty('timestamp');
            expect(logs[0]).toHaveProperty('actor');
            expect(logs[0]).toHaveProperty('details');
        });
        it('应该清理过期的执行状态', () => {
            for (let i = 0; i < 150; i++) {
                const fakeId = `test_${i}`;
                service.executionStates.set(fakeId, {
                    status: workflow_agent_interface_1.WorkflowExecutionStatus.COMPLETED,
                    steps: [],
                    logs: [],
                    startTime: new Date(Date.now() - i * 1000),
                });
            }
            expect(service.executionStates.size).toBe(151);
            service.cleanupOldExecutions();
            expect(service.executionStates.size).toBe(100);
        });
    });
    describe('配置合并', () => {
        it('应该从环境变量合并配置', () => {
            const defaultConfig = service.defaultConfig;
            expect(defaultConfig.enableHumanIntervention).toBe(false);
            expect(defaultConfig.timeouts.analysis).toBe(30000);
            expect(defaultConfig.timeouts.strategy).toBe(30000);
            expect(defaultConfig.timeouts.copywriting).toBe(30000);
            expect(defaultConfig.timeouts.total).toBe(120000);
            expect(defaultConfig.retry.maxAttempts).toBe(3);
            expect(defaultConfig.logLevel).toBe('info');
        });
        it('应该使用环境变量覆盖默认配置', async () => {
            mockConfigService.get.mockImplementation((key, defaultValue) => {
                if (key === 'WORKFLOW_ENABLE_HUMAN_INTERVENTION')
                    return true;
                if (key === 'WORKFLOW_ANALYSIS_TIMEOUT')
                    return 60000;
                if (key === 'WORKFLOW_LOG_LEVEL')
                    return 'debug';
                return defaultValue;
            });
            const module = await testing_1.Test.createTestingModule({
                providers: [
                    agent_workflow_service_1.AgentWorkflowService,
                    {
                        provide: analysis_agent_service_1.AnalysisAgentService,
                        useValue: mockAnalysisAgentService,
                    },
                    {
                        provide: strategy_agent_service_1.StrategyAgentService,
                        useValue: mockStrategyAgentService,
                    },
                    {
                        provide: copywriting_agent_service_1.CopywritingAgentService,
                        useValue: mockCopywritingAgentService,
                    },
                    {
                        provide: config_1.ConfigService,
                        useValue: mockConfigService,
                    },
                    {
                        provide: knowledge_retrieval_service_1.KnowledgeRetrievalService,
                        useValue: mockKnowledgeRetrievalService,
                    },
                ],
            }).compile();
            const serviceWithCustomConfig = module.get(agent_workflow_service_1.AgentWorkflowService);
            const defaultConfig = serviceWithCustomConfig.defaultConfig;
            expect(defaultConfig.enableHumanIntervention).toBe(true);
            expect(defaultConfig.timeouts.analysis).toBe(60000);
            expect(defaultConfig.logLevel).toBe('debug');
        });
    });
});
//# sourceMappingURL=agent-workflow.service.spec.js.map