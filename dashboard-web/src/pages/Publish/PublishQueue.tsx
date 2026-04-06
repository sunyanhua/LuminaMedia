import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import env from '@/config/env';
import {
  Eye,
  Calendar,
  User,
  FileText,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  Send,
  GripVertical,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
// @ts-ignore - react-beautiful-dnd may not be installed
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';

// 内容草稿接口
interface ContentDraft {
  id: string;
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  status: string;
  userId: string;
  tenantId: string;
  topicId?: string;
  createdAt: string;
  updatedAt: string;
  publishOrder?: number;
  publishScheduledAt?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// 筛选参数接口
interface FilterParams {
  page: number;
  limit: number;
  orderBy: 'publishOrder' | 'createdAt' | 'updatedAt';
  orderDirection: 'ASC' | 'DESC';
}

// 发布结果接口
interface PublishResult {
  success: string[];
  failed: Array<{ id: string; reason: string }>;
}

const PublishQueue: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<FilterParams>({
    page: 1,
    limit: 20,
    orderBy: 'publishOrder',
    orderDirection: 'ASC',
  });
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [publishSettings, setPublishSettings] = useState({
    scheduledAt: '',
    sendToAll: true,
  });

  // 获取待发文章列表
  const fetchApprovedDrafts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('lumina-token');
      const queryParams = new URLSearchParams();

      queryParams.append('page', filter.page.toString());
      queryParams.append('limit', filter.limit.toString());
      if (filter.orderBy) queryParams.append('orderBy', filter.orderBy);
      if (filter.orderDirection) queryParams.append('orderDirection', filter.orderDirection);

      const response = await fetch(
        `${env.apiBaseUrl}/api/content-drafts/approved-for-publishing?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDrafts(data.drafts);
        setTotal(data.total);
      } else {
        throw new Error('获取待发文章列表失败');
      }
    } catch (error) {
      console.error('Failed to fetch approved drafts:', error);
      toast({
        title: '获取失败',
        description: '无法获取待发文章列表，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchApprovedDrafts();
  }, [filter.page, filter.limit, filter.orderBy, filter.orderDirection]);

  // 处理拖拽排序结束
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(drafts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 更新本地状态
    setDrafts(items);

    // 更新服务器端的排序
    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch(`${env.apiBaseUrl}/api/content-drafts/publish-order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          draftIds: items.map(draft => draft.id),
        }),
      });

      if (!response.ok) {
        throw new Error('更新排序失败');
      }

      toast({
        title: '排序更新成功',
        description: '发布顺序已保存',
      });
    } catch (error) {
      console.error('Failed to update publish order:', error);
      toast({
        title: '排序更新失败',
        description: '无法保存发布顺序，请稍后重试',
        variant: 'destructive',
      });
      // 回退到原始数据
      fetchApprovedDrafts();
    }
  };

  // 发布单篇文章
  const handlePublishDraft = async (draftId: string) => {
    if (!confirm('确定要发布这篇文章吗？发布后将在公众号显示。')) {
      return;
    }

    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch(`${env.apiBaseUrl}/api/content-drafts/${draftId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduledAt: publishSettings.scheduledAt || undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: '发布成功',
          description: '文章已成功发布（DEMO模拟）',
        });
        fetchApprovedDrafts();
      } else {
        throw new Error('发布失败');
      }
    } catch (error) {
      console.error('Failed to publish draft:', error);
      toast({
        title: '发布失败',
        description: '无法发布文章，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 批量发布
  const handleBatchPublish = async () => {
    const idsToPublish = selectedDrafts.length > 0 ? selectedDrafts : drafts.map(d => d.id);

    if (!confirm(`确定要批量发布 ${idsToPublish.length} 篇文章吗？`)) {
      return;
    }

    setPublishing(true);
    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch(`${env.apiBaseUrl}/api/content-drafts/batch-publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          draftIds: idsToPublish,
        }),
      });

      if (response.ok) {
        const result: PublishResult = await response.json();

        toast({
          title: '批量发布完成',
          description: `成功 ${result.success.length} 篇，失败 ${result.failed.length} 篇`,
        });

        if (result.failed.length > 0) {
          console.error('Failed drafts:', result.failed);
        }

        fetchApprovedDrafts();
        setSelectedDrafts([]);
      } else {
        throw new Error('批量发布失败');
      }
    } catch (error) {
      console.error('Failed to batch publish:', error);
      toast({
        title: '批量发布失败',
        description: '无法执行批量发布，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  // 从发布队列移除
  const handleRemoveFromQueue = async (draftId: string) => {
    if (!confirm('确定要从发布队列中移除这篇文章吗？')) {
      return;
    }

    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch(`${env.apiBaseUrl}/api/content-drafts/${draftId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: '移除成功',
          description: '文章已从发布队列中移除',
        });
        fetchApprovedDrafts();
      } else {
        throw new Error('移除失败');
      }
    } catch (error) {
      console.error('Failed to remove draft:', error);
      toast({
        title: '移除失败',
        description: '无法从队列中移除文章，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 分页
  const totalPages = Math.ceil(total / filter.limit);
  const handlePageChange = (page: number) => {
    setFilter({ ...filter, page });
  };

  // 切换选择
  const toggleSelectDraft = (draftId: string) => {
    setSelectedDrafts(prev =>
      prev.includes(draftId)
        ? prev.filter(id => id !== draftId)
        : [...prev, draftId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedDrafts.length === drafts.length) {
      setSelectedDrafts([]);
    } else {
      setSelectedDrafts(drafts.map(d => d.id));
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">一键发布</h1>
          <p className="text-muted-foreground">
            管理已通过审核的文章，调整发布顺序，一键发布到微信公众号
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
            <Clock className="w-4 h-4 mr-2" />
            发布设置
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            发布预览
          </Button>
          <Button onClick={handleBatchPublish} disabled={publishing || drafts.length === 0}>
            <Send className="w-4 h-4 mr-2" />
            {publishing ? '发布中...' : '一键发布'}
          </Button>
        </div>
      </div>

      {/* 发布设置面板 */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>发布设置</CardTitle>
            <CardDescription>配置发布参数</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">定时发布时间</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={publishSettings.scheduledAt}
                    onChange={(e) => setPublishSettings({ ...publishSettings, scheduledAt: e.target.value })}
                  />
                </div>
                <p className="text-sm text-slate-400">留空表示立即发布</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sendToAll">群发对象</Label>
                <Select
                  value={publishSettings.sendToAll ? 'all' : 'tagged'}
                  onValueChange={(value) => setPublishSettings({ ...publishSettings, sendToAll: value === 'all' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择群发对象" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部粉丝</SelectItem>
                    <SelectItem value="tagged">按标签群发（DEMO）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowSettings(false)}>保存设置</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 发布预览面板 */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>发布预览</CardTitle>
            <CardDescription>模拟微信公众号文章卡片效果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.slice(0, 3).map((draft) => (
                <div key={draft.id} className="border rounded-lg overflow-hidden">
                  {draft.coverImage && (
                    <img
                      src={draft.coverImage}
                      alt={draft.title}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h4 className="font-medium mb-2 line-clamp-2">{draft.title}</h4>
                    <p className="text-sm text-slate-400 line-clamp-2">{draft.summary || '暂无摘要'}</p>
                    <div className="mt-4 text-xs text-slate-400">
                      发布时间：{format(new Date(), 'yyyy-MM-dd HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-slate-400">
              预览效果为模拟微信公众号图文消息样式，实际发布效果可能略有差异。
            </div>
          </CardContent>
        </Card>
      )}

      {/* 待发文章列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>待发文章队列</CardTitle>
              <CardDescription>
                共 {total} 篇待发文章，当前第 {filter.page} 页，共 {totalPages} 页
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchApprovedDrafts} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/government/content-list'}>
                <FileText className="w-4 h-4 mr-2" />
                查看全部内容
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 排序和筛选 */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderBy">排序字段</Label>
              <Select
                value={filter.orderBy}
                onValueChange={(value: 'publishOrder' | 'createdAt' | 'updatedAt') =>
                  setFilter({ ...filter, orderBy: value, page: 1 })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择排序字段" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publishOrder">发布顺序</SelectItem>
                  <SelectItem value="createdAt">创建时间</SelectItem>
                  <SelectItem value="updatedAt">更新时间</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderDirection">排序方向</Label>
              <Select
                value={filter.orderDirection}
                onValueChange={(value: 'ASC' | 'DESC') =>
                  setFilter({ ...filter, orderDirection: value, page: 1 })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择排序方向" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASC">升序</SelectItem>
                  <SelectItem value="DESC">降序</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">每页显示</Label>
              <Select
                value={filter.limit.toString()}
                onValueChange={(value) => setFilter({ ...filter, limit: parseInt(value), page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择数量" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10条</SelectItem>
                  <SelectItem value="20">20条</SelectItem>
                  <SelectItem value="50">50条</SelectItem>
                  <SelectItem value="100">100条</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="opacity-0">操作</Label>
              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleSelectAll}
                  variant="outline"
                  className="flex-1"
                >
                  {selectedDrafts.length === drafts.length ? '取消全选' : '全选'}
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-4 text-slate-400">加载待发文章列表...</p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <h4 className="text-lg font-medium mb-2">暂无待发文章</h4>
              <p className="text-slate-400 mb-6">所有已通过审核的文章都会显示在这里</p>
              <Button onClick={() => window.location.href = '/government/content-list'}>
                查看内容列表
              </Button>
            </div>
          ) : (
            <>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="publish-queue">
                  {(provided: any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="rounded-md border"
                    >
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">排序</TableHead>
                            <TableHead className="w-12">选择</TableHead>
                            <TableHead>标题</TableHead>
                            <TableHead>创建人</TableHead>
                            <TableHead>创建时间</TableHead>
                            <TableHead>发布顺序</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {drafts.map((draft, index) => (
                            <Draggable key={draft.id} draggableId={draft.id} index={index}>
                              {(provided: any) => (
                                <TableRow
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="hover:bg-slate-50"
                                >
                                  <TableCell {...provided.dragHandleProps}>
                                    <GripVertical className="w-4 h-4 text-slate-400" />
                                  </TableCell>
                                  <TableCell>
                                    <input
                                      type="checkbox"
                                      checked={selectedDrafts.includes(draft.id)}
                                      onChange={() => toggleSelectDraft(draft.id)}
                                      className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium max-w-xs truncate">
                                    {draft.title}
                                  </TableCell>
                                  <TableCell>
                                    {draft.user?.username || draft.userId}
                                  </TableCell>
                                  <TableCell>
                                    {format(new Date(draft.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {draft.publishOrder || '未设置'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreVertical className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                                        <DropdownMenuItem
                                          onClick={() => window.open(`/government/content-confirm/${draft.id}`, '_blank')}
                                        >
                                          <Eye className="w-4 h-4 mr-2" />
                                          查看详情
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handlePublishDraft(draft.id)}
                                        >
                                          <Send className="w-4 h-4 mr-2" />
                                          发布此篇
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => handleRemoveFromQueue(draft.id)}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          移出队列
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-slate-400">
                    显示第 {(filter.page - 1) * filter.limit + 1} 到{' '}
                    {Math.min(filter.page * filter.limit, total)} 条，共 {total} 条
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filter.page - 1)}
                      disabled={filter.page <= 1}
                    >
                      上一页
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (filter.page <= 3) {
                        pageNum = i + 1;
                      } else if (filter.page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = filter.page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={filter.page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filter.page + 1)}
                      disabled={filter.page >= totalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 批量操作栏 */}
      {selectedDrafts.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white border rounded-lg shadow-lg p-4 flex items-center gap-4">
          <div className="text-sm font-medium">
            已选择 {selectedDrafts.length} 篇文章
          </div>
          <Button onClick={handleBatchPublish} disabled={publishing} size="sm">
            <Send className="w-4 h-4 mr-2" />
            {publishing ? '发布中...' : '批量发布'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedDrafts([])}
            size="sm"
          >
            取消选择
          </Button>
        </div>
      )}
    </div>
  );
};

export default PublishQueue;