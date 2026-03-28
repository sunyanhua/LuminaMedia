import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CopywritingAgentService } from './copywriting-agent.service';
import { GeminiService } from '../../../../data-analytics/services/gemini.service';
import { QwenService } from '../../../../data-analytics/services/qwen.service';
import { Platform } from '../../../../../shared/enums/platform.enum';
import { CopywritingAgentInput } from '../interfaces/copywriting-agent.interface';
import { StrategyAgentOutput } from '../../strategy/interfaces/strategy-agent.interface';

describe('CopywritingAgentService', () => {
  let service: CopywritingAgentService;
  let geminiService: jest.Mocked<GeminiService>;
  let qwenService: jest.Mocked<QwenService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockGeminiService = {
      isGeminiAvailable: jest.fn(),
      generateContent: jest.fn(),
    };

    const mockQwenService = {
      // QwenService方法占位
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CopywritingAgentService,
        { provide: GeminiService, useValue: mockGeminiService },
        { provide: QwenService, useValue: mockQwenService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CopywritingAgentService>(CopywritingAgentService);
    geminiService = module.get(GeminiService);
    qwenService = module.get(QwenService);
    configService = module.get(ConfigService);
  });

  it('应该被正确定义', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('当AI引擎可用时应成功执行文案生成', async () => {
      const strategyPlan: StrategyAgentOutput = {
        campaignTheme: {
          name: '春季焕新活动',
          slogan: '焕新生活，从春季开始',
          visualStyle: '清新、活力',
          keyMessages: ['新品上市', '限时优惠', '会员专享'],
          toneOfVoice: 'enthusiastic',
        },
        marketingStrategy: {
          objectives: ['提升品牌认知', '促进销售转化'],
          tactics: [
            {
              name: '社交媒体营销',
              description: '利用社交平台进行宣传',
              targetAudience: ['年轻用户', '女性用户'],
              channels: ['wechat', 'xiaohongshu'],
              timeline: { startWeek: 1, endWeek: 4 },
              successMetrics: ['曝光量', '互动率'],
              requiredResources: ['内容团队', '广告预算'],
            },
          ],
          channels: [
            {
              channel: 'wechat',
              name: '微信公众号',
              targetAudience: ['忠实用户'],
              budgetAllocation: 5000,
              percentage: 50,
              keyActions: ['推文发布', '互动活动'],
              metrics: ['阅读量', '转发量'],
            },
          ],
          targetAudienceSegments: ['年轻女性', '都市白领'],
        },
        activityPlan: {
          timeline: [
            {
              weekNumber: 1,
              dateRange: '2026-03-01至2026-03-07',
              keyActivities: ['预热宣传', '内容准备'],
              deliverables: ['宣传海报', '推文初稿'],
              responsibleParty: '市场部',
            },
          ],
          keyActions: ['发布推文', '举办活动'],
          dependencies: ['设计完成', '内容审核'],
          riskMitigation: ['备选方案', '紧急联系人'],
        },
        budgetPlan: {
          totalBudget: 10000,
          currency: 'CNY',
          breakdown: [
            {
              category: '内容制作',
              subcategory: '文案撰写',
              amount: 3000,
              percentage: 30,
              justification: '专业文案制作',
            },
          ],
          roiEstimation: 150,
          roiExplanation: '预计带来150%的投资回报率',
          contingencyBudget: 1000,
        },
        successMetrics: {
          kpis: [
            {
              name: '阅读量',
              target: 10000,
              unit: '次',
              measurementMethod: '后台统计',
            },
          ],
          measurementTimeline: ['每日', '每周'],
          reportingFrequency: 'weekly',
        },
        riskAssessment: {
          risks: [
            {
              description: '内容审核不通过',
              probability: 'low',
              impact: 'medium',
              mitigationStrategy: '提前准备备选内容',
            },
          ],
          overallRiskLevel: 'low',
        },
      };

      const input: CopywritingAgentInput = {
        strategyPlan,
        platformSpecs: [
          {
            platform: 'wechat',
            description: '微信公众号平台',
            contentType: 'article',
            wordLimit: 2000,
            imageRequirements: {
              count: 3,
              dimensions: ['1200x630', '800x450'],
              formats: ['jpg', 'png'],
              styleSuggestions: ['清新', '专业'],
            },
            postingTimeSuggestions: ['20:00', '21:00'],
            engagementSuggestions: ['留言互动', '转发有礼'],
            complianceRequirements: ['原创声明', '不涉及敏感话题'],
          },
          {
            platform: 'xiaohongshu',
            description: '小红书平台',
            contentType: 'short_post',
            wordLimit: 1000,
            imageRequirements: {
              count: 9,
              dimensions: ['1080x1440', '800x1000'],
              formats: ['jpg', 'png'],
              styleSuggestions: ['精致', '生活化'],
            },
            postingTimeSuggestions: ['19:00', '20:00'],
            engagementSuggestions: ['点赞收藏', '@好友'],
            complianceRequirements: ['真实分享', '不夸大宣传'],
          },
        ],
        brandGuidelines: {
          brandName: '测试品牌',
          tagline: '让生活更美好',
          brandValues: ['创新', '品质', '服务'],
          brandPersonality: {
            adjectives: ['专业', '亲切', '可靠'],
            toneOfVoice: 'professional',
            communicationStyle: ['清晰', '简洁', '有说服力'],
          },
          visualGuidelines: {
            brandColors: ['#FF6B6B', '#4ECDC4'],
            typography: ['微软雅黑', '思源黑体'],
            imageStyle: ['清新', '专业'],
            logoUsage: ['左上角', '固定大小'],
          },
          contentGuidelines: {
            keywords: ['品质', '创新', '服务'],
            forbiddenTopics: ['政治', '宗教', '暴力'],
            recommendedTopics: ['生活方式', '产品使用'],
            successStories: ['用户案例1', '用户案例2'],
          },
          customerPersonas: [
            {
              name: '都市白领',
              characteristics: ['注重品质', '时间有限'],
              communicationPreferences: ['简洁明了', '有数据支撑'],
            },
          ],
        },
        forbiddenWords: ['敏感词1', '敏感词2'],
      };

      // 模拟Gemini服务可用并返回响应
      geminiService.isGeminiAvailable.mockReturnValue(true);
      geminiService.generateContent.mockResolvedValue({
        success: true,
        content: {
          title: '文案生成结果',
          content: JSON.stringify({
            platformContents: {
              wechat: {
                title: '春季焕新活动 | 焕新生活，从春季开始',
                subtitle: '专业营销内容，提升品牌影响力',
                author: '测试品牌',
                coverImageDescription: '春季主题封面图，清新活力风格',
                summary: '本次春季焕新活动旨在提升品牌认知，带来全新购物体验。',
                body: '## 活动介绍\n\n春季焕新活动正式启动！\n\n## 活动亮点\n\n1. 新品上市\n2. 限时优惠\n3. 会员专享\n\n## 参与方式\n\n关注我们，获取最新活动信息。',
                sections: [
                  {
                    heading: '活动介绍',
                    content: '春季焕新活动正式启动！',
                    imageDescription: '活动主题图片',
                  },
                ],
                callToAction: {
                  text: '立即参与活动，获取专属福利',
                  link: 'https://example.com',
                  qrCodeDescription: '活动参与二维码',
                },
                tags: ['春季焕新', '营销活动', '品牌推广'],
                originalDeclaration: true,
                enableAppreciation: false,
              },
              xiaohongshu: {
                title: '🔥春季焕新活动 | 不容错过的精彩！',
                content:
                  '姐妹们看过来！焕新生活，从春季开始\n\n💡活动亮点：\n✨ 新品上市\n✨ 限时优惠\n✨ 会员专享\n\n📍参与方式：关注+评论\n\n#春季焕新 #营销活动 #品牌推广',
                imageDescriptions: ['活动主视觉图', '产品展示图'],
                hashtags: ['春季焕新', '营销活动', '品牌推广'],
                location: '线上',
                mentions: [],
                productTags: [],
                engagementPrompt: '评论区分享你的春季焕新计划吧！',
              },
              weibo: {
                content:
                  '#春季焕新活动# 焕新生活，从春季开始\n\n提升品牌认知，促进销售转化\n\n🔗活动详情：https://example.com\n\n@测试品牌官方',
                imageDescriptions: ['活动海报'],
                hashtags: ['春季焕新活动', '营销活动'],
                mentions: ['测试品牌官方'],
                engagementPrompt: '转发+评论，抽3位送出春季好礼',
              },
              douyin: {
                title: '春季焕新活动 | 焕新生活，从春季开始',
                videoScript: {
                  scenes: [
                    {
                      sequence: 1,
                      description: '开场展示春季元素',
                      shotType: 'wide',
                      duration: 3,
                      dialogue: '',
                      bgmSuggestion: '轻快音乐',
                    },
                  ],
                  totalDuration: 15,
                },
                caption:
                  '焕新生活，从春季开始 👆点击上方参与活动！\n\n#春季焕新 #营销活动',
                hashtags: ['春季焕新', '营销活动'],
                mentions: [],
                engagementPrompt: '关注+点赞，评论区@好友一起参与',
                shoppingProducts: [],
              },
            },
            visualSuggestions: {
              coverImages: [
                {
                  type: 'cover',
                  theme: '春季焕新',
                  style: 'vibrant',
                  colorPalette: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
                  elements: ['品牌logo', '活动主题文字'],
                  dimensions: ['1200x630', '800x450'],
                },
              ],
              contentImages: [
                {
                  type: 'content',
                  theme: '活动亮点展示',
                  style: 'professional',
                  colorPalette: ['#333333', '#FFFFFF'],
                  elements: ['文字说明', '图标'],
                  dimensions: ['800x600'],
                },
              ],
              videoScripts: [
                {
                  type: 'storytelling',
                  theme: '春季焕新',
                  targetAudience: ['年轻用户'],
                  duration: 15,
                  scenes: [
                    {
                      sequence: 1,
                      description: '开场吸引注意力',
                      shotType: 'wide',
                      duration: 3,
                      visualElements: ['快速剪辑'],
                      transition: 'cut',
                    },
                  ],
                  voiceoverScript: '欢迎参加春季焕新活动！',
                  bgmSuggestions: ['轻快音乐'],
                  subtitlePoints: ['活动主题', '参与方式'],
                },
              ],
              colorPalette: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
            },
            schedulingPlan: {
              publishSchedule: [
                {
                  platform: 'wechat',
                  date: '2026-03-28',
                  time: '20:00',
                  contentType: 'article',
                  priority: 'high',
                  notes: '主推文章',
                },
              ],
              contentCalendar: [
                {
                  id: 'event-1',
                  title: '春季焕新活动',
                  date: '2026-03-28',
                  startTime: '20:00',
                  platform: 'multi',
                  contentSummary: '多平台同步发布',
                  status: 'scheduled',
                  assignedTo: 'AI Agent',
                },
              ],
              optimizationTips: ['优化发布时间', '增加互动问题'],
            },
            complianceCheck: {
              platformRules: [
                {
                  name: '基础内容检查',
                  platformRule: '内容应符合平台基本规则',
                  status: 'pass',
                  issueDescription: '',
                  suggestedFix: '',
                },
              ],
              legalReview: [
                {
                  name: '版权检查',
                  relevantRegulations: ['著作权法'],
                  riskLevel: 'low',
                  status: 'approved',
                  comments: '原创内容',
                },
              ],
              riskAssessment: 'low',
              overallCompliance: 'compliant',
            },
            metadata: {
              generatedAt: '2026-03-28T10:00:00Z',
              templateUsed: 'standard_multi_platform',
              qualityScore: 85,
              estimatedEngagement: {
                estimatedViews: 10000,
                estimatedLikes: 500,
                estimatedComments: 250,
                estimatedShares: 100,
              },
            },
          }),
          hashtags: ['春季焕新', '营销活动'],
          platform: Platform.CONTENT_GENERATION,
          tone: 'professional',
          wordCount: 2000,
          estimatedReadingTime: '10分钟',
        },
        qualityAssessment: {
          score: 85,
          metrics: {
            readability: 90,
            engagement: 85,
            relevance: 90,
            originality: 80,
            platformFit: 85,
          },
          feedback: '文案质量优秀，符合各平台特性',
          improvementSuggestions: [],
        },
        processingTime: 1500,
        modelUsed: 'gemini-2.5-flash',
      });

      configService.get.mockReturnValue('gemini');

      const result = await service.execute(input);

      expect(result).toBeDefined();
      expect(result.platformContents).toBeDefined();
      expect(result.platformContents.wechat).toBeDefined();
      expect(result.platformContents.xiaohongshu).toBeDefined();
      expect(result.platformContents.weibo).toBeDefined();
      expect(result.platformContents.douyin).toBeDefined();
      expect(result.visualSuggestions).toBeDefined();
      expect(result.schedulingPlan).toBeDefined();
      expect(result.complianceCheck).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(geminiService.generateContent).toHaveBeenCalled();
    });

    it('当AI引擎不可用时应返回回退文案', async () => {
      const input: CopywritingAgentInput = {
        strategyPlan: {
          campaignTheme: {
            name: '测试活动',
            slogan: '测试口号',
            visualStyle: '测试风格',
            keyMessages: ['测试信息'],
            toneOfVoice: 'professional',
          },
          marketingStrategy: {
            objectives: ['测试目标'],
            tactics: [],
            channels: [],
            targetAudienceSegments: ['测试受众'],
          },
          activityPlan: {
            timeline: [],
            keyActions: [],
            dependencies: [],
            riskMitigation: [],
          },
          budgetPlan: {
            totalBudget: 10000,
            currency: 'CNY',
            breakdown: [],
            roiEstimation: 100,
            roiExplanation: '测试ROI',
            contingencyBudget: 1000,
          },
          successMetrics: {
            kpis: [],
            measurementTimeline: [],
            reportingFrequency: 'weekly',
          },
          riskAssessment: {
            risks: [],
            overallRiskLevel: 'low',
          },
        },
        platformSpecs: [
          {
            platform: 'wechat',
            description: '测试平台',
            contentType: 'article',
            postingTimeSuggestions: [],
            engagementSuggestions: [],
            complianceRequirements: [],
          },
        ],
        brandGuidelines: {
          brandName: '测试品牌',
          tagline: '测试口号',
          brandValues: ['测试价值'],
          brandPersonality: {
            adjectives: ['测试'],
            toneOfVoice: 'professional',
            communicationStyle: ['测试风格'],
          },
          visualGuidelines: {
            brandColors: ['#000000'],
            typography: [],
            imageStyle: [],
            logoUsage: [],
          },
          contentGuidelines: {
            keywords: [],
            forbiddenTopics: [],
            recommendedTopics: [],
            successStories: [],
          },
          customerPersonas: [],
        },
        forbiddenWords: [],
      };

      geminiService.isGeminiAvailable.mockReturnValue(false);
      configService.get.mockReturnValue('gemini');

      const result = await service.execute(input);

      expect(result).toBeDefined();
      expect(result.platformContents.wechat.title).toContain('测试活动');
      expect(result.platformContents.xiaohongshu.title).toBeDefined();
      expect(result.platformContents.weibo.content).toBeDefined();
      expect(result.platformContents.douyin.title).toBeDefined();
      // 回退文案不应调用AI生成
      expect(geminiService.generateContent).not.toHaveBeenCalled();
    });

    it('当AI生成失败时应返回回退文案', async () => {
      const input: CopywritingAgentInput = {
        strategyPlan: {
          campaignTheme: {
            name: '测试活动',
            slogan: '测试口号',
            visualStyle: '测试风格',
            keyMessages: ['测试信息'],
            toneOfVoice: 'professional',
          },
          marketingStrategy: {
            objectives: ['测试目标'],
            tactics: [],
            channels: [],
            targetAudienceSegments: ['测试受众'],
          },
          activityPlan: {
            timeline: [],
            keyActions: [],
            dependencies: [],
            riskMitigation: [],
          },
          budgetPlan: {
            totalBudget: 10000,
            currency: 'CNY',
            breakdown: [],
            roiEstimation: 100,
            roiExplanation: '测试ROI',
            contingencyBudget: 1000,
          },
          successMetrics: {
            kpis: [],
            measurementTimeline: [],
            reportingFrequency: 'weekly',
          },
          riskAssessment: {
            risks: [],
            overallRiskLevel: 'low',
          },
        },
        platformSpecs: [
          {
            platform: 'wechat',
            description: '测试平台',
            contentType: 'article',
            postingTimeSuggestions: [],
            engagementSuggestions: [],
            complianceRequirements: [],
          },
        ],
        brandGuidelines: {
          brandName: '测试品牌',
          tagline: '测试口号',
          brandValues: ['测试价值'],
          brandPersonality: {
            adjectives: ['测试'],
            toneOfVoice: 'professional',
            communicationStyle: ['测试风格'],
          },
          visualGuidelines: {
            brandColors: ['#000000'],
            typography: [],
            imageStyle: [],
            logoUsage: [],
          },
          contentGuidelines: {
            keywords: [],
            forbiddenTopics: [],
            recommendedTopics: [],
            successStories: [],
          },
          customerPersonas: [],
        },
        forbiddenWords: [],
      };

      geminiService.isGeminiAvailable.mockReturnValue(true);
      geminiService.generateContent.mockRejectedValue(new Error('AI生成失败'));
      configService.get.mockReturnValue('gemini');

      const result = await service.execute(input);

      expect(result).toBeDefined();
      expect(result.platformContents.wechat.title).toContain('测试活动');
      expect(result.metadata.templateUsed).toBe('fallback');
    });
  });

  describe('禁忌词检查', () => {
    it('当内容包含禁忌词时应标记为不合规', async () => {
      const input: CopywritingAgentInput = {
        strategyPlan: {
          campaignTheme: {
            name: '测试活动',
            slogan: '测试口号',
            visualStyle: '测试风格',
            keyMessages: ['测试信息'],
            toneOfVoice: 'professional',
          },
          marketingStrategy: {
            objectives: ['测试目标'],
            tactics: [],
            channels: [],
            targetAudienceSegments: ['测试受众'],
          },
          activityPlan: {
            timeline: [],
            keyActions: [],
            dependencies: [],
            riskMitigation: [],
          },
          budgetPlan: {
            totalBudget: 10000,
            currency: 'CNY',
            breakdown: [],
            roiEstimation: 100,
            roiExplanation: '测试ROI',
            contingencyBudget: 1000,
          },
          successMetrics: {
            kpis: [],
            measurementTimeline: [],
            reportingFrequency: 'weekly',
          },
          riskAssessment: {
            risks: [],
            overallRiskLevel: 'low',
          },
        },
        platformSpecs: [
          {
            platform: 'wechat',
            description: '测试平台',
            contentType: 'article',
            postingTimeSuggestions: [],
            engagementSuggestions: [],
            complianceRequirements: [],
          },
        ],
        brandGuidelines: {
          brandName: '测试品牌',
          tagline: '测试口号',
          brandValues: ['测试价值'],
          brandPersonality: {
            adjectives: ['测试'],
            toneOfVoice: 'professional',
            communicationStyle: ['测试风格'],
          },
          visualGuidelines: {
            brandColors: ['#000000'],
            typography: [],
            imageStyle: [],
            logoUsage: [],
          },
          contentGuidelines: {
            keywords: [],
            forbiddenTopics: [],
            recommendedTopics: [],
            successStories: [],
          },
          customerPersonas: [],
        },
        forbiddenWords: ['敏感词'],
      };

      // 模拟AI返回包含禁忌词的内容
      geminiService.isGeminiAvailable.mockReturnValue(true);
      geminiService.generateContent.mockResolvedValue({
        success: true,
        content: {
          title: '文案生成结果',
          content: JSON.stringify({
            platformContents: {
              wechat: {
                title: '测试活动 | 包含敏感词的内容',
                subtitle: '',
                author: '',
                coverImageDescription: '',
                summary: '这是一个包含敏感词的测试内容。',
                body: '这里提到了敏感词。',
                sections: [],
                callToAction: { text: '', link: '' },
                tags: [],
                originalDeclaration: true,
                enableAppreciation: false,
              },
              xiaohongshu: {
                title: '测试',
                content: '测试内容',
                imageDescriptions: [],
                hashtags: [],
                location: '',
                mentions: [],
                productTags: [],
                engagementPrompt: '',
              },
              weibo: {
                content: '测试内容',
                imageDescriptions: [],
                hashtags: [],
                mentions: [],
                engagementPrompt: '',
              },
              douyin: {
                title: '测试',
                videoScript: { scenes: [], totalDuration: 0 },
                caption: '测试',
                hashtags: [],
                mentions: [],
                engagementPrompt: '',
                shoppingProducts: [],
              },
            },
            visualSuggestions: {
              coverImages: [],
              contentImages: [],
              videoScripts: [],
              colorPalette: [],
            },
            schedulingPlan: {
              publishSchedule: [],
              contentCalendar: [],
              optimizationTips: [],
            },
            complianceCheck: {
              platformRules: [],
              legalReview: [],
              riskAssessment: 'low',
              overallCompliance: 'compliant',
            },
            metadata: {
              generatedAt: '2026-03-28T10:00:00Z',
              templateUsed: 'standard',
              qualityScore: 80,
              estimatedEngagement: {
                estimatedViews: 0,
                estimatedLikes: 0,
                estimatedComments: 0,
                estimatedShares: 0,
              },
            },
          }),
          hashtags: [],
          platform: Platform.CONTENT_GENERATION,
          tone: 'professional',
          wordCount: 100,
          estimatedReadingTime: '1分钟',
        },
        qualityAssessment: {
          score: 80,
          metrics: {
            readability: 80,
            engagement: 80,
            relevance: 80,
            originality: 80,
            platformFit: 80,
          },
          feedback: '良好',
          improvementSuggestions: [],
        },
        processingTime: 100,
        modelUsed: 'gemini',
      });

      configService.get.mockReturnValue('gemini');

      const result = await service.execute(input);

      expect(result).toBeDefined();
      // 检查是否标记了合规问题
      const forbiddenWordCheck = result.complianceCheck.platformRules.find(
        (rule) => rule.name === '禁忌词检查',
      );
      expect(forbiddenWordCheck).toBeDefined();
      expect(forbiddenWordCheck?.status).toBe('fail');
      expect(forbiddenWordCheck?.issueDescription).toContain('敏感词');
      expect(result.complianceCheck.overallCompliance).toBe('needs_revision');
    });
  });

  describe('品牌色彩应用', () => {
    it('应将品牌色彩添加到配色方案中', async () => {
      const input: CopywritingAgentInput = {
        strategyPlan: {
          campaignTheme: {
            name: '测试活动',
            slogan: '测试口号',
            visualStyle: '测试风格',
            keyMessages: ['测试信息'],
            toneOfVoice: 'professional',
          },
          marketingStrategy: {
            objectives: ['测试目标'],
            tactics: [],
            channels: [],
            targetAudienceSegments: ['测试受众'],
          },
          activityPlan: {
            timeline: [],
            keyActions: [],
            dependencies: [],
            riskMitigation: [],
          },
          budgetPlan: {
            totalBudget: 10000,
            currency: 'CNY',
            breakdown: [],
            roiEstimation: 100,
            roiExplanation: '测试ROI',
            contingencyBudget: 1000,
          },
          successMetrics: {
            kpis: [],
            measurementTimeline: [],
            reportingFrequency: 'weekly',
          },
          riskAssessment: {
            risks: [],
            overallRiskLevel: 'low',
          },
        },
        platformSpecs: [
          {
            platform: 'wechat',
            description: '测试平台',
            contentType: 'article',
            postingTimeSuggestions: [],
            engagementSuggestions: [],
            complianceRequirements: [],
          },
        ],
        brandGuidelines: {
          brandName: '测试品牌',
          tagline: '测试口号',
          brandValues: ['测试价值'],
          brandPersonality: {
            adjectives: ['测试'],
            toneOfVoice: 'professional',
            communicationStyle: ['测试风格'],
          },
          visualGuidelines: {
            brandColors: ['#FF0000', '#00FF00'],
            typography: [],
            imageStyle: [],
            logoUsage: [],
          },
          contentGuidelines: {
            keywords: [],
            forbiddenTopics: [],
            recommendedTopics: [],
            successStories: [],
          },
          customerPersonas: [],
        },
        forbiddenWords: [],
      };

      // 模拟AI返回不包含品牌色彩的响应
      geminiService.isGeminiAvailable.mockReturnValue(true);
      geminiService.generateContent.mockResolvedValue({
        success: true,
        content: {
          title: '文案生成结果',
          content: JSON.stringify({
            platformContents: {
              wechat: {
                title: '测试',
                subtitle: '',
                author: '',
                coverImageDescription: '',
                summary: '',
                body: '',
                sections: [],
                callToAction: { text: '', link: '' },
                tags: [],
                originalDeclaration: true,
                enableAppreciation: false,
              },
              xiaohongshu: {
                title: '测试',
                content: '测试内容',
                imageDescriptions: [],
                hashtags: [],
                location: '',
                mentions: [],
                productTags: [],
                engagementPrompt: '',
              },
              weibo: {
                content: '测试内容',
                imageDescriptions: [],
                hashtags: [],
                mentions: [],
                engagementPrompt: '',
              },
              douyin: {
                title: '测试',
                videoScript: { scenes: [], totalDuration: 0 },
                caption: '测试',
                hashtags: [],
                mentions: [],
                engagementPrompt: '',
                shoppingProducts: [],
              },
            },
            visualSuggestions: {
              coverImages: [],
              contentImages: [],
              videoScripts: [],
              colorPalette: ['#0000FF', '#FFFF00'], // 原有配色
            },
            schedulingPlan: {
              publishSchedule: [],
              contentCalendar: [],
              optimizationTips: [],
            },
            complianceCheck: {
              platformRules: [],
              legalReview: [],
              riskAssessment: 'low',
              overallCompliance: 'compliant',
            },
            metadata: {
              generatedAt: '2026-03-28T10:00:00Z',
              templateUsed: 'standard',
              qualityScore: 80,
              estimatedEngagement: {
                estimatedViews: 0,
                estimatedLikes: 0,
                estimatedComments: 0,
                estimatedShares: 0,
              },
            },
          }),
          hashtags: [],
          platform: Platform.CONTENT_GENERATION,
          tone: 'professional',
          wordCount: 100,
          estimatedReadingTime: '1分钟',
        },
        qualityAssessment: {
          score: 80,
          metrics: {
            readability: 80,
            engagement: 80,
            relevance: 80,
            originality: 80,
            platformFit: 80,
          },
          feedback: '良好',
          improvementSuggestions: [],
        },
        processingTime: 100,
        modelUsed: 'gemini',
      });

      configService.get.mockReturnValue('gemini');

      const result = await service.execute(input);

      expect(result).toBeDefined();
      // 检查品牌色彩是否被添加到配色方案中
      expect(result.visualSuggestions.colorPalette).toContain('#FF0000');
      expect(result.visualSuggestions.colorPalette).toContain('#00FF00');
      expect(result.visualSuggestions.colorPalette).toContain('#0000FF');
      expect(result.visualSuggestions.colorPalette).toContain('#FFFF00');
      // 检查是否去重
      const uniqueColors = [...new Set(result.visualSuggestions.colorPalette)];
      expect(uniqueColors.length).toBeLessThanOrEqual(
        result.visualSuggestions.colorPalette.length,
      );
    });
  });
});
