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
var AgentWorkflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentWorkflowService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const analysis_agent_service_1 = require("../../analysis/services/analysis-agent.service");
const strategy_agent_service_1 = require("../../strategy/services/strategy-agent.service");
const copywriting_agent_service_1 = require("../../copywriting/services/copywriting-agent.service");
const knowledge_retrieval_service_1 = require("../../analysis/services/knowledge-retrieval.service");
const workflow_agent_interface_1 = require("../interfaces/workflow-agent.interface");
let AgentWorkflowService = AgentWorkflowService_1 = class AgentWorkflowService {
    configService;
    analysisAgent;
    strategyAgent;
    copywritingAgent;
    knowledgeRetrievalService;
    logger = new common_1.Logger(AgentWorkflowService_1.name);
    defaultConfig = {
        enableHumanIntervention: false,
        timeouts: {
            analysis: 30000,
            strategy: 30000,
            copywriting: 30000,
            total: 120000,
        },
        retry: {
            maxAttempts: 3,
            backoffFactor: 2,
        },
        logLevel: 'info',
    };
    executionStates = new Map();
    constructor(configService, analysisAgent, strategyAgent, copywritingAgent, knowledgeRetrievalService) {
        this.configService = configService;
        this.analysisAgent = analysisAgent;
        this.strategyAgent = strategyAgent;
        this.copywritingAgent = copywritingAgent;
        this.knowledgeRetrievalService = knowledgeRetrievalService;
        this.mergeConfigFromEnvironment();
    }
    async executeCampaignWorkflow(input) {
        const executionId = this.generateExecutionId();
        const startTime = new Date();
        this.logger.log(`开始执行AI Agent工作流，执行ID: ${executionId}`);
        this.logger.debug(`工作流输入: ${JSON.stringify(input, null, 2)}`);
        this.initializeExecutionState(executionId, input);
        try {
            this.logger.log(`[${executionId}] 开始分析阶段`);
            const analysisStep = this.createStepStatus('analysis');
            this.updateStepStatus(executionId, analysisStep);
            const knowledgeQuery = `行业: ${input.industryContext}, 目标: ${input.businessGoals.join('、')}`;
            const knowledgeBaseContext = await this.knowledgeRetrievalService.retrieveRelevantKnowledge(knowledgeQuery, input.industryContext, 5);
            const analysisResult = await this.executeWithTimeout(() => this.analysisAgent.execute({
                customerData: input.customerData,
                industryContext: input.industryContext,
                businessGoals: input.businessGoals,
                knowledgeBaseContext,
            }), this.defaultConfig.timeouts.analysis, '分析阶段超时');
            analysisStep.status = workflow_agent_interface_1.WorkflowExecutionStatus.COMPLETED;
            analysisStep.endTime = new Date();
            analysisStep.duration =
                analysisStep.endTime.getTime() - analysisStep.startTime.getTime();
            analysisStep.output = analysisResult;
            this.updateStepStatus(executionId, analysisStep);
            this.logger.log(`[${executionId}] 分析阶段完成，耗时: ${analysisStep.duration}ms`);
            this.logger.log(`[${executionId}] 开始策划阶段`);
            const strategyStep = this.createStepStatus('strategy');
            this.updateStepStatus(executionId, strategyStep);
            const currentEvents = await this.getCurrentEvents();
            const holidays = await this.getHolidays();
            const strategyResult = await this.executeWithTimeout(() => this.strategyAgent.execute({
                analysisResults: analysisResult,
                currentEvents,
                holidays,
                budgetConstraints: input.budgetConstraints
                    ? {
                        totalBudget: input.budgetConstraints.maxBudget,
                        currency: input.budgetConstraints.currency || 'CNY',
                        breakdown: [
                            {
                                channel: 'content_creation',
                                amount: Math.floor(input.budgetConstraints.maxBudget * 0.4),
                                percentage: 40,
                            },
                            {
                                channel: 'advertising',
                                amount: Math.floor(input.budgetConstraints.maxBudget * 0.3),
                                percentage: 30,
                            },
                            {
                                channel: 'influencer',
                                amount: Math.floor(input.budgetConstraints.maxBudget * 0.2),
                                percentage: 20,
                            },
                            {
                                channel: 'analytics',
                                amount: Math.floor(input.budgetConstraints.maxBudget * 0.1),
                                percentage: 10,
                            },
                        ],
                        constraints: [
                            `max_budget_${input.budgetConstraints.maxBudget}`,
                            'no_offline_ads',
                        ],
                    }
                    : {
                        totalBudget: 50000,
                        currency: 'CNY',
                        breakdown: [
                            {
                                channel: 'content_creation',
                                amount: 20000,
                                percentage: 40,
                            },
                            { channel: 'advertising', amount: 15000, percentage: 30 },
                            { channel: 'influencer', amount: 10000, percentage: 20 },
                            { channel: 'analytics', amount: 5000, percentage: 10 },
                        ],
                        constraints: ['max_budget_50000', 'no_offline_ads'],
                    },
                timeline: input.timeline
                    ? {
                        startDate: input.timeline.startDate.toISOString(),
                        endDate: input.timeline.endDate.toISOString(),
                        durationDays: Math.ceil((input.timeline.endDate.getTime() -
                            input.timeline.startDate.getTime()) /
                            (1000 * 60 * 60 * 24)),
                    }
                    : {
                        startDate: new Date().toISOString(),
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        durationDays: 30,
                    },
            }), this.defaultConfig.timeouts.strategy, '策划阶段超时');
            strategyStep.status = workflow_agent_interface_1.WorkflowExecutionStatus.COMPLETED;
            strategyStep.endTime = new Date();
            strategyStep.duration =
                strategyStep.endTime.getTime() - strategyStep.startTime.getTime();
            strategyStep.output = strategyResult;
            this.updateStepStatus(executionId, strategyStep);
            this.logger.log(`[${executionId}] 策划阶段完成，耗时: ${strategyStep.duration}ms`);
            this.logger.log(`[${executionId}] 开始文案阶段`);
            const copywritingStep = this.createStepStatus('copywriting');
            this.updateStepStatus(executionId, copywritingStep);
            const platformSpecs = input.platformSpecs || (await this.getDefaultPlatformSpecs());
            const brandGuidelines = input.brandGuidelines || (await this.getDefaultBrandGuidelines());
            const forbiddenWords = input.forbiddenWords || [];
            const copywritingResult = await this.executeWithTimeout(() => this.copywritingAgent.execute({
                strategyPlan: strategyResult,
                platformSpecs,
                brandGuidelines,
                forbiddenWords,
            }), this.defaultConfig.timeouts.copywriting, '文案阶段超时');
            copywritingStep.status = workflow_agent_interface_1.WorkflowExecutionStatus.COMPLETED;
            copywritingStep.endTime = new Date();
            copywritingStep.duration =
                copywritingStep.endTime.getTime() -
                    copywritingStep.startTime.getTime();
            copywritingStep.output = copywritingResult;
            this.updateStepStatus(executionId, copywritingStep);
            this.logger.log(`[${executionId}] 文案阶段完成，耗时: ${copywritingStep.duration}ms`);
            const endTime = new Date();
            const totalDuration = endTime.getTime() - startTime.getTime();
            const output = {
                analysis: analysisResult,
                strategy: strategyResult,
                copywriting: copywritingResult,
                workflowStatus: {
                    success: true,
                    totalDuration,
                    stageDurations: {
                        analysis: analysisStep.duration || 0,
                        strategy: strategyStep.duration || 0,
                        copywriting: copywritingStep.duration || 0,
                    },
                },
                executionId,
                timestamp: endTime,
            };
            this.updateExecutionStatus(executionId, workflow_agent_interface_1.WorkflowExecutionStatus.COMPLETED, output);
            this.logger.log(`[${executionId}] AI Agent工作流执行成功，总耗时: ${totalDuration}ms`);
            this.addAuditLog(executionId, 'workflow_completed', 'system', {
                executionId,
                totalDuration,
                stageDurations: output.workflowStatus.stageDurations,
            });
            return output;
        }
        catch (error) {
            this.logger.error(`[${executionId}] AI Agent工作流执行失败: ${error.message}`, error.stack);
            this.updateExecutionStatus(executionId, workflow_agent_interface_1.WorkflowExecutionStatus.FAILED, undefined, error.message);
            this.addAuditLog(executionId, 'workflow_failed', 'system', {
                executionId,
                error: error.message,
                stack: error.stack,
            });
            if (this.defaultConfig.enableHumanIntervention) {
                const partialOutput = await this.handlePartialFailure(executionId, error);
                return partialOutput;
            }
            else {
                throw new Error(`AI Agent工作流执行失败: ${error.message}`);
            }
        }
    }
    getWorkflowStatus(executionId) {
        return this.executionStates.get(executionId) || null;
    }
    pauseWorkflow(executionId) {
        const state = this.executionStates.get(executionId);
        if (!state || state.status !== workflow_agent_interface_1.WorkflowExecutionStatus.RUNNING) {
            return false;
        }
        state.status = workflow_agent_interface_1.WorkflowExecutionStatus.PAUSED;
        this.executionStates.set(executionId, state);
        this.addAuditLog(executionId, 'workflow_paused', 'user', { executionId });
        this.logger.log(`[${executionId}] 工作流已暂停`);
        return true;
    }
    resumeWorkflow(executionId) {
        const state = this.executionStates.get(executionId);
        if (!state || state.status !== workflow_agent_interface_1.WorkflowExecutionStatus.PAUSED) {
            return false;
        }
        state.status = workflow_agent_interface_1.WorkflowExecutionStatus.RUNNING;
        this.executionStates.set(executionId, state);
        this.addAuditLog(executionId, 'workflow_resumed', 'user', { executionId });
        this.logger.log(`[${executionId}] 工作流已继续`);
        return true;
    }
    cancelWorkflow(executionId) {
        const state = this.executionStates.get(executionId);
        if (!state ||
            (state.status !== workflow_agent_interface_1.WorkflowExecutionStatus.RUNNING &&
                state.status !== workflow_agent_interface_1.WorkflowExecutionStatus.PAUSED)) {
            return false;
        }
        state.status = workflow_agent_interface_1.WorkflowExecutionStatus.CANCELLED;
        state.endTime = new Date();
        this.executionStates.set(executionId, state);
        this.addAuditLog(executionId, 'workflow_cancelled', 'user', {
            executionId,
        });
        this.logger.log(`[${executionId}] 工作流已取消`);
        return true;
    }
    getAuditLogs(executionId) {
        const state = this.executionStates.get(executionId);
        return state?.logs || [];
    }
    cleanupOldExecutions() {
        const maxRetention = 100;
        if (this.executionStates.size <= maxRetention) {
            return;
        }
        const entries = Array.from(this.executionStates.entries());
        entries.sort((a, b) => b[1].startTime.getTime() - a[1].startTime.getTime());
        const toDelete = entries.slice(maxRetention);
        toDelete.forEach(([id]) => this.executionStates.delete(id));
        this.logger.log(`清理了${toDelete.length}个过期的执行状态`);
    }
    mergeConfigFromEnvironment() {
        const enableHumanIntervention = this.configService.get('WORKFLOW_ENABLE_HUMAN_INTERVENTION', false);
        const analysisTimeout = this.configService.get('WORKFLOW_ANALYSIS_TIMEOUT', 30000);
        const strategyTimeout = this.configService.get('WORKFLOW_STRATEGY_TIMEOUT', 30000);
        const copywritingTimeout = this.configService.get('WORKFLOW_COPYWRITING_TIMEOUT', 30000);
        const totalTimeout = this.configService.get('WORKFLOW_TOTAL_TIMEOUT', 120000);
        const maxRetryAttempts = this.configService.get('WORKFLOW_MAX_RETRY_ATTEMPTS', 3);
        const logLevel = this.configService.get('WORKFLOW_LOG_LEVEL', 'info');
        this.defaultConfig.enableHumanIntervention = enableHumanIntervention;
        this.defaultConfig.timeouts.analysis = analysisTimeout;
        this.defaultConfig.timeouts.strategy = strategyTimeout;
        this.defaultConfig.timeouts.copywriting = copywritingTimeout;
        this.defaultConfig.timeouts.total = totalTimeout;
        this.defaultConfig.retry.maxAttempts = maxRetryAttempts;
        this.defaultConfig.logLevel = logLevel;
    }
    generateExecutionId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `wf_${timestamp}_${random}`;
    }
    initializeExecutionState(executionId, input) {
        this.executionStates.set(executionId, {
            status: workflow_agent_interface_1.WorkflowExecutionStatus.RUNNING,
            steps: [],
            logs: [],
            startTime: new Date(),
            input,
        });
        this.addAuditLog(executionId, 'workflow_started', 'system', {
            executionId,
            input,
        });
    }
    updateExecutionStatus(executionId, status, output, error) {
        const state = this.executionStates.get(executionId);
        if (!state) {
            return;
        }
        const previousStatus = state.status;
        state.status = status;
        if (status === workflow_agent_interface_1.WorkflowExecutionStatus.COMPLETED ||
            status === workflow_agent_interface_1.WorkflowExecutionStatus.FAILED ||
            status === workflow_agent_interface_1.WorkflowExecutionStatus.CANCELLED) {
            state.endTime = new Date();
        }
        if (output) {
            state.output = output;
        }
        this.executionStates.set(executionId, state);
        this.addAuditLog(executionId, 'status_changed', 'system', {
            executionId,
            previousStatus,
            newStatus: status,
            error,
        });
    }
    createStepStatus(stepName) {
        return {
            stepName,
            status: workflow_agent_interface_1.WorkflowExecutionStatus.RUNNING,
            startTime: new Date(),
        };
    }
    updateStepStatus(executionId, step) {
        const state = this.executionStates.get(executionId);
        if (!state) {
            return;
        }
        const existingIndex = state.steps.findIndex((s) => s.stepName === step.stepName);
        if (existingIndex >= 0) {
            state.steps[existingIndex] = step;
        }
        else {
            state.steps.push(step);
        }
        this.executionStates.set(executionId, state);
    }
    addAuditLog(executionId, action, actor, details, stepName) {
        const state = this.executionStates.get(executionId);
        if (!state) {
            return;
        }
        const log = {
            executionId,
            timestamp: new Date(),
            action,
            actor,
            details,
            stepName,
        };
        state.logs.push(log);
        this.executionStates.set(executionId, state);
        if (this.defaultConfig.logLevel === 'debug' ||
            (this.defaultConfig.logLevel === 'info' &&
                ['workflow_started', 'workflow_completed', 'workflow_failed'].includes(action)) ||
            (this.defaultConfig.logLevel === 'warn' &&
                ['workflow_failed'].includes(action))) {
            this.logger.log(`[${executionId}] 审计日志: ${action} - ${JSON.stringify(details)}`);
        }
    }
    async executeWithTimeout(fn, timeoutMs, timeoutMessage) {
        return Promise.race([
            fn(),
            new Promise((_, reject) => {
                setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
            }),
        ]);
    }
    async handlePartialFailure(executionId, error) {
        this.logger.warn(`[${executionId}] 处理部分失败，返回降级结果`);
        const state = this.executionStates.get(executionId);
        if (!state) {
            throw error;
        }
        const completedSteps = state.steps.filter((step) => step.status === workflow_agent_interface_1.WorkflowExecutionStatus.COMPLETED);
        const fallbackOutput = {
            analysis: completedSteps.find((step) => step.stepName === 'analysis')?.output ||
                this.generateFallbackAnalysis(state.input),
            strategy: completedSteps.find((step) => step.stepName === 'strategy')?.output ||
                this.generateFallbackStrategy(),
            copywriting: completedSteps.find((step) => step.stepName === 'copywriting')
                ?.output || this.generateFallbackCopywriting(),
            workflowStatus: {
                success: false,
                totalDuration: state.endTime
                    ? state.endTime.getTime() - state.startTime.getTime()
                    : 0,
                stageDurations: {
                    analysis: completedSteps.find((step) => step.stepName === 'analysis')
                        ?.duration || 0,
                    strategy: completedSteps.find((step) => step.stepName === 'strategy')
                        ?.duration || 0,
                    copywriting: completedSteps.find((step) => step.stepName === 'copywriting')
                        ?.duration || 0,
                },
                error: error.message,
            },
            executionId,
            timestamp: new Date(),
        };
        return fallbackOutput;
    }
    generateFallbackAnalysis(input) {
        return {
            marketInsights: {
                trends: ['数字化转型加速', '个性化需求增长', '社交媒体影响力扩大'],
                opportunities: ['利用AI提升效率', '开发个性化推荐', '拓展社交媒体渠道'],
                threats: ['市场竞争加剧', '隐私法规趋严'],
            },
            targetAudience: {
                segments: [
                    {
                        name: '核心用户',
                        description: '高活跃度、高消费意愿用户',
                        characteristics: ['高活跃度', '高消费', '强互动'],
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
                    behaviors: ['使用社交媒体', '关注品牌', '参与活动'],
                    painPoints: ['信息过载', '缺乏个性化', '内容不相关'],
                    motivations: ['寻求优质产品', '希望专属体验', '追求社交认同'],
                },
                sizeEstimation: 1000000,
            },
            competitorAnalysis: {
                mainCompetitors: [
                    {
                        name: '行业领先者',
                        marketShare: 25,
                        strengths: ['品牌知名', '产品丰富', '渠道广'],
                        weaknesses: ['创新慢', '体验一般', '价格高'],
                        strategies: ['品牌营销', '渠道扩张', '高端定位'],
                    },
                ],
                competitiveAdvantage: ['技术驱动', '数据精准', '模式灵活'],
                gaps: ['品牌待提升', '覆盖待扩大'],
            },
            recommendations: [
                '建立分层营销体系',
                '加强社交媒体营销',
                '利用AI个性化推荐',
                '开发数据驱动工具',
                '建立合作伙伴生态',
            ],
        };
    }
    generateFallbackStrategy() {
        return {
            campaignTheme: {
                name: '品牌焕新活动',
                slogan: '焕新体验，卓越未来',
                visualStyle: '现代简约',
            },
            marketingStrategy: {
                objectives: ['提升品牌认知', '增加用户参与', '促进销售转化'],
                tactics: [
                    {
                        name: '社交媒体营销',
                        description: '通过社交媒体平台发布内容',
                        channels: ['微信', '微博', '小红书'],
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
                        description: '发布活动主题和口号',
                    },
                ],
                keyActions: ['内容创作', '渠道发布', '效果监测'],
                dependencies: ['设计资源', '技术开发', '预算审批'],
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
        };
    }
    generateFallbackCopywriting() {
        return {
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
                        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
        };
    }
    async getCurrentEvents() {
        return [
            {
                title: '行业峰会召开',
                date: new Date(),
                relevance: 'high',
                category: 'industry',
            },
            {
                title: '政策法规更新',
                date: new Date(),
                relevance: 'medium',
                category: 'policy',
            },
        ];
    }
    async getHolidays() {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return [
            {
                name: '劳动节',
                date: new Date(now.getFullYear(), 4, 1),
                type: 'national',
                duration: 3,
            },
            {
                name: '国庆节',
                date: new Date(now.getFullYear(), 9, 1),
                type: 'national',
                duration: 7,
            },
        ];
    }
    async getDefaultPlatformSpecs() {
        return [
            {
                platform: 'wechat',
                name: '微信公众号',
                characterLimit: 20000,
                imageLimit: 10,
                videoLimit: 1,
                supportedFormats: ['text', 'image', 'video'],
                bestPractices: ['标题吸引人', '配图精美', '内容有价值'],
            },
            {
                platform: 'xiaohongshu',
                name: '小红书',
                characterLimit: 1000,
                imageLimit: 9,
                videoLimit: 1,
                supportedFormats: ['text', 'image', 'video'],
                bestPractices: ['真实体验', '高质量图片', '实用干货'],
            },
            {
                platform: 'weibo',
                name: '微博',
                characterLimit: 2000,
                imageLimit: 18,
                videoLimit: 1,
                supportedFormats: ['text', 'image', 'video'],
                bestPractices: ['热点话题', '互动性强', '视觉突出'],
            },
            {
                platform: 'douyin',
                name: '抖音',
                characterLimit: 300,
                imageLimit: 0,
                videoLimit: 1,
                supportedFormats: ['video'],
                bestPractices: ['前3秒吸引', '节奏明快', '音乐匹配'],
            },
        ];
    }
    async getDefaultBrandGuidelines() {
        return {
            brandName: 'LuminaMedia',
            brandVoice: '专业、创新、可信赖',
            tone: '专业但不生硬，友好但不随意',
            colorPalette: {
                primary: '#1890FF',
                secondary: '#52C41A',
                accent: '#FA8C16',
                neutral: '#8C8C8C',
            },
            typography: {
                headingFont: 'PingFang SC, Microsoft YaHei',
                bodyFont: 'PingFang SC, Microsoft YaHei',
                fontSize: {
                    large: 18,
                    medium: 14,
                    small: 12,
                },
            },
            imageryStyle: '干净、专业、现代',
            do: ['使用品牌色系', '保持专业语气', '提供有价值内容'],
            dont: ['使用不当语言', '侵犯版权', '虚假宣传'],
        };
    }
};
exports.AgentWorkflowService = AgentWorkflowService;
exports.AgentWorkflowService = AgentWorkflowService = AgentWorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(analysis_agent_service_1.AnalysisAgentService)),
    __param(2, (0, common_1.Inject)(strategy_agent_service_1.StrategyAgentService)),
    __param(3, (0, common_1.Inject)(copywriting_agent_service_1.CopywritingAgentService)),
    __param(4, (0, common_1.Inject)(knowledge_retrieval_service_1.KnowledgeRetrievalService)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        analysis_agent_service_1.AnalysisAgentService,
        strategy_agent_service_1.StrategyAgentService,
        copywriting_agent_service_1.CopywritingAgentService,
        knowledge_retrieval_service_1.KnowledgeRetrievalService])
], AgentWorkflowService);
//# sourceMappingURL=agent-workflow.service.js.map