import { LayoutDashboard, ChartBar as BarChart3, Network, Shield, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const menuItems = [
  { id: 'dashboard', path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'analytics', path: '/analytics', label: '数据统计分析', icon: BarChart3 },
  { id: 'ai-strategy', path: '/ai-strategy', label: 'AI智策中心', icon: Sparkles },
  { id: 'matrix', path: '/matrix', label: '新媒体矩阵', icon: Network },
  { id: 'governance', path: '/governance', label: '发稿审核', icon: Shield },
];

export function Sidebar() {
  const location = useLocation();
  const { setCurrentPage, sidebarCollapsed, toggleSidebar } = useAppStore();

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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-amber-500">LuminaMedia</h1>
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
          const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1',
                isActive
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        {!sidebarCollapsed ? (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-xs font-semibold text-slate-200">政务级安全</span>
            </div>
            <p className="text-xs text-slate-400">所有数据加密且合规</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <Shield className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>
    </div>
  );
}
