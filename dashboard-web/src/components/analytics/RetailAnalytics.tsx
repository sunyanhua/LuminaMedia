import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ShoppingBag, Clock, TrendingUp, TriangleAlert as AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatNumber, formatCurrency } from '@/lib/formatters';
import { useState, useEffect } from 'react';
import { analyticsService } from '@/services';
import { CustomerSegment, ParkingSpendingData, TrafficTimeSeries } from '@/services/analyticsService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  // Legend,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function RetailAnalytics() {
  const [personas, setPersonas] = useState<CustomerSegment[]>([]);
  const [parkingData, setParkingData] = useState<ParkingSpendingData[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficTimeSeries[]>([]);
  const [loading, setLoading] = useState(true);
  // @ts-ignore
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [chartTheme, setChartTheme] = useState<'amber' | 'blue' | 'green'>('amber');

  const themeColors = {
    amber: { primary: '#f59e0b', secondary: '#3b82f6' },
    blue: { primary: '#3b82f6', secondary: '#10b981' },
    green: { primary: '#10b981', secondary: '#8b5cf6' },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 获取客户分群数据（用户画像）
        const segmentsResponse = await analyticsService.getCustomerSegments('demo');
        setPersonas(segmentsResponse.map(segment => ({
          ...segment,
          // 转换字段以匹配原有UI
          id: segment.id,
          name: segment.segmentName,
          count: segment.memberCount,
          percentage: segment.percentage || Math.round((segment.memberCount / segmentsResponse.reduce((sum, s) => sum + s.memberCount, 0)) * 100),
          avgSpending: 0, // TODO: 需要从API获取客户分群详细信息 GET /api/v1/analytics/customer-segments/{segmentId}/details
          visitFrequency: '每周1-2次', // TODO: 需要从API获取客户分群详细信息
        })));

        // 获取停车时长与消费金额关系数据
        const parkingResponse = await analyticsService.getParkingSpendingData('demo');
        setParkingData(parkingResponse);

        // 获取每日客流趋势数据，使用当前选择的时间范围
        const trafficResponse = await analyticsService.getTrafficTimeSeries('demo', timeRange);
        setTrafficData(trafficResponse);
      } catch (err) {
        console.error('Failed to fetch retail analytics data:', err);
        setError('数据加载失败，请稍后重试');
        // API调用失败，保持空数据状态，UI会显示错误或空状态
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const parkingChartConfig = {
    avgSpending: {
      label: "平均消费",
      color: themeColors[chartTheme].primary,
    },
    userCount: {
      label: "用户数",
      color: themeColors[chartTheme].secondary,
    },
  } as const;

  const trafficChartConfig = {
    value: {
      label: "访客数",
      color: themeColors[chartTheme].primary,
    },
  } as const;


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">零售商场数据分析</h2>
            <p className="text-slate-400">深度洞察顾客行为和消费模式</p>
          </div>
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">
            实时数据
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-slate-900 border-slate-800 p-6 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-slate-800 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-slate-800 rounded w-1/3"></div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="bg-slate-900 border-slate-800 p-6 animate-pulse">
              <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
              <div className="h-48 bg-slate-800 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">零售商场数据分析</h2>
            <p className="text-slate-400">深度洞察顾客行为和消费模式</p>
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
              <button
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg transition-colors"
                onClick={() => window.location.reload()}
              >
                重新加载
              </button>
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
          <h2 className="text-2xl font-bold text-slate-100 mb-2">零售商场数据分析</h2>
          <p className="text-slate-400">深度洞察顾客行为和消费模式</p>
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
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">
            实时数据
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">今日访客总数</p>
                <h3 className="text-2xl font-bold text-slate-100">{formatNumber(8945)}</h3>
                <p className="text-xs text-slate-500 mt-1">TODO: 从API获取 GET /api/v1/analytics/daily-stats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">转化率</p>
                <h3 className="text-2xl font-bold text-slate-100">68.3%</h3>
                <p className="text-xs text-slate-500 mt-1">TODO: 从API获取 GET /api/v1/analytics/daily-stats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">平均停留时长</p>
                <h3 className="text-2xl font-bold text-slate-100">2.4 小时</h3>
                <p className="text-xs text-slate-500 mt-1">TODO: 从API获取 GET /api/v1/analytics/daily-stats</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-100">用户画像聚类</CardTitle>
            <Badge variant="outline" className="border-slate-700 text-slate-400">
              AI智能分群
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personas.map((persona) => (
              <div
                key={persona.id}
                className="p-5 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-slate-200">{persona.segmentName}</h4>
                      {persona.segmentName.includes('流失风险') && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      {persona.segmentName.includes('VIP') && !persona.segmentName.includes('流失风险') && (
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1">用户数</p>
                        <p className="font-semibold text-slate-200">
                          {formatNumber(persona.memberCount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">平均消费</p>
                        <p className="font-semibold text-amber-500">{formatCurrency(0)}</p>
                        <p className="text-xs text-slate-500">TODO: API数据</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">访问频次</p>
                        <p className="font-semibold text-slate-200">{persona.description || '未知'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-slate-200">{persona.percentage}%</p>
                    <p className="text-xs text-slate-500">占比</p>
                  </div>
                </div>
                <Progress value={persona.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">停车时长 vs. 消费金额</CardTitle>
            <p className="text-sm text-slate-400">
              停留时间与消费额呈强相关性
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer config={parkingChartConfig}>
                <BarChart
                  data={parkingData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="duration"
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: '#cbd5e1' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'avgSpending') return [formatCurrency(value), '平均消费'];
                      if (name === 'userCount') return [formatNumber(value), '用户数'];
                      return [value, name];
                    }}
                  />
                  <Bar
                    dataKey="avgSpending"
                    fill={parkingChartConfig.avgSpending.color}
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80 transition-opacity"
                    name="平均消费"
                  />
                  <Bar
                    dataKey="userCount"
                    fill={parkingChartConfig.userCount.color}
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80 transition-opacity"
                    name="用户数"
                  />
                </BarChart>
              </ChartContainer>
            </div>

            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-amber-500 mb-1">关键洞察</h5>
                  <p className="text-sm text-slate-300">
                    停留3小时以上的顾客平均消费高出75%。建议实施长时间停留的忠诚奖励计划。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">每日客流趋势（{timeRange}天）</CardTitle>
            <p className="text-sm text-slate-400">高峰时段和访客趋势</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer config={trafficChartConfig}>
                <LineChart
                  data={trafficData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth()+1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: '#cbd5e1' }}
                    formatter={(value: number) => [formatNumber(value), '访客数']}
                    labelFormatter={(label) => `日期: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={trafficChartConfig.value.color}
                    strokeWidth={2}
                    dot={{ stroke: trafficChartConfig.value.color, strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 6, stroke: trafficChartConfig.value.color, strokeWidth: 2 }}
                    name="访客数"
                  />
                </LineChart>
              </ChartContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500" />
                <span className="text-slate-400">工作日</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-slate-400">周末</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-slate-100 mb-1">
                AI推荐引擎
              </h4>
              <p className="text-slate-400">
                基于当前数据，我们已识别出3个高影响力机会
              </p>
            </div>
            <button className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg transition-colors">
              查看AI建议
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RetailAnalytics;