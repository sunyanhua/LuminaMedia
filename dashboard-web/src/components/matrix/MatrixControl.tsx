import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CircleCheck as CheckCircle2, Clock, CircleAlert as AlertCircle, Sparkles, Image, Send, Loader as Loader2, Zap } from 'lucide-react';
import { useState } from 'react';
import { formatNumber } from '@/lib/formatters';
import { contentGenerationService } from '@/services';
import { Platform as PlatformEnum } from '@/types/platform';
import { toast } from 'sonner';

interface PlatformItem {
  id: string;
  name: string;
  status: 'connected' | 'syncing' | 'error';
  icon: string;
  accountName: string;
  posts: number;
  followers: number;
}

interface Task {
  id: string;
  platform: string;
  content: string;
  status: 'queued' | 'processing' | 'completed';
  progress: number;
  steps: string[];
  currentStep: number;
}

const platforms: PlatformItem[] = [
  {
    id: '1',
    name: '小红书',
    status: 'connected',
    icon: '📕',
    accountName: 'LuminaRetail官方',
    posts: 145,
    followers: 285000,
  },
  {
    id: '2',
    name: '微信公众号',
    status: 'connected',
    icon: '💬',
    accountName: '灵曜智媒服务号',
    posts: 89,
    followers: 452000,
  },
  {
    id: '3',
    name: '抖音',
    status: 'syncing',
    icon: '🎵',
    accountName: '@luminamedia',
    posts: 67,
    followers: 189000,
  },
  {
    id: '4',
    name: '微博',
    status: 'error',
    icon: '🔷',
    accountName: '@灵曜智媒',
    posts: 234,
    followers: 521000,
  },
];

const mockTasks: Task[] = [
  {
    id: '1',
    platform: '小红书',
    content: '春节促销活动 - 第一天',
    status: 'processing',
    progress: 65,
    steps: ['优化图片', '注入优化信息', '上传中', '成功'],
    currentStep: 2,
  },
  {
    id: '2',
    platform: '微信公众号',
    content: '每周通讯 - 会员福利',
    status: 'queued',
    progress: 0,
    steps: ['准备中', '定时安排', '发布'],
    currentStep: 0,
  },
  {
    id: '3',
    platform: '抖音',
    content: '产品展示视频',
    status: 'completed',
    progress: 100,
    steps: ['视频处理', '上传', '成功'],
    currentStep: 3,
  },
];

export function MatrixControl() {
  const [tasks] = useState<Task[]>(mockTasks);
  const [showAutomation, setShowAutomation] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  // @ts-ignore
  const [platformsToGenerate, setPlatformsToGenerate] = useState<PlatformEnum[]>([
    PlatformEnum.XHS,
    PlatformEnum.WECHAT_MP,
    PlatformEnum.DOUYIN,
  ]);

  const getStatusIcon = (status: PlatformItem['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'syncing':
        return <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: PlatformItem['status']) => {
    const variants = {
      connected: 'bg-green-500/10 text-green-500 border-green-500/30',
      syncing: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      error: 'bg-red-500/10 text-red-500 border-red-500/30',
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {status === 'connected' && '已连接'}
        {status === 'syncing' && '同步中'}
        {status === 'error' && '需要操作'}
      </Badge>
    );
  };

  const handleGenerateContentForMatrix = async () => {
    if (generating) return;

    setGenerating(true);
    setGeneratedContent(null);

    try {
      toast.info('正在为多平台生成内容...');
      const result = await contentGenerationService.generateContentForMatrix(
        platformsToGenerate,
        '为商场春节促销活动生成多平台营销内容',
        'casual'
      );

      if (result.success && result.marketingContent) {
        setGeneratedContent(result.marketingContent);
        toast.success(`成功为${result.marketingContent.contents.length}个平台生成内容`);
      } else {
        toast.error(result.error?.message || '内容生成失败');
      }
    } catch (error: any) {
      console.error('生成内容失败:', error);
      toast.error(error.message || '请求失败，请检查网络连接');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">新媒体矩阵</h2>
          <p className="text-slate-400">一站式管理所有社交媒体平台</p>
        </div>
        <button
          onClick={() => setShowAutomation(!showAutomation)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {showAutomation ? '隐藏自动化' : '查看自动化'}
        </button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">已连接平台</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="p-5 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{platform.icon}</div>
                    <div>
                      <h4 className="font-semibold text-slate-200">{platform.name}</h4>
                      <p className="text-xs text-slate-500">{platform.accountName}</p>
                    </div>
                  </div>
                  {getStatusIcon(platform.status)}
                </div>

                <div className="space-y-2">
                  {getStatusBadge(platform.status)}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">发布数</span>
                    <span className="text-slate-200 font-semibold">{formatNumber(platform.posts)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">粉丝数</span>
                    <span className="text-slate-200 font-semibold">{formatNumber(platform.followers)}</span>
                  </div>
                </div>

                {platform.status === 'error' && (
                  <button
                    onClick={() => toast.info(`尝试重新连接 ${platform.name}`)}
                    className="w-full mt-3 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded border border-red-500/30 transition-colors"
                  >
                    重新连接
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showAutomation && (
        <Card className="bg-slate-900 border-amber-500/30 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-slate-100">自动发布模拟</CardTitle>
              </div>
              <Button
                onClick={handleGenerateContentForMatrix}
                disabled={generating}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    生成多平台内容
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-slate-400">实时任务执行流水线与AI内容生成</p>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-amber-500">生成内容预览</h4>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-500">
                      {generatedContent.campaignName}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    已为 {generatedContent.contents.length} 个平台生成内容，整体质量评分: {generatedContent.overallQualityScore}/100
                  </p>
                  <div className="space-y-3">
                    {generatedContent.contents.map((content: any, index: number) => (
                      <div key={index} className="p-3 bg-slate-800/50 rounded border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-slate-600">
                              {content.platform}
                            </Badge>
                            <span className="text-sm font-medium text-slate-300">{content.title}</span>
                          </div>
                          {content.qualityScore && (
                            <Badge variant="outline" className="border-green-500/50 text-green-500">
                              质量: {content.qualityScore}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2">{content.content}</p>
                        {content.hashtags && content.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {content.hashtags.slice(0, 3).map((tag: string, tagIndex: number) => (
                              <span key={tagIndex} className="text-xs px-2 py-0.5 bg-slate-700/50 rounded text-slate-400">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGeneratedContent(null)}
                      className="border-slate-600 text-slate-400 hover:text-slate-300"
                    >
                      返回任务视图
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 bg-slate-800/70 rounded-lg border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-200">{task.content}</h4>
                        <Badge variant="outline" className="border-slate-600 text-slate-400">
                          {task.platform}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        步骤 {task.currentStep + 1} / {task.steps.length}
                      </p>
                    </div>
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : task.status === 'processing' ? (
                      <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-500" />
                    )}
                  </div>

                  <Progress value={task.progress} className="h-2 mb-3" />

                  <div className="space-y-2">
                    {task.steps.map((step, index) => {
                      const isCompleted = index < task.currentStep;
                      const isCurrent = index === task.currentStep;
                      const isPending = index > task.currentStep;

                      return (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          {isCurrent && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
                          {isPending && <div className="w-4 h-4 rounded-full border-2 border-slate-600" />}
                          <span
                            className={
                              isCompleted
                                ? 'text-green-500'
                                : isCurrent
                                ? 'text-amber-500'
                                : 'text-slate-500'
                            }
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">任务队列</CardTitle>
          <p className="text-sm text-slate-400">已计划和待发布的内容</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                time: '14:30',
                platform: '小红书',
                title: '周末购物指南',
                type: '图文',
              },
              { time: '16:00', platform: '微信公众号', title: '限时秒杀提醒', type: '文章' },
              {
                time: '18:00',
                platform: '抖音',
                title: '晚间直播',
                type: '直播',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <Clock className="w-4 h-4 text-slate-500 mb-1" />
                    <span className="text-xs font-semibold text-amber-500">{item.time}</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-200">{item.title}</h5>
                    <p className="text-sm text-slate-500">
                      {item.platform} • {item.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.info(`预览 ${item.title} 的图片`)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Image className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => {
                      toast.success(`已安排 ${item.title} 在 ${item.time} 发布到 ${item.platform}`);
                    }}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
