import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RotateCcw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuotaWarningProps {
  onResetQuota?: () => void;
}

const QuotaWarning: React.FC<QuotaWarningProps> = ({ onResetQuota }) => {
  const [quotas, setQuotas] = useState([
    { name: 'AI调用次数', used: 5, max: 5, unit: '次/日' },
    { name: '内容发布次数', used: 8, max: 10, unit: '次/日' },
    { name: '数据导入次数', used: 3, max: 3, unit: '次/日' },
  ]);

  const exceededQuotas = quotas.filter(quota => quota.used >= quota.max);
  const nearLimitQuotas = quotas.filter(quota => quota.used >= quota.max * 0.9 && quota.used < quota.max);

  if (exceededQuotas.length === 0 && nearLimitQuotas.length === 0) {
    return null; // 没有达到限制或接近限制时不显示警告
  }

  return (
    <div className="space-y-3">
      {exceededQuotas.map((quota, index) => (
        <Alert key={`exceeded-${index}`} className="bg-red-900/20 border-red-800/50">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-300 flex items-center justify-between">
            <span>{quota.name}配额已用完</span>
            <span className="text-sm">{quota.used}/{quota.max} {quota.unit}</span>
          </AlertTitle>
          <AlertDescription className="text-red-400">
            {quota.name}的配额已达到上限。请等待系统自动重置或联系管理员重置。
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-red-300 border-red-700 hover:bg-red-800/50 hover:text-red-200"
                onClick={onResetQuota}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                重置配额
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}

      {nearLimitQuotas.map((quota, index) => (
        <Alert key={`near-limit-${index}`} className="bg-amber-900/20 border-amber-800/50">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-amber-300 flex items-center justify-between">
            <span>{quota.name}配额即将用完</span>
            <span className="text-sm">{quota.used}/{quota.max} {quota.unit}</span>
          </AlertTitle>
          <AlertDescription className="text-amber-400">
            {quota.name}的配额即将达到上限 ({quota.used}/{quota.max})。请合理安排使用。
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default QuotaWarning;