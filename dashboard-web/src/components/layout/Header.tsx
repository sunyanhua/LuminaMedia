import { Bell, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  breadcrumbs: { label: string; active?: boolean }[];
}

export function Header({ breadcrumbs }: HeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-600">/</span>}
                <span
                  className={
                    crumb.active ? 'text-amber-500 font-medium' : 'text-slate-400'
                  }
                >
                  {crumb.label}
                </span>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="搜索..."
              className="pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-amber-500"
            />
          </div>

          <button className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-950" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-slate-800 text-slate-200">
              <DropdownMenuLabel>管理员账户</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800">
                个人设置
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800">
                安全设置
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 text-red-400">
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
