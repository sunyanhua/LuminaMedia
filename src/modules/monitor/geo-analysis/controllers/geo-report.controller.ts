import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { GeoAnalysisService } from '../services/geo-analysis.service';

@ApiTags('GEO报告')
@Controller('geo-reports')
export class GeoReportController {
  constructor(private readonly geoAnalysisService: GeoAnalysisService) {}

  @Get(':analysisId/summary')
  @ApiOperation({ summary: '获取分析报告摘要', description: '生成地理分析报告的文本摘要' })
  @ApiParam({ name: 'analysisId', description: '分析记录ID' })
  @ApiResponse({ status: 200, description: '返回报告摘要' })
  async getReportSummary(@Param('analysisId') analysisId: string) {
    const result = await this.geoAnalysisService.getAnalysisResult(analysisId);

    // 生成报告摘要
    const summary = this.generateSummary(result);
    return {
      analysisId,
      generatedAt: new Date(),
      summary,
      keyFindings: result.keyFindings || [],
      recommendations: result.recommendations || [],
    };
  }

  @Get(':analysisId/export')
  @ApiOperation({ summary: '导出分析报告', description: '将地理分析报告导出为指定格式' })
  @ApiParam({ name: 'analysisId', description: '分析记录ID' })
  @ApiQuery({ name: 'format', required: false, description: '导出格式（json/pdf）', enum: ['json', 'pdf'] })
  @ApiResponse({ status: 200, description: '返回导出文件' })
  async exportReport(
    @Param('analysisId') analysisId: string,
    @Query('format') format: 'json' | 'pdf' = 'json',
    @Res() res: Response,
  ) {
    const result = await this.geoAnalysisService.getAnalysisResult(analysisId);

    if (format === 'pdf') {
      // 简化实现：返回JSON，实际应生成PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="geo-analysis-${analysisId}.pdf"`);
      // 实际应调用PDF生成服务
      res.send(JSON.stringify(result, null, 2));
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="geo-analysis-${analysisId}.json"`);
      res.send(JSON.stringify(result, null, 2));
    }
  }

  @Get('regional-insights')
  @ApiOperation({ summary: '获取区域洞察报告', description: '基于多个分析结果生成区域洞察报告' })
  @ApiQuery({ name: 'tenantId', required: true, description: '租户ID' })
  @ApiQuery({ name: 'timeRangeStart', required: false, description: '时间范围开始' })
  @ApiQuery({ name: 'timeRangeEnd', required: false, description: '时间范围结束' })
  async getRegionalInsights(
    @Query('tenantId') tenantId: string,
    @Query('timeRangeStart') timeRangeStart?: string,
    @Query('timeRangeEnd') timeRangeEnd?: string,
  ) {
    // 简化实现：返回模拟的区域洞察
    return {
      tenantId,
      timeRange: {
        start: timeRangeStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: timeRangeEnd || new Date().toISOString(),
      },
      regionalInsights: [
        {
          region: '华东地区',
          marketGrowth: 8.5,
          digitalAdoption: 78,
          competitiveIntensity: 65,
          keyOpportunities: ['电商直播', '社区团购', '本地生活服务'],
        },
        {
          region: '华南地区',
          marketGrowth: 9.2,
          digitalAdoption: 82,
          competitiveIntensity: 72,
          keyOpportunities: ['跨境电商', '智能制造', '数字娱乐'],
        },
        {
          region: '华北地区',
          marketGrowth: 7.8,
          digitalAdoption: 75,
          competitiveIntensity: 58,
          keyOpportunities: ['企业服务', '科技创新', '文化创意'],
        },
      ],
      recommendations: [
        '重点关注数字化程度高的地区，如华南和华东',
        '针对不同地区的消费特点制定差异化营销策略',
        '加强在竞争强度较低地区的市场渗透',
      ],
    };
  }

  private generateSummary(result: any): string {
    if (!result) {
      return '分析结果尚未生成或数据不完整。';
    }

    const { regionalAnalysis, competitiveAnalysis, seoSuggestions, overallScore } = result;

    let summary = `地理分析报告摘要（总体评分：${overallScore || 'N/A'}）\n\n`;

    if (regionalAnalysis) {
      summary += '📊 区域分析：\n';
      summary += `- 分析了${regionalAnalysis.demographicProfile?.data?.length || 0}个地区的人口、经济、文化和数字特征\n`;
      summary += `- 关键发现：${regionalAnalysis.demographicProfile?.keyInsights?.slice(0, 2).join('；') || '无'}\n\n`;
    }

    if (competitiveAnalysis) {
      summary += '🏆 竞争分析：\n';
      const competitorCount = competitiveAnalysis.competitorAnalysis?.competitors?.length || 0;
      summary += `- 识别了${competitorCount}个主要竞争对手\n`;
      summary += `- 市场概况：规模${competitiveAnalysis.marketOverview?.size ? Math.round(competitiveAnalysis.marketOverview.size / 100000000) : '未知'}亿元，增长率${competitiveAnalysis.marketOverview?.growth ? Math.round(competitiveAnalysis.marketOverview.growth * 100) : '未知'}%\n\n`;
    }

    if (seoSuggestions) {
      summary += '🔍 SEO优化建议：\n';
      const keywordCount = seoSuggestions.keywordOpportunities?.length || 0;
      summary += `- 发现了${keywordCount}个关键词机会\n`;
      summary += `- 提供了${seoSuggestions.contentLocalization?.culturalElements?.length || 0}个内容本地化建议\n\n`;
    }

    summary += '📈 实施建议：\n';
    summary += '- 优先实施高优先级的SEO优化建议\n';
    summary += '- 针对竞争较弱的地区加强市场推广\n';
    summary += '- 根据区域特征制定本地化营销策略\n';

    return summary;
  }
}