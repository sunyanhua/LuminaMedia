import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Dashboard from '../components/Dashboard';
import AICenter from '../components/AICenter';
import MatrixWall from '../components/MatrixWall';

// Placeholder components
function CustomerDataPlaceholder() {
  return <div className="p-8">Customer Data Module - Under Development</div>;
}
function MarketingStrategyPlaceholder() {
  return <div className="p-8">Marketing Strategy Module - Under Development</div>;
}
function ContentGenerationPlaceholder() {
  return <div className="p-8">Content Generation Module - Under Development</div>;
}
function SettingsPlaceholder() {
  return <div className="p-8">Settings Module - Under Development</div>;
}
// Dashboard subpages
function DashboardOverview() {
  return <Dashboard />; // Reuse existing dashboard component
}
function RealTimeMonitor() {
  return <div className="p-8">Real-time Monitor - Under Development</div>;
}
function PerformanceMetrics() {
  return <div className="p-8">Performance Metrics - Under Development</div>;
}
function HistoricalData() {
  return <div className="p-8">Historical Data - Under Development</div>;
}
// AI Center subpages
function StrategyGeneration() {
  return <div className="p-8">Strategy Generation - Under Development</div>;
}
function SolutionOptimization() {
  return <div className="p-8">Solution Optimization - Under Development</div>;
}
function AIAnalysis() {
  return <div className="p-8">AI Analysis - Under Development</div>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <DashboardOverview />,
      },
      {
        path: 'dashboard/realtime',
        element: <RealTimeMonitor />,
      },
      {
        path: 'dashboard/performance',
        element: <PerformanceMetrics />,
      },
      {
        path: 'dashboard/history',
        element: <HistoricalData />,
      },
      {
        path: 'ai-center',
        element: <AICenter />,
      },
      {
        path: 'ai-center/strategy',
        element: <StrategyGeneration />,
      },
      {
        path: 'ai-center/optimization',
        element: <SolutionOptimization />,
      },
      {
        path: 'ai-center/analysis',
        element: <AIAnalysis />,
      },
      {
        path: 'matrix-wall',
        element: <MatrixWall />,
      },
      {
        path: 'customer-data',
        element: <CustomerDataPlaceholder />,
      },
      {
        path: 'customer-data/profiles',
        element: <CustomerDataPlaceholder />,
      },
      {
        path: 'customer-data/import',
        element: <CustomerDataPlaceholder />,
      },
      {
        path: 'customer-data/segments',
        element: <CustomerDataPlaceholder />,
      },
      {
        path: 'customer-data/quality',
        element: <CustomerDataPlaceholder />,
      },
      {
        path: 'marketing-strategy',
        element: <MarketingStrategyPlaceholder />,
      },
      {
        path: 'marketing-strategy/library',
        element: <MarketingStrategyPlaceholder />,
      },
      {
        path: 'marketing-strategy/campaigns',
        element: <MarketingStrategyPlaceholder />,
      },
      {
        path: 'marketing-strategy/competitor',
        element: <MarketingStrategyPlaceholder />,
      },
      {
        path: 'marketing-strategy/budget',
        element: <MarketingStrategyPlaceholder />,
      },
      {
        path: 'content-generation',
        element: <ContentGenerationPlaceholder />,
      },
      {
        path: 'content-generation/text',
        element: <ContentGenerationPlaceholder />,
      },
      {
        path: 'content-generation/platforms',
        element: <ContentGenerationPlaceholder />,
      },
      {
        path: 'content-generation/templates',
        element: <ContentGenerationPlaceholder />,
      },
      {
        path: 'content-generation/quality',
        element: <ContentGenerationPlaceholder />,
      },
      {
        path: 'settings',
        element: <SettingsPlaceholder />,
      },
      {
        path: 'settings/users',
        element: <SettingsPlaceholder />,
      },
      {
        path: 'settings/api',
        element: <SettingsPlaceholder />,
      },
      {
        path: 'settings/notifications',
        element: <SettingsPlaceholder />,
      },
      {
        path: 'settings/logs',
        element: <SettingsPlaceholder />,
      },
    ],
  },
]);

// Menu configuration
export interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: '数智洞察看板',
    icon: 'BarChart3',
    children: [
      { id: 'dashboard-overview', label: '数据概览', path: '/dashboard' },
      { id: 'real-time-monitor', label: '实时监控', path: '/dashboard/realtime' },
      { id: 'performance-metrics', label: '性能指标', path: '/dashboard/performance' },
      { id: 'historical-data', label: '历史数据', path: '/dashboard/history' },
    ],
  },
  {
    id: 'customer-data',
    label: '客户数据管理',
    icon: 'Users',
    children: [
      { id: 'customer-profiles', label: '客户档案', path: '/customer-data/profiles' },
      { id: 'data-import', label: '数据导入', path: '/customer-data/import' },
      { id: 'customer-segments', label: '客户分群', path: '/customer-data/segments' },
      { id: 'data-quality', label: '数据质量', path: '/customer-data/quality' },
    ],
  },
  {
    id: 'ai-center',
    label: 'AI智策中心',
    icon: 'Brain',
    children: [
      { id: 'strategy-generation', label: '策略生成', path: '/ai-center/strategy' },
      { id: 'solution-optimization', label: '方案优化', path: '/ai-center/optimization' },
      { id: 'ai-analysis', label: 'AI分析', path: '/ai-center/analysis' },
      { id: 'matrix-wall', label: '矩阵管理', path: '/matrix-wall' },
    ],
  },
  {
    id: 'marketing-strategy',
    label: '营销策略规划',
    icon: 'Target',
    children: [
      { id: 'strategy-library', label: '策略库', path: '/marketing-strategy/library' },
      { id: 'campaign-planning', label: '活动策划', path: '/marketing-strategy/campaigns' },
      { id: 'competitor-analysis', label: '竞品分析', path: '/marketing-strategy/competitor' },
      { id: 'budget-planning', label: '预算规划', path: '/marketing-strategy/budget' },
    ],
  },
  {
    id: 'content-generation',
    label: '内容生成工厂',
    icon: 'FileText',
    children: [
      { id: 'text-generation', label: '文案生成', path: '/content-generation/text' },
      { id: 'multi-platform', label: '多平台适配', path: '/content-generation/platforms' },
      { id: 'content-templates', label: '内容模板', path: '/content-generation/templates' },
      { id: 'quality-review', label: '质量审核', path: '/content-generation/quality' },
    ],
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: 'Settings',
    children: [
      { id: 'user-management', label: '用户管理', path: '/settings/users' },
      { id: 'api-integration', label: 'API集成', path: '/settings/api' },
      { id: 'notification-settings', label: '通知设置', path: '/settings/notifications' },
      { id: 'system-logs', label: '系统日志', path: '/settings/logs' },
    ],
  },
];