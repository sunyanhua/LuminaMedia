import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '../../hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // 侧边栏宽度
  const sidebarWidthClass = sidebarCollapsed ? 'w-20' : 'w-64';

  // 移动端侧边栏抽屉状态
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 桌面端布局：固定侧边栏 + 固定头部 + 偏移内容区
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* 固定侧边栏 */}
        <div className={`fixed left-0 top-0 h-screen ${sidebarWidthClass} z-40 transition-all duration-300`}>
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* 固定头部 */}
        <div className={`fixed top-0 h-16 z-30 transition-all duration-300 ${sidebarCollapsed ? 'left-20 right-0' : 'left-64 right-0'}`}>
          <Header />
        </div>

        {/* 主内容区域 - 精确偏移避免重叠 */}
        <main className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} pt-16`}>
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>

          {/* 页脚 */}
          <footer className="border-t border-gray-800 p-4 md:p-6 text-center text-gray-500 text-sm bg-background-card">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <p>© 2026 灵曜智媒 - AI 驱动的自动化内容矩阵管理系统</p>
                <p className="mt-1 text-xs">Powered by Gemini AI & OpenClaw Automation</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                <span>版本: v2.0.0</span>
                <span>最后更新: 2026-03-18</span>
                <span className="text-green-400">系统状态: 正常</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    );
  }

  // 移动端布局：汉堡菜单 + 抽屉侧边栏 + 固定头部
  return (
    <div className="min-h-screen bg-background">
      {/* 固定头部 - 移动端 */}
      <header className="fixed top-0 left-0 right-0 h-16 z-30 bg-background-card/80 backdrop-blur-sm backdrop-saturate-150 border-b border-gray-800">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 border-r border-gray-800">
                <Sidebar
                  collapsed={false}
                  onToggleCollapse={() => {}}
                />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-white">灵曜智媒</h1>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-deep-blue-500 to-gold-400"></div>
        </div>
      </header>

      {/* 主内容区域 - 移动端 */}
      <main className="min-h-screen pt-16">
        <div className="p-4">
          <Outlet />
        </div>

        {/* 页脚 - 移动端 */}
        <footer className="border-t border-gray-800 p-4 text-center text-gray-500 text-sm">
          <p>© 2026 灵曜智媒</p>
          <p className="mt-1 text-xs">Powered by Gemini AI & OpenClaw Automation</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <span>版本: v2.0.0</span>
            <span className="text-green-400">正常</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;