import { useState } from 'react'
import { Instagram, Facebook, Globe, Link, RefreshCw, CheckCircle, AlertCircle, XCircle, BarChart3, Users, Zap, Sparkles, Loader2 } from 'lucide-react'
import { contentGenerationService } from '../services/contentGenerationService'
import { Platform, PlatformIdToEnum, isPlatformSupportedForContentGeneration } from '../types/platform'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const MatrixWall = () => {
  const [syncing, setSyncing] = useState<string | null>(null)
  const [generatingContent, setGeneratingContent] = useState<string | null>(null)
  const [generatedContents, setGeneratedContents] = useState<Record<string, any>>({})
  const [generationErrors, setGenerationErrors] = useState<Record<string, string>>({})
  const [showContentPreview, setShowContentPreview] = useState<string | null>(null)

  const platforms = [
    {
      id: 'xhs',
      name: '小红书',
      icon: Instagram,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      status: 'connected',
      username: '@灵曜智媒官方',
      followers: '12.4万',
      engagementRate: '4.2%',
      lastPost: '2小时前',
      postsThisMonth: 24,
      healthScore: 92,
      syncStatus: 'up_to_date',
    },
    {
      id: 'wechat',
      name: '微信公众号',
      icon: Facebook,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      status: 'connected',
      username: '灵曜智媒',
      followers: '8.7万',
      engagementRate: '3.8%',
      lastPost: '1天前',
      postsThisMonth: 12,
      healthScore: 88,
      syncStatus: 'needs_sync',
    },
    {
      id: 'douyin',
      name: '抖音',
      icon: Globe,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      status: 'disconnected',
      username: '未绑定',
      followers: '--',
      engagementRate: '--',
      lastPost: '--',
      postsThisMonth: 0,
      healthScore: 0,
      syncStatus: 'disconnected',
    },
    {
      id: 'bilibili',
      name: 'B站',
      icon: Globe,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      status: 'connected',
      username: '@灵曜智媒',
      followers: '5.2万',
      engagementRate: '5.1%',
      lastPost: '3天前',
      postsThisMonth: 8,
      healthScore: 85,
      syncStatus: 'up_to_date',
    },
  ]

  const recentActivities = [
    { platform: '小红书', action: '内容发布', content: '春季焕新指南', time: '10:30', status: 'success' },
    { platform: '微信公众号', action: '图文推送', content: 'AI营销白皮书', time: '昨天 14:20', status: 'success' },
    { platform: '小红书', action: '数据同步', content: '同步粉丝互动数据', time: '今天 09:15', status: 'success' },
    { platform: '微信公众号', action: '自动回复', content: '关键词回复更新', time: '今天 11:45', status: 'pending' },
    { platform: 'B站', action: '视频上传', content: 'AI内容创作教程', time: '3天前', status: 'success' },
  ]

  const syncPlatform = (platformId: string) => {
    setSyncing(platformId)
    setTimeout(() => {
      setSyncing(null)
      // 在实际应用中，这里会调用API同步数据
    }, 2000)
  }

  const generateContentForPlatform = async (platformId: string) => {
    // 将平台ID转换为Platform枚举
    const platformEnum = PlatformIdToEnum[platformId]
    if (!platformEnum) {
      setGenerationErrors(prev => ({
        ...prev,
        [platformId]: '不支持的平台类型'
      }))
      return
    }

    // 检查平台是否支持内容生成
    if (!isPlatformSupportedForContentGeneration(platformEnum)) {
      setGenerationErrors(prev => ({
        ...prev,
        [platformId]: '该平台暂不支持AI内容生成'
      }))
      return
    }

    setGeneratingContent(platformId)
    setGenerationErrors(prev => ({ ...prev, [platformId]: '' }))

    try {
      const platformData = platforms.find(p => p.id === platformId)
      const prompt = `请为${platformData?.name || platformId}平台生成一段吸引人的内容，主题可以围绕品牌推广、产品介绍或行业洞察。`

      const result = await contentGenerationService.generateContentForPlatform(
        platformEnum,
        prompt,
        'casual'
      )

      if (result.success && result.data) {
        setGeneratedContents(prev => ({
          ...prev,
          [platformId]: result.data
        }))
        // 自动显示生成的内容预览
        setShowContentPreview(platformId)
      } else {
        setGenerationErrors(prev => ({
          ...prev,
          [platformId]: result.error?.message || '内容生成失败'
        }))
      }
    } catch (error: any) {
      setGenerationErrors(prev => ({
        ...prev,
        [platformId]: error.message || 'API调用失败'
      }))
    } finally {
      setGeneratingContent(null)
    }
  }

  const generateContentForAllPlatforms = async () => {
    // 只为已连接且支持内容生成的平台生成内容
    const connectedPlatforms = platforms.filter(p =>
      p.status === 'connected' && isPlatformSupportedForContentGeneration(PlatformIdToEnum[p.id])
    )

    if (connectedPlatforms.length === 0) {
      alert('没有找到支持内容生成的已连接平台')
      return
    }

    // 使用批量生成功能
    const platformEnums = connectedPlatforms
      .map(p => PlatformIdToEnum[p.id])
      .filter(Boolean) as Platform[]

    setGeneratingContent('all')

    try {
      const result = await contentGenerationService.generateContentForMatrix(
        platformEnums,
        '为矩阵平台生成统一的品牌内容',
        'friendly'
      )

      if (result.success && result.marketingContent) {
        // 将生成的内容按平台存储
        const newContents: Record<string, any> = {}
        result.marketingContent.contents.forEach(content => {
          const platformId = Object.keys(PlatformIdToEnum).find(
            key => PlatformIdToEnum[key] === content.platform
          )
          if (platformId) {
            newContents[platformId] = content
          }
        })

        setGeneratedContents(prev => ({ ...prev, ...newContents }))
        alert(`成功为${platformEnums.length}个平台生成内容`)
      } else {
        alert(result.error?.message || '批量内容生成失败')
      }
    } catch (error: any) {
      alert(error.message || '批量内容生成失败')
    } finally {
      setGeneratingContent(null)
    }
  }

  const closeContentPreview = () => {
    setShowContentPreview(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500/20 text-green-500 border border-green-500/30">已连接</Badge>
      case 'disconnected':
        return <Badge className="bg-red-500/20 text-red-500 border border-red-500/30">未连接</Badge>
      case 'needs_sync':
        return <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30">需同步</Badge>
      default:
        return <Badge className="bg-red-500/20 text-red-500 border border-red-500/30">未知</Badge>
    }
  }

  const getSyncBadge = (syncStatus: string) => {
    switch (syncStatus) {
      case 'up_to_date':
        return (
          <div className="flex items-center space-x-1 text-green-400">
            <CheckCircle size={14} />
            <span className="text-xs">已同步</span>
          </div>
        )
      case 'needs_sync':
        return (
          <div className="flex items-center space-x-1 text-yellow-400">
            <AlertCircle size={14} />
            <span className="text-xs">需同步</span>
          </div>
        )
      case 'disconnected':
        return (
          <div className="flex items-center space-x-1 text-red-400">
            <XCircle size={14} />
            <span className="text-xs">未连接</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white projector:text-3xl">矩阵管理墙</h2>
          <p className="text-gray-400 mt-1 projector:text-lg">多平台账号绑定、状态监控与内容同步管理</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="secondary" className="flex items-center space-x-2">
            <Link size={18} />
            <span>绑定新账号</span>
          </Button>
          <Button variant="default" className="flex items-center space-x-2">
            <RefreshCw size={18} />
            <span>全部同步</span>
          </Button>
          <Button
            variant="default"
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
            onClick={generateContentForAllPlatforms}
            disabled={generatingContent === 'all'}
          >
            {generatingContent === 'all' ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            <span>{generatingContent === 'all' ? '生成中...' : 'AI生成内容'}</span>
          </Button>
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform) => {
          const Icon = platform.icon
          return (
            <Card key={platform.id} className="p-6 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 ease-in-out projector:projector-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`${platform.bgColor} p-2 rounded-lg`}>
                    <Icon className={platform.color} size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white projector:text-xl">{platform.name}</h3>
                    {getStatusBadge(platform.status)}
                  </div>
                </div>
                {getSyncBadge(platform.syncStatus)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm projector:text-base">账号</span>
                  <span className="text-white text-sm font-medium">{platform.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm projector:text-base">粉丝数</span>
                  <span className="text-white text-sm font-medium">{platform.followers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm projector:text-base">互动率</span>
                  <span className="text-white text-sm font-medium">{platform.engagementRate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm projector:text-base">最后发布</span>
                  <span className="text-white text-sm font-medium">{platform.lastPost}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-gold-500"></div>
                    <span className="text-xs text-gray-400 projector:text-sm">健康度</span>
                  </div>
                  <span className="text-white font-bold">{platform.healthScore}</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-gold-500"
                    style={{ width: `${platform.healthScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button
                  variant={platform.status === 'connected' ? "default" : "secondary"}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium"
                  onClick={() => platform.status === 'connected' && syncPlatform(platform.id)}
                  disabled={platform.status !== 'connected' || syncing === platform.id}
                >
                  {syncing === platform.id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>同步中</span>
                    </div>
                  ) : (
                    '同步数据'
                  )}
                </Button>
                <Button
                  variant={
                    platform.status === 'connected' && isPlatformSupportedForContentGeneration(PlatformIdToEnum[platform.id])
                      ? "default"
                      : platform.status === 'connected'
                      ? "secondary"
                      : "outline"
                  }
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium"
                  onClick={() => {
                    if (platform.status === 'connected' && isPlatformSupportedForContentGeneration(PlatformIdToEnum[platform.id])) {
                      generateContentForPlatform(platform.id)
                    }
                  }}
                  disabled={
                    platform.status !== 'connected' ||
                    !isPlatformSupportedForContentGeneration(PlatformIdToEnum[platform.id]) ||
                    generatingContent === platform.id
                  }
                >
                  {generatingContent === platform.id ? (
                    <div className="flex items-center justify-center space-x-1">
                      <Loader2 size={14} className="animate-spin" />
                      <span>生成中</span>
                    </div>
                  ) : platform.status === 'connected' && isPlatformSupportedForContentGeneration(PlatformIdToEnum[platform.id]) ? (
                    <div className="flex items-center justify-center space-x-1">
                      <Sparkles size={14} />
                      <span>生成内容</span>
                    </div>
                  ) : platform.status === 'connected' ? (
                    '管理'
                  ) : (
                    '绑定'
                  )}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 projector:projector-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm projector:text-base">总粉丝数</p>
              <p className="text-2xl font-bold text-white mt-2">26.3万</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="text-blue-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-400 text-sm">+12.5%</span>
            <span className="text-gray-500 text-sm ml-2">上月增长</span>
          </div>
        </Card>

        <Card className="p-6 projector:projector-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm projector:text-base">本月发布</p>
              <p className="text-2xl font-bold text-white mt-2">44篇</p>
            </div>
            <div className="p-3 bg-gold-500/10 rounded-lg">
              <Zap className="text-gold-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-400 text-sm">+8篇</span>
            <span className="text-gray-500 text-sm ml-2">环比增加</span>
          </div>
        </Card>

        <Card className="p-6 projector:projector-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm projector:text-base">平均互动率</p>
              <p className="text-2xl font-bold text-white mt-2">4.37%</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <BarChart3 className="text-green-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-400 text-sm">+0.8%</span>
            <span className="text-gray-500 text-sm ml-2">优于行业</span>
          </div>
        </Card>

        <Card className="p-6 projector:projector-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm projector:text-base">账号健康度</p>
              <p className="text-2xl font-bold text-white mt-2">91.3</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <CheckCircle className="text-purple-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-400 text-sm">优秀</span>
            <span className="text-gray-500 text-sm ml-2">所有平台正常</span>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 projector:projector-card">
        <h3 className="text-lg font-semibold text-white mb-6 projector:text-xl">最近平台活动</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-3 px-4 text-left text-gray-400 font-medium projector:text-base">平台</th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium projector:text-base">操作类型</th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium projector:text-base">内容</th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium projector:text-base">时间</th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium projector:text-base">状态</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((activity, index) => (
                <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                  <td className="py-3 px-4">
                    <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30">{activity.platform}</Badge>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">{activity.action}</td>
                  <td className="py-3 px-4 text-gray-300">{activity.content}</td>
                  <td className="py-3 px-4 text-gray-400">{activity.time}</td>
                  <td className="py-3 px-4">
                    {activity.status === 'success' ? (
                      <Badge className="bg-green-500/20 text-green-500 border border-green-500/30">成功</Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30">处理中</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Connection Tips */}
      <Card className="p-6 bg-gradient-to-r from-deep-blue-900/30 to-transparent border-deep-blue-800 projector:projector-card">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 projector:text-xl">提升矩阵效率建议</h3>
            <ul className="text-gray-300 space-y-1">
              <li className="flex items-center space-x-2">
                <CheckCircle size={14} className="text-green-400" />
                <span>绑定抖音账号，覆盖短视频用户群体</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle size={14} className="text-green-400" />
                <span>开启微信公众号自动同步功能</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle size={14} className="text-green-400" />
                <span>定期检查平台API连接状态</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle size={14} className="text-green-400" />
                <span>使用AI内容优化工具提升互动率</span>
              </li>
            </ul>
          </div>
          <Button variant="default" className="whitespace-nowrap">查看详细建议</Button>
        </div>
      </Card>

      {/* 生成内容预览模态框 */}
      {showContentPreview && generatedContents[showContentPreview] && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">AI生成内容预览</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {platforms.find(p => p.id === showContentPreview)?.name} - 生成时间: {new Date().toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeContentPreview}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
              >
                <XCircle size={20} />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">标题</h4>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <p className="text-white">{generatedContents[showContentPreview].title}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">内容正文</h4>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 whitespace-pre-wrap">
                    <p className="text-gray-300">{generatedContents[showContentPreview].content}</p>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    字数: {generatedContents[showContentPreview].wordCount || 'N/A'} |
                    预计阅读时间: {generatedContents[showContentPreview].estimatedReadingTime || 'N/A'}
                  </div>
                </div>

                {generatedContents[showContentPreview].hashtags && generatedContents[showContentPreview].hashtags.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">话题标签</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedContents[showContentPreview].hashtags.map((tag: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-deep-blue-900/50 text-deep-blue-300 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {generatedContents[showContentPreview].suggestedImages && generatedContents[showContentPreview].suggestedImages.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">建议配图</h4>
                    <ul className="list-disc pl-5 text-gray-300 space-y-1">
                      {generatedContents[showContentPreview].suggestedImages.map((image: string, index: number) => (
                        <li key={index}>{image}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedContents[showContentPreview].qualityScore && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">内容质量评估</h4>
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">质量分数</span>
                        <span className="text-2xl font-bold text-gold-400">
                          {generatedContents[showContentPreview].qualityScore}/100
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-gold-500"
                          style={{ width: `${generatedContents[showContentPreview].qualityScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={closeContentPreview}
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                关闭
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  // 这里可以添加复制内容或保存内容的逻辑
                  alert('内容已复制到剪贴板')
                  closeContentPreview()
                }}
                className="px-4 py-2 rounded-lg bg-gold-600 text-white hover:bg-gold-700"
              >
                复制内容
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  // 这里可以添加发布内容的逻辑
                  alert('内容已保存到草稿箱')
                  closeContentPreview()
                }}
                className="px-4 py-2 rounded-lg bg-deep-blue-600 text-white hover:bg-deep-blue-700"
              >
                保存草稿
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {Object.keys(generationErrors).map(platformId => (
        generationErrors[platformId] && (
          <div key={platformId} className="fixed bottom-4 right-4 z-50">
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 max-w-sm">
              <div className="flex items-start">
                <AlertCircle className="text-red-400 mt-0.5 mr-3" size={20} />
                <div>
                  <p className="text-white font-medium">{platforms.find(p => p.id === platformId)?.name} 内容生成失败</p>
                  <p className="text-red-300 text-sm mt-1">{generationErrors[platformId]}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setGenerationErrors(prev => ({ ...prev, [platformId]: '' }))}
                  className="ml-4 text-gray-400 hover:text-white h-8 w-8"
                >
                  <XCircle size={16} />
                </Button>
              </div>
            </div>
          </div>
        )
      ))}
    </div>
  )
}

export default MatrixWall