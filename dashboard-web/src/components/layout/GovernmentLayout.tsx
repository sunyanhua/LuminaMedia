import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useSetDemoVersion } from '@/store/useAppStore';
import DemoBanner from '@/components/DemoBanner';
import QuotaDisplay from '@/components/QuotaDisplay';

function GovernmentLayout() {
  const location = useLocation();
  const setDemoVersion = useSetDemoVersion();

  // 设置当前版本为政务版
  useEffect(() => {
    setDemoVersion('government');
  }, [setDemoVersion]);

  const getBreadcrumbs = () => {
    const breadcrumbMap: Record<string, { label: string; active?: boolean }[]> = {
      '/government/dashboard': [
        { label: '灵曜智媒' },
        { label: '政务版', active: true },
        { label: '仪表盘' },
      ],
      '/government/governance': [
        { label: '灵曜智媒' },
        { label: '政务版' },
        { label: '发稿审核', active: true },
      ],
      '/government/policy': [
        { label: '灵曜智媒' },
        { label: '政务版' },
        { label: '政策解读', active: true },
      ],
      '/government/anti-fraud': [
        { label: '灵曜智媒' },
        { label: '政务版' },
        { label: '防诈骗宣传', active: true },
      ],
      '/government/emergency': [
        { label: '灵曜智媒' },
        { label: '政务版' },
        { label: '应急响应', active: true },
      ],
      '/government/smart-archive': [
        { label: '灵曜智媒' },
        { label: '政务版' },
        { label: '智慧档案', active: true },
      ],
    };

    return breadcrumbMap[location.pathname] || [{ label: '灵曜智媒' }, { label: '政务版', active: true }];
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

export default GovernmentLayout;
