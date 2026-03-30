import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
  } | null;
  // 设置用户信息
  setUser: (user: AppState['user']) => void;

  // 全局加载状态
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // 演示模式状态
  demoMode: boolean;
  // 切换演示模式
  toggleDemoMode: () => void;
  setDemoMode: (enabled: boolean) => void;
}

// 从localStorage获取初始演示模式状态
const getInitialDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('lumina-demo-mode');
  return stored === 'true';
};

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // 初始状态
      currentPage: 'dashboard',
      setCurrentPage: (page) => set({ currentPage: page }),

      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),

      user: null,
      setUser: (user) => set({ user }),

      loading: false,
      setLoading: (loading) => set({ loading }),

      // 演示模式初始从localStorage读取
      demoMode: getInitialDemoMode(),
      toggleDemoMode: () => set((state) => {
        const newDemoMode = !state.demoMode;
        localStorage.setItem('lumina-demo-mode', String(newDemoMode));
        return { demoMode: newDemoMode };
      }),
      setDemoMode: (enabled) => {
        localStorage.setItem('lumina-demo-mode', String(enabled));
        set({ demoMode: enabled });
      },
    }),
    { name: 'AppStore' }
  )
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
export const useDemoMode = () => useAppStore((state) => state.demoMode);
export const useToggleDemoMode = () => useAppStore((state) => state.toggleDemoMode);
export const useSetDemoMode = () => useAppStore((state) => state.setDemoMode);