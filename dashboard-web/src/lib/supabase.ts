/**
 * Supabase Client Stub
 *
 * 本项目使用 NestJS + JWT 作为后端认证架构，不使用 Supabase Auth。
 * 此文件仅为满足 TypeScript 类型检查，实际认证逻辑在 AuthContext.tsx 中。
 */

import { User, Session } from '@supabase/supabase-js';

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null as Session | null }, error: null }),
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => ({
      data: { subscription: { unsubscribe: () => {} } }
    }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('请使用 AuthContext 登录') }),
    signUp: async () => ({ data: { user: null, session: null }, error: new Error('请使用 AuthContext 注册') }),
    signOut: async () => ({ error: null }),
  },
};

export default supabase;
