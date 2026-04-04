import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Info, ShieldAlert } from 'lucide-react';
import { useDemoMode, useDemoVersion } from '@/store/useAppStore';

const DemoBanner: React.FC = () => {
  const isDemoMode = useDemoMode();
  const demoVersion = useDemoVersion();

  if (!isDemoMode) {
    return null; // 仅在演示模式下显示
  }

  return (
    <div className="bg-blue-900/20 border-b border-blue-800/50 py-2">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="text-blue-200 font-medium">当前为演示环境</span>
          </div>

          <Badge variant="secondary" className="bg-blue-800/30 text-blue-300 border-blue-700">
            {demoVersion === 'business' ? '商务版演示' : '政务版演示'}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-blue-300 text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>所有数据操作均为模拟，不影响真实数据</span>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;