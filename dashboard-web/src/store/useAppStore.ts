import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type DemoVersion = 'business' | 'government' | null;

interface AppState {
  // 当前活动页面
  currentPage: string;
  // 设置当前页面
  setCurrentPage: (page: string) => void;

  // 侧边栏折叠状态
  sidebarCollapsed: boolean;
  // 切换侧边栏折叠状态
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // 主题模式：'dark' | 'light'
  theme: 'dark' | 'light';
  // 切换主题
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // 用户信息
  user: {
    name: string;
    email: string;
    avatar?: string;
    roles?: string[];
    tenantId?: string;
    tenantType?: 'business' | 'government';
  } | null;
  // 设置用户信息
  setUser: (user: AppState['user']) => void;

  // 全局加载状态
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // 版本：商务版 / 政务版
  version: DemoVersion;
  // 设置版本
  setVersion: (version: DemoVersion) => void;

  // 认证状态
  isAuthenticated: boolean;
  // 登录
  login: (user: { name: string; email: string; avatar?: string }) => void;
  // 登出
  logout: () => void;
}

// 从localStorage获取初始版本
const getInitialVersion = (): DemoVersion => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('lumina-version');
  if (stored === 'business' || stored === 'government') {
    return stored;
  }
  return null;
};

const getInitialAuthState = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('lumina-auth');
  return stored === 'true';
};

const getInitialUser = (): AppState['user'] => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('lumina-user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

const storeCreator = (set: any): AppState => ({
  // 初始状态
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state: AppState) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  theme: 'dark',
  toggleTheme: () => set((state: AppState) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setTheme: (theme) => set({ theme }),

  user: getInitialUser(),
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('lumina-user', JSON.stringify(user));
      } else {
        localStorage.removeItem('lumina-user');
      }
    }
    set({ user });
  },

  loading: false,
  setLoading: (loading) => set({ loading }),

  // 版本
  version: getInitialVersion(),
  setVersion: (version) => {
    if (typeof window !== 'undefined') {
      if (version) {
        localStorage.setItem('lumina-version', version);
      } else {
        localStorage.removeItem('lumina-version');
      }
    }
    set({ version });
  },

  // 认证状态
  isAuthenticated: getInitialAuthState(),
  login: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumina-auth', 'true');
      localStorage.setItem('lumina-user', JSON.stringify(user));
    }
    set({ isAuthenticated: true, user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lumina-auth');
      localStorage.removeItem('lumina-user');
    }
    set({ isAuthenticated: false, user: null });
  },
});

// 根据环境决定是否启用 devtools
export const useAppStore = create<AppState>()(
  process.env.NODE_ENV === 'development'
    ? devtools(storeCreator, { name: 'AppStore' })
    : storeCreator
);

// 导出一些常用的selector hooks
export const useCurrentPage = () => useAppStore((state) => state.currentPage);
export const useSetCurrentPage = () => useAppStore((state) => state.setCurrentPage);
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed);
export const useToggleSidebar = () => useAppStore((state) => state.toggleSidebar);
export const useTheme = () => useAppStore((state) => state.theme);
export const useToggleTheme = () => useAppStore((state) => state.toggleTheme);
export const useUser = () => useAppStore((state) => state.user);
export const useSetUser = () => useAppStore((state) => state.setUser);
export const useLoading = () => useAppStore((state) => state.loading);
export const useSetLoading = () => useAppStore((state) => state.setLoading);
export const useVersion = () => useAppStore((state) => state.version);
export const useSetVersion = () => useAppStore((state) => state.setVersion);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useLogin = () => useAppStore((state) => state.login);
export const useLogout = () => useAppStore((state) => state.logout);
