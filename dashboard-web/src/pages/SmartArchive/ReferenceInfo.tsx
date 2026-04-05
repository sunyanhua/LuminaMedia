import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Download, Check, X, Edit, Eye, RefreshCw, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// 参考信息类型定义
interface ReferenceInfo {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  sourceUrl?: string;
  sourceName?: string;
  publishTime?: string;
  relevance: number;
  isAdopted: boolean;
  status: 'new' | 'adopted' | 'modified' | 'ignored';
  category?: string;
  keywords?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// 状态映射
const statusMap = {
  new: { label: '新抓取', variant: 'outline' as const },
  adopted: { label: '已采用', variant: 'default' as const },
  modified: { label: '已修改', variant: 'secondary' as const },
  ignored: { label: '已忽略', variant: 'destructive' as const },
};

// 相关度颜色映射
const getRelevanceColor = (relevance: number) => {
  if (relevance >= 80) return 'bg-green-100 text-green-800';
  if (relevance >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
};

const ReferenceInfoPage: React.FC = () => {
  const { toast } = useToast();
  const [referenceInfos, setReferenceInfos] = useState<ReferenceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // 对话框状态
  const [previewOpen, setPreviewOpen] = useState(false);
  const [modifyOpen, setModifyOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReferenceInfo | null>(null);
  const [modifyNotes, setModifyNotes] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generating, setGenerating] = useState(false);

  // 获取参考信息列表
  const fetchReferenceInfos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchKeyword) params.append('keyword', searchKeyword);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(`/api/reference-infos?${params}`);
      if (!response.ok) throw new Error('获取参考信息失败');

      const data = await response.json();
      setReferenceInfos(data.items);
      setTotal(data.total);
    } catch (error) {
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 手动触发抓取
  const triggerCrawl = async () => {
    try {
      const response = await fetch('/api/reference-infos/crawl/trigger', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        toast({
          title: '成功',
          description: result.message,
        });
        fetchReferenceInfos();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: '抓取失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  // 采用参考信息
  const adoptReferenceInfo = async (id: string) => {
    try {
      const userId = localStorage.getItem('userId') || 'demo-user';
      const response = await fetch(`/api/reference-infos/${id}/adopt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('采用失败');

      toast({
        title: '成功',
        description: '参考信息已采用',
      });
      fetchReferenceInfos();
    } catch (error) {
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  // 忽略参考信息
  const ignoreReferenceInfo = async (id: string, reason?: string) => {
    try {
      const response = await fetch(`/api/reference-infos/${id}/ignore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('忽略失败');

      toast({
        title: '成功',
        description: '参考信息已忽略',
      });
      fetchReferenceInfos();
    } catch (error) {
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  // 修改后采用
  const modifyAndAdopt = async () => {
    if (!selectedItem) return;

    setGenerating(true);
    try {
      // 调用生成修改后内容
      const aiResponse = await fetch(`/api/reference-infos/${selectedItem.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId') || 'demo-user',
          notes: modifyNotes,
        }),
      });

      if (!aiResponse.ok) throw new Error('生成失败');

      const aiResult = await aiResponse.json();
      setGeneratedContent(aiResult.content);

      // 提交修改后采用
      const userId = localStorage.getItem('userId') || 'demo-user';
      const response = await fetch(`/api/reference-infos/${selectedItem.id}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          notes: modifyNotes,
          generatedContent: aiResult.content,
        }),
      });

      if (!response.ok) throw new Error('修改后采用失败');

      toast({
        title: '成功',
        description: '参考信息已修改并采用',
      });
      setModifyOpen(false);
      setModifyNotes('');
      setGeneratedContent('');
      fetchReferenceInfos();
    } catch (error) {
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchReferenceInfos();
  }, [page, limit, statusFilter, categoryFilter]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReferenceInfos();
  };

  // 提取分类列表
  const categories = Array.from(
    new Set(referenceInfos.map(item => item.category).filter(Boolean))
  ) as string[];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">参考信息</h1>
          <p className="text-muted-foreground">每日自动抓取的政策资讯，支持一键采用和修改生成</p>
        </div>
        <Button onClick={triggerCrawl}>
          <RefreshCw className="mr-2 h-4 w-4" />
          手动抓取
        </Button>
      </div>

      {/* 筛选卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选与搜索</CardTitle>
          <CardDescription>根据状态、分类和关键词筛选参考信息</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="全部状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="new">新抓取</SelectItem>
                    <SelectItem value="adopted">已采用</SelectItem>
                    <SelectItem value="modified">已修改</SelectItem>
                    <SelectItem value="ignored">已忽略</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="全部分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分类</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">关键词搜索</Label>
                <div className="flex space-x-2">
                  <Input
                    id="search"
                    placeholder="搜索标题、摘要或内容..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                  <Button type="submit">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总计</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">条参考信息</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">新抓取</CardTitle>
            <Badge variant="outline">新</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referenceInfos.filter(item => item.status === 'new').length}
            </div>
            <p className="text-xs text-muted-foreground">待处理</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已采用</CardTitle>
            <Badge variant="default">已采用</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referenceInfos.filter(item => item.status === 'adopted').length}
            </div>
            <p className="text-xs text-muted-foreground">已转化为素材</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">相关度</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referenceInfos.length > 0
                ? Math.round(
                    referenceInfos.reduce((sum, item) => sum + item.relevance, 0) /
                      referenceInfos.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">平均相关度</p>
          </CardContent>
        </Card>
      </div>

      {/* 参考信息列表 */}
      <Card>
        <CardHeader>
          <CardTitle>参考信息列表</CardTitle>
          <CardDescription>
            共 {total} 条记录，当前显示 {referenceInfos.length} 条
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : referenceInfos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无参考信息
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>来源</TableHead>
                    <TableHead>发布时间</TableHead>
                    <TableHead>相关度</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referenceInfos.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="max-w-md">
                          <div className="line-clamp-1">{item.title}</div>
                          {item.summary && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {item.summary}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{item.sourceName}</div>
                          {item.sourceUrl && (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              查看原文
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.publishTime
                          ? new Date(item.publishTime).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRelevanceColor(item.relevance)}>
                          {item.relevance}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusMap[item.status].variant}>
                          {statusMap[item.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setPreviewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {item.status === 'new' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => adoptReferenceInfo(item.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setModifyOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => ignoreReferenceInfo(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* 分页 */}
          {total > limit && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                第 {page} 页，共 {Math.ceil(total / limit)} 页
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
                  disabled={page >= Math.ceil(total / limit)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 预览对话框 */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
            <DialogDescription>
              来源：{selectedItem?.sourceName} • 发布时间：{' '}
              {selectedItem?.publishTime
                ? new Date(selectedItem.publishTime).toLocaleString()
                : '未知'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem?.summary && (
              <div>
                <h4 className="font-medium mb-2">摘要</h4>
                <p className="text-sm text-muted-foreground">{selectedItem.summary}</p>
              </div>
            )}
            {selectedItem?.content && (
              <div>
                <h4 className="font-medium mb-2">完整内容</h4>
                <div className="prose prose-sm max-h-96 overflow-y-auto">
                  {selectedItem.content}
                </div>
              </div>
            )}
            {selectedItem?.keywords && selectedItem.keywords.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">关键词</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.keywords.map(keyword => (
                    <Badge key={keyword} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              关闭
            </Button>
            {selectedItem?.status === 'new' && (
              <>
                <Button onClick={() => selectedItem && adoptReferenceInfo(selectedItem.id)}>
                  采用
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPreviewOpen(false);
                    setModifyOpen(true);
                  }}
                >
                  修改后采用
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 修改对话框 */}
      <Dialog open={modifyOpen} onOpenChange={setModifyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>修改后采用</DialogTitle>
            <DialogDescription>
              输入修改意见，AI将基于原文重新生成内容
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="original">原文</Label>
              <Textarea
                id="original"
                readOnly
                value={selectedItem?.content || ''}
                className="min-h-32"
              />
            </div>
            <div>
              <Label htmlFor="notes">修改意见</Label>
              <Textarea
                id="notes"
                placeholder="例如：语言更正式一些，突出政策要点，增加具体实施建议..."
                value={modifyNotes}
                onChange={(e) => setModifyNotes(e.target.value)}
                className="min-h-24"
              />
            </div>
            {generatedContent && (
              <div>
                <Label htmlFor="generated">AI生成内容</Label>
                <Textarea
                  id="generated"
                  readOnly
                  value={generatedContent}
                  className="min-h-32"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModifyOpen(false);
                setModifyNotes('');
                setGeneratedContent('');
              }}
            >
              取消
            </Button>
            <Button onClick={modifyAndAdopt} disabled={!modifyNotes || generating}>
              {generating ? '生成中...' : generatedContent ? '确认采用' : '生成并采用'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReferenceInfoPage;