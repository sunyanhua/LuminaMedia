import { LayoutDashboard, ChartBar as BarChart3, Network, Shield, Sparkles, ChevronLeft, ChevronRight, PlayCircle, FileText, AlertTriangle, Siren, ChevronLeft as ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore, useDemoVersion } from '@/store/useAppStore';

// 商务版菜单项
const businessMenuItems = [
  { id: 'dashboard', path: '/business/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'analytics', path: '/business/analytics', label: '数据统计分析', icon: BarChart3 },
  { id: 'ai-strategy', path: '/business/ai-strategy', label: 'AI智策中心', icon: Sparkles },
  { id: 'matrix', path: '/business/matrix', label: '新媒体矩阵', icon: Network },
  { id: 'demo', path: '/business/demo', label: '交互式演示', icon: PlayCircle },
];

// 政务版菜单项
const governmentMenuItems = [
  { id: 'dashboard', path: '/government/dashboard', label: '政务仪表盘', icon: LayoutDashboard },
  { id: 'governance', path: '/government/governance', label: '发稿审核', icon: Shield },
  { id: 'policy', path: '/government/policy', label: '政策解读', icon: FileText },
  { id: 'anti-fraud', path: '/government/anti-fraud', label: '防诈骗宣传', icon: AlertTriangle },
  { id: 'emergency', path: '/government/emergency', label: '应急响应', icon: Siren },
];

export function Sidebar() {
  const location = useLocation();
  const demoVersion = useDemoVersion();
  const { setCurrentPage, sidebarCollapsed, toggleSidebar, setDemoVersion } = useAppStore();

  // 根据版本选择菜单项
  const menuItems = demoVersion === 'government' ? governmentMenuItems : businessMenuItems;

  // 判断是否为激活状态
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div
      className={cn(
        'bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              demoVersion === 'government' 
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                : 'bg-gradient-to-br from-amber-500 to-amber-600'
            )}>
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className={cn(
                "text-lg font-bold",
                demoVersion === 'government' ? 'text-blue-400' : 'text-amber-500'
              )}>LuminaMedia</h1>
              <p className="text-xs text-slate-400">灵曜智媒</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1',
                active
                  ? demoVersion === 'government'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 版本切换和返回入口 */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {/* 返回版本选择 */}
        <Link
          to="/"
          onClick={() => setDemoVersion(null)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
            'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          )}
        >
          <ArrowLeft className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-sm font-medium">切换版本</span>}
        </Link>

        {!sidebarCollapsed ? (
          <div className={cn(
            "rounded-lg p-3 border",
            demoVersion === 'government'
              ? 'bg-blue-900/20 border-blue-800/50'
              : 'bg-slate-800/50 border-slate-700'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className={cn(
                "w-4 h-4",
                demoVersion === 'government' ? 'text-blue-400' : 'text-green-500'
              )} />
              <span className="text-xs font-semibold text-slate-200">
                {demoVersion === 'government' ? '政务级安全' : '企业级安全'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {demoVersion === 'government' 
                ? '符合政府信息系统安全要求' 
                : '所有数据加密且合规'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <Shield className={cn(
              "w-5 h-5",
              demoVersion === 'government' ? 'text-blue-400' : 'text-green-500'
            )} />
          </div>
        )}
      </div>
    </div>
  );
}
