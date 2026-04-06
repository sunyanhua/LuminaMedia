import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Plus, History, Lightbulb, ChevronRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MobileCard } from '@/components/mobile/MobileCard';

interface TopicRecommendation {
  title: string;
  description: string;
  reason: string;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  source: string;
  status: string;
  createdAt: string;
}

export default function TopicSelection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canEdit } = useAuth();

  const [recommendations, setRecommendations] = useState<TopicRecommendation[]>([]);
  const [topicHistory, setTopicHistory] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'ai' | 'manual' | 'history'>('ai');

  // 获取AI选题推荐
  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch('/api/topics/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        // 使用默认推荐
        setRecommendations([
          {
            title: '优化营商环境新政策解读',
            description: '解读最新出台的营商环境优化措施，帮助企业了解政策红利',
            reason: '政策热点，企业关注度高',
          },
          {
            title: '便民服务新举措上线',
            description: '介绍最新上线的便民服务措施，提升群众办事体验',
            reason: '贴近民生，实用性强',
          },
          {
            title: '绿色低碳生活方式倡导',
            description: '倡导绿色环保理念，分享低碳生活小贴士',
            reason: '符合时代主题，正能量',
          },
        ]);
      }
    } catch (error) {
      toast({
        title: '获取推荐失败',
        description: '使用默认推荐内容',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 获取选题历史
  const fetchTopicHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch('/api/topics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTopicHistory(data.topics || []);
      }
    } catch (error) {
      console.error('获取选题历史失败:', error);
    }
  }, []);

  // 刷新推荐
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
  };

  // 选择选题
  const handleSelectTopic = async (topic: TopicRecommendation) => {
    if (!canEdit()) {
      toast({
        title: '权限不足',
        description: '只有编辑和管理员可以创建选题',
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: topic.title,
          description: topic.description,
          source: 'ai_recommendation',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: '选题创建成功',
          description: '正在跳转到资料补充页面...',
        });
        // 跳转到资料补充页面
        navigate(`/government/material-supplement/${data.id}`);
      } else {
        throw new Error('创建选题失败');
      }
    } catch (error) {
      toast({
        title: '创建选题失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 手动创建选题
  const handleManualCreate = async () => {
    if (!manualTitle.trim()) {
      toast({
        title: '请输入选题标题',
        variant: 'destructive',
      });
      return;
    }

    if (!canEdit()) {
      toast({
        title: '权限不足',
        description: '只有编辑和管理员可以创建选题',
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: manualTitle,
          description: manualDescription,
          source: 'manual_creation',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: '选题创建成功',
          description: '正在跳转到资料补充页面...',
        });
        navigate(`/government/material-supplement/${data.id}`);
      } else {
        throw new Error('创建选题失败');
      }
    } catch (error) {
      toast({
        title: '创建选题失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 继续编辑历史选题
  const handleContinueTopic = (topicId: string) => {
    navigate(`/government/material-supplement/${topicId}`);
  };

  useEffect(() => {
    fetchRecommendations();
    fetchTopicHistory();
  }, [fetchRecommendations, fetchTopicHistory]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">选题策划</h1>
          <p className="text-slate-400 mt-1">选择AI推荐选题或手动创建新选题</p>
        </div>
      </div>

      {/* 选项卡 */}
      <div className="flex space-x-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'ai'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-1" />
          AI推荐
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'manual'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Plus className="w-4 h-4 inline mr-1" />
          手动创建
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4 inline mr-1" />
          选题历史
        </button>
      </div>

      {/* AI推荐选题 */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">AI智能推荐</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              换一批
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((topic, index) => (
                <MobileCard key={index} className="flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      推荐 {index + 1}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-2">{topic.title}</h3>
                  <p className="text-slate-400 text-sm mb-3 flex-grow">{topic.description}</p>
                  <div className="text-xs text-slate-500 mb-4">
                    <span className="text-amber-500/70">推荐理由：</span>{topic.reason}
                  </div>
                  <Button
                    onClick={() => handleSelectTopic(topic)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    选择此选题
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </MobileCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 手动创建 */}
      {activeTab === 'manual' && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">手动创建选题</CardTitle>
            <CardDescription className="text-slate-400">
              输入您想要创作的选题标题和说明
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">选题标题</label>
              <Input
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="请输入选题标题..."
                className="bg-slate-800 border-slate-600 text-slate-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">选题说明</label>
              <Textarea
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="请输入选题说明（可选）..."
                rows={4}
                className="bg-slate-800 border-slate-600 text-slate-100"
              />
            </div>
            <Button
              onClick={handleManualCreate}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建选题
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 选题历史 */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">选题历史</h2>
          {topicHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无选题历史</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {topicHistory.map((topic) => (
                <MobileCard key={topic.id} className="flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant="secondary"
                      className={
                        topic.source === 'ai_recommendation'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }
                    >
                      {topic.source === 'ai_recommendation' ? 'AI推荐' : '手动创建'}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(topic.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-slate-100 mb-2">{topic.title}</h3>
                  {topic.description && (
                    <p className="text-slate-400 text-sm mb-3 flex-grow">{topic.description}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContinueTopic(topic.id)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    继续编辑
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </MobileCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
