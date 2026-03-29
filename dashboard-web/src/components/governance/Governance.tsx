import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, FileText, Eye, CircleCheck as CheckCircle2, Clock, TriangleAlert as AlertTriangle, Lock, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ReviewTask {
  id: string;
  title: string;
  platform: string;
  status: 'draft' | 'reviewer' | 'approver' | 'approved' | 'rejected';
  currentStep: number;
  submittedBy: string;
  reviewer?: string;
  approver?: string;
  content: string;
  timestamp: string;
}

const mockTasks: ReviewTask[] = [
  {
    id: '1',
    title: '春节活动 - 主帖',
    platform: '小红书',
    status: 'approver',
    currentStep: 2,
    submittedBy: '李伟',
    reviewer: '张敏',
    approver: '王静',
    content: '春节购物指南，附带促销优惠..',
    timestamp: '2024-01-15 14:30',
  },
  {
    id: '2',
    title: '每周新闻速递 - 会员福利',
    platform: '微信公众号',
    status: 'reviewer',
    currentStep: 1,
    submittedBy: '陈晓',
    reviewer: '张敏',
    content: '每周会员速递，提供独家福利..',
    timestamp: '2024-01-15 15:45',
  },
  {
    id: '3',
    title: '产品发布视频脚本',
    platform: '抖音',
    status: 'approved',
    currentStep: 3,
    submittedBy: '刘阳',
    reviewer: '张敏',
    approver: '王静',
    content: '社交媒体新产品发布视频脚本。',
    timestamp: '2024-01-15 10:20',
  },
  {
    id: '4',
    title: '限时抢购公告',
    platform: '微博',
    status: 'draft',
    currentStep: 0,
    submittedBy: '赵明',
    content: '午后促销限时抢购公告..',
    timestamp: '2024-01-15 16:00',
  },
];

const reviewSteps = [
  { label: '草稿', icon: FileText, color: 'text-slate-400' },
  { label: '初审', icon: Eye, color: 'text-blue-500' },
  { label: '终审', icon: UserCheck, color: 'text-amber-500' },
  { label: '已发布', icon: CheckCircle2, color: 'text-green-500' },
];

function Governance() {
  const getStatusBadge = (status: ReviewTask['status']) => {
    const variants = {
      draft: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      reviewer: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      approver: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      approved: 'bg-green-500/10 text-green-500 border-green-500/30',
      rejected: 'bg-red-500/10 text-red-500 border-red-500/30',
    };

    const labels = {
      draft: '草稿',
      reviewer: '审核中',
      approver: '待批准',
      approved: '已批准',
      rejected: '已驳回',
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">发稿审核</h2>
          <p className="text-slate-400">
            政务级内容审核和数据保护
          </p>
        </div>
        <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
          <Shield className="w-3 h-3 mr-1" />
          合规
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">待审核</p>
                <h3 className="text-2xl font-bold text-slate-100">
                  {mockTasks.filter((t) => t.status === 'reviewer' || t.status === 'approver').length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">今日已批准</p>
                <h3 className="text-2xl font-bold text-slate-100">12</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">标记问题</p>
                <h3 className="text-2xl font-bold text-slate-100">2</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">三审三校工作流</CardTitle>
          <p className="text-sm text-slate-400">
            政府要求的内容审批流程
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center justify-between p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <div className="flex items-center gap-4">
              {reviewSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center ${step.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-slate-400 mt-2">{step.label}</span>
                    </div>
                    {index < reviewSteps.length - 1 && (
                      <div className="w-16 h-0.5 bg-slate-700 mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {mockTasks.map((task) => (
              <div
                key={task.id}
                className="p-5 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-slate-200">{task.title}</h4>
                      {getStatusBadge(task.status)}
                      <Badge variant="outline" className="border-slate-600 text-slate-400">
                        {task.platform}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{task.content}</p>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">
                            {task.submittedBy.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-slate-400">
                          <span className="text-slate-500">提交人:</span> {task.submittedBy}
                        </span>
                      </div>

                      {task.reviewer && (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-blue-700 text-blue-100 text-xs">
                              {task.reviewer.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-slate-400">
                            <span className="text-slate-500">审核人:</span> {task.reviewer}
                          </span>
                        </div>
                      )}

                      {task.approver && (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-amber-700 text-amber-100 text-xs">
                              {task.approver.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-slate-400">
                            <span className="text-slate-500">批准人:</span> {task.approver}
                          </span>
                        </div>
                      )}

                      <span className="text-slate-500 ml-auto">{task.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                  <div className="flex-1 flex items-center gap-1">
                    {reviewSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 flex-1 rounded-full ${
                          index <= task.currentStep ? 'bg-amber-500' : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  {task.status !== 'approved' && task.status !== 'rejected' && (
                    <div className="flex gap-2">
                      <button className="px-4 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 text-sm font-medium rounded border border-green-500/30 transition-colors">
                        批准
                      </button>
                      <button className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded border border-red-500/30 transition-colors">
                        驳回
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" />
                数据保护设置
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                隐私和安全配置
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex-1">
              <h5 className="font-semibold text-slate-200 mb-1">数据脱敏</h5>
              <p className="text-sm text-slate-400">
                自动从分析中删除敏感用户信息
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex-1">
              <h5 className="font-semibold text-slate-200 mb-1">内容加密</h5>
              <p className="text-sm text-slate-400">
                所有存储内容的端到端加密
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex-1">
              <h5 className="font-semibold text-slate-200 mb-1">审计日志</h5>
              <p className="text-sm text-slate-400">
                跟踪所有系统访问和修改
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex-1">
              <h5 className="font-semibold text-slate-200 mb-1">IP白名单</h5>
              <p className="text-sm text-slate-400">
                仅限已批准的IP地址访问
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex-1">
              <h5 className="font-semibold text-slate-200 mb-1">双因素认证</h5>
              <p className="text-sm text-slate-400">
                所有管理员账户需要2FA认证
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-slate-100 mb-2">
                政务级安全认证
              </h4>
              <p className="text-slate-300 mb-4">
                灵曜智媒符合所有监管要求，包括数据本地化、内容审核工作流程以及政府机构要求的隐私保护标准。
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  ISO 27001
                </Badge>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  等保三级
                </Badge>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  GDPR 合规
                </Badge>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  SOC 2 Type II
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Governance;
