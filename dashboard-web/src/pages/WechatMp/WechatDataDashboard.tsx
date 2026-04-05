import React, { useState, useEffect } from 'react';
import { Card, Grid, Statistic, List, Tag, Spin, Tabs, Select, DatePicker, Button, message } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { UserOutlined, EyeOutlined, LikeOutlined, ShareAltOutlined, SyncOutlined, RiseOutlined } from '@ant-design/icons';
import { wechatDashboardService, WechatDashboardSummary, ArticleRankItem } from '../../services/wechatDashboardService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

// 颜色配置
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const WechatDataDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<WechatDashboardSummary | null>(null);
  const [articleRank, setArticleRank] = useState<ArticleRankItem[]>([]);
  const [rankType, setRankType] = useState<'read' | 'like' | 'share'>('read');
  const [timeRange, setTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const [summary, rank] = await Promise.all([
        wechatDashboardService.getDashboardSummary(),
        wechatDashboardService.getArticleRank(rankType, 10),
      ]);
      setSummaryData(summary);
      setArticleRank(rank);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      message.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadData();
  }, []);

  // 当排行类型变化时重新加载文章排行
  useEffect(() => {
    const loadArticleRank = async () => {
      try {
        const rank = await wechatDashboardService.getArticleRank(rankType, 10);
        setArticleRank(rank);
      } catch (error) {
        console.error('Failed to load article rank:', error);
        message.error('文章排行加载失败');
      }
    };
    loadArticleRank();
  }, [rankType]);

  // 处理刷新
  const handleRefresh = () => {
    loadData();
    message.success('数据已刷新');
  };

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toLocaleString();
  };

  // 处理时间范围变化
  const handleTimeRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setTimeRange([dates[0], dates[1]]);
    }
  };

  // 准备趋势图表数据
  const prepareTrendData = () => {
    if (!summaryData?.weeklyTrend) {
      return [];
    }

    const { weeklyTrend } = summaryData;
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    return days.map((day, index) => ({
      name: day,
      粉丝数: weeklyTrend.fans[index] || 0,
      阅读量: weeklyTrend.read[index] || 0,
      点赞量: weeklyTrend.like[index] || 0,
      分享量: weeklyTrend.share[index] || 0,
    }));
  };

  // 准备指标卡片数据
  const statsCards = [
    {
      title: '公众号总数',
      value: summaryData?.totalAccounts || 0,
      icon: <UserOutlined />,
      color: '#1890ff',
      suffix: '个',
    },
    {
      title: '总粉丝数',
      value: formatNumber(summaryData?.totalFans || 0),
      icon: <UserOutlined />,
      color: '#52c41a',
      suffix: '',
    },
    {
      title: '总阅读量',
      value: formatNumber(summaryData?.totalRead || 0),
      icon: <EyeOutlined />,
      color: '#fa8c16',
      suffix: '',
    },
    {
      title: '总点赞数',
      value: formatNumber(summaryData?.totalLike || 0),
      icon: <LikeOutlined />,
      color: '#f5222d',
      suffix: '',
    },
    {
      title: '总分享数',
      value: formatNumber(summaryData?.totalShare || 0),
      icon: <ShareAltOutlined />,
      color: '#722ed1',
      suffix: '',
    },
    {
      title: '今日净增粉丝',
      value: summaryData?.netFansToday || 0,
      icon: <RiseOutlined />,
      color: '#13c2c2',
      suffix: '人',
    },
  ];

  // 今日数据卡片
  const todayStatsCards = [
    {
      title: '今日阅读',
      value: summaryData?.readToday || 0,
      change: '+12.5%',
      color: '#1890ff',
    },
    {
      title: '今日点赞',
      value: summaryData?.likeToday || 0,
      change: '+8.3%',
      color: '#52c41a',
    },
    {
      title: '今日分享',
      value: summaryData?.shareToday || 0,
      change: '+5.6%',
      color: '#fa8c16',
    },
  ];

  if (loading && !summaryData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="wechat-data-dashboard p-4">
      {/* 头部操作栏 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">微信公众号数据看板</h1>
          <p className="text-gray-500">
            数据更新时间: {summaryData ? dayjs(summaryData.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '--'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <RangePicker
            value={timeRange}
            onChange={handleTimeRangeChange}
            className="w-64"
          />
          <Select defaultValue="7days" className="w-32">
            <Option value="7days">最近7天</Option>
            <Option value="30days">最近30天</Option>
            <Option value="90days">最近90天</Option>
          </Select>
          <Button icon={<SyncOutlined />} onClick={handleRefresh}>
            刷新数据
          </Button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <Grid gutter={[16, 16]} className="mb-6">
        {statsCards.map((stat, index) => (
          <Grid key={index} xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title={
                  <div className="flex items-center">
                    <span style={{ color: stat.color, marginRight: 8 }}>
                      {stat.icon}
                    </span>
                    {stat.title}
                  </div>
                }
                value={stat.value}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 今日数据卡片 */}
      <Grid gutter={[16, 16]} className="mb-6">
        {todayStatsCards.map((stat, index) => (
          <Grid key={index} xs={24} sm={8} md={8} lg={8}>
            <Card>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-gray-500 text-sm">{stat.title}</div>
                  <div className="text-2xl font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
                <div className="text-green-500">{stat.change}</div>
              </div>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 图表区域 */}
      <div className="mb-6">
        <Card title="运营趋势分析">
          <Tabs defaultActiveKey="1">
            <TabPane tab="粉丝增长趋势" key="1">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="粉丝数"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabPane>
            <TabPane tab="互动数据趋势" key="2">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="阅读量" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="点赞量" stroke="#ffc658" />
                    <Line type="monotone" dataKey="分享量" stroke="#ff8042" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabPane>
            <TabPane tab="数据对比" key="3">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="阅读量" fill="#8884d8" />
                    <Bar dataKey="点赞量" fill="#82ca9d" />
                    <Bar dataKey="分享量" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </div>

      {/* 文章排行和粉丝画像 */}
      <Grid gutter={[16, 16]}>
        {/* 文章排行 */}
        <Grid xs={24} lg={16}>
          <Card
            title="热门文章排行"
            extra={
              <Select
                value={rankType}
                onChange={(value) => setRankType(value)}
                className="w-32"
              >
                <Option value="read">阅读量排行</Option>
                <Option value="like">点赞量排行</Option>
                <Option value="share">分享量排行</Option>
              </Select>
            }
          >
            <List
              dataSource={articleRank}
              renderItem={(item, index) => (
                <List.Item>
                  <div className="flex w-full">
                    <div className="w-8 flex items-center justify-center">
                      {index < 3 ? (
                        <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}>
                          {index + 1}
                        </Tag>
                      ) : (
                        <span className="text-gray-400">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-gray-500 text-sm">
                        {item.accountName} · {dayjs(item.publishTime).format('MM-DD HH:mm')}
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="text-center">
                        <div className="font-bold">{item.readCount}</div>
                        <div className="text-gray-500 text-xs">阅读</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{item.likeCount}</div>
                        <div className="text-gray-500 text-xs">点赞</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{item.shareCount}</div>
                        <div className="text-gray-500 text-xs">分享</div>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Grid>

        {/* 粉丝画像（模拟数据） */}
        <Grid xs={24} lg={8}>
          <Card title="粉丝画像分布">
            <Tabs defaultActiveKey="1">
              <TabPane tab="性别分布" key="1">
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: '男', value: 52 },
                          { name: '女', value: 48 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#0088FE" />
                        <Cell fill="#FF8042" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabPane>
              <TabPane tab="年龄分布" key="2">
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: '18-25', value: 15 },
                        { name: '26-35', value: 35 },
                        { name: '36-45', value: 30 },
                        { name: '46-55', value: 15 },
                        { name: '56+', value: 5 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabPane>
              <TabPane tab="地域分布" key="3">
                <List
                  size="small"
                  dataSource={[
                    { region: '北京', percentage: 25 },
                    { region: '上海', percentage: 20 },
                    { region: '广东', percentage: 18 },
                    { region: '浙江', percentage: 12 },
                    { region: '其他', percentage: 25 },
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <div className="w-full">
                        <div className="flex justify-between">
                          <span>{item.region}</span>
                          <span>{item.percentage}%</span>
                        </div>
                        <div className="mt-1">
                          <div
                            className="h-2 bg-blue-500 rounded"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Grid>
      </Grid>

      {/* 数据更新时间 */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        数据每5分钟自动更新，上次刷新时间: {dayjs().format('HH:mm:ss')}
        <Button type="link" size="small" onClick={handleRefresh}>
          立即刷新
        </Button>
      </div>
    </div>
  );
};

export default WechatDataDashboard;