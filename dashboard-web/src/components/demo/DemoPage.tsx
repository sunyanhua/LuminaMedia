import React from 'react';
import DemoFlowGuide from './DemoFlowGuide';
import OperationHistory from './OperationHistory';
import DemoScriptRunner from './DemoScriptRunner';
import DemoStepContent from './DemoStepContent';
import { useDemoStore, useCurrentStep } from '@/store/useDemoStore';
import { cn } from '@/lib/utils';
import { PlayCircle, BarChart3, Users, Target, Zap, Download } from 'lucide-react';

const DemoPage: React.FC = () => {
  const currentStep = useCurrentStep();
  const customerData = useDemoStore((state) => state.customerData);
  const analysisResults = useDemoStore((state) => state.analysisResults);
  const marketingPlans = useDemoStore((state) => state.marketingPlans);
  const publishedContents = useDemoStore((state) => state.publishedContents);

  const stats = [
    { label: '客户数据', value: customerData.length, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
    { label: '分析报告', value: analysisResults.length, icon: BarChart3, color: 'text-purple-500', bgColor: 'bg-purple-500/20' },
    { label: '营销方案', value: marketingPlans.length, icon: Target, color: 'text-green-500', bgColor: 'bg-green-500/20' },
    { label: '发布内容', value: publishedContents.length, icon: Zap, color: 'text-amber-500', bgColor: 'bg-amber-500/20' },
  ];

  return (
    <div className="demo-page min-h-screen bg-slate-950 text-slate-200 p-4 md:p-6">
      {/* 页头 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">交互式演示中心</h1>
            <p className="text-slate-400">
              体验完整的营销自动化流程：从数据导入到效果监测的全链路展示
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              导出报告
            </button>
            <button
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2"
              onClick={() => useDemoStore.getState().resetDemo()}
            >
              <PlayCircle className="w-4 h-4" />
              重新开始
            </button>
          </div>
        </div>

        {/* 状态卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                    <div className="text-2xl font-bold text-slate-100 mt-1">{stat.value}</div>
                  </div>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", stat.bgColor)}>
                    <Icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {stat.value > 0 ? '已就绪' : '等待数据'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：流程引导和脚本运行器 */}
        <div className="lg:col-span-2 space-y-6">
          <DemoFlowGuide />
          <DemoScriptRunner />
        </div>

        {/* 右侧：操作记录 */}
        <div className="space-y-6">
          <OperationHistory />

          {/* 快速操作面板 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">快速操作</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex flex-col items-center justify-center gap-2"
                onClick={() => {
                  const file = new File(['demo-data'], '客户数据.csv', { type: 'text/csv' });
                  useDemoStore.getState().importData(file);
                }}
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm text-slate-300">导入数据</span>
              </button>
              <button
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex flex-col items-center justify-center gap-2"
                onClick={() => useDemoStore.getState().runAnalysis()}
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-sm text-slate-300">运行分析</span>
              </button>
              <button
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex flex-col items-center justify-center gap-2"
                onClick={() => useDemoStore.getState().generatePlan()}
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-sm text-slate-300">生成方案</span>
              </button>
              <button
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex flex-col items-center justify-center gap-2"
                onClick={() => useDemoStore.getState().publishContent('微信公众号')}
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-sm text-slate-300">发布内容</span>
              </button>
            </div>
          </div>

          {/* 演示提示 */}
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium text-slate-200">演示提示</h4>
                <p className="text-sm text-slate-400">开始前请阅读以下说明</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                此演示使用模拟数据，不会影响真实业务
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                点击左侧流程步骤可查看详细内容
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                使用预置脚本可快速体验完整流程
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                操作记录支持回放和历史追踪
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 步骤内容区域 */}
      <div className="mt-8">
        <DemoStepContent stepId={currentStep} />
      </div>
    </div>
  );
};

export default DemoPage;