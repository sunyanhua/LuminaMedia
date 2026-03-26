import { Home, BarChart, FileText, Settings, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  badge?: number;
}

interface MobileBottomNavProps {
  /**
   * 当前活动项ID
   */
  activeId?: string;
  /**
   * 导航项点击回调
   */
  onItemClick?: (id: string) => void;
  /**
   * 自定义导航项
   */
  items?: NavItem[];
  /**
   * 是否固定在底部
   * @default true
   */
  fixed?: boolean;
}

const defaultItems: NavItem[] = [
  {
    id: 'dashboard',
    label: '仪表盘',
    icon: <Home className="w-6 h-6" />,
    active: true,
  },
  {
    id: 'analytics',
    label: '分析',
    icon: <BarChart className="w-6 h-6" />,
    badge: 3,
  },
  {
    id: 'content',
    label: '内容',
    icon: <FileText className="w-6 h-6" />,
  },
  {
    id: 'messages',
    label: '消息',
    icon: <MessageSquare className="w-6 h-6" />,
    badge: 12,
  },
  {
    id: 'settings',
    label: '设置',
    icon: <Settings className="w-6 h-6" />,
  },
];

/**
 * 移动端底部导航栏组件
 *
 * 仿微信风格的底部导航栏，专为移动端优化：
 * - 固定底部，适合移动端操作
 * - 大触摸目标 (≥44×44px)
 * - 活动状态指示器
 * - 徽章通知
 * - 平滑过渡动画
 */
export function MobileBottomNav({
  activeId = 'dashboard',
  onItemClick,
  items = defaultItems,
  fixed = true,
}: MobileBottomNavProps) {
  return (
    <nav
      className={cn(
        'mobile-bottom-nav',
        fixed && 'fixed bottom-0 left-0 right-0',
        'bg-slate-900/95 backdrop-blur-lg',
        'border-t border-slate-800',
        'safe-area-inset-bottom' // iOS安全区域支持
      )}
      style={{
        // iOS安全区域填充
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            className={cn(
              'flex flex-col items-center justify-center',
              'flex-1 h-full',
              'touch-target', // 确保触摸目标足够大
              'relative',
              'transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500'
            )}
            onClick={() => onItemClick?.(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* 图标容器 */}
            <div className="relative">
              {item.icon}
              {/* 活动状态指示器 */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full" />
              )}
              {/* 徽章通知 */}
              {item.badge && (
                <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </div>
              )}
            </div>
            {/* 标签 */}
            <span
              className={cn(
                'text-xs mt-1 transition-colors',
                isActive ? 'text-amber-500 font-medium' : 'text-slate-400'
              )}
            >
              {item.label}
            </span>
            {/* 活动状态背景高亮 */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent rounded-t-lg -z-10" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

/**
 * 移动端侧边栏导航组件
 *
 * 用于汉堡菜单展开后的全屏侧边导航
 */
export function MobileSidebarNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-lg md:hidden"
      onClick={onClose}
    >
      <div
        className="absolute right-0 top-0 bottom-0 w-64 bg-slate-900 border-l border-slate-800 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-amber-500">导航菜单</h2>
            <button
              className="mobile-nav-toggle"
              onClick={onClose}
              aria-label="关闭菜单"
            >
              <X className="w-6 h-6 text-slate-300" />
            </button>
          </div>
          <div className="space-y-2">
            {defaultItems.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-slate-800 transition-colors text-left touch-target"
              >
                <div className="text-slate-400">{item.icon}</div>
                <span className="text-slate-300">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 导入X图标
import { X } from 'lucide-react';