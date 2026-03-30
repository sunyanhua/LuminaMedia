/**
 * 演示模式服务
 * 提供演示模式状态管理和数据操作包装器
 */

// 从localStorage获取演示模式状态（与store同步）
const getDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('lumina-demo-mode');
  return stored === 'true';
};

// 模拟延迟，模拟网络请求
const simulateDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 执行带演示模式包装的操作
 * @param realOperation 真实数据操作（返回Promise）
 * @param demoOperation 模拟数据操作（返回Promise）
 * @returns 根据演示模式状态执行对应操作的结果
 */
export const executeWithDemoWrapper = async <T>(
  realOperation: () => Promise<T>,
  demoOperation: () => Promise<T>
): Promise<T> => {
  const isDemoMode = getDemoMode();

  if (isDemoMode) {
    console.log('[DEMO] 演示模式：执行模拟操作');
    // 添加随机延迟，模拟网络请求
    await simulateDelay(Math.random() * 500 + 300);
    return await demoOperation();
  } else {
    return await realOperation();
  }
};

/**
 * 生成模拟数据（通用占位符）
 */
export const generateMockData = {
  // 模拟仪表板统计数据
  dashboardStats: () => ({
    totalUsers: 12458,
    activeUsers: 3247,
    totalRevenue: 1254300,
    avgSessionTime: 8.5,
    totalCampaigns: 42,
    activeCampaigns: 18,
    totalStrategies: 156,
    customerProfiles: 8920,
  }),

  // 模拟客户概览数据
  customerOverview: (profileId: string) => ({
    demographicDistribution: {
      ageGroups: { '18-24': 15, '25-34': 35, '35-44': 25, '45-54': 15, '55+': 10 },
      gender: { male: 48, female: 52 },
      location: { '华东': 35, '华北': 25, '华南': 20, '华中': 12, '西部': 8 },
    },
    behaviorMetrics: {
      averagePurchaseFrequency: 2.8,
      averageOrderValue: 156.7,
      customerLifetimeValue: 1250.5,
      retentionRate: 0.68,
    },
    topSegments: [
      { name: '高价值客户', size: 1250, revenueContribution: 0.45 },
      { name: '活跃年轻群体', size: 2340, revenueContribution: 0.28 },
      { name: '家庭消费者', size: 1560, revenueContribution: 0.18 },
      { name: '商务用户', size: 870, revenueContribution: 0.09 },
    ],
  }),

  // 模拟营销活动表现数据
  marketingPerformance: (campaignId: string) => ({
    campaignId,
    campaignName: `营销活动 ${campaignId}`,
    metrics: {
      reach: 125000,
      engagement: 0.045,
      conversion: 0.012,
      roi: 3.2,
      spend: 25000,
      revenue: 80000,
    },
    timeline: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      metrics: {
        reach: Math.floor(125000 * (0.8 + Math.random() * 0.4)),
        engagement: 0.03 + Math.random() * 0.03,
        conversion: 0.008 + Math.random() * 0.008,
      },
    })),
  }),

  // 模拟实时指标
  realTimeMetrics: () => ({
    activeSessions: Math.floor(Math.random() * 200 + 50),
    recentConversions: Math.floor(Math.random() * 20 + 5),
    contentViews: Math.floor(Math.random() * 500 + 200),
    socialEngagements: Math.floor(Math.random() * 1000 + 300),
    apiCalls: Math.floor(Math.random() * 5000 + 1000),
    timestamp: new Date().toISOString(),
  }),

  // 模拟图表数据
  chartData: (type: string) => {
    const baseLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const baseData = [65, 59, 80, 81, 56, 55, 40];

    switch (type) {
      case 'user-activity':
        return {
          labels: baseLabels,
          datasets: [
            {
              label: '用户活跃度',
              data: baseData.map(v => v + Math.random() * 20 - 10),
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderColor: 'rgb(59, 130, 246)',
            },
          ],
        };
      case 'consumption-distribution':
        return {
          labels: ['<100', '100-300', '300-500', '500-1000', '>1000'],
          datasets: [
            {
              label: '消费金额分布',
              data: [15, 30, 25, 20, 10],
              backgroundColor: 'rgba(139, 92, 246, 0.5)',
              borderColor: 'rgb(139, 92, 246)',
            },
          ],
        };
      default:
        return {
          labels: baseLabels,
          datasets: [
            {
              label: '示例数据',
              data: baseData,
              backgroundColor: 'rgba(156, 163, 175, 0.5)',
              borderColor: 'rgb(156, 163, 175)',
            },
          ],
        };
    }
  },
};

/**
 * 演示模式状态观察器（用于非React环境监听状态变化）
 */
export const demoModeObserver = {
  subscribers: new Set<(enabled: boolean) => void>(),

  subscribe(callback: (enabled: boolean) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  },

  notify(enabled: boolean) {
    this.subscribers.forEach(callback => callback(enabled));
  },
};

// 监听localStorage变化（当store更新时）
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'lumina-demo-mode') {
      const enabled = event.newValue === 'true';
      demoModeObserver.notify(enabled);
    }
  });
}

export default {
  executeWithDemoWrapper,
  generateMockData,
  demoModeObserver,
  getDemoMode,
};