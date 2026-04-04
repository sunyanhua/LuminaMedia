import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';

interface FeatureConfig {
  id: string;
  featureKey: string;
  featureName: string;
  description: string;
  isEnabled: boolean;
  tenantType: 'all' | 'business' | 'government';
  createdAt: string;
  updatedAt: string;
}

const FeatureConfigList: React.FC = () => {
  const [features, setFeatures] = useState<FeatureConfig[]>([]);
  const [filteredFeatures, setFilteredFeatures] = useState<FeatureConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnabled, setFilterEnabled] = useState<string>('all');
  const [filterTenantType, setFilterTenantType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [editingFeature, setEditingFeature] = useState<FeatureConfig | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<string | null>(null);

  // 模拟获取功能配置数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 这里应该调用实际的API
        // const response = await fetch('/api/features?page=1&pageSize=100');
        // const data = await response.json();

        // 模拟数据
        const mockData: FeatureConfig[] = [
          {
            id: '1',
            featureKey: 'customer-analytics',
            featureName: '客户数据分析',
            description: '客户画像分析和行为洞察功能',
            isEnabled: true,
            tenantType: 'business',
            createdAt: '2026-03-20',
            updatedAt: '2026-04-01',
          },
          {
            id: '2',
            featureKey: 'ai-strategy',
            featureName: 'AI智策工厂',
            description: 'AI驱动的营销策略生成功能',
            isEnabled: true,
            tenantType: 'all',
            createdAt: '2026-03-21',
            updatedAt: '2026-04-01',
          },
          {
            id: '3',
            featureKey: 'matrix-publish',
            featureName: '矩阵分发中心',
            description: '多平台内容发布功能',
            isEnabled: true,
            tenantType: 'all',
            createdAt: '2026-03-22',
            updatedAt: '2026-04-01',
          },
          {
            id: '4',
            featureKey: 'government-publish',
            featureName: '政府内容发布',
            description: '面向政府用户的公文发布功能',
            isEnabled: true,
            tenantType: 'government',
            createdAt: '2026-03-25',
            updatedAt: '2026-04-01',
          },
          {
            id: '5',
            featureKey: 'sentiment-analysis',
            featureName: '舆情监测',
            description: '情感分析和舆情监控功能',
            isEnabled: false,
            tenantType: 'government',
            createdAt: '2026-03-26',
            updatedAt: '2026-04-01',
          },
          {
            id: '6',
            featureKey: 'geo-analysis',
            featureName: 'GEO分析',
            description: '地理分析功能',
            isEnabled: false,
            tenantType: 'government',
            createdAt: '2026-03-27',
            updatedAt: '2026-04-01',
          },
        ];

        setFeatures(mockData);
        setFilteredFeatures(mockData);
      } catch (error) {
        console.error('获取功能配置数据失败:', error);
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
        f.description.toLowerCase().includes(term)
      );
    }

    if (filterEnabled !== 'all') {
      result = result.filter(f =>
        filterEnabled === 'true' ? f.isEnabled : !f.isEnabled
      );
    }

    if (filterTenantType !== 'all') {
      result = result.filter(f => f.tenantType === filterTenantType);
    }

    setFilteredFeatures(result);
  }, [searchTerm, filterEnabled, filterTenantType, features]);

  const handleToggleFeature = async (featureId: string, currentStatus: boolean) => {
    try {
      // 这里应该调用实际的API来更新功能状态
      // const response = await fetch(`/api/features/${featureId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ isEnabled: !currentStatus }),
      // });

      // 更新本地状态
      setFeatures(prev => prev.map(f =>
        f.id === featureId ? { ...f, isEnabled: !currentStatus } : f
      ));
    } catch (error) {
      console.error('更新功能状态失败:', error);
    }
  };

  const handleEditFeature = (feature: FeatureConfig) => {
    setEditingFeature(feature);
  };

  const handleDeleteFeature = (featureId: string) => {
    setFeatureToDelete(featureId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteFeature = () => {
    if (featureToDelete) {
      // 这里应该调用实际的API来删除功能
      // await fetch(`/api/features/${featureToDelete}`, { method: 'DELETE' });

      setFeatures(prev => prev.filter(f => f.id !== featureToDelete));
      setFilteredFeatures(prev => prev.filter(f => f.id !== featureToDelete));
      setShowDeleteDialog(false);
      setFeatureToDelete(null);
    }
  };

  const closeEditDialog = () => {
    setEditingFeature(null);
  };

  const tenantTypeLabels = {
    'all': '全部',
    'business': '商务版',
    'government': '政务版'
  };

  return (
    <div className="space-y-6">
      {/* 顶部操作区 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">功能配置管理</h1>
          <p className="text-slate-400">管理平台各项功能的启用状态和租户权限</p>
        </div>

        <div className="flex gap-3">
          <Button className="bg-amber-600 hover:bg-amber-700 text-slate-950 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加功能
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
                placeholder="搜索功能名称或描述..."
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
              <label className="block text-sm font-medium text-slate-300 mb-2">租户类型</label>
              <Select value={filterTenantType} onValueChange={setFilterTenantType}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="选择租户类型" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="business">商务版</SelectItem>
                  <SelectItem value="government">政务版</SelectItem>
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
                  setFilterTenantType('all');
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
          <CardTitle className="text-slate-200">功能列表</CardTitle>
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
                  <TableHead className="text-slate-300">功能键</TableHead>
                  <TableHead className="text-slate-300">功能名称</TableHead>
                  <TableHead className="text-slate-300">描述</TableHead>
                  <TableHead className="text-slate-300">租户类型</TableHead>
                  <TableHead className="text-slate-300">状态</TableHead>
                  <TableHead className="text-slate-300">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeatures.map((feature) => (
                  <TableRow key={feature.id} className="border-slate-800 hover:bg-slate-800/30">
                    <TableCell className="font-mono text-slate-300">{feature.featureKey}</TableCell>
                    <TableCell className="font-medium text-slate-200">{feature.featureName}</TableCell>
                    <TableCell className="text-slate-400 max-w-xs truncate" title={feature.description}>
                      {feature.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          feature.tenantType === 'all' ? 'bg-slate-700 text-slate-300' :
                          feature.tenantType === 'business' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }
                      >
                        {tenantTypeLabels[feature.tenantType as keyof typeof tenantTypeLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={feature.isEnabled}
                        onCheckedChange={() => handleToggleFeature(feature.id, feature.isEnabled)}
                        className={feature.isEnabled ? "data-[state=checked]:bg-emerald-600" : "data-[state=checked]:bg-slate-600"}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFeature(feature)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFeature(feature.id)}
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
            <AlertDialogTitle className="text-slate-100">确认删除功能？</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              此操作将永久删除该功能配置，且无法恢复。请谨慎操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFeature}
              className="bg-red-600 hover:bg-red-700 text-slate-50"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 编辑功能对话框 */}
      {editingFeature && (
        <Dialog open={!!editingFeature} onOpenChange={closeEditDialog}>
          <DialogContent className="bg-slate-900 border-slate-800 sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle className="text-slate-100">编辑功能配置</DialogTitle>
              <DialogDescription className="text-slate-400">
                修改功能的基本信息和配置
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="featureKey" className="text-right text-slate-300">
                  功能键
                </label>
                <Input
                  id="featureKey"
                  value={editingFeature.featureKey}
                  readOnly
                  className="col-span-3 bg-slate-800 border-slate-700 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="featureName" className="text-right text-slate-300">
                  功能名称
                </label>
                <Input
                  id="featureName"
                  value={editingFeature.featureName}
                  onChange={(e) => setEditingFeature({...editingFeature, featureName: e.target.value})}
                  className="col-span-3 bg-slate-800 border-slate-700 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right text-slate-300">
                  描述
                </label>
                <textarea
                  id="description"
                  value={editingFeature.description}
                  onChange={(e) => setEditingFeature({...editingFeature, description: e.target.value})}
                  className="col-span-3 bg-slate-800 border-slate-700 text-slate-200 rounded-md p-2 min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-slate-300">
                  租户类型
                </label>
                <Select
                  value={editingFeature.tenantType}
                  onValueChange={(value) => setEditingFeature({...editingFeature, tenantType: value as any})}
                >
                  <SelectTrigger className="col-span-3 bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="business">商务版</SelectItem>
                    <SelectItem value="government">政务版</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-slate-300">
                  启用状态
                </label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    checked={editingFeature.isEnabled}
                    onCheckedChange={(checked) => setEditingFeature({...editingFeature, isEnabled: checked})}
                    className={editingFeature.isEnabled ? "data-[state=checked]:bg-emerald-600" : "data-[state=checked]:bg-slate-600"}
                  />
                  <span className="text-slate-400">
                    {editingFeature.isEnabled ? '启用' : '禁用'}
                  </span>
                </div>
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
                className="bg-amber-600 hover:bg-amber-700 text-slate-950"
                onClick={closeEditDialog}
              >
                保存更改
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FeatureConfigList;