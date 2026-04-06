import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus, MessageSquare, Eye, Share2 } from 'lucide-react';
import { MobileCard } from '@/components/mobile/MobileCard';
import { useToast } from '@/hooks/use-toast';

interface SentimentData {
  id: string;
  platform: 'WEIBO' | 'WECHAT' | 'DOUYIN' | 'XIAOHONGSHU';
  content: string;
  author: string;
  publishTime: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentimentScore: number;
  readCount: number;
  shareCount: number;
  commentCount: number;
  keywords: string[];
}

const platformNames: Record<string, string> = {
  WEIBO: '微博',
  WECHAT: '微信',
  DOUYIN: '抖音',
  XIAOHONGSHU: '小红书',
};

const platformColors: Record<string, string> = {
  WEIBO: 'bg-red-500/20 text-red-400',
  WECHAT: 'bg-green-500/20 text-green-400',
  DOUYIN: 'bg-blue-500/20 text-blue-400',
  XIAOHONGSHU: 'bg-pink-500/20 text-pink-400',
};

const sentimentConfig = {
  POSITIVE: { label: '正面', color: 'bg-green-500/20 text-green-400', icon: TrendingUp },
  NEGATIVE: { label: '负面', color: 'bg-red-500/20 text-red-400', icon: TrendingDown },
  NEUTRAL: { label: '中性', color: 'bg-slate-500/20 text-slate-400', icon: Minus },
};

export default function SentimentMonitor() {
  const { toast } = useToast();
  const [sentiments, setSentiments] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
  });

  // 模拟数据
  const mockSentiments: SentimentData[] = [
    {
      id: '1',
      platform: 'WEIBO',
      content: '政务服务中心新推出的便民服务真的很贴心，办事效率高了很多！',
      author: '市民小王',
      publishTime: '2026-04-06T10:00:00Z',
      sentiment: 'POSITIVE',
      sentimentScore: 0.85,
      readCount: 12500,
      shareCount: 320,
      commentCount: 89,
      keywords: ['政务服务', '便民服务'],
    },
    {
      id: '2',
      platform: 'WECHAT',
      content: '最新的环保政策解读得很清楚，希望能真正落实到位。',
      author: '环保关注者',
      publishTime: '2026-04-06T09:30:00Z',
      sentiment: 'NEUTRAL',
      sentimentScore: 0.5,
      readCount: 8200,
      shareCount: 156,
      commentCount: 45,
      keywords: ['环保政策', '政策解读'],
    },
    {
      id: '3',
      platform: 'DOUYIN',
      content: '交通拥堵问题还是没有改善，希望相关部门重视。',
      author: '上班族',
      publishTime: '2026-04-06T08:00:00Z',
      sentiment: 'NEGATIVE',
      sentimentScore: 0.25,
      readCount: 15600,
      shareCount: 890,
      commentCount: 234,
      keywords: ['交通', '拥堵'],
    },
    {
      id: '4',
      platform: 'XIAOHONGSHU',
      content: '发现一家超棒的社区图书馆，环境好藏书丰富！',
      author: '读书爱好者',
      publishTime: '2026-04-05T16:00:00Z',
      sentiment: 'POSITIVE',
      sentimentScore: 0.92,
      readCount: 6800,
      shareCount: 445,
      commentCount: 67,
      keywords: ['图书馆', '社区服务'],
    },
    {
      id: '5',
      platform: 'WEIBO',
      content: '新的医保政策对老百姓来说是好消息，报销比例提高了。',
      author: ' healthcare_watcher',
      publishTime: '2026-04-05T14:00:00Z',
      sentiment: 'POSITIVE',
      sentimentScore: 0.78,
      readCount: 22300,
      shareCount: 567,
      commentCount: 123,
      keywords: ['医保', '政策'],
    },
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setSentiments(mockSentiments);
      setStats({
        total: mockSentiments.length,
        positive: mockSentiments.filter(s => s.sentiment === 'POSITIVE').length,
        negative: mockSentiments.filter(s => s.sentiment === 'NEGATIVE').length,
        neutral: mockSentiments.filter(s => s.sentiment === 'NEUTRAL').length,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">舆情监测</h1>
        <p className="text-slate-400 mt-1">实时监测各平台舆情动态</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-100">{stats.total}</div>
            <div className="text-sm text-slate-400">今日舆情</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">{stats.positive}</div>
            <div className="text-sm text-slate-400">正面</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-400">{stats.negative}</div>
            <div className="text-sm text-slate-400">负面</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-400">{stats.neutral}</div>
            <div className="text-sm text-slate-400">中性</div>
          </CardContent>
        </Card>
      </div>

      {/* 舆情列表 */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-amber-600">全部</TabsTrigger>
          <TabsTrigger value="positive" className="data-[state=active]:bg-green-600">正面</TabsTrigger>
          <TabsTrigger value="negative" className="data-[state=active]:bg-red-600">负面</TabsTrigger>
          <TabsTrigger value="neutral" className="data-[state=active]:bg-slate-600">中性</TabsTrigger>
        </TabsList>

        {['all', 'positive', 'negative', 'neutral'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="space-y-4">
              {sentiments
                .filter((s) => tab === 'all' || s.sentiment.toLowerCase() === tab)
                .map((sentiment) => {
                  const SentimentIcon = sentimentConfig[sentiment.sentiment].icon;
                  return (
                    <MobileCard key={sentiment.id}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={platformColors[sentiment.platform]}>
                            {platformNames[sentiment.platform]}
                          </Badge>
                          <Badge className={sentimentConfig[sentiment.sentiment].color}>
                            <SentimentIcon className="w-3 h-3 mr-1" />
                            {sentimentConfig[sentiment.sentiment].label}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(sentiment.publishTime).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-slate-200 mb-3">{sentiment.content}</p>

                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                        <span>@{sentiment.author}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />{sentiment.readCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-4 h-4" />{sentiment.shareCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />{sentiment.commentCount}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {sentiment.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </MobileCard>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
