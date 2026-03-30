import React, { useState } from 'react';
import { useDemoStore, useCurrentStep, useCustomerData, useAnalysisResults, useMarketingPlans, usePublishedContents } from '@/store/useDemoStore';
import { cn } from '@/lib/utils';
import { PlayCircle, BarChart3, FileText, Send, Eye, Download, Upload } from 'lucide-react';

const DemoFlowGuide: React.FC = () => {
  const steps = [
    { id: 'data-import', title: '数据导入', description: '导入商场客户数据', icon: Upload },
    { id: 'analysis', title: '数据分析', description: 'AI智能分析用户画像', icon: BarChart3 },
    { id: 'strategy', title: '营销策划', description: '生成个性化营销方案', icon: FileText },
    { id: 'content', title: '内容生成', description: '创建多平台宣传内容', icon: Send },
    { id: 'publish', title: '发布跟踪', description: '发布并监测效果', icon: PlayCircle },
    { id: 'monitoring', title: '效果监测', description: '实时监控发布效果', icon: Eye },
  ];

  const currentStep = useCurrentStep();
  const customerData = useCustomerData();
  const analysisResults = useAnalysisResults();
  const marketingPlans = useMarketingPlans();
  const publishedContents = usePublishedContents();

  const getStepData = (stepId: string) => {
    switch (stepId) {
      case 'data-import':
        return { count: customerData.length, status: customerData.length > 0 ? '已完成' : '待开始' };
      case 'analysis':
        return { count: analysisResults.length, status: analysisResults.length > 0 ? '已完成' : '待开始' };
      case 'strategy':
        return { count: marketingPlans.length, status: marketingPlans.length > 0 ? '已完成' : '待开始' };
      case 'content':
        return { count: marketingPlans.length, status: marketingPlans.length > 0 ? '已完成' : '待开始' };
      case 'publish':
        return { count: publishedContents.length, status: publishedContents.length > 0 ? '已完成' : '待开始' };
      case 'monitoring':
        return { count: publishedContents.length, status: publishedContents.length > 0 ? '进行中' : '待开始' };
      default:
        return { count: 0, status: '待开始' };
    }
  };

  const handleStepClick = (stepId: string) => {
    // 可以在此添加步骤点击处理逻辑
    console.log(`切换到步骤: ${stepId}`);
  };

  return (
    <div className="demo-flow-guide bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">演示流程引导</h3>
          <p className="text-sm text-slate-400 mt-1">跟随引导完成完整的营销自动化流程</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-400">
            当前步骤: <span className="font-medium text-amber-500 capitalize">{currentStep.replace('-', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="demo-steps grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = index < steps.indexOf(currentStep as any);
          const stepData = getStepData(step.id);

          return (
            <div
              key={step.id}
              className={cn(
                "demo-step relative p-4 rounded-lg border transition-all cursor-pointer",
                isActive
                  ? "bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30"
                  : isCompleted
                  ? "bg-slate-800/50 border-slate-700"
                  : "bg-slate-800/30 border-slate-800 hover:bg-slate-800/50"
              )}
              onClick={() => handleStepClick(step.id)}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  isActive
                    ? "bg-amber-500/20 text-amber-500"
                    : isCompleted
                    ? "bg-green-500/20 text-green-500"
                    : "bg-slate-700 text-slate-400"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-200">{step.title}</h4>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      isActive
                        ? "bg-amber-500/20 text-amber-500"
                        : isCompleted
                        ? "bg-green-500/20 text-green-500"
                        : "bg-slate-700 text-slate-400"
                    )}>
                      {stepData.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                  {stepData.count > 0 && (
                    <div className="mt-2 text-xs text-slate-500">
                      已处理: <span className="text-slate-300">{stepData.count} 项</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 步骤编号 */}
              <div className={cn(
                "absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                isActive
                  ? "bg-amber-500 text-slate-900"
                  : isCompleted
                  ? "bg-green-500 text-slate-900"
                  : "bg-slate-700 text-slate-400"
              )}>
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            流程进度: <span className="font-medium text-slate-300">{steps.indexOf(currentStep as any) + 1}/{steps.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              onClick={() => useDemoStore.getState().prevStep()}
            >
              上一步
            </button>
            <button
              className="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              onClick={() => useDemoStore.getState().nextStep()}
            >
              下一步
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoFlowGuide;