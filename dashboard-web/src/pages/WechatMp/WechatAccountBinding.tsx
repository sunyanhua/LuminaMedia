import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  QrCode,
  RefreshCw,
  Users,
  Eye,
  Heart,
  Share2,
  BarChart3,
  CheckCircle,
  XCircle,
  Link,
  Settings,
  ExternalLink,
  Download,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import env from '@/config/env';

// 微信公众号账号类型定义
interface WechatAccount {
  id: string;
  mpName: string;
  wechatId: string;
  wechatName: string;
  avatarUrl?: string;
  fansCount: number;
  totalRead: number;
  totalLike: number;
  totalShare: number;
  isEnabled: boolean;
  status: 'active' | 'expired' | 'pending';
  boundAt: string;
  lastUsedAt?: string;
  lastDataUpdate?: string;
}

// 统计数据接口
interface WechatStats {
  fansCount: number;
  totalRead: number;
  totalLike: number;
  totalShare: number;
  today: {
    newFans: number;
    lostFans: number;
    netFans: number;
    readCount: number;
    likeCount: number;
    shareCount: number;
    commentCount: number;
  };
  weeklyTrend: {
    fans: number[];
    read: number[];
    like: number[];
    share: number[];
  };
  topArticles: Array<{
    title: string;
    publishTime: string;
    readCount: number;
    likeCount: number;
    shareCount: number;
    url: string;
  }>;
  fanProfile: {
    gender: { male: number; female: number };
    age: Record<string, number>;
    region: Record<string, number>;
  };
  updatedAt: string;
}

