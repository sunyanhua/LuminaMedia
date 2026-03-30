import { Users, TrendingUp, DollarSign, Activity, TriangleAlert as AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StatsCard } from './StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardService } from '@/services';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  avgSessionTime: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalStrategies: number;
  customerProfiles: number;
}

interface ContentPerformance {
  platform: string;
  posts: number;
  reach: number;
  engagement: number;
  trend: 'up' | 'down' | 'stable';
}

interface TimeSeriesData {
  date: string;
  value: number;
}

function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  // @ts-ignore
  const [contentPerformance, setContentPerformance] = useState<ContentPerformance[]>([]);
  const [revenueData, setRevenueData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [chartTheme, setChartTheme] = useState<'amber' | 'blue' | 'green'>('amber');

  const themeColors = {
    amber: { primary: '#f59e0b' },
    blue: { primary: '#3b82f6' },
    green: { primary: '#10b981' },
  };

  // 模拟图表数据（演示模式fallback）
  const generateMockChartData = (days: number): TimeSeriesData[] => {
    const data: TimeSeriesData[] = [];
    const baseDate = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

      // 模拟数据：工作日活跃度较高，周末稍低
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseValue = isWeekend ? 800 : 1200;
      const randomVariation = Math.floor(Math.random() * 400) - 200;
      const value = Math.max(100, baseValue + randomVariation);

      data.push({
        date: dateStr,
        value,
      });
    }

    return data;
  };

  // 模拟统计数据（演示模式fallback）
  const generateMockStats = (): DashboardStats => {
    const baseUsers = 5000;
    const baseCampaigns = 120;
    return {
      totalUsers: baseUsers + Math.floor(Math.random() * 1000),
      activeUsers: Math.floor(baseUsers * 0.6) + Math.floor(Math.random() * 500),
      totalRevenue: 0,
      avgSessionTime: 0,
      totalCampaigns: baseCampaigns + Math.floor(Math.random() * 30),
      activeCampaigns: Math.floor(baseCampaigns * 0.7) + Math.floor(Math.random() * 20),
      totalStrategies: 85 + Math.floor(Math.random() * 20),
      customerProfiles: 3200 + Math.floor(Math.random() * 500),
    };
  };

  // 模拟内容表现数据（演示模式fallback，等待后端API实现）
  const generateMockContentPerformance = (): ContentPerformance[] => {
    const platforms = [
      { platform: '小红书', trend: 'up' as const },
      { platform: '微信公众号', trend: 'stable' as const },
      { platform: '抖音', trend: 'up' as const },
      { platform: 'Bilibili', trend: 'down' as const },
    ];
    return platforms.map(p => ({
      platform: p.platform,
      posts: Math.floor(Math.random() * 50) + 20,
      reach: Math.floor(Math.random() * 50000) + 10000,
      engagement: Math.floor(Math.random() * 15) + 5,
      trend: p.trend,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // 获取仪表板统计数据
        const statsResponse = await dashboardService.getDashboardStats();
        setStats(statsResponse);

        // 获取用户活跃度图表数据（用于替换营收趋势图表），使用当前选择的时间范围
        const activityResponse = await dashboardService.getUserActivityChart(timeRange);
        // 转换数据格式以匹配TimeSeriesData
        if (activityResponse.labels && activityResponse.datasets?.[0]?.data) {
          const transformedData = activityResponse.labels.map((label, index) => ({
            date: label,
            value: activityResponse.datasets[0].data[index] || 0,
          }));
          setRevenueData(transformedData);
        } else {
          // 如果API返回数据不完整，使用模拟数据
          console.warn('API返回的图表数据不完整，使用模拟数据作为fallback');
          const mockData = generateMockChartData(timeRange);
          setRevenueData(mockData);
        }

        // 内容表现数据使用模拟数据作为fallback，等待后端API支持
        setContentPerformance(generateMockContentPerformance());
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        const errorMsg = error instanceof Error ? error.message : '数据加载失败，请稍后重试';
        setError(`API连接失败: ${errorMsg}`);
        // API调用失败，检查是否为演示模式，演示模式下使用模拟数据作为fallback
        const isDemoMode = localStorage.getItem('lumina-demo-mode') === 'true';
        if (isDemoMode) {
          console.log('[DEMO] 演示模式下使用模拟数据作为fallback');
          const mockData = generateMockChartData(timeRange);
          setRevenueData(mockData);
          setStats(generateMockStats());
          setContentPerformance(generateMockContentPerformance());
        } else {
          // 生产模式API失败，保持空状态，显示错误信息
          setRevenueData([]);
          setStats(null);
          setContentPerformance([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const chartConfig = {
    value: {
      label: "活跃用户",
      color: themeColors[chartTheme].primary,
    },
  } as const;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">仪表盘</h2>
          <p className="text-slate-400">实时洞察和性能指标</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-slate-900 border-slate-800 p-6 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-slate-800 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-slate-800 rounded w-1/3"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">仪表盘</h2>
            <p className="text-slate-400">实时洞察和性能指标</p>
          </div>
          <Badge className="bg-red-500/10 text-red-500 border-red-500/30">
            数据加载失败
          </Badge>
        </div>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <h3 className="text-xl font-semibold text-slate-100">数据加载失败</h3>
              <p className="text-slate-400">{error}</p>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg transition-colors"
                  onClick={() => window.location.reload()}
                >
                  重新加载
                </button>
                <button
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-lg transition-colors border border-slate-600"
                  onClick={() => {
                    // 切换到演示模式并重试
                    localStorage.setItem('lumina-demo-mode', 'true');
                    window.location.reload();
                  }}
                >
                  切换到演示模式
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">仪表盘</h2>
          <p className="text-slate-400">实时洞察和性能指标</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="time-range" className="text-sm text-slate-400">时间范围</Label>
            <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
              <SelectTrigger className="w-24 bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue placeholder="选择天数" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">最近7天</SelectItem>
                <SelectItem value="30">最近30天</SelectItem>
                <SelectItem value="90">最近90天</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="chart-theme" className="text-sm text-slate-400">主题</Label>
            <Select value={chartTheme} onValueChange={(value) => setChartTheme(value as 'amber' | 'blue' | 'green')}>
              <SelectTrigger className="w-24 bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue placeholder="选择主题" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amber">琥珀色</SelectItem>
                <SelectItem value="blue">蓝色</SelectItem>
                <SelectItem value="green">绿色</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="活跃用户"
          value={formatNumber(stats?.activeUsers || 0)}
          change="12.5%"
          trend="up"
          icon={Users}
          iconColor="bg-blue-500/10 text-blue-500"
        />
        <StatsCard
          title="总用户"
          value={formatNumber(stats?.totalUsers || 0)}
          change="8.3%"
          trend="up"
          icon={TrendingUp}
          iconColor="bg-green-500/10 text-green-500"
        />
        <StatsCard
          title="营销活动"
          value={formatNumber(stats?.totalCampaigns || 0)}
          change="23.5%"
          trend="up"
          icon={DollarSign}
          iconColor="bg-amber-500/10 text-amber-500"
        />
        <StatsCard
          title="策略数量"
          value={formatNumber(stats?.totalStrategies || 0)}
          change="2.1%"
          trend="up"
          icon={Activity}
          iconColor="bg-purple-500/10 text-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">各平台内容表现</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contentPerformance.map((platform) => (
                <div
                  key={platform.platform}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-200">{platform.platform}</h4>
                      <Badge
                        variant="outline"
                        className={
                          platform.trend === 'up'
                            ? 'border-green-500/30 text-green-500'
                            : platform.trend === 'down'
                            ? 'border-red-500/30 text-red-500'
                            : 'border-slate-500/30 text-slate-400'
                        }
                      >
                        {platform.trend === 'up' ? '↑' : platform.trend === 'down' ? '↓' : '→'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{platform.posts} 条内容</span>
                      <span>•</span>
                      <span>{formatNumber(platform.reach)} 触达</span>
                      <span>•</span>
                      <span className="text-amber-500">{platform.engagement}% 互动率</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">用户活跃度趋势（{timeRange}天）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer config={chartConfig}>
                <BarChart
                  data={revenueData.slice(-15)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) => {
                      // 简化日期显示
                      if (typeof value === 'string') {
                        return value.split('/')[1] + '/' + value.split('/')[0];
                      }
                      return value;
                    }}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: '#cbd5e1' }}
                    formatter={(value: number) => [formatNumber(value), '活跃用户']}
                  />
                  <Bar
                    dataKey="value"
                    fill={chartConfig.value.color}
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              </ChartContainer>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>15天前</span>
              <span>今天</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-amber-500/50 transition-all text-left">
              <h4 className="font-semibold text-slate-200 mb-1">创建AI营销活动</h4>
              <p className="text-sm text-slate-400">使用AI生成内容策略</p>
            </button>
            <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-amber-500/50 transition-all text-left">
              <h4 className="font-semibold text-slate-200 mb-1">定时发布</h4>
              <p className="text-sm text-slate-400">跨平台内容排期</p>
            </button>
            <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-amber-500/50 transition-all text-left">
              <h4 className="font-semibold text-slate-200 mb-1">查看报告</h4>
              <p className="text-sm text-slate-400">深入分析数据</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardOverview;