import { useState, useEffect } from 'react';
import { ChevronDown, Check, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface DemoUser {
  email: string;
  name: string;
  role?: string;
}

interface UserSwitcherProps {
  currentUserEmail: string;
  tenantType: 'business' | 'government';
  onUserSwitch?: (email: string) => void;
}

const DEMO_USERS_BY_TENANT: Record<'business' | 'government', DemoUser[]> = {
  business: [
    { email: 'admin@demo.lumina.com', name: '商务管理员', role: '管理员' },
    { email: 'marketing@demo.lumina.com', name: '营销经理', role: '营销经理' },
    { email: 'analyst@demo.lumina.com', name: '数据分析师', role: '数据分析师' },
  ],
  government: [
    { email: 'admin@demo-gov', name: '系统管理员', role: '管理员' },
    { email: 'editor@demo-gov', name: '编辑', role: '编辑' },
    { email: 'manager@demo-gov', name: '主管', role: '主管' },
    { email: 'legal@demo-gov', name: '法务', role: '法务' },
  ],
};

export function UserSwitcher({ currentUserEmail, tenantType, onUserSwitch }: UserSwitcherProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 获取当前租户的演示用户列表
  const demoUsers = DEMO_USERS_BY_TENANT[tenantType] || [];

  // 查找当前用户信息
  const currentUser = demoUsers.find(user => user.email === currentUserEmail) ||
    { email: currentUserEmail, name: currentUserEmail.split('@')[0] };

  const handleSwitchUser = async (targetEmail: string) => {
    if (targetEmail === currentUserEmail) {
      return;
    }

    setLoading(true);
    try {
      // 首先需要获取目标用户的ID
      // 这里我们可以调用后端API获取用户ID，或者直接使用邮箱
      // 暂时先调用切换API，假设后端能根据邮箱找到用户
      const token = localStorage.getItem('lumina-token');
      const response = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: targetEmail }), // 暂时使用邮箱作为ID
      });

      if (response.ok) {
        const data = await response.json();

        // 更新localStorage中的token和用户信息
        localStorage.setItem('lumina-token', data.access_token);
        localStorage.setItem('lumina-user', JSON.stringify({
          name: data.user.username,
          email: data.user.email,
          tenantId: data.user.tenantId,
          roles: data.user.roles || []
        }));

        toast({
          title: '切换成功',
          description: `已切换为 ${data.user.username}`,
        });

        // 通知父组件
        if (onUserSwitch) {
          onUserSwitch(targetEmail);
        }

        // 刷新页面以更新应用状态
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '切换失败');
      }
    } catch (error) {
      console.error('切换用户失败:', error);
      toast({
        title: '切换失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-slate-100"
          disabled={loading}
        >
          <User className="w-4 h-4" />
          <span className="truncate max-w-[120px]">{currentUser.name}</span>
          <ChevronDown className="w-4 h-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 bg-slate-900 border-slate-800 text-slate-200"
        align="end"
      >
        <DropdownMenuLabel className="text-xs text-slate-400">
          当前用户: {currentUser.name}
          {currentUser.role && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300">
              {currentUser.role}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />

        <DropdownMenuLabel className="text-xs text-slate-400 pt-0">
          切换演示角色
        </DropdownMenuLabel>

        {demoUsers.map((user) => (
          <DropdownMenuItem
            key={user.email}
            className="flex items-center justify-between hover:bg-slate-800 focus:bg-slate-800 cursor-pointer"
            onClick={() => handleSwitchUser(user.email)}
            disabled={loading}
          >
            <div className="flex flex-col">
              <span className="text-sm">{user.name}</span>
              <span className="text-xs text-slate-400">{user.email}</span>
            </div>
            {user.email === currentUserEmail && (
              <Check className="w-4 h-4 text-amber-500" />
            )}
            {user.role && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300">
                {user.role}
              </span>
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem
          className="text-xs text-slate-400 hover:bg-slate-800 focus:bg-slate-800 cursor-pointer"
          onClick={() => {
            toast({
              title: '提示',
              description: '用户切换功能仅限演示环境使用，用于体验不同角色的权限差异。',
            });
          }}
        >
          仅演示环境可用
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}