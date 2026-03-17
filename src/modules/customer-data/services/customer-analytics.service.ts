import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { CustomerSegment } from '../../../entities/customer-segment.entity';
import { DataImportJob } from '../../../entities/data-import-job.entity';
import { DataImportStatus } from '../../../shared/enums/data-import-status.enum';

@Injectable()
export class CustomerAnalyticsService {
  constructor(
    @InjectRepository(CustomerProfile)
    private customerProfileRepository: Repository<CustomerProfile>,
    @InjectRepository(CustomerSegment)
    private customerSegmentRepository: Repository<CustomerSegment>,
    @InjectRepository(DataImportJob)
    private dataImportJobRepository: Repository<DataImportJob>,
  ) {}

  /**
   * 生成客户画像分析报告
   */
  async generateCustomerProfileAnalysis(
    profileId: string,
  ): Promise<Record<string, any>> {
    const profile = await this.customerProfileRepository.findOne({
      where: { id: profileId },
      relations: ['segments', 'importJobs'],
    });

    if (!profile) {
      throw new NotFoundException(`Customer profile ${profileId} not found`);
    }

    // 获取导入数据统计
    const importJobs = await this.dataImportJobRepository.find({
      where: { customerProfileId: profileId },
    });

    const totalRecords = importJobs.reduce(
      (sum, job) => sum + job.recordCount,
      0,
    );
    const completedImports = importJobs.filter(
      (job) => job.status === DataImportStatus.SUCCESS,
    ).length;

    // 模拟分析逻辑 - 基于预设的商场客户场景
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

  /**
   * 计算数据新鲜度
   */
  private calculateDataFreshness(importJobs: DataImportJob[]): string {
    if (importJobs.length === 0) return 'No data';

    const completedJobs = importJobs.filter(
      (job) => job.status === DataImportStatus.SUCCESS,
    );
    if (completedJobs.length === 0) return 'No completed imports';

    const latestJob = completedJobs.reduce(
      (latest, job) =>
        job.completedAt && (!latest || job.completedAt > latest)
          ? job.completedAt
          : latest,
      null as Date | null,
    );

    if (!latestJob) return 'Unknown';

    const daysAgo = Math.floor(
      (Date.now() - latestJob.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return `${Math.floor(daysAgo / 30)} months ago`;
  }

  /**
   * 计算数据完整性
   */
  private calculateDataCompleteness(importJobs: DataImportJob[]): number {
    if (importJobs.length === 0) return 0;

    const totalRecords = importJobs.reduce(
      (sum, job) => sum + job.recordCount,
      0,
    );
    const processedRecords = importJobs.reduce(
      (sum, job) => sum + (job.successCount + job.failedCount),
      0,
    );

    if (totalRecords === 0) return 0;
    return Math.round((processedRecords / totalRecords) * 100);
  }

  /**
   * 生成人口统计分析
   */
  private generateDemographicAnalysis(
    profile: CustomerProfile,
  ): Record<string, any> {
    // 模拟数据 - 实际应从profileData中获取
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

  /**
   * 生成行为分析
   */
  private generateBehavioralAnalysis(
    profile: CustomerProfile,
  ): Record<string, any> {
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

  /**
   * 生成消费分析
   */
  private generateConsumptionAnalysis(
    profile: CustomerProfile,
  ): Record<string, any> {
    const profileData = profile.profileData || {};

    return {
      spendingPatterns: {
        averageMonthlySpend:
          profileData.consumption?.averageMonthlySpend || 320,
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
        holidayImpact: 35, // 节假日销售额提升百分比
      },
      customerLifetimeValue: {
        averageCLV: 3840, // 平均客户生命周期价值
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

  /**
   * 生成分群分析
   */
  private async generateSegmentationAnalysis(
    profileId: string,
  ): Promise<Record<string, any>> {
    const segments = await this.customerSegmentRepository.find({
      where: { customerProfileId: profileId },
    });

    if (segments.length === 0) {
      return {
        segmentCount: 0,
        message: 'No customer segments defined',
      };
    }

    const totalMembers = segments.reduce(
      (sum, segment) => sum + segment.memberCount,
      0,
    );

    return {
      segmentCount: segments.length,
      totalMembers,
      segmentDetails: segments.map((segment) => ({
        name: segment.segmentName,
        memberCount: segment.memberCount,
        percentage:
          totalMembers > 0
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

  /**
   * 生成关键洞察
   */
  private generateKeyInsights(
    profile: CustomerProfile,
    importJobs: DataImportJob[],
  ): string[] {
    const insights: string[] = [];

    // 基于数据质量
    const dataCompleteness = this.calculateDataCompleteness(importJobs);
    if (dataCompleteness < 80) {
      insights.push(
        `数据完整性有待提升（当前${dataCompleteness}%），建议补充缺失数据`,
      );
    } else {
      insights.push(`数据质量良好，完整性达${dataCompleteness}%`);
    }

    // 基于行业特性
    if (profile.industry === 'RETAIL') {
      insights.push('零售行业客户注重购物体验和便利性，线上线下融合是关键');
      insights.push('年轻客户占比高，社交媒体和移动端接触点尤为重要');
    }

    // 基于客户类型
    if (profile.customerType === 'ENTERPRISE') {
      insights.push('企业客户数据规模大，需建立系统化的数据分析流程');
      insights.push('B2B场景下，客户决策链更长，需要多触点跟踪');
    }

    // 通用业务洞察
    insights.push('移动支付渗透率高，数字化会员体系是提升复购的关键');
    insights.push('周末客流集中但工作日价值更高，需平衡客流与客单价');
    insights.push('高价值客户占比虽小但贡献大，应优先服务与维护');

    return insights;
  }

  /**
   * 生成推荐建议
   */
  private generateRecommendations(profile: CustomerProfile): Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    expectedImpact: string;
    timeframe: string;
  }> {
    const recommendations = [
      {
        priority: 'high' as const,
        category: '数据质量',
        recommendation: '补充客户联系方式字段，提升数据完整性至95%以上',
        expectedImpact: '提高营销活动触达率30-40%',
        timeframe: '1个月内',
      },
      {
        priority: 'high' as const,
        category: '客户留存',
        recommendation: '为潜在流失客户设计专属召回活动，提供个性化优惠',
        expectedImpact: '降低客户流失率15-20%',
        timeframe: '2个月内',
      },
      {
        priority: 'medium' as const,
        category: '营销优化',
        recommendation: '针对高频高价值客户推出VIP专属服务计划',
        expectedImpact: '提升高价值客户复购率25-30%',
        timeframe: '3个月内',
      },
      {
        priority: 'medium' as const,
        category: '渠道扩展',
        recommendation: '开发线上商城和移动应用，拓展非周末时段销售',
        expectedImpact: '增加线上销售额20-25%',
        timeframe: '6个月内',
      },
      {
        priority: 'low' as const,
        category: '数据分析',
        recommendation: '建立自动化报表系统，实时监控关键业务指标',
        expectedImpact: '减少人工分析时间50%，提升决策效率',
        timeframe: '3个月内',
      },
    ];

    // 根据行业调整推荐
    if (profile.industry === 'RETAIL') {
      recommendations.push({
        priority: 'high' as const,
        category: '零售优化',
        recommendation: '优化卖场布局和动线设计，提升客户停留时间和交叉销售',
        expectedImpact: '提高客单价15-20%',
        timeframe: '2个月内',
      });
    }

    return recommendations;
  }

  /**
   * 执行客户分群（基于规则）
   */
  async performCustomerSegmentation(
    profileId: string,
    segmentationRules?: Record<string, any>,
  ): Promise<CustomerSegment[]> {
    const profile = await this.customerProfileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException(`Customer profile ${profileId} not found`);
    }

    // 使用默认规则或传入的规则
    const rules = segmentationRules || this.getDefaultSegmentationRules();

    // 模拟分群执行 - 实际应基于真实数据计算
    // 这里我们生成模拟的分群结果
    const segments = await this.generateSegmentationResults(profileId, rules);

    // 保存分群结果（先删除旧的分群）
    await this.customerSegmentRepository.delete({
      customerProfileId: profileId,
    });

    const savedSegments: CustomerSegment[] = [];
    for (const segmentData of segments) {
      const segment = this.customerSegmentRepository.create({
        customerProfileId: profileId,
        ...segmentData,
      });
      const savedSegment = (await this.customerSegmentRepository.save(
        segment,
      )) as unknown as CustomerSegment;
      savedSegments.push(savedSegment);
    }

    return savedSegments;
  }

  /**
   * 获取默认分群规则
   */
  private getDefaultSegmentationRules(): Record<string, any> {
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

  /**
   * 生成模拟的分群结果
   */
  private async generateSegmentationResults(
    profileId: string,
    rules: Record<string, any>,
  ): Promise<any[]> {
    // 模拟分群计算
    // 实际实现中，这里会查询数据库并应用规则
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

  /**
   * 获取客户分析仪表板数据
   */
  async getDashboardData(profileId: string): Promise<Record<string, any>> {
    const profile = await this.customerProfileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException(`Customer profile ${profileId} not found`);
    }

    const importJobs = await this.dataImportJobRepository.find({
      where: { customerProfileId: profileId },
    });

    const segments = await this.customerSegmentRepository.find({
      where: { customerProfileId: profileId },
    });

    const totalRecords = importJobs.reduce(
      (sum, job) => sum + job.recordCount,
      0,
    );
    const totalSegments = segments.length;
    const totalMembers = segments.reduce(
      (sum, segment) => sum + segment.memberCount,
      0,
    );

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
        segmentationCoverage:
          totalRecords > 0
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

  /**
   * 获取客户档案的分群列表
   */
  async getCustomerSegments(profileId: string): Promise<CustomerSegment[]> {
    return await this.customerSegmentRepository.find({
      where: { customerProfileId: profileId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取客户分群详情
   */
  async getSegmentDetail(
    profileId: string,
    segmentId: string,
  ): Promise<CustomerSegment> {
    const segment = await this.customerSegmentRepository.findOne({
      where: { id: segmentId, customerProfileId: profileId },
    });

    if (!segment) {
      throw new Error(
        `Customer segment ${segmentId} not found for profile ${profileId}`,
      );
    }

    return segment;
  }

  /**
   * 更新客户分群
   */
  async updateSegment(
    profileId: string,
    segmentId: string,
    updates: Partial<CustomerSegment>,
  ): Promise<CustomerSegment> {
    const segment = await this.getSegmentDetail(profileId, segmentId);

    Object.assign(segment, updates);
    segment.updatedAt = new Date();

    return await this.customerSegmentRepository.save(segment);
  }

  /**
   * 删除客户分群
   */
  async deleteSegment(profileId: string, segmentId: string): Promise<void> {
    const result = await this.customerSegmentRepository.delete({
      id: segmentId,
      customerProfileId: profileId,
    });

    if (result.affected === 0) {
      throw new Error(
        `Customer segment ${segmentId} not found for profile ${profileId}`,
      );
    }
  }

  /**
   * 获取雷达图数据（客户画像多维分析）
   */
  async getRadarChartData(profileId: string): Promise<Record<string, any>> {
    // 获取客户档案
    const profile = await this.customerProfileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException(`Customer profile ${profileId} not found`);
    }

    const profileData = profile.profileData || {};

    // 雷达图指标：年龄分布、性别比例、地域集中度、消费水平、活跃度、忠诚度
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

  /**
   * 获取散点图数据（消费频率 vs 消费金额）
   */
  async getScatterChartData(profileId: string): Promise<Record<string, any>> {
    // 模拟散点数据
    const dataPoints: Array<{
      visitFrequency: number;
      spendingPerVisit: number;
      totalSpending: number;
      customerSegment: string;
      customerId: string;
    }> = [];
    const customerCount = 100;

    for (let i = 0; i < customerCount; i++) {
      // 生成模拟数据：消费频率（每月次数）和消费金额（平均每次消费）
      const visitFrequency = Math.floor(Math.random() * 20) + 1; // 1-20次/月
      const spendingPerVisit = Math.floor(Math.random() * 500) + 50; // 50-550元/次
      const totalSpending = visitFrequency * spendingPerVisit;

      dataPoints.push({
        visitFrequency,
        spendingPerVisit,
        totalSpending,
        customerSegment: this.assignCustomerSegment(
          visitFrequency,
          totalSpending,
        ),
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

  /**
   * 获取热力图数据（时间-行为热度分布）
   */
  async getHeatmapChartData(profileId: string): Promise<Record<string, any>> {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    // 生成热力图数据
    const data: Array<[number, number, number]> = [];
    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      for (const hour of hours) {
        // 模拟热度数据：工作日白天和周末晚上热度高
        let value = 10 + Math.random() * 20;

        // 工作日白天（10-18点）热度高
        if (dayIndex < 5 && hour >= 10 && hour <= 18) {
          value += 30 + Math.random() * 30;
        }

        // 周末晚上（18-22点）热度高
        if (dayIndex >= 5 && hour >= 18 && hour <= 22) {
          value += 40 + Math.random() * 40;
        }

        // 凌晨（0-6点）热度低
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

  /**
   * 获取漏斗图数据（客户转化路径）
   */
  async getFunnelChartData(profileId: string): Promise<Record<string, any>> {
    // 模拟漏斗数据
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

    // 计算转化率
    const conversionRates: Array<{ from: string; to: string; rate: number }> =
      [];
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
      totalConversionRate:
        Math.round(
          (funnelStages[funnelStages.length - 1].value /
            funnelStages[0].value) *
            1000,
        ) / 10,
      bottlenecks: this.identifyFunnelBottlenecks(conversionRates),
      optimizationSuggestions: [
        '访问→注册转化率偏低，建议简化注册流程',
        '首次消费→复购转化率是关键，建议加强客户关系管理',
        '忠诚客户占比仍有提升空间，建议推出会员权益计划',
      ],
    };
  }

  /**
   * 获取桑基图数据（客户分群流转）
   */
  async getSankeyChartData(profileId: string): Promise<Record<string, any>> {
    // 获取客户分群数据
    const segments = await this.customerSegmentRepository.find({
      where: { customerProfileId: profileId },
    });

    // 模拟客户分群流转数据
    const nodes = segments.map((segment) => segment.segmentName);
    nodes.push('新增客户', '流失客户');

    // 模拟流转关系
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

  /**
   * 获取所有图表数据
   */
  async getAllChartData(profileId: string): Promise<Record<string, any>> {
    const [radarData, scatterData, heatmapData, funnelData, sankeyData] =
      await Promise.all([
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

  // ========== 辅助方法 ==========

  private calculateYoungCustomerRatio(
    profileData: Record<string, any>,
  ): number {
    const ageDistribution = profileData.demographic?.ageDistribution || {};
    const youngRatio =
      (ageDistribution['18-25'] || 0) + (ageDistribution['26-35'] || 0);
    return Math.min(100, Math.round(youngRatio));
  }

  private calculateFemaleCustomerRatio(
    profileData: Record<string, any>,
  ): number {
    const genderDistribution =
      profileData.demographic?.genderDistribution || {};
    return genderDistribution.female || 50;
  }

  private calculateLocalCustomerRatio(
    profileData: Record<string, any>,
  ): number {
    const locationDistribution =
      profileData.demographic?.locationDistribution || {};
    return locationDistribution['5km内'] || 60;
  }

  private calculateSpendingLevel(profileData: Record<string, any>): number {
    const avgSpend = profileData.consumption?.averageMonthlySpend || 320;
    // 归一化到0-100：假设500元为高水平
    return Math.min(100, Math.round((avgSpend / 500) * 100));
  }

  private calculateActivityLevel(profileData: Record<string, any>): number {
    const avgFrequency = profileData.behavior?.averageVisitFrequency || 2.8;
    // 归一化到0-100：假设每月8次为高水平
    return Math.min(100, Math.round((avgFrequency / 8) * 100));
  }

  private calculateLoyaltyLevel(profileData: Record<string, any>): number {
    const retentionRate = profileData.loyalty?.retentionRate || {};
    const sixMonthRetention = retentionRate['6个月'] || 58;
    return Math.min(100, Math.round(sixMonthRetention));
  }

  private getIndustryBenchmark(industry: string): Record<string, any> {
    const benchmarks: Record<string, any> = {
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

  private assignCustomerSegment(
    visitFrequency: number,
    totalSpending: number,
  ): string {
    const avgSpendingPerVisit = totalSpending / visitFrequency;

    if (visitFrequency >= 8 && avgSpendingPerVisit >= 300) return '高频高价值';
    if (visitFrequency >= 8 && avgSpendingPerVisit < 300) return '高频低价值';
    if (visitFrequency < 8 && avgSpendingPerVisit >= 300) return '低频高价值';
    return '低频低价值';
  }

  private calculateCorrelation(dataPoints: any[]): number {
    // 简单相关系数计算
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, p) => sum + p.visitFrequency, 0);
    const sumY = dataPoints.reduce((sum, p) => sum + p.spendingPerVisit, 0);
    const sumXY = dataPoints.reduce(
      (sum, p) => sum + p.visitFrequency * p.spendingPerVisit,
      0,
    );
    const sumX2 = dataPoints.reduce(
      (sum, p) => sum + p.visitFrequency * p.visitFrequency,
      0,
    );
    const sumY2 = dataPoints.reduce(
      (sum, p) => sum + p.spendingPerVisit * p.spendingPerVisit,
      0,
    );

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
    );

    return denominator === 0
      ? 0
      : Math.round((numerator / denominator) * 100) / 100;
  }

  private identifyPeakPeriods(
    data: number[][],
    days: string[],
    hours: number[],
  ): Array<{ day: string; hour: string; value: number }> {
    // 找出热度最高的前5个时段
    const periods = data.map(([dayIndex, hour, value]) => ({
      day: days[dayIndex],
      hour: `${hour}:00`,
      value,
    }));

    return periods.sort((a, b) => b.value - a.value).slice(0, 5);
  }

  private identifyFunnelBottlenecks(
    conversionRates: Array<{ from: string; to: string; rate: number }>,
  ): string[] {
    const bottlenecks: string[] = [];
    const lowestRate = Math.min(...conversionRates.map((cr) => cr.rate));

    for (const cr of conversionRates) {
      if (cr.rate === lowestRate) {
        bottlenecks.push(`${cr.from}→${cr.to}（转化率仅${cr.rate}%）`);
      }
    }

    return bottlenecks;
  }

  private calculateNetGrowth(
    links: Array<{ source: string; target: string; value: number }>,
  ): number {
    const inflow = links
      .filter((l) => l.target === '流失客户')
      .reduce((sum, l) => sum + l.value, 0);
    const outflow = links
      .filter((l) => l.source === '新增客户')
      .reduce((sum, l) => sum + l.value, 0);

    return outflow - inflow;
  }
}
