import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Brain,
  Globe,
  Users,
  Target,
  FileText,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  Upload,
  PieChart,
  CheckSquare,
  DollarSign,
  Eye,
  MessageSquare,
  Smartphone,
  FileCode,
  Shield,
  Bell,
  Zap,
  LayoutGrid,
} from 'lucide-react';
import { menuItems } from '../../routes/index';
import type { MenuItem } from '../../routes/index';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// 图标映射
const iconMap: Record<string, React.ComponentType<any>> = {
  BarChart3,
  Brain,
  Globe,
  Users,
  Target,
  FileText,
  TrendingUp,
  Settings,
  Home,
  User,
  Upload,
  PieChart,
  CheckSquare,
  DollarSign,
  Eye,
  MessageSquare,
  Smartphone,
  FileCode,
  Shield,
  Bell,
  Zap,
  LayoutGrid,
};

// 子菜单项图标映射
const childIconMap: Record<string, React.ComponentType<any>> = {
  'dashboard-overview': BarChart3,
  'real-time-monitor': Eye,
  'performance-metrics': TrendingUp,
  'historical-data': BarChart3,
  'customer-profiles': User,
  'data-import': Upload,
  'customer-segments': PieChart,
  'data-quality': CheckSquare,
  'strategy-generation': Brain,
  'solution-optimization': Zap,
  'ai-analysis': Brain,
  'strategy-library': FileCode,
  'campaign-planning': Target,
  'competitor-analysis': Eye,
  'budget-planning': DollarSign,
  'text-generation': MessageSquare,
  'multi-platform': Smartphone,
  'content-templates': FileText,
  'quality-review': Shield,
  'performance-dashboard': BarChart3,
  'roi-analysis': DollarSign,
  'audience-insights': Users,
  'competitive-intelligence': Eye,
  'user-management': User,
  'api-integration': Zap,
  'notification-settings': Bell,
  'system-logs': FileCode,
};

const SidebarComponent = ({ collapsed, onToggleCollapse }: SidebarProps) => {
  // 获取shadcn/ui侧边栏状态（未使用但保留以访问上下文）
  // 注释掉未使用的useSidebar调用，因为它要求SidebarProvider作为祖先
  // const { isMobile: _isMobile, state: _state } = useSidebar?.() || { isMobile: false, state: 'expanded' as const };

  // 简化图标映射 - 只映射需要的图标
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return BarChart3;
    return iconMap[iconName] || BarChart3;
  };

  // 渲染菜单项
  const renderMenuItem = (item: MenuItem) => {
    const Icon = getIconComponent(item.icon);

    if (item.children && item.children.length > 0) {
      // 有子菜单的项
      return (
        <SidebarGroup key={item.id}>
          <SidebarGroupLabel className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-sidebar-foreground/70">
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </SidebarGroupLabel>
          <div className="mt-1 space-y-0.5">
            {item.children.map((child) => {
              const ChildIcon = childIconMap[child.id] || FileText;
              return (
                <NavLink
                  key={child.id}
                  to={child.path || '#'}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-md",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}>
                      <ChildIcon className="h-3.5 w-3.5" />
                      <span>{child.label}</span>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </SidebarGroup>
      );
    }

    // 没有子菜单的项
    return (
      <NavLink
        key={item.id}
        to={item.path || '#'}
        className={({ isActive }) =>
          cn(
            "block rounded-md",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
          )
        }
      >
        {({ isActive }) => (
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          )}>
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </div>
        )}
      </NavLink>
    );
  };

  // 转换collapsed为open（shadcn/ui使用open状态）
  const open = !collapsed;

  // 处理折叠状态变化
  const handleOpenChange = (newOpen: boolean) => {
    // 如果状态变化，调用onToggleCollapse
    if (newOpen !== open) {
      onToggleCollapse();
    }
  };

  return (
    <ShadcnSidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-sidebar-border"
    >
        {/* 侧边栏头部 - Logo和品牌 */}
        <SidebarHeader className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-deep-blue-600 to-gold-500 flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-white leading-tight">灵曜智媒</h2>
                <p className="text-xs text-sidebar-foreground/70">AI 驱动</p>
              </div>
            </div>
            {/* 折叠按钮 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="p-1 text-sidebar-foreground/70 hover:text-white rounded-lg hover:bg-sidebar-accent h-8 w-8"
            >
              {open ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </SidebarHeader>

        {/* 侧边栏内容 - 菜单 */}
        <SidebarContent className="px-2 py-4">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                {renderMenuItem(item)}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          {/* 演示快捷入口 */}
          {open && (
            <div className="mt-6 px-3">
              <div className="rounded-lg bg-gradient-to-r from-deep-blue-900/50 to-transparent border border-deep-blue-800 p-4">
                <div className="flex items-center mb-2">
                  <Zap className="h-4 w-4 text-gold-400 mr-2" />
                  <span className="text-sm font-medium text-white">一键演示</span>
                </div>
                <p className="text-xs text-sidebar-foreground/70 mb-3">快速体验完整营销流程</p>
                <Button
                  variant="default"
                  className="w-full py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  启动演示
                </Button>
              </div>
            </div>
          )}
        </SidebarContent>

        {/* 侧边栏底部 - 用户信息 */}
        {open && (
          <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-deep-blue-500 to-gold-400"></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">管理员</p>
                <p className="text-xs text-sidebar-foreground/70">admin@lingyao.com</p>
              </div>
            </div>
          </SidebarFooter>
        )}
    </ShadcnSidebar>
  );
};

export default SidebarComponent;