import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Plus, Edit, Trash2, RefreshCw, Save, X } from 'lucide-react';

interface QuotaConfig {
  id: string;
  tenantId: string;
  featureKey: string;
  featureName: string;
  maxCount: number;
  quotaPeriod: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}

const QuotaConfig: React.FC = () => {
  const [quotas, setQuotas] = useState<QuotaConfig[]>([]);
  const [filteredQuotas, setFilteredQuotas] = useState<QuotaConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTenant, setFilterTenant] = useState<string>('all');
  const [filterFeature, setFilterFeature] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [editingQuota, setEditingQuota] = useState<QuotaConfig | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [quotaToDelete, setQuotaToDelete] = useState<string | null>(null);
  const [newQuota, setNewQuota] = useState<Omit<QuotaConfig, 'id' | 'createdAt' | 'updatedAt'> | null>(null);

  // 模拟获取配额配置数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 这里应该调用实际的API
        // const response = await fetch('/api/quotas');
        // const data = await response.json();

        // 模拟数据
        const mockData: QuotaConfig[] = [
          {
            id: '1',
            tenantId: 'demo-business-001',
            featureKey: 'customer-analytics',
            featureName: '客户数据分析',
            maxCount: 5,
            quotaPeriod: 'daily',
            createdAt: '2026-03-20',
            updatedAt: '2026-04-01',
          },
          {
            id: '2',
            tenantId: 'demo-business-001',
            featureKey: 'ai-strategy',
            featureName: 'AI智策工厂',
            maxCount: 5,
            quotaPeriod: 'daily',
            createdAt: '2026-03-21',
            updatedAt: '2026-04-01',
          },
          {
            id: '3',
            tenantId: 'demo-business-001',
            featureKey: 'matrix-publish',
            featureName: '矩阵分发中心',
            maxCount: 10,
            quotaPeriod: 'daily',
            createdAt: '2026-03-22',
            updatedAt: '2026-04-01',
          },
          {
            id: '4',
            tenantId: 'demo-government-001',
            featureKey: 'government-publish',
            featureName: '政府内容发布',
            maxCount: 10,
            quotaPeriod: 'daily',
            createdAt: '2026-03-25',
            updatedAt: '2026-04-01',
          },
          {
            id: '5',
            tenantId: 'demo-government-001',
            featureKey: 'sentiment-analysis',
            featureName: '舆情监测',
            maxCount: 5,
            quotaPeriod: 'daily',
            createdAt: '2026-03-26',
            updatedAt: '2026-04-01',
          },
        ];

        setQuotas(mockData);
        setFilteredQuotas(mockData);
      } catch (error) {
        console.error('获取配额配置数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 应用过滤器
  useEffect(() => {
    let result = quotas;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(q =>
        q.featureKey.toLowerCase().includes(term) ||
        q.featureName.toLowerCase().includes(term) ||
        q.tenantId.toLowerCase().includes(term)
      );
    }

    if (filterTenant !== 'all') {
      result = result.filter(q => q.tenantId === filterTenant);
    }

    if (filterFeature !== 'all') {
      result = result.filter(q => q.featureKey === filterFeature);
    }

    setFilteredQuotas(result);
  }, [searchTerm, filterTenant, filterFeature, quotas]);

  const handleEditQuota = (quota: QuotaConfig) => {
    setEditingQuota(quota);
  };

  const handleDeleteQuota = (quotaId: string) => {
    setQuotaToDelete(quotaId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteQuota = () => {
    if (quotaToDelete) {
      // 这里应该调用实际的API来删除配额配置
      // await fetch(`/api/quotas/${current_tenant}/${featureKey}`, { method: 'DELETE' });

      setQuotas(prev => prev.filter(q => q.id !== quotaToDelete));
      setFilteredQuotas(prev => prev.filter(q => q.id !== quotaToDelete));
      setShowDeleteDialog(false);
      setQuotaToDelete(null);
    }
  };

  const closeEditDialog = () => {
    setEditingQuota(null);
  };

  const handleSaveQuota = async () => {
    if (!editingQuota) return;

    try {
      // 这里应该调用实际的API来更新配额配置
      // const response = await fetch(`/api/quotas/${editingQuota.tenantId}/${editingQuota.featureKey}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     maxCount: editingQuota.maxCount,
      //     quotaPeriod: editingQuota.quotaPeriod,
      //   }),
      // });

      // 更新本地状态
      setQuotas(prev => prev.map(q => q.id === editingQuota.id ? editingQuota : q));
      setFilteredQuotas(prev => prev.map(q => q.id === editingQuota.id ? editingQuota : q));
      setEditingQuota(null);
    } catch (error) {
      console.error('保存配额配置失败:', error);
    }
  };

  const handleAddQuota = () => {
    setNewQuota({
      tenantId: '',
      featureKey: '',
      featureName: '',
      maxCount: 5,
      quotaPeriod: 'daily',
    });
  };

  const closeNewQuotaDialog = () => {
    setNewQuota(null);
  };

  const handleSaveNewQuota = async () => {
    if (!newQuota) return;

    try {
      // 这里应该调用实际的API来创建配额配置
      // const response = await fetch('/api/quotas', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newQuota),
      // });

      // 创建新配额并添加到列表
      const newQuotaWithId: QuotaConfig = {
        ...newQuota,
        id: `quota-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setQuotas(prev => [...prev, newQuotaWithId]);
      setFilteredQuotas(prev => [...prev, newQuotaWithId]);
      setNewQuota(null);
    } catch (error) {
      console.error('添加配额配置失败:', error);
    }
  };

  const periodLabels = {
    'daily': '每日',
    'weekly': '每周',
    'monthly': '每月'
  };

  return (
    <div className="space-y-6">
      {/* 顶部操作区 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">配额配置管理</h1>
          <p className="text-slate-400">管理各租户各项功能的配额限制</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-slate-950 flex items-center gap-2"
            onClick={handleAddQuota}
          >
            <Plus className="w-4 h-4" />
            添加配额配置
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
                placeholder="搜索租户或功能..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
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

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">功能</label>
              <Select value={filterFeature} onValueChange={setFilterFeature}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="选择功能" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="customer-analytics">客户数据分析</SelectItem>
                  <SelectItem value="ai-strategy">AI智策工厂</SelectItem>
                  <SelectItem value="matrix-publish">矩阵分发中心</SelectItem>
                  <SelectItem value="government-publish">政府内容发布</SelectItem>
                  <SelectItem value="sentiment-analysis">舆情监测</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => {
                  setSearchTerm('');
                  setFilterTenant('all');
                  setFilterFeature('all');
                }}
              >
                重置筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 配额列表表格 */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">配额配置列表</CardTitle>
          <CardDescription className="text-slate-500">
            共 {filteredQuotas.length} 个配额配置
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
                  <TableHead className="text-slate-300">租户ID</TableHead>
                  <TableHead className="text-slate-300">功能键</TableHead>
                  <TableHead className="text-slate-300">功能名称</TableHead>
                  <TableHead className="text-slate-300">最大次数</TableHead>
                  <TableHead className="text-slate-300">周期</TableHead>
                  <TableHead className="text-slate-300">创建时间</TableHead>
                  <TableHead className="text-slate-300">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotas.map((quota) => (
                  <TableRow key={quota.id} className="border-slate-800 hover:bg-slate-800/30">
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                        {quota.tenantId}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-slate-300">{quota.featureKey}</TableCell>
                    <TableCell className="font-medium text-slate-200">{quota.featureName}</TableCell>
                    <TableCell className="text-slate-300">{quota.maxCount}</TableCell>
                    <TableCell className="text-slate-300">{periodLabels[quota.quotaPeriod]}</TableCell>
                    <TableCell className="text-slate-400 text-sm">{new Date(quota.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuota(quota)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuota(quota.id)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">确认删除配额配置？</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              此操作将永久删除该配额配置，且无法恢复。请谨慎操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteQuota}
              className="bg-red-600 hover:bg-red-700 text-slate-50"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 编辑配额对话框 */}
      {editingQuota && (
        <Dialog open={!!editingQuota} onOpenChange={closeEditDialog}>
          <DialogContent className="bg-slate-900 border-slate-800 sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle className="text-slate-100">编辑配额配置</DialogTitle>
              <DialogDescription className="text-slate-400">
                修改配额的基本信息和限制
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-slate-300">
                  租户ID
                </label>
                <Input
                  value={editingQuota.tenantId}
                  readOnly
                  className="col-span-3 bg-slate-800 border-slate-700 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-slate-300">
                  功能键
                </label>
                <Input
                  value={editingQuota.featureKey}
                  readOnly
                  className="col-span-3 bg-slate-800 border-slate-700 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-slate-300">
                  功能名称
                </label>
                <Input
                  value={editingQuota.featureName}
                  readOnly
                  className="col-span-3 bg-slate-800 border-slate-700 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="maxCount" className="text-right text-slate-300">
                  最大次数
                </label>
                <Input
                  id="maxCount"
                  type="number"
                  value={editingQuota.maxCount}
                  onChange={(e) => setEditingQuota({...editingQuota, maxCount: parseInt(e.target.value) || 0})}
                  className="col-span-3 bg-slate-800 border-slate-700 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-slate-300">
                  周期
                </label>
                <Select
                  value={editingQuota.quotaPeriod}
                  onValueChange={(value) => setEditingQuota({...editingQuota, quotaPeriod: value as any})}
                >
                  <SelectTrigger className="col-span-3 bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="daily">每日</SelectItem>
                    <SelectItem value="weekly">每周</SelectItem>
                    <SelectItem value="monthly">每月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeEditDialog}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                取消
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-slate-950 flex items-center gap-2"
                onClick={handleSaveQuota}
              >
                <Save className="w-4 h-4" />
                保存更改
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 新增配额对话框 */}
      {newQuota && (
        <Dialog open={!!newQuota} onOpenChange={closeNewQuotaDialog}>
          <DialogContent className="bg-slate-900 border-slate-800 sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle className="text-slate-100">添加配额配置</DialogTitle>
              <DialogDescription className="text-slate-400">
                创建新的配额配置
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="newTenantId" className="text-right text-slate-300">
                  租户ID
                </label>
                <Input
                  id="newTenantId"
                  value={newQuota.tenantId}
                  onChange={(e) => setNewQuota({...newQuota, tenantId: e.target.value})}
                  className="col-span-3 bg-slate-800 border-slate-700 text-slate-200"
                  placeholder="请输入租户ID"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="newFeatureKey" className="text-right text-slate-300">
                  功能键
                </label>
                <Input
                  id="newFeatureKey"
                  value={newQuota.featureKey}
                  onChange={(e) => setNewQuota({...newQuota, featureKey: e.target.value})}
                  className="col-span-3 bg-slate-800 border-slate-700 text-slate-200"
                  placeholder="请输入功能键"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="newFeatureName" className="text-right text-slate-300">
                  功能名称
                </label>
                <Input
                  id="newFeatureName"
                  value={newQuota.featureName}
                  onChange={(e) => setNewQuota({...newQuota, featureName: e.target.value})}
                  className="col-span-3 bg-slate-800 border-slate-700 text-slate-200"
                  placeholder="请输入功能名称"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="newMaxCount" className="text-right text-slate-300">
                  最大次数
                </label>
                <Input
                  id="newMaxCount"
                  type="number"
                  value={newQuota.maxCount}
                  onChange={(e) => setNewQuota({...newQuota, maxCount: parseInt(e.target.value) || 0})}
                  className="col-span-3 bg-slate-800 border-slate-700 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-slate-300">
                  周期
                </label>
                <Select
                  value={newQuota.quotaPeriod}
                  onValueChange={(value) => setNewQuota({...newQuota, quotaPeriod: value as any})}
                >
                  <SelectTrigger className="col-span-3 bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="daily">每日</SelectItem>
                    <SelectItem value="weekly">每周</SelectItem>
                    <SelectItem value="monthly">每月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeNewQuotaDialog}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                取消
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-slate-950 flex items-center gap-2"
                onClick={handleSaveNewQuota}
              >
                <Plus className="w-4 h-4" />
                添加配额
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default QuotaConfig;