import React, { useState } from 'react';
import { useDemoStore, useActiveScript, useScriptProgress, useIsProcessing } from '@/store/useDemoStore';
import { cn } from '@/lib/utils';
import { PlayCircle, PauseCircle, SkipForward, SkipBack, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const DemoScriptRunner: React.FC = () => {
  const activeScript = useActiveScript();
  const scriptProgress = useScriptProgress();
  const isProcessing = useIsProcessing();
  const startScript = useDemoStore((state) => state.startScript);
  const stopScript = useDemoStore((state) => state.stopScript);

  const demoScripts = [
    {
      id: 'quick-demo',
      name: '快速演示',
      description: '5分钟完整流程演示',
      duration: '5分钟',
      steps: 4,
      difficulty: '简单',
      icon: '🚀',
    },
    {
      id: 'deep-dive',
      name: '深度分析演示',
      description: '15分钟深度数据分析和策略制定演示',
      duration: '15分钟',
      steps: 6,
      difficulty: '中等',
      icon: '🔍',
    },
    {
      id: 'custom',
      name: '自定义演示',
      description: '根据需要自定义演示流程',
      duration: '可变',
      steps: 0,
      difficulty: '高级',
      icon: '⚙️',
    },
  ];

  const handleScriptStart = async (scriptId: string) => {
    if (isProcessing) {
      alert('当前有演示正在进行，请等待完成或停止当前演示');
      return;
    }
    await startScript(scriptId);
  };

  const handleScriptStop = () => {
    if (window.confirm('确定要停止当前演示吗？')) {
      stopScript();
    }
  };

  return (
    <div className="demo-script-runner bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">演示脚本运行器</h3>
          <p className="text-sm text-slate-400 mt-1">选择预置脚本或自定义演示流程</p>
        </div>
        {activeScript && (
          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-400">
              正在运行: <span className="font-medium text-amber-500">{activeScript.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* 脚本列表 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {demoScripts.map((script) => {
          const isActive = activeScript?.id === script.id;
          const isDisabled = isProcessing && !isActive;

          return (
            <div
              key={script.id}
              className={cn(
                "script-card p-4 rounded-lg border transition-all",
                isActive
                  ? "bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30"
                  : isDisabled
                  ? "bg-slate-800/30 border-slate-800 opacity-50"
                  : "bg-slate-800/30 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{script.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-200">{script.name}</h4>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      script.difficulty === '简单' ? "bg-green-500/20 text-green-500" :
                      script.difficulty === '中等' ? "bg-yellow-500/20 text-yellow-500" :
                      "bg-purple-500/20 text-purple-500"
                    )}>
                      {script.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{script.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {script.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <SkipForward className="w-3 h-3" />
                      {script.steps} 步骤
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {isActive ? (
                  <button
                    className="w-full px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    onClick={handleScriptStop}
                  >
                    <PauseCircle className="w-4 h-4" />
                    停止演示
                  </button>
                ) : (
                  <button
                    className={cn(
                      "w-full px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-center gap-2",
                      isDisabled
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    )}
                    onClick={() => !isDisabled && handleScriptStart(script.id)}
                    disabled={isDisabled}
                  >
                    <PlayCircle className="w-4 h-4" />
                    {isDisabled ? '演示进行中' : '开始演示'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 进度指示器 */}
      {activeScript && (
        <div className="progress-section bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-slate-200">演示进度</h4>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-500">
                进行中
              </span>
            </div>
            <div className="text-sm text-slate-400">
              {Math.round(scriptProgress)}%
            </div>
          </div>

          {/* 进度条 */}
          <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300"
              style={{ width: `${scriptProgress}%` }}
            />
          </div>

          {/* 步骤指示 */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {activeScript.steps.map((step, index) => {
              const stepProgress = (index / activeScript.steps.length) * 100;
              const isCompleted = stepProgress < scriptProgress;
              const isCurrent = stepProgress <= scriptProgress && ((index + 1) / activeScript.steps.length) * 100 > scriptProgress;

              return (
                <div key={index} className="text-center">
                  <div className={cn(
                    "w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1",
                    isCompleted
                      ? "bg-green-500 text-slate-900"
                      : isCurrent
                      ? "bg-amber-500 text-slate-900"
                      : "bg-slate-700 text-slate-400"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : isCurrent ? (
                      <div className="animate-pulse w-2 h-2 rounded-full bg-slate-900" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    步骤 {index + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 当前步骤信息 */}
          <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <div className="text-sm font-medium text-slate-300">当前执行步骤</div>
            </div>
            <div className="text-sm text-slate-400">
              {activeScript.steps[Math.floor((scriptProgress / 100) * activeScript.steps.length)]?.action === 'import' && '数据导入: 正在处理客户数据文件...'}
              {activeScript.steps[Math.floor((scriptProgress / 100) * activeScript.steps.length)]?.action === 'analyze' && '数据分析: 正在运行AI智能分析...'}
              {activeScript.steps[Math.floor((scriptProgress / 100) * activeScript.steps.length)]?.action === 'generate' && '方案生成: 正在创建营销计划...'}
              {activeScript.steps[Math.floor((scriptProgress / 100) * activeScript.steps.length)]?.action === 'publish' && '内容发布: 正在发布到目标平台...'}
            </div>
          </div>
        </div>
      )}

      {/* 自定义演示选项 */}
      {!activeScript && (
        <div className="custom-demo-options mt-6 pt-6 border-t border-slate-800">
          <h4 className="font-medium text-slate-200 mb-4">自定义演示设置</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">数据量</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300">
                  <option value="small">小型数据集 (1,000条记录)</option>
                  <option value="medium" selected>中型数据集 (5,000条记录)</option>
                  <option value="large">大型数据集 (10,000条记录)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">分析深度</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300">
                  <option value="basic">基础分析</option>
                  <option value="standard" selected>标准分析</option>
                  <option value="advanced">深度分析</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">目标平台</label>
                <div className="flex flex-wrap gap-2">
                  {['微信公众号', '小红书', '抖音', '微博'].map(platform => (
                    <label key={platform} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded bg-slate-800 border-slate-700" defaultChecked />
                      <span className="text-sm text-slate-300">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">演示速度</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300">
                  <option value="slow">慢速 (适合详细讲解)</option>
                  <option value="normal" selected>正常速度</option>
                  <option value="fast">快速 (适合时间有限)</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2">
              <PlayCircle className="w-5 h-5" />
              启动自定义演示
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoScriptRunner;