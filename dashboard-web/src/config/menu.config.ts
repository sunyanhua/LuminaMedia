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
  // ==================== 商务版菜单 ====================
  {
    key: 'dashboard',
    title: '仪表盘',
    icon: 'dashboard',
    path: '/business/dashboard',
    tenantType: 'business',
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
    tenantType: 'business',
  },
  {
    key: 'matrix',
    title: '新媒体矩阵',
    icon: 'matrix',
    path: '/business/matrix',
    featureKey: 'matrix-publish',
    tenantType: 'business',
  },
  {
    key: 'demo',
    title: '演示中心',
    icon: 'demo',
    path: '/business/demo',
    tenantType: 'business',
  },

  // ==================== 政务版菜单 ====================
  {
    key: 'gov-dashboard',
    title: '工作台',
    icon: 'dashboard',
    path: '/government/dashboard',
    tenantType: 'government',
  },
  {
    key: 'smart-archive',
    title: '智慧档案',
    icon: 'archive',
    path: '/government/smart-archive',
    featureKey: 'smart-archive',
    tenantType: 'government',
  },
  {
    key: 'reference-info',
    title: '参考信息',
    icon: 'info',
    path: '/government/reference-info',
    featureKey: 'reference-info',
    tenantType: 'government',
  },
  {
    key: 'sentiment-monitor',
    title: '舆情监测',
    icon: 'sentiment',
    path: '/government/sentiment-monitor',
    featureKey: 'sentiment-analysis',
    tenantType: 'government',
  },
  {
    key: 'wechat-mp',
    title: '公众号管理',
    icon: 'wechat',
    tenantType: 'government',
    children: [
      {
        key: 'wechat-account',
        title: '账号绑定',
        path: '/government/wechat-mp',
      },
      {
        key: 'topic-selection',
        title: '内容发布',
        path: '/government/topic-selection',
      },
      {
        key: 'content-list',
        title: '内容列表',
        path: '/government/content-list',
      },
      {
        key: 'publish-queue',
        title: '一键发布',
        path: '/government/publish-queue',
      },
      {
        key: 'wechat-dashboard',
        title: '数据看板',
        path: '/government/wechat-dashboard',
      },
    ],
  },
  {
    key: 'review',
    title: '三审三校',
    icon: 'governance',
    path: '/government/review',
    featureKey: 'government-publish',
    tenantType: 'government',
  },
  {
    key: 'intelligent-reports',
    title: '一键报告',
    icon: 'report',
    path: '/government/intelligent-reports',
    featureKey: 'smart-report',
    tenantType: 'government',
  },

  // ==================== 管理后台菜单 ====================
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
// 注意：此函数会创建新的菜单项对象，不会修改原始 MENU_CONFIG
export const getFilteredMenu = (
  menuItems: MenuItem[],
  tenantType: 'business' | 'government' | 'all',
  enabledFeatures: string[]
): MenuItem[] => {
  return menuItems
    .filter(item => {
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

      return true;
    })
    .map(item => {
      // 如果有子菜单，递归过滤并创建新对象
      if (item.children && item.children.length > 0) {
        const filteredChildren = getFilteredMenu(item.children, tenantType, enabledFeatures);
        // 创建新的菜单项对象，避免修改原始配置
        return {
          ...item,
          children: filteredChildren.length > 0 ? filteredChildren : undefined,
        };
      }
      // 没有子菜单，返回原对象的副本
      return { ...item };
    })
    .filter(item => {
      // 对于有子菜单的项，如果子菜单被过滤空了，且该项本身没有 path，则不显示
      if (item.children && item.children.length === 0 && !item.path) {
        return false;
      }
      return true;
    });
};

// 获取默认路径
export const getDefaultPath = (tenantType: 'business' | 'government'): string => {
  return tenantType === 'business' ? '/business/dashboard' : '/government/dashboard';
};
