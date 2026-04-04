import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDemoQuota } from '@/hooks/useDemoQuota';
import { Progress } from '@/components/ui/progress';
import { QuotaDisplay } from '@/components/QuotaDisplay';
import { NotificationService } from '@/services/notification.service';
import { RotateCcw, User, Shield, Activity } from 'lucide-react';

const UserProfilePage: React.FC = () => {
  const { quotas, loading, refreshQuotas, resetQuota, isQuotaExceeded, isQuotaNearLimit } = useDemoQuota();

  const handleResetQuota = async (quotaName: string) => {
    await resetQuota(quotaName);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">个人中心</h1>
        <p className="text-slate-400">管理您的账户信息和系统设置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 个人信息卡片 */}
        <Card className="lg:col-span-1 bg-slate-900/50 border-slate-800">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src="/placeholder-avatar.jpg" alt="@user" />
              <AvatarFallback className="bg-slate-800 text-slate-200">U</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl text-slate-100 mt-4">演示用户</CardTitle>
            <CardDescription className="text-slate-400">演示系统标准用户</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                演示账户
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {localStorage.getItem('lumina-demo-version') === 'government' ? '政务版' : '商务版'}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              这是一个演示账户，所有操作均在模拟环境中进行
            </p>
            <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
              <User className="w-4 h-4 mr-2" />
              编辑资料
            </Button>
          </CardContent>
        </Card>

        {/* 配额使用情况卡片 */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              配额使用情况
            </CardTitle>
            <CardDescription className="text-slate-400">
              当前账户的资源使用情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              ) : (
                quotas.map((quota, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-200">{quota.name}</h4>
                        {isQuotaExceeded(quota.name) && (
                          <Badge variant="destructive" className="text-xs">已用完</Badge>
                        )}
                        {isQuotaNearLimit(quota.name) && !isQuotaExceeded(quota.name) && (
                          <Badge variant="default" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                            即将用完
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-slate-400">
                        {quota.used}/{quota.max} {quota.unit}
                      </div>
                    </div>
                    <Progress
                      value={Math.min(100, (quota.used / quota.max) * 100)}
                      className="h-2"
                      indicatorColor={
                        isQuotaExceeded(quota.name)
                          ? 'bg-red-500'
                          : quota.used / quota.max > 0.8
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetQuota(quota.name)}
                        disabled={quota.used === 0}
                        className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        重置配额
                      </Button>
                    </div>
                  </div>
                ))
              )}

              <div className="pt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={refreshQuotas}
                  disabled={loading}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新状态
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 安全设置卡片 */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            安全设置
          </CardTitle>
          <CardDescription className="text-slate-400">
            配置账户安全选项
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="password" className="data-[state=active]:bg-amber-600 data-[state=active]:text-slate-950">密码设置</TabsTrigger>
              <TabsTrigger value="session" className="data-[state=active]:bg-amber-600 data-[state=active]:text-slate-950">会话管理</TabsTrigger>
            </TabsList>
            <TabsContent value="password">
              <Card className="bg-slate-800/50 border-slate-700 mt-4">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <p className="text-slate-400">
                      在演示模式下，密码设置仅用于演示目的，不涉及实际账户更改。
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">当前密码</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="输入当前密码"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">新密码</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="输入新密码"
                        />
                      </div>
                    </div>
                    <Button className="self-start bg-amber-600 hover:bg-amber-700 text-slate-950 w-32">
                      更新密码
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="session">
              <Card className="bg-slate-800/50 border-slate-700 mt-4">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <p className="text-slate-400">
                      演示账户会话管理。在演示环境中，会话将在24小时后自动过期。
                    </p>
                    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-200">当前会话</p>
                        <p className="text-sm text-slate-400">将在 23 小时 59 分钟后过期</p>
                      </div>
                      <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                        延长会话
                      </Button>
                    </div>
                    <Button variant="destructive" className="self-start">
                      退出登录
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;