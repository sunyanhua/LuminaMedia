import { Bell, Search, User, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  breadcrumbs: { label: string; active?: boolean }[];
  /**
   * 是否显示移动端菜单
   * @default false
   */
  showMobileMenu?: boolean;
  /**
   * 移动端菜单切换回调
   */
  onMobileMenuToggle?: (open: boolean) => void;
}

export function Header({
  breadcrumbs,
  showMobileMenu = false,
  onMobileMenuToggle
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(showMobileMenu);

  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMobileMenuToggle?.(newState);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 xs:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* 左侧：面包屑导航和移动端菜单按钮 */}
        <div className="flex items-center gap-4 flex-1">
          {/* 移动端菜单按钮 - 只在移动端显示 */}
          <button
            className="mobile-nav-toggle md:hidden touch-target"
            onClick={handleMobileMenuToggle}
            aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-300" />
            ) : (
              <Menu className="w-5 h-5 text-slate-300" />
            )}
          </button>

          {/* 面包屑导航 - 移动端隐藏部分内容 */}
          <nav className="flex items-center gap-2 text-sm overflow-hidden">
            {breadcrumbs.map((crumb, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2",
                  // 移动端只显示最后一个面包屑，桌面端显示全部
                  index < breadcrumbs.length - 1 && "hidden md:flex"
                )}
              >
                {index > 0 && <span className="text-slate-600">/</span>}
                <span
                  className={cn(
                    "truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none",
                    crumb.active ? 'text-amber-500 font-medium' : 'text-slate-400'
                  )}
                  title={crumb.label}
                >
                  {crumb.label}
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* 右侧：搜索框、通知、用户菜单 */}
        <div className="flex items-center gap-4">
          {/* 搜索框 - 移动端隐藏，平板端显示 */}
          <div className="hidden md:block relative w-48 lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="搜索..."
              className="pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-amber-500"
            />
          </div>

          {/* 移动端搜索按钮 - 代替搜索框 */}
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors touch-target">
            <Search className="w-5 h-5" />
          </button>

          {/* 通知按钮 - 移动端隐藏，桌面端显示 */}
          <button className="hidden md:flex relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors touch-target">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
          </button>

          {/* 用户菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 transition-colors touch-target">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-950" />
              </div>
              {/* 用户名 - 移动端隐藏，桌面端显示 */}
              <span className="hidden lg:inline text-sm text-slate-300">
                管理员
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-slate-900 border-slate-800 text-slate-200"
              align="end"
            >
              <DropdownMenuLabel>管理员账户</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800">
                个人设置
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800">
                安全设置
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 text-red-400">
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 移动端菜单面板 */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 mt-4 py-3 px-4 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors">
              <Search className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300">搜索</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300">通知</span>
              <span className="ml-auto w-2 h-2 bg-amber-500 rounded-full" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors">
              <User className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300">个人设置</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
