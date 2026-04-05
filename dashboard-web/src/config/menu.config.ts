// 菜单配置
export interface MenuItem {
  key: string;
  title: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  permissions?: string[];
  featureKey?: string; // 关联的功能键，用于功能开关控制
  tenantType?: 'all' | 'business' | 'government'; // 租户类型限制
}

// 动态菜单配置
export const MENU_CONFIG: MenuItem[] = [
  {
    key: 'dashboard',
    title: '仪表盘',
    icon: 'dashboard',
    path: '/business/dashboard',
  },
  {
    key: 'analytics',
    title: '数据统计',
    icon: 'analytics',
    path: '/business/analytics',
    featureKey: 'customer-analytics',
    tenantType: 'business',
  },
  {
    key: 'ai-strategy',
    title: 'AI智策中心',
    icon: 'ai',
    path: '/business/ai-strategy',
    featureKey: 'ai-strategy',
    tenantType: 'all',
  },
  {
    key: 'matrix',
    title: '新媒体矩阵',
    icon: 'matrix',
    path: '/business/matrix',
    featureKey: 'matrix-publish',
    tenantType: 'all',
  },
  {
    key: 'governance',
    title: '发稿审核',
    icon: 'governance',
    path: '/government/governance',
    featureKey: 'government-publish',
    tenantType: 'government',
  },
  {
    key: 'review',
    title: '审核工作台',
    icon: 'governance', // 使用相同的图标
    path: '/government/review',
    featureKey: 'government-publish',
    tenantType: 'government',
  },
  {
    key: 'smart-archive',
    title: '智慧档案',
    icon: 'analytics',
    path: '/government/smart-archive',
    featureKey: 'smart-archive',
    tenantType: 'government',
  },
  {
    key: 'wechat-mp',
    title: '公众号管理',
    icon: 'wechat', // 需要添加图标
    tenantType: 'government',
    children: [
      {
        key: 'wechat-account',
        title: '账号绑定',
        path: '/government/wechat-mp',
      },
      {
        key: 'content-list',
        title: '内容列表',
        path: '/government/content-list',
      },
      {
        key: 'wechat-dashboard',
        title: '数据看板',
        path: '/government/wechat-dashboard',
      },
    ],
  },
  {
    key: 'reference-info',
    title: '参考信息',
    icon: 'info', // 可能需要添加图标
    path: '/government/reference-info',
    featureKey: 'reference-info',
    tenantType: 'government',
  },
  {
    key: 'sentiment-analysis',
    title: '舆情监测',
    icon: 'sentiment',
    path: '/government/sentiment-analysis',
    featureKey: 'sentiment-analysis',
    tenantType: 'government',
  },
  {
    key: 'geo-analysis',
    title: 'GEO分析',
    icon: 'geo',
    path: '/government/geo-analysis',
    featureKey: 'geo-analysis',
    tenantType: 'government',
  },
  {
    key: 'demo',
    title: '演示中心',
    icon: 'demo',
    path: '/business/demo',
    tenantType: 'business',
  },
  {
    key: 'admin',
    title: '管理后台',
    icon: 'admin',
    children: [
      {
        key: 'feature-config',
        title: '功能配置',
        path: '/admin/feature-config',
      },
      {
        key: 'quota-management',
        title: '配额管理',
        path: '/admin/quota-management',
      },
      {
        key: 'tenant-feature',
        title: '租户功能管理',
        path: '/admin/tenant-feature',
      },
    ],
  },
];

// 根据当前租户类型和功能配置过滤菜单
export const getFilteredMenu = (
  menuItems: MenuItem[],
  tenantType: 'business' | 'government' | 'all',
  enabledFeatures: string[]
): MenuItem[] => {
  return menuItems.filter(item => {
    // 如果是管理后台，总是显示
    if (item.key === 'admin') return true;

    // 检查租户类型限制
    if (item.tenantType && item.tenantType !== 'all' && item.tenantType !== tenantType) {
      return false;
    }

    // 检查功能开关
    if (item.featureKey && !enabledFeatures.includes(item.featureKey)) {
      return false;
    }

    // 如果有子菜单，递归检查
    if (item.children && item.children.length > 0) {
      const filteredChildren = getFilteredMenu(item.children, tenantType, enabledFeatures);
      if (filteredChildren.length > 0) {
        // 如果子菜单中有可用项，返回带有过滤后子菜单的项
        item.children = filteredChildren;
        return true;
      }
      // 如果子菜单没有可用项，则整个菜单项不可见
      return false;
    }

    // 基本条件满足，返回true
    return true;
  });
};

// 获取默认路径
export const getDefaultPath = (tenantType: 'business' | 'government'): string => {
  return tenantType === 'business' ? '/business/dashboard' : '/government/dashboard';
};