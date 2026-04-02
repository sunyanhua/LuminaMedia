/**
 * Mock Supabase Client
 * 
 * 本项目使用 NestJS + JWT 作为后端认证架构，不使用真实的 Supabase Auth。
 * 此文件提供最小化的 mock supabase 对象，用于消除 TypeScript 编译错误，
 * 实际认证逻辑在 AuthContext.tsx 中通过模拟实现。
 */

import { User, Session } from '@supabase/supabase-js';

// 模拟 supabase 用户
const mockUser: User = {
  id: 'mock-user-id',
  email: 'demo@example.com',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
} as User;

// 模拟 supabase 会话
const mockSession: Session = {
  user: mockUser,
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
} as Session;

// Mock Supabase Auth
const mockAuth = {
  getSession: async () => ({
    data: { session: null as Session | null },
    error: null,
  }),
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    // 立即触发一次回调，表示无会话
    callback('SIGNED_OUT', null);
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    // 模拟认证逻辑 - 检查演示账号
    const validBusinessAccounts = [
      { email: 'admin@demo.lumina.com', password: 'demo123' },
      { email: 'marketing@demo.lumina.com', password: 'demo123' },
      { email: 'analyst@demo.lumina.com', password: 'demo123' },
    ];
    
    const validGovernmentAccounts = [
      { email: 'gov-admin', password: 'gov123' },
      { email: 'propaganda-director', password: 'gov123' },
      { email: 'content-editor', password: 'gov123' },
      { email: 'security-reviewer', password: 'gov123' },
    ];

    const allValidAccounts = [...validBusinessAccounts, ...validGovernmentAccounts];
    const isValid = allValidAccounts.some(
      (acc) => acc.email === email && acc.password === password
    );

    if (isValid) {
      return { data: { user: mockUser, session: mockSession }, error: null };
    }

    return {
      data: { user: null, session: null },
      error: new Error('邮箱或密码错误'),
    };
  },
  signUp: async ({ email, password }: { email: string; password: string }) => {
    // DEMO 模式下不支持真实注册
    return {
      data: { user: null, session: null },
      error: new Error('演示模式下不支持注册新账号'),
    };
  },
  signOut: async () => {
    return { error: null };
  },
};

// 导出 mock supabase 客户端
export const supabase = {
  auth: mockAuth,
};

export default supabase;
