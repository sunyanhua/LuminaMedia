import { useCallback, useMemo } from 'react';

export type UserRole = 'EDITOR' | 'MANAGER' | 'LEGAL' | 'ADMIN';

interface UserInfo {
  name: string;
  email: string;
  tenantId?: string;
  tenantType?: 'business' | 'government';
  roles?: string[];
}

/**
 * 获取当前登录用户信息
 */
export function getCurrentUser(): UserInfo | null {
  try {
    const userStr = localStorage.getItem('lumina-user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch {
    // 解析失败
  }
  return null;
}

/**
 * 获取当前用户角色列表
 */
export function getCurrentRoles(): string[] {
  const user = getCurrentUser();
  return user?.roles || [];
}

/**
 * 检查当前用户是否有指定角色
 */
export function hasRole(role: UserRole | UserRole[]): boolean {
  const currentRoles = getCurrentRoles();
  const rolesToCheck = Array.isArray(role) ? role : [role];
  return rolesToCheck.some(r => currentRoles.includes(r));
}

/**
 * 检查当前用户是否是编辑
 */
export function isEditor(): boolean {
  return hasRole('EDITOR') || hasRole('ADMIN');
}

/**
 * 检查当前用户是否是主管
 */
export function isManager(): boolean {
  return hasRole('MANAGER') || hasRole('ADMIN');
}

/**
 * 检查当前用户是否是法务
 */
export function isLegal(): boolean {
  return hasRole('LEGAL') || hasRole('ADMIN');
}

/**
 * 检查当前用户是否是管理员
 */
export function isAdmin(): boolean {
  return hasRole('ADMIN');
}

/**
 * React Hook: 使用权限控制
 * 提供用户角色检查和权限验证功能
 */
export function useAuth() {
  const user = useMemo(() => getCurrentUser(), []);
  const roles = useMemo(() => getCurrentRoles(), []);

  const checkRole = useCallback((role: UserRole | UserRole[]): boolean => {
    return hasRole(role);
  }, []);

  const checkCanEdit = useCallback((): boolean => {
    return isEditor();
  }, []);

  const checkCanReviewAsManager = useCallback((): boolean => {
    return isManager();
  }, []);

  const checkCanReviewAsLegal = useCallback((): boolean => {
    return isLegal();
  }, []);

  const checkCanPublish = useCallback((): boolean => {
    return isAdmin();
  }, []);

  const getRoleDisplayName = useCallback((role: string): string => {
    const roleNames: Record<string, string> = {
      'EDITOR': '编辑',
      'MANAGER': '主管',
      'LEGAL': '法务',
      'ADMIN': '管理员',
    };
    return roleNames[role] || role;
  }, []);

  const getCurrentRoleName = useCallback((): string => {
    if (roles.length === 0) return '访客';
    // 返回第一个角色的中文名称
    return getRoleDisplayName(roles[0]);
  }, [roles, getRoleDisplayName]);

  return {
    user,
    roles,
    hasRole: checkRole,
    canEdit: checkCanEdit,
    canReviewAsManager: checkCanReviewAsManager,
    canReviewAsLegal: checkCanReviewAsLegal,
    canPublish: checkCanPublish,
    isEditor: isEditor(),
    isManager: isManager(),
    isLegal: isLegal(),
    isAdmin: isAdmin(),
    getRoleDisplayName,
    getCurrentRoleName,
  };
}

export default useAuth;
