import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { DataImportJob } from '../../../entities/data-import-job.entity';
import { CustomerSegment } from '../../../entities/customer-segment.entity';
import { User } from '../../../entities/user.entity';
import { UserBehavior } from '../../data-analytics/entities/user-behavior.entity';
import { MarketingCampaign } from '../../data-analytics/entities/marketing-campaign.entity';
import { MarketingStrategy } from '../../data-analytics/entities/marketing-strategy.entity';
import { CampaignStatus } from '../../../shared/enums/campaign-status.enum';
import { UserBehaviorEvent } from '../../../shared/enums/user-behavior-event.enum';
import {
  DashboardStats,
  CustomerOverview,
  MarketingPerformance,
  RealTimeMetrics,
  ChartData,
  DashboardReportRequest,
  DashboardReportResponse,
} from '../interfaces/dashboard.interface';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CustomerProfile)
    private customerProfileRepository: Repository<CustomerProfile>,
    @InjectRepository(DataImportJob)
    private dataImportJobRepository: Repository<DataImportJob>,
    @InjectRepository(CustomerSegment)
    private customerSegmentRepository: Repository<CustomerSegment>,
    @InjectRepository(UserBehavior)
    private userBehaviorRepository: Repository<UserBehavior>,
    @InjectRepository(MarketingCampaign)
    private marketingCampaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(MarketingStrategy)
    private marketingStrategyRepository: Repository<MarketingStrategy>,
  ) {}

  async getDashboardStats(query: any): Promise<DashboardStats> {
    // 并行执行所有查询以提高性能
    const [
      totalUsers,
      activeUsers,
      totalCampaigns,
      activeCampaigns,
      totalStrategies,
      customerProfiles,
    ] = await Promise.all([
      this.userRepository.count(),
      // 活跃用户：最近30天内有行为的用户
      this.userBehaviorRepository
        .createQueryBuilder('behavior')
        .select('COUNT(DISTINCT behavior.userId)', 'count')
        .where('behavior.timestamp >= :date', {
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        })
        .getRawOne()
        .then((result) => parseInt(result?.count || '0', 10)),
      this.marketingCampaignRepository.count(),
      this.marketingCampaignRepository.count({
        where: { status: CampaignStatus.ACTIVE },
      }),
      this.marketingStrategyRepository.count(),
      this.customerProfileRepository.count(),
    ]);

    // 目前没有真实收入数据和会话时间数据，暂时返回0
    const totalRevenue = 0;
    const avgSessionTime = 0;

    return {
      totalUsers,
      activeUsers,
      totalRevenue,
      avgSessionTime,
      totalCampaigns,
      activeCampaigns,
      totalStrategies,
      customerProfiles,
    };
  }

  async getCustomerOverview(profileId: string): Promise<CustomerOverview> {
    // 查询客户档案
    const customerProfile = await this.customerProfileRepository.findOne({
      where: { id: profileId },
    });

    // 如果没有找到客户档案，返回模拟数据
    if (!customerProfile) {
      return {
        demographicDistribution: {
          ageGroups: {
            '18-25': 25,
            '26-35': 40,
            '36-45': 20,
            '46-55': 10,
            '56+': 5,
          },
          gender: { male: 55, female: 45 },
          location: { 北京: 30, 上海: 25, 广东: 20, 其他: 25 },
        },
        behaviorMetrics: {
          averagePurchaseFrequency: 3.2,
          averageOrderValue: 450,
          customerLifetimeValue: 2500,
          retentionRate: 0.72,
        },
        topSegments: [
          { name: '高价值VIP客户', size: 150, revenueContribution: 0.45 },
          { name: '年轻时尚族群', size: 280, revenueContribution: 0.3 },
          { name: '家庭消费群体', size: 220, revenueContribution: 0.2 },
          { name: '低频访问客户', size: 150, revenueContribution: 0.05 },
        ],
      };
    }

    // 从profileData和behaviorInsights中提取数据
    const profileData = customerProfile.profileData || {};
    const behaviorInsights = customerProfile.behaviorInsights || {};

    // 查询客户分群（取前5个）
    const segments = await this.customerSegmentRepository.find({
      where: { customerProfileId: profileId },
      take: 5,
    });

    const topSegments = segments.map((segment) => ({
      name: segment.segmentName,
      size: segment.memberCount || 0,
      revenueContribution: segment.memberCount
        ? segment.memberCount / 1000
        : 0.1, // 简化计算
    }));

    // 如果topSegments为空，使用默认值
    if (topSegments.length === 0) {
      topSegments.push(
        { name: '高价值VIP客户', size: 150, revenueContribution: 0.45 },
        { name: '年轻时尚族群', size: 280, revenueContribution: 0.3 },
        { name: '家庭消费群体', size: 220, revenueContribution: 0.2 },
        { name: '低频访问客户', size: 150, revenueContribution: 0.05 },
      );
    }

    return {
      demographicDistribution: {
        ageGroups: profileData.ageGroups || {
          '18-25': 25,
          '26-35': 40,
          '36-45': 20,
          '46-55': 10,
          '56+': 5,
        },
        gender: profileData.gender || { male: 55, female: 45 },
        location: profileData.location || {
          北京: 30,
          上海: 25,
          广东: 20,
          其他: 25,
        },
      },
      behaviorMetrics: {
        averagePurchaseFrequency:
          behaviorInsights.averagePurchaseFrequency || 3.2,
        averageOrderValue: behaviorInsights.averageOrderValue || 450,
        customerLifetimeValue: behaviorInsights.customerLifetimeValue || 2500,
        retentionRate: behaviorInsights.retentionRate || 0.72,
      },
      topSegments,
    };
  }

  async getMarketingPerformance(
    campaignId: string,
    granularity?: string,
  ): Promise<MarketingPerformance> {
    // 查询营销活动
    const campaign = await this.marketingCampaignRepository.findOne({
      where: { id: campaignId },
    });

    // 如果没有找到活动，返回模拟数据
    if (!campaign) {
      const timeline: Array<{ date: string; metrics: any }> = [];
      const baseDate = new Date();

      for (let i = 0; i < 7; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        timeline.push({
          date: date.toISOString().split('T')[0],
          metrics: {
            reach: Math.floor(Math.random() * 10000) + 5000,
            engagement: Math.floor(Math.random() * 1000) + 500,
            conversion: Math.floor(Math.random() * 100) + 20,
            spend: Math.floor(Math.random() * 5000) + 1000,
            revenue: Math.floor(Math.random() * 20000) + 5000,
          },
        });
      }

      return {
        campaignId,
        campaignName: '商场春季焕新购物节',
        metrics: {
          reach: 24500,
          engagement: 3200,
          conversion: 420,
          roi: 3.8,
          spend: 125000,
          revenue: 475000,
        },
        timeline: timeline.reverse(),
      };
    }

    // 查询活动相关的策略
    const strategies = await this.marketingStrategyRepository.find({
      where: { campaignId },
    });

    // 计算指标（简化计算）
    const totalStrategies = strategies.length;
    const avgConfidence =
      totalStrategies > 0
        ? strategies.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) /
          totalStrategies
        : 0;

    // 生成时间线数据（模拟）
    const timeline: Array<{ date: string; metrics: any }> = [];
    const baseDate = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      timeline.push({
        date: date.toISOString().split('T')[0],
        metrics: {
          reach: Math.floor(Math.random() * 10000) + 5000,
          engagement: Math.floor(Math.random() * 1000) + 500,
          conversion: Math.floor(Math.random() * 100) + 20,
          spend: Math.floor(Math.random() * 5000) + 1000,
          revenue: Math.floor(Math.random() * 20000) + 5000,
        },
      });
    }

    // 基于活动预算和策略置信度计算指标
    const budget = campaign.budget || 0;
    const reach = Math.floor(budget * 0.2) + 10000;
    const engagement = Math.floor(budget * 0.015) + 500;
    const conversion = Math.floor(budget * 0.001) + 20;
    const spend = budget * 0.8;
    const revenue = budget * 3.8;
    const roi = revenue / spend;

    return {
      campaignId,
      campaignName: campaign.name,
      metrics: {
        reach,
        engagement,
        conversion,
        roi,
        spend,
        revenue,
      },
      timeline: timeline.reverse(),
    };
  }

  async getRealTimeMetrics(lastMinutes: number = 5): Promise<RealTimeMetrics> {
    // 计算时间阈值
    const threshold = new Date(Date.now() - lastMinutes * 60 * 1000);

    // 查询最近几分钟的用户行为
    const behaviors = await this.userBehaviorRepository.find({
      where: { timestamp: MoreThanOrEqual(threshold) },
    });

    // 计算指标
    const sessionIds = new Set(behaviors.map((b) => b.sessionId));
    const activeSessions = sessionIds.size;

    // 使用现有事件类型计算指标
    const recentConversions = behaviors.filter(
      (b) =>
        b.eventType === UserBehaviorEvent.CAMPAIGN_CREATE ||
        b.eventType === UserBehaviorEvent.STRATEGY_GENERATE,
    ).length;
    const contentViews = behaviors.filter(
      (b) => b.eventType === UserBehaviorEvent.PAGE_VIEW,
    ).length;
    const socialEngagements = behaviors.filter(
      (b) =>
        b.eventType === UserBehaviorEvent.CONTENT_CREATE ||
        b.eventType === UserBehaviorEvent.PUBLISH_TASK,
    ).length;
    const apiCalls = behaviors.length;

    return {
      activeSessions,
      recentConversions,
      contentViews,
      socialEngagements,
      apiCalls,
      timestamp: new Date().toISOString(),
    };
  }

  async getUserActivityChart(
    days: number = 7,
    profileId?: string,
  ): Promise<ChartData> {
    // 计算开始日期
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // 查询每日用户活跃度
    const dailyActivity = await this.userBehaviorRepository
      .createQueryBuilder('behavior')
      .select('DATE(behavior.timestamp) as date')
      .addSelect('COUNT(*) as count')
      .where('behavior.timestamp >= :startDate', { startDate })
      .groupBy('DATE(behavior.timestamp)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 生成日期标签和数据
    const labels: string[] = [];
    const data: number[] = [];

    // 生成过去days天的日期序列
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      const formattedLabel = `${date.getMonth() + 1}/${date.getDate()}`;
      labels.push(formattedLabel);

      // 查找对应日期的计数
      const activity = dailyActivity.find((a) => a.date === dateStr);
      data.push(activity ? parseInt(activity.count, 10) : 0);
    }

    return {
      labels,
      datasets: [
        {
          label: '用户活跃度',
          data,
          backgroundColor: 'rgba(56, 189, 248, 0.2)',
          borderColor: 'rgba(56, 189, 248, 1)',
        },
      ],
    };
  }

  async getConsumptionDistributionChart(
    profileId?: string,
  ): Promise<ChartData> {
    // 尝试从数据库获取消费频次分布数据
    if (profileId) {
      const customerProfile = await this.customerProfileRepository.findOne({
        where: { id: profileId },
      });

      if (customerProfile?.behaviorInsights?.consumptionDistribution) {
        const distribution =
          customerProfile.behaviorInsights.consumptionDistribution;
        const categories = Object.keys(distribution);
        const data = Object.values(distribution);

        return {
          labels: categories,
          datasets: [
            {
              label: '消费频次分布',
              data,
              backgroundColor: [
                'rgba(251, 191, 36, 0.7)',
                'rgba(56, 189, 248, 0.7)',
                'rgba(16, 185, 129, 0.7)',
                'rgba(139, 92, 246, 0.7)',
                'rgba(107, 114, 128, 0.7)',
              ],
              borderColor: [
                'rgba(251, 191, 36, 1)',
                'rgba(56, 189, 248, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(139, 92, 246, 1)',
                'rgba(107, 114, 128, 1)',
              ],
            },
          ],
        };
      }
    }

    // 默认硬编码数据
    const categories = [
      '高频消费',
      '中频消费',
      '低频消费',
      '潜在用户',
      '沉默用户',
    ];
    const data = [35, 25, 20, 15, 5];

    return {
      labels: categories,
      datasets: [
        {
          label: '消费频次分布',
          data,
          backgroundColor: [
            'rgba(251, 191, 36, 0.7)',
            'rgba(56, 189, 248, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(107, 114, 128, 0.7)',
          ],
          borderColor: [
            'rgba(251, 191, 36, 1)',
            'rgba(56, 189, 248, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(107, 114, 128, 1)',
          ],
        },
      ],
    };
  }

  async getGeographicDistributionChart(profileId?: string): Promise<ChartData> {
    // 尝试从数据库获取地理位置分布数据
    if (profileId) {
      const customerProfile = await this.customerProfileRepository.findOne({
        where: { id: profileId },
      });

      if (customerProfile?.profileData?.geographicDistribution) {
        const distribution = customerProfile.profileData.geographicDistribution;
        const cities = Object.keys(distribution);
        const data = Object.values(distribution);

        return {
          labels: cities,
          datasets: [
            {
              label: '客户地域分布',
              data,
              backgroundColor: 'rgba(56, 189, 248, 0.6)',
              borderColor: 'rgba(56, 189, 248, 1)',
            },
          ],
        };
      }
    }

    // 默认硬编码数据
    const cities = [
      '北京',
      '上海',
      '广东',
      '浙江',
      '江苏',
      '四川',
      '湖北',
      '陕西',
      '辽宁',
      '福建',
    ];
    const data = [2450, 2300, 2100, 1800, 1700, 1200, 950, 800, 750, 700];

    return {
      labels: cities,
      datasets: [
        {
          label: '客户地域分布',
          data,
          backgroundColor: 'rgba(56, 189, 248, 0.6)',
          borderColor: 'rgba(56, 189, 248, 1)',
        },
      ],
    };
  }

  async getROITrendChart(campaignId?: string): Promise<ChartData> {
    // 实现获取营销ROI趋势图表数据的逻辑
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      labels.push(`${date.getFullYear()}-${date.getMonth() + 1}`);
      data.push(Number((Math.random() * 3 + 1).toFixed(2)));
    }

    return {
      labels,
      datasets: [
        {
          label: '营销ROI趋势',
          data,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 1)',
        },
      ],
    };
  }

  async getCustomerScatterChart(profileId?: string): Promise<ChartData> {
    // 新增：获取客户散点图数据（客户价值 vs 消费频率）
    const labels: string[] = [];
    const data: Array<{ x: number; y: number; r: number }> = [];

    // 生成50个模拟数据点
    for (let i = 0; i < 50; i++) {
      labels.push(`客户${i + 1}`);
      data.push({
        x: Math.floor(Math.random() * 10000) + 1000, // 客户价值
        y: Math.floor(Math.random() * 50) + 1, // 消费频率
        r: Math.floor(Math.random() * 10) + 5, // 点大小（表示客户规模）
      });
    }

    // 注意：散点图数据结构不同，这里返回简化版本
    // 实际实现时可能需要调整数据结构
    return {
      labels,
      datasets: [
        {
          label: '客户价值 vs 消费频率',
          data: data.map((d) => d.x), // 简化处理
          backgroundColor: 'rgba(139, 92, 246, 0.6)',
          borderColor: 'rgba(139, 92, 246, 1)',
        },
      ],
    };
  }

  async getCustomerRadarChart(profileId?: string): Promise<ChartData> {
    // 新增：获取客户雷达图数据（客户分群特征对比）
    const dimensions = [
      '消费能力',
      '忠诚度',
      '活跃度',
      '兴趣广度',
      '转化潜力',
      '社交影响力',
    ];
    const segment1 = [85, 70, 90, 75, 80, 65]; // 高价值VIP客户
    const segment2 = [60, 50, 85, 90, 70, 95]; // 年轻时尚族群
    const segment3 = [75, 85, 60, 65, 75, 50]; // 家庭消费群体

    return {
      labels: dimensions,
      datasets: [
        {
          label: '高价值VIP客户',
          data: segment1,
          backgroundColor: 'rgba(251, 191, 36, 0.2)',
          borderColor: 'rgba(251, 191, 36, 1)',
        },
        {
          label: '年轻时尚族群',
          data: segment2,
          backgroundColor: 'rgba(56, 189, 248, 0.2)',
          borderColor: 'rgba(56, 189, 248, 1)',
        },
        {
          label: '家庭消费群体',
          data: segment3,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 1)',
        },
      ],
    };
  }

  async getHeatmapChart(
    days: number = 7,
    profileId?: string,
  ): Promise<ChartData> {
    // 新增：获取热力图数据（时间×行为模式）
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const dayLabels: string[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dayLabels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }

    // 生成热力图数据（24小时 × 天数）
    const data: number[][] = [];
    for (let hour = 0; hour < 24; hour++) {
      const row: number[] = [];
      for (let day = 0; day < days; day++) {
        // 模拟数据：白天时段活跃度更高
        let value;
        if (hour >= 9 && hour <= 18) {
          value = Math.floor(Math.random() * 80) + 40; // 40-120
        } else if (hour >= 19 && hour <= 22) {
          value = Math.floor(Math.random() * 60) + 30; // 30-90
        } else {
          value = Math.floor(Math.random() * 30) + 10; // 10-40
        }
        row.push(value);
      }
      data.push(row);
    }

    // 热力图数据结构需要特殊处理，这里返回简化版本
    return {
      labels: hours,
      datasets: [
        {
          label: '用户活跃热力图',
          data: data.flat(), // 简化处理
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 1)',
        },
      ],
    };
  }

  async generateDashboardReport(
    request: DashboardReportRequest,
  ): Promise<DashboardReportResponse> {
    // 实现生成数据看板报告的逻辑
    // 这里先返回模拟数据
    return {
      reportUrl: `https://api.lumina-media.com/reports/dashboard-${Date.now()}.pdf`,
    };
  }

  async exportDashboardData(
    format: 'csv' | 'json' = 'json',
  ): Promise<{ downloadUrl: string }> {
    // 实现导出数据看板数据的逻辑
    // 这里先返回模拟数据
    return {
      downloadUrl: `https://api.lumina-media.com/exports/dashboard-${Date.now()}.${format}`,
    };
  }

  async getParkingSpendingData(profileId?: string): Promise<any[]> {
    // 模拟停车时长与消费金额关系数据
    const durations = ['<1小时', '1-2小时', '2-3小时', '3-4小时', '>4小时'];
    const data = durations.map((duration, index) => ({
      duration,
      avgSpending: Math.floor(Math.random() * 500) + 200 + index * 100,
      userCount: Math.floor(Math.random() * 300) + 100 + index * 50,
    }));
    return data;
  }

  async getTrafficTimeSeriesData(profileId?: string, days?: number): Promise<any[]> {
    const targetDays = days || 30;
    const data = [];
    const baseDate = new Date();

    for (let i = targetDays - 1; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // 模拟数据：周末更高
      const dayOfWeek = date.getDay();
      let baseValue = 1000;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        baseValue = 1500; // 周末
      }

      const value = Math.floor(Math.random() * 300) + baseValue;
      data.push({ date: dateStr, value });
    }

    return data;
  }
}
