import { Injectable, Logger } from '@nestjs/common';
import { GeoRegion } from '../entities/geo-region.entity';
import {
  SeoSuggestion,
  SuggestionType,
  PriorityLevel,
  ImplementationStatus,
} from '../entities/seo-suggestion.entity';
import { GeoAnalysisRequestDto } from '../dto/geo-analysis-request.dto';

@Injectable()
export class SeoSuggestionService {
  private readonly logger = new Logger(SeoSuggestionService.name);

  /**
   * 生成SEO建议
   */
  async generateSuggestions(
    regions: GeoRegion[],
    request: GeoAnalysisRequestDto,
  ): Promise<any> {
    this.logger.log(`Generating SEO suggestions for ${regions.length} regions`);

    const seoSuggestions = {
      keywordOpportunities: [] as any[],
      contentLocalization: {
        culturalElements: [] as string[],
        languageAdaptations: [] as string[],
        localReferences: [] as string[],
        seasonalContent: [] as string[],
      },
      channelRecommendations: [] as any[],
      technicalOptimizations: [] as any[],
    };

    for (const region of regions) {
      // 关键词机会分析
      const keywordOpportunities = this.analyzeKeywordOpportunities(
        region,
        request,
      );
      seoSuggestions.keywordOpportunities.push(...keywordOpportunities);

      // 内容本地化建议
      const localizationSuggestions =
        this.generateLocalizationSuggestions(region);
      seoSuggestions.contentLocalization.culturalElements.push(
        ...localizationSuggestions.culturalElements,
      );
      seoSuggestions.contentLocalization.languageAdaptations.push(
        ...localizationSuggestions.languageAdaptations,
      );
      seoSuggestions.contentLocalization.localReferences.push(
        ...localizationSuggestions.localReferences,
      );
      seoSuggestions.contentLocalization.seasonalContent.push(
        ...localizationSuggestions.seasonalContent,
      );

      // 渠道推荐
      const channelRecommendations = this.recommendChannels(region);
      seoSuggestions.channelRecommendations.push(...channelRecommendations);

      // 技术优化建议
      const technicalOptimizations = this.suggestTechnicalOptimizations(region);
      seoSuggestions.technicalOptimizations.push(...technicalOptimizations);
    }

    // 去重和排序
    seoSuggestions.keywordOpportunities = this.deduplicateAndRankKeywords(
      seoSuggestions.keywordOpportunities,
    );
    seoSuggestions.channelRecommendations = this.deduplicateAndRankChannels(
      seoSuggestions.channelRecommendations,
    );
    seoSuggestions.technicalOptimizations =
      this.prioritizeTechnicalOptimizations(
        seoSuggestions.technicalOptimizations,
      );

    return seoSuggestions;
  }

  /**
   * 分析关键词机会
   */
  private analyzeKeywordOpportunities(
    region: GeoRegion,
    request: GeoAnalysisRequestDto,
  ): any[] {
    const opportunities: any[] = [];

    // 基础关键词（地区+行业）
    const baseKeywords = this.generateBaseKeywords(region, request);
    baseKeywords.forEach((keyword) => {
      opportunities.push({
        keyword,
        searchVolume: this.estimateSearchVolume(keyword, region),
        competition: this.assessKeywordCompetition(keyword, region),
        opportunityScore: this.calculateOpportunityScore(keyword, region),
        suggestedActions: this.suggestKeywordActions(keyword, region),
      });
    });

    // 长尾关键词
    const longTailKeywords = this.generateLongTailKeywords(region, request);
    longTailKeywords.forEach((keyword) => {
      opportunities.push({
        keyword,
        searchVolume: this.estimateSearchVolume(keyword, region),
        competition: this.assessKeywordCompetition(keyword, region),
        opportunityScore: this.calculateOpportunityScore(keyword, region),
        suggestedActions: this.suggestKeywordActions(keyword, region),
      });
    });

    // 问题类关键词
    const questionKeywords = this.generateQuestionKeywords(region, request);
    questionKeywords.forEach((keyword) => {
      opportunities.push({
        keyword,
        searchVolume: this.estimateSearchVolume(keyword, region),
        competition: this.assessKeywordCompetition(keyword, region),
        opportunityScore: this.calculateOpportunityScore(keyword, region),
        suggestedActions: this.suggestKeywordActions(keyword, region),
      });
    });

    return opportunities;
  }

  /**
   * 生成基础关键词
   */
  private generateBaseKeywords(
    region: GeoRegion,
    request: GeoAnalysisRequestDto,
  ): string[] {
    const keywords: string[] = [];

    // 地区+行业组合
    if (request.industries) {
      request.industries.forEach((industry) => {
        keywords.push(`${region.name}${industry}`);
        keywords.push(`${industry} ${region.name}`);
        keywords.push(`${region.name}${industry}服务`);
        keywords.push(`${region.name}${industry}公司`);
      });
    }

    // 地区+产品/服务
    const productsServices = this.inferProductsServices(region, request);
    productsServices.forEach((product) => {
      keywords.push(`${region.name}${product}`);
      keywords.push(`${product} ${region.name}`);
    });

    // 地区+解决方案
    keywords.push(`${region.name}解决方案`);
    keywords.push(`${region.name}专业服务`);

    return keywords.slice(0, 10); // 最多10个基础关键词
  }

  /**
   * 生成长尾关键词
   */
  private generateLongTailKeywords(
    region: GeoRegion,
    request: GeoAnalysisRequestDto,
  ): string[] {
    const keywords: string[] = [];

    // 问题解决类
    if (request.industries) {
      request.industries.forEach((industry) => {
        keywords.push(`${region.name}${industry}哪家好`);
        keywords.push(`${region.name}${industry}价格`);
        keywords.push(`${region.name}${industry}怎么样`);
        keywords.push(`${region.name}${industry}推荐`);
      });
    }

    // 比较类
    keywords.push(`${region.name}最好的`);
    keywords.push(`${region.name}性价比最高的`);
    keywords.push(`${region.name}专业`);

    // 具体需求类
    const needs = this.identifyRegionalNeeds(region);
    needs.forEach((need) => {
      keywords.push(`${region.name}${need}`);
      keywords.push(`${need} ${region.name}`);
    });

    return keywords.slice(0, 15); // 最多15个长尾关键词
  }

  /**
   * 生成问题类关键词
   */
  private generateQuestionKeywords(
    region: GeoRegion,
    request: GeoAnalysisRequestDto,
  ): string[] {
    const keywords: string[] = [];

    // 如何/怎样类问题
    if (request.industries) {
      request.industries.forEach((industry) => {
        keywords.push(`如何在${region.name}选择${industry}`);
        keywords.push(`${region.name}${industry}怎么选`);
        keywords.push(`${region.name}${industry}注意事项`);
      });
    }

    // 什么/哪些类问题
    keywords.push(`${region.name}有什么优势`);
    keywords.push(`${region.name}哪些公司好`);
    keywords.push(`${region.name}特点是什么`);

    // 为什么类问题
    keywords.push(`为什么选择${region.name}`);
    keywords.push(`${region.name}的优势在哪里`);

    return keywords.slice(0, 10); // 最多10个问题关键词
  }

  /**
   * 生成内容本地化建议
   */
  private generateLocalizationSuggestions(region: GeoRegion): any {
    return {
      culturalElements: this.identifyCulturalElements(region),
      languageAdaptations: this.suggestLanguageAdaptations(region),
      localReferences: this.suggestLocalReferences(region),
      seasonalContent: this.suggestSeasonalContent(region),
    };
  }

  /**
   * 推荐渠道
   */
  private recommendChannels(region: GeoRegion): any[] {
    const recommendations: any[] = [];

    // 基于地区数字化水平推荐
    if (region.digitalInfrastructure) {
      // 社交媒体渠道
      if (region.digitalInfrastructure.socialMediaUsage) {
        Object.entries(region.digitalInfrastructure.socialMediaUsage).forEach(
          ([platform, usage]) => {
            if (Number(usage) > 30) {
              // 使用率超过30%
              recommendations.push({
                channel: platform,
                reach: Number(usage),
                engagement: this.estimateEngagement(platform, region),
                costEffectiveness: this.assessCostEffectiveness(
                  platform,
                  region,
                ),
                recommendedActions: this.suggestChannelActions(
                  platform,
                  region,
                ),
              });
            }
          },
        );
      }

      // 电商平台
      if (region.digitalInfrastructure.ecommercePlatforms) {
        region.digitalInfrastructure.ecommercePlatforms.forEach((platform) => {
          recommendations.push({
            channel: platform,
            reach: this.estimateEcommerceReach(platform, region),
            engagement: 65, // 默认值
            costEffectiveness: 'medium',
            recommendedActions: [
              `在${platform}开设官方店铺`,
              `优化${platform}商品详情页`,
              `参与${platform}促销活动`,
            ],
          });
        });
      }
    }

    // 基于消费者行为推荐
    if (region.consumerBehavior?.preferredChannels) {
      region.consumerBehavior.preferredChannels.forEach((channel) => {
        if (!recommendations.some((rec) => rec.channel === channel)) {
          recommendations.push({
            channel,
            reach: 70, // 默认覆盖率
            engagement: 60,
            costEffectiveness: 'high',
            recommendedActions: [
              `加强${channel}渠道建设`,
              `优化${channel}用户体验`,
              `跟踪${channel}转化效果`,
            ],
          });
        }
      });
    }

    return recommendations;
  }

  /**
   * 建议技术优化
   */
  private suggestTechnicalOptimizations(region: GeoRegion): any[] {
    const optimizations: any[] = [];

    // 移动端优化
    if (
      region.digitalInfrastructure?.smartphonePenetration &&
      region.digitalInfrastructure.smartphonePenetration > 0.7
    ) {
      optimizations.push({
        area: '移动端优化',
        currentStatus: '待优化',
        recommendation: '实现响应式设计，优化移动端加载速度',
        priority: 'high' as PriorityLevel,
        expectedImpact: '提升移动端用户体验，增加移动流量',
      });
    }

    // 本地化优化
    optimizations.push({
      area: '本地化SEO',
      currentStatus: '基础',
      recommendation: `添加${region.name}地区页面，优化地区相关元标签`,
      priority: 'medium' as PriorityLevel,
      expectedImpact: `提升在${region.name}地区的搜索排名`,
    });

    // 页面速度优化
    optimizations.push({
      area: '页面性能',
      currentStatus: '待评估',
      recommendation: '压缩图片，减少HTTP请求，启用浏览器缓存',
      priority: 'medium' as PriorityLevel,
      expectedImpact: '提升页面加载速度，改善用户体验',
    });

    // 结构化数据
    optimizations.push({
      area: '结构化数据',
      currentStatus: '未实施',
      recommendation: '添加本地业务结构化数据，丰富搜索结果展示',
      priority: 'low' as PriorityLevel,
      expectedImpact: '增强搜索结果吸引力，提升点击率',
    });

    return optimizations;
  }

  /**
   * 辅助方法
   */
  private inferProductsServices(
    region: GeoRegion,
    request: GeoAnalysisRequestDto,
  ): string[] {
    const productsServices: string[] = [];

    // 基于行业推断
    if (request.industries) {
      request.industries.forEach((industry) => {
        if (industry.includes('科技')) {
          productsServices.push('软件开发', '技术支持', 'IT咨询');
        } else if (industry.includes('零售')) {
          productsServices.push('商品销售', '零售服务', '购物体验');
        } else if (industry.includes('服务')) {
          productsServices.push('专业服务', '咨询服务', '定制服务');
        } else {
          productsServices.push(`${industry}服务`, `${industry}解决方案`);
        }
      });
    }

    // 基于地区经济特征推断
    if (region.economicIndicators) {
      if (region.economicIndicators.tertiaryIndustry > 50) {
        productsServices.push('商业服务', '专业咨询', '金融服务');
      }
      if (region.economicIndicators.secondaryIndustry > 40) {
        productsServices.push('工业产品', '制造服务', '供应链服务');
      }
    }

    // 基于消费者行为推断
    if (region.consumerBehavior?.favoriteCategories) {
      productsServices.push(...region.consumerBehavior.favoriteCategories);
    }

    return [...new Set(productsServices)].slice(0, 8);
  }

  private identifyRegionalNeeds(region: GeoRegion): string[] {
    const needs: string[] = [];

    // 基于经济发展水平
    if (region.gdpPerCapita) {
      if (region.gdpPerCapita < 20000) {
        needs.push('性价比产品', '基础服务', '实用解决方案');
      } else if (region.gdpPerCapita < 50000) {
        needs.push('品质产品', '专业服务', '个性化解决方案');
      } else {
        needs.push('高端产品', '定制服务', '创新解决方案');
      }
    }

    // 基于数字化水平
    if (region.digitalInfrastructure?.internetPenetration) {
      if (region.digitalInfrastructure.internetPenetration < 0.5) {
        needs.push('线下服务', '实体体验', '传统渠道产品');
      } else if (region.digitalInfrastructure.internetPenetration < 0.8) {
        needs.push('线上线下结合', '数字化服务', '便捷解决方案');
      } else {
        needs.push('纯线上服务', '智能产品', '创新科技解决方案');
      }
    }

    // 基于文化特征
    if (region.culturalData?.customs) {
      if (
        region.culturalData.customs.some(
          (c) => c.includes('传统') || c.includes('保守'),
        )
      ) {
        needs.push('可靠产品', '稳定服务', '经过验证的解决方案');
      }
      if (
        region.culturalData.customs.some(
          (c) => c.includes('创新') || c.includes('开放'),
        )
      ) {
        needs.push('创新产品', '前沿服务', '突破性解决方案');
      }
    }

    return needs.length > 0 ? needs : ['优质产品', '可靠服务', '全面解决方案'];
  }

  private estimateSearchVolume(keyword: string, region: GeoRegion): number {
    // 简化估算：基于关键词长度、地区人口和数字化水平
    let volume = 100; // 基础搜索量

    // 关键词长度影响（长尾关键词搜索量较低）
    if (keyword.length > 10) volume *= 0.3;
    else if (keyword.length > 6) volume *= 0.6;

    // 地区人口影响
    if (region.population) {
      volume *= Math.min(region.population / 1000000, 10); // 每百万人口增加，最大10倍
    }

    // 数字化水平影响
    if (region.digitalInfrastructure?.internetPenetration) {
      volume *= region.digitalInfrastructure.internetPenetration * 1.5;
    }

    // 问题类关键词通常搜索量较低
    if (
      keyword.includes('如何') ||
      keyword.includes('怎么') ||
      keyword.includes('为什么')
    ) {
      volume *= 0.5;
    }

    return Math.round(volume);
  }

  private assessKeywordCompetition(
    keyword: string,
    region: GeoRegion,
  ): 'low' | 'medium' | 'high' {
    let competitionScore = 0;

    // 关键词长度（短词竞争激烈）
    if (keyword.length <= 4) competitionScore += 3;
    else if (keyword.length <= 6) competitionScore += 2;
    else if (keyword.length <= 8) competitionScore += 1;

    // 商业意图（商业词汇竞争激烈）
    const commercialTerms = [
      '公司',
      '服务',
      '价格',
      '购买',
      '销售',
      '代理',
      '加盟',
    ];
    if (commercialTerms.some((term) => keyword.includes(term))) {
      competitionScore += 2;
    }

    // 地区竞争程度
    if (region.competitionIntensity) {
      competitionScore += Math.round(region.competitionIntensity * 3);
    }

    if (competitionScore >= 4) return 'high';
    if (competitionScore >= 2) return 'medium';
    return 'low';
  }

  private calculateOpportunityScore(
    keyword: string,
    region: GeoRegion,
  ): number {
    const searchVolume = this.estimateSearchVolume(keyword, region);
    const competition = this.assessKeywordCompetition(keyword, region);

    let opportunity = searchVolume;

    // 竞争程度调整（竞争越低，机会越高）
    switch (competition) {
      case 'low':
        opportunity *= 1.5;
        break;
      case 'medium':
        opportunity *= 1.0;
        break;
      case 'high':
        opportunity *= 0.5;
        break;
    }

    // 商业价值调整（商业意图强的关键词价值更高）
    const commercialTerms = ['公司', '服务', '价格', '购买', '销售'];
    if (commercialTerms.some((term) => keyword.includes(term))) {
      opportunity *= 1.3;
    }

    // 长尾关键词通常转化率更高
    if (keyword.length > 8) {
      opportunity *= 1.2;
    }

    return Math.min(100, Math.round(opportunity / 10)); // 归一化到0-100
  }

  private suggestKeywordActions(keyword: string, region: GeoRegion): string[] {
    const actions: string[] = [];

    // 基础优化动作
    actions.push(`创建针对"${keyword}"的专题页面`);
    actions.push(`在现有页面中自然融入"${keyword}"`);

    // 内容创作建议
    if (keyword.includes('如何') || keyword.includes('怎么')) {
      actions.push(`创作"${keyword}"教程类文章`);
      actions.push(`制作"${keyword}"视频教程`);
    } else if (keyword.includes('为什么') || keyword.includes('原因')) {
      actions.push(`撰写"${keyword}"分析文章`);
      actions.push(`创建"${keyword}"常见问题解答`);
    } else {
      actions.push(`撰写"${keyword}"详细介绍`);
      actions.push(`创建"${keyword}"产品/服务页面`);
    }

    // 本地化优化
    actions.push(`添加${region.name}地区相关内容`);

    return actions.slice(0, 4);
  }

  private identifyCulturalElements(region: GeoRegion): string[] {
    const elements: string[] = [];

    if (region.culturalData) {
      if (region.culturalData.dominantLanguage) {
        elements.push(`使用${region.culturalData.dominantLanguage}`);
      }

      if (
        region.culturalData.dialects &&
        region.culturalData.dialects.length > 0
      ) {
        elements.push(`考虑${region.culturalData.dialects[0]}方言表达`);
      }

      if (
        region.culturalData.festivals &&
        region.culturalData.festivals.length > 0
      ) {
        elements.push(`融入${region.culturalData.festivals[0]}节庆元素`);
      }

      if (
        region.culturalData.customs &&
        region.culturalData.customs.length > 0
      ) {
        elements.push(`尊重${region.culturalData.customs[0]}等当地习俗`);
      }
    }

    // 默认元素
    if (elements.length === 0) {
      elements.push('使用当地常见表达方式');
      elements.push('考虑地方文化特色');
      elements.push('尊重当地传统价值观');
    }

    return elements;
  }

  private suggestLanguageAdaptations(region: GeoRegion): string[] {
    const adaptations: string[] = [];

    // 方言适配
    if (
      region.culturalData?.dialects &&
      region.culturalData.dialects.length > 0
    ) {
      adaptations.push(`提供${region.culturalData.dialects[0]}方言版本`);
      adaptations.push(`使用${region.culturalData.dialects[0]}特色词汇`);
    }

    // 表达习惯
    adaptations.push('采用当地人熟悉的表达方式');
    adaptations.push('避免可能引起误解的词汇');

    // 称呼和礼貌用语
    adaptations.push('使用当地常用的称呼方式');
    adaptations.push('遵循当地的礼貌用语习惯');

    return adaptations;
  }

  private suggestLocalReferences(region: GeoRegion): string[] {
    const references: string[] = [];

    // 地理地标
    references.push(`提及${region.name}的知名地标`);
    references.push(`关联${region.name}的特色景点`);

    // 当地企业/机构
    references.push(`引用${region.name}的知名企业`);
    references.push(`提及${region.name}的重要机构`);

    // 本地名人/专家
    references.push(`引用${region.name}的行业专家`);
    references.push(`提及${region.name}的成功案例`);

    // 本地事件
    references.push(`关联${region.name}的近期活动`);
    references.push(`提及${region.name}的发展规划`);

    return references;
  }

  private suggestSeasonalContent(region: GeoRegion): string[] {
    const seasonalContent: string[] = [];

    // 传统节日
    if (region.culturalData?.festivals) {
      region.culturalData.festivals.forEach((festival) => {
        seasonalContent.push(`${festival}特别促销`);
        seasonalContent.push(`${festival}主题内容`);
        seasonalContent.push(`${festival}文化解读`);
      });
    }

    // 季节变化
    seasonalContent.push('春季新品推广');
    seasonalContent.push('夏季清凉特辑');
    seasonalContent.push('秋季收获主题');
    seasonalContent.push('冬季温暖关怀');

    // 本地季节性活动
    seasonalContent.push(`${region.name}旅游旺季攻略`);
    seasonalContent.push(`${region.name}特色季节产品`);

    return seasonalContent.slice(0, 6);
  }

  private estimateEngagement(platform: string, region: GeoRegion): number {
    // 简化估算：基于平台特征和地区数字化水平
    let engagement = 50; // 基础参与度

    // 平台特征
    const platformEngagement: Record<string, number> = {
      微信: 70,
      微博: 60,
      抖音: 75,
      小红书: 65,
      知乎: 55,
      B站: 70,
    };

    if (platformEngagement[platform]) {
      engagement = platformEngagement[platform];
    }

    // 地区数字化水平调整
    if (region.digitalInfrastructure?.internetPenetration) {
      engagement *= region.digitalInfrastructure.internetPenetration;
    }

    // 年龄结构影响（年轻人口多则社交参与度高）
    const youngRatio = this.getYoungPopulationRatio(region);
    if (youngRatio > 0.6) {
      engagement *= 1.2;
    }

    return Math.min(100, Math.round(engagement));
  }

  private getYoungPopulationRatio(region: GeoRegion): number {
    if (!region.demographicData?.ageDistribution) return 0.5;

    const distribution = region.demographicData.ageDistribution;
    let youngRatio = 0;
    for (const [range, percentage] of Object.entries(distribution)) {
      if (
        range.includes('18') ||
        range.includes('25') ||
        range.includes('35')
      ) {
        youngRatio += Number(percentage);
      }
    }

    return youngRatio / 100;
  }

  private assessCostEffectiveness(
    platform: string,
    region: GeoRegion,
  ): 'low' | 'medium' | 'high' {
    // 简化评估
    const effectiveness: Record<string, 'low' | 'medium' | 'high'> = {
      微信: 'high',
      微博: 'medium',
      抖音: 'high',
      小红书: 'medium',
      知乎: 'low',
      B站: 'medium',
    };

    let result = effectiveness[platform] || 'medium';

    // 地区经济水平调整（经济发达地区成本通常更高）
    if (region.gdpPerCapita && region.gdpPerCapita > 50000) {
      if (result === 'high') result = 'medium';
      else if (result === 'medium') result = 'low';
    }

    return result;
  }

  private suggestChannelActions(platform: string, region: GeoRegion): string[] {
    const actions: string[] = [];

    // 通用动作
    actions.push(`创建${platform}官方账号`);
    actions.push(`定期发布${platform}内容`);

    // 平台特定动作
    switch (platform) {
      case '微信':
        actions.push('建立微信群与用户互动');
        actions.push('开发微信小程序提供服务');
        break;
      case '微博':
        actions.push('参与微博热点话题');
        actions.push('与微博大V合作推广');
        break;
      case '抖音':
        actions.push('制作抖音短视频内容');
        actions.push('开展抖音直播活动');
        break;
      case '小红书':
        actions.push('发布小红书种草笔记');
        actions.push('合作小红书达人推广');
        break;
      case '知乎':
        actions.push('回答知乎相关问题');
        actions.push('发布知乎专栏文章');
        break;
      case 'B站':
        actions.push('制作B站视频教程');
        actions.push('参与B站社区互动');
        break;
      default:
        actions.push(`优化${platform}内容策略`);
        actions.push(`监测${platform}效果数据`);
    }

    // 本地化动作
    actions.push(`发布${region.name}相关内容`);

    return actions.slice(0, 4);
  }

  private estimateEcommerceReach(platform: string, region: GeoRegion): number {
    // 简化估算
    let reach = 40; // 基础覆盖率

    // 平台普及度
    const platformReach: Record<string, number> = {
      淘宝: 80,
      天猫: 70,
      京东: 75,
      拼多多: 85,
      抖音电商: 60,
    };

    if (platformReach[platform]) {
      reach = platformReach[platform];
    }

    // 地区数字化水平调整
    if (region.digitalInfrastructure?.internetPenetration) {
      reach *= region.digitalInfrastructure.internetPenetration;
    }

    // 经济水平调整（经济发达地区电商使用率高）
    if (region.gdpPerCapita && region.gdpPerCapita > 30000) {
      reach *= 1.2;
    }

    return Math.min(100, Math.round(reach));
  }

  private deduplicateAndRankKeywords(keywordOpportunities: any[]): any[] {
    // 去重：基于关键词文本
    const uniqueMap = new Map<string, any>();
    keywordOpportunities.forEach((opp) => {
      if (!uniqueMap.has(opp.keyword)) {
        uniqueMap.set(opp.keyword, opp);
      } else {
        // 保留机会分数更高的
        const existing = uniqueMap.get(opp.keyword);
        if (opp.opportunityScore > existing.opportunityScore) {
          uniqueMap.set(opp.keyword, opp);
        }
      }
    });

    // 按机会分数排序
    return Array.from(uniqueMap.values())
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 20); // 最多20个最佳机会
  }

  private deduplicateAndRankChannels(channelRecommendations: any[]): any[] {
    // 去重：基于渠道名称
    const uniqueMap = new Map<string, any>();
    channelRecommendations.forEach((rec) => {
      if (!uniqueMap.has(rec.channel)) {
        uniqueMap.set(rec.channel, rec);
      } else {
        // 保留覆盖率更高的
        const existing = uniqueMap.get(rec.channel);
        if (rec.reach > existing.reach) {
          uniqueMap.set(rec.channel, rec);
        }
      }
    });

    // 按综合效果排序（覆盖率×参与度）
    return Array.from(uniqueMap.values())
      .map((rec) => ({
        ...rec,
        compositeScore: (rec.reach * rec.engagement) / 100,
      }))
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 10); // 最多10个最佳渠道
  }

  private prioritizeTechnicalOptimizations(
    technicalOptimizations: any[],
  ): any[] {
    // 去重：基于优化领域
    const uniqueMap = new Map<string, any>();
    technicalOptimizations.forEach((opt) => {
      if (!uniqueMap.has(opt.area)) {
        uniqueMap.set(opt.area, opt);
      } else {
        // 保留优先级更高的
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const existing = uniqueMap.get(opt.area);
        const existingPriority = priorityOrder[existing.priority] || 0;
        const newPriority = priorityOrder[opt.priority] || 0;
        if (newPriority > existingPriority) {
          uniqueMap.set(opt.area, opt);
        }
      }
    });

    // 按优先级排序
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return Array.from(uniqueMap.values())
      .sort((a, b) => {
        const priorityDiff =
          priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.expectedImpact.localeCompare(a.expectedImpact); // 按影响描述排序
      })
      .slice(0, 10); // 最多10个优化建议
  }
}
