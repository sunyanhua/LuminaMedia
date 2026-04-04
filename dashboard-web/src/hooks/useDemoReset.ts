import { useState } from 'react';

interface DemoResetHook {
  resetDemoData: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useDemoReset = (): DemoResetHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetDemoData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 这里应该调用实际的API来重置演示数据
      // const response = await fetch('/api/analytics/demo/reset', {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // 假设使用JWT token
      //     'Content-Type': 'application/json',
      //   },
      // });

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      // if (!response.ok) {
      //   throw new Error('重置演示数据失败');
      // }

      // const result = await response.json();
      console.log('演示数据重置成功');

      // 显示成功消息（这里可以通过上下文或其他方式通知UI）
      alert('演示数据重置成功！');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '重置演示数据时发生未知错误';
      setError(errorMessage);
      console.error('重置演示数据失败:', err);

      // 显示错误消息
      alert(`重置演示数据失败: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    resetDemoData,
    loading,
    error,
  };
};