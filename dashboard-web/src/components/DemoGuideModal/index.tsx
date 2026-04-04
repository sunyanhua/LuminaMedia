import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, RotateCcw, Play, BookOpen } from 'lucide-react';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoGuideModal: React.FC<DemoGuideModalProps> = ({ isOpen, onClose }) => {
  const [showOnStartup, setShowOnStartup] = useState(true);

  // 检查是否应该显示引导（首次访问或用户选择始终显示）
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenDemoGuide');
    const showGuidePreference = localStorage.getItem('showDemoGuideOnStartup');

    if (hasSeenGuide && showGuidePreference === 'false') {
      // 用户选择不再显示，不打开模态框
      return;
    }

    // 如果是首次访问，则打开模态框
    if (!hasSeenGuide) {
      // 不需要额外操作，因为父组件会控制isOpen
    }
  }, []);

  const handleClose = () => {
    if (!showOnStartup) {
      localStorage.setItem('showDemoGuideOnStartup', 'false');
    } else {
      localStorage.setItem('showDemoGuideOnStartup', 'true');
    }
    localStorage.setItem('hasSeenDemoGuide', 'true');
    onClose();
  };

  const guideSteps = [
    {
      title: "版本选择",
      description: "首先选择您想体验的版本：商务版或政务版",
      icon: <BookOpen className="w-5 h-5 text-amber-500" />
    },
    {
      title: "功能探索",
      description: "浏览左侧导航栏，了解各个功能模块",
      icon: <Play className="w-5 h-5 text-blue-500" />
    },
    {
      title: "演示数据",
      description: "使用演示数据快速体验平台功能",
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
    },
    {
      title: "配额管理",
      description: "注意右侧面板中的配额使用情况",
      icon: <RotateCcw className="w-5 h-5 text-purple-500" />
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-2xl bg-slate-900 border-slate-800 max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          // 阻止点击外部关闭，需要用户主动点击关闭
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <DialogTitle className="text-xl text-slate-100">
                欢迎使用灵曜智媒演示系统
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                以下是使用指南，帮助您快速上手
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h3 className="font-semibold text-slate-200 mb-2">系统特色</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30 mr-2">AI驱动</Badge>
                <span>集成Gemini、通义千问等AI模型</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 mr-2">双版系统</Badge>
                <span>商务版与政务版独立功能体系</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mr-2">演示模式</Badge>
                <span>所有操作均在模拟环境中进行</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 mb-3">快速上手指南</h3>
            <div className="space-y-4">
              {guideSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <div className="mt-0.5 flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-200">{step.title}</h4>
                    <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
            <h4 className="font-medium text-blue-200 flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5" />
              演示环境说明
            </h4>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• 所有数据操作均为模拟，不影响真实数据</li>
              <li>• 配额有使用限制，每日自动重置</li>
              <li>• 可随时重置演示数据以获得全新体验</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-4 border-t border-slate-800">
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnStartup}
              onChange={(e) => setShowOnStartup(e.target.checked)}
              className="w-4 h-4 text-amber-600 bg-slate-800 border-slate-700 rounded focus:ring-amber-500 focus:ring-offset-slate-900"
            />
            <span>下次启动时再次显示此指南</span>
          </label>

          <Button
            onClick={handleClose}
            className="bg-amber-600 hover:bg-amber-700 text-slate-950 px-6"
          >
            开始体验
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoGuideModal;