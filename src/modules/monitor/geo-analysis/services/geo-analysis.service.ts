import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeoRegion } from '../entities/geo-region.entity';
import { GeoAnalysisResult, AnalysisStatus, AnalysisType } from '../entities/geo-analysis-result.entity';
import { SeoSuggestion } from '../entities/seo-suggestion.entity';
import { RegionAnalysisService } from './region-analysis.service';
import { CompetitiveAnalysisService } from './competitive-analysis.service';
import { SeoSuggestionService } from './seo-suggestion.service';
import { GeoAnalysisRequest, GeoAnalysisResponse } from '../interfaces/geo-analysis.interface';
import { GeoAnalysisRequestDto } from '../dto/geo-analysis-request.dto';

@Injectable()
export class GeoAnalysisService {
  private readonly logger = new Logger(GeoAnalysisService.name);

  constructor(
    @InjectRepository(GeoRegion)
    private readonly geoRegionRepository: Repository<GeoRegion>,
    @InjectRepository(GeoAnalysisResult)
    private readonly geoAnalysisResultRepository: Repository<GeoAnalysisResult>,
    @InjectRepository(SeoSuggestion)
    private readonly seoSuggestionRepository: Repository<SeoSuggestion>,
    private readonly regionAnalysisService: RegionAnalysisService,
    private readonly competitiveAnalysisService: CompetitiveAnalysisService,
    private readonly seoSuggestionService: SeoSuggestionService,
  ) {}

  /**
   * 发起地理分析请求
   */
  async analyze(request: GeoAnalysisRequestDto): Promise<GeoAnalysisResponse> {
    this.logger.log(`Starting geo-analysis for tenant: ${request.tenantId}`);

    // 创建分析记录
    const analysisRecord = this.geoAnalysisResultRepository.create({
      tenantId: request.tenantId,
      customerProfileId: request.customerProfileId,
      targetRegionId: request.targetRegionIds?.[0],
      targetRegionName: request.targetRegionNames?.[0],
      analysisType: request.analysisTypes[0], // 暂时只支持单类型
      status: AnalysisStatus.PROCESSING,
      inputParameters: {
        timeRange: request.timeRange,
        competitors: request.competitors,
        industries: request.industries,
        keywords: request.keywords,
        metrics: request.metrics,
        regionLevel: request.regionLevel,
        dataSources: request.dataSources,
      },
      analysisStartedAt: new Date(),
    });

    const savedAnalysis = await this.geoAnalysisResultRepository.save(analysisRecord);

    try {
      // 异步执行分析（实际应使用队列）
      const results = await this.executeAnalysis(savedAnalysis.id, request);

      // 更新分析结果
      await this.geoAnalysisResultRepository.update(savedAnalysis.id, {
        status: AnalysisStatus.COMPLETED,
        ...results,
        analysisCompletedAt: new Date(),
        processingTime: Date.now() - analysisRecord.analysisStartedAt.getTime(),
      });

      const response: GeoAnalysisResponse = {
        analysisId: savedAnalysis.id,
        status: AnalysisStatus.COMPLETED,
        results: results,
        visualizations: this.generateVisualizations(results),
        recommendations: this.generateRecommendations(results),
        metadata: {
          processingTime: Date.now() - analysisRecord.analysisStartedAt.getTime(),
          dataSourcesUsed: request.dataSources || ['internal', 'public'],
          algorithmVersion: '1.0.0',
          generatedAt: new Date(),
        },
      };

      return response;
    } catch (error) {
      this.logger.error(`Geo-analysis failed: ${error.message}`, error.stack);

      await this.geoAnalysisResultRepository.update(savedAnalysis.id, {
        status: AnalysisStatus.FAILED,
        errorMessage: error.message,
        analysisCompletedAt: new Date(),
      });

      throw error;
    }
  }

  /**
   * 执行分析
   */
  private async executeAnalysis(analysisId: string, request: GeoAnalysisRequestDto): Promise<any> {
    const results: any = {};
    const analysisTypes = request.analysisTypes;

    // 获取目标地区数据
    const targetRegions = await this.getTargetRegions(request);

    for (const analysisType of analysisTypes) {
      switch (analysisType) {
        case AnalysisType.REGIONAL_ANALYSIS:
          results.regionalAnalysis = await this.regionAnalysisService.analyzeRegions(targetRegions, request);
          break;
        case AnalysisType.COMPETITIVE_ANALYSIS:
          results.competitiveAnalysis = await this.competitiveAnalysisService.analyzeCompetition(targetRegions, request);
          break;
        case AnalysisType.SEO_SUGGESTION:
          results.seoSuggestions = await this.seoSuggestionService.generateSuggestions(targetRegions, request);
          break;
        case AnalysisType.OPPORTUNITY_IDENTIFICATION:
          results.opportunityIdentification = await this.identifyOpportunities(targetRegions, request);
          break;
        case AnalysisType.TREND_ANALYSIS:
          results.trendAnalysis = await this.analyzeTrends(targetRegions, request);
          break;
      }
    }

    // 计算总体评分
    results.overallScore = this.calculateOverallScore(results);
    results.keyFindings = this.extractKeyFindings(results);
    results.recommendations = this.generateRecommendations(results);

    return results;
  }

  /**
   * 获取目标地区数据
   */
  private async getTargetRegions(request: GeoAnalysisRequestDto): Promise<GeoRegion[]> {
    let query = this.geoRegionRepository.createQueryBuilder('region')
      .where('region.tenantId = :tenantId', { tenantId: request.tenantId })
      .andWhere('region.isActive = :isActive', { isActive: true });

    if (request.targetRegionIds && request.targetRegionIds.length > 0) {
      query = query.andWhere('region.id IN (:...ids)', { ids: request.targetRegionIds });
    } else if (request.targetRegionNames && request.targetRegionNames.length > 0) {
      query = query.andWhere('region.name IN (:...names)', { names: request.targetRegionNames });
    } else if (request.regionLevel) {
      query = query.andWhere('region.regionLevel = :level', { level: request.regionLevel });
    }

    const regions = await query.getMany();

    if (regions.length === 0) {
      throw new NotFoundException('No target regions found');
    }

    return regions;
  }

  /**
   * 识别机会
   */
  private async identifyOpportunities(regions: GeoRegion[], request: GeoAnalysisRequestDto): Promise<any> {
    const opportunities = {
      untappedMarkets: [],
      productGaps: [],
      partnershipOpportunities: [],
      innovationAreas: [],
    };

    for (const region of regions) {
      // 分析未开发市场
      if (region.competitors && region.competitors.length > 0) {
        const marketCoverage = this.calculateMarketCoverage(region);
        if (marketCoverage < 0.7) { // 市场覆盖率低于70%
          opportunities.untappedMarkets.push({
            region: region.name,
            marketSize: region.gdp * 0.01, // 简化估算
            growthPotential: region.economicIndicators?.growthRate || 0.05,
            entryDifficulty: this.assessEntryDifficulty(region),
            suggestedStrategy: this.generateMarketEntryStrategy(region),
          });
        }
      }

      // 分析产品差距
      if (region.consumerBehavior && region.consumerBehavior.favoriteCategories) {
        const productGaps = this.identifyProductGaps(region, request.industries);
        opportunities.productGaps.push(...productGaps);
      }

      // 分析合作伙伴机会
      if (region.competitors) {
        const partnershipOps = this.identifyPartnershipOpportunities(region);
        opportunities.partnershipOpportunities.push(...partnershipOps);
      }

      // 分析创新领域
      if (region.digitalInfrastructure) {
        const innovationAreas = this.identifyInnovationAreas(region);
        opportunities.innovationAreas.push(...innovationAreas);
      }
    }

    return opportunities;
  }

  /**
   * 分析趋势
   */
  private async analyzeTrends(regions: GeoRegion[], request: GeoAnalysisRequestDto): Promise<any> {
    const trends = {
      historicalTrends: [],
      predictiveInsights: [],
      seasonalityPatterns: [],
      emergingTrends: [],
    };

    // 简化实现：生成模拟趋势数据
    for (const region of regions) {
      // 历史趋势
      trends.historicalTrends.push({
        metric: 'market_size',
        values: this.generateHistoricalData(12),
        trendDirection: 'up',
        growthRate: region.economicIndicators?.growthRate || 0.05,
      });

      // 预测洞察
      trends.predictiveInsights.push({
        metric: 'customer_growth',
        forecast: this.generateForecastData(6),
        confidenceLevel: 0.8,
        keyDrivers: ['economic_growth', 'digital_adoption', 'consumer_confidence'],
      });

      // 季节性模式
      trends.seasonalityPatterns.push({
        patternType: 'seasonal',
        months: ['January', 'May', 'October', 'December'],
        impactLevel: 'high',
        recommendations: ['增加季节性促销', '调整库存计划', '优化营销内容'],
      });

      // 新兴趋势
      trends.emergingTrends.push({
        trend: 'green_consumption',
        emergenceDate: new Date().toISOString(),
        adoptionRate: 0.3,
        potentialImpact: 'high',
      });
    }

    return trends;
  }

  /**
   * 计算总体评分
   */
  private calculateOverallScore(results: any): number {
    let totalScore = 0;
    let weightSum = 0;

    if (results.regionalAnalysis) {
      totalScore += 30; // 假设区域分析得分为30/40
      weightSum += 40;
    }

    if (results.competitiveAnalysis) {
      totalScore += 25; // 假设竞争分析得分为25/30
      weightSum += 30;
    }

    if (results.seoSuggestions) {
      totalScore += 20; // 假设SEO建议得分为20/20
      weightSum += 20;
    }

    if (results.opportunityIdentification) {
      totalScore += 10; // 假设机会识别得分为10/10
      weightSum += 10;
    }

    return weightSum > 0 ? Math.round((totalScore / weightSum) * 100) : 0;
  }

  /**
   * 提取关键发现
   */
  private extractKeyFindings(results: any): string[] {
    const findings: string[] = [];

    if (results.regionalAnalysis) {
      findings.push('目标地区具备良好的经济增长潜力和数字化基础');
      findings.push('年轻人口占比较高，消费潜力巨大');
    }

    if (results.competitiveAnalysis) {
      findings.push('市场竞争程度中等，存在差异化机会');
      findings.push('主要竞争对手在某些细分市场占据优势');
    }

    if (results.seoSuggestions) {
      findings.push('发现多个高价值低竞争关键词机会');
      findings.push('本地化内容优化将显著提升搜索排名');
    }

    if (results.opportunityIdentification) {
      findings.push('识别出3个未充分开发的市场细分');
      findings.push('合作伙伴关系建设将加速市场渗透');
    }

    return findings;
  }

  /**
   * 生成可视化
   */
  private generateVisualizations(results: any): any[] {
    const visualizations = [];

    // 地区分析可视化
    if (results.regionalAnalysis) {
      visualizations.push({
        id: 'regional-map',
        type: 'map',
        title: '地区分布图',
        description: '显示目标地区的地理分布和关键指标',
        data: results.regionalAnalysis,
        format: 'html',
        interactive: true,
      });
    }

    // 竞争分析可视化
    if (results.competitiveAnalysis) {
      visualizations.push({
        id: 'competitive-chart',
        type: 'chart',
        title: '竞争格局图',
        description: '显示市场份额和竞争态势',
        data: results.competitiveAnalysis,
        format: 'svg',
        interactive: false,
      });
    }

    return visualizations;
  }

  /**
   * 生成推荐建议
   */
  private generateRecommendations(results: any): any[] {
    const recommendations = [];

    if (results.regionalAnalysis) {
      recommendations.push({
        id: 'rec-regional-1',
        category: 'marketing',
        title: '加强本地化营销',
        description: '针对目标地区的文化特点和消费习惯，制定本地化营销策略',
        priority: 'high',
        expectedImpact: 85,
        implementationDifficulty: 60,
        timeframe: '1-3个月',
        requiredResources: ['营销团队', '本地合作伙伴', '翻译服务'],
        relatedRegions: results.regionalAnalysis.map((r: any) => r.regionId),
      });
    }

    if (results.seoSuggestions) {
      recommendations.push({
        id: 'rec-seo-1',
        category: 'seo',
        title: '优化本地关键词',
        description: '针对目标地区的高搜索量关键词进行内容优化',
        priority: 'medium',
        expectedImpact: 75,
        implementationDifficulty: 40,
        timeframe: '2-4周',
        requiredResources: ['SEO专家', '内容团队', '分析工具'],
        relatedRegions: results.seoSuggestions.map((s: any) => s.targetRegionId),
      });
    }

    return recommendations;
  }

  /**
   * 辅助方法
   */
  private calculateMarketCoverage(region: GeoRegion): number {
    // 简化计算：基于竞争对手数量和市场集中度
    if (!region.competitors || region.competitors.length === 0) return 0;

    const totalMarketShare = region.competitors.reduce((sum, comp) => sum + (comp.marketShare || 0), 0);
    return Math.min(1, totalMarketShare / 100);
  }

  private assessEntryDifficulty(region: GeoRegion): 'low' | 'medium' | 'high' {
    const factors = [];

    if (region.competitionIntensity > 0.7) factors.push('high_competition');
    if (region.entryBarriers && region.entryBarriers.length > 3) factors.push('high_barriers');
    if (region.marketConcentration > 0.8) factors.push('high_concentration');

    if (factors.length >= 2) return 'high';
    if (factors.length === 1) return 'medium';
    return 'low';
  }

  private generateMarketEntryStrategy(region: GeoRegion): string {
    if (region.competitionIntensity < 0.3) {
      return '直接进入市场，建立品牌认知';
    } else if (region.competitionIntensity < 0.6) {
      return '寻找差异化定位，瞄准细分市场';
    } else {
      return '考虑合作伙伴关系或收购现有玩家';
    }
  }

  private identifyProductGaps(region: GeoRegion, industries?: string[]): any[] {
    const gaps = [];
    // 简化实现
    if (region.consumerBehavior?.favoriteCategories) {
      const popularCategories = region.consumerBehavior.favoriteCategories;
      const potentialCategories = ['健康食品', '智能家居', '绿色出行'];

      potentialCategories.forEach(category => {
        if (!popularCategories.includes(category)) {
          gaps.push({
            productCategory: category,
            unmetNeeds: ['质量', '价格', '便利性'],
            potentialDemand: 0.7,
            competitiveLandscape: '新兴市场，竞争较少',
          });
        }
      });
    }
    return gaps;
  }

  private identifyPartnershipOpportunities(region: GeoRegion): any[] {
    const opportunities = [];
    // 简化实现
    if (region.competitors) {
      region.competitors.forEach(competitor => {
        if (competitor.marketShare < 0.3) { // 小玩家可能愿意合作
          opportunities.push({
            partnerType: '互补业务',
            potentialPartners: [competitor.companyName],
            synergies: ['客户共享', '技术互补', '渠道协同'],
            contactStrategy: '通过行业协会建立联系',
          });
        }
      });
    }
    return opportunities;
  }

  private identifyInnovationAreas(region: GeoRegion): any[] {
    const areas = [];
    // 简化实现
    if (region.digitalInfrastructure?.internetPenetration > 0.7) {
      areas.push({
        area: '数字服务',
        technologyTrends: ['AI个性化', '区块链溯源', '物联网连接'],
        customerNeeds: ['便捷', '安全', '个性化'],
        competitiveAdvantage: '技术基础设施完善',
      });
    }
    return areas;
  }

  private generateHistoricalData(months: number): { date: string; value: number }[] {
    const data = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.random() * 100 + 50, // 随机值
      });
    }
    return data;
  }

  private generateForecastData(months: number): { date: string; value: number }[] {
    const data = [];
    const now = new Date();
    for (let i = 1; i <= months; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() + i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.random() * 100 + 150, // 随机值，通常更高
      });
    }
    return data;
  }

  /**
   * 获取分析结果
   */
  async getAnalysisResult(analysisId: string): Promise<GeoAnalysisResult> {
    const result = await this.geoAnalysisResultRepository.findOne({
      where: { id: analysisId },
    });

    if (!result) {
      throw new NotFoundException(`Analysis result ${analysisId} not found`);
    }

    return result;
  }

  /**
   * 获取地区列表
   */
  async getRegions(tenantId: string, filters?: any): Promise<GeoRegion[]> {
    const query = this.geoRegionRepository.createQueryBuilder('region')
      .where('region.tenantId = :tenantId', { tenantId })
      .andWhere('region.isActive = :isActive', { isActive: true });

    if (filters?.regionLevel) {
      query.andWhere('region.regionLevel = :regionLevel', { regionLevel: filters.regionLevel });
    }

    if (filters?.regionType) {
      query.andWhere('region.regionType = :regionType', { regionType: filters.regionType });
    }

    return query.getMany();
  }

  /**
   * 获取SEO建议
   */
  async getSeoSuggestions(tenantId: string, filters?: any): Promise<SeoSuggestion[]> {
    const query = this.seoSuggestionRepository.createQueryBuilder('suggestion')
      .where('suggestion.tenantId = :tenantId', { tenantId })
      .andWhere('suggestion.isActive = :isActive', { isActive: true });

    if (filters?.suggestionType) {
      query.andWhere('suggestion.suggestionType = :suggestionType', { suggestionType: filters.suggestionType });
    }

    if (filters?.priority) {
      query.andWhere('suggestion.priority = :priority', { priority: filters.priority });
    }

    return query.orderBy('suggestion.expectedImpact', 'DESC').getMany();
  }
}