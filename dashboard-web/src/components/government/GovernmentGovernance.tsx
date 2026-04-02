import Governance from '../governance/Governance';
import { Badge } from '@/components/ui/badge';
import { Landmark } from 'lucide-react';
import { useEffect } from 'react';

function GovernmentGovernance() {
  // 确保演示模式开启
  useEffect(() => {
    localStorage.setItem('lumina-demo-mode', 'true');
  }, []);

  return (
    <div className="space-y-6">
      {/* 政务版标识 */}
      <div className="flex items-center justify-between">
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 px-3 py-1">
          <Landmark className="w-3 h-3 mr-1" />
          政务版演示
        </Badge>
      </div>
      
      {/* 复用并改造现有的 Governance 组件 */}
      <Governance />
    </div>
  );
}

export default GovernmentGovernance;
