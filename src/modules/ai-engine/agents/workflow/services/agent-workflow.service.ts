import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnalysisAgentService } from '../../analysis/services/analysis-agent.service';
import { StrategyAgentService } from '../../strategy/services/strategy-agent.service';
import { CopywritingAgentService } from '../../copywriting/services/copywriting-agent.service';
import { KnowledgeRetrievalService } from '../../analysis/services/knowledge-retrieval.service';
import {
  AgentWorkflowInput,
  AgentWorkflowOutput,
  WorkflowExecutionStatus,
  WorkflowStepStatus,
  WorkflowAuditLog,
  WorkflowConfig,
} from '../interfaces/workflow-agent.interface';

/**
 * Agent工作流引擎服务
 * 负责管理分析→策划→文案三阶段AI Agent工作流
 */
@Injectable()
export class AgentWorkflowService {
  private readonly logger = new Logger(AgentWorkflowService.name);
  private readonly defaultConfig: WorkflowConfig = {
    enableHumanIntervention: false,
    timeouts: {
      analysis: 30000, // 30秒
      strategy: 30000,
      copywriting: 30000,
      total: 120000, // 2分钟
    },
    retry: {
      maxAttempts: 3,
      backoffFactor: 2,
    },
    logLevel: 'info',
  };

  // 内存中的执行状态（生产环境应使用Redis或数据库）
  private executionStates = new Map<
    string,
    {
      status: WorkflowExecutionStatus;
      steps: WorkflowStepStatus[];
      logs: WorkflowAuditLog[];
      startTime: Date;
      endTime?: Date;
      input?: AgentWorkflowInput;
      output?: AgentWorkflowOutput;
    }
  >();

  constructor(
    private readonly configService: ConfigService,
    @Inject(AnalysisAgentService)
    private readonly analysisAgent: AnalysisAgentService,
    @Inject(StrategyAgentService)
    private readonly strategyAgent: StrategyAgentService,
    @Inject(CopywritingAgentService)
    private readonly copywritingAgent: CopywritingAgentService,
    @Inject(KnowledgeRetrievalService)
    private readonly knowledgeRetrievalService: KnowledgeRetrievalService,
  ) {
    // 从配置中合并自定义配置
    this.mergeConfigFromEnvironment();
  }

  /**
   * 执行完整的AI Agent工作流（分析→策划→文案）
   */
  async executeCampaignWorkflow(
    input: AgentWorkflowInput,
  ): Promise<AgentWorkflowOutput> {
    const executionId = this.generateExecutionId();
    const startTime = new Date();

    this.logger.log(`开始执行AI Agent工作流，执行ID: ${executionId}`);
    this.logger.debug(`工作流输入: ${JSON.stringify(input, null, 2)}`);

    // 初始化执行状态
    this.initializeExecutionState(executionId, input);

    try {
      // 1. 分析阶段
      this.logger.log(`[${executionId}] 开始分析阶段`);
      const analysisStep = this.createStepStatus('analysis');
      this.updateStepStatus(executionId, analysisStep);

      // 检索相关知识库内容
      const knowledgeQuery = `行业: ${input.industryContext}, 目标: ${input.businessGoals.join('、')}`;
      const knowledgeBaseContext = await this.knowledgeRetrievalService.retrieveRelevantKnowledge(
        knowledgeQuery,
        input.industryContext,
        5, // 限制返回5条相关知识
      );

      const analysisResult = await this.executeWithTimeout(
        () =>
          this.analysisAgent.execute({
            customerData: input.customerData,
            industryContext: input.industryContext,
            businessGoals: input.businessGoals,
            knowledgeBaseContext,
          }),
        this.defaultConfig.timeouts.analysis,
        '分析阶段超时',
      );

      analysisStep.status = WorkflowExecutionStatus.COMPLETED;
      analysisStep.endTime = new Date();
      analysisStep.duration =
        analysisStep.endTime.getTime() - analysisStep.startTime!.getTime();
      analysisStep.output = analysisResult;
      this.updateStepStatus(executionId, analysisStep);

      this.logger.log(
        `[${executionId}] 分析阶段完成，耗时: ${analysisStep.duration}ms`,
      );

      // 2. 策划阶段
      this.logger.log(`[${executionId}] 开始策划阶段`);
      const strategyStep = this.createStepStatus('strategy');
      this.updateStepStatus(executionId, strategyStep);

      // 获取时事热点和节假日数据（TODO: 实现真实数据获取）
      const currentEvents = await this.getCurrentEvents();
      const holidays = await this.getHolidays();

      const strategyResult = await this.executeWithTimeout(
        () =>
          this.strategyAgent.execute({
            analysisResults: analysisResult,
            currentEvents,
            holidays,
            budgetConstraints: input.budgetConstraints || {
              totalBudget: 50000,
              currency: 'CNY',
              breakdown: [
                { channel: 'content_creation', amount: 20000, percentage: 40 },
                { channel: 'advertising', amount: 15000, percentage: 30 },
                { channel: 'influencer', amount: 10000, percentage: 20 },
                { channel: 'analytics', amount: 5000, percentage: 10 },
              ],
              constraints: ['max_budget_50000', 'no_offline_ads'],
            },
            timeline: input.timeline || {
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后
              durationDays: 30,
            },
          }),
        this.defaultConfig.timeouts.strategy,
        '策划阶段超时',
      );

      strategyStep.status = WorkflowExecutionStatus.COMPLETED;
      strategyStep.endTime = new Date();
      strategyStep.duration =
        strategyStep.endTime.getTime() - strategyStep.startTime!.getTime();
      strategyStep.output = strategyResult;
      this.updateStepStatus(executionId, strategyStep);

      this.logger.log(
        `[${executionId}] 策划阶段完成，耗时: ${strategyStep.duration}ms`,
      );

      // 3. 文案阶段
      this.logger.log(`[${executionId}] 开始文案阶段`);
      const copywritingStep = this.createStepStatus('copywriting');
      this.updateStepStatus(executionId, copywritingStep);

      // 获取平台规格和品牌指南（TODO: 实现真实数据获取）
      const platformSpecs =
        input.platformSpecs || (await this.getDefaultPlatformSpecs());
      const brandGuidelines =
        input.brandGuidelines || (await this.getDefaultBrandGuidelines());
      const forbiddenWords = input.forbiddenWords || [];

      const copywritingResult = await this.executeWithTimeout(
        () =>
          this.copywritingAgent.execute({
            strategyPlan: strategyResult,
            platformSpecs,
            brandGuidelines,
            forbiddenWords,
          }),
        this.defaultConfig.timeouts.copywriting,
        '文案阶段超时',
      );

      copywritingStep.status = WorkflowExecutionStatus.COMPLETED;
      copywritingStep.endTime = new Date();
      copywritingStep.duration =
        copywritingStep.endTime.getTime() - copywritingStep.startTime!.getTime();
      copywritingStep.output = copywritingResult;
      this.updateStepStatus(executionId, copywritingStep);

      this.logger.log(
        `[${executionId}] 文案阶段完成，耗时: ${copywritingStep.duration}ms`,
      );

      // 构建最终输出
      const endTime = new Date();
      const totalDuration = endTime.getTime() - startTime.getTime();

      const output: AgentWorkflowOutput = {
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

      // 更新执行状态为完成
      this.updateExecutionStatus(
        executionId,
        WorkflowExecutionStatus.COMPLETED,
        output,
      );

      this.logger.log(
        `[${executionId}] AI Agent工作流执行成功，总耗时: ${totalDuration}ms`,
      );

      // 记录审计日志
      this.addAuditLog(executionId, 'workflow_completed', 'system', {
        executionId,
        totalDuration,
        stageDurations: output.workflowStatus.stageDurations,
      });

      return output;
    } catch (error) {
      this.logger.error(
        `[${executionId}] AI Agent工作流执行失败: ${error.message}`,
        error.stack,
      );

      // 更新执行状态为失败
      this.updateExecutionStatus(
        executionId,
        WorkflowExecutionStatus.FAILED,
        undefined,
        error.message,
      );

      // 记录失败审计日志
      this.addAuditLog(executionId, 'workflow_failed', 'system', {
        executionId,
        error: error.message,
        stack: error.stack,
      });

      // 根据配置决定是否抛出错误或返回部分结果
      if (this.defaultConfig.enableHumanIntervention) {
        // 在人工干预模式下，返回部分结果供人工处理
        const partialOutput = await this.handlePartialFailure(
          executionId,
          error,
        );
        return partialOutput;
      } else {
        throw new Error(`AI Agent工作流执行失败: ${error.message}`);
      }
    }
  }

  /**
   * 获取工作流执行状态
   */
  getWorkflowStatus(executionId: string): {
    status: WorkflowExecutionStatus;
    steps: WorkflowStepStatus[];
    logs: WorkflowAuditLog[];
    startTime: Date;
    endTime?: Date;
    input?: AgentWorkflowInput;
    output?: AgentWorkflowOutput;
  } | null {
    return this.executionStates.get(executionId) || null;
  }

  /**
   * 暂停工作流执行
   */
  pauseWorkflow(executionId: string): boolean {
    const state = this.executionStates.get(executionId);
    if (!state || state.status !== WorkflowExecutionStatus.RUNNING) {
      return false;
    }

    state.status = WorkflowExecutionStatus.PAUSED;
    this.executionStates.set(executionId, state);

    this.addAuditLog(executionId, 'workflow_paused', 'user', { executionId });
    this.logger.log(`[${executionId}] 工作流已暂停`);

    return true;
  }

  /**
   * 继续暂停的工作流
   */
  resumeWorkflow(executionId: string): boolean {
    const state = this.executionStates.get(executionId);
    if (!state || state.status !== WorkflowExecutionStatus.PAUSED) {
      return false;
    }

    state.status = WorkflowExecutionStatus.RUNNING;
    this.executionStates.set(executionId, state);

    this.addAuditLog(executionId, 'workflow_resumed', 'user', { executionId });
    this.logger.log(`[${executionId}] 工作流已继续`);

    return true;
  }

  /**
   * 取消工作流执行
   */
  cancelWorkflow(executionId: string): boolean {
    const state = this.executionStates.get(executionId);
    if (
      !state ||
      (state.status !== WorkflowExecutionStatus.RUNNING &&
        state.status !== WorkflowExecutionStatus.PAUSED)
    ) {
      return false;
    }

    state.status = WorkflowExecutionStatus.CANCELLED;
    state.endTime = new Date();
    this.executionStates.set(executionId, state);

    this.addAuditLog(executionId, 'workflow_cancelled', 'user', {
      executionId,
    });
    this.logger.log(`[${executionId}] 工作流已取消`);

    return true;
  }

  /**
   * 获取工作流审计日志
   */
  getAuditLogs(executionId: string): WorkflowAuditLog[] {
    const state = this.executionStates.get(executionId);
    return state?.logs || [];
  }

  /**
   * 清理过期的执行状态（保留最近100条）
   */
  cleanupOldExecutions(): void {
    const maxRetention = 100;
    if (this.executionStates.size <= maxRetention) {
      return;
    }

    // 按开始时间排序，保留最近的
    const entries = Array.from(this.executionStates.entries());
    entries.sort((a, b) => b[1].startTime.getTime() - a[1].startTime.getTime());

    const toDelete = entries.slice(maxRetention);
    toDelete.forEach(([id]) => this.executionStates.delete(id));

    this.logger.log(`清理了${toDelete.length}个过期的执行状态`);
  }

  // ========== 私有方法 ==========

  /**
   * 从环境变量合并配置
   */
  private mergeConfigFromEnvironment(): void {
    const enableHumanIntervention = this.configService.get<boolean>(
      'WORKFLOW_ENABLE_HUMAN_INTERVENTION',
      false,
    );
    const analysisTimeout = this.configService.get<number>(
      'WORKFLOW_ANALYSIS_TIMEOUT',
      30000,
    );
    const strategyTimeout = this.configService.get<number>(
      'WORKFLOW_STRATEGY_TIMEOUT',
      30000,
    );
    const copywritingTimeout = this.configService.get<number>(
      'WORKFLOW_COPYWRITING_TIMEOUT',
      30000,
    );
    const totalTimeout = this.configService.get<number>(
      'WORKFLOW_TOTAL_TIMEOUT',
      120000,
    );
    const maxRetryAttempts = this.configService.get<number>(
      'WORKFLOW_MAX_RETRY_ATTEMPTS',
      3,
    );
    const logLevel = this.configService.get<
      'debug' | 'info' | 'warn' | 'error'
    >('WORKFLOW_LOG_LEVEL', 'info');

    this.defaultConfig.enableHumanIntervention = enableHumanIntervention;
    this.defaultConfig.timeouts.analysis = analysisTimeout;
    this.defaultConfig.timeouts.strategy = strategyTimeout;
    this.defaultConfig.timeouts.copywriting = copywritingTimeout;
    this.defaultConfig.timeouts.total = totalTimeout;
    this.defaultConfig.retry.maxAttempts = maxRetryAttempts;
    this.defaultConfig.logLevel = logLevel;
  }

  /**
   * 生成唯一的执行ID
   */
  private generateExecutionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `wf_${timestamp}_${random}`;
  }

