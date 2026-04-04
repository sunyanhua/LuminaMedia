import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface QuotaItem {
  name: string;
  used: number;
  max: number;
  unit: string;
}

interface QuotaData {
  dailyAiCalls: QuotaItem;
  contentPublishes: QuotaItem;
  dataImports: QuotaItem;
}

const QuotaDisplay: React.FC = () => {
  const [quotas, setQuotas] = useState<QuotaData>({
    dailyAiCalls: { name: 'AI调用', used: 5, max: 5, unit: '次/日' },
    contentPublishes: { name: '内容发布', used: 8, max: 10, unit: '次/日' },
    dataImports: { name: '数据导入', used: 3, max: 3, unit: '次/日' },
  });
  const [loading, setLoading] = useState(false);

  // 模拟获取配额数据
  useEffect(() => {
    const fetchQuotas = async () => {
      setLoading(true);
      try {
        // 这里应该调用实际的API来获取配额数据
        // const response = await fetch('/api/quotas/current');
        // const data = await response.json();
        // setQuotas(data);

        // 模拟数据获取延迟
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('获取配额数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotas();
  }, []);

  const resetQuotas = async () => {
    setLoading(true);
    try {
      // 这里应该调用实际的API来重置配额
      // await fetch('/api/quotas/reset', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ tenantId: 'current_tenant_id' }),
      // });

      // 模拟重置操作
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 重置配额数据（在实际应用中这会从API获取新的配额）
      setQuotas({
        dailyAiCalls: { name: 'AI调用', used: 0, max: 5, unit: '次/日' },
        contentPublishes: { name: '内容发布', used: 0, max: 10, unit: '次/日' },
        dataImports: { name: '数据导入', used: 0, max: 3, unit: '次/日' },
      });
    } catch (error) {
      console.error('重置配额失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const isQuotaExceeded = (item: QuotaItem) => item.used >= item.max;

  return (
    <Card className="bg-slate-800/50 border-slate-700 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="text-slate-100">配额使用</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetQuotas}
            disabled={loading}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
            title="重置配额"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(quotas).map(([key, quota]) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300 truncate">{quota.name}</span>
              <span className="text-slate-400 text-xs md:text-sm ml-2">
                {quota.used}/{quota.max} {quota.unit}
              </span>
            </div>
            <Progress
              value={Math.min(100, (quota.used / quota.max) * 100)}
              className="h-2"
              indicatorColor={
                isQuotaExceeded(quota)
                  ? 'bg-red-500'
                  : quota.used / quota.max > 0.8
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              }
            />
            {isQuotaExceeded(quota) && (
              <div className="flex items-center gap-1 text-red-400 text-xs">
                <AlertTriangle className="w-3 h-3" />
                <span>已用完</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuotaDisplay;