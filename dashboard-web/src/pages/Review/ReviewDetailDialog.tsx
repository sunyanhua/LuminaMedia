import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewRecord {
  id: string;
  contentDraftId: string;
  contentDraft?: {
    id: string;
    title: string;
    content: string;
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

interface ReviewDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewRecord: ReviewRecord;
  onReviewSubmitted?: () => void;
}

const ReviewDetailDialog: React.FC<ReviewDetailDialogProps> = ({
  open,
  onOpenChange,
  reviewRecord,
  onReviewSubmitted,
}) => {
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [contentDetails, setContentDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 加载内容详情
  useEffect(() => {
    if (open && reviewRecord.contentDraftId) {
      fetchContentDetails();
    }
  }, [open, reviewRecord.contentDraftId]);

  const fetchContentDetails = async () => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch(`/api/content-drafts/${reviewRecord.contentDraftId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取内容详情失败: ${response.statusText}`);
      }

      const data = await response.json();
      setContentDetails(data);
    } catch (error) {
      console.error('获取内容详情失败:', error);
      toast({
        title: '获取内容详情失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoadingDetails(false);
    }
  };

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

  // 提交审核结果
  const submitReviewResult = async (status: 'PASSED' | 'REJECTED') => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentDraftId: reviewRecord.contentDraftId,
          status,
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `提交审核结果失败: ${response.statusText}`);
      }

      toast({
        title: '审核结果提交成功',
        description: `内容已${status === 'PASSED' ? '通过' : '退回'}审核`,
      });

      // 回调刷新列表
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      // 关闭弹窗
      onOpenChange(false);
    } catch (error) {
      console.error('提交审核结果失败:', error);
      toast({
        title: '提交审核结果失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 渲染内容预览
  const renderContentPreview = () => {
    if (loadingDetails) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      );
    }

    if (!contentDetails) {
      return (
        <div className="text-center py-8 text-slate-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p>无法加载内容详情</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">文章内容</h3>
          <div
            className="prose prose-invert max-w-none bg-slate-800/50 p-4 rounded-lg overflow-auto max-h-[300px]"
            dangerouslySetInnerHTML={{ __html: contentDetails.content || '' }}
          />
        </div>

        {contentDetails.summary && (
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">摘要</h3>
            <p className="text-slate-300 bg-slate-800/50 p-3 rounded-lg">
              {contentDetails.summary}
            </p>
          </div>
        )}

        {contentDetails.coverImage && (
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">封面图</h3>
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <img
                src={contentDetails.coverImage}
                alt="封面图"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // 如果是已审核状态，显示只读信息
  const isReadOnly = reviewRecord.status !== 'PENDING';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-100">
            审核详情
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            审核内容详情及提交审核结果
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 基本信息卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-400">文章标题</Label>
              <div className="text-lg font-semibold text-slate-200">
                {reviewRecord.contentDraft?.title || '无标题'}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">提交人</Label>
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-4 h-4" />
                {reviewRecord.contentDraft?.user?.username || '未知用户'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-400">审核环节</Label>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {translateReviewStep(reviewRecord.reviewStep)}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">当前状态</Label>
              <Badge className={
                reviewRecord.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                reviewRecord.status === 'PASSED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              }>
                {translateReviewStatus(reviewRecord.status)}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">提交时间</Label>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4" />
                {new Date(reviewRecord.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <Separator className="bg-slate-800" />

          {/* 内容预览 */}
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4">内容预览</h3>
            {renderContentPreview()}
          </div>

          <Separator className="bg-slate-800" />

          {/* 审核意见 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">审核意见</h3>

            {isReadOnly ? (
              <div className="space-y-2">
                <Label className="text-slate-400">审核结果</Label>
                <div className="flex items-center gap-2">
                  {reviewRecord.status === 'PASSED' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="text-emerald-400 font-medium">已通过</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-400 font-medium">已退回</span>
                    </>
                  )}
                </div>

                {reviewRecord.comment && (
                  <>
                    <Label className="text-slate-400">审核意见</Label>
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                      <p className="text-slate-300">{reviewRecord.comment}</p>
                    </div>
                  </>
                )}

                {reviewRecord.reviewedAt && (
                  <>
                    <Label className="text-slate-400">审核时间</Label>
                    <div className="text-slate-300">
                      {new Date(reviewRecord.reviewedAt).toLocaleString()}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="review-comment" className="text-slate-300">
                    审核意见（可选）
                  </Label>
                  <Textarea
                    id="review-comment"
                    placeholder="请输入审核意见，指出需要修改的问题或通过的理由..."
                    className="min-h-[100px] bg-slate-800 border-slate-700 text-slate-200"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => submitReviewResult('PASSED')}
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-slate-950"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    通过审核
                  </Button>
                  <Button
                    onClick={() => submitReviewResult('REJECTED')}
                    disabled={submitting}
                    variant="destructive"
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    退回修改
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDetailDialog;