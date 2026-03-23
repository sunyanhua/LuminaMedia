import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, Users, Calendar, Loader as Loader2, Copy, CircleCheck as CheckCircle2, AlertTriangle } from 'lucide-react';
import { contentGenerationService, CampaignType } from '@/services/contentGenerationService';
import { strategyService } from '@/services/strategyService';
import { analyticsService } from '@/services/analyticsService';
import { Platform } from '@/types/platform';
import { AIEngine } from '@/types/ai-engine';

interface Campaign {
  planName: string;
  objective: string;
  audience: string[];
  platforms: string[];
  content: {
    xiaohongshu: string;
    wechat: string;
    douyin: string;
    bilibili?: string;
  };
  timeline: {
    phase: string;
    duration: string;
    activities: string[];
  }[];
}

// 平台枚举到中文名称的映射
const PLATFORM_DISPLAY_NAMES: Partial<Record<Platform, string>> = {
  [Platform.XHS]: '小红书',
  [Platform.WECHAT_MP]: '微信公众号',
  [Platform.DOUYIN]: '抖音',
  [Platform.BILIBILI]: 'B站',
};

// 平台枚举到content对象key的映射
const PLATFORM_CONTENT_KEYS: Partial<Record<Platform, keyof Campaign['content']>> = {
  [Platform.XHS]: 'xiaohongshu',
  [Platform.WECHAT_MP]: 'wechat',
  [Platform.DOUYIN]: 'douyin',
  [Platform.BILIBILI]: 'bilibili',
};

// 默认时间线（当API没有提供时使用）
const DEFAULT_TIMELINE = [
  {
    phase: '预热期（D-7至D-1）',
    duration: '7天',
    activities: [
      '社交媒体悬念海报发布',
      'KOL/KOC种草内容投放',
      '会员专属预告推送',
      '线下商场氛围布置',
    ],
  },
  {
    phase: '爆发期（D1-D15）',
    duration: '15天',
    activities: [
      '全平台高频次内容发布（每日3-5条）',
      '抖音直播带货（每日晚8点）',
      '小红书达人探店Vlog',
      '微信社群限时秒杀',
      '线下互动装置打卡活动',
    ],
  },
  {
    phase: '延续期（D16-D21）',
    duration: '6天',
    activities: [
      '用户UGC内容二次传播',
      '活动战报数据可视化发布',
      '会员回访问卷调研',
      '下一波活动预热',
    ],
  },
];

/**
 * 将API返回的MarketingContent转换为前端Campaign对象
 */
function transformMarketingContentToCampaign(
  marketingContent: any,
  userGoal: string,
  targetAudience: string = '25-35岁都市白领'
): Campaign {
  // 提取基础信息
  const planName = marketingContent.campaignName || 'AI智能营销方案';
  const objective = marketingContent.contentStrategySummary || userGoal || '通过全平台整合营销，提升品牌影响力和销售转化';

  // 构建平台列表
  const platforms: string[] = marketingContent.contents
    ?.map((content: any) => PLATFORM_DISPLAY_NAMES[content.platform as Platform])
    .filter(Boolean) || ['小红书', '微信公众号', '抖音'];

  // 构建内容对象
  const content: Campaign['content'] = {
    xiaohongshu: '',
    wechat: '',
    douyin: '',
    bilibili: '',
  };

  // 填充各平台内容
  if (marketingContent.contents) {
    marketingContent.contents.forEach((item: any) => {
      const contentKey = PLATFORM_CONTENT_KEYS[item.platform as Platform];
      if (contentKey && item.content) {
        content[contentKey] = item.content;
      }
    });
  }

  // 如果API没有提供某些平台的内容，使用默认内容
  if (!content.xiaohongshu) {
    content.xiaohongshu = `🎊智能营销方案｜${planName}小红书内容\n\n基于您的目标"${userGoal}"，我们为您精心策划了小红书专属内容。\n\n✨ 活动亮点：\n🎯 个性化内容策略\n💎 精准受众触达\n🎪 高互动性内容设计\n\n#AI营销 #智能策划 #小红书运营`;
  }

  if (!content.wechat) {
    content.wechat = `【智能营销方案】${planName}\n\n亲爱的用户：\n\n基于您的营销目标"${userGoal}"，我们为您定制了微信公众号专属内容策略。\n\n📋 方案要点：\n• 深度内容策划\n• 精准用户触达\n• 数据驱动优化\n• 效果持续追踪\n\n点击阅读原文，了解更多详情👇`;
  }

  if (!content.douyin) {
    content.douyin = `【脚本大纲】${planName}\n\n开场（0-3秒）：\n快闪镜头：品牌元素、产品展示\n文字：${planName}正式启动！\n\n主体（3-30秒）：\n1. 核心卖点展示（5秒）\n2. 用户证言/案例分享（8秒）\n3. 互动环节设计（6秒）\n4. 行动号召（5秒）\n\n结尾（30-35秒）：\n品牌Logo+联系方式\n文字：立即行动，获取专属福利！\n\n#抖音营销 #短视频策划 #AI智策`;
  }

  // 构建时间线（如果API提供了发布时间建议，可以基于此构建）
  // 目前使用默认时间线，未来可以基于recommendedPostingSchedule增强
  const timeline = [...DEFAULT_TIMELINE];

  // 构建受众列表
  const audience = [targetAudience, 'VIP会员及高消费人群', '家庭型消费者', '年轻时尚潮流追随者'];

  return {
    planName,
    objective,
    audience,
    platforms,
    content,
    timeline,
  };
}

/**
 * 将策略响应转换为前端Campaign对象
 */
function transformStrategyToCampaign(
  strategy: any,
  userGoal: string,
  targetAudience: string = '25-35岁都市白领'
): Campaign {
  // 提取基础信息
  const planName = strategy.campaignName || `AI营销方案-${new Date().toLocaleDateString()}`;
  const objective = strategy.description || userGoal || '通过全平台整合营销，提升品牌影响力和销售转化';

  // 构建平台列表（默认使用小红书、微信公众号、抖音）
  const platforms = ['小红书', '微信公众号', '抖音'];

  // 构建内容对象
  const content: Campaign['content'] = {
    xiaohongshu: '',
    wechat: '',
    douyin: '',
    bilibili: '',
  };

  // 如果策略包含小红书内容，使用它
  if (strategy.xhsContent) {
    content.xiaohongshu = typeof strategy.xhsContent === 'string'
      ? strategy.xhsContent
      : JSON.stringify(strategy.xhsContent);
  } else {
    content.xiaohongshu = `🎊智能营销方案｜${planName}小红书内容\n\n基于您的目标"${userGoal}"，我们为您精心策划了小红书专属内容。\n\n✨ 活动亮点：\n🎯 个性化内容策略\n💎 精准受众触达\n🎪 高互动性内容设计\n\n#AI营销 #智能策划 #小红书运营`;
  }

  // 微信公众号内容
  content.wechat = `【智能营销方案】${planName}\n\n亲爱的用户：\n\n基于您的营销目标"${userGoal}"，我们为您定制了微信公众号专属内容策略。\n\n📋 方案要点：\n• 深度内容策划\n• 精准用户触达\n• 数据驱动优化\n• 效果持续追踪\n\n点击阅读原文，了解更多详情👇`;

  // 抖音脚本
  content.douyin = `【脚本大纲】${planName}\n\n开场（0-3秒）：\n快闪镜头：品牌元素、产品展示\n文字：${planName}正式启动！\n\n主体（3-30秒）：\n1. 核心卖点展示（5秒）\n2. 用户证言/案例分享（8秒）\n3. 互动环节设计（6秒）\n4. 行动号召（5秒）\n\n结尾（30-35秒）：\n品牌Logo+联系方式\n文字：立即行动，获取专属福利！\n\n#抖音营销 #短视频策划 #AI智策`;

  // 构建时间线（如果策略包含实施计划）
  let timeline = [...DEFAULT_TIMELINE];
  if (strategy.implementationPlan?.timeline) {
    timeline = strategy.implementationPlan.timeline.map((phase: any) => ({
      phase: phase.phase || '未命名阶段',
      duration: phase.duration || '待定',
      activities: phase.activities || [],
    }));
  }

  // 构建受众列表
  const audience = [targetAudience, 'VIP会员及高消费人群', '家庭型消费者', '年轻时尚潮流追随者'];

  return {
    planName,
    objective,
    audience,
    platforms,
    content,
    timeline,
  };
}

const mockCampaign: Campaign = {
  planName: '春节购物狂欢节营销方案',
  objective: '通过全平台整合营销，提升春节期间商场客流量30%，销售额增长50%，同时强化品牌在年轻消费者心中的认知度',
  audience: ['25-35岁都市白领', 'VIP会员及高消费人群', '家庭型消费者', '年轻时尚潮流追随者'],
  platforms: ['小红书', '微信公众号', '抖音', '微博'],
  content: {
    xiaohongshu: `🎊春节购物攻略｜商场隐藏福利大公开！

姐妹们！今天给大家分享一个宝藏商场的春节活动🎁
真的是我逛过最有诚意的购物中心了！

✨ 活动亮点：
🎯 全场满500减100，上不封顶
💎 VIP会员专属神秘礼盒
🎪 每日10点限时秒杀（手慢无！）
🎨 新春打卡装置，出片率💯

📍 地址：[商场名称]
⏰ 活动时间：1月20日-2月10日

姐妹们冲啊！评论区见👇

#春节购物 #商场推荐 #新年战利品 #VIP福利`,

    wechat: `【春节特惠】全城最强购物攻略来了！

亲爱的会员朋友们：

春节将至，我们为您准备了全年最丰厚的福利！

🎁 活动详情：
• 全场满减：满500减100，上不封顶
• VIP专享：神秘礼盒 + 双倍积分
• 每日惊喜：10点限时秒杀，低至3折
• 美食盛宴：餐饮区8折优惠

📅 活动时间：2024年1月20日-2月10日

点击阅读原文，立即预约VIP专属服务👇`,

    douyin: `【脚本大纲】春节购物Vlog

开场（0-3秒）：
快闪镜头：商场灯光、人潮、购物袋
文字：春节购物我只来这！

主体（3-30秒）：
1. 扫过各大品牌店铺（3秒）
2. 展示满减活动（5秒）
3. VIP礼盒开箱（8秒）
4. 秒杀抢购实况（6秒）
5. 美食区探店（5秒）
6. 新春装置打卡（3秒）

结尾（30-35秒）：
个人出镜+购物袋展示
文字：姐妹们，冲！
引导：点赞+关注

#春节购物 #商场探店 #VIP福利`,
  },
  timeline: [
    {
      phase: '预热期（D-7至D-1）',
      duration: '7天',
      activities: [
        '社交媒体悬念海报发布',
        'KOL/KOC种草内容投放',
        '会员专属预告推送',
        '线下商场氛围布置',
      ],
    },
    {
      phase: '爆发期（D1-D15）',
      duration: '15天',
      activities: [
        '全平台高频次内容发布（每日3-5条）',
        '抖音直播带货（每日晚8点）',
        '小红书达人探店Vlog',
        '微信社群限时秒杀',
        '线下互动装置打卡活动',
      ],
    },
    {
      phase: '延续期（D16-D21）',
      duration: '6天',
      activities: [
        '用户UGC内容二次传播',
        '活动战报数据可视化发布',
        '会员回访问卷调研',
        '下一波活动预热',
      ],
    },
  ],
};

// 演示模式预设模板
const PRESET_TEMPLATES = [
  {
    id: 'mall-campaign',
    name: '商场策划',
    goal: '提升商场客流量和销售额，增强品牌在年轻消费者中的影响力',
    audience: '25-45岁家庭消费者、年轻时尚人群、VIP会员',
    budget: '200,000 - 500,000',
    description: '适用于商场促销、节日活动、品牌推广'
  },
  {
    id: 'government-promotion',
    name: '政务宣传',
    goal: '提升政府政策知晓度，增强公众参与感和满意度',
    audience: '全体市民、企业单位、学校师生',
    budget: '50,000 - 150,000',
    description: '适用于政策宣传、公共服务推广、文化活动'
  }
];

export function AIStrategy() {
  const [userGoal, setUserGoal] = useState('');
  const [targetAudience, setTargetAudience] = useState('25-35岁都市白领');
  const [budgetRange, setBudgetRange] = useState('100,000 - 500,000');
  const [generating, setGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [geminiAvailable, setGeminiAvailable] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string>('');
  const [aiEngine, setAiEngine] = useState<AIEngine | null>(null);

  useEffect(() => {
    checkGeminiStatus();
  }, []);

  const checkGeminiStatus = async () => {
    try {
      const result = await contentGenerationService.getGeminiHealth();
      setGeminiAvailable(result.data?.geminiAvailable || false);
      if (result.data?.error) {
        setApiError(result.data.error);
      }
    } catch (error) {
      console.error('Failed to check Gemini status:', error);
      setGeminiAvailable(false);
      setApiError('无法连接到API服务');
    }
  };

  const streamText = (text: string, callback: (text: string) => void) => {
    let index = 0;
    const streamNextChar = () => {
      if (index < text.length) {
        callback(text.substring(0, index + 1));
        index++;
        // 随机延迟模拟人工输入效果 (15-35ms)
        const delay = 15 + Math.random() * 20;
        setTimeout(streamNextChar, delay);
      }
    };
    streamNextChar();
  };

  /**
   * 解析预算范围字符串为数字
   * 例如 "100,000 - 500,000" → 100000
   */
  const parseBudget = (budgetRange: string): number => {
    // 提取第一个数字（去掉逗号）
    const match = budgetRange.match(/[\d,]+/);
    if (match) {
      const numStr = match[0].replace(/,/g, '');
      return parseInt(numStr, 10) || 10000;
    }
    return 10000; // 默认值
  };

  const handleGenerate = async () => {
    // 先检查API状态
    if (!geminiAvailable) {
      setApiError('Gemini API暂时不可用，将使用模拟数据生成方案');
    }

    setGenerating(true);
    setShowResults(false);
    setStreamedText('');
    setCampaign(null);

    const introText = `正在基于您的目标生成智能营销方案...\n\n分析目标受众特征...\n识别最佳传播渠道...\n生成创意内容策略...\n规划执行时间线...\n\n✨ 方案生成完成！`;

    streamText(introText, setStreamedText);

    try {
      // 1. 先创建营销活动
      const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // 现有admin用户ID
      const budget = parseBudget(budgetRange);
      const campaignName = userGoal
        ? `AI营销活动: ${userGoal.substring(0, 50)}${userGoal.length > 50 ? '...' : ''}`
        : `AI营销活动-${new Date().toLocaleDateString()}`;

      const campaignData = {
        userId,
        name: campaignName,
        campaignType: 'ONLINE', // 使用CampaignType.ONLINE
        budget,
        startDate: new Date().toISOString().split('T')[0], // 今天
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30天后
      };

      let campaignId: string;
      try {
        const campaignResponse = await analyticsService.createCampaign(campaignData);
        campaignId = campaignResponse.id;
        console.log('营销活动创建成功，ID:', campaignId);
      } catch (campaignError) {
        console.error('创建营销活动失败，使用随机ID:', campaignError);
        // 如果创建失败，使用随机ID（向后兼容）
        campaignId = `ai-campaign-${Date.now()}`;
      }

      // 2. 调用策略生成API
      const result = await strategyService.generateStrategy({
        campaignId,
        useGemini: true, // 启用AI引擎（优先Qwen，其次Gemini）
      });

      if (result.success && result.data) {
        // 设置AI引擎
        setAiEngine(result.data.aiEngine || AIEngine.FALLBACK);

        // 转换策略响应为前端Campaign对象
        const transformedCampaign = transformStrategyToCampaign(
          result.data,
          userGoal || '通过全平台整合营销，提升品牌影响力和销售转化',
          targetAudience
        );

        setCampaign(transformedCampaign);
      } else {
        // API调用失败，使用模拟数据
        console.warn('策略生成API调用失败，使用模拟数据:', result.message);
        setAiEngine(AIEngine.FALLBACK);
        const fallbackCampaign = transformMarketingContentToCampaign(
          {
            campaignName: `AI营销方案-${new Date().toLocaleDateString()}`,
            contentStrategySummary: userGoal || '通过全平台整合营销，提升品牌影响力和销售转化',
            contents: [],
          },
          userGoal || '通过全平台整合营销，提升品牌影响力和销售转化',
          targetAudience
        );
        setCampaign(fallbackCampaign);
      }
    } catch (error) {
      console.error('生成营销方案失败:', error);
      // 使用默认的mockCampaign作为fallback
      setCampaign(mockCampaign);
    } finally {
      // 确保流式文本显示完成
      setTimeout(() => {
        setGenerating(false);
        setShowResults(true);
      }, 3000);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // 确定要显示的营销方案
  const displayCampaign = campaign || mockCampaign;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">AI策略中心</h2>
          <p className="text-slate-400">
            秒速生成AI驱动的营销策略
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-0">
          <Sparkles className="w-3 h-3 mr-1" />
          GPT-4 驱动
        </Badge>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            营销目标
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              您的营销目标是什么？
            </label>
            <Textarea
              placeholder="例如：提升春节期间商场客流量和销售额，增强品牌在年轻消费者中的影响力..."
              className="bg-slate-800 border-slate-700 text-slate-200 min-h-[100px] focus-visible:ring-amber-500"
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">目标受众</label>
              <Input
                placeholder="25-35岁都市白领"
                className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-amber-500"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">预算范围 (¥)</label>
              <Input
                placeholder="100,000 - 500,000"
                className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-amber-500"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
              />
            </div>
          </div>

          {/* 预设模板选择 */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-400 mb-3">演示模板</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRESET_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setUserGoal(template.goal);
                    setTargetAudience(template.audience);
                    setBudgetRange(template.budget);
                  }}
                  className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-amber-500/50 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-slate-200">{template.name}</h5>
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs">
                      一键填充
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{template.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>受众: {template.audience}</span>
                    <span>预算: {template.budget}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {!geminiAvailable && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium text-amber-500">Gemini API暂时不可用</p>
                  <p className="text-sm text-amber-400/80 mt-1">
                    将使用模拟数据生成营销方案。功能完整，但内容为预定义模板。
                  </p>
                  {apiError && (
                    <p className="text-xs text-amber-400/60 mt-1">错误: {apiError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                正在生成AI策略...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                生成完整营销方案
              </>
            )}
          </button>

          {generating && (
            <div className="p-4 gold-gradient-bg rounded-lg gold-gradient-border-with-shadow">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                {streamedText}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {showResults && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-amber-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-slate-100">
                  {displayCampaign.planName}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                    AI生成
                  </Badge>
                  {aiEngine && (
                    <Badge className={
                      aiEngine === AIEngine.QWEN
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                        : aiEngine === AIEngine.GEMINI
                        ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                        : 'bg-gray-500/10 text-gray-500 border-gray-500/30'
                    }>
                      {aiEngine === AIEngine.QWEN
                        ? '通义千问 2.5 (CN)'
                        : aiEngine === AIEngine.GEMINI
                        ? 'Gemini 2.5 (INTL)'
                        : '模拟模板'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {aiEngine && (
                <div className="mb-2">
                  <p className="text-sm text-slate-400">
                    当前动力：
                    <span className={
                      aiEngine === AIEngine.QWEN
                        ? 'text-blue-400 font-medium ml-1'
                        : aiEngine === AIEngine.GEMINI
                        ? 'text-purple-400 font-medium ml-1'
                        : 'text-gray-400 font-medium ml-1'
                    }>
                      {aiEngine === AIEngine.QWEN
                        ? '通义千问 2.5 (CN)'
                        : aiEngine === AIEngine.GEMINI
                        ? 'Gemini 2.5 (INTL)'
                        : '模拟模板'}
                    </span>
                  </p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-amber-500 mb-2">营销目标</h4>
                <p className="text-slate-300">{displayCampaign.objective}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-amber-500 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  目标受众分群
                </h4>
                <div className="flex flex-wrap gap-2">
                  {displayCampaign.audience.map((segment, index) => (
                    <Badge key={index} variant="outline" className="border-slate-600 text-slate-300">
                      {segment}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-amber-500 mb-2">选定平台</h4>
                <div className="flex flex-wrap gap-2">
                  {displayCampaign.platforms.map((platform, index) => (
                    <Badge
                      key={index}
                      className="bg-amber-500/10 text-amber-500 border-amber-500/30"
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">各平台专属内容</CardTitle>
              <p className="text-sm text-slate-400">AI优化的各渠道文案</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(displayCampaign.content).map(([platform, content]) => (
                <div key={platform} className="p-4 gold-gradient-bg rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-slate-200 capitalize">{platform}</h5>
                    <button
                      onClick={() => copyToClipboard(content, platform)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                    >
                      {copied === platform ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          已复制!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          复制
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">
                    {content}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                执行时间线
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {displayCampaign.timeline.map((phase, index) => (
                  <div key={index} className="relative pl-8 pb-6 last:pb-0">
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    </div>
                    {index < displayCampaign.timeline.length - 1 && (
                      <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-700" />
                    )}

                    <div className="gold-gradient-bg rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-slate-200">{phase.phase}</h5>
                        <Badge variant="outline" className="border-slate-600 text-slate-400">
                          {phase.duration}
                        </Badge>
                      </div>
                      <ul className="space-y-2">
                        {phase.activities.map((activity, actIndex) => (
                          <li key={actIndex} className="flex items-start gap-2 text-sm text-slate-400">
                            <span className="text-amber-500 mt-1">•</span>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-slate-100 mb-1">准备好执行了吗？</h4>
                  <p className="text-slate-400">
                    一键部署此营销活动到所有平台
                  </p>
                </div>
                <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg transition-colors">
                  部署到矩阵
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
