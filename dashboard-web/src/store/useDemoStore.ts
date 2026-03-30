import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 类型定义
export interface CustomerData {
  id: string;
  name: string;
  gender: 'M' | 'F';
  age: number;
  mobile: string;
  email: string;
  registrationDate: string;
  membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  totalSpent: number;
  lastPurchaseDate?: string;
}

export interface AnalysisResult {
  id: string;
  type: string;
  title: string;
  summary: string;
  insights: string[];
  recommendations: string[];
  generatedAt: string;
  dataPoints: number;
}

export interface MarketingPlan {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  channels: string[];
  budget: number;
  timeline: string;
  expectedROI: number;
  status: 'draft' | 'review' | 'approved' | 'executing' | 'completed';
  createdAt: string;
}

export interface PublishedContent {
  id: string;
  title: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishDate: string;
  views?: number;
  engagement?: number;
  url?: string;
}

export type DemoStep = 'data-import' | 'analysis' | 'strategy' | 'content' | 'publish' | 'monitoring';

export interface OperationRecord {
  id: string;
  type: 'data_import' | 'analysis' | 'plan_generation' | 'content_creation' | 'publish' | 'reset';
  timestamp: string;
  details: any;
  success: boolean;
  duration?: number;
}

export interface DemoScriptStep {
  action: 'import' | 'analyze' | 'generate' | 'publish';
  params: any;
  delay?: number;
  validation?: (state: DemoState) => boolean;
}

export interface DemoScript {
  id: string;
  name: string;
  description: string;
  steps: DemoScriptStep[];
}

export interface DemoState {
  // 数据状态
  customerData: CustomerData[];
  analysisResults: AnalysisResult[];
  marketingPlans: MarketingPlan[];
  publishedContents: PublishedContent[];

  // 操作状态
  currentStep: DemoStep;
  operationHistory: OperationRecord[];
  isProcessing: boolean;
  activeScript?: DemoScript;
  scriptProgress: number;

  // 操作方法
  importData: (file: File) => Promise<void>;
  runAnalysis: () => Promise<void>;
  generatePlan: () => Promise<void>;
  publishContent: (platform: string) => Promise<void>;
  resetDemo: () => void;
  replayOperation: (recordId: string) => void;
  startScript: (scriptId: string) => Promise<void>;
  stopScript: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

// 生成模拟数据函数
const generateMockCustomerData = (count: number): CustomerData[] => {
  const mockNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
  const mockGenders: ('M' | 'F')[] = ['M', 'F'];
  const mockLevels: ('bronze' | 'silver' | 'gold' | 'platinum')[] = ['bronze', 'silver', 'gold', 'platinum'];

  return Array.from({ length: count }, (_, i) => ({
    id: `CUST${String(i).padStart(6, '0')}`,
    name: mockNames[i % mockNames.length] + (i % 3 === 0 ? '（企业）' : ''),
    gender: mockGenders[i % mockGenders.length],
    age: 25 + (i % 40),
    mobile: `138${String(10000000 + i).padStart(8, '0')}`,
    email: `user${i}@example.com`,
    registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    membershipLevel: mockLevels[i % mockLevels.length],
    points: Math.floor(Math.random() * 50000),
    totalSpent: Math.floor(Math.random() * 50000),
    lastPurchaseDate: Math.random() > 0.3 ?
      new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
  }));
};

const generateMockAnalysisResult = (): AnalysisResult => ({
  id: `analysis-${Date.now()}`,
  type: 'customer-segmentation',
  title: '客户细分分析报告',
  summary: '基于10,000条客户数据的深入分析，识别出5个关键客户细分群体。',
  insights: [
    '高价值客户群体（15%）贡献了45%的总收入',
    '年轻活跃群体（25%）具有最高的增长潜力',
    '家庭消费者群体（20%）表现出最强的忠诚度',
  ],
  recommendations: [
    '针对高价值客户推出专属会员权益',
    '针对年轻群体开发社交媒体营销活动',
    '为家庭消费者提供捆绑优惠和家庭套餐',
  ],
  generatedAt: new Date().toISOString(),
  dataPoints: 10000,
});

const generateMockMarketingPlan = (): MarketingPlan => ({
  id: `plan-${Date.now()}`,
  name: '五一黄金周促销活动',
  description: '针对年轻消费群体的五一假期专项营销活动',
  targetAudience: '年龄25-35岁，月消费500元以上的年轻白领',
  channels: ['微信公众号', '小红书', '抖音短视频', '线下门店'],
  budget: 50000,
  timeline: '2026-04-25 至 2026-05-05',
  expectedROI: 3.2,
  status: 'draft',
  createdAt: new Date().toISOString(),
});

const generateMockPublishedContent = (platform: string): PublishedContent => ({
  id: `content-${Date.now()}`,
  title: `五一促销活动宣传 - ${platform}`,
  platform,
  status: 'published',
  publishDate: new Date().toISOString(),
  views: Math.floor(Math.random() * 10000) + 1000,
  engagement: Math.random() * 0.1 + 0.05,
  url: `https://example.com/content/${Date.now()}`,
});

// 预置演示脚本
const demoScripts: DemoScript[] = [
  {
    id: 'quick-demo',
    name: '快速演示',
    description: '5分钟完整流程演示',
    steps: [
      { action: 'import', params: { fileType: 'csv', recordCount: 500 }, delay: 1000 },
      { action: 'analyze', params: { analysisType: 'full' }, delay: 2000 },
      { action: 'generate', params: { planType: 'promotion' }, delay: 1500 },
      { action: 'publish', params: { platforms: ['wechat', 'xiaohongshu'] } },
    ],
  },
  {
    id: 'deep-dive',
    name: '深度分析演示',
    description: '15分钟深度数据分析和策略制定演示',
    steps: [
      { action: 'import', params: { fileType: 'excel', recordCount: 10000 }, delay: 2000 },
      { action: 'analyze', params: { analysisType: 'segmentation' }, delay: 3000 },
      { action: 'analyze', params: { analysisType: 'behavior' }, delay: 3000 },
      { action: 'generate', params: { planType: 'retention' }, delay: 2000 },
      { action: 'generate', params: { planType: 'acquisition' }, delay: 2000 },
      { action: 'publish', params: { platforms: ['wechat', 'xiaohongshu', 'weibo'] } },
    ],
  },
];

export const useDemoStore = create<DemoState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      customerData: [],
      analysisResults: [],
      marketingPlans: [],
      publishedContents: [],
      currentStep: 'data-import',
      operationHistory: [],
      isProcessing: false,
      activeScript: undefined,
      scriptProgress: 0,

      // 导入数据
      importData: async (file: File) => {
        set({ isProcessing: true });

        // 模拟文件上传和处理延迟
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 生成模拟数据
        const mockData = generateMockCustomerData(1000);

        const record: OperationRecord = {
          id: `op-${Date.now()}`,
          type: 'data_import',
          timestamp: new Date().toISOString(),
          details: { fileName: file.name, recordCount: 1000 },
          success: true,
          duration: 1500,
        };

        set(state => ({
          customerData: mockData,
          isProcessing: false,
          currentStep: 'analysis',
          operationHistory: [...state.operationHistory, record],
        }));
      },

      // 运行分析
      runAnalysis: async () => {
        set({ isProcessing: true });

        // 模拟分析处理延迟
        await new Promise(resolve => setTimeout(resolve, 2000));

        const analysisResult = generateMockAnalysisResult();

        const record: OperationRecord = {
          id: `op-${Date.now()}`,
          type: 'analysis',
          timestamp: new Date().toISOString(),
          details: { analysisType: 'customer-segmentation', dataPoints: 1000 },
          success: true,
          duration: 2000,
        };

        set(state => ({
          analysisResults: [...state.analysisResults, analysisResult],
          isProcessing: false,
          currentStep: 'strategy',
          operationHistory: [...state.operationHistory, record],
        }));
      },

      // 生成营销计划
      generatePlan: async () => {
        set({ isProcessing: true });

        // 模拟计划生成延迟
        await new Promise(resolve => setTimeout(resolve, 1500));

        const marketingPlan = generateMockMarketingPlan();

        const record: OperationRecord = {
          id: `op-${Date.now()}`,
          type: 'plan_generation',
          timestamp: new Date().toISOString(),
          details: { planName: marketingPlan.name, budget: marketingPlan.budget },
          success: true,
          duration: 1500,
        };

        set(state => ({
          marketingPlans: [...state.marketingPlans, marketingPlan],
          isProcessing: false,
          currentStep: 'content',
          operationHistory: [...state.operationHistory, record],
        }));
      },

      // 发布内容
      publishContent: async (platform: string) => {
        set({ isProcessing: true });

        // 模拟发布延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        const publishedContent = generateMockPublishedContent(platform);

        const record: OperationRecord = {
          id: `op-${Date.now()}`,
          type: 'publish',
          timestamp: new Date().toISOString(),
          details: { platform, contentTitle: publishedContent.title },
          success: true,
          duration: 1000,
        };

        set(state => ({
          publishedContents: [...state.publishedContents, publishedContent],
          isProcessing: false,
          currentStep: 'monitoring',
          operationHistory: [...state.operationHistory, record],
        }));
      },

      // 重置演示
      resetDemo: () => {
        set({
          customerData: [],
          analysisResults: [],
          marketingPlans: [],
          publishedContents: [],
          currentStep: 'data-import',
          operationHistory: [],
          activeScript: undefined,
          scriptProgress: 0,
        });

        const record: OperationRecord = {
          id: `op-${Date.now()}`,
          type: 'reset',
          timestamp: new Date().toISOString(),
          details: { resetType: 'full' },
          success: true,
        };

        set(state => ({
          operationHistory: [...state.operationHistory, record],
        }));
      },

      // 回放操作
      replayOperation: (recordId: string) => {
        const record = get().operationHistory.find(r => r.id === recordId);
        if (!record) return;

        // 根据操作类型执行相应动作
        switch (record.type) {
          case 'data_import':
            // 模拟重新导入
            break;
          case 'analysis':
            // 模拟重新分析
            break;
          // 其他类型...
        }

        console.log(`回放操作: ${recordId}`, record);
      },

      // 开始演示脚本
      startScript: async (scriptId: string) => {
        const script = demoScripts.find(s => s.id === scriptId);
        if (!script) return;

        set({ activeScript: script, scriptProgress: 0, isProcessing: true });

        // 按步骤执行脚本
        for (let i = 0; i < script.steps.length; i++) {
          const step = script.steps[i];

          // 执行步骤延迟
          if (step.delay) {
            await new Promise(resolve => setTimeout(resolve, step.delay));
          }

          // 根据动作类型执行相应操作
          switch (step.action) {
            case 'import':
              await get().importData(new File([], 'demo-data.csv'));
              break;
            case 'analyze':
              await get().runAnalysis();
              break;
            case 'generate':
              await get().generatePlan();
              break;
            case 'publish':
              await get().publishContent(step.params.platforms[0]);
              break;
          }

          // 更新进度
          set({ scriptProgress: ((i + 1) / script.steps.length) * 100 });
        }

        set({ isProcessing: false, activeScript: undefined });
      },

      // 停止脚本
      stopScript: () => {
        set({ activeScript: undefined, isProcessing: false });
      },

      // 下一步
      nextStep: () => {
        const steps: DemoStep[] = ['data-import', 'analysis', 'strategy', 'content', 'publish', 'monitoring'];
        const currentIndex = steps.indexOf(get().currentStep);
        if (currentIndex < steps.length - 1) {
          set({ currentStep: steps[currentIndex + 1] });
        }
      },

      // 上一步
      prevStep: () => {
        const steps: DemoStep[] = ['data-import', 'analysis', 'strategy', 'content', 'publish', 'monitoring'];
        const currentIndex = steps.indexOf(get().currentStep);
        if (currentIndex > 0) {
          set({ currentStep: steps[currentIndex - 1] });
        }
      },
    }),
    { name: 'DemoStore' }
  )
);

// 导出一些常用的selector hooks
export const useCustomerData = () => useDemoStore((state) => state.customerData);
export const useAnalysisResults = () => useDemoStore((state) => state.analysisResults);
export const useMarketingPlans = () => useDemoStore((state) => state.marketingPlans);
export const usePublishedContents = () => useDemoStore((state) => state.publishedContents);
export const useCurrentStep = () => useDemoStore((state) => state.currentStep);
export const useOperationHistory = () => useDemoStore((state) => state.operationHistory);
export const useIsProcessing = () => useDemoStore((state) => state.isProcessing);
export const useActiveScript = () => useDemoStore((state) => state.activeScript);
export const useScriptProgress = () => useDemoStore((state) => state.scriptProgress);