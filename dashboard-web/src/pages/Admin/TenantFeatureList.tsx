import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface TenantFeature {
  id: string;
  tenantId: string;
  featureKey: string;
  featureName: string;
  isEnabled: boolean;
  quotaUsed: number;
  quotaMax: number;
  lastAccessed: string;
}

const TenantFeatureList: React.FC = () => {
  const [features, setFeatures] = useState<TenantFeature[]>([]);
  const [filteredFeatures, setFilteredFeatures] = useState<TenantFeature[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnabled, setFilterEnabled] = useState<string>('all');
  const [filterTenant, setFilterTenant] = useState<string>('all');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 模拟获取租户功能数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 这里应该调用实际的API
        // const response = await fetch('/api/tenant-features?tenantId=all');
        // const data = await response.json();

        // 模拟数据
        const mockData: TenantFeature[] = [
          {
            id: '1',
            tenantId: 'demo-business-001',
            featureKey: 'customer-analytics',
            featureName: '客户数据分析',
            isEnabled: true,
            quotaUsed: 5,
            quotaMax: 5,
            lastAccessed: '2026-04-04 10:30:00',
          },
          {
            id: '2',
            tenantId: 'demo-business-001',
            featureKey: 'ai-strategy',
            featureName: 'AI智策工厂',
            isEnabled: true,
            quotaUsed: 3,
            quotaMax: 5,
            lastAccessed: '2026-04-04 09:15:00',
          },
          {
            id: '3',
            tenantId: 'demo-business-001',
            featureKey: 'matrix-publish',
            featureName: '矩阵分发中心',
            isEnabled: true,
            quotaUsed: 7,
            quotaMax: 10,
            lastAccessed: '2026-04-04 08:45:00',
          },
          {
            id: '4',
            tenantId: 'demo-government-001',
            featureKey: 'government-publish',
            featureName: '政府内容发布',
            isEnabled: true,
            quotaUsed: 2,
            quotaMax: 10,
            lastAccessed: '2026-04-04 11:20:00',
          },
          {
            id: '5',
            tenantId: 'demo-government-001',
            featureKey: 'sentiment-analysis',
            featureName: '舆情监测',
            isEnabled: false,
            quotaUsed: 0,
            quotaMax: 5,
            lastAccessed: '2026-04-01 14:30:00',
          },
          {
            id: '6',
            tenantId: 'demo-government-001',
            featureKey: 'geo-analysis',
            featureName: 'GEO分析',
            isEnabled: false,
            quotaUsed: 0,
            quotaMax: 3,
            lastAccessed: '2026-04-01 14:30:00',
          },
        ];

        setFeatures(mockData);
        setFilteredFeatures(mockData);
      } catch (error) {
        console.error('获取租户功能数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 应用过滤器
  useEffect(() => {
    let result = features;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(f =>
        f.featureKey.toLowerCase().includes(term) ||
        f.featureName.toLowerCase().includes(term) ||
        f.tenantId.toLowerCase().includes(term)
      );
    }

    if (filterEnabled !== 'all') {
      result = result.filter(f =>
        filterEnabled === 'true' ? f.isEnabled : !f.isEnabled
      );
    }

    if (filterTenant !== 'all') {
      result = result.filter(f => f.tenantId === filterTenant);
    }

    setFilteredFeatures(result);

    // 更新全选状态
    const allSelected = result.every(f => selectedFeatures.includes(f.id));
    setSelectAll(allSelected && result.length > 0);
  }, [searchTerm, filterEnabled, filterTenant, features, selectedFeatures]);

  const handleToggleFeature = async (featureId: string, currentStatus: boolean) => {
    try {
      // 这里应该调用实际的API来更新功能状态
      // const feature = features.find(f => f.id === featureId);
      // if (!feature) return;
      //
      // const endpoint = currentStatus
      //   ? `/api/tenant-features/${feature.featureKey}/disable`
      //   : `/api/tenant-features/${feature.featureKey}/enable`;
      //
      // const response = await fetch(endpoint, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ tenantId: feature.tenantId }),
      // });

      // 更新本地状态
      setFeatures(prev => prev.map(f =>
        f.id === featureId ? { ...f, isEnabled: !currentStatus } : f
      ));
    } catch (error) {
      console.error('更新功能状态失败:', error);
    }
  };

  const handleSelectFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFeatures([]);
    } else {
      setSelectedFeatures(filteredFeatures.map(f => f.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBatchEnable = async () => {
    if (selectedFeatures.length === 0) return;

    try {
      // 这里应该调用实际的API来批量启用功能
      // const response = await fetch('/api/tenant-features/batch-enable', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     tenantId: 'current_tenant', // 实际应用中需要确定租户
      //     featureKeys: selectedFeatures.map(id => features.find(f => f.id === id)?.featureKey).filter(Boolean),
      //   }),
      // });

      // 更新本地状态
      setFeatures(prev =>
        prev.map(f =>
          selectedFeatures.includes(f.id) ? { ...f, isEnabled: true } : f
        )
      );

      setSelectedFeatures([]);
    } catch (error) {
      console.error('批量启用功能失败:', error);
    }
  };

  const handleBatchDisable = async () => {
    if (selectedFeatures.length === 0) return;

    try {
      // 这里应该调用实际的API来批量禁用功能
      // const response = await fetch('/api/tenant-features/batch-disable', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     tenantId: 'current_tenant', // 实际应用中需要确定租户
      //     featureKeys: selectedFeatures.map(id => features.find(f => f.id === id)?.featureKey).filter(Boolean),
      //   }),
      // });

      // 更新本地状态
      setFeatures(prev =>
        prev.map(f =>
          selectedFeatures.includes(f.id) ? { ...f, isEnabled: false } : f
        )
      );

      setSelectedFeatures([]);
    } catch (error) {
      console.error('批量禁用功能失败:', error);
    }
  };

  // 计算配额使用率
  const getQuotaPercentage = (used: number, max: number) => {
    return max > 0 ? Math.round((used / max) * 100) : 0;
  };

  const getQuotaColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6">
      {/* 顶部操作区 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">租户功能管理</h1>
          <p className="text-slate-400">管理各租户的功能启用状态和权限</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleBatchEnable}
            disabled={selectedFeatures.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-slate-50 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            批量启用 ({selectedFeatures.length})
          </Button>
          <Button
            onClick={handleBatchDisable}
            disabled={selectedFeatures.length === 0}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            批量禁用 ({selectedFeatures.length})
          </Button>
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </Button>
        </div>
      </div>

      {/* 过滤器 */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">搜索</label>
              <Input
                placeholder="搜索功能或租户..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">状态</label>
              <Select value={filterEnabled} onValueChange={setFilterEnabled}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="true">启用</SelectItem>
                  <SelectItem value="false">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">租户</label>
              <Select value={filterTenant} onValueChange={setFilterTenant}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="选择租户" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="demo-business-001">商务版演示</SelectItem>
                  <SelectItem value="demo-government-001">政务版演示</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => {
                  setSearchTerm('');
                  setFilterEnabled('all');
                  setFilterTenant('all');
                  setSelectedFeatures([]);
                  setSelectAll(false);
                }}
              >
                重置筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 功能列表表格 */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">租户功能列表</CardTitle>
          <CardDescription className="text-slate-500">
            共 {filteredFeatures.length} 个功能配置
          </CardDescription>
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
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                      className="text-slate-300 border-slate-600 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                    />
                  </TableHead>
                  <TableHead className="text-slate-300">租户</TableHead>
                  <TableHead className="text-slate-300">功能键</TableHead>
                  <TableHead className="text-slate-300">功能名称</TableHead>
                  <TableHead className="text-slate-300">配额使用</TableHead>
                  <TableHead className="text-slate-300">最后访问</TableHead>
                  <TableHead className="text-slate-300">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeatures.map((feature) => (
                  <TableRow key={feature.id} className="border-slate-800 hover:bg-slate-800/30">
                    <TableCell>
                      <Checkbox
                        checked={selectedFeatures.includes(feature.id)}
                        onCheckedChange={() => handleSelectFeature(feature.id)}
                        className="text-slate-300 border-slate-600 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                        {feature.tenantId}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-slate-300">{feature.featureKey}</TableCell>
                    <TableCell className="font-medium text-slate-200">{feature.featureName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getQuotaColor(getQuotaPercentage(feature.quotaUsed, feature.quotaMax))}`}
                            style={{ width: `${getQuotaPercentage(feature.quotaUsed, feature.quotaMax)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400">{feature.quotaUsed}/{feature.quotaMax}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">{feature.lastAccessed}</TableCell>
                    <TableCell>
                      <Switch
                        checked={feature.isEnabled}
                        onCheckedChange={() => handleToggleFeature(feature.id, feature.isEnabled)}
                        className={feature.isEnabled ? "data-[state=checked]:bg-emerald-600" : "data-[state=checked]:bg-slate-600"}
                      />
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

export default TenantFeatureList;