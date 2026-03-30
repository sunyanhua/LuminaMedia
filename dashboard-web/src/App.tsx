import './App.css';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Outlet, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const breadcrumbMap: Record<string, { label: string; active?: boolean }[]> = {
      '/dashboard': [
        { label: '灵曜智媒' },
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
      '/': [
        { label: '灵曜智媒' },
        { label: '仪表盘', active: true },
      ],
    };

    return breadcrumbMap[location.pathname] || [{ label: '灵曜智媒' }];
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header breadcrumbs={getBreadcrumbs()} />

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


export default App;
