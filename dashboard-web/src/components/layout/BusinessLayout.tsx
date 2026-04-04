
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useSetDemoVersion } from '@/store/useAppStore';
import DemoBanner from '@/components/DemoBanner';
import QuotaDisplay from '@/components/QuotaDisplay';

function BusinessLayout() {
  const location = useLocation();
  const setDemoVersion = useSetDemoVersion();

  // 设置当前版本为商务版
  useEffect(() => {
    setDemoVersion('business');
  }, [setDemoVersion]);

  const getBreadcrumbs = () => {
    const breadcrumbMap: Record<string, { label: string; active?: boolean }[]> = {
      '/business/dashboard': [
        { label: '灵曜智媒' },
        { label: '商务版', active: true },
        { label: '仪表盘' },
      ],
      '/business/analytics': [
        { label: '灵曜智媒' },
        { label: '商务版' },
        { label: '数据统计分析', active: true },
      ],
      '/business/ai-strategy': [
        { label: '灵曜智媒' },
        { label: '商务版' },
        { label: 'AI智策中心', active: true },
      ],
      '/business/matrix': [
        { label: '灵曜智媒' },
        { label: '商务版' },
        { label: '新媒体矩阵', active: true },
      ],
      '/business/demo': [
        { label: '灵曜智媒' },
        { label: '商务版' },
        { label: '交互式演示中心', active: true },
      ],
    };

    return breadcrumbMap[location.pathname] || [{ label: '灵曜智媒' }, { label: '商务版', active: true }];
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden flex-col">
      <DemoBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header breadcrumbs={getBreadcrumbs()} />
          <div className="flex flex-1 overflow-auto">
            <main className="flex-1 p-6">
              <Outlet />
            </main>
            <div className="w-64 p-4 hidden lg:block border-l border-slate-800 bg-slate-900/50">
              <QuotaDisplay />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessLayout;
