import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDemoMode, useToggleDemoMode } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const DemoModeIndicator: React.FC = () => {
  const isDemoMode = useDemoMode();
  const toggleDemoMode = useToggleDemoMode();

  const handleToggle = () => {
    // 添加确认提示
    if (!isDemoMode) {
      const confirmed = window.confirm('切换至演示模式？在演示模式下，所有数据操作将被模拟，不会影响真实数据。');
      if (confirmed) {
        toggleDemoMode();
      }
    } else {
      const confirmed = window.confirm('切换至生产模式？在生产模式下，将使用真实数据操作。');
      if (confirmed) {
        toggleDemoMode();
      }
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-md border",
      isDemoMode
        ? "bg-yellow-50 border-yellow-200 text-yellow-800"
        : "bg-green-50 border-green-200 text-green-800"
    )}>
      <div className="flex items-center gap-2">
        <Switch
          id="demo-mode-switch"
          checked={isDemoMode}
          onCheckedChange={handleToggle}
          className={isDemoMode ? "data-[state=checked]:bg-yellow-600" : ""}
        />
        <Label htmlFor="demo-mode-switch" className="cursor-pointer">
          {isDemoMode ? (
            <span className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-600"></span>
              </span>
              <span className="font-medium">演示模式</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
              </span>
              <span className="font-medium">生产模式</span>
            </span>
          )}
        </Label>
      </div>
      <div className="text-xs opacity-70">
        {isDemoMode ? '数据操作将被模拟' : '使用真实数据'}
      </div>
    </div>
  );
};

export default DemoModeIndicator;