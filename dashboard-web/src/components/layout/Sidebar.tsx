import { LayoutDashboard, ChartBar as BarChart3, Network, Shield, Sparkles, ChevronLeft, ChevronRight, PlayCircle, FileText, AlertTriangle, Siren, ChevronLeft as ArrowLeft, Settings, Cpu, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useVersion } from '@/store/useAppStore';
import { useMenuPermissionService } from '@/services/permission.service';
import { MENU_CONFIG, getFilteredMenu, getDefaultPath } from '@/config/menu.config';
import { preloadComponent, preloadAllMenuPages } from '@/utils/preload';

export function Sidebar() {
  const location = useLocation();
  const version = useVersion();
  const { setCurrentPage, sidebarCollapsed, toggleSidebar, setVersion } = useAppStore();

  // 使用菜单权限服务获取动态菜单
  const { menuItems: allMenuItems, isLoaded } = useMenuPermissionService();

  // 根据当前版本过滤菜单
  // 政务版和商务版的功能键列表
  const enabledFeatures = [
    // 商务版功能
    'customer-analytics', 'ai-strategy', 'matrix-publish', 'government-publish',
    // 政务版功能
    'smart-archive', 'reference-info', 'sentiment-analysis', 'smart-report'
  ];
  const menuItems = getFilteredMenu(MENU_CONFIG, version || 'business', enabledFeatures).filter(
    item => item.key !== 'admin' // 管理菜单单独处理
  );

  // 添加管理菜单项
  const adminMenuItems = MENU_CONFIG.filter(item => item.key === 'admin')[0]?.children || [];

  // 判断是否为激活状态
  const isActive = (path: string) => {
    return path && (location.pathname === path || location.pathname.startsWith(path + '/'));
  };

  // 组件挂载后预加载所有菜单页面
  useEffect(() => {
    if (version && isLoaded) {
      preloadAllMenuPages(version);
    }
  }, [version, isLoaded]);

  if (!isLoaded) {
    return (
      <div className={cn(
        'bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}>
        <div className="p-4 border-b border-slate-800">
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800"></div>
            {!sidebarCollapsed && (
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded w-24"></div>
                <div className="h-3 bg-slate-800 rounded w-16"></div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 p-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full h-10 rounded-lg bg-slate-800 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

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
              version === 'government'
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                : 'bg-gradient-to-br from-amber-500 to-amber-600'
            )}>
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className={cn(
                "text-lg font-bold",
                version === 'government' ? 'text-blue-400' : 'text-amber-500'
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

      <nav className="flex-1 p-2 overflow-y-auto">
        {/* 主要菜单项 */}
        {menuItems.map((item) => {
          // 获取图标
          let Icon: any;
          switch (item.icon) {
            case 'dashboard': Icon = LayoutDashboard; break;
            case 'analytics': Icon = BarChart3; break;
            case 'ai': Icon = Cpu; break;
            case 'matrix': Icon = Network; break;
            case 'governance': Icon = Shield; break;
            case 'demo': Icon = PlayCircle; break;
            case 'sentiment': Icon = Activity; break;
            case 'geo': Icon = Activity; break;
            case 'admin': Icon = Settings; break;
            case 'archive': Icon = FileText; break;
            case 'info': Icon = Activity; break;
            case 'wechat': Icon = Network; break;
            case 'report': Icon = BarChart3; break;
            default: Icon = Sparkles;
          }

          // 有子菜单的项
          if (item.children && item.children.length > 0) {
            return (
              <div key={item.key} className="mb-2">
                {/* 父菜单标题 */}
                <div
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all mb-1',
                    'text-slate-300 font-medium'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm">{item.title}</span>}
                </div>
                {/* 子菜单 */}
                {!sidebarCollapsed && item.children.map((child) => {
                  if (!child.path) return null;
                  const active = isActive(child.path);

                  return (
                    <Link
                      key={`${item.key}-${child.key}`}
                      to={child.path}
                      onClick={() => setCurrentPage(child.key)}
                      onMouseEnter={() => child.path && preloadComponent(child.path)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all mb-1 ml-6',
                        active
                          ? version === 'government'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      )}
                    >
                      <span className="text-sm">{child.title}</span>
                    </Link>
                  );
                })}
              </div>
            );
          }

          // 没有子菜单的项
          if (item.path) {
            const active = isActive(item.path);

            return (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => setCurrentPage(item.key)}
                onMouseEnter={() => preloadComponent(item.path!)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1',
                  active
                    ? version === 'government'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.title}</span>}
              </Link>
            );
          }

          return null;
        })}

        {/* 管理菜单项 */}
        {adminMenuItems && adminMenuItems.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <h3 className={!sidebarCollapsed ? "px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider" : ""}>
              {!sidebarCollapsed ? "管理工具" : null}
            </h3>
            {adminMenuItems.map((item) => {
              if (!item.path) return null;

              let Icon: any;
              switch (item.icon) {
                case 'feature-config': Icon = Settings; break;
                case 'quota-management': Icon = Activity; break;
                case 'tenant-feature': Icon = Activity; break;
                default: Icon = Settings;
              }

              const active = isActive(item.path);

              return (
                <Link
                  key={`admin-${item.key}`}
                  to={item.path}
                  onClick={() => setCurrentPage(item.key)}
                  onMouseEnter={() => item.path && preloadComponent(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1',
                    active
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* 版本切换和返回入口 */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {/* 返回版本选择 */}
        <Link
          to="/"
          onClick={() => setVersion(null)}
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
            version === 'government'
              ? 'bg-blue-900/20 border-blue-800/50'
              : 'bg-slate-800/50 border-slate-700'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className={cn(
                "w-4 h-4",
                version === 'government' ? 'text-blue-400' : 'text-green-500'
              )} />
              <span className="text-xs font-semibold text-slate-200">
                {version === 'government' ? '政务级安全' : '企业级安全'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {version === 'government'
                ? '符合政府信息系统安全要求'
                : '所有数据加密且合规'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <Shield className={cn(
              "w-5 h-5",
              version === 'government' ? 'text-blue-400' : 'text-green-500'
            )} />
          </div>
        )}
      </div>
    </div>
  );
}
