import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSetDemoVersion, useIsAuthenticated } from '@/store/useAppStore';
import { Building2, Landmark, Sparkles, ArrowRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VersionSelector() {
  const navigate = useNavigate();
  const setDemoVersion = useSetDemoVersion();
  const isAuthenticated = useIsAuthenticated();

  const handleSelectVersion = (version: 'business' | 'government') => {
    setDemoVersion(version);
    // 跳转到登录页面，带上版本参数
    navigate(`/login?version=${version}`);
  };

  const handleLogout = () => {
    // 清除认证状态
    localStorage.removeItem('lumina-auth');
    localStorage.removeItem('lumina-user');
    localStorage.removeItem('lumina-demo-version');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,191,36,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_40%)]" />

      {/* 头部 */}
      <div className="relative z-10 text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/20">
            <Sparkles className="w-10 h-10 text-slate-950" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent mb-3">
          灵曜智媒
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          AI驱动的企业级内容营销平台
        </p>
        {isAuthenticated && (
          <p className="text-slate-500 text-sm mt-2">
            请选择要体验的演示版本
          </p>
        )}
      </div>

      {/* 版本选择卡片 */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* 商务版 */}
        <Card className="group bg-slate-900/80 backdrop-blur-sm border-slate-800 hover:border-amber-500/50 transition-all duration-300 cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <Building2 className="w-8 h-8 text-amber-500" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </div>
            <CardTitle className="text-2xl text-slate-100">商务版 DEMO</CardTitle>
            <CardDescription className="text-slate-400">
              面向企业客户的内容营销解决方案
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                客户数据分析与洞察
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                AI智能营销策略生成
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                新媒体矩阵一键发布
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                营销效果实时监控
              </li>
            </ul>
            <Button
              onClick={() => handleSelectVersion('business')}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold"
            >
              进入商务版
            </Button>
          </CardContent>
        </Card>

        {/* 政务版 */}
        <Card className="group bg-slate-900/80 backdrop-blur-sm border-slate-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Landmark className="w-8 h-8 text-blue-500" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
            <CardTitle className="text-2xl text-slate-100">政务版 DEMO</CardTitle>
            <CardDescription className="text-slate-400">
              面向政府机构的宣传管理平台
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                政府公文智能生成
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                三审三校工作流
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                防诈骗宣传工具
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                应急响应快速发布
              </li>
            </ul>
            <Button
              onClick={() => handleSelectVersion('government')}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold"
            >
              进入政务版
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 底部信息 */}
      <div className="relative z-10 mt-12 text-center">
        <p className="text-slate-500 text-sm mb-4">
          演示账号：商务版 admin@demo.lumina.com / 政务版 gov-admin
        </p>
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 mx-auto text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        )}
      </div>

      <div className="absolute bottom-8 text-center text-slate-600 text-sm">
        <p>© 2026 灵曜智媒 - 智能新媒体管理解决方案</p>
      </div>
    </div>
  );
}

export default VersionSelector;
