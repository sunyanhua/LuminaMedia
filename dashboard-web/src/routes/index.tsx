import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import App from '../App';

// 懒加载组件
const DashboardOverview = lazy(() => import('../components/dashboard/DashboardOverview'));
const RetailAnalytics = lazy(() => import('../components/analytics/RetailAnalytics'));
const MatrixControl = lazy(() => import('../components/matrix/MatrixControl'));
const AIStrategy = lazy(() => import('../components/ai/AIStrategy'));
const Governance = lazy(() => import('../components/governance/Governance'));

// 加载中组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
  </div>
);

// 定义路由配置
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardOverview />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardOverview />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RetailAnalytics />
          </Suspense>
        ),
      },
      {
        path: 'matrix',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MatrixControl />
          </Suspense>
        ),
      },
      {
        path: 'ai-strategy',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AIStrategy />
          </Suspense>
        ),
      },
      {
        path: 'governance',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Governance />
          </Suspense>
        ),
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