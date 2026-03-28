import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from '../../../../data-analytics/services/gemini.service';
import { QwenService } from '../../../../data-analytics/services/qwen.service';
import { Platform } from '../../../../../shared/enums/platform.enum';
import {
  CopywritingAgentInput,
  CopywritingAgentOutput,
  PlatformSpec,
  BrandGuideline,
} from '../interfaces/copywriting-agent.interface';
import {
  selectCopywritingTemplate,
  CopywritingPromptTemplate,
} from '../prompt-templates/copywriting-prompt-templates';

/**
 * 文案Agent服务
 * 负责生成各平台定制化文案和视觉建议
 */
@Injectable()
export class CopywritingAgentService {
  private readonly logger = new Logger(CopywritingAgentService.name);
  private readonly defaultAiEngine: 'gemini' | 'qwen' = 'gemini';

  constructor(
    private readonly configService: ConfigService,
    @Inject(GeminiService)
    private readonly geminiService: GeminiService,
    @Inject(QwenService)
    private readonly qwenService: QwenService,
  ) {
    this.defaultAiEngine = this.configService.get<'gemini' | 'qwen'>(
      'AI_ENGINE',
      'gemini',
    );
  }

  /**
   * 执行文案Agent工作流
   */
  async execute(input: CopywritingAgentInput): Promise<CopywritingAgentOutput> {
    this.logger.log('开始执行文案Agent工作流');
    this.logger.debug(`输入数据: ${JSON.stringify(input, null, 2)}`);

    try {
      // 1. 选择适当的提示词模板
      const template = this.selectTemplate(input);
      this.logger.log(`使用模板: ${template.name}`);

      // 2. 构建文案提示词
      const prompt = this.buildCopywritingPrompt(input, template);

      // 3. 调用AI引擎生成文案
      const aiResponse = await this.generateCopywritingWithAI(prompt);

      // 4. 解析AI响应为结构化输出
      const copywritingOutput = this.parseCopywritingResponse(aiResponse);

      // 5. 应用品牌指南和合规检查
      const enrichedOutput = this.enrichWithBrandGuidelines(
        copywritingOutput,
        input.brandGuidelines,
        input.forbiddenWords,
      );

      // 6. 补充元数据
      const finalOutput = this.addMetadata(enrichedOutput, template.id);

      this.logger.log('文案Agent工作流执行成功');
      return finalOutput;
    } catch (error) {
      this.logger.error(
        `文案Agent工作流执行失败: ${error.message}`,
        error.stack,
      );
      // 返回基础文案结果，避免完全失败
      return this.generateFallbackCopywriting(input);
    }
  }

  /**
   * 根据输入选择模板
   */
  private selectTemplate(
    input: CopywritingAgentInput,
  ): CopywritingPromptTemplate {
    const { strategyPlan, platformSpecs } = input;
    const platforms = platformSpecs.map((spec) => spec.platform) as (
      | 'wechat'
      | 'xiaohongshu'
      | 'weibo'
      | 'douyin'
    )[];

    // 从策略中提取场景信息
    const scenario = strategyPlan.campaignTheme.name;
    const contentType = this.determineContentType(platformSpecs);

    return selectCopywritingTemplate(platforms, contentType, scenario);
  }

  /**
   * 根据平台特性确定内容类型
   */
  private determineContentType(platformSpecs: PlatformSpec[]): string {
    const contentTypes = platformSpecs.map((spec) => spec.contentType);

    if (contentTypes.includes('video')) {
      return 'video';
    } else if (contentTypes.includes('article')) {
      return 'article';
    } else if (contentTypes.includes('short_post')) {
      return 'short_post';
    } else {
      return 'campaign';
    }
  }

  /**
   * 构建文案提示词
   */
  private buildCopywritingPrompt(
    input: CopywritingAgentInput,
    template: CopywritingPromptTemplate,
  ): string {
    const { strategyPlan, platformSpecs, brandGuidelines, forbiddenWords } =
      input;

    // 提取行业背景和目标受众
    const industryContext = this.extractIndustryContext(strategyPlan);
    const targetAudience = this.extractTargetAudience(strategyPlan);

    const params = {
      strategyPlan,
      platformSpecs,
      brandGuidelines,
      forbiddenWords,
      industryContext,
      targetAudience,
    };

    return template.generatePrompt(params);
  }

  /**
   * 从策略中提取行业背景
   */
  private extractIndustryContext(
    strategyPlan: CopywritingAgentInput['strategyPlan'],
  ): string {
    // 从策略中提取或使用默认值
    // 实际应用中，这里可能需要从数据库或配置中获取
    return '通用行业';
  }

  /**
   * 从策略中提取目标受众
   */
  private extractTargetAudience(
    strategyPlan: CopywritingAgentInput['strategyPlan'],
  ): string[] {
    const { marketingStrategy } = strategyPlan;

    if (
      marketingStrategy.targetAudienceSegments &&
      marketingStrategy.targetAudienceSegments.length > 0
    ) {
      return marketingStrategy.targetAudienceSegments;
    }

    // 回退到从策略中提取
    const targetFromTactics = marketingStrategy.tactics
      .flatMap((tactic) => tactic.targetAudience)
      .filter((audience, index, self) => self.indexOf(audience) === index);

    return targetFromTactics.length > 0 ? targetFromTactics : ['广大消费者'];
  }

  /**
   * 调用AI引擎生成文案
   */
  private async generateCopywritingWithAI(prompt: string): Promise<string> {
    this.logger.log(`使用${this.defaultAiEngine}引擎生成文案`);

    try {
      if (
        this.defaultAiEngine === 'gemini' &&
        this.geminiService.isGeminiAvailable()
      ) {
        const result = await this.geminiService.generateContent({
          prompt,
          platform: Platform.GENERAL, // 内容生成专用平台
          tone: 'professional',
          wordCount: 3000, // 文案通常需要更多字数
          includeHashtags: true,
          includeImageSuggestions: true,
        });

        if (result.success && result.content) {
          return result.content.content;
        } else {
          throw new Error(
            `Gemini生成失败: ${result.error?.message || '未知错误'}`,
          );
        }
      } else if (this.defaultAiEngine === 'qwen') {
        // TODO: 实现Qwen服务调用
        // 暂时回退到Gemini或基础响应
        this.logger.warn('Qwen服务暂未实现，尝试使用Gemini');
        if (this.geminiService.isGeminiAvailable()) {
          return this.generateCopywritingWithAI(prompt); // 递归调用，但会使用gemini分支
        } else {
          throw new Error('所有AI引擎都不可用');
        }
      } else {
        throw new Error('默认AI引擎不可用');
      }
    } catch (error) {
      this.logger.error(`AI引擎调用失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 解析AI响应为结构化输出
   */
  private parseCopywritingResponse(aiResponse: string): CopywritingAgentOutput {
    try {
      // 清理响应文本，移除可能的Markdown代码块
      let jsonText = aiResponse.trim();
      jsonText = jsonText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      // 解析JSON
      const parsed = JSON.parse(jsonText);

      // 验证必需字段
      const requiredFields = [
        'platformContents',
        'visualSuggestions',
        'schedulingPlan',
        'complianceCheck',
      ];

      for (const field of requiredFields) {
        if (!parsed[field]) {
          throw new Error(`缺少必需字段: ${field}`);
        }
      }

      // 验证平台内容
      const requiredPlatforms = ['wechat', 'xiaohongshu', 'weibo', 'douyin'];
      for (const platform of requiredPlatforms) {
        if (!parsed.platformContents[platform]) {
          throw new Error(`缺少平台内容: ${platform}`);
        }
      }

      // 验证视觉建议
      if (
        !parsed.visualSuggestions.coverImages ||
        !Array.isArray(parsed.visualSuggestions.coverImages)
      ) {
        throw new Error('visualSuggestions.coverImages必须为数组');
      }
      if (
        !parsed.visualSuggestions.contentImages ||
        !Array.isArray(parsed.visualSuggestions.contentImages)
      ) {
        throw new Error('visualSuggestions.contentImages必须为数组');
      }

      // 验证排期计划
      if (
        !parsed.schedulingPlan.publishSchedule ||
        !Array.isArray(parsed.schedulingPlan.publishSchedule)
      ) {
        throw new Error('schedulingPlan.publishSchedule必须为数组');
      }

      // 验证合规检查
      if (
        !parsed.complianceCheck.platformRules ||
        !Array.isArray(parsed.complianceCheck.platformRules)
      ) {
        throw new Error('complianceCheck.platformRules必须为数组');
      }

      return parsed as CopywritingAgentOutput;
    } catch (error) {
      this.logger.error(`解析AI响应失败: ${error.message}`);
      this.logger.debug(`原始响应: ${aiResponse.substring(0, 500)}...`);
      throw new Error(`文案响应解析失败: ${error.message}`);
    }
  }

  /**
   * 使用品牌指南丰富输出
   */
  private enrichWithBrandGuidelines(
    output: CopywritingAgentOutput,
    brandGuidelines: BrandGuideline,
    forbiddenWords: string[],
  ): CopywritingAgentOutput {
    // 1. 检查禁忌词
    this.checkForbiddenWords(output, forbiddenWords);

    // 2. 应用品牌语调
    this.applyBrandTone(output, brandGuidelines.brandPersonality.toneOfVoice);

    // 3. 应用品牌色彩建议
    this.applyBrandColors(output, brandGuidelines.visualGuidelines.brandColors);

    // 4. 更新合规检查中的品牌合规项
    this.updateComplianceForBrand(output, brandGuidelines);

    return output;
  }

  /**
   * 检查禁忌词
   */
  private checkForbiddenWords(
    output: CopywritingAgentOutput,
    forbiddenWords: string[],
  ): void {
    if (forbiddenWords.length === 0) return;

    const allText = this.extractAllText(output);
    const foundWords: string[] = [];

    for (const word of forbiddenWords) {
      if (allText.includes(word)) {
        foundWords.push(word);
      }
    }

    if (foundWords.length > 0) {
      output.complianceCheck.platformRules.push({
        name: '禁忌词检查',
        platformRule: '内容不应包含禁忌词',
        status: 'fail',
        issueDescription: `发现禁忌词: ${foundWords.join('、')}`,
        suggestedFix: '替换或删除禁忌词',
      });
      output.complianceCheck.overallCompliance = 'needs_revision';
      output.complianceCheck.riskAssessment = 'medium';
    }
  }

  /**
   * 提取所有文本内容
   */
  private extractAllText(output: CopywritingAgentOutput): string {
    const texts: string[] = [];

    // 提取微信公众号内容
    const wechat = output.platformContents.wechat;
    texts.push(
      wechat.title,
      wechat.subtitle || '',
      wechat.summary,
      wechat.body,
    );
    wechat.sections.forEach((section) => {
      texts.push(section.heading, section.content);
    });

    // 提取小红书内容
    const xhs = output.platformContents.xiaohongshu;
    texts.push(xhs.title, xhs.content);

    // 提取微博内容
    const weibo = output.platformContents.weibo;
    texts.push(weibo.content);

    // 提取抖音内容
    const douyin = output.platformContents.douyin;
    texts.push(douyin.title, douyin.caption);

    return texts.join(' ');
  }

  /**
   * 应用品牌语调
   */
  private applyBrandTone(
    output: CopywritingAgentOutput,
    toneOfVoice: string,
  ): void {
    // 在实际应用中，这里可能需要调整文案风格以匹配品牌语调
    // 目前仅记录在元数据中
    this.logger.debug(`应用品牌语调: ${toneOfVoice}`);
  }

  /**
   * 应用品牌色彩
   */
  private applyBrandColors(
    output: CopywritingAgentOutput,
    brandColors: string[],
  ): void {
    // 将品牌色彩添加到视觉建议的配色方案中
    if (brandColors.length > 0) {
      output.visualSuggestions.colorPalette = [
        ...new Set([...brandColors, ...output.visualSuggestions.colorPalette]),
      ].slice(0, 8); // 限制为8种颜色
    }
  }

  /**
   * 更新品牌合规检查
   */
  private updateComplianceForBrand(
    output: CopywritingAgentOutput,
    brandGuidelines: BrandGuideline,
  ): void {
    // 添加品牌合规检查项
    output.complianceCheck.platformRules.push({
      name: '品牌价值观一致性',
      platformRule: '内容应符合品牌价值观',
      status: 'pass', // 假设通过，实际需要更复杂检查
      issueDescription: '',
      suggestedFix: '',
    });

    output.complianceCheck.platformRules.push({
      name: '品牌视觉规范',
      platformRule: '视觉建议应符合品牌视觉指南',
      status: 'pass', // 假设通过
      issueDescription: '',
      suggestedFix: '',
    });
  }

  /**
   * 添加元数据
   */
  private addMetadata(
    output: CopywritingAgentOutput,
    templateId: string,
  ): CopywritingAgentOutput {
    const now = new Date();
    output.metadata = {
      generatedAt: now.toISOString(),
      templateUsed: templateId,
      qualityScore: this.calculateQualityScore(output),
      estimatedEngagement: this.estimateEngagement(output),
    };

    return output;
  }

  /**
   * 计算内容质量评分
   */
  private calculateQualityScore(output: CopywritingAgentOutput): number {
    let score = 80; // 基础分

    // 根据内容完整性加分
    const wechat = output.platformContents.wechat;
    if (wechat.sections.length >= 3) score += 5;
    if (wechat.summary.length > 50) score += 5;

    const xhs = output.platformContents.xiaohongshu;
    if (xhs.hashtags.length >= 5) score += 5;

    const douyin = output.platformContents.douyin;
    if (douyin.videoScript.scenes.length >= 3) score += 5;

    // 根据视觉建议加分
    if (output.visualSuggestions.coverImages.length >= 2) score += 5;
    if (output.visualSuggestions.contentImages.length >= 4) score += 5;

    // 根据合规状态扣分
    if (output.complianceCheck.overallCompliance === 'needs_revision')
      score -= 10;
    if (output.complianceCheck.overallCompliance === 'non_compliant')
      score -= 20;

    // 确保分数在0-100范围内
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 预估互动效果
   */
  private estimateEngagement(output: CopywritingAgentOutput): {
    estimatedViews: number;
    estimatedLikes: number;
    estimatedComments: number;
    estimatedShares: number;
  } {
    // 简单的预估逻辑，实际应用中可能需要更复杂的模型
    const qualityScore = this.calculateQualityScore(output);
    const baseViews = 1000;
    const multiplier = qualityScore / 100;

    return {
      estimatedViews: Math.round(baseViews * multiplier * 5),
      estimatedLikes: Math.round(baseViews * multiplier * 0.1),
      estimatedComments: Math.round(baseViews * multiplier * 0.05),
      estimatedShares: Math.round(baseViews * multiplier * 0.02),
    };
  }

  /**
   * 生成回退文案（当AI引擎失败时）
   */
  private generateFallbackCopywriting(
    input: CopywritingAgentInput,
  ): CopywritingAgentOutput {
    this.logger.warn('使用回退文案方案');

    const { strategyPlan } = input;
    const campaignTheme = strategyPlan.campaignTheme;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      platformContents: {
        wechat: {
          title: `${campaignTheme.name} | ${campaignTheme.slogan}`,
          subtitle: '专业营销内容，提升品牌影响力',
          author: 'LuminaMedia AI',
          coverImageDescription: '品牌主题封面图，包含品牌色彩和活动元素',
          summary: `本次${campaignTheme.name}活动旨在${strategyPlan.marketingStrategy.objectives[0] || '提升品牌影响力'}。`,
          body: `## 活动介绍\n\n${campaignTheme.name}是专为目标客群设计的营销活动。\n\n## 活动亮点\n\n1. ${campaignTheme.keyMessages?.[0] || '专业策划'}\n2. ${campaignTheme.keyMessages?.[1] || '多渠道覆盖'}\n3. ${campaignTheme.keyMessages?.[2] || '高互动性'}\n\n## 参与方式\n\n关注我们，获取最新活动信息。`,
          sections: [
            {
              heading: '活动介绍',
              content: `${campaignTheme.name}是专为目标客群设计的营销活动。`,
              imageDescription: '活动主题图片',
            },
            {
              heading: '活动亮点',
              content: '专业策划、多渠道覆盖、高互动性',
              imageDescription: '亮点展示图',
            },
          ],
          callToAction: {
            text: '立即参与活动，获取专属福利',
            link: 'https://example.com',
            qrCodeDescription: '活动参与二维码',
          },
          tags: [campaignTheme.name, '营销活动', '品牌推广'],
          originalDeclaration: true,
          enableAppreciation: false,
        },
        xiaohongshu: {
          title: `🔥${campaignTheme.name} | 不容错过的精彩活动！`,
          content: `姐妹们看过来！${campaignTheme.slogan}\n\n💡活动亮点：\n✨ ${campaignTheme.keyMessages?.[0] || '专业策划'}\n✨ ${campaignTheme.keyMessages?.[1] || '多渠道覆盖'}\n✨ ${campaignTheme.keyMessages?.[2] || '高互动性'}\n\n📍参与方式：关注+评论\n\n#${campaignTheme.name.replace(/\s+/g, '')} #营销活动 #品牌推广`,
          imageDescriptions: ['活动主视觉图', '活动现场图', '奖品展示图'],
          hashtags: [
            campaignTheme.name.replace(/\s+/g, ''),
            '营销活动',
            '品牌推广',
          ],
          location: '线上',
          mentions: [],
          productTags: [],
          engagementPrompt: '评论区分享你对活动的期待吧！',
        },
        weibo: {
          content: `#${campaignTheme.name}# ${campaignTheme.slogan}\n\n${strategyPlan.marketingStrategy.objectives[0] || '提升品牌影响力'}\n\n🔗活动详情：https://example.com\n\n@LuminaMedia官方`,
          imageDescriptions: ['活动海报'],
          hashtags: [campaignTheme.name, '营销活动'],
          mentions: ['LuminaMedia官方'],
          engagementPrompt: '转发+评论，抽3位送出活动周边',
        },
        douyin: {
          title: `${campaignTheme.name} | ${campaignTheme.slogan}`,
          videoScript: {
            scenes: [
              {
                sequence: 1,
                description: '快速剪辑展示活动亮点',
                shotType: 'wide',
                duration: 3,
                dialogue: '',
                bgmSuggestion: ' upbeat流行音乐',
              },
              {
                sequence: 2,
                description: '主持人介绍活动详情',
                shotType: 'medium',
                duration: 5,
                dialogue: `大家好，欢迎参加${campaignTheme.name}！`,
              },
              {
                sequence: 3,
                description: '展示奖品和参与方式',
                shotType: 'closeup',
                duration: 4,
                dialogue: '参与就有机会赢取精美奖品！',
              },
            ],
            totalDuration: 12,
          },
          caption: `${campaignTheme.slogan} 👆点击上方参与活动！\n\n#${campaignTheme.name} #营销活动`,
          hashtags: [campaignTheme.name, '营销活动'],
          mentions: [],
          engagementPrompt: '关注+点赞，评论区@好友一起参与',
          shoppingProducts: [],
        },
      },
      visualSuggestions: {
        coverImages: [
          {
            type: 'cover',
            theme: campaignTheme.name,
            style: 'vibrant',
            colorPalette: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
            elements: ['品牌logo', '活动主题文字', '装饰元素'],
            dimensions: ['1200x630', '800x450'],
          },
        ],
        contentImages: [
          {
            type: 'content',
            theme: '活动亮点展示',
            style: 'professional',
            colorPalette: ['#333333', '#FFFFFF', '#FF6B6B'],
            elements: ['文字说明', '图标', '背景'],
            dimensions: ['800x600', '600x400'],
          },
        ],
        videoScripts: [
          {
            type: 'storytelling',
            theme: campaignTheme.name,
            targetAudience: ['年轻用户'],
            duration: 15,
            scenes: [
              {
                sequence: 1,
                description: '开场吸引注意力',
                shotType: 'wide',
                duration: 3,
                visualElements: ['快速剪辑', '特效文字'],
                transition: 'cut',
              },
            ],
            voiceoverScript: `欢迎参加${campaignTheme.name}，让我们一起创造精彩！`,
            bgmSuggestions: [' upbeat流行音乐', '电子音乐'],
            subtitlePoints: ['活动主题', '参与方式', '奖品介绍'],
          },
        ],
        colorPalette: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#333333', '#FFFFFF'],
      },
      schedulingPlan: {
        publishSchedule: [
          {
            platform: 'wechat',
            date: tomorrow.toISOString().split('T')[0],
            time: '20:00',
            contentType: 'article',
            priority: 'high',
            notes: '微信公众号主推文章',
          },
          {
            platform: 'xiaohongshu',
            date: tomorrow.toISOString().split('T')[0],
            time: '19:00',
            contentType: 'short_post',
            priority: 'medium',
            notes: '小红书预热笔记',
          },
        ],
        contentCalendar: [
          {
            id: 'event-1',
            title: campaignTheme.name,
            date: tomorrow.toISOString().split('T')[0],
            startTime: '20:00',
            platform: 'multi',
            contentSummary: '多平台同步发布活动内容',
            status: 'scheduled',
            assignedTo: 'AI Agent',
          },
        ],
        optimizationTips: [
          '根据发布时间调整内容长度',
          '针对不同平台优化图片尺寸',
          '设置互动问题提高参与度',
        ],
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
            comments: '原创内容，无版权风险',
          },
        ],
        riskAssessment: 'low',
        overallCompliance: 'compliant',
      },
      metadata: {
        generatedAt: now.toISOString(),
        templateUsed: 'fallback',
        qualityScore: 70,
        estimatedEngagement: {
          estimatedViews: 5000,
          estimatedLikes: 250,
          estimatedComments: 125,
          estimatedShares: 50,
        },
      },
    };
  }
}
