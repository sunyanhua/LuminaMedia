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
var StrategyAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyAgentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const gemini_service_1 = require("../../../../data-analytics/services/gemini.service");
const qwen_service_1 = require("../../../../data-analytics/services/qwen.service");
const platform_enum_1 = require("../../../../../shared/enums/platform.enum");
const strategy_prompt_templates_1 = require("../prompt-templates/strategy-prompt-templates");
let StrategyAgentService = StrategyAgentService_1 = class StrategyAgentService {
    configService;
    geminiService;
    qwenService;
    logger = new common_1.Logger(StrategyAgentService_1.name);
    defaultAiEngine = 'gemini';
    constructor(configService, geminiService, qwenService) {
        this.configService = configService;
        this.geminiService = geminiService;
        this.qwenService = qwenService;
        this.defaultAiEngine = this.configService.get('AI_ENGINE', 'gemini');
    }
    async execute(input) {
        this.logger.log('开始执行策划Agent工作流');
        this.logger.debug(`输入数据: ${JSON.stringify(input, null, 2)}`);
        try {
            const prompt = this.buildStrategyPrompt(input);
            const aiResponse = await this.generateStrategyWithAI(prompt);
            const strategyOutput = this.parseStrategyResponse(aiResponse);
            const adjustedOutput = this.adjustStrategyWithConstraints(strategyOutput, input);
            this.logger.log('策划Agent工作流执行成功');
            return adjustedOutput;
        }
        catch (error) {
            this.logger.error(`策划Agent工作流执行失败: ${error.message}`, error.stack);
            return this.generateFallbackStrategy(input);
        }
    }
    buildStrategyPrompt(input) {
        const { analysisResults, currentEvents, holidays, budgetConstraints, timeline, } = input;
        const industryContext = this.extractIndustryContext(analysisResults);
        const scenario = this.determineScenario(analysisResults);
        const campaignType = this.determineCampaignType(analysisResults);
        const template = (0, strategy_prompt_templates_1.selectStrategyTemplate)(scenario, campaignType, 3);
        const params = {
            analysisResults,
            currentEvents,
            holidays,
            budgetConstraints,
            timeline,
            industryContext,
        };
        return template.generatePrompt(params);
    }
    extractIndustryContext(analysis) {
        if (analysis.marketInsights.trends.length > 0) {
            const firstTrend = analysis.marketInsights.trends[0];
            const industryKeywords = [
                '电商',
                '零售',
                '金融',
                '教育',
                '医疗',
                '旅游',
                '餐饮',
                '科技',
            ];
            for (const keyword of industryKeywords) {
                if (firstTrend.includes(keyword)) {
                    return keyword;
                }
            }
        }
        return '通用行业';
    }
    determineScenario(analysis) {
        const { marketInsights, targetAudience, competitorAnalysis } = analysis;
        const hasProductLaunchOpportunity = marketInsights.opportunities.some((opp) => opp.includes('新品') || opp.includes('产品') || opp.includes('发布'));
        if (hasProductLaunchOpportunity) {
            return '产品发布';
        }
        const hasBrandBuildingOpportunity = marketInsights.opportunities.some((opp) => opp.includes('品牌') ||
            opp.includes('知名度') ||
            opp.includes('美誉度'));
        if (hasBrandBuildingOpportunity) {
            return '品牌建设';
        }
        const hasSalesPromotionOpportunity = marketInsights.opportunities.some((opp) => opp.includes('销售') || opp.includes('促销') || opp.includes('转化'));
        if (hasSalesPromotionOpportunity) {
            return '销售提升';
        }
        return '品牌推广';
    }
    determineCampaignType(analysis) {
        const { targetAudience } = analysis;
        if (targetAudience.segments.length === 0) {
            return '综合型';
        }
        const firstSegment = targetAudience.segments[0];
        const characteristics = firstSegment.characteristics || [];
        if (characteristics.some((c) => c.includes('高端') || c.includes('高消费'))) {
            return '品牌型';
        }
        if (characteristics.some((c) => c.includes('年轻') || c.includes('社交'))) {
            return '社交型';
        }
        if (characteristics.some((c) => c.includes('价格敏感') || c.includes('折扣'))) {
            return '促销型';
        }
        return '综合型';
    }
    async generateStrategyWithAI(prompt) {
        this.logger.log(`使用${this.defaultAiEngine}引擎生成策划方案`);
        try {
            if (this.defaultAiEngine === 'gemini' &&
                this.geminiService.isGeminiAvailable()) {
                const result = await this.geminiService.generateContent({
                    prompt,
                    platform: platform_enum_1.Platform.STRATEGY,
                    tone: 'professional',
                    wordCount: 3000,
                    includeHashtags: false,
                    includeImageSuggestions: false,
                });
                if (result.success && result.content) {
                    return result.content.content;
                }
                else {
                    throw new Error(`Gemini生成失败: ${result.error?.message || '未知错误'}`);
                }
            }
            else if (this.defaultAiEngine === 'qwen') {
                this.logger.warn('Qwen服务暂未实现，尝试使用Gemini');
                if (this.geminiService.isGeminiAvailable()) {
                    return this.generateStrategyWithAI(prompt);
                }
                else {
                    throw new Error('所有AI引擎都不可用');
                }
            }
            else {
                throw new Error('默认AI引擎不可用');
            }
        }
        catch (error) {
            this.logger.error(`AI引擎调用失败: ${error.message}`);
            throw error;
        }
    }
    parseStrategyResponse(aiResponse) {
        try {
            let jsonText = aiResponse.trim();
            jsonText = jsonText
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            const parsed = JSON.parse(jsonText);
            const requiredFields = [
                'campaignTheme',
                'marketingStrategy',
                'activityPlan',
                'budgetPlan',
            ];
            for (const field of requiredFields) {
                if (!parsed[field]) {
                    throw new Error(`缺少必需字段: ${field}`);
                }
            }
            if (!parsed.campaignTheme.name || !parsed.campaignTheme.slogan) {
                throw new Error('campaignTheme缺少name或slogan字段');
            }
            if (!parsed.marketingStrategy.objectives ||
                !Array.isArray(parsed.marketingStrategy.objectives)) {
                throw new Error('marketingStrategy.objectives必须为数组');
            }
            if (!parsed.activityPlan.timeline ||
                !Array.isArray(parsed.activityPlan.timeline)) {
                throw new Error('activityPlan.timeline必须为数组');
            }
            if (!parsed.budgetPlan.totalBudget ||
                !parsed.budgetPlan.breakdown ||
                !Array.isArray(parsed.budgetPlan.breakdown)) {
                throw new Error('budgetPlan缺少必需字段');
            }
            const output = {
                campaignTheme: parsed.campaignTheme,
                marketingStrategy: parsed.marketingStrategy,
                activityPlan: parsed.activityPlan,
                budgetPlan: parsed.budgetPlan,
                successMetrics: parsed.successMetrics || {
                    kpis: [
                        {
                            name: '品牌曝光量',
                            target: 1000000,
                            unit: '次',
                            measurementMethod: '媒体监测',
                        },
                        {
                            name: '社交媒体互动量',
                            target: 10000,
                            unit: '次',
                            measurementMethod: '社交平台数据',
                        },
                        {
                            name: '网站流量增长',
                            target: 50,
                            unit: '%',
                            measurementMethod: '网站分析工具',
                        },
                        {
                            name: '销售转化率',
                            target: 5,
                            unit: '%',
                            measurementMethod: '销售系统数据',
                        },
                    ],
                    measurementTimeline: [
                        '活动开始前基准测量',
                        '活动中每周测量',
                        '活动结束后总结测量',
                    ],
                    reportingFrequency: 'weekly',
                },
                riskAssessment: parsed.riskAssessment || {
                    risks: [
                        {
                            description: '预算超支风险',
                            probability: 'medium',
                            impact: 'high',
                            mitigationStrategy: '建立预算监控机制，每周审查支出',
                        },
                        {
                            description: '执行延迟风险',
                            probability: 'medium',
                            impact: 'medium',
                            mitigationStrategy: '制定详细的项目计划，建立进度跟踪机制',
                        },
                        {
                            description: '市场反应不佳风险',
                            probability: 'low',
                            impact: 'high',
                            mitigationStrategy: '准备备选方案，建立实时监测和快速调整机制',
                        },
                    ],
                    overallRiskLevel: 'medium',
                },
            };
            return output;
        }
        catch (error) {
            this.logger.error(`解析AI响应失败: ${error.message}`);
            this.logger.debug(`原始响应: ${aiResponse.substring(0, 500)}...`);
            throw new Error(`策划响应解析失败: ${error.message}`);
        }
    }
    adjustStrategyWithConstraints(strategy, input) {
        const { budgetConstraints, timeline } = input;
        if (strategy.budgetPlan.totalBudget !== budgetConstraints.totalBudget) {
            this.logger.log(`调整策划方案预算: ${strategy.budgetPlan.totalBudget} → ${budgetConstraints.totalBudget}`);
            strategy.budgetPlan.totalBudget = budgetConstraints.totalBudget;
            const scaleFactor = budgetConstraints.totalBudget / (strategy.budgetPlan.totalBudget || 1);
            strategy.budgetPlan.breakdown = strategy.budgetPlan.breakdown.map((item) => ({
                ...item,
                amount: Math.round(item.amount * scaleFactor),
            }));
            if (strategy.budgetPlan.roiEstimation) {
                strategy.budgetPlan.roiEstimation = Math.round(strategy.budgetPlan.roiEstimation * scaleFactor);
            }
        }
        const originalDuration = timeline.durationDays;
        const strategyDuration = strategy.activityPlan.timeline.length > 0
            ? strategy.activityPlan.timeline[strategy.activityPlan.timeline.length - 1].weekNumber
            : 8;
        if (originalDuration !== strategyDuration * 7) {
            this.logger.log(`调整策划方案时间线: ${strategyDuration}周 → ${Math.floor(originalDuration / 7)}周`);
            const weekScaleFactor = originalDuration / 7 / strategyDuration;
            strategy.activityPlan.timeline = strategy.activityPlan.timeline.map((item) => ({
                ...item,
                weekNumber: Math.round(item.weekNumber * weekScaleFactor),
            }));
        }
        if (strategy.successMetrics && strategy.successMetrics.kpis) {
            strategy.successMetrics.kpis = strategy.successMetrics.kpis.map((kpi) => {
                const budgetScale = budgetConstraints.totalBudget / 100000;
                let adjustedTarget = kpi.target;
                if (kpi.name.includes('曝光量') || kpi.name.includes('互动量')) {
                    adjustedTarget = Math.round(kpi.target * budgetScale);
                }
                else if (kpi.name.includes('增长率') || kpi.name.includes('转化率')) {
                    adjustedTarget = kpi.target * (0.8 + 0.2 * budgetScale);
                }
                return {
                    ...kpi,
                    target: adjustedTarget,
                };
            });
        }
        return strategy;
    }
    generateFallbackStrategy(input) {
        this.logger.warn('使用回退策划方案');
        const { analysisResults, budgetConstraints, timeline } = input;
        const industryContext = this.extractIndustryContext(analysisResults);
        return {
            campaignTheme: {
                name: `${industryContext}创新营销战役`,
                slogan: '创新驱动，价值共创',
                visualStyle: '现代简约风格，主色调为蓝色和橙色，体现专业与活力',
                keyMessages: [
                    '专业可靠的行业解决方案',
                    '创新技术驱动价值创造',
                    '客户至上的服务理念',
                ],
                toneOfVoice: 'professional',
            },
            marketingStrategy: {
                objectives: [
                    '提升品牌在目标市场的知名度达30%',
                    '获取1000个高质量销售线索',
                    '实现500万销售额',
                    '建立3个核心战略合作伙伴',
                ],
                tactics: [
                    {
                        name: '内容营销战役',
                        description: '通过高质量内容建立思想领导力',
                        targetAudience: ['决策者', '行业专家'],
                        channels: ['官网博客', '行业媒体', '社交媒体'],
                        timeline: { startWeek: 1, endWeek: 12 },
                        successMetrics: ['内容阅读量', '社交媒体分享数', '线索转化率'],
                        requiredResources: ['内容团队', '设计支持', '推广预算'],
                    },
                    {
                        name: '社交媒体互动',
                        description: '通过社交媒体与目标客群建立深度互动',
                        targetAudience: ['潜在客户', '现有用户'],
                        channels: ['微信', '微博', '小红书'],
                        timeline: { startWeek: 4, endWeek: 12 },
                        successMetrics: ['互动率', '粉丝增长', '用户生成内容'],
                        requiredResources: ['社区经理', '内容素材', '活动奖品'],
                    },
                    {
                        name: '行业活动参与',
                        description: '通过行业会议和展览建立专业形象',
                        targetAudience: ['行业从业者', '合作伙伴'],
                        channels: ['行业展会', '专业论坛', '研讨会'],
                        timeline: { startWeek: 8, endWeek: 16 },
                        successMetrics: ['参会人数', '现场互动', '会后跟进线索'],
                        requiredResources: ['展位设计', '宣传材料', '参会人员'],
                    },
                ],
                channels: [
                    {
                        channel: 'wechat',
                        name: '微信公众号',
                        targetAudience: ['现有客户', '行业从业者'],
                        budgetAllocation: budgetConstraints.totalBudget * 0.3,
                        percentage: 30,
                        keyActions: ['每周推送专业文章', '举办线上研讨会', '开展用户调研'],
                        metrics: ['阅读量', '分享数', '新增关注'],
                    },
                    {
                        channel: 'xiaohongshu',
                        name: '小红书品牌号',
                        targetAudience: ['年轻用户', '消费决策者'],
                        budgetAllocation: budgetConstraints.totalBudget * 0.25,
                        percentage: 25,
                        keyActions: ['发布使用场景内容', '合作KOL体验分享', '开展话题挑战'],
                        metrics: ['笔记互动率', '品牌提及量', '搜索增长'],
                    },
                    {
                        channel: 'weibo',
                        name: '微博官方账号',
                        targetAudience: ['大众用户', '媒体记者'],
                        budgetAllocation: budgetConstraints.totalBudget * 0.2,
                        percentage: 20,
                        keyActions: ['发布行业动态', '互动抽奖活动', '舆情监测'],
                        metrics: ['转发量', '评论量', '热搜上榜'],
                    },
                ],
                targetAudienceSegments: analysisResults.targetAudience.segments.map((s) => s.name),
            },
            activityPlan: {
                timeline: [
                    {
                        weekNumber: 1,
                        dateRange: `第1周 (${timeline.startDate})`,
                        keyActivities: ['项目启动会议', '目标对齐', '资源规划'],
                        deliverables: ['项目计划书', '团队分工表', '时间表'],
                        responsibleParty: '项目经理',
                    },
                    {
                        weekNumber: 2,
                        dateRange: '第2周',
                        keyActivities: ['内容策划', '设计制作', '渠道准备'],
                        deliverables: ['内容日历', '设计初稿', '渠道清单'],
                        responsibleParty: '内容团队',
                    },
                    {
                        weekNumber: 4,
                        dateRange: '第4周',
                        keyActivities: ['第一阶段内容发布', '社交媒体启动', '数据监测'],
                        deliverables: ['首期内容发布', '社交媒体账号', '数据看板'],
                        responsibleParty: '运营团队',
                    },
                    {
                        weekNumber: 8,
                        dateRange: '第8周',
                        keyActivities: ['中期评估', '策略优化', '活动推进'],
                        deliverables: ['中期报告', '优化方案', '活动进展'],
                        responsibleParty: '数据分析师',
                    },
                    {
                        weekNumber: 12,
                        dateRange: `第12周 (${timeline.endDate})`,
                        keyActivities: ['最终成果汇报', '经验总结', '后续规划'],
                        deliverables: ['结案报告', '成功案例', '未来计划'],
                        responsibleParty: '项目总监',
                    },
                ],
                keyActions: [
                    '建立项目管理和沟通机制',
                    '制定详细的内容生产和审核流程',
                    '设置数据监测和反馈循环',
                    '准备应急预案和风险应对措施',
                ],
                dependencies: [
                    '设计资源需提前2周准备',
                    '内容素材需提前1周完成审核',
                    '技术支持需在活动前测试完成',
                    '预算审批需在项目启动前完成',
                ],
                riskMitigation: [
                    '建立备用供应商名单',
                    '制定内容应急预案',
                    '准备额外预算缓冲',
                    '建立快速决策机制',
                ],
            },
            budgetPlan: {
                totalBudget: budgetConstraints.totalBudget,
                currency: budgetConstraints.currency,
                breakdown: [
                    {
                        category: '内容制作',
                        subcategory: '文章/视频',
                        amount: budgetConstraints.totalBudget * 0.3,
                        percentage: 30,
                        justification: '高质量内容是营销基础',
                    },
                    {
                        category: '渠道投放',
                        subcategory: '社交媒体广告',
                        amount: budgetConstraints.totalBudget * 0.25,
                        percentage: 25,
                        justification: '扩大品牌曝光和获客',
                    },
                    {
                        category: '活动执行',
                        subcategory: '线上/线下活动',
                        amount: budgetConstraints.totalBudget * 0.2,
                        percentage: 20,
                        justification: '建立用户互动和转化',
                    },
                    {
                        category: 'KOL合作',
                        subcategory: '达人合作费用',
                        amount: budgetConstraints.totalBudget * 0.15,
                        percentage: 15,
                        justification: '借助影响力扩大传播',
                    },
                    {
                        category: '其他',
                        subcategory: '工具/物料/应急',
                        amount: budgetConstraints.totalBudget * 0.1,
                        percentage: 10,
                        justification: '支持性支出和风险缓冲',
                    },
                ],
                roiEstimation: 2.5,
                roiExplanation: '基于历史活动数据，预计每投入1元可获得2.5元回报，主要通过新客户获取和品牌价值提升实现',
                contingencyBudget: budgetConstraints.totalBudget * 0.1,
            },
            successMetrics: {
                kpis: [
                    {
                        name: '品牌知名度提升',
                        target: 30,
                        unit: '%',
                        measurementMethod: '前后测调研',
                    },
                    {
                        name: '社交媒体互动量',
                        target: 10000,
                        unit: '次',
                        measurementMethod: '社交平台数据',
                    },
                    {
                        name: '销售线索数量',
                        target: 1000,
                        unit: '个',
                        measurementMethod: 'CRM系统',
                    },
                    {
                        name: '媒体曝光价值',
                        target: budgetConstraints.totalBudget * 3,
                        unit: '元',
                        measurementMethod: '媒体监测工具',
                    },
                    {
                        name: '客户满意度',
                        target: 85,
                        unit: '分',
                        measurementMethod: '客户调研',
                    },
                ],
                measurementTimeline: [
                    '活动前基准测量',
                    '活动中每周追踪',
                    '活动后效果评估',
                    '长期影响追踪（3个月后）',
                ],
                reportingFrequency: 'weekly',
            },
            riskAssessment: {
                risks: [
                    {
                        description: '预算执行偏差风险',
                        probability: 'medium',
                        impact: 'high',
                        mitigationStrategy: '建立预算控制流程，每周审查支出',
                    },
                    {
                        description: '内容质量不达标风险',
                        probability: 'low',
                        impact: 'medium',
                        mitigationStrategy: '建立内容审核机制，准备备用内容',
                    },
                    {
                        description: '外部环境变化风险',
                        probability: 'low',
                        impact: 'high',
                        mitigationStrategy: '密切监测市场动态，保持策略灵活性',
                    },
                    {
                        description: '团队执行能力风险',
                        probability: 'low',
                        impact: 'medium',
                        mitigationStrategy: '明确分工和责任，建立定期沟通机制',
                    },
                ],
                overallRiskLevel: 'medium',
            },
        };
    }
};
exports.StrategyAgentService = StrategyAgentService;
exports.StrategyAgentService = StrategyAgentService = StrategyAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(gemini_service_1.GeminiService)),
    __param(2, (0, common_1.Inject)(qwen_service_1.QwenService)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        gemini_service_1.GeminiService,
        qwen_service_1.QwenService])
], StrategyAgentService);
//# sourceMappingURL=strategy-agent.service.js.map