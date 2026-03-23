import { type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  iconColor: string;
}

export function StatsCard({ title, value, change, trend, icon: Icon, iconColor }: StatsCardProps) {
  return (
    <Card className="group relative bg-slate-900 border-slate-800 p-6 transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-100 mb-2">{value}</h3>
          {change && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend === 'up' ? 'text-green-500' : 'text-red-500'
                )}
              >
                {trend === 'up' ? '↑' : '↓'} {change}
              </span>
              <span className="text-xs text-slate-500">较上月</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {/* Subtle glow effect on hover */}
      <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
      </div>
    </Card>
  );
}