  /**
   * 初始化执行状态
   */
  private initializeExecutionState(
    executionId: string,
    input: AgentWorkflowInput,
  ): void {
    this.executionStates.set(executionId, {
      status: WorkflowExecutionStatus.RUNNING,
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

  /**
   * 更新执行状态
   */
  private updateExecutionStatus(
    executionId: string,
    status: WorkflowExecutionStatus,
    output?: AgentWorkflowOutput,
    error?: string,
  ): void {
    const state = this.executionStates.get(executionId);
    if (!state) {
      return;
    }

    const previousStatus = state.status;
    state.status = status;

    if (
      status === WorkflowExecutionStatus.COMPLETED ||
      status === WorkflowExecutionStatus.FAILED ||
      status === WorkflowExecutionStatus.CANCELLED
    ) {
      state.endTime = new Date();
    }

    if (output) {
      state.output = output;
    }

    this.executionStates.set(executionId, state);

    // 记录状态变更审计日志
    this.addAuditLog(executionId, 'status_changed', 'system', {
      executionId,
      previousStatus,
      newStatus: status,
      error,
    });
  }

  /**
   * 创建步骤状态
   */
  private createStepStatus(stepName: string): WorkflowStepStatus {
    return {
      stepName,
      status: WorkflowExecutionStatus.RUNNING,
      startTime: new Date(),
    };
  }

  /**
   * 更新步骤状态
   */
  private updateStepStatus(
    executionId: string,
    step: WorkflowStepStatus,
  ): void {
    const state = this.executionStates.get(executionId);
    if (!state) {
      return;
    }

    // 更新或添加步骤
    const existingIndex = state.steps.findIndex(
      (s) => s.stepName === step.stepName,
    );
    if (existingIndex >= 0) {
      state.steps[existingIndex] = step;
    } else {
      state.steps.push(step);
    }

    this.executionStates.set(executionId, state);
  }

  /**
   * 添加审计日志
   */
  private addAuditLog(
    executionId: string,
    action: string,
    actor: string,
    details: any,
    stepName?: string,
  ): void {
    const state = this.executionStates.get(executionId);
    if (!state) {
      return;
    }

    const log: WorkflowAuditLog = {
      executionId,
      timestamp: new Date(),
      action,
      actor,
      details,
      stepName,
    };

    state.logs.push(log);
    this.executionStates.set(executionId, state);

    // 根据日志级别决定是否输出到控制台
    if (
      this.defaultConfig.logLevel === 'debug' ||
      (this.defaultConfig.logLevel === 'info' &&
        ['workflow_started', 'workflow_completed', 'workflow_failed'].includes(
          action,
        )) ||
      (this.defaultConfig.logLevel === 'warn' &&
        ['workflow_failed'].includes(action))
    ) {
      this.logger.log(
        `[${executionId}] 审计日志: ${action} - ${JSON.stringify(details)}`,
      );
    }
  }

  /**
   * 带超时的执行包装器
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    timeoutMessage: string,
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
      }),
    ]);
  }

  /**
   * 处理部分失败情况
   */
  private async handlePartialFailure(
    executionId: string,
    error: Error,
  ): Promise<AgentWorkflowOutput> {
    this.logger.warn(`[${executionId}] 处理部分失败，返回降级结果`);

    const state = this.executionStates.get(executionId);
    if (!state) {
      throw error;
    }

    // 收集已完成的步骤结果
    const completedSteps = state.steps.filter(
      (step) => step.status === WorkflowExecutionStatus.COMPLETED,
    );

    // 创建降级输出
    const fallbackOutput: AgentWorkflowOutput = {
      analysis:
        completedSteps.find((step) => step.stepName === 'analysis')?.output ||
        this.generateFallbackAnalysis(state.input!),
      strategy:
        completedSteps.find((step) => step.stepName === 'strategy')?.output ||
        this.generateFallbackStrategy(),
      copywriting:
        completedSteps.find((step) => step.stepName === 'copywriting')
          ?.output || this.generateFallbackCopywriting(),
      workflowStatus: {
        success: false,
        totalDuration: state.endTime
          ? state.endTime.getTime() - state.startTime.getTime()
          : 0,
        stageDurations: {
          analysis:
            completedSteps.find((step) => step.stepName === 'analysis')
              ?.duration || 0,
          strategy:
            completedSteps.find((step) => step.stepName === 'strategy')
              ?.duration || 0,
          copywriting:
            completedSteps.find((step) => step.stepName === 'copywriting')
              ?.duration || 0,
        },
        error: error.message,
      },
      executionId,
      timestamp: new Date(),
    };

    return fallbackOutput;
  }

  /**
   * 生成降级分析结果
   */
  private generateFallbackAnalysis(input: AgentWorkflowInput): any {
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

  /**
   * 生成降级策划结果
   */
  private generateFallbackStrategy(): any {
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

  /**
   * 生成降级文案结果
   */
  private generateFallbackCopywriting(): any {
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

  /**
   * 获取当前时事热点（TODO: 实现真实数据获取）
   */
  private async getCurrentEvents(): Promise<any[]> {
    // 模拟数据
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

  /**
   * 获取节假日信息（TODO: 实现真实数据获取）
   */
  private async getHolidays(): Promise<any[]> {
    // 模拟数据
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

  /**
   * 获取默认平台规格
   */
  private async getDefaultPlatformSpecs(): Promise<any[]> {
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

  /**
   * 获取默认品牌指南
   */
  private async getDefaultBrandGuidelines(): Promise<any> {
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
}
