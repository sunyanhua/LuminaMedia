/**
 * 组件预加载工具
 * 用于在用户 hover 或点击前提前加载页面组件
 */

// 组件导入映射表 - 政务版
const componentImports: Record<string, () => Promise<any>> = {
  // 政务版核心页面
  '/government/dashboard': () => import('../components/government/GovernmentDashboard'),
  '/government/smart-archive': () => import('../pages/SmartArchive/KnowledgeBase'),
  '/government/tenant-profile': () => import('../pages/SmartArchive/TenantProfile'),
  '/government/reference-info': () => import('../pages/SmartArchive/ReferenceInfo'),
  '/government/sentiment-monitor': () => import('../pages/Sentiment/SentimentMonitor'),
  '/government/wechat-mp': () => import('../pages/WechatMp/WechatAccountBinding'),
  '/government/topic-selection': () => import('../pages/WechatMp/TopicSelection'),
  '/government/content-list': () => import('../pages/WechatMp/ContentList'),
  '/government/publish-queue': () => import('../pages/Publish/PublishQueue'),
  '/government/wechat-dashboard': () => import('../pages/WechatMp/WechatDataDashboard'),
  '/government/review': () => import('../pages/Review/MyPendingReviews'),
  '/government/intelligent-reports': () => import('../pages/Reports/IntelligentReports'),
  // 商务版
  '/business/dashboard': () => import('../components/business/BusinessDashboard'),
  '/business/analytics': () => import('../components/business/BusinessAnalytics'),
};

// 已预加载的组件缓存
const preloadedComponents = new Set<string>();

/**
 * 预加载指定路径的组件
 * @param path 路由路径
 */
export function preloadComponent(path: string): void {
  if (preloadedComponents.has(path)) return;

  const importer = componentImports[path];
  if (!importer) return;

  // 使用 requestIdleCallback 在浏览器空闲时加载
  const doPreload = () => {
    importer()
      .then(() => {
        preloadedComponents.add(path);
        console.log('[Preload] 组件已预加载:', path);
      })
      .catch(() => {
        // 预加载失败不影响用户体验
      });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(doPreload, { timeout: 2000 });
  } else {
    // 降级使用 setTimeout
    setTimeout(doPreload, 100);
  }
}

/**
 * 批量预加载多个组件
 * @param paths 路由路径数组
 */
export function preloadComponents(paths: string[]): void {
  paths.forEach((path, index) => {
    // 错开加载时间，避免同时请求
    setTimeout(() => preloadComponent(path), index * 100);
  });
}

/**
 * 根据当前版本预加载所有菜单页面
 * @param version 'business' | 'government'
 * @deprecated 预加载所有页面会导致首屏加载极慢，已禁用
 */
export function preloadAllMenuPages(_version: 'business' | 'government'): void {
  // 禁用全量预加载 - 改为按需懒加载
  // 仅在用户hover菜单项时触发单组件预加载
  console.log('[Preload] 全量预加载已禁用，改为按需加载');
}

/**
 * 检查组件是否已预加载
 * @param path 路由路径
 */
export function isComponentPreloaded(path: string): boolean {
  return preloadedComponents.has(path);
}
