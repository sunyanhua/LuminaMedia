import apiClient from './apiClient';

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    step: number;
    description: string;
    endpoint: string;
    expectedResult: string;
  }>;
  estimatedDuration: number;
  dataRequirements: string[];
}

export interface DemoExecutionResult {
  success: boolean;
  scenarioId: string;
  steps: Array<{
    step: number;
    success: boolean;
    response?: any;
    error?: string;
    duration: number;
  }>;
  totalDuration: number;
  summary: string;
}

/**
 * 演示服务
 */
export const demoService = {
  /**
   * 快速启动演示
   */
  quickStartDemo: (scenarioId?: string): Promise<DemoExecutionResult> => {
    return apiClient.post(`/api/v1/analytics/demo/quick-start`, { scenarioId });
  },

  /**
   * 获取演示场景列表
   */
  getDemoScenarios: (): Promise<DemoScenario[]> => {
    // 暂时返回商场客户场景
    return apiClient.get(`/api/v1/analytics/demo/scenario/mall-customer`);
  },

  /**
   * 获取商场客户场景数据
   */
  getMallCustomerScenario: (): Promise<any> => {
    return apiClient.get(`/api/v1/analytics/demo/scenario/mall-customer`);
  },

  /**
   * 执行单个演示步骤
   */
  executeDemoStep: (scenarioId: string, step: number): Promise<{ success: boolean; data: any }> => {
    return apiClient.post(`/api/v1/analytics/demo/step/${step}`, { scenarioId });
  },

  /**
   * 重置演示数据
   */
  resetDemoData: (): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/api/v1/analytics/demo/reset`);
  },

  /**
   * 获取演示进度
   */
  getDemoProgress: (): Promise<{
    completedScenarios: number;
    totalScenarios: number;
    currentScenario?: string;
    progressPercentage: number;
    completedSteps: number;
    totalSteps: number;
    stepProgress: Array<{ step: number; name: string; completed: boolean; timestamp?: string }>;
    recentActivity: Array<{ action: string; timestamp: string; details: string }>;
  }> => {
    return apiClient.get(`/api/v1/analytics/demo/progress`)
      .then(response => response.data)
      .catch(error => {
        console.error('获取演示进度失败:', error);
        // 回退到模拟数据
        return {
          completedScenarios: 0,
          totalScenarios: 1,
          currentScenario: undefined,
          progressPercentage: 0,
          completedSteps: 0,
          totalSteps: 6,
          stepProgress: [],
          recentActivity: [],
        };
      });
  },

  /**
   * 验证演示结果
   */
  validateDemoResult: (_scenarioId: string): Promise<{
    valid: boolean;
    score: number;
    feedback: string[];
    improvements: string[];
    validationChecks: Array<{ check: string; passed: boolean; details: string }>;
  }> => {
    return apiClient.get(`/api/v1/analytics/demo/validate`)
      .then(response => response.data)
      .catch(error => {
        console.error('验证演示结果失败:', error);
        // 回退到模拟数据
        return {
          valid: false,
          score: 0,
          feedback: ['验证过程发生错误'],
          improvements: ['请检查演示数据状态'],
          validationChecks: [],
        };
      });
  },

  /**
   * 生成演示报告
   */
  generateDemoReport: (_scenarioId: string): Promise<{
    reportUrl: string;
    html: string;
    pdfUrl?: string;
    generatedAt: string;
    reportId: string;
  }> => {
    return apiClient.get(`/api/v1/analytics/demo/report`)
      .then(response => response.data)
      .catch(error => {
        console.error('生成演示报告失败:', error);
        // 回退到模拟数据
        return {
          reportUrl: '/api/v1/analytics/demo/reports/error',
          html: '<h1>演示报告生成失败</h1><p>生成演示报告时发生错误。</p>',
          generatedAt: new Date().toISOString(),
          reportId: `error-${Date.now()}`,
        };
      });
  },
};

export default demoService;