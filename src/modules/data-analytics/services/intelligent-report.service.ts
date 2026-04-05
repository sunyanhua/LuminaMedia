import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportRepository } from '../../../shared/repositories/report.repository';
import { SentimentRepository } from '../../../shared/repositories/sentiment.repository';
import { Report, ReportType, ReportStatus } from '../../../entities/report.entity';
import { SentimentPlatform, SentimentType } from '../../../entities/sentiment.entity';
import { GeminiService } from './gemini.service';

export interface ReportGenerationOptions {
  startDate: Date;
  endDate: Date;
  title?: string;
  generatedBy?: string;
}

export interface SentimentReportData {
  summary: {
    total: number;
    timeRange: { start: Date; end: Date };
    platforms: Record<SentimentPlatform, number>;
    sentiments: Record<SentimentType, number>;
    averageSentimentScore: number;
  };
  trends: Array<{
    period: string;
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    averageScore: number;
  }>;
  hotKeywords: Array<{ keyword: string; count: number }>;
  topContent: Array<{
    id: string;
    platform: SentimentPlatform;
    content: string;
    sentiment: SentimentType;
    sentimentScore: number;
    readCount: number;
    shareCount: number;
    commentCount: number;
    publishTime: Date;
  }>;
}

export interface WechatReportData {
  summary: {
    totalArticles: number;
    timeRange: { start: Date; end: Date };
    totalReads: number;
    totalLikes: number;
    totalShares: number;
    averageReadRate: number;
  };
  topArticles: Array<{
    title: string;
    publishTime: Date;
    readCount: number;
    likeCount: number;
    shareCount: number;
  }>;
  trends: Array<{
    period: string;
    articles: number;
    reads: number;
    likes: number;
    shares: number;
  }>;
}

@Injectable()
export class IntelligentReportService {
  private readonly logger = new Logger(IntelligentReportService.name);

  constructor(
    @InjectRepository(ReportRepository)
    private reportRepository: ReportRepository,
    @InjectRepository(SentimentRepository)
    private sentimentRepository: SentimentRepository,
    private geminiService: GeminiService,
  ) {}

  /**
   * 生成舆情监测日报
   */
  async generateSentimentDailyReport(options: ReportGenerationOptions): Promise<Report> {
    this.logger.log(`开始生成舆情监测日报: ${options.startDate} 至 ${options.endDate}`);

    // 创建报告记录
    const report = await this.createReportRecord(
      ReportType.SENTIMENT_DAILY,
      options,
      '舆情监测日报',
    );

    try {
      // 收集舆情数据
      const sentimentData = await this.collectSentimentData(options.startDate, options.endDate);

      // 使用AI生成分析结论
      const analysis = await this.generateSentimentAnalysis(sentimentData);

      // 准备图表数据
      const charts = this.prepareSentimentCharts(sentimentData);

      // 更新报告记录
      report.content = sentimentData;
      report.charts = charts;
      report.analysis = analysis;
      report.status = ReportStatus.COMPLETED;
      report.completedAt = new Date();

      // 保存报告
      await this.reportRepository.save(report);

      this.logger.log(`舆情监测日报生成完成: ${report.id}`);
      return report;
    } catch (error) {
      this.logger.error(`生成舆情监测日报失败: ${error.message}`, error.stack);
      report.status = ReportStatus.FAILED;
      await this.reportRepository.save(report);
      throw error;
    }
  }

  /**
   * 生成舆情监测周报
   */
  async generateSentimentWeeklyReport(options: ReportGenerationOptions): Promise<Report> {
    this.logger.log(`开始生成舆情监测周报: ${options.startDate} 至 ${options.endDate}`);

    const report = await this.createReportRecord(
      ReportType.SENTIMENT_WEEKLY,
      options,
      '舆情监测周报',
    );

    try {
      const sentimentData = await this.collectSentimentData(options.startDate, options.endDate);
      const analysis = await this.generateSentimentAnalysis(sentimentData, 'weekly');
      const charts = this.prepareSentimentCharts(sentimentData);

      report.content = sentimentData;
      report.charts = charts;
      report.analysis = analysis;
      report.status = ReportStatus.COMPLETED;
      report.completedAt = new Date();

      await this.reportRepository.save(report);

      this.logger.log(`舆情监测周报生成完成: ${report.id}`);
      return report;
    } catch (error) {
      this.logger.error(`生成舆情监测周报失败: ${error.message}`, error.stack);
      report.status = ReportStatus.FAILED;
      await this.reportRepository.save(report);
      throw error;
    }
  }

  /**
   * 生成公众号运营月报
   */
  async generateWechatMonthlyReport(options: ReportGenerationOptions): Promise<Report> {
    this.logger.log(`开始生成公众号运营月报: ${options.startDate} 至 ${options.endDate}`);

    const report = await this.createReportRecord(
      ReportType.WECHAT_MONTHLY,
      options,
      '公众号运营月报',
    );

    try {
      // 注意：这里需要接入实际的公众号数据
      // 目前使用模拟数据
      const wechatData = await this.collectWechatData(options.startDate, options.endDate);
      const analysis = await this.generateWechatAnalysis(wechatData);
      const charts = this.prepareWechatCharts(wechatData);

      report.content = wechatData;
      report.charts = charts;
      report.analysis = analysis;
      report.status = ReportStatus.COMPLETED;
      report.completedAt = new Date();

      await this.reportRepository.save(report);

      this.logger.log(`公众号运营月报生成完成: ${report.id}`);
      return report;
    } catch (error) {
      this.logger.error(`生成公众号运营月报失败: ${error.message}`, error.stack);
      report.status = ReportStatus.FAILED;
      await this.reportRepository.save(report);
      throw error;
    }
  }

  /**
   * 获取报告列表
   */
  async getReports(
    type?: ReportType,
    status?: ReportStatus,
    limit = 20,
    offset = 0,
  ): Promise<{ reports: Report[]; total: number }> {
    const queryBuilder = this.reportRepository.createQueryBuilder('report');

    if (type) {
      queryBuilder.andWhere('report.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    const [reports, total] = await queryBuilder
      .orderBy('report.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { reports, total };
  }

  /**
   * 获取报告详情
   */
  async getReportById(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { id } });

    if (!report) {
      throw new Error(`报告 ${id} 不存在`);
    }

    return report;
  }

  /**
   * 导出报告为Word格式（模拟）
   */
  async exportReportToWord(reportId: string): Promise<{ url: string }> {
    const report = await this.getReportById(reportId);

    // 模拟Word导出，返回模拟URL
    const mockUrl = `/api/v1/analytics/reports/${reportId}/export/word`;

    // 更新报告文件URL
    report.fileUrl = mockUrl;
    await this.reportRepository.save(report);

    return { url: mockUrl };
  }

  /**
   * 创建报告记录
   */
  private async createReportRecord(
    type: ReportType,
    options: ReportGenerationOptions,
    defaultTitle: string,
  ): Promise<Report> {
    const report = new Report();
    report.type = type;
    report.title = options.title || `${defaultTitle} (${options.startDate.toISOString().split('T')[0]} 至 ${options.endDate.toISOString().split('T')[0]})`;
    report.startDate = options.startDate;
    report.endDate = options.endDate;
    report.status = ReportStatus.GENERATING;
    report.generatedBy = options.generatedBy;
    report.createdAt = new Date();

    return await this.reportRepository.save(report);
  }

  /**
   * 收集舆情数据
   */
  private async collectSentimentData(startDate: Date, endDate: Date): Promise<SentimentReportData> {
    // 获取舆情统计
    const stats = await this.sentimentRepository.getSentimentStats(startDate, endDate);

    // 获取舆情趋势（按天）
    const trends = await this.sentimentRepository.getSentimentTrend(startDate, endDate, 'day');

    // 获取热门关键词
    const hotKeywords = await this.sentimentRepository.getHotKeywords(10);

    // 获取热门内容（按阅读量排序）
    const sentiments = await this.sentimentRepository.findByTimeRange(startDate, endDate);
    const topContent = sentiments
      .sort((a, b) => b.readCount - a.readCount)
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        platform: s.platform,
        content: s.content.length > 100 ? s.content.substring(0, 100) + '...' : s.content,
        sentiment: s.sentiment,
        sentimentScore: Number(s.sentimentScore),
        readCount: s.readCount,
        shareCount: s.shareCount,
        commentCount: s.commentCount,
        publishTime: s.publishTime,
      }));

    return {
      summary: {
        total: stats.total,
        timeRange: { start: startDate, end: endDate },
        platforms: stats.byPlatform,
        sentiments: stats.bySentiment,
        averageSentimentScore: stats.averageSentimentScore,
      },
      trends,
      hotKeywords,
      topContent,
    };
  }

  /**
   * 收集公众号数据（模拟）
   */
  private async collectWechatData(startDate: Date, endDate: Date): Promise<WechatReportData> {
    // 模拟公众号数据
    // TODO: 接入实际的公众号数据

    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const trends = [];

    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const period = date.toISOString().split('T')[0];

      trends.push({
        period,
        articles: Math.floor(Math.random() * 5) + 1,
        reads: Math.floor(Math.random() * 1000) + 100,
        likes: Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 50) + 5,
      });
    }

    const totalArticles = trends.reduce((sum, t) => sum + t.articles, 0);
    const totalReads = trends.reduce((sum, t) => sum + t.reads, 0);
    const totalLikes = trends.reduce((sum, t) => sum + t.likes, 0);
    const totalShares = trends.reduce((sum, t) => sum + t.shares, 0);

    const topArticles = [
      { title: '政务新媒体运营策略分享', publishTime: new Date(), readCount: 1250, likeCount: 89, shareCount: 42 },
      { title: '政策解读：数字化转型指南', publishTime: new Date(), readCount: 980, likeCount: 67, shareCount: 31 },
      { title: '政务服务案例展示', publishTime: new Date(), readCount: 756, likeCount: 45, shareCount: 23 },
    ];

    return {
      summary: {
        totalArticles,
        timeRange: { start: startDate, end: endDate },
        totalReads,
        totalLikes,
        totalShares,
        averageReadRate: totalArticles > 0 ? totalReads / totalArticles : 0,
      },
      topArticles,
      trends,
    };
  }

  /**
   * 生成舆情分析结论（使用AI）
   */
  private async generateSentimentAnalysis(
    data: SentimentReportData,
    period: 'daily' | 'weekly' = 'daily',
  ): Promise<string> {
    try {
      const prompt = this.buildSentimentAnalysisPrompt(data, period);

      // 使用Gemini生成分析结论
      // 注意：GeminiService可能需要调整以支持文本生成
      // 暂时返回模拟分析
      return this.generateMockSentimentAnalysis(data, period);
    } catch (error) {
      this.logger.warn(`AI分析失败，使用默认分析: ${error.message}`);
      return this.generateMockSentimentAnalysis(data, period);
    }
  }

  /**
   * 生成公众号运营分析结论
   */
  private async generateWechatAnalysis(data: WechatReportData): Promise<string> {
    // 模拟分析结论
    const totalArticles = data.summary.totalArticles;
    const avgReads = data.summary.totalReads / Math.max(1, totalArticles);
    const avgLikes = data.summary.totalLikes / Math.max(1, totalArticles);
    const avgShares = data.summary.totalShares / Math.max(1, totalArticles);

    const analysis = `本期公众号运营月报分析：

    1. 内容发布：共发布 ${totalArticles} 篇文章，保持了稳定的更新频率。

    2. 阅读表现：总阅读量 ${data.summary.totalReads}，平均每篇文章阅读量 ${avgReads.toFixed(0)}，表现${avgReads > 500 ? '优秀' : avgReads > 300 ? '良好' : '一般'}。

    3. 互动数据：总点赞数 ${data.summary.totalLikes}，平均每篇 ${avgLikes.toFixed(1)}；总分享数 ${data.summary.totalShares}，平均每篇 ${avgShares.toFixed(1)}。

    4. 运营建议：
       - 继续保持内容更新频率，重点提升文章质量
       - 分析阅读量较高的文章特点，复制成功经验
       - 加强互动环节设计，提升用户参与度
       - 结合热点政策，增加时效性内容`;

    return analysis;
  }

  /**
   * 构建舆情分析提示词
   */
  private buildSentimentAnalysisPrompt(data: SentimentReportData, period: string): string {
    return `请分析以下舆情数据并生成专业报告：

时间范围：${period === 'daily' ? '日报' : '周报'}
舆情总数：${data.summary.total}
情感分布：正面 ${data.summary.sentiments[SentimentType.POSITIVE]}，负面 ${data.summary.sentiments[SentimentType.NEGATIVE]}，中性 ${data.summary.sentiments[SentimentType.NEUTRAL]}
平台分布：${Object.entries(data.summary.platforms).map(([p, c]) => `${p}:${c}`).join(', ')}
平均情感分数：${data.summary.averageSentimentScore.toFixed(2)}
热门关键词：${data.hotKeywords.slice(0, 5).map(k => k.keyword).join(', ')}

请提供：
1. 总体舆情态势评估
2. 主要关注点和热点话题
3. 潜在风险和预警
4. 应对建议和行动方案`;
  }

  /**
   * 生成模拟舆情分析结论
   */
  private generateMockSentimentAnalysis(data: SentimentReportData, period: string): string {
    const positiveRatio = data.summary.total > 0
      ? data.summary.sentiments[SentimentType.POSITIVE] / data.summary.total
      : 0;
    const negativeRatio = data.summary.total > 0
      ? data.summary.sentiments[SentimentType.NEGATIVE] / data.summary.total
      : 0;

    let assessment = '';
    if (positiveRatio > 0.6) {
      assessment = '整体舆情态势积极向好，正面评价占主导地位';
    } else if (negativeRatio > 0.4) {
      assessment = '舆情态势需要关注，负面评价占比较高';
    } else {
      assessment = '舆情态势总体平稳，正负面评价分布均衡';
    }

    return `${period === 'daily' ? '今日' : '本周'}舆情监测分析：

    1. 总体态势：${assessment}

    2. 平台分布：${Object.entries(data.summary.platforms)
      .filter(([_, count]) => count > 0)
      .map(([platform, count]) => `${platform}平台${count}条`)
      .join('，')}

    3. 热点话题：${data.hotKeywords.slice(0, 3).map(k => k.keyword).join('、')}

    4. 风险提示：${negativeRatio > 0.3 ? '存在一定负面舆情风险，建议密切关注相关话题' : '暂无重大舆情风险'}

    5. 建议措施：
       - 加强正面内容传播，巩固良好形象
       - 对负面舆情及时响应和处理
       - 持续监测热点话题发展趋势`;
  }

  /**
   * 准备舆情图表数据
   */
  private prepareSentimentCharts(data: SentimentReportData): any {
    // 情感分布饼图数据
    const sentimentPie = {
      type: 'pie',
      title: '情感分布',
      labels: ['正面', '负面', '中性'],
      datasets: [
        {
          data: [
            data.summary.sentiments[SentimentType.POSITIVE],
            data.summary.sentiments[SentimentType.NEGATIVE],
            data.summary.sentiments[SentimentType.NEUTRAL],
          ],
          backgroundColor: ['#4CAF50', '#F44336', '#9E9E9E'],
        },
      ],
    };

    // 平台分布柱状图数据
    const platformBar = {
      type: 'bar',
      title: '平台分布',
      labels: Object.keys(data.summary.platforms),
      datasets: [
        {
          label: '舆情数量',
          data: Object.values(data.summary.platforms),
          backgroundColor: '#2196F3',
        },
      ],
    };

    // 趋势折线图数据
    const trendLine = {
      type: 'line',
      title: '舆情趋势',
      labels: data.trends.map(t => t.period),
      datasets: [
        {
          label: '正面',
          data: data.trends.map(t => t.positive),
          borderColor: '#4CAF50',
        },
        {
          label: '负面',
          data: data.trends.map(t => t.negative),
          borderColor: '#F44336',
        },
        {
          label: '中性',
          data: data.trends.map(t => t.neutral),
          borderColor: '#9E9E9E',
        },
      ],
    };

    return {
      sentimentPie,
      platformBar,
      trendLine,
    };
  }

  /**
   * 准备公众号图表数据
   */
  private prepareWechatCharts(data: WechatReportData): any {
    // 阅读量趋势
    const readTrend = {
      type: 'line',
      title: '阅读量趋势',
      labels: data.trends.map(t => t.period),
      datasets: [
        {
          label: '阅读量',
          data: data.trends.map(t => t.reads),
          borderColor: '#2196F3',
        },
      ],
    };

    // 互动数据柱状图
    const interactionBar = {
      type: 'bar',
      title: '互动数据',
      labels: data.trends.slice(-7).map(t => t.period), // 最近7天
      datasets: [
        {
          label: '点赞',
          data: data.trends.slice(-7).map(t => t.likes),
          backgroundColor: '#4CAF50',
        },
        {
          label: '分享',
          data: data.trends.slice(-7).map(t => t.shares),
          backgroundColor: '#FF9800',
        },
      ],
    };

    // 文章排行
    const articleRanking = {
      type: 'bar',
      title: '文章阅读量排行',
      labels: data.topArticles.map(a => a.title.substring(0, 15) + '...'),
      datasets: [
        {
          label: '阅读量',
          data: data.topArticles.map(a => a.readCount),
          backgroundColor: '#9C27B0',
        },
      ],
    };

    return {
      readTrend,
      interactionBar,
      articleRanking,
    };
  }
}