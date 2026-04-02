import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useLogin, useLogout } from '@/store/useAppStore';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
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
    { email: 'gov-admin', password: 'gov123', name: '系统管理员' },
    { email: 'propaganda-director', password: 'gov123', name: '宣传处长' },
    { email: 'content-editor', password: 'gov123', name: '内容编辑' },
    { email: 'security-reviewer', password: 'gov123', name: '安全审核员' },
  ],
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
            user_metadata: { name: userInfo.name },
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

  const signIn = async (email: string, password: string) => {
    try {
      // 先尝试使用演示账号登录
      const demoAccount = findDemoAccount(email, password);
      
      if (demoAccount) {
        // 演示账号登录成功
        const mockUser: User = {
          id: demoAccount.email,
          email: demoAccount.email,
          user_metadata: { name: demoAccount.name },
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

      // 如果不是演示账号，尝试使用 supabase（为将来扩展保留）
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
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
