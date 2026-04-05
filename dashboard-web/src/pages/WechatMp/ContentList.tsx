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
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import env from '@/config/env';
import {
  Eye,
  Edit,
  Trash2,
  Undo2,
  Filter,
  Search,
  Calendar,
  User,
  FileText,
  ChevronRight,
  MoreVertical,
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

// 内容草稿状态枚举
enum ContentStatus {
  DRAFT = 'draft',
  PENDING_EDIT = 'pending_edit',
  PENDING_MANAGER = 'pending_manager',
  PENDING_LEGAL = 'pending_legal',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
}

// 内容草稿接口
interface ContentDraft {
  id: string;
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  status: ContentStatus;
  userId: string;
  tenantId: string;
  topicId?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// 筛选参数接口
interface FilterParams {
  status?: ContentStatus;
  keyword?: string;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

// 状态映射
const statusMap: Record<ContentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
  [ContentStatus.DRAFT]: { label: '草稿', variant: 'outline' },
  [ContentStatus.PENDING_EDIT]: { label: '初审中', variant: 'secondary' },
  [ContentStatus.PENDING_MANAGER]: { label: '复审中', variant: 'secondary' },
  [ContentStatus.PENDING_LEGAL]: { label: '终审中', variant: 'secondary' },
  [ContentStatus.APPROVED]: { label: '已通过', variant: 'success' },
  [ContentStatus.PUBLISHED]: { label: '已发布', variant: 'default' },
  [ContentStatus.REJECTED]: { label: '已退回', variant: 'destructive' },
};

// 状态选项
const statusOptions = [
  { value: '', label: '全部状态' },
  { value: ContentStatus.DRAFT, label: '草稿' },
  { value: ContentStatus.PENDING_EDIT, label: '初审中' },
  { value: ContentStatus.PENDING_MANAGER, label: '复审中' },
  { value: ContentStatus.PENDING_LEGAL, label: '终审中' },
  { value: ContentStatus.APPROVED, label: '已通过' },
  { value: ContentStatus.PUBLISHED, label: '已发布' },
  { value: ContentStatus.REJECTED, label: '已退回' },
];

const ContentList: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<FilterParams>({
    page: 1,
    limit: 20,
  });
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // 获取内容草稿列表
  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('lumina-token');
      const queryParams = new URLSearchParams();

      if (filter.status) queryParams.append('status', filter.status);
      if (filter.keyword) queryParams.append('keyword', filter.keyword);
      if (filter.createdBy) queryParams.append('createdBy', filter.createdBy);
      if (filter.startDate) queryParams.append('startDate', filter.startDate);
      if (filter.endDate) queryParams.append('endDate', filter.endDate);
      queryParams.append('page', filter.page.toString());
      queryParams.append('limit', filter.limit.toString());

      const response = await fetch(
        `${env.apiBaseUrl}/api/content-drafts?${queryParams.toString()}`,
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
        throw new Error('获取内容列表失败');
      }
    } catch (error) {
      console.error('Failed to fetch content drafts:', error);
      toast({
        title: '获取失败',
        description: '无法获取内容列表，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchDrafts();
  }, [filter.page, filter.limit]);

  // 处理筛选
  const handleFilter = () => {
    setFilter({ ...filter, page: 1 });
  };

  // 重置筛选
  const handleResetFilter = () => {
    setFilter({
      status: undefined,
      keyword: '',
      createdBy: undefined,
      startDate: undefined,
      endDate: undefined,
      page: 1,
      limit: 20,
    });
    setShowAdvancedFilter(false);
  };

  // 删除草稿
  const handleDeleteDraft = async (id: string) => {
    if (!confirm('确定要删除这个草稿吗？删除后无法恢复。')) {
      return;
    }

    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch(`${env.apiBaseUrl}/api/content-drafts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: '删除成功',
          description: '草稿已成功删除',
        });
        fetchDrafts();
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      console.error('Failed to delete draft:', error);
      toast({
        title: '删除失败',
        description: '无法删除草稿，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 撤回修改
  const handleWithdrawDraft = async (id: string) => {
    if (!confirm('确定要撤回这个草稿吗？撤回后状态将变为草稿。')) {
      return;
    }

    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch(`${env.apiBaseUrl}/api/content-drafts/${id}/withdraw`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: '撤回成功',
          description: '草稿已撤回，状态变为草稿',
        });
        fetchDrafts();
      } else {
        throw new Error('撤回失败');
      }
    } catch (error) {
      console.error('Failed to withdraw draft:', error);
      toast({
        title: '撤回失败',
        description: '无法撤回草稿，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 分页
  const totalPages = Math.ceil(total / filter.limit);
  const handlePageChange = (page: number) => {
    setFilter({ ...filter, page });
  };

  // 审核进度显示
  const getReviewProgress = (status: ContentStatus) => {
    const steps = [
      { key: ContentStatus.DRAFT, label: '草稿' },
      { key: ContentStatus.PENDING_EDIT, label: '初审' },
      { key: ContentStatus.PENDING_MANAGER, label: '复审' },
      { key: ContentStatus.PENDING_LEGAL, label: '终审' },
      { key: ContentStatus.APPROVED, label: '已通过' },
    ];

    const currentIndex = steps.findIndex(step => step.key === status);
    return { steps, currentIndex };
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">内容列表管理</h1>
          <p className="text-muted-foreground">
            管理您的内容草稿，查看审核进度和操作记录
          </p>
        </div>
        <Button onClick={() => window.location.href = '/government/content-confirm'}>
          <FileText className="w-4 h-4 mr-2" />
          创建新内容
        </Button>
      </div>

      {/* 筛选卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            内容筛选
          </CardTitle>
          <CardDescription>
            根据状态、关键词、时间等条件筛选内容
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keyword">关键词搜索</Label>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <Input
                  id="keyword"
                  placeholder="搜索标题或内容..."
                  value={filter.keyword || ''}
                  onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">状态筛选</Label>
              <Select
                value={filter.status || ''}
                onValueChange={(value) => setFilter({ ...filter, status: value as ContentStatus || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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
                <Button onClick={handleFilter} className="flex-1">
                  <Search className="w-4 h-4 mr-2" />
                  筛选
                </Button>
                <Button variant="outline" onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}>
                  <Filter className="w-4 h-4 mr-2" />
                  高级
                </Button>
              </div>
            </div>
          </div>

          {/* 高级筛选 */}
          {showAdvancedFilter && (
            <div className="pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">开始日期</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <Input
                      id="startDate"
                      type="date"
                      value={filter.startDate || ''}
                      onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">结束日期</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <Input
                      id="endDate"
                      type="date"
                      value={filter.endDate || ''}
                      onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="createdBy">创建人ID</Label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <Input
                      id="createdBy"
                      placeholder="输入用户ID..."
                      value={filter.createdBy || ''}
                      onChange={(e) => setFilter({ ...filter, createdBy: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleResetFilter}>
                  重置筛选
                </Button>
                <Button onClick={handleFilter}>应用筛选</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 内容列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>内容列表</CardTitle>
              <CardDescription>
                共 {total} 条内容，当前第 {filter.page} 页，共 {totalPages} 页
              </CardDescription>
            </div>
            <Button variant="outline" onClick={fetchDrafts} disabled={loading}>
              <Refresh className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-4 text-slate-400">加载内容列表...</p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <h4 className="text-lg font-medium mb-2">暂无内容</h4>
              <p className="text-slate-400 mb-6">您还没有创建任何内容草稿</p>
              <Button onClick={() => window.location.href = '/government/content-confirm'}>
                创建新内容
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>标题</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建人</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>更新时间</TableHead>
                      <TableHead>审核进度</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drafts.map((draft) => {
                      const statusInfo = statusMap[draft.status];
                      const reviewProgress = getReviewProgress(draft.status);
                      return (
                        <TableRow key={draft.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {draft.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {draft.user?.username || draft.userId}
                          </TableCell>
                          <TableCell>
                            {format(new Date(draft.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                          </TableCell>
                          <TableCell>
                            {format(new Date(draft.updatedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {reviewProgress.steps.map((step, index) => (
                                <React.Fragment key={step.key}>
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                      index <= reviewProgress.currentIndex
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-slate-200 text-slate-400'
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                  {index < reviewProgress.steps.length - 1 && (
                                    <div
                                      className={`w-8 h-0.5 ${
                                        index < reviewProgress.currentIndex
                                          ? 'bg-amber-500'
                                          : 'bg-slate-200'
                                      }`}
                                    />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
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
                                {draft.status === ContentStatus.DRAFT && (
                                  <DropdownMenuItem
                                    onClick={() => window.location.href = `/government/content-confirm/${draft.id}`}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    继续编辑
                                  </DropdownMenuItem>
                                )}
                                {[
                                  ContentStatus.PENDING_EDIT,
                                  ContentStatus.PENDING_MANAGER,
                                  ContentStatus.PENDING_LEGAL,
                                ].includes(draft.status) && (
                                  <DropdownMenuItem
                                    onClick={() => handleWithdrawDraft(draft.id)}
                                  >
                                    <Undo2 className="w-4 h-4 mr-2" />
                                    撤回修改
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {draft.status === ContentStatus.DRAFT && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteDraft(draft.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    删除草稿
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

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
    </div>
  );
};

// 添加缺失的Refresh图标组件
const Refresh = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export default ContentList;