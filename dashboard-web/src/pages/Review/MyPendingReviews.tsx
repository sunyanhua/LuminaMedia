import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Eye, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReviewDetailDialog from './ReviewDetailDialog';

// 审核记录类型定义
interface ReviewRecord {
  id: string;
  contentDraftId: string;
  contentDraft?: {
    id: string;
    title: string;
    summary?: string;
    coverImage?: string;
    status: string;
    createdAt: string;
    user?: {
      username: string;
      email: string;
    };
  };
  reviewerRole: string;
  reviewStep: string;
  status: 'PENDING' | 'PASSED' | 'REJECTED';
  comment?: string;
  reviewedAt?: string;
  createdAt: string;
}

const MyPendingReviews: React.FC = () => {
  const { toast } = useToast();
  const [pendingReviews, setPendingReviews] = useState<ReviewRecord[]>([]);
  const [reviewedHistory, setReviewedHistory] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedReview, setSelectedReview] = useState<ReviewRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // 获取待审列表
  const fetchPendingReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch('/api/review/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取待审列表失败: ${response.statusText}`);
      }

      const data = await response.json();
      setPendingReviews(data.records || []);
    } catch (error) {
      console.error('获取待审列表失败:', error);
      toast({
        title: '获取待审列表失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取已审历史
  const fetchReviewedHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch('/api/review/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取已审历史失败: ${response.statusText}`);
      }

      const data = await response.json();
      setReviewedHistory(data.records || []);
    } catch (error) {
      console.error('获取已审历史失败:', error);
      toast({
        title: '获取已审历史失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingReviews();
    } else {
      fetchReviewedHistory();
    }
  }, [activeTab]);

  // 处理审核详情查看
  const handleViewDetail = (review: ReviewRecord) => {
    setSelectedReview(review);
    setDetailOpen(true);
  };

  // 处理审核结果提交（通过详情弹窗处理）
  const handleReviewSubmitted = () => {
    // 刷新列表
    if (activeTab === 'pending') {
      fetchPendingReviews();
    }
    fetchReviewedHistory(); // 刷新历史记录
  };

  // 过滤待审列表
  const filteredPendingReviews = pendingReviews.filter(review => {
    const title = review.contentDraft?.title || '';
    const submitter = review.contentDraft?.user?.username || '';
    return searchQuery === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submitter.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // 过滤已审历史
  const filteredReviewedHistory = reviewedHistory.filter(review => {
    const title = review.contentDraft?.title || '';
    return searchQuery === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // 审核步骤翻译
  const translateReviewStep = (step: string) => {
    const stepMap: Record<string, string> = {
      'EDIT_REVIEW': '编辑初审',
      'AI_REVIEW': 'AI检测',
      'MANAGER_REVIEW': '主管复审',
      'LEGAL_REVIEW': '法务终审',
    };
    return stepMap[step] || step;
  };

  // 审核状态翻译
  const translateReviewStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': '待审核',
      'PASSED': '通过',
      'REJECTED': '退回',
    };
    return statusMap[status] || status;
  };

  // 审核状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'PASSED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">审核工作台</h1>
          <p className="text-slate-400">处理待审核的内容，查看已审核的历史记录</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">当前角色: </span>
          <Badge className="bg-slate-800 text-slate-300">
            {localStorage.getItem('lumina-user') ?
              JSON.parse(localStorage.getItem('lumina-user')!).roles?.join(', ')?.replace(/_/g, ' ') || '未知角色' :
              '未知角色'}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="pending">我的待审 ({pendingReviews.length})</TabsTrigger>
          <TabsTrigger value="history">我已审核 ({reviewedHistory.length})</TabsTrigger>
        </TabsList>

        {/* 搜索栏 */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-slate-300">搜索内容</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="search"
                    placeholder="按标题或提交人搜索..."
                    className="pl-10 bg-slate-800 border-slate-700 text-slate-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                  onClick={activeTab === 'pending' ? fetchPendingReviews : fetchReviewedHistory}
                  disabled={loading}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  刷新
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 我的待审标签页 */}
        <TabsContent value="pending" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200">待审核内容列表</CardTitle>
              <CardDescription className="text-slate-500">
                共 {filteredPendingReviews.length} 个待审内容
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              ) : filteredPendingReviews.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">暂无待审内容</h3>
                  <p className="text-slate-500 mb-6">当前没有需要您审核的内容</p>
                  <Button onClick={fetchPendingReviews}>刷新</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-300">标题</TableHead>
                      <TableHead className="text-slate-300">提交人</TableHead>
                      <TableHead className="text-slate-300">提交时间</TableHead>
                      <TableHead className="text-slate-300">当前环节</TableHead>
                      <TableHead className="text-slate-300">状态</TableHead>
                      <TableHead className="text-slate-300 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPendingReviews.map((review) => (
                      <TableRow key={review.id} className="border-slate-800 hover:bg-slate-800/30">
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-200">
                              {review.contentDraft?.title || '无标题'}
                            </div>
                            {review.contentDraft?.summary && (
                              <div className="text-sm text-slate-400 mt-1 line-clamp-1">
                                {review.contentDraft.summary}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {review.contentDraft?.user?.username || '未知用户'}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-slate-700 text-slate-300">
                            {translateReviewStep(review.reviewStep)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(review.status)}>
                            {translateReviewStatus(review.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetail(review)}
                              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            >
                              <Eye className="w-4 h-4" />
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
        </TabsContent>

        {/* 我已审核标签页 */}
        <TabsContent value="history" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200">已审核历史记录</CardTitle>
              <CardDescription className="text-slate-500">
                共 {filteredReviewedHistory.length} 条审核记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              ) : filteredReviewedHistory.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">暂无审核记录</h3>
                  <p className="text-slate-500 mb-6">您还没有审核过任何内容</p>
                  <Button onClick={fetchReviewedHistory}>刷新</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-300">标题</TableHead>
                      <TableHead className="text-slate-300">审核环节</TableHead>
                      <TableHead className="text-slate-300">审核结果</TableHead>
                      <TableHead className="text-slate-300">审核意见</TableHead>
                      <TableHead className="text-slate-300">审核时间</TableHead>
                      <TableHead className="text-slate-300 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReviewedHistory.map((review) => (
                      <TableRow key={review.id} className="border-slate-800 hover:bg-slate-800/30">
                        <TableCell>
                          <div className="font-medium text-slate-200">
                            {review.contentDraft?.title || '无标题'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-slate-700 text-slate-300">
                            {translateReviewStep(review.reviewStep)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(review.status)}>
                            {translateReviewStatus(review.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300 max-w-[200px] truncate">
                          {review.comment || '-'}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {review.reviewedAt ? new Date(review.reviewedAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetail(review)}
                              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            >
                              <Eye className="w-4 h-4" />
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
        </TabsContent>
      </Tabs>

      {/* 审核详情弹窗 */}
      {selectedReview && (
        <ReviewDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          reviewRecord={selectedReview}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default MyPendingReviews;