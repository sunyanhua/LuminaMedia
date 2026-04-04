import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export interface QuotaInfo {
  name: string;
  used: number;
  max: number;
  unit: string;
}

export interface DemoQuotaHook {
  quotas: QuotaInfo[];
  loading: boolean;
  refreshQuotas: () => void;
  isQuotaExceeded: (quotaName: string) => boolean;
  isQuotaNearLimit: (quotaName: string) => boolean;
  resetQuota: (quotaName: string) => Promise<void>;
}

export const useDemoQuota = (): DemoQuotaHook => {
  const { toast } = useToast();
  const [quotas, setQuotas] = useState<QuotaInfo[]>([
    { name: 'AI调用次数', used: 5, max: 5, unit: '次/日' },
    { name: '内容发布次数', used: 8, max: 10, unit: '次/日' },
    { name: '数据导入次数', used: 3, max: 3, unit: '次/日' },
  ]);
  const [loading, setLoading] = useState(false);

  // 模拟获取配额数据
  const fetchQuotas = async () => {
    setLoading(true);
    try {
      // 这里应该调用实际的API来获取配额
      // const response = await fetch('/api/quotas/current');
      // const data = await response.json();
      // setQuotas(data);

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      toast({
        title: '获取配额信息失败',
        description: '无法连接到服务器，请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchQuotas();
  }, []);

  const refreshQuotas = () => {
    fetchQuotas();
  };

  const isQuotaExceeded = (quotaName: string) => {
    const quota = quotas.find(q => q.name === quotaName);
    return quota ? quota.used >= quota.max : false;
  };

  const isQuotaNearLimit = (quotaName: string) => {
    const quota = quotas.find(q => q.name === quotaName);
    return quota ? quota.used >= quota.max * 0.9 && quota.used < quota.max : false;
  };

  const resetQuota = async (quotaName: string) => {
    setLoading(true);
    try {
      // 这里应该调用实际的API来重置配额
      // await fetch('/api/quotas/reset', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ featureKey: quotaName }),
      // });

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 更新本地状态
      setQuotas(prev => prev.map(quota =>
        quota.name === quotaName ? { ...quota, used: 0 } : quota
      ));

      toast({
        title: '配额重置成功',
        description: `${quotaName}配额已重置为0`,
      });
    } catch (error) {
      toast({
        title: '重置配额失败',
        description: '无法重置配额，请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    quotas,
    loading,
    refreshQuotas,
    isQuotaExceeded,
    isQuotaNearLimit,
    resetQuota,
  };
};