import { useState, useEffect } from 'react';

interface MenuItem {
  key: string;
  title: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  permissions?: string[];
  featureKey?: string;
}

interface MenuConfig {
  menuItems: MenuItem[];
  isLoaded: boolean;
  error: string | null;
}

// 模拟的服务类，实际实现中会调用API
class MenuPermissionService {
  private static instance: MenuPermissionService;

  static getInstance(): MenuPermissionService {
    if (!MenuPermissionService.instance) {
      MenuPermissionService.instance = new MenuPermissionService();
    }
    return MenuPermissionService.instance;
  }

  // 获取当前租户的功能配置
  async getCurrentTenantFeatures(): Promise<any[]> {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { featureKey: 'customer-analytics', isEnabled: true },
          { featureKey: 'ai-strategy', isEnabled: true },
          { featureKey: 'matrix-publish', isEnabled: true },
          { featureKey: 'government-publish', isEnabled: true },
          { featureKey: 'sentiment-analysis', isEnabled: false },
          { featureKey: 'geo-analysis', isEnabled: false },
        ]);
      }, 300);
    });
  }

  // 根据功能配置动态生成菜单
  async getDynamicMenu(tenantFeatures: any[], demoVersion: 'business' | 'government'): Promise<MenuItem[]> {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        const allMenus: MenuItem[] = [
          {
            key: 'dashboard',
            title: '仪表盘',
            icon: 'dashboard',
            path: demoVersion === 'business' ? '/business/dashboard' : '/government/dashboard',
          },
          {
            key: 'analytics',
            title: '数据统计',
            icon: 'analytics',
            path: '/business/analytics',
            featureKey: 'customer-analytics',
          },
          {
            key: 'ai-strategy',
            title: 'AI智策中心',
            icon: 'ai',
            path: demoVersion === 'business' ? '/business/ai-strategy' : '/government/ai-strategy',
            featureKey: 'ai-strategy',
          },
          {
            key: 'matrix',
            title: '新媒体矩阵',
            icon: 'matrix',
            path: '/business/matrix',
            featureKey: 'matrix-publish',
          },
          {
            key: 'governance',
            title: '发稿审核',
            icon: 'governance',
            path: '/government/governance',
            featureKey: 'government-publish',
          },
          {
            key: 'sentiment-analysis',
            title: '舆情监测',
            icon: 'sentiment',
            path: '/government/sentiment-analysis',
            featureKey: 'sentiment-analysis',
          },
          {
            key: 'geo-analysis',
            title: 'GEO分析',
            icon: 'geo',
            path: '/government/geo-analysis',
            featureKey: 'geo-analysis',
          },
          {
            key: 'demo',
            title: '演示中心',
            icon: 'demo',
            path: '/business/demo',
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
            ],
          },
        ];

        // 根据租户类型和功能配置过滤菜单
        const filteredMenus = allMenus.filter(menu => {
          // 如果是管理后台，总是显示
          if (menu.key === 'admin') return true;

          // 如果是仪表盘，总是显示
          if (menu.key === 'dashboard') return true;

          // 如果有功能键，检查功能是否启用
          if (menu.featureKey) {
            const featureEnabled = tenantFeatures.some(
              (feature: any) => feature.featureKey === menu.featureKey && feature.isEnabled
            );

            // 根据版本决定是否显示
            if (demoVersion === 'business') {
              // 商务版只显示商务版功能和通用功能
              if (['sentiment-analysis', 'geo-analysis', 'governance'].includes(menu.featureKey)) {
                return false;
              }
            } else if (demoVersion === 'government') {
              // 政务版只显示政务版功能和通用功能
              if (['customer-analytics', 'analytics', 'matrix'].includes(menu.featureKey)) {
                return false;
              }
            }

            return featureEnabled;
          }

          // 没有功能键限制的菜单，检查路径是否匹配版本
          if (menu.path) {
            if (demoVersion === 'business') {
              return !menu.path.includes('/government/');
            } else if (demoVersion === 'government') {
              return !menu.path.includes('/business/') || menu.path.includes('/government/');
            }
          }

          // 对于有子菜单的项目，检查子菜单中是否有可用项
          if (menu.children && menu.children.length > 0) {
            return menu.children.some(child => {
              if (!child.featureKey) return true;

              const childFeatureEnabled = tenantFeatures.some(
                (feature: any) => feature.featureKey === child.featureKey && feature.isEnabled
              );

              if (demoVersion === 'business') {
                return !['sentiment-analysis', 'geo-analysis', 'governance'].includes(child.featureKey) && childFeatureEnabled;
              } else if (demoVersion === 'government') {
                return !['customer-analytics', 'analytics', 'matrix'].includes(child.featureKey) && childFeatureEnabled;
              }

              return childFeatureEnabled;
            });
          }

          return true;
        });

        resolve(filteredMenus);
      }, 500);
    });
  }
}

// React Hook 版本的服务
export const useMenuPermissionService = (): MenuConfig => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setIsLoaded(false);
        setError(null);

        // 从本地存储获取版本信息
        const demoVersion = localStorage.getItem('lumina-version') as 'business' | 'government' || 'business';

        // 获取功能配置
        const service = MenuPermissionService.getInstance();
        const tenantFeatures = await service.getCurrentTenantFeatures();

        // 生成动态菜单
        const dynamicMenu = await service.getDynamicMenu(tenantFeatures, demoVersion);

        setMenuItems(dynamicMenu);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取菜单配置失败');
        console.error('获取菜单配置失败:', err);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchMenu();
  }, []);

  return { menuItems, isLoaded, error };
};

export default MenuPermissionService;