import { Injectable, Logger } from '@nestjs/common';
import { GeoRegion } from '../entities/geo-region.entity';
import { GeoAnalysisRequestDto } from '../dto/geo-analysis-request.dto';

@Injectable()
export class CompetitiveAnalysisService {
  private readonly logger = new Logger(CompetitiveAnalysisService.name);

  /**
   * 分析竞争格局
   */
  async analyzeCompetition(
    regions: GeoRegion[],
    request: GeoAnalysisRequestDto,
  ): Promise<any> {
    this.logger.log(`Analyzing competition for ${regions.length} regions`);

    const competitiveAnalysis = {
      marketOverview: {
        size: 0,
        growth: 0,
        trends: [] as string[],
        drivers: [] as string[],
      },
      competitorAnalysis: {
        competitors: [] as any[],
        competitiveMatrix: {
          dimensions: [] as string[],
          positions: [] as any[],
        },
        marketShareDistribution: [] as any[],
      },
      competitivePositioning: {
        ourPosition: {
          differentiation: [] as string[],
          valueProposition: [] as string[],
          targetSegments: [] as string[],
          pricingStrategy: '',
          distributionChannels: [] as string[],
        },
        recommendedPosition: {
          differentiation: [] as string[],
          valueProposition: [] as string[],
          targetSegments: [] as string[],
          pricingStrategy: '',
          distributionChannels: [] as string[],
        },
        positioningStrategy: [] as string[],
      },
    };

    // 分析每个地区的竞争情况
    const allCompetitors = new Map<string, any>();
    let totalMarketSize = 0;
    let totalGrowth = 0;

    for (const region of regions) {
      // 市场概况
      const marketSize = this.calculateMarketSize(region);
      const marketGrowth = this.calculateMarketGrowth(region);
      totalMarketSize += marketSize;
      totalGrowth += marketGrowth;

      // 收集竞争对手
      if (region.competitors) {
        region.competitors.forEach((comp) => {
          const key = `${comp.companyName}-${region.id}`;
          if (!allCompetitors.has(key)) {
            allCompetitors.set(key, {
              ...comp,
              regions: [region.id],
              regionalMarketShare: comp.marketShare || 0,
            });
          } else {
            const existing = allCompetitors.get(key);
            existing.regions.push(region.id);
            existing.regionalMarketShare =
              (existing.regionalMarketShare + (comp.marketShare || 0)) / 2;
          }
        });
      }
    }

    // 市场概况
    competitiveAnalysis.marketOverview.size = totalMarketSize;
    competitiveAnalysis.marketOverview.growth =
      regions.length > 0 ? totalGrowth / regions.length : 0;
    competitiveAnalysis.marketOverview.trends = this.identifyMarketTrends(
      regions,
      request,
    );
    competitiveAnalysis.marketOverview.drivers = this.identifyMarketDrivers(
      regions,
      request,
    );

    // 竞争对手分析
    const competitors = Array.from(allCompetitors.values());
    competitiveAnalysis.competitorAnalysis.competitors =
      this.analyzeCompetitors(competitors, regions, request);
    competitiveAnalysis.competitorAnalysis.competitiveMatrix =
      this.buildCompetitiveMatrix(
        competitiveAnalysis.competitorAnalysis.competitors,
        request,
      );
    competitiveAnalysis.competitorAnalysis.marketShareDistribution =
      this.calculateMarketShareDistribution(
        competitiveAnalysis.competitorAnalysis.competitors,
      );

    // 竞争定位
    competitiveAnalysis.competitivePositioning.ourPosition =
      this.assessOurPosition(request);
    competitiveAnalysis.competitivePositioning.recommendedPosition =
      this.recommendPositioning(
        competitiveAnalysis.competitorAnalysis.competitors,
        request,
      );
    competitiveAnalysis.competitivePositioning.positioningStrategy =
      this.developPositioningStrategy(
        competitiveAnalysis.competitivePositioning.ourPosition,
        competitiveAnalysis.competitivePositioning.recommendedPosition,
      );

    return competitiveAnalysis;
  }

  /**
   * 计算市场规模
   */
  private calculateMarketSize(region: GeoRegion): number {
    // 简化计算：基于GDP和人口
    let size = 0;

    if (region.gdp) {
      size += region.gdp * 0.1; // 假设目标市场占GDP的10%
    }

    if (region.population) {
      size += region.population * 5000; // 假设人均消费5000元
    }

    // 如果没有数据，使用默认值
    if (size === 0) {
      size = region.area ? region.area * 1000000 : 100000000; // 每平方公里100万或1亿
    }

    return size;
  }

  /**
   * 计算市场增长率
   */
  private calculateMarketGrowth(region: GeoRegion): number {
    // 使用经济增速作为代理
    if (region.economicIndicators?.growthRate) {
      return region.economicIndicators.growthRate;
    }

    // 基于发展阶段估计
    if (region.gdpPerCapita) {
      if (region.gdpPerCapita < 10000) return 0.08; // 发展中地区增长快
      if (region.gdpPerCapita < 30000) return 0.05; // 新兴地区中等增长
      return 0.03; // 发达地区增长慢
    }

    return 0.05; // 默认5%
  }

  /**
   * 识别市场趋势
   */
  private identifyMarketTrends(
    regions: GeoRegion[],
    request: GeoAnalysisRequestDto,
  ): string[] {
    const trends = new Set<string>();

    // 分析各地区趋势
    for (const region of regions) {
      // 数字化趋势
      if (
        region.digitalInfrastructure?.internetPenetration &&
        region.digitalInfrastructure.internetPenetration > 0.7
      ) {
        trends.add('数字化加速');
        trends.add('线上消费增长');
      }

      // 消费升级趋势
      if (region.gdpPerCapita && region.gdpPerCapita > 30000) {
        trends.add('消费升级');
        trends.add('品质追求');
      }

      // 年轻化趋势
      if (this.getYoungPopulationRatio(region) > 0.6) {
        trends.add('年轻消费群体崛起');
        trends.add('个性化需求增加');
      }

      // 可持续发展趋势
      if (
        region.culturalData?.customs?.some(
          (c: string) => c.includes('环保') || c.includes('绿色'),
        )
      ) {
        trends.add('绿色消费意识增强');
      }
    }

    // 添加行业特定趋势
    if (request.industries) {
      request.industries.forEach((industry) => {
        if (industry.includes('科技') || industry.includes('数字')) {
          trends.add('技术创新驱动');
          trends.add('产品迭代加速');
        }
        if (industry.includes('零售') || industry.includes('消费')) {
          trends.add('全渠道零售');
          trends.add('体验式消费');
        }
        if (industry.includes('服务')) {
          trends.add('服务个性化');
          trends.add('体验至上');
        }
      });
    }

    return Array.from(trends).slice(0, 10); // 最多10个趋势
  }

  /**
   * 识别市场驱动因素
   */
  private identifyMarketDrivers(
    regions: GeoRegion[],
    request: GeoAnalysisRequestDto,
  ): string[] {
    const drivers = new Set<string>();

    // 经济驱动
    const hasHighGrowth = regions.some(
      (r) =>
        r.economicIndicators?.growthRate &&
        r.economicIndicators.growthRate > 0.07,
    );
    if (hasHighGrowth) {
      drivers.add('经济增长');
      drivers.add('收入水平提升');
    }

    // 人口驱动
    const totalPopulation = regions.reduce(
      (sum, r) => sum + (r.population || 0),
      0,
    );
    if (totalPopulation > 10000000) {
      // 超过1000万人口
      drivers.add('人口规模');
      drivers.add('市场基数大');
    }

    const youngPopulation = regions.some(
      (r) => this.getYoungPopulationRatio(r) > 0.65,
    );
    if (youngPopulation) {
      drivers.add('年轻人口');
      drivers.add('消费活力强');
    }

    // 技术驱动
    const highDigital = regions.some(
      (r) =>
        r.digitalInfrastructure?.internetPenetration &&
        r.digitalInfrastructure.internetPenetration > 0.8,
    );
    if (highDigital) {
      drivers.add('数字化普及');
      drivers.add('技术基础设施完善');
    }

    // 政策驱动（简化）
    drivers.add('消费政策支持');
    drivers.add('市场开放程度提高');

    // 社会文化驱动
    const culturalOpenness = regions.some((r) => {
      const openness = this.assessCulturalOpenness(r);
      return openness === 'high' || openness === 'medium';
    });
    if (culturalOpenness) {
      drivers.add('文化开放');
      drivers.add('新事物接受度高');
    }

    return Array.from(drivers).slice(0, 8); // 最多8个驱动因素
  }

  /**
   * 分析竞争对手
   */
  private analyzeCompetitors(
    competitors: any[],
    regions: GeoRegion[],
    request: GeoAnalysisRequestDto,
  ): any[] {
    return competitors.map((comp) => {
      const analysis = {
        name: comp.companyName,
        marketShare:
          comp.marketShare || this.estimateMarketShare(comp, regions),
        strengths: comp.strengths || this.inferStrengths(comp, regions),
        weaknesses: comp.weaknesses || this.inferWeaknesses(comp, regions),
        strategies: comp.strategies || this.inferStrategies(comp, regions),
        threatLevel:
          comp.threatLevel || this.assessThreatLevel(comp, regions, request),
        customerSatisfaction: this.estimateCustomerSatisfaction(comp, regions),
        digitalPresence: this.assessDigitalPresence(comp, regions),
        geographicCoverage: comp.regions || [],
        financialHealth: this.assessFinancialHealth(comp),
        innovationCapability: this.assessInnovationCapability(comp, regions),
        brandStrength: this.assessBrandStrength(comp, regions),
      };

      return analysis;
    });
  }

  /**
   * 构建竞争矩阵
   */
  private buildCompetitiveMatrix(
    competitors: any[],
    request: GeoAnalysisRequestDto,
  ): any {
    // 选择评估维度
    const dimensions = this.selectCompetitiveDimensions(request);

    const positions = competitors.map((comp) => ({
      competitor: comp.name,
      scores: dimensions.map((dim) =>
        this.scoreCompetitorOnDimension(comp, dim),
      ),
    }));

    // 添加我们的位置（假设）
    positions.push({
      competitor: '我们',
      scores: dimensions.map((dim) =>
        this.scoreOurPositionOnDimension(dim, competitors, request),
      ),
    });

    return {
      dimensions,
      positions,
    };
  }

  /**
   * 计算市场份额分布
   */
  private calculateMarketShareDistribution(competitors: any[]): any[] {
    const totalShare = competitors.reduce(
      (sum, comp) => sum + (comp.marketShare || 0),
      0,
    );

    return competitors
      .map((comp) => ({
        competitor: comp.name,
        share: comp.marketShare || 0,
        percentage:
          totalShare > 0 ? ((comp.marketShare || 0) / totalShare) * 100 : 0,
        trend: this.determineShareTrend(comp),
      }))
      .sort((a, b) => b.share - a.share)
      .slice(0, 10); // 最多显示前10个
  }

  /**
   * 评估我们的当前位置
   */
  private assessOurPosition(request: GeoAnalysisRequestDto): any {
    // 简化实现：基于请求参数假设
    return {
      differentiation: ['技术领先', '客户服务优质', '产品创新'],
      valueProposition: ['提供一站式解决方案', '高性价比', '快速响应市场变化'],
      targetSegments: request.industries?.map((ind) => `${ind}行业客户`) || [
        '中小企业',
        '成长型企业',
      ],
      pricingStrategy: '价值导向定价',
      distributionChannels: ['直销', '线上平台', '合作伙伴'],
    };
  }

  /**
   * 推荐定位
   */
  private recommendPositioning(
    competitors: any[],
    request: GeoAnalysisRequestDto,
  ): any {
    // 分析竞争空白点
    const gaps = this.identifyCompetitiveGaps(competitors, request);

    return {
      differentiation: gaps.differentiationOpportunities,
      valueProposition: gaps.valuePropositionOpportunities,
      targetSegments: this.identifyUnderservedSegments(competitors, request),
      pricingStrategy: this.recommendPricingStrategy(competitors, request),
      distributionChannels: this.recommendDistributionChannels(
        competitors,
        request,
      ),
    };
  }

  /**
   * 制定定位策略
   */
  private developPositioningStrategy(
    currentPosition: any,
    recommendedPosition: any,
  ): string[] {
    const strategies: string[] = [];

    // 差异化策略
    const newDifferentiations = recommendedPosition.differentiation.filter(
      (diff: string) => !currentPosition.differentiation.includes(diff),
    );
    if (newDifferentiations.length > 0) {
      strategies.push(`强化${newDifferentiations[0]}作为核心差异化优势`);
    }

    // 价值主张策略
    const newValueProps = recommendedPosition.valueProposition.filter(
      (vp: string) => !currentPosition.valueProposition.includes(vp),
    );
    if (newValueProps.length > 0) {
      strategies.push(`在营销沟通中突出${newValueProps[0]}`);
    }

    // 目标市场策略
    const newSegments = recommendedPosition.targetSegments.filter(
      (seg: string) => !currentPosition.targetSegments.includes(seg),
    );
    if (newSegments.length > 0) {
      strategies.push(`开拓${newSegments[0]}市场`);
    }

    // 定价策略
    if (
      recommendedPosition.pricingStrategy !== currentPosition.pricingStrategy
    ) {
      strategies.push(`采用${recommendedPosition.pricingStrategy}`);
    }

    // 渠道策略
    const newChannels = recommendedPosition.distributionChannels.filter(
      (ch: string) => !currentPosition.distributionChannels.includes(ch),
    );
    if (newChannels.length > 0) {
      strategies.push(`拓展${newChannels[0]}渠道`);
    }

    return strategies.length > 0 ? strategies : ['维持现有定位，优化执行效率'];
  }

  /**
   * 辅助方法
   */
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

  private assessCulturalOpenness(region: GeoRegion): 'high' | 'medium' | 'low' {
    // 简化评估
    const factors: string[] = [];

    if (
      region.culturalData?.dialects &&
      region.culturalData.dialects.length > 2
    ) {
      factors.push('language_diversity');
    }

    if (region.englishName) {
      factors.push('international_presence');
    }

    if (factors.length >= 2) return 'high';
    if (factors.length === 1) return 'medium';
    return 'low';
  }

  private estimateMarketShare(competitor: any, regions: GeoRegion[]): number {
    // 简化估计：基于竞争对手的地区覆盖和实力
    let baseShare = 5; // 基础份额5%

    if (competitor.strengths && competitor.strengths.length > 3) {
      baseShare += 5;
    }

    if (competitor.regions && competitor.regions.length > 1) {
      baseShare += competitor.regions.length * 2;
    }

    // 如果有市场份额数据但未指定，使用regionalMarketShare
    if (competitor.regionalMarketShare) {
      baseShare = competitor.regionalMarketShare;
    }

    return Math.min(30, baseShare); // 最大30%
  }

  private inferStrengths(competitor: any, regions: GeoRegion[]): string[] {
    const strengths: string[] = [];

    // 基于地区覆盖推断
    if (competitor.regions && competitor.regions.length > 3) {
      strengths.push('广泛的地域覆盖');
      strengths.push('规模化运营能力');
    }

    // 基于行业经验推断（如果有相关数据）
    if (competitor.industry) {
      strengths.push(`${competitor.industry}行业经验丰富`);
    }

    // 默认优势
    if (strengths.length === 0) {
      strengths.push('本地市场熟悉度高');
      strengths.push('客户关系稳固');
    }

    return strengths;
  }

  private inferWeaknesses(competitor: any, regions: GeoRegion[]): string[] {
    const weaknesses: string[] = [];

    // 基于覆盖范围推断
    if (competitor.regions && competitor.regions.length === 1) {
      weaknesses.push('市场覆盖有限');
      weaknesses.push('地域依赖性高');
    }

    // 基于竞争对手规模推断（简化）
    if (!competitor.strengths || competitor.strengths.length < 2) {
      weaknesses.push('资源相对有限');
      weaknesses.push('品牌知名度不足');
    }

    // 默认弱点
    if (weaknesses.length === 0) {
      weaknesses.push('技术创新能力待提升');
      weaknesses.push('数字化水平有限');
    }

    return weaknesses;
  }

  private inferStrategies(competitor: any, regions: GeoRegion[]): string[] {
    const strategies: string[] = [];

    // 基于优势推断
    if (
      competitor.strengths?.some(
        (s: string) => s.includes('成本') || s.includes('价格'),
      )
    ) {
      strategies.push('成本领先策略');
    }

    if (
      competitor.strengths?.some(
        (s: string) => s.includes('技术') || s.includes('创新'),
      )
    ) {
      strategies.push('差异化策略');
      strategies.push('技术创新驱动');
    }

    if (competitor.regions && competitor.regions.length > 1) {
      strategies.push('市场扩张策略');
    }

    // 默认策略
    if (strategies.length === 0) {
      strategies.push('客户关系深耕');
      strategies.push('服务差异化');
    }

    return strategies;
  }

  private assessThreatLevel(
    competitor: any,
    regions: GeoRegion[],
    request: GeoAnalysisRequestDto,
  ): 'low' | 'medium' | 'high' {
    let threatScore = 0;

    // 市场份额
    if (competitor.marketShare) {
      if (competitor.marketShare > 20) threatScore += 3;
      else if (competitor.marketShare > 10) threatScore += 2;
      else if (competitor.marketShare > 5) threatScore += 1;
    }

    // 地区覆盖
    if (competitor.regions) {
      const overlap = competitor.regions.filter((r: string) =>
        regions.some((region) => region.id === r),
      ).length;
      if (overlap > 0) threatScore += 2;
    }

    // 竞争优势
    if (competitor.strengths && competitor.strengths.length > 3) {
      threatScore += 2;
    }

    if (competitor.weaknesses && competitor.weaknesses.length > 3) {
      threatScore -= 1;
    }

    // 行业匹配度
    if (request.industries && competitor.industry) {
      const industryMatch = request.industries.some(
        (ind) =>
          competitor.industry.includes(ind) ||
          ind.includes(competitor.industry),
      );
      if (industryMatch) threatScore += 2;
    }

    if (threatScore >= 5) return 'high';
    if (threatScore >= 3) return 'medium';
    return 'low';
  }

  private estimateCustomerSatisfaction(
    competitor: any,
    regions: GeoRegion[],
  ): number {
    // 简化估计：基于优势和弱点
    let satisfaction = 70; // 基础70%

    if (competitor.strengths) {
      satisfaction += competitor.strengths.length * 2;
    }

    if (competitor.weaknesses) {
      satisfaction -= competitor.weaknesses.length * 3;
    }

    // 如果有服务相关优势
    if (
      competitor.strengths?.some(
        (s: string) => s.includes('服务') || s.includes('客户'),
      )
    ) {
      satisfaction += 10;
    }

    return Math.max(0, Math.min(100, satisfaction));
  }

  private assessDigitalPresence(competitor: any, regions: GeoRegion[]): number {
    // 简化评估：基于地区数字化水平和竞争对手特征
    let presence = 50;

    // 如果竞争对手在数字化程度高的地区
    const digitalRegions = regions.filter(
      (r) =>
        r.digitalInfrastructure?.internetPenetration &&
        r.digitalInfrastructure.internetPenetration > 0.7,
    );
    const competitorInDigital = digitalRegions.some((r) =>
      competitor.regions?.includes(r.id),
    );
    if (competitorInDigital) presence += 20;

    // 如果竞争对手有数字化相关优势
    if (
      competitor.strengths?.some(
        (s: string) =>
          s.includes('数字') ||
          s.includes('线上') ||
          s.includes('技术') ||
          s.includes('创新'),
      )
    ) {
      presence += 15;
    }

    // 如果竞争对手有数字化相关弱点
    if (
      competitor.weaknesses?.some(
        (w: string) =>
          w.includes('数字') || w.includes('线上') || w.includes('技术'),
      )
    ) {
      presence -= 10;
    }

    return Math.max(0, Math.min(100, presence));
  }

  private assessFinancialHealth(
    competitor: any,
  ): 'healthy' | 'stable' | 'risky' {
    // 简化评估
    const indicators: string[] = [];

    // 基于市场份额推断
    if (competitor.marketShare && competitor.marketShare > 15) {
      indicators.push('strong_market_position');
    }

    // 基于地区覆盖推断
    if (competitor.regions && competitor.regions.length > 3) {
      indicators.push('diversified_revenue');
    }

    // 基于弱点推断
    if (
      competitor.weaknesses?.some(
        (w: string) =>
          w.includes('财务') || w.includes('资金') || w.includes('成本'),
      )
    ) {
      indicators.push('financial_concerns');
    }

    if (indicators.includes('financial_concerns')) {
      return 'risky';
    } else if (
      indicators.includes('strong_market_position') &&
      indicators.includes('diversified_revenue')
    ) {
      return 'healthy';
    } else {
      return 'stable';
    }
  }

  private assessInnovationCapability(
    competitor: any,
    regions: GeoRegion[],
  ): 'high' | 'medium' | 'low' {
    // 简化评估
    const factors: string[] = [];

    if (
      competitor.strengths?.some(
        (s: string) =>
          s.includes('创新') || s.includes('研发') || s.includes('技术'),
      )
    ) {
      factors.push('innovation_strength');
    }

    if (
      competitor.strategies?.some(
        (s: string) => s.includes('创新') || s.includes('技术'),
      )
    ) {
      factors.push('innovation_strategy');
    }

    // 检查是否在创新友好的地区
    const innovativeRegions = regions.filter(
      (r) => this.assessInnovationAdoption(r) === 'early',
    );
    const competitorInInnovative = innovativeRegions.some((r) =>
      competitor.regions?.includes(r.id),
    );
    if (competitorInInnovative) {
      factors.push('innovative_environment');
    }

    if (factors.length >= 2) return 'high';
    if (factors.length === 1) return 'medium';
    return 'low';
  }

  private assessInnovationAdoption(
    region: GeoRegion,
  ): 'early' | 'mainstream' | 'lagging' {
    // 简化评估：基于数字化基础设施和经济发展水平
    const digitalScore =
      (region.digitalInfrastructure?.internetPenetration || 0) * 100;
    const economicScore = region.gdpPerCapita ? region.gdpPerCapita / 1000 : 0;

    const totalScore = digitalScore + economicScore;

    if (totalScore > 120) return 'early';
    if (totalScore > 80) return 'mainstream';
    return 'lagging';
  }

  private assessBrandStrength(
    competitor: any,
    regions: GeoRegion[],
  ): 'strong' | 'moderate' | 'weak' {
    // 简化评估
    const factors: string[] = [];

    if (competitor.marketShare && competitor.marketShare > 10) {
      factors.push('market_share');
    }

    if (competitor.regions && competitor.regions.length > 2) {
      factors.push('geographic_reach');
    }

    if (
      competitor.strengths?.some(
        (s: string) =>
          s.includes('品牌') || s.includes('知名') || s.includes('声誉'),
      )
    ) {
      factors.push('brand_strength');
    }

    if (factors.length >= 2) return 'strong';
    if (factors.length === 1) return 'moderate';
    return 'weak';
  }

  private selectCompetitiveDimensions(
    request: GeoAnalysisRequestDto,
  ): string[] {
    const defaultDimensions = [
      'price_competitiveness',
      'product_quality',
      'customer_service',
      'innovation',
      'brand_strength',
      'distribution_reach',
      'digital_capability',
    ];

    // 根据行业调整维度
    const industryDimensions: Record<string, string[]> = {
      科技: ['innovation', 'technical_support', 'product_features'],
      零售: ['price_competitiveness', 'store_experience', 'product_variety'],
      服务: ['customer_service', 'response_time', 'customization'],
    };

    let dimensions = [...defaultDimensions];

    if (request.industries) {
      request.industries.forEach((ind) => {
        if (industryDimensions[ind]) {
          dimensions = [...dimensions, ...industryDimensions[ind]];
        }
      });
    }

    // 去重并限制数量
    return [...new Set(dimensions)].slice(0, 8);
  }

  private scoreCompetitorOnDimension(
    competitor: any,
    dimension: string,
  ): number {
    // 简化评分：基于竞争对手特征
    let score = 50; // 基础分

    switch (dimension) {
      case 'price_competitiveness':
        if (
          competitor.strategies?.some(
            (s: string) => s.includes('成本') || s.includes('价格'),
          )
        ) {
          score += 20;
        }
        break;
      case 'product_quality':
        if (
          competitor.strengths?.some(
            (s: string) => s.includes('质量') || s.includes('品质'),
          )
        ) {
          score += 15;
        }
        break;
      case 'customer_service':
        if (
          competitor.strengths?.some(
            (s: string) => s.includes('服务') || s.includes('客户'),
          )
        ) {
          score += 20;
        }
        break;
      case 'innovation':
        if (this.assessInnovationCapability(competitor, []) === 'high') {
          score += 25;
        } else if (
          this.assessInnovationCapability(competitor, []) === 'medium'
        ) {
          score += 10;
        }
        break;
      case 'brand_strength':
        const brandStrength = this.assessBrandStrength(competitor, []);
        if (brandStrength === 'strong') score += 25;
        else if (brandStrength === 'moderate') score += 10;
        break;
      case 'distribution_reach':
        if (competitor.regions && competitor.regions.length > 3) {
          score += 20;
        }
        break;
      case 'digital_capability':
        const digitalPresence = this.assessDigitalPresence(competitor, []);
        score += (digitalPresence - 50) / 2;
        break;
      case 'technical_support':
        if (
          competitor.strengths?.some(
            (s: string) => s.includes('技术') || s.includes('支持'),
          )
        ) {
          score += 15;
        }
        break;
      case 'store_experience':
        // 零售特有维度
        score += 40; // 假设竞争对手在零售体验上有一定基础
        break;
      case 'response_time':
        if (
          competitor.strengths?.some(
            (s: string) => s.includes('快速') || s.includes('响应'),
          )
        ) {
          score += 20;
        }
        break;
      case 'customization':
        if (
          competitor.strengths?.some(
            (s: string) => s.includes('定制') || s.includes('个性化'),
          )
        ) {
          score += 15;
        }
        break;
    }

    return Math.max(0, Math.min(100, score));
  }

  private scoreOurPositionOnDimension(
    dimension: string,
    competitors: any[],
    request: GeoAnalysisRequestDto,
  ): number {
    // 简化评分：假设我们在某些维度有优势
    const ourScores: Record<string, number> = {
      price_competitiveness: 70,
      product_quality: 80,
      customer_service: 85,
      innovation: 75,
      brand_strength: 65,
      distribution_reach: 60,
      digital_capability: 80,
      technical_support: 75,
      store_experience: 70,
      response_time: 80,
      customization: 70,
    };

    return ourScores[dimension] || 65;
  }

  private determineShareTrend(
    competitor: any,
  ): 'increasing' | 'decreasing' | 'stable' {
    // 简化判断：基于增长相关指标
    const factors: string[] = [];

    if (this.assessInnovationCapability(competitor, []) === 'high') {
      factors.push('innovative');
    }

    if (this.assessDigitalPresence(competitor, []) > 70) {
      factors.push('digital_strong');
    }

    if (competitor.regions && competitor.regions.length > 3) {
      factors.push('expanding');
    }

    if (factors.length >= 2) return 'increasing';
    if (factors.length === 1) return 'stable';
    return 'decreasing'; // 默认假设保守
  }

  private identifyCompetitiveGaps(
    competitors: any[],
    request: GeoAnalysisRequestDto,
  ): any {
    const gaps = {
      differentiationOpportunities: [] as string[],
      valuePropositionOpportunities: [] as string[],
    };

    // 分析竞争对手的共性弱点
    const commonWeaknesses = this.findCommonWeaknesses(competitors);
    commonWeaknesses.forEach((weakness) => {
      if (
        weakness.includes('数字') ||
        weakness.includes('线上') ||
        weakness.includes('技术')
      ) {
        gaps.differentiationOpportunities.push('数字化领先');
        gaps.valuePropositionOpportunities.push('一站式数字解决方案');
      }
      if (weakness.includes('服务') || weakness.includes('响应')) {
        gaps.differentiationOpportunities.push('卓越客户服务');
        gaps.valuePropositionOpportunities.push('7x24小时快速响应');
      }
      if (weakness.includes('定制') || weakness.includes('个性化')) {
        gaps.differentiationOpportunities.push('高度定制化');
        gaps.valuePropositionOpportunities.push('个性化产品服务');
      }
    });

    // 分析市场趋势与竞争对手能力的差距
    if (
      request.industries?.some(
        (ind) => ind.includes('科技') || ind.includes('数字'),
      )
    ) {
      const techCompetitors = competitors.filter((comp) =>
        comp.strengths?.some(
          (s: string) => s.includes('技术') || s.includes('创新'),
        ),
      );
      if (techCompetitors.length < competitors.length * 0.3) {
        gaps.differentiationOpportunities.push('技术创新');
        gaps.valuePropositionOpportunities.push('前沿技术应用');
      }
    }

    // 如果没有找到明显机会，提供默认建议
    if (gaps.differentiationOpportunities.length === 0) {
      gaps.differentiationOpportunities.push('综合解决方案提供商');
      gaps.valuePropositionOpportunities.push('性价比最优选择');
    }

    return gaps;
  }

  private findCommonWeaknesses(competitors: any[]): string[] {
    const weaknessCount = new Map<string, number>();

    competitors.forEach((comp) => {
      if (comp.weaknesses) {
        comp.weaknesses.forEach((weakness: string) => {
          weaknessCount.set(weakness, (weaknessCount.get(weakness) || 0) + 1);
        });
      }
    });

    // 返回出现次数超过半数的弱点
    const threshold = competitors.length / 2;
    return Array.from(weaknessCount.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([weakness, _]) => weakness);
  }

  private identifyUnderservedSegments(
    competitors: any[],
    request: GeoAnalysisRequestDto,
  ): string[] {
    const segments = new Set<string>();

    // 基于行业和地区特征推断
    if (request.industries) {
      request.industries.forEach((industry) => {
        segments.add(`${industry}中小企业`);
        segments.add(`新兴${industry}企业`);
      });
    }

    // 基于竞争对手覆盖推断
    const competitorSegments = new Set<string>();
    competitors.forEach((comp) => {
      if (comp.targetSegments) {
        comp.targetSegments.forEach((seg: string) =>
          competitorSegments.add(seg),
        );
      }
    });

    // 寻找竞争对手较少覆盖的细分
    const potentialSegments = [
      '初创企业',
      '数字化转型中的传统企业',
      '跨境业务企业',
      '特定垂直行业',
      '偏远地区客户',
    ];

    potentialSegments.forEach((seg) => {
      if (!competitorSegments.has(seg)) {
        segments.add(seg);
      }
    });

    return Array.from(segments).slice(0, 5);
  }

  private recommendPricingStrategy(
    competitors: any[],
    request: GeoAnalysisRequestDto,
  ): string {
    // 分析竞争对手定价策略
    const pricingStrategies = new Map<string, number>();
    competitors.forEach((comp) => {
      if (comp.strategies) {
        comp.strategies.forEach((strategy: string) => {
          if (
            strategy.includes('价格') ||
            strategy.includes('成本') ||
            strategy.includes('定价')
          ) {
            if (strategy.includes('领先') || strategy.includes('低')) {
              pricingStrategies.set(
                'cost_leadership',
                (pricingStrategies.get('cost_leadership') || 0) + 1,
              );
            } else if (strategy.includes('差异') || strategy.includes('溢价')) {
              pricingStrategies.set(
                'premium',
                (pricingStrategies.get('premium') || 0) + 1,
              );
            } else if (strategy.includes('价值')) {
              pricingStrategies.set(
                'value_based',
                (pricingStrategies.get('value_based') || 0) + 1,
              );
            }
          }
        });
      }
    });

    // 选择竞争较少的定价策略
    const costLeadershipCount = pricingStrategies.get('cost_leadership') || 0;
    const premiumCount = pricingStrategies.get('premium') || 0;
    const valueBasedCount = pricingStrategies.get('value_based') || 0;

    if (
      costLeadershipCount <= premiumCount &&
      costLeadershipCount <= valueBasedCount
    ) {
      return '成本领先定价';
    } else if (
      premiumCount <= costLeadershipCount &&
      premiumCount <= valueBasedCount
    ) {
      return '溢价定价';
    } else {
      return '价值导向定价';
    }
  }

  private recommendDistributionChannels(
    competitors: any[],
    request: GeoAnalysisRequestDto,
  ): string[] {
    const channels = new Set<string>();

    // 分析竞争对手渠道
    const competitorChannels = new Map<string, number>();
    competitors.forEach((comp) => {
      if (comp.distributionChannels) {
        comp.distributionChannels.forEach((channel: string) => {
          competitorChannels.set(
            channel,
            (competitorChannels.get(channel) || 0) + 1,
          );
        });
      }
    });

    // 推荐竞争对手使用较少的渠道
    const allChannels = [
      '直销',
      '线上平台',
      '代理商',
      '经销商',
      '合作伙伴',
      '零售门店',
      '电子商务',
    ];

    allChannels.forEach((channel) => {
      const count = competitorChannels.get(channel) || 0;
      if (count < competitors.length * 0.3) {
        // 少于30%的竞争对手使用
        channels.add(channel);
      }
    });

    // 如果所有渠道都被广泛使用，推荐新兴渠道
    if (channels.size === 0) {
      channels.add('社交媒体直销');
      channels.add('直播电商');
      channels.add('订阅制服务');
    }

    return Array.from(channels).slice(0, 3);
  }
}
