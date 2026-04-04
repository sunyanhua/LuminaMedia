import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, RefreshCw } from 'lucide-react';

interface QuotaRecord {
  id: string;
  feature: string;
  used: number;
  max: number;
  period: string;
  resetDate: string;
  tenant: string;
}

const QuotaOverview: React.FC = () => {
  const [quotas, setQuotas] = useState<QuotaRecord[]>([]);
  const [filteredQuotas, setFilteredQuotas] = useState<QuotaRecord[]>([]);
  const [filterTenant, setFilterTenant] = useState<string>('all');
  const [filterFeature, setFilterFeature] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 模拟获取配额数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 这里应该调用实际的API
        // const response = await fetch('/api/quotas');
        // const data = await response.json();

        // 模拟数据
        const mockData: QuotaRecord[] = [
          { id: '1', feature: 'AI调用次数', used: 5, max: 5, period: 'daily', resetDate: '2026-04-05 00:00:00', tenant: 'demo-business-001' },
          { id: '2', feature: '内容发布次数', used: 8, max: 10, period: 'daily', resetDate: '2026-04-05 00:00:00', tenant: 'demo-business-001' },
          { id: '3', feature: '数据导入次数', used: 3, max: 3, period: 'daily', resetDate: '2026-04-05 00:00:00', tenant: 'demo-business-001' },
          { id: '4', feature: 'AI调用次数', used: 2, max: 5, period: 'daily', resetDate: '2026-04-05 00:00:00', tenant: 'demo-government-001' },
          { id: '5', feature: '内容发布次数', used: 7, max: 10, period: 'daily', resetDate: '2026-04-05 00:00:00', tenant: 'demo-government-001' },
        ];

        setQuotas(mockData);
        setFilteredQuotas(mockData);
      } catch (error) {
        console.error('获取配额数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 应用过滤器
  useEffect(() => {
    let result = quotas;

    if (filterTenant !== 'all') {
      result = result.filter(q => q.tenant === filterTenant);
    }

    if (filterFeature !== 'all') {
      result = result.filter(q => q.feature === filterFeature);
    }

    setFilteredQuotas(result);
  }, [filterTenant, filterFeature, quotas]);

  const handleResetQuota = async (quotaId: string) => {
    console.log(`重置配额: ${quotaId}`);
    // 这里应该调用实际的API来重置配额
  };

  const COLORS = ['#FFBB28', '#FF8042', '#00C49F', '#0088FE', '#8884D8'];

  // 准备饼图数据
  const pieData = quotas.map(quota => ({
    name: `${quota.feature} (${quota.tenant})`,
    value: (quota.used / quota.max) * 100,
  }));

  // 准备柱状图数据
  const barData = quotas.map(quota => ({
    feature: quota.feature,
    used: quota.used,
    max: quota.max,
    utilization: Math.round((quota.used / quota.max) * 100),
    tenant: quota.tenant,
  }));

  return (
    <div className="space-y-6">
      {/* 顶部摘要卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">AI调用</p>
                <p className="text-2xl font-bold text-amber-400">7/10</p>
              </div>
              <div className="bg-amber-500/20 p-2 rounded-lg">
                <RefreshCw className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">内容发布</p>
                <p className="text-2xl font-bold text-blue-400">15/20</p>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <RefreshCw className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">数据导入</p>
                <p className="text-2xl font-bold text-emerald-400">3/5</p>
              </div>
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <RefreshCw className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">总使用率</p>
                <p className="text-2xl font-bold text-purple-400">75%</p>
              </div>
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <BarChart className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 过滤器和操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-3">
          <Select value={filterTenant} onValueChange={setFilterTenant}>
            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-slate-200">
              <SelectValue placeholder="选择租户" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800">
              <SelectItem value="all">所有租户</SelectItem>
              <SelectItem value="demo-business-001">商务版演示</SelectItem>
              <SelectItem value="demo-government-001">政务版演示</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterFeature} onValueChange={setFilterFeature}>
            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-slate-200">
              <SelectValue placeholder="选择功能" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800">
              <SelectItem value="all">所有功能</SelectItem>
              <SelectItem value="AI调用次数">AI调用次数</SelectItem>
              <SelectItem value="内容发布次数">内容发布次数</SelectItem>
              <SelectItem value="数据导入次数">数据导入次数</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <Download className="w-4 h-4 mr-2" />
            导出报表
          </Button>
          <Button className="bg-amber-600 hover:bg-amber-700 text-slate-950">
            <Calendar className="w-4 h-4 mr-2" />
            时间范围
          </Button>
        </div>
      </div>

      {/* 图表部分 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 配额使用率柱状图 */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">配额使用率</CardTitle>
            <CardDescription className="text-slate-500">各功能配额使用情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="feature" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#374151', color: '#F1F5F9' }}
                    formatter={(value, name) => [`${value}%`, name === 'utilization' ? '使用率' : name]}
                  />
                  <Legend />
                  <Bar dataKey="utilization" name="使用率" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 配额分布饼图 */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">配额分布</CardTitle>
            <CardDescription className="text-slate-500">各租户配额使用分布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#374151', color: '#F1F5F9' }}
                    formatter={(value) => [`${value}%`, '使用率']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 配额详情表格 */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">配额详情</CardTitle>
          <CardDescription className="text-slate-500">详细配额使用记录</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-300">功能</TableHead>
                  <TableHead className="text-slate-300">租户</TableHead>
                  <TableHead className="text-slate-300">已使用/上限</TableHead>
                  <TableHead className="text-slate-300">使用率</TableHead>
                  <TableHead className="text-slate-300">周期</TableHead>
                  <TableHead className="text-slate-300">重置时间</TableHead>
                  <TableHead className="text-slate-300">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotas.map((quota) => (
                  <TableRow key={quota.id} className="border-slate-800 hover:bg-slate-800/30">
                    <TableCell className="font-medium text-slate-200">{quota.feature}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                        {quota.tenant}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{quota.used}/{quota.max}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              quota.used / quota.max > 0.9 ? 'bg-red-500' :
                              quota.used / quota.max > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${(quota.used / quota.max) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-300 text-sm">{Math.round((quota.used / quota.max) * 100)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{quota.period}</TableCell>
                    <TableCell className="text-slate-300">{quota.resetDate}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetQuota(quota.id)}
                        disabled={loading}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        重置
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotaOverview;