import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import App from '../App';

// 懒加载组件
const DashboardOverview = lazy(() => import('../components/dashboard/DashboardOverview'));
const RetailAnalytics = lazy(() => import('../components/analytics/RetailAnalytics'));
const MatrixControl = lazy(() => import('../components/matrix/MatrixControl'));
const AIStrategy = lazy(() => import('../components/ai/AIStrategy'));
const Governance = lazy(() => import('../components/governance/Governance'));
const DemoPage = lazy(() => import('../components/demo/DemoPage'));
const Login = lazy(() => import('../components/auth/Login'));

// 新版本组件
const BusinessLayout = lazy(() => import('../components/layout/BusinessLayout'));
const GovernmentLayout = lazy(() => import('../components/layout/GovernmentLayout'));
const VersionSelector = lazy(() => import('../components/landing/VersionSelector'));
const BusinessDashboard = lazy(() => import('../components/business/BusinessDashboard'));
const BusinessAnalytics = lazy(() => import('../components/business/BusinessAnalytics'));
const GovernmentDashboard = lazy(() => import('../components/government/GovernmentDashboard'));
const GovernmentGovernance = lazy(() => import('../components/government/GovernmentGovernance'));
const GovernmentPolicy = lazy(() => import('../components/government/GovernmentPolicy'));
const GovernmentAntiFraud = lazy(() => import('../components/government/GovernmentAntiFraud'));
const GovernmentEmergency = lazy(() => import('../components/government/GovernmentEmergency'));

// 管理页面组件
const FeatureConfigList = lazy(() => import('../pages/Admin/FeatureConfigList'));
const TenantFeatureList = lazy(() => import('../pages/Admin/TenantFeatureList'));
const QuotaOverview = lazy(() => import('../pages/Dashboard/QuotaOverview'));
const QuotaConfig = lazy(() => import('../pages/Admin/QuotaConfig'));

// 3.1 DEMO版新增页面
const KnowledgeBase = lazy(() => import('../pages/SmartArchive/KnowledgeBase'));
const ReferenceInfo = lazy(() => import('../pages/SmartArchive/ReferenceInfo'));
const WechatAccountBinding = lazy(() => import('../pages/WechatMp/WechatAccountBinding'));
const ContentConfirmation = lazy(() => import('../pages/WechatMp/ContentConfirmation'));
const ContentList = lazy(() => import('../pages/WechatMp/ContentList'));
const PublishQueue = lazy(() => import('../pages/Publish/PublishQueue'));
// 审核管理页面
const MyPendingReviews = lazy(() => import('../pages/Review/MyPendingReviews'));
// 微信公众号数据看板
const WechatDataDashboard = lazy(() => import('../pages/WechatMp/WechatDataDashboard'));
// 智能报告页面
const IntelligentReports = lazy(() => import('../pages/Reports/IntelligentReports'));

// 加载中组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
  </div>
);

// 页面守卫组件 - 检查是否已选择版本
const VersionGuard = ({ children }: { children: React.ReactNode }) => {
  // 客户端检查
  if (typeof window !== 'undefined') {
    const version = localStorage.getItem('lumina-demo-version');
    if (!version) {
      return <Navigate to="/" replace />;
    }
  }
  return <>{children}</>;
};

// 定义路由配置
export const router = createBrowserRouter([
  // 登录页
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  // 版本选择入口
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <VersionSelector />
      </Suspense>
    ),
  },
  // 旧版路由 - 重定向到版本选择
  {
    path: '/dashboard',
    element: <Navigate to="/business/dashboard" replace />,
  },
  {
    path: '/analytics',
    element: <Navigate to="/business/analytics" replace />,
  },
  {
    path: '/matrix',
    element: <Navigate to="/business/matrix" replace />,
  },
  {
    path: '/ai-strategy',
    element: <Navigate to="/business/ai-strategy" replace />,
  },
  {
    path: '/governance',
    element: <Navigate to="/government/governance" replace />,
  },
  {
    path: '/demo',
    element: <Navigate to="/business/demo" replace />,
  },
  // 商务版路由
  {
    path: '/business',
    element: (
      <VersionGuard>
        <Suspense fallback={<LoadingFallback />}>
          <BusinessLayout />
        </Suspense>
      </VersionGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/business/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <BusinessDashboard />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <BusinessAnalytics />
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
        path: 'matrix',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MatrixControl />
          </Suspense>
        ),
      },
      {
        path: 'demo',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DemoPage />
          </Suspense>
        ),
      },
    ],
  },
  // 政务版路由
  {
    path: '/government',
    element: (
      <VersionGuard>
        <Suspense fallback={<LoadingFallback />}>
          <GovernmentLayout />
        </Suspense>
      </VersionGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/government/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <GovernmentDashboard />
          </Suspense>
        ),
      },
      {
        path: 'governance',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <GovernmentGovernance />
          </Suspense>
        ),
      },
      {
        path: 'policy',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <GovernmentPolicy />
          </Suspense>
        ),
      },
      {
        path: 'anti-fraud',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <GovernmentAntiFraud />
          </Suspense>
        ),
      },
      {
        path: 'emergency',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <GovernmentEmergency />
          </Suspense>
        ),
      },
      {
        path: 'smart-archive',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <KnowledgeBase />
          </Suspense>
        ),
      },
      {
        path: 'reference-info',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ReferenceInfo />
          </Suspense>
        ),
      },
      {
        path: 'wechat-mp',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <WechatAccountBinding />
          </Suspense>
        ),
      },
      {
        path: 'content-confirm/:id?',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ContentConfirmation />
          </Suspense>
        ),
      },
      {
        path: 'content-list',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ContentList />
          </Suspense>
        ),
      },
      {
        path: 'review',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MyPendingReviews />
          </Suspense>
        ),
      },
      {
        path: 'publish-queue',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PublishQueue />
          </Suspense>
        ),
      },
      {
        path: 'wechat-dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <WechatDataDashboard />
          </Suspense>
        ),
      },
      {
        path: 'intelligent-reports',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <IntelligentReports />
          </Suspense>
        ),
      },
    ],
  },
  // 通配符路由 - 重定向到版本选择
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
  // 管理页面路由
  {
    path: '/admin',
    element: (
      <VersionGuard>
        <Suspense fallback={<LoadingFallback />}>
          <BusinessLayout />
        </Suspense>
      </VersionGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/feature-config" replace />,
      },
      {
        path: 'feature-config',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <FeatureConfigList />
          </Suspense>
        ),
      },
      {
        path: 'tenant-feature',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TenantFeatureList />
          </Suspense>
        ),
      },
      {
        path: 'quota-management',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <QuotaOverview />
          </Suspense>
        ),
      },
      {
        path: 'quota-config',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <QuotaConfig />
          </Suspense>
        ),
      },
    ],
  },
]);

// 路由路径常量，用于类型安全和代码引用
export const ROUTE_PATHS = {
  // 认证
  LOGIN: '/login',
  // 版本选择
  VERSION_SELECT: '/',
  // 商务版
  BUSINESS: '/business',
  BUSINESS_DASHBOARD: '/business/dashboard',
  BUSINESS_ANALYTICS: '/business/analytics',
  BUSINESS_AI_STRATEGY: '/business/ai-strategy',
  BUSINESS_MATRIX: '/business/matrix',
  BUSINESS_DEMO: '/business/demo',
  // 政务版
  GOVERNMENT: '/government',
  GOVERNMENT_DASHBOARD: '/government/dashboard',
  GOVERNMENT_GOVERNANCE: '/government/governance',
  GOVERNMENT_POLICY: '/government/policy',
  GOVERNMENT_ANTI_FRAUD: '/government/anti-fraud',
  GOVERNMENT_EMERGENCY: '/government/emergency',
  GOVERNMENT_SMART_ARCHIVE: '/government/smart-archive',
  GOVERNMENT_REFERENCE_INFO: '/government/reference-info',
  GOVERNMENT_WECHAT_MP: '/government/wechat-mp',
  GOVERNMENT_CONTENT_CONFIRM: '/government/content-confirm',
  GOVERNMENT_CONTENT_LIST: '/government/content-list',
  GOVERNMENT_REVIEW: '/government/review',
  GOVERNMENT_PUBLISH_QUEUE: '/government/publish-queue',
  GOVERNMENT_WECHAT_DASHBOARD: '/government/wechat-dashboard',
  GOVERNMENT_INTELLIGENT_REPORTS: '/government/intelligent-reports',
} as const;

// 页面标题映射
export const PAGE_TITLES: Record<string, string> = {
  // 商务版
  '/business/dashboard': '商务仪表盘',
  '/business/analytics': '数据统计分析',
  '/business/ai-strategy': 'AI智策中心',
  '/business/matrix': '新媒体矩阵',
  '/business/demo': '交互式演示中心',
  // 政务版
  '/government/dashboard': '政务仪表盘',
  '/government/governance': '发稿审核',
  '/government/policy': '政策解读',
  '/government/anti-fraud': '防诈骗宣传',
  '/government/emergency': '应急响应',
  '/government/smart-archive': '智慧档案',
  '/government/wechat-mp': '公众号管理',
  '/government/content-confirm': '内容确认',
  '/government/content-list': '内容列表',
  '/government/review': '审核工作台',
  '/government/publish-queue': '一键发布',
  '/government/wechat-dashboard': '公众号数据看板',
  '/government/intelligent-reports': '智能报告中心',
};
