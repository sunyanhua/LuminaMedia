import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useLogin, useLogout } from '@/store/useAppStore';
import env from '@/config/env';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, tenantType?: 'business' | 'government') => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 演示账号配置
const DEMO_ACCOUNTS = {
  business: [
    { email: 'admin@demo.lumina.com', password: 'demo123', name: '商务管理员' },
    { email: 'marketing@demo.lumina.com', password: 'demo123', name: '营销经理' },
    { email: 'analyst@demo.lumina.com', password: 'demo123', name: '数据分析师' },
  ],
  government: [
    { email: 'admin@demo-gov', password: 'LuminaDemo2026', name: '系统管理员' },
    { email: 'editor@demo-gov', password: 'LuminaDemo2026', name: '编辑' },
    { email: 'manager@demo-gov', password: 'LuminaDemo2026', name: '主管' },
    { email: 'legal@demo-gov', password: 'LuminaDemo2026', name: '法务' },
  ],
};

// 租户ID映射
const TENANT_IDS = {
  business: '11111111-1111-1111-1111-111111111111', // 商务版演示租户
  government: '33333333-3333-3333-3333-333333333333', // 政务版演示租户
};

// 查找演示账号
const findDemoAccount = (email: string, password: string) => {
  const allAccounts = [...DEMO_ACCOUNTS.business, ...DEMO_ACCOUNTS.government];
  return allAccounts.find((acc) => acc.email === email && acc.password === password);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const storeLogin = useLogin();
  const storeLogout = useLogout();

  // 初始化时检查 localStorage 中的认证状态
  useEffect(() => {
    const initAuth = async () => {
      // 检查 localStorage 中是否有认证信息
      const isAuthenticated = localStorage.getItem('lumina-auth') === 'true';
      const storedUser = localStorage.getItem('lumina-user');
      
      if (isAuthenticated && storedUser) {
        try {
          const userInfo = JSON.parse(storedUser);
          // 恢复用户状态
          const mockUser: User = {
            id: userInfo.email,
            email: userInfo.email,
            user_metadata: {
              name: userInfo.name,
              roles: userInfo.roles || []
            },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            role: 'authenticated',
            updated_at: new Date().toISOString(),
          } as User;
          setUser(mockUser);
        } catch {
          // 解析失败，清除认证状态
          localStorage.removeItem('lumina-auth');
          localStorage.removeItem('lumina-user');
        }
      }
      
      setLoading(false);
    };

    initAuth();

    // 订阅 supabase 认证状态变化（用于向后兼容）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, tenantType: 'business' | 'government' = 'business') => {
    try {
      const tenantId = TENANT_IDS[tenantType];

      // 调用后端登录API
      const response = await fetch(`${env.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          username: email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // 创建模拟用户对象（兼容现有代码）
        const mockUser: User = {
          id: data.user?.id || email,
          email: data.user?.email || email,
          user_metadata: {
            name: data.user?.username || email,
            roles: data.user?.roles || []
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          role: 'authenticated',
          updated_at: new Date().toISOString(),
        } as User;

        setUser(mockUser);

        // 同步到 store
        storeLogin({
          name: data.user?.username || email,
          email: data.user?.email || email,
        });

        // 存储token和用户信息到localStorage
        localStorage.setItem('lumina-auth', 'true');
        localStorage.setItem('lumina-user', JSON.stringify({
          name: data.user?.username || email,
          email: data.user?.email || email,
          tenantId: data.user?.tenantId || tenantId,
          tenantType: tenantType, // 存储租户类型
          roles: data.user?.roles || []
        }));
        // 同时存储到store的demoVersion字段
        localStorage.setItem('lumina-demo-version', tenantType);

        // 存储token用于后续API调用
        localStorage.setItem('lumina-token', data.access_token);

        return { error: null };
      } else {
        // 如果后端登录失败，尝试使用演示账号作为回退
        const demoAccount = findDemoAccount(email, password);

        if (demoAccount) {
          // 演示账号登录成功
          const mockUser: User = {
            id: demoAccount.email,
            email: demoAccount.email,
            user_metadata: {
              name: demoAccount.name,
              roles: [] // 演示账号暂无角色信息
            },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            role: 'authenticated',
            updated_at: new Date().toISOString(),
          } as User;

          setUser(mockUser);

          // 同步到 store
          storeLogin({
            name: demoAccount.name,
            email: demoAccount.email,
          });

          return { error: null };
        }

        // 尝试从错误响应中获取错误信息
        let errorMessage = '登录失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // 忽略JSON解析错误
        }

        return { error: new Error(errorMessage) };
      }
    } catch (error) {
      // 网络错误或其他异常，尝试使用演示账号作为回退
      const demoAccount = findDemoAccount(email, password);

      if (demoAccount) {
        // 演示账号登录成功
        const mockUser: User = {
          id: demoAccount.email,
          email: demoAccount.email,
          user_metadata: {
            name: demoAccount.name,
            roles: [] // 演示账号暂无角色信息
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          role: 'authenticated',
          updated_at: new Date().toISOString(),
        } as User;

        setUser(mockUser);

        // 同步到 store
        storeLogin({
          name: demoAccount.name,
          email: demoAccount.email,
        });

        return { error: null };
      }

      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // DEMO 模式下不支持注册
      return {
        error: new Error('演示模式下不支持注册新账号，请使用预设的演示账号登录'),
      };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    storeLogout();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内使用');
  }
  return context;
}
