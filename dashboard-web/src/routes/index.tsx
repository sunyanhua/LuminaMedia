import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { RetailAnalytics } from '../components/analytics/RetailAnalytics';
import { MatrixControl } from '../components/matrix/MatrixControl';
import { AIStrategy } from '../components/ai/AIStrategy';
import { Governance } from '../components/governance/Governance';

// 定义路由配置
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <DashboardOverview />,
      },
      {
        path: 'dashboard',
        element: <DashboardOverview />,
      },
      {
        path: 'analytics',
        element: <RetailAnalytics />,
      },
      {
        path: 'matrix',
        element: <MatrixControl />,
      },
      {
        path: 'ai-strategy',
        element: <AIStrategy />,
      },
      {
        path: 'governance',
        element: <Governance />,
      },
    ],
  },
]);

// 路由路径常量，用于类型安全和代码引用
export const ROUTE_PATHS = {
  DASHBOARD: '/dashboard',
  ANALYTICS: '/analytics',
  MATRIX: '/matrix',
  AI_STRATEGY: '/ai-strategy',
  GOVERNANCE: '/governance',
} as const;

// 页面标题映射
export const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/analytics': '数据统计分析',
  '/matrix': '新媒体矩阵',
  '/ai-strategy': 'AI智策中心',
  '/governance': '发稿审核',
};