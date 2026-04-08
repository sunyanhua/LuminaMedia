import React from 'react';
import { useVersion } from '@/store/useAppStore';
import { Building2, Landmark } from 'lucide-react';

// DemoModeIndicator 已修改为仅显示当前版本，无切换功能
const DemoModeIndicator: React.FC = () => {
  const version = useVersion();

  if (version === 'business') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-amber-50/10 border-amber-500/30 text-amber-400">
        <Building2 className="w-4 h-4" />
        <span className="text-sm font-medium">商务版</span>
      </div>
    );
  }

  if (version === 'government') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-blue-50/10 border-blue-500/30 text-blue-400">
        <Landmark className="w-4 h-4" />
        <span className="text-sm font-medium">政务版</span>
      </div>
    );
  }

  return null;
};

export default DemoModeIndicator;
