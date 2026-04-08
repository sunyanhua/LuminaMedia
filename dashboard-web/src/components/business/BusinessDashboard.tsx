import DashboardOverview from '../dashboard/DashboardOverview';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

function BusinessDashboard() {
  return (
    <div className="space-y-6">
      {/* 商务版标识 */}
      <div className="flex items-center justify-between">
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 px-3 py-1">
          <Building2 className="w-3 h-3 mr-1" />
          商务版
        </Badge>
      </div>
      
      {/* 复用现有的仪表盘组件 */}
      <DashboardOverview />
    </div>
  );
}

export default BusinessDashboard;
