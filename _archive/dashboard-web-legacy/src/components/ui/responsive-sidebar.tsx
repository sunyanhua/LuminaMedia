import { useState } from 'react';
import type { ReactNode } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from './sheet';
import { Button } from './button';
import { Menu } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ResponsiveSidebarProps {
  /** 侧边栏组件 */
  sidebar: ReactNode;
  /** 主内容区域 */
  children: ReactNode;
  /** 侧边栏折叠状态（桌面端） */
  collapsed?: boolean;
  /** 侧边栏折叠状态变化回调 */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** 移动端是否显示汉堡菜单，默认true */
  enableMobileMenu?: boolean;
  /** 移动端头部标题，默认"灵曜智媒" */
  mobileTitle?: string;
  /** 自定义移动端头部内容 */
  mobileHeader?: ReactNode;
}

/**
 * 响应式侧边栏包装器
 *
 * 提供桌面端和移动端的侧边栏显示逻辑：
 * - 桌面端：固定侧边栏，内容区域自动偏移
 * - 移动端：汉堡菜单按钮，点击打开抽屉式侧边栏
 *
 * 注意：侧边栏组件的折叠状态由父组件控制，本组件仅处理响应式布局
 */
export function ResponsiveSidebar({
  sidebar,
  children,
  collapsed = false,
  onCollapsedChange: _onCollapsedChange,
  enableMobileMenu = true,
  mobileTitle = '灵曜智媒',
  mobileHeader,
}: ResponsiveSidebarProps) {
  const isMobile = useIsMobile();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 桌面端布局：固定侧边栏 + 偏移内容区
  if (!isMobile) {
    const sidebarWidthClass = collapsed ? 'w-20' : 'w-64';
    const contentOffsetClass = collapsed ? 'ml-20' : 'ml-64';

    return (
      <div className="min-h-screen bg-background">
        {/* 固定侧边栏 */}
        <div className={cn('fixed left-0 top-0 h-screen z-40 transition-all duration-300', sidebarWidthClass)}>
          {sidebar}
        </div>

        {/* 主内容区域 */}
        <main className={cn('min-h-screen transition-all duration-300', contentOffsetClass)}>
          {children}
        </main>
      </div>
    );
  }

  // 移动端布局：汉堡菜单 + 抽屉侧边栏
  return (
    <div className="min-h-screen bg-background">
      {/* 移动端头部 */}
      {enableMobileMenu && (
        <header className="fixed top-0 left-0 right-0 h-16 z-30 bg-background-card/80 backdrop-blur-sm backdrop-saturate-150 border-b border-gray-800">
          {mobileHeader ? mobileHeader : (
            <div className="flex items-center justify-between h-full px-4">
              <div className="flex items-center gap-3">
                <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0 border-r border-gray-800">
                    {sidebar}
                  </SheetContent>
                </Sheet>
                <h1 className="text-lg font-bold text-white">{mobileTitle}</h1>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-deep-blue-500 to-gold-400"></div>
            </div>
          )}
        </header>
      )}

      {/* 主内容区域 */}
      <main className={cn('min-h-screen', enableMobileMenu ? 'pt-16' : '')}>
        {children}
      </main>
    </div>
  );
}