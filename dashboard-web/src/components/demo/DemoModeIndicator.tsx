import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDemoMode, useToggleDemoMode, useDemoVersion } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Building2, Landmark } from 'lucide-react';

const DemoModeIndicator: React.FC = () => {
  const isDemoMode = useDemoMode();
  const demoVersion = useDemoVersion();
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

  // 版本标签显示
  const getVersionLabel = () => {
    if (!isDemoMode) return null;
    
    if (demoVersion === 'business') {
      return (
        <span className="flex items-center gap-1 text-amber-400">
          <Building2 className="w-3 h-3" />
          商务版
        </span>
      );
    }
    if (demoVersion === 'government') {
      return (
        <span className="flex items-center gap-1 text-blue-400">
          <Landmark className="w-3 h-3" />
          政务版
        </span>
      );
    }
    return null;
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-md border",
      isDemoMode
        ? "bg-yellow-50/10 border-yellow-500/30 text-yellow-400"
        : "bg-green-50/10 border-green-500/30 text-green-400"
    )}>
      <div className="flex items-center gap-2">
        <Switch
          id="demo-mode-switch"
          checked={isDemoMode}
          onCheckedChange={handleToggle}
          className={isDemoMode ? "data-[state=checked]:bg-yellow-600" : ""}
        />
        <Label htmlFor="demo-mode-switch" className="cursor-pointer flex items-center gap-2">
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
      
      {/* 版本标签 */}
      {getVersionLabel() && (
        <>
          <span className="text-slate-600">|</span>
          <div className="text-xs font-medium">
            {getVersionLabel()}
          </div>
        </>
      )}
      
      <div className="text-xs opacity-70 ml-1">
        {isDemoMode ? '数据操作将被模拟' : '使用真实数据'}
      </div>
    </div>
  );
};

export default DemoModeIndicator;
