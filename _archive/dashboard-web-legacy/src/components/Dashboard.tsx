import { useState, useEffect } from 'react'
import { Activity, TrendingUp, Users, MapPin, Database, PieChart, FileText, ScatterChart, Radar, Thermometer } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import { customerDataService, dashboardService } from '../services'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customerProfiles, setCustomerProfiles] = useState<any[]>([])
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null)
  const [profileStats, setProfileStats] = useState<Record<string, any> | null>(null)
  const [segments, setSegments] = useState<any[]>([])
  const [importJobs, setImportJobs] = useState<any[]>([])
  // 新图表数据状态
  const [scatterData, setScatterData] = useState<any>(null)
  const [radarData, setRadarData] = useState<any>(null)
  const [heatmapData, setHeatmapData] = useState<any>(null)

  // 获取客户档案数据
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 获取客户档案列表
        const profiles = await customerDataService.getCustomerProfiles()
        setCustomerProfiles(profiles)

        if (profiles.length > 0) {
          const firstProfile = profiles[0]
          setSelectedProfile(firstProfile)

          // 并行获取相关数据
          await Promise.allSettled([
            fetchProfileStats(firstProfile.id),
            fetchSegments(firstProfile.id),
            fetchImportJobs(firstProfile.id),
          ])

          // 获取新图表数据
          await fetchNewChartsData(firstProfile.id)
        }
      } catch (err: any) {
        console.error('获取客户数据失败:', err)
        setError(err.message || '获取客户数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerData()
  }, [])

  const fetchProfileStats = async (profileId: string) => {
    try {
      const stats = await customerDataService.getProfileStats(profileId)
      setProfileStats(stats)
    } catch (err) {
      console.error('获取档案统计失败:', err)
    }
  }


  const fetchSegments = async (profileId: string) => {
    try {
      const segments = await customerDataService.getCustomerSegments(profileId)
      setSegments(segments)
    } catch (err) {
      console.error('获取客户分群失败:', err)
    }
  }

  const fetchImportJobs = async (profileId: string) => {
    try {
      const jobs = await customerDataService.getImportJobsByProfile(profileId)
      setImportJobs(jobs)
    } catch (err) {
      console.error('获取导入任务失败:', err)
    }
  }

  // 获取新图表数据
  const fetchNewChartsData = async (profileId: string) => {
    try {
      // 并行获取所有新图表数据
      const [scatterResult, radarResult, heatmapResult] = await Promise.allSettled([
        dashboardService.getCustomerScatterChart(profileId),
        dashboardService.getCustomerRadarChart(profileId),
        dashboardService.getHeatmapChart(7, profileId),
      ])

      if (scatterResult.status === 'fulfilled') {
        setScatterData(scatterResult.value)
      }
      if (radarResult.status === 'fulfilled') {
        setRadarData(radarResult.value)
      }
      if (heatmapResult.status === 'fulfilled') {
        setHeatmapData(heatmapResult.value)
      }
    } catch (err) {
      console.error('获取新图表数据失败:', err)
    }
  }

  // 如果没有客户档案，显示模拟数据
  const stats = {
    totalCustomers: customerProfiles.length,
    totalRecords: profileStats?.totalRecords || 0,
    totalSegments: segments.length,
    totalImportJobs: importJobs.length,
    completedImports: importJobs.filter(job => job.status === 'SUCCESS').length,
    dataFreshness: profileStats?.dataFreshness || '未知',
  }

  // 用户活跃度曲线图配置
  const userActivityOption = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
      axisLabel: {
        color: '#9ca3af',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
      axisLabel: {
        color: '#9ca3af',
      },
      splitLine: {
        lineStyle: {
          color: '#1f2937',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        data: [1200, 2000, 1500, 3000, 2800, 2400, 3200],
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#f59e0b', // amber-500
          width: 3,
        },
        itemStyle: {
          color: '#f59e0b', // amber-500
          borderColor: '#0f172a',
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 158, 11, 0.3)' }, // amber-500 with opacity
              { offset: 1, color: 'rgba(245, 158, 11, 0)' },
            ],
          },
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: {
        color: '#f1f5f9',
      },
    },
  }

  // 消费频次分布饼图配置
  const consumptionOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: {
        color: '#f1f5f9',
      },
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: '#9ca3af',
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#0f172a',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#f1f5f9',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 35, name: '高频消费', itemStyle: { color: '#f59e0b' } }, // amber-500
          { value: 25, name: '中频消费', itemStyle: { color: '#d97706' } }, // amber-600
          { value: 20, name: '低频消费', itemStyle: { color: '#b45309' } }, // amber-700
          { value: 15, name: '潜在用户', itemStyle: { color: '#92400e' } }, // amber-800
          { value: 5, name: '沉默用户', itemStyle: { color: '#78350f' } }, // amber-900
        ],
      },
    ],
  }

  // 地理位置分布图配置（柱状图表示城市用户分布）
  const geoOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: {
        color: '#f1f5f9',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['北京', '上海', '广东', '浙江', '江苏', '四川', '湖北', '陕西', '辽宁', '福建'],
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
      axisLabel: {
        color: '#9ca3af',
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
      axisLabel: {
        color: '#9ca3af',
      },
      splitLine: {
        lineStyle: {
          color: '#1f2937',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        data: [2450, 2300, 2100, 1800, 1700, 1200, 950, 800, 750, 700],
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#f59e0b' }, // amber-500
              { offset: 1, color: '#d97706' }, // amber-600
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: '#d97706',
          },
        },
      },
    ],
  }

  // 客户散点图配置（客户价值 vs 消费频率）
  const scatterOption = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '7%',
      bottom: '10%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: '客户价值 (元)',
      nameLocation: 'middle',
      nameGap: 30,
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
      axisLabel: {
        color: '#9ca3af',
      },
      splitLine: {
        lineStyle: {
          color: '#1f2937',
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '消费频率 (次/月)',
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
      axisLabel: {
        color: '#9ca3af',
      },
      splitLine: {
        lineStyle: {
          color: '#1f2937',
          type: 'dashed',
        },
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `客户价值: ${params.data[0]}元<br>消费频率: ${params.data[1]}次/月`;
      },
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: {
        color: '#f1f5f9',
      },
    },
    series: [
      {
        type: 'scatter',
        symbolSize: (data: number[]) => {
          return Math.sqrt(data[2]) * 2; // 第三维数据表示客户规模
        },
        data: scatterData
          ? scatterData.labels.map((_label: string, index: number) => [
              scatterData.datasets[0].data[index],
              Math.floor(Math.random() * 50) + 1, // 模拟消费频率
              Math.floor(Math.random() * 20) + 5, // 模拟客户规模
            ])
          : Array.from({ length: 50 }, (_, _i) => [
              Math.floor(Math.random() * 10000) + 1000,
              Math.floor(Math.random() * 50) + 1,
              Math.floor(Math.random() * 20) + 5,
            ]),
        itemStyle: {
          color: {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.5,
            colorStops: [
              { offset: 0, color: '#f59e0b' }, // amber-500
              { offset: 1, color: '#d97706' }, // amber-600
            ],
          },
          opacity: 0.8,
        },
        emphasis: {
          itemStyle: {
            color: '#d97706',
            shadowBlur: 10,
            shadowColor: 'rgba(251, 191, 36, 0.5)',
          },
        },
      },
    ],
  }

  // 客户雷达图配置（客户分群特征对比）
  const radarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: {
        color: '#f1f5f9',
      },
    },
    radar: {
      indicator: radarData
        ? radarData.labels.map((label: string) => ({ name: label, max: 100 }))
        : [
            { name: '消费能力', max: 100 },
            { name: '忠诚度', max: 100 },
            { name: '活跃度', max: 100 },
            { name: '兴趣广度', max: 100 },
            { name: '转化潜力', max: 100 },
            { name: '社交影响力', max: 100 },
          ],
      center: ['50%', '50%'],
      radius: '65%',
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#1f2937',
          type: 'dashed',
        },
      },
      splitArea: {
        show: false,
      },
      axisName: {
        color: '#9ca3af',
        fontSize: 12,
      },
    },
    series: [
      {
        type: 'radar',
        data: radarData
          ? radarData.datasets.map((dataset: any) => ({
              name: dataset.label,
              value: dataset.data,
              itemStyle: {
                color: dataset.borderColor,
              },
              lineStyle: {
                color: dataset.borderColor,
                width: 2,
              },
              areaStyle: {
                color: dataset.backgroundColor,
                opacity: 0.3,
              },
            }))
          : [
              {
                name: '高价值VIP客户',
                value: [85, 70, 90, 75, 80, 65],
                itemStyle: { color: 'rgba(245, 158, 11, 1)' }, // amber-500
                lineStyle: { color: 'rgba(245, 158, 11, 1)', width: 2 },
                areaStyle: { color: 'rgba(245, 158, 11, 0.3)' },
              },
              {
                name: '年轻时尚族群',
                value: [60, 50, 85, 90, 70, 95],
                itemStyle: { color: 'rgba(217, 119, 6, 1)' }, // amber-600
                lineStyle: { color: 'rgba(217, 119, 6, 1)', width: 2 },
                areaStyle: { color: 'rgba(217, 119, 6, 0.3)' },
              },
              {
                name: '家庭消费群体',
                value: [75, 85, 60, 65, 75, 50],
                itemStyle: { color: 'rgba(180, 83, 9, 1)' }, // amber-700
                lineStyle: { color: 'rgba(180, 83, 9, 1)', width: 2 },
                areaStyle: { color: 'rgba(180, 83, 9, 0.3)' },
              },
            ],
      },
    ],
  }

  // 热力图配置（时间×行为模式）
  const heatmapOption = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        return `时间: ${params.data[0]}<br>日期: ${params.data[1]}<br>活跃度: ${params.data[2]}`;
      },
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: {
        color: '#f1f5f9',
      },
    },
    grid: {
      top: '10%',
      bottom: '15%',
      left: '10%',
      right: '10%',
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      splitArea: {
        show: true,
      },
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
      axisLabel: {
        color: '#9ca3af',
        rotate: 45,
      },
    },
    yAxis: {
      type: 'category',
      data: heatmapData
        ? heatmapData.labels
        : Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }),
      splitArea: {
        show: true,
      },
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
      axisLabel: {
        color: '#9ca3af',
      },
    },
    visualMap: {
      min: 0,
      max: 120,
      calculable: true,
      orient: 'vertical',
      right: 10,
      top: 'center',
      inRange: {
        color: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'],
      },
      textStyle: {
        color: '#9ca3af',
      },
    },
    series: [
      {
        type: 'heatmap',
        data: (() => {
          // 生成热力图数据
          const data = [];
          if (heatmapData && heatmapData.datasets && heatmapData.datasets[0]) {
            // 使用API数据
            const flatData = heatmapData.datasets[0].data;
            const hours = 24;
            const days = heatmapData.labels.length;
            for (let i = 0; i < hours; i++) {
              for (let j = 0; j < days; j++) {
                data.push([`${i}:00`, heatmapData.labels[j], flatData[i * days + j] || 0]);
              }
            }
          } else {
            // 模拟数据
            for (let i = 0; i < 24; i++) {
              for (let j = 0; j < 7; j++) {
                let value;
                if (i >= 9 && i <= 18) {
                  value = Math.floor(Math.random() * 80) + 40;
                } else if (i >= 19 && i <= 22) {
                  value = Math.floor(Math.random() * 60) + 30;
                } else {
                  value = Math.floor(Math.random() * 30) + 10;
                }
                const date = new Date();
                date.setDate(date.getDate() - (6 - j));
                data.push([`${i}:00`, `${date.getMonth() + 1}/${date.getDate()}`, value]);
              }
            }
          }
          return data;
        })(),
        label: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }

  const statCards = [
    {
      title: '客户档案',
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      change: '+2',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: '数据记录',
      value: stats.totalRecords.toLocaleString(),
      icon: Database,
      change: '+12.5%',
      color: 'text-amber-300',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: '客户分群',
      value: stats.totalSegments.toLocaleString(),
      icon: PieChart,
      change: '+3',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: '导入任务',
      value: `${stats.completedImports}/${stats.totalImportJobs}`,
      icon: FileText,
      change: stats.totalImportJobs > 0 ? `${Math.round((stats.completedImports / stats.totalImportJobs) * 100)}%` : '0%',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">正在加载客户数据...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
            <Activity className="text-destructive" size={24} />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">加载失败</h3>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button
            variant="default"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            重试
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 projector:space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground projector:text-3xl">客户数据洞察看板</h2>
          <p className="text-muted-foreground mt-1 projector:text-lg">基于客户数据分析的用户画像、消费行为与营销洞察</p>
          {selectedProfile && (
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-sm text-slate-500">当前档案:</span>
              <span className="text-sm text-amber-300 font-medium">{selectedProfile.customerName}</span>
              <span className="text-sm text-slate-500">({selectedProfile.industry})</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="default" className="flex items-center space-x-2">
            <TrendingUp size={18} />
            <span>生成报告</span>
          </Button>
          <Button variant="secondary" className="flex items-center space-x-2">
            <MapPin size={18} />
            <span>地域分析</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 projector:gap-8">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="p-6 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 ease-in-out projector:projector-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm projector:text-base">{card.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-2 projector:text-3xl">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm ${card.color} projector:text-base`}>{card.change}</span>
                    <span className="text-slate-500 text-sm ml-2 projector:text-base">vs 上周</span>
                  </div>
                </div>
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={card.color} size={24} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 projector:gap-10">
        {/* 用户活跃度曲线 */}
        <Card className="p-6 projector:projector-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground projector:text-xl">客户数据导入趋势</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground projector:text-base">过去7天</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="text-sm text-slate-300 projector:text-base">导入记录</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] projector:h-[500px]">
            <ReactECharts option={userActivityOption} style={{ height: '100%' }} />
          </div>
        </Card>

        {/* 消费频次分布 */}
        <Card className="p-6 projector:projector-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground projector:text-xl">客户分群分布</h3>
            <div className="text-sm text-muted-foreground projector:text-base">基于最近30天数据</div>
          </div>
          <div className="h-[300px] projector:h-[500px]">
            <ReactECharts option={consumptionOption} style={{ height: '100%' }} />
          </div>
        </Card>
      </div>

      {/* 地理位置分布 */}
      <Card className="p-6 projector:projector-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground projector:text-xl">客户地域分布</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground projector:text-base">中国大陆地区</span>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span className="text-sm text-slate-300 projector:text-base">客户密度</span>
            </div>
          </div>
        </div>
        <div className="h-[400px] projector:h-[600px]">
          <ReactECharts option={geoOption} style={{ height: '100%' }} />
        </div>
      </Card>

      {/* 新增图表类型 */}
      <Card className="p-6 projector:projector-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground projector:text-xl">深度客户洞察分析</h3>
          <div className="text-sm text-muted-foreground projector:text-base">新增图表类型展示</div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 客户散点图 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-foreground projector:text-lg">客户价值分布</h4>
              <ScatterChart size={18} className="text-violet-400" />
            </div>
            <div className="h-[300px] projector:h-[400px]">
              <ReactECharts option={scatterOption} style={{ height: '100%' }} />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center projector:text-sm">客户价值 vs 消费频率散点分析</p>
          </div>

          {/* 客户雷达图 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-foreground projector:text-lg">客户分群特征对比</h4>
              <Radar size={18} className="text-amber-400" />
            </div>
            <div className="h-[300px] projector:h-[400px]">
              <ReactECharts option={radarOption} style={{ height: '100%' }} />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center projector:text-sm">不同客户群体特征雷达图</p>
          </div>

          {/* 热力图 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-foreground projector:text-lg">用户活跃热力图</h4>
              <Thermometer size={18} className="text-rose-400" />
            </div>
            <div className="h-[300px] projector:h-[400px]">
              <ReactECharts option={heatmapOption} style={{ height: '100%' }} />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center projector:text-sm">24小时×7天用户活跃度分布</p>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6 projector:projector-card">
        <h3 className="text-lg font-semibold text-foreground mb-6 projector:text-xl">最近客户行为</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 text-left text-muted-foreground font-medium projector:text-base">客户ID</th>
                <th className="py-3 px-4 text-left text-muted-foreground font-medium projector:text-base">行为类型</th>
                <th className="py-3 px-4 text-left text-muted-foreground font-medium projector:text-base">内容</th>
                <th className="py-3 px-4 text-left text-muted-foreground font-medium projector:text-base">时间</th>
                <th className="py-3 px-4 text-left text-muted-foreground font-medium projector:text-base">平台</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'CUST001', action: '数据导入', content: '商场客户数据导入', time: '10:30', platform: 'CSV文件' },
                { id: 'CUST002', action: '分群创建', content: '高价值客户分群', time: '11:15', platform: '分析引擎' },
                { id: 'CUST003', action: '分析完成', content: '客户画像分析报告', time: '12:45', platform: 'AI分析' },
                { id: 'CUST004', action: '策略生成', content: '个性化营销策略', time: '14:20', platform: 'AI智策' },
                { id: 'CUST005', action: '报告导出', content: '客户分析报告导出', time: '15:50', platform: '数据看板' },
              ].map((item, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-gray-900/30">
                  <td className="py-3 px-4 text-foreground font-medium">{item.id}</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-500/20 text-green-500 border border-green-500/30">{item.action}</Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{item.content}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.time}</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30">{item.platform}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard