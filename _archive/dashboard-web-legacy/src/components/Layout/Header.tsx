import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Settings, HelpCircle, Sun, Moon, Grid } from 'lucide-react';
import { menuItems } from '../../routes/index';
import { Button } from '@/components/ui/button';

const Header = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 获取当前页面标题
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;

    // 扁平化所有菜单项查找当前路径
    const flattenMenuItems = (items: typeof menuItems) => {
      const flatItems: any[] = [];
      items.forEach(item => {
        if (item.path && item.path === currentPath) {
          flatItems.push(item);
        }
        if (item.children) {
          item.children.forEach(child => {
            if (child.path === currentPath) {
              flatItems.push(child);
            }
          });
        }
      });
      return flatItems;
    };

    const currentItems = flattenMenuItems(menuItems);
    if (currentItems.length > 0) {
      return currentItems[0].label;
    }

    // 默认标题
    if (currentPath === '/') return '数智洞察看板';
    if (currentPath.includes('dashboard')) return '数智洞察看板';
    if (currentPath.includes('ai-center')) return 'AI智策中心';
    if (currentPath.includes('matrix-wall')) return '矩阵管理墙';

    return '灵曜智媒';
  };

  // 获取面包屑导航
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [{ label: '首页', path: '/' }];

    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;

      // 在菜单中查找匹配项
      let foundLabel = segment.charAt(0).toUpperCase() + segment.slice(1);

      menuItems.forEach(item => {
        if (item.path === currentPath) {
          foundLabel = item.label;
        }
        if (item.children) {
          item.children.forEach(child => {
            if (child.path === currentPath) {
              foundLabel = child.label;
            }
          });
        }
      });

      breadcrumbs.push({ label: foundLabel, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="z-30 bg-background-card/80 backdrop-blur-sm backdrop-saturate-150 border-b border-gray-800">
      <div className="px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* 左侧：页面标题和面包屑 */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{getCurrentPageTitle()}</h1>
            <div className="flex items-center text-sm text-gray-400">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  <a
                    href={crumb.path}
                    className="hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </a>
                </div>
              ))}
              <span className="ml-4 text-xs px-2 py-1 bg-deep-blue-900/50 text-deep-blue-300 rounded">
                {darkMode ? '深色模式' : '浅色模式'}
              </span>
            </div>
          </div>

          {/* 右侧：搜索和操作按钮 */}
          <div className="flex items-center space-x-3">
            {/* 搜索框 */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="搜索仪表板、报告、客户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm w-64 focus:outline-none focus:border-gold-500 text-white placeholder-gray-500"
              />
            </div>

            {/* 快捷操作按钮 */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors h-10 w-10"
                title="快速操作"
              >
                <Grid size={20} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative h-10 w-10"
                title="通知"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors h-10 w-10"
                title="帮助"
              >
                <HelpCircle size={20} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors h-10 w-10"
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? '切换浅色模式' : '切换深色模式'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors h-10 w-10"
                title="设置"
              >
                <Settings size={20} />
              </Button>

              {/* 用户头像 */}
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-deep-blue-500 to-gold-400 cursor-pointer hover:opacity-90 transition-opacity"></div>
            </div>
          </div>
        </div>

        {/* 快捷操作栏 */}
        <div className="mt-4 flex items-center space-x-4 overflow-x-auto pb-2">
          <Button
            variant="default"
            className="px-4 py-2 bg-gradient-to-r from-deep-blue-600 to-deep-blue-700 hover:from-deep-blue-700 hover:to-deep-blue-800 text-white text-sm font-medium rounded-lg transition-all whitespace-nowrap"
          >
            新建客户档案
          </Button>
          <Button
            variant="default"
            className="px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white text-sm font-medium rounded-lg transition-all whitespace-nowrap"
          >
            启动AI分析
          </Button>
          <Button
            variant="default"
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-medium rounded-lg transition-all whitespace-nowrap"
          >
            生成营销内容
          </Button>
          <Button
            variant="default"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-medium rounded-lg transition-all whitespace-nowrap"
          >
            查看报告
          </Button>
          <Button
            variant="outline"
            className="px-4 py-2 border border-gray-700 hover:border-gold-500 text-gray-300 hover:text-white text-sm font-medium rounded-lg transition-all whitespace-nowrap"
          >
            演示模式
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;