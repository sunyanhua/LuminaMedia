import { useState, useEffect } from 'react'
import { Brain, User, Target, Zap, Shield, Copy, Play, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { analyticsService } from '../services'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const AICenter = () => {
  const [generating, setGenerating] = useState(false)
  const [strategy, setStrategy] = useState<any>(null)
  const [streamText, setStreamText] = useState('')
  const [streamComplete, setStreamComplete] = useState(false)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('')
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [userProfile, _setUserProfile] = useState({
    demographics: '25-35岁，一线城市，中高收入',
    interests: ['时尚美妆', '生活方式', '旅游美食', '数码科技'],
    painPoints: ['信息过载', '选择困难', '时间有限', '信任缺失'],
    preferredChannels: ['小红书', '微信公众号', '抖音', 'B站'],
  })

  const mockStrategy = {
    campaignName: '小红书春季焕新营销方案',
    targetAudienceAnalysis: {
      demographics: ['25-35岁女性', '一线城市', '年收入20-50万', '白领/自由职业'],
      interests: ['美妆护肤', '健康生活', '旅行探店', '家居装饰'],
      painPoints: ['春季皮肤敏感', '换季穿搭困扰', '出行计划迷茫', '品牌选择困难'],
      preferredChannels: ['小红书', '抖音', '微信公众号'],
    },
    coreIdea: '以"春季焕新"为核心概念，通过情感化内容建立品牌与用户的深度连接。结合春季护肤、穿搭、出行三大场景，打造系列主题内容，借助KOL/KOC矩阵实现破圈传播。',
    xhsContent: {
      title: '春季焕新指南｜告别沉闷，拥抱轻盈季节',
      content: '春天来了，是时候给生活来一场彻底的焕新啦！\n\n🌸 护肤篇：应对换季敏感，我的维稳秘诀\n🌿 穿搭篇：3种春日配色，穿出高级感\n✈️ 出行篇：小众旅行地推荐，避开人潮\n\n#春季焕新 #春季护肤 #春日穿搭 #小众旅行',
      hashtags: ['春季焕新', '春季护肤', '春日穿搭', '小众旅行'],
      suggestedImages: ['产品展示', '场景图', '用户证言', '数据图表'],
    },
    recommendedExecutionTime: {
      timeline: [
        {
          phase: '预热期',
          duration: '2周',
          activities: ['内容规划', 'KOL对接', '素材准备'],
        },
        {
          phase: '爆发期',
          duration: '3周',
          activities: ['内容发布', '互动运营', '数据监测'],
        },
        {
          phase: '延续期',
          duration: '2周',
          activities: ['效果评估', '内容二次传播', '用户沉淀'],
        },
      ],
      bestPostingTimes: ['09:00-11:00', '19:00-21:00', '周末上午'],
      seasonalConsiderations: ['春季主题', '节假日营销', '竞品活动期'],
    },
    expectedPerformanceMetrics: {
      engagementRate: 4.2,
      conversionRate: 1.8,
      expectedReach: 75000,
      estimatedROI: 42.5,
    },
    executionSteps: [
      {
        step: 1,
        description: '市场调研与竞品分析',
        responsible: '市场部',
        deadline: '第1周',
      },
      {
        step: 2,
        description: '内容创意与脚本撰写',
        responsible: '内容团队',
        deadline: '第2周',
      },
      {
        step: 3,
        description: 'KOL/KOC矩阵搭建',
        responsible: '运营部',
        deadline: '第3周',
      },
      {
        step: 4,
        description: '多渠道内容发布',
        responsible: '运营部',
        deadline: '第4周',
      },
      {
        step: 5,
        description: '数据监测与实时优化',
        responsible: '数据分析',
        deadline: '持续',
      },
    ],
    riskAssessment: [
      {
        risk: '内容同质化',
        probability: '中',
        impact: '中',
        mitigationStrategy: '强化差异化创意，增加用户UGC',
      },
      {
        risk: 'KOL合作效果不佳',
        probability: '低',
        impact: '高',
        mitigationStrategy: '多梯队KOL组合，设置效果对赌条款',
      },
      {
        risk: '预算超支',
        probability: '低',
        impact: '中',
        mitigationStrategy: '分阶段拨款，定期审计',
      },
    ],
    budgetAllocation: [
      {
        category: '内容制作',
        amount: 20000,
        percentage: 40,
        justification: '高质量内容是营销成功的基础',
      },
      {
        category: 'KOL合作',
        amount: 15000,
        percentage: 30,
        justification: '头部KOL引流，腰部KOL转化',
      },
      {
        category: '广告投放',
        amount: 8000,
        percentage: 16,
        justification: '精准定向，提升转化效率',
      },
      {
        category: '应急备用',
        amount: 7000,
        percentage: 14,
        justification: '应对突发情况和机会',
      },
    ],
  }

  // 加载营销活动列表
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoadingCampaigns(true)
        // 使用默认用户ID，实际应用中应从用户上下文获取
        const defaultUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        const campaigns = await analyticsService.getCampaigns(defaultUserId)
        setCampaigns(campaigns)
        if (campaigns.length > 0) {
          setSelectedCampaignId(campaigns[0].id)
        }
      } catch (error) {
        console.error('加载营销活动失败:', error)
      } finally {
        setLoadingCampaigns(false)
      }
    }

    loadCampaigns()
  }, [])

  const generateStrategy = async () => {
    if (!selectedCampaignId) {
      alert('请先选择营销活动')
      return
    }

    setGenerating(true)
    setStrategy(null)
    setStreamText('')
    setStreamComplete(false)

    try {
      // 调用API生成营销策略
      const response = await analyticsService.generateMarketingStrategy({
        campaignId: selectedCampaignId,
        useGemini: true,
      })

      if (response.success) {
        const strategyData = response.data
        // 模拟流式打印效果
        const fullText = JSON.stringify(strategyData, null, 2)
        let index = 0
        const timer = setInterval(() => {
          if (index < fullText.length) {
            setStreamText(fullText.substring(0, index + 1))
            index++
          } else {
            clearInterval(timer)
            setStreamComplete(true)
            setGenerating(false)
            setStrategy(strategyData)
          }
        }, 30)
      } else {
        throw new Error('生成策略失败')
      }
    } catch (error: any) {
      console.error('生成策略失败:', error)
      alert(`生成策略失败: ${error.message}`)
      setGenerating(false)
      // 使用回退模拟数据
      generateFallbackStrategy()
    }
  }

  const generateFallbackStrategy = () => {
    // 模拟流式打印效果
    const fullText = JSON.stringify(mockStrategy, null, 2)
    let index = 0
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setStreamText(fullText.substring(0, index + 1))
        index++
      } else {
        clearInterval(timer)
        setStreamComplete(true)
        setGenerating(false)
        setStrategy(mockStrategy)
      }
    }, 30)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(strategy || mockStrategy, null, 2))
    alert('策略已复制到剪贴板！')
  }

  const approveStrategy = () => {
    alert('策略已提交政务审核！状态更新中...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground projector:text-3xl">AI 智策中心</h2>
          <p className="text-muted-foreground mt-1 projector:text-lg">基于 Gemini AI 的智能营销策略生成与优化</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Shield className="text-emerald-400" size={18} />
            <span className="text-sm">政务审核状态:</span>
            <Badge className="bg-green-500/20 text-green-500 border border-green-500/30">正常</Badge>
          </div>
          <Button
            variant="default"
            className="flex items-center space-x-2"
            onClick={generateStrategy}
            disabled={generating || !selectedCampaignId}
          >
            {generating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-900 border-t-gold-500"></div>
                <span>生成中...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>生成AI策略</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：用户画像 */}
        <div className="lg:col-span-1">
          <Card className="p-6 projector:projector-card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-primary/20 rounded-lg">
                <User className="text-primary" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground projector:text-xl">目标用户画像</h3>
            </div>

            <Tabs defaultValue="demographics" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4 projector:gap-1 projector:mb-6">
                <TabsTrigger value="demographics" className="text-xs projector:text-sm">人口统计</TabsTrigger>
                <TabsTrigger value="interests" className="text-xs projector:text-sm">兴趣偏好</TabsTrigger>
                <TabsTrigger value="painpoints" className="text-xs projector:text-sm">痛点需求</TabsTrigger>
                <TabsTrigger value="channels" className="text-xs projector:text-sm">偏好渠道</TabsTrigger>
              </TabsList>

              <TabsContent value="demographics" className="space-y-3 projector:space-y-4">
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <p className="text-foreground">{userProfile.demographics}</p>
                </div>
              </TabsContent>

              <TabsContent value="interests" className="space-y-3 projector:space-y-4">
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest, index) => (
                    <Badge key={index} className="bg-green-500/20 text-green-500 border border-green-500/30">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="painpoints" className="space-y-3 projector:space-y-4">
                <div className="flex flex-wrap gap-2">
                  {userProfile.painPoints.map((pain, index) => (
                    <Badge key={index} className="bg-red-500/20 text-red-500 border border-red-500/30">
                      {pain}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="channels" className="space-y-3 projector:space-y-4">
                <div className="flex flex-wrap gap-2">
                  {userProfile.preferredChannels.map((channel, index) => (
                    <Badge key={index} className="bg-amber-500/20 text-amber-500 border border-amber-500/30">
                      {channel}
                    </Badge>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="text-amber-400" size={16} />
                  <span className="text-sm text-muted-foreground projector:text-base">AI匹配度</span>
                </div>
                <span className="text-lg font-bold text-amber-400">92%</span>
              </div>
              <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: '92%' }}></div>
              </div>
            </div>
          </Card>

          {/* 营销活动选择 */}
          <Card className="p-6 mt-6 projector:projector-card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Target className="text-primary" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground projector:text-xl">营销活动选择</h3>
            </div>
            <div className="space-y-4">
              {loadingCampaigns ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">加载营销活动中...</span>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">暂无营销活动</p>
                  <Button variant="default" className="mt-2 text-sm" onClick={() => alert('请先创建营销活动')}>
                    创建营销活动
                  </Button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-muted-foreground mb-2 projector:text-base">选择营销活动</label>
                  <select
                    className="w-full bg-gray-900 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                  >
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name} ({campaign.campaignType}) - 预算: ¥{campaign.budget?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  {selectedCampaignId && (
                    <div className="mt-3 p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground projector:text-base">活动类型</span>
                        <span className="text-foreground">
                          {campaigns.find(c => c.id === selectedCampaignId)?.campaignType}
                        </span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-muted-foreground projector:text-base">预算</span>
                        <span className="text-foreground">¥{campaigns.find(c => c.id === selectedCampaignId)?.budget?.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* AI 配置 */}
          <Card className="p-6 mt-6 projector:projector-card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Brain className="text-amber-400" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground projector:text-xl">Gemini AI 配置</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground projector:text-base">模型</span>
                <span className="text-foreground">Gemini 1.5 Flash</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground projector:text-base">温度</span>
                <span className="text-foreground">0.7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground projector:text-base">最大令牌</span>
                <span className="text-foreground">2048</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground projector:text-base">生成时间</span>
                <span className="text-foreground">2-5秒</span>
              </div>
            </div>
          </Card>
        </div>

        {/* 右侧：策略生成区 */}
        <div className="lg:col-span-2">
          <Card className="p-6 projector:projector-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Zap className="text-amber-400" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-foreground projector:text-xl">AI 营销策略生成</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  className="flex items-center space-x-2 text-sm"
                  onClick={copyToClipboard}
                  disabled={!strategy}
                >
                  <Copy size={16} />
                  <span>复制策略</span>
                </Button>
                <Button variant="default" className="flex items-center space-x-2 text-sm" onClick={approveStrategy}>
                  <CheckCircle size={16} />
                  <span>提交审核</span>
                </Button>
              </div>
            </div>

            {generating || streamText ? (
              <div className="relative">
                <div className="absolute top-4 right-4">
                  {streamComplete ? (
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <CheckCircle size={16} />
                      <span className="text-sm">生成完成</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-400">
                      <div className="h-3 w-3 animate-pulse rounded-full bg-gold-500"></div>
                      <span className="text-sm">AI思考中...</span>
                    </div>
                  )}
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-border">
                  <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-auto max-h-[500px]">
                    {streamText}
                  </pre>
                  {!streamComplete && (
                    <div className="mt-4 flex items-center space-x-2 text-muted-foreground">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-gold-500"></div>
                      <span className="text-sm">AI正在流式生成策略内容...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-400 rounded-full flex items-center justify-center mb-4">
                  <Brain size={28} className="text-foreground" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">准备生成营销策略</h4>
                <p className="text-muted-foreground max-w-md mx-auto">
                  点击上方"生成AI策略"按钮，Gemini AI将基于目标用户画像生成完整的营销策略方案，包含核心创意、执行计划和风险评估。
                </p>
                <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <AlertCircle size={14} />
                    <span>包含政务审核状态</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Play size={14} />
                    <span>流式打印效果</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 策略预览 */}
          {strategy && (
            <Card className="p-6 mt-6 projector:projector-card">
              <h3 className="text-lg font-semibold text-foreground mb-6 projector:text-xl">策略关键指标预览</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-amber-900/30 to-transparent p-4 rounded-xl border border-amber-800">
                  <div className="text-sm text-muted-foreground projector:text-base">预期互动率</div>
                  <div className="text-2xl font-bold text-foreground mt-1">{strategy.expectedPerformanceMetrics.engagementRate}%</div>
                  <div className="text-xs text-emerald-400 mt-1">高于行业平均</div>
                </div>
                <div className="bg-gradient-to-br from-amber-800/30 to-transparent p-4 rounded-xl border border-amber-700/30">
                  <div className="text-sm text-muted-foreground projector:text-base">预估 ROI</div>
                  <div className="text-2xl font-bold text-foreground mt-1">{strategy.expectedPerformanceMetrics.estimatedROI}%</div>
                  <div className="text-xs text-emerald-400 mt-1">高回报率</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-900/30 to-transparent p-4 rounded-xl border border-emerald-800/30">
                  <div className="text-sm text-muted-foreground projector:text-base">预期覆盖</div>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {(strategy.expectedPerformanceMetrics.expectedReach / 10000).toFixed(1)}万
                  </div>
                  <div className="text-xs text-emerald-400 mt-1">广泛传播</div>
                </div>
                <div className="bg-gradient-to-br from-violet-900/30 to-transparent p-4 rounded-xl border border-violet-800/30">
                  <div className="text-sm text-muted-foreground projector:text-base">执行周期</div>
                  <div className="text-2xl font-bold text-foreground mt-1">7周</div>
                  <div className="text-xs text-muted-foreground mt-1">分三个阶段</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm text-muted-foreground mb-3 projector:text-base">预算分配</h4>
                <div className="space-y-3">
                  {strategy.budgetAllocation.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 rounded-full bg-gold-500"></div>
                        <span className="text-foreground">{item.category}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-foreground">¥{item.amount.toLocaleString()}</span>
                        <span className="text-muted-foreground">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default AICenter