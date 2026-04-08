import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import App from '../App';

// 懒加载组件 - 使用 webpackChunkName 实现更好的代码分割
const DashboardOverview = lazy(() => import(/* webpackChunkName: "dashboard" */ '../components/dashboard/DashboardOverview'));
const RetailAnalytics = lazy(() => import(/* webpackChunkName: "analytics" */ '../components/analytics/RetailAnalytics'));
const MatrixControl = lazy(() => import(/* webpackChunkName: "matrix" */ '../components/matrix/MatrixControl'));
const AIStrategy = lazy(() => import(/* webpackChunkName: "ai" */ '../components/ai/AIStrategy'));
const Governance = lazy(() => import(/* webpackChunkName: "governance" */ '../components/governance/Governance'));
const DemoPage = lazy(() => import(/* webpackChunkName: "demo" */ '../components/demo/DemoPage'));
const Login = lazy(() => import(/* webpackChunkName: "auth" */ '../components/auth/Login'));

// 布局组件
const BusinessLayout = lazy(() => import(/* webpackChunkName: "layout" */ '../components/layout/BusinessLayout'));
const GovernmentLayout = lazy(() => import(/* webpackChunkName: "layout" */ '../components/layout/GovernmentLayout'));
const VersionSelector = lazy(() => import(/* webpackChunkName: "landing" */ '../components/landing/VersionSelector'));

// 商务版页面
const BusinessDashboard = lazy(() => import(/* webpackChunkName: "business" */ '../components/business/BusinessDashboard'));
const BusinessAnalytics = lazy(() => import(/* webpackChunkName: "business" */ '../components/business/BusinessAnalytics'));

// 政务版页面
const GovernmentDashboard = lazy(() => import(/* webpackChunkName: "government" */ '../components/government/GovernmentDashboard'));
const GovernmentGovernance = lazy(() => import(/* webpackChunkName: "government" */ '../components/government/GovernmentGovernance'));
const GovernmentPolicy = lazy(() => import(/* webpackChunkName: "government" */ '../components/government/GovernmentPolicy'));
const GovernmentAntiFraud = lazy(() => import(/* webpackChunkName: "government" */ '../components/government/GovernmentAntiFraud'));
const GovernmentEmergency = lazy(() => import(/* webpackChunkName: "government" */ '../components/government/GovernmentEmergency'));

// 管理页面组件
const FeatureConfigList = lazy(() => import(/* webpackChunkName: "admin" */ '../pages/Admin/FeatureConfigList'));
const TenantFeatureList = lazy(() => import(/* webpackChunkName: "admin" */ '../pages/Admin/TenantFeatureList'));
const QuotaOverview = lazy(() => import(/* webpackChunkName: "admin" */ '../pages/Dashboard/QuotaOverview'));
const QuotaConfig = lazy(() => import(/* webpackChunkName: "admin" */ '../pages/Admin/QuotaConfig'));

// 3.1 DEMO版新增页面
const KnowledgeBase = lazy(() => import(/* webpackChunkName: "smart-archive" */ '../pages/SmartArchive/KnowledgeBase'));
const ReferenceInfo = lazy(() => import(/* webpackChunkName: "smart-archive" */ '../pages/SmartArchive/ReferenceInfo'));
const WechatAccountBinding = lazy(() => import(/* webpackChunkName: "wechat" */ '../pages/WechatMp/WechatAccountBinding'));
const TopicSelection = lazy(() => import(/* webpackChunkName: "wechat" */ '../pages/WechatMp/TopicSelection'));
const MaterialSupplement = lazy(() => import(/* webpackChunkName: "wechat" */ '../pages/WechatMp/MaterialSupplement'));
const ContentConfirmation = lazy(() => import(/* webpackChunkName: "wechat" */ '../pages/WechatMp/ContentConfirmation'));
const ContentList = lazy(() => import(/* webpackChunkName: "wechat" */ '../pages/WechatMp/ContentList'));
const PublishQueue = lazy(() => import(/* webpackChunkName: "publish" */ '../pages/Publish/PublishQueue'));
// 审核管理页面
const MyPendingReviews = lazy(() => import(/* webpackChunkName: "review" */ '../pages/Review/MyPendingReviews'));
// 微信公众号数据看板
const WechatDataDashboard = lazy(() => import(/* webpackChunkName: "wechat-dashboard" */ '../pages/WechatMp/WechatDataDashboard'));
// 智能报告页面
const IntelligentReports = lazy(() => import(/* webpackChunkName: "reports" */ '../pages/Reports/IntelligentReports'));
// 舆情监测页面
const SentimentMonitor = lazy(() => import(/* webpackChunkName: "sentiment" */ '../pages/Sentiment/SentimentMonitor'));

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
    const version = localStorage.getItem('lumina-version');
    if (!version) {
      return <Navigate to="/" replace />;
    }
  }
  return <>{children}</>;
};

// 登录守卫组件 - 检查是否已登录
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  // 客户端检查
  if (typeof window !== 'undefined') {
    const isAuthenticated = localStorage.getItem('lumina-auth') === 'true';
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
  }
  return <>{children}</>;
};

// 已登录用户重定向 - 已登录用户访问登录页时重定向到首页
const AuthenticatedRedirect = ({ children }: { children: React.ReactNode }) => {
  if (typeof window !== 'undefined') {
    const isAuthenticated = localStorage.getItem('lumina-auth') === 'true';
    if (isAuthenticated) {
      const version = localStorage.getItem('lumina-version');
      if (version === 'government') {
        return <Navigate to="/government/dashboard" replace />;
      } else if (version === 'business') {
        return <Navigate to="/business/dashboard" replace />;
      }
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
      <AuthenticatedRedirect>
        <Suspense fallback={<LoadingFallback />}>
          <Login />
        </Suspense>
      </AuthenticatedRedirect>
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
      <AuthGuard>
        <VersionGuard>
          <Suspense fallback={<LoadingFallback />}>
            <BusinessLayout />
          </Suspense>
        </VersionGuard>
      </AuthGuard>
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
      <AuthGuard>
        <VersionGuard>
          <Suspense fallback={<LoadingFallback />}>
            <GovernmentLayout />
          </Suspense>
        </VersionGuard>
      </AuthGuard>
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
        path: 'topic-selection',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TopicSelection />
          </Suspense>
        ),
      },
      {
        path: 'material-supplement/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MaterialSupplement />
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
      {
        path: 'sentiment-monitor',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SentimentMonitor />
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
      <AuthGuard>
        <VersionGuard>
          <Suspense fallback={<LoadingFallback />}>
            <BusinessLayout />
          </Suspense>
        </VersionGuard>
      </AuthGuard>
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
  GOVERNMENT_TOPIC_SELECTION: '/government/topic-selection',
  GOVERNMENT_MATERIAL_SUPPLEMENT: '/government/material-supplement',
  GOVERNMENT_CONTENT_CONFIRM: '/government/content-confirm',
  GOVERNMENT_CONTENT_LIST: '/government/content-list',
  GOVERNMENT_REVIEW: '/government/review',
  GOVERNMENT_PUBLISH_QUEUE: '/government/publish-queue',
  GOVERNMENT_WECHAT_DASHBOARD: '/government/wechat-dashboard',
  GOVERNMENT_INTELLIGENT_REPORTS: '/government/intelligent-reports',
  GOVERNMENT_SENTIMENT_MONITOR: '/government/sentiment-monitor',
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
  '/government/topic-selection': '选题策划',
  '/government/material-supplement': '资料补充',
  '/government/content-confirm': '内容确认',
  '/government/content-list': '内容列表',
  '/government/review': '审核工作台',
  '/government/publish-queue': '一键发布',
  '/government/wechat-dashboard': '公众号数据看板',
  '/government/intelligent-reports': '智能报告中心',
  '/government/sentiment-monitor': '舆情监测',
};
