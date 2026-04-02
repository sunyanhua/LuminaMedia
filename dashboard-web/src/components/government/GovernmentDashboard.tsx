import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Landmark, 
  Shield, 
  FileText, 
  AlertTriangle, 
  Siren,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useEffect } from 'react';

// 模拟数据
const stats = [
  { label: '待审核公文', value: 12, icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { label: '今日已发布', value: 8, icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { label: '舆情预警', value: 3, icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { label: '合规通过率', value: '98.5%', icon: Shield, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
];

const recentTasks = [
  { id: '1', title: '关于春节安全生产的通知', status: 'reviewer', time: '10分钟前' },
  { id: '2', title: '防电信诈骗宣传方案', status: 'approver', time: '30分钟前' },
  { id: '3', title: '新能源汽车补贴政策解读', status: 'approved', time: '1小时前' },
];

function GovernmentDashboard() {
  // 确保演示模式开启
  useEffect(() => {
    localStorage.setItem('lumina-demo-mode', 'true');
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      reviewer: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      approver: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      approved: 'bg-green-500/10 text-green-500 border-green-500/30',
    };
    const labels: Record<string, string> = {
      reviewer: '审核中',
      approver: '待批准',
      approved: '已发布',
    };
    return <Badge variant="outline" className={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* 政务版标识 */}
      <div className="flex items-center justify-between">
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 px-3 py-1">
          <Landmark className="w-3 h-3 mr-1" />
          政务版演示
        </Badge>
      </div>

      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">政务仪表盘</h2>
        <p className="text-slate-400">政府宣传工作的统一管理平台</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-slate-100 mt-1">{stat.value}</h3>
                  </div>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", stat.bgColor)}>
                    <Icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 快捷入口 */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 flex flex-col items-center gap-2">
              <FileText className="w-6 h-6 text-blue-500" />
              <span className="text-slate-300">新建公文</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 flex flex-col items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <span className="text-slate-300">防诈骗宣传</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 flex flex-col items-center gap-2">
              <Shield className="w-6 h-6 text-green-500" />
              <span className="text-slate-300">政策解读</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 flex flex-col items-center gap-2">
              <Siren className="w-6 h-6 text-red-500" />
              <span className="text-slate-300">应急响应</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 最近动态 */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">最近审核任务</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-200">{task.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(task.status)}
                  <span className="text-xs text-slate-500">{task.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 引入 cn 工具函数
import { cn } from '@/lib/utils';

export default GovernmentDashboard;