const WechatAccountBinding: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<WechatAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [accountDetails, setAccountDetails] = useState<any>(null);
  const [accountStats, setAccountStats] = useState<WechatStats | null>(null);
  const [authorizing, setAuthorizing] = useState(false);
  const [activeTab, setActiveTab] = useState('binding');

  // 获取已绑定账号列表
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch(`${env.apiBaseUrl}/api/wechat-official-accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAccounts(data.data);
          if (data.data.length > 0 && !selectedAccount) {
            setSelectedAccount(data.data[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch WeChat accounts:', error);
      toast({
        title: '获取失败',
        description: '无法获取微信公众号列表',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取账号详情
  const fetchAccountDetails = async (accountId: string) => {
    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch(`${env.apiBaseUrl}/api/wechat-official-accounts/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAccountDetails(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch account details:', error);
    }
  };

  // 获取账号统计数据
  const fetchAccountStats = async (accountId: string) => {
    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch(`${env.apiBaseUrl}/api/wechat-official-accounts/${accountId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAccountStats(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch account stats:', error);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchAccounts();
  }, []);

  // 当选中账号变化时加载详情和统计数据
  useEffect(() => {
    if (selectedAccount) {
      fetchAccountDetails(selectedAccount);
      fetchAccountStats(selectedAccount);
    }
  }, [selectedAccount]);

  // 处理微信公众号授权绑定
  const handleWechatAuth = async () => {
    setAuthorizing(true);
    try {
      // 获取授权URL
      const token = localStorage.getItem('lumina-token');
      const redirectUri = `${window.location.origin}/government/wechat-mp/callback`;

      const response = await fetch(
        `${env.apiBaseUrl}/api/wechat-official-accounts/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 在DEMO环境中，我们直接模拟授权回调
          // 在实际环境中，这里会重定向到微信授权页面

          // 模拟授权流程
          toast({
            title: '模拟授权',
            description: 'DEMO环境中将模拟微信公众号授权流程',
          });

          // 模拟授权回调
          const callbackResponse = await fetch(
            `${env.apiBaseUrl}/api/wechat-official-accounts/auth-callback?code=DEMO_AUTH_CODE&state=${data.data.state}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (callbackResponse.ok) {
            const callbackData = await callbackResponse.json();
            if (callbackData.success) {
              toast({
                title: '绑定成功',
                description: `已成功绑定微信公众号: ${callbackData.mpName}`,
              });
              // 重新加载账号列表
              await fetchAccounts();
            } else {
              toast({
                title: '绑定失败',
                description: callbackData.message || '授权失败',
                variant: 'destructive',
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('WeChat authorization failed:', error);
      toast({
        title: '授权失败',
        description: '微信公众号授权过程出现错误',
        variant: 'destructive',
      });
    } finally {
      setAuthorizing(false);
    }
  };

  // 刷新账号数据
  const handleRefreshData = async (accountId: string) => {
    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch(
        `${env.apiBaseUrl}/api/wechat-official-accounts/${accountId}/update-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: '数据更新成功',
            description: '已从微信API同步最新数据',
          });
          // 重新加载数据
          fetchAccountDetails(accountId);
          fetchAccountStats(accountId);
        }
      }
    } catch (error) {
      console.error('Failed to refresh account data:', error);
      toast({
        title: '更新失败',
        description: '无法更新公众号数据',
        variant: 'destructive',
      });
    }
  };

  // 解除绑定
  const handleUnbindAccount = async (accountId: string) => {
    if (!confirm('确定要解除绑定这个微信公众号吗？')) {
      return;
    }

    try {
      const token = localStorage.getItem('lumina-token');
      const response = await fetch(
        `${env.apiBaseUrl}/api/wechat-official-accounts/${accountId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: '解绑成功',
            description: '微信公众号已解除绑定',
          });
          // 更新账号列表
          setAccounts(accounts.filter(acc => acc.id !== accountId));
          if (selectedAccount === accountId) {
            setSelectedAccount(accounts.length > 1 ? accounts[1].id : null);
            setAccountDetails(null);
            setAccountStats(null);
          }
        }
      }
    } catch (error) {
      console.error('Failed to unbind account:', error);
      toast({
        title: '解绑失败',
        description: '无法解除绑定微信公众号',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">微信公众号管理</h1>
          <p className="text-muted-foreground">
            绑定和管理您的微信公众号，查看运营数据
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchAccounts()}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button
            onClick={handleWechatAuth}
            disabled={authorizing}
          >
            <QrCode className="w-4 h-4 mr-2" />
            {authorizing ? '授权中...' : '绑定新公众号'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="binding">账号绑定</TabsTrigger>
          <TabsTrigger value="stats">数据统计</TabsTrigger>
          <TabsTrigger value="settings">账号设置</TabsTrigger>
        </TabsList>

        {/* 账号绑定标签页 */}
        <TabsContent value="binding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>微信公众号绑定</CardTitle>
              <CardDescription>
                绑定您的微信公众号以进行内容发布和数据管理。DEMO环境中使用模拟授权流程。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 授权引导 */}
              <div className="border rounded-lg p-6 bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-500/20 p-3 rounded-full">
                    <QrCode className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">微信公众号授权</h3>
                    <p className="text-slate-300 mb-4">
                      点击下方按钮开始微信公众号授权流程。在DEMO环境中，我们将模拟完整的授权流程，包括扫码授权和令牌获取。
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">1</div>
                          <span className="font-medium">扫码授权</span>
                        </div>
                        <p className="text-sm text-slate-400">使用微信扫描二维码授权</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">2</div>
                          <span className="font-medium">确认授权</span>
                        </div>
                        <p className="text-sm text-slate-400">在微信中确认授权给灵曜智媒</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">3</div>
                          <span className="font-medium">完成绑定</span>
                        </div>
                        <p className="text-sm text-slate-400">获取公众号信息完成绑定</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleWechatAuth}
                      disabled={authorizing}
                      size="lg"
                      className="w-full md:w-auto"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      {authorizing ? '授权中...' : '开始微信公众号授权'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* 已绑定账号列表 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">已绑定的微信公众号</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-2 text-slate-400">加载中...</p>
                  </div>
                ) : accounts.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <QrCode className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                      <h4 className="text-lg font-medium mb-2">尚未绑定微信公众号</h4>
                      <p className="text-slate-400 mb-6">绑定后可以管理公众号内容和查看数据统计</p>
                      <Button onClick={handleWechatAuth} disabled={authorizing}>
                        <QrCode className="w-4 h-4 mr-2" />
                        立即绑定
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map((account) => (
                      <Card
                        key={account.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedAccount === account.id ? 'ring-2 ring-amber-500' : ''
                        }`}
                        onClick={() => setSelectedAccount(account.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                {account.mpName.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-semibold">{account.mpName}</h4>
                                <p className="text-sm text-slate-400">{account.wechatId}</p>
                              </div>
                            </div>
                            <Badge
                              variant={account.status === 'active' ? 'default' : 'secondary'}
                              className={account.status === 'active' ? 'bg-green-500' : ''}
                            >
                              {account.status === 'active' ? '已绑定' : '已过期'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-400">粉丝</span>
                              </div>
                              <div className="text-lg font-semibold">
                                {(account.fansCount / 10000).toFixed(1)}万
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-400">阅读</span>
                              </div>
                              <div className="text-lg font-semibold">
                                {(account.totalRead / 10000).toFixed(1)}万
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-400">点赞</span>
                              </div>
                              <div className="text-lg font-semibold">
                                {(account.totalLike / 1000).toFixed(1)}千
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Share2 className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-400">分享</span>
                              </div>
                              <div className="text-lg font-semibold">
                                {(account.totalShare / 1000).toFixed(1)}千
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-xs text-slate-400">
                              绑定于: {new Date(account.boundAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRefreshData(account.id);
                                }}
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnbindAccount(account.id);
                                }}
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 数据统计标签页 */}
        <TabsContent value="stats" className="space-y-4">
          {selectedAccount && accountDetails ? (
            <div className="space-y-6">
              {/* 账号概览 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{accountDetails.mpName} - 数据概览</CardTitle>
                      <CardDescription>
                        最后更新: {accountStats ? new Date(accountStats.updatedAt).toLocaleString() : '正在加载...'}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectedAccount && handleRefreshData(selectedAccount)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      更新数据
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {accountStats ? (
                    <>
                      {/* 关键指标卡片 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-400 mb-1">总粉丝数</p>
                                <h3 className="text-2xl font-bold">
                                  {(accountStats.fansCount / 10000).toFixed(1)}万
                                </h3>
                              </div>
                              <div className="bg-green-500/20 p-2 rounded-full">
                                <Users className="w-6 h-6 text-green-500" />
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">今日新增</span>
                                <span className="text-green-500">+{accountStats.today.newFans}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-400 mb-1">总阅读量</p>
                                <h3 className="text-2xl font-bold">
                                  {(accountStats.totalRead / 10000).toFixed(1)}万
                                </h3>
                              </div>
                              <div className="bg-blue-500/20 p-2 rounded-full">
                                <Eye className="w-6 h-6 text-blue-500" />
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">今日阅读</span>
                                <span className="text-blue-500">{accountStats.today.readCount}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-400 mb-1">总点赞数</p>
                                <h3 className="text-2xl font-bold">
                                  {(accountStats.totalLike / 1000).toFixed(1)}千
                                </h3>
                              </div>
                              <div className="bg-red-500/20 p-2 rounded-full">
                                <Heart className="w-6 h-6 text-red-500" />
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">今日点赞</span>
                                <span className="text-red-500">{accountStats.today.likeCount}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-400 mb-1">总分享数</p>
                                <h3 className="text-2xl font-bold">
                                  {(accountStats.totalShare / 1000).toFixed(1)}千
                                </h3>
                              </div>
                              <div className="bg-purple-500/20 p-2 rounded-full">
                                <Share2 className="w-6 h-6 text-purple-500" />
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">今日分享</span>
                                <span className="text-purple-500">{accountStats.today.shareCount}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* 热门文章 */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">热门文章</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {accountStats.topArticles.map((article, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <Badge variant="outline" className="mb-2">
                                    第{index + 1}名
                                  </Badge>
                                  <span className="text-xs text-slate-400">
                                    {new Date(article.publishTime).toLocaleDateString()}
                                  </span>
                                </div>
                                <h4 className="font-medium mb-2 line-clamp-2">{article.title}</h4>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                  <div>
                                    <p className="text-xs text-slate-400">阅读</p>
                                    <p className="font-semibold">{article.readCount}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-400">点赞</p>
                                    <p className="font-semibold">{article.likeCount}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-400">分享</p>
                                    <p className="font-semibold">{article.shareCount}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* 粉丝画像 */}
                      <Card>
                        <CardHeader>
                          <CardTitle>粉丝画像</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-medium mb-4">性别分布</h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">男性</span>
                                    <span className="text-sm font-medium">{accountStats.fanProfile.gender.male}%</span>
                                  </div>
                                  <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${accountStats.fanProfile.gender.male}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">女性</span>
                                    <span className="text-sm font-medium">{accountStats.fanProfile.gender.female}%</span>
                                  </div>
                                  <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div
                                      className="bg-pink-500 h-2 rounded-full"
                                      style={{ width: `${accountStats.fanProfile.gender.female}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-4">年龄分布</h4>
                              <div className="space-y-3">
                                {Object.entries(accountStats.fanProfile.age).map(([age, percent]) => (
                                  <div key={age}>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm">{age}岁</span>
                                      <span className="text-sm font-medium">{percent}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                      <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${percent}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-4">地域分布</h4>
                              <div className="space-y-3">
                                {Object.entries(accountStats.fanProfile.region).map(([region, percent]) => (
                                  <div key={region}>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm">{region}</span>
                                      <span className="text-sm font-medium">{percent}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                      <div
                                        className="bg-amber-500 h-2 rounded-full"
                                        style={{ width: `${percent}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                      <p className="mt-4 text-slate-400">加载统计数据...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="text-lg font-medium mb-2">请先选择或绑定微信公众号</h4>
                <p className="text-slate-400 mb-6">选择左侧的微信公众号以查看详细数据统计</p>
                <Button onClick={() => setActiveTab('binding')}>
                  前往账号绑定
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 账号设置标签页 */}
        <TabsContent value="settings" className="space-y-4">
          {selectedAccount && accountDetails ? (
            <Card>
              <CardHeader>
                <CardTitle>账号设置 - {accountDetails.mpName}</CardTitle>
                <CardDescription>
                  管理微信公众号的授权和配置信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">基本信息</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="mpName">公众号名称</Label>
                          <Input id="mpName" value={accountDetails.mpName} readOnly />
                        </div>
                        <div>
                          <Label htmlFor="wechatId">原始ID</Label>
                          <Input id="wechatId" value={accountDetails.wechatId} readOnly />
                        </div>
                        <div>
                          <Label htmlFor="wechatName">微信号</Label>
                          <Input id="wechatName" value={accountDetails.wechatName} readOnly />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">授权状态</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">绑定状态</span>
                          <Badge variant={accountDetails.status === 'active' ? 'default' : 'secondary'}>
                            {accountDetails.status === 'active' ? '已授权' : '已过期'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">绑定时间</span>
                          <span className="text-sm">{new Date(accountDetails.boundAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">最后使用</span>
                          <span className="text-sm">
                            {accountDetails.lastUsedAt ? new Date(accountDetails.lastUsedAt).toLocaleString() : '从未使用'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">令牌管理</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">访问令牌状态</span>
                          <Badge variant="outline" className="bg-green-500/20 text-green-500">
                            有效
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">令牌过期时间</span>
                          <span className="text-sm">
                            {accountDetails.config?.expiresAt
                              ? new Date(accountDetails.config.expiresAt).toLocaleString()
                              : '未知'}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => selectedAccount && handleRefreshData(selectedAccount)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          刷新访问令牌
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">危险操作</h4>
                      <div className="space-y-3">
                        <div className="p-3 border border-amber-500/30 rounded-lg bg-amber-500/10">
                          <p className="text-sm text-amber-500 mb-2">
                            解除绑定后将无法通过此公众号发布内容，需要重新授权才能恢复。
                          </p>
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => selectedAccount && handleUnbindAccount(selectedAccount)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            解除绑定
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Settings className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="text-lg font-medium mb-2">请先选择微信公众号</h4>
                <p className="text-slate-400">选择左侧的微信公众号以查看和修改设置</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WechatAccountBinding;