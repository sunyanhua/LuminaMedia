import './App.css';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Outlet, useLocation } from 'react-router-dom';
import DemoBanner from './components/DemoBanner';
import QuotaDisplay from './components/QuotaDisplay';

function App() {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const breadcrumbMap: Record<string, { label: string; active?: boolean }[]> = {
      '/dashboard': [
        { label: '灵曜智媒 [Lumina Nexus V1.0]' },
        { label: '仪表盘', active: true },
      ],
      '/analytics': [
        { label: '灵曜智媒' },
        { label: '数据统计分析', active: true },
      ],
      '/ai-strategy': [
        { label: '灵曜智媒' },
        { label: 'AI智策中心', active: true },
      ],
      '/matrix': [
        { label: '灵曜智媒' },
        { label: '新媒体矩阵', active: true },
      ],
      '/governance': [
        { label: '灵曜智媒' },
        { label: '发稿审核', active: true },
      ],
      '/demo': [
        { label: '灵曜智媒' },
        { label: '交互式演示中心', active: true },
      ],
      '/admin/feature-config': [
        { label: '灵曜智媒' },
        { label: '管理后台', active: false },
        { label: '功能配置管理', active: true },
      ],
      '/admin/tenant-feature': [
        { label: '灵曜智媒' },
        { label: '管理后台', active: false },
        { label: '租户功能管理', active: true },
      ],
      '/admin/quota-management': [
        { label: '灵曜智媒' },
        { label: '管理后台', active: false },
        { label: '配额使用情况', active: true },
      ],
      '/admin/quota-config': [
        { label: '灵曜智媒' },
        { label: '管理后台', active: false },
        { label: '配额配置', active: true },
      ],
      '/': [
        { label: '灵曜智媒' },
        { label: '仪表盘', active: true },
      ],
    };

    return breadcrumbMap[location.pathname] || [{ label: '灵曜智媒' }];
  };

  // 检查是否为管理页面，不显示横幅和配额
  const isAdminPage = location.pathname.startsWith('/admin');
  const isVersionSelector = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden flex-col">
      {!isVersionSelector && !isLoginPage && (
        <DemoBanner />
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header breadcrumbs={getBreadcrumbs()} />

          <div className="flex flex-1 overflow-auto">
            <main className="flex-1 overflow-auto p-6">
              <Outlet />
            </main>

            {!isAdminPage && !isVersionSelector && !isLoginPage && (
              <div className="w-64 p-4 hidden lg:block border-l border-slate-800 bg-slate-900/50">
                <QuotaDisplay />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default App;
