import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CustomerAnalyticsService } from '../services/customer-analytics.service';
import { CustomerSegment } from '../../../entities/customer-segment.entity';
import { SegmentationRequestDto } from '../dto/segmentation-request.dto';

@ApiTags('customer-data')
@Controller('api/v1/customer-data')
export class CustomerAnalyticsController {
  constructor(
    private readonly customerAnalyticsService: CustomerAnalyticsService,
  ) {}

  /**
   * 获取客户画像分析报告
   * 符合任务要求：GET /api/v1/customer-data/profiles/{id}/analysis
   */
  @Get('profiles/:profileId/analysis')
  @ApiOperation({
    summary: '获取客户画像分析报告',
    description:
      '获取指定客户档案的完整分析报告，包括人口统计、行为分析、消费分析和关键洞察',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        profileId: { type: 'string' },
        profileName: { type: 'string' },
        industry: { type: 'string' },
        analysisTimestamp: { type: 'string', format: 'date-time' },
        dataSummary: {
          type: 'object',
          properties: {
            totalImportJobs: { type: 'number' },
            completedImports: { type: 'number' },
            totalRecords: { type: 'number' },
            dataFreshness: { type: 'string' },
            dataCompleteness: { type: 'number' },
          },
        },
        demographicAnalysis: { type: 'object' },
        behavioralAnalysis: { type: 'object' },
        consumptionAnalysis: { type: 'object' },
        segmentationAnalysis: { type: 'object' },
        keyInsights: { type: 'array', items: { type: 'string' } },
        recommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              priority: { type: 'string', enum: ['high', 'medium', 'low'] },
              category: { type: 'string' },
              recommendation: { type: 'string' },
              expectedImpact: { type: 'string' },
              timeframe: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: '客户档案不存在' })
  async generateCustomerProfileAnalysis(
    @Param('profileId') profileId: string,
  ): Promise<Record<string, any>> {
    return await this.customerAnalyticsService.generateCustomerProfileAnalysis(
      profileId,
    );
  }

  /**
   * 获取客户分群列表
   * 符合任务要求：GET /api/v1/customer-data/profiles/{id}/segments
   */
  @Get('profiles/:profileId/segments')
  @ApiOperation({
    summary: '获取客户分群列表',
    description: '获取指定客户档案的所有客户分群列表',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [CustomerSegment],
  })
  @ApiResponse({ status: 404, description: '客户档案不存在' })
  async getCustomerSegments(
    @Param('profileId') profileId: string,
  ): Promise<CustomerSegment[]> {
    return await this.customerAnalyticsService.getCustomerSegments(profileId);
  }

  /**
   * 执行客户分群
   */
  @Post('profiles/:profileId/segments')
  @ApiOperation({
    summary: '执行客户分群',
    description: '根据规则对客户数据进行分群，生成客户分群结果',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiBody({ type: SegmentationRequestDto })
  @ApiResponse({
    status: 201,
    description: '分群执行成功',
    type: [CustomerSegment],
  })
  @ApiResponse({ status: 404, description: '客户档案不存在' })
  async performCustomerSegmentation(
    @Param('profileId') profileId: string,
    @Body() segmentationRequest: SegmentationRequestDto,
  ): Promise<CustomerSegment[]> {
    return await this.customerAnalyticsService.performCustomerSegmentation(
      profileId,
      segmentationRequest.segmentationRules,
    );
  }

  /**
   * 获取客户分析仪表板数据
   */
  @Get('profiles/:profileId/dashboard')
  @ApiOperation({
    summary: '获取客户分析仪表板数据',
    description: '获取客户档案的仪表板数据，用于前端可视化展示',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        overview: {
          type: 'object',
          properties: {
            profileName: { type: 'string' },
            industry: { type: 'string' },
            customerType: { type: 'string' },
            dataSources: { type: 'number' },
          },
        },
        metrics: {
          type: 'object',
          properties: {
            totalRecords: { type: 'number' },
            totalSegments: { type: 'number' },
            totalMembers: { type: 'number' },
            dataCompleteness: { type: 'number' },
            segmentationCoverage: { type: 'number' },
          },
        },
        recentActivity: {
          type: 'object',
          properties: {
            lastImport: { type: 'string', format: 'date-time' },
            lastAnalysis: { type: 'string', format: 'date-time' },
            segmentUpdate: { type: 'string', format: 'date-time' },
          },
        },
        quickInsights: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 404, description: '客户档案不存在' })
  async getDashboardData(
    @Param('profileId') profileId: string,
  ): Promise<Record<string, any>> {
    return await this.customerAnalyticsService.getDashboardData(profileId);
  }

  /**
   * 重新生成分析报告
   */
  @Post('profiles/:profileId/analysis/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '重新生成分析报告',
    description: '基于最新数据重新生成客户画像分析报告',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '报告重新生成成功',
    schema: {
      type: 'object',
      properties: {
        profileId: { type: 'string' },
        profileName: { type: 'string' },
        industry: { type: 'string' },
        analysisTimestamp: { type: 'string', format: 'date-time' },
        dataSummary: { type: 'object' },
        demographicAnalysis: { type: 'object' },
        behavioralAnalysis: { type: 'object' },
        consumptionAnalysis: { type: 'object' },
        segmentationAnalysis: { type: 'object' },
        keyInsights: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiResponse({ status: 404, description: '客户档案不存在' })
  async refreshAnalysis(
    @Param('profileId') profileId: string,
  ): Promise<Record<string, any>> {
    // 目前与generateCustomerProfileAnalysis功能相同
    // 未来可以添加缓存失效逻辑或增量更新
    return await this.customerAnalyticsService.generateCustomerProfileAnalysis(
      profileId,
    );
  }

  /**
   * 获取客户分群分析详情
   */
  @Get('profiles/:profileId/segments/:segmentId')
  @ApiOperation({
    summary: '获取客户分群详情',
    description: '获取指定客户分群的详细信息',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiParam({ name: 'segmentId', description: '客户分群ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: CustomerSegment,
  })
  @ApiResponse({ status: 404, description: '客户分群不存在' })
  async getSegmentDetail(
    @Param('profileId') profileId: string,
    @Param('segmentId') segmentId: string,
  ): Promise<CustomerSegment> {
    return await this.customerAnalyticsService.getSegmentDetail(
      profileId,
      segmentId,
    );
  }

  /**
   * 更新客户分群
   */
  @Post('profiles/:profileId/segments/:segmentId')
  @ApiOperation({
    summary: '更新客户分群',
    description: '更新指定客户分群的信息',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiParam({ name: 'segmentId', description: '客户分群ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        segmentName: { type: 'string' },
        criteria: { type: 'object' },
        memberCount: { type: 'number' },
        description: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: CustomerSegment,
  })
  @ApiResponse({ status: 404, description: '客户分群不存在' })
  async updateSegment(
    @Param('profileId') profileId: string,
    @Param('segmentId') segmentId: string,
    @Body() updates: Partial<CustomerSegment>,
  ): Promise<CustomerSegment> {
    return await this.customerAnalyticsService.updateSegment(
      profileId,
      segmentId,
      updates,
    );
  }

  /**
   * 删除客户分群
   */
  @Post('profiles/:profileId/segments/:segmentId/delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '删除客户分群',
    description: '删除指定的客户分群',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiParam({ name: 'segmentId', description: '客户分群ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '客户分群不存在' })
  async deleteSegment(
    @Param('profileId') profileId: string,
    @Param('segmentId') segmentId: string,
  ): Promise<void> {
    await this.customerAnalyticsService.deleteSegment(profileId, segmentId);
  }

  /**
   * 导出分析报告（JSON格式）
   */
  @Get('profiles/:profileId/analysis/export')
  @ApiOperation({
    summary: '导出分析报告',
    description: '导出客户画像分析报告为JSON格式',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '导出成功',
    schema: {
      type: 'object',
      properties: {
        report: { type: 'object' },
        exportTimestamp: { type: 'string', format: 'date-time' },
        format: { type: 'string', enum: ['json'] },
        version: { type: 'string' },
      },
    },
  })
  async exportAnalysisReport(
    @Param('profileId') profileId: string,
  ): Promise<Record<string, any>> {
    const analysis =
      await this.customerAnalyticsService.generateCustomerProfileAnalysis(
        profileId,
      );

    return {
      report: analysis,
      exportTimestamp: new Date().toISOString(),
      format: 'json',
      version: '1.0',
    };
  }

  /**
   * 获取雷达图数据（客户画像多维分析）
   */
  @Get('profiles/:profileId/charts/radar')
  @ApiOperation({
    summary: '获取雷达图数据',
    description: '获取客户画像多维分析的雷达图数据',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        indicator: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              max: { type: 'number' },
            },
          },
        },
        seriesData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'array', items: { type: 'number' } },
              name: { type: 'string' },
            },
          },
        },
        industryBenchmark: { type: 'object' },
      },
    },
  })
  async getRadarChartData(
    @Param('profileId') profileId: string,
  ): Promise<Record<string, any>> {
    return await this.customerAnalyticsService.getRadarChartData(profileId);
  }

  /**
   * 获取散点图数据（消费频率 vs 消费金额）
   */
  @Get('profiles/:profileId/charts/scatter')
  @ApiOperation({
    summary: '获取散点图数据',
    description: '获取消费频率与消费金额关系的散点图数据',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        dataPoints: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              visitFrequency: { type: 'number' },
              spendingPerVisit: { type: 'number' },
              totalSpending: { type: 'number' },
              customerSegment: { type: 'string' },
              customerId: { type: 'string' },
            },
          },
        },
        segments: { type: 'object' },
        correlation: { type: 'number' },
        insights: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getScatterChartData(
    @Param('profileId') profileId: string,
  ): Promise<Record<string, any>> {
    return await this.customerAnalyticsService.getScatterChartData(profileId);
  }

  /**
   * 获取热力图数据（时间-行为热度分布）
   */
  @Get('profiles/:profileId/charts/heatmap')
  @ApiOperation({
    summary: '获取热力图数据',
    description: '获取时间与行为热度分布的热力图数据',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        xAxis: { type: 'array', items: { type: 'string' } },
        yAxis: { type: 'array', items: { type: 'string' } },
        data: {
          type: 'array',
          items: { type: 'array', items: { type: 'number' } },
        },
        peakPeriods: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              day: { type: 'string' },
              hour: { type: 'string' },
              value: { type: 'number' },
            },
          },
        },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getHeatmapChartData(
    @Param('profileId') profileId: string,
  ): Promise<Record<string, any>> {
    return await this.customerAnalyticsService.getHeatmapChartData(profileId);
  }

  /**
   * 获取漏斗图数据（客户转化路径）
   */
  @Get('profiles/:profileId/charts/funnel')
  @ApiOperation({
    summary: '获取漏斗图数据',
    description: '获取客户转化路径的漏斗图数据',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        funnelStages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              value: { type: 'number' },
              description: { type: 'string' },
            },
          },
        },
        conversionRates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              from: { type: 'string' },
              to: { type: 'string' },
              rate: { type: 'number' },
            },
          },
        },
        totalConversionRate: { type: 'number' },
        bottlenecks: { type: 'array', items: { type: 'string' } },
        optimizationSuggestions: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getFunnelChartData(
    @Param('profileId') profileId: string,
  ): Promise<Record<string, any>> {
    return await this.customerAnalyticsService.getFunnelChartData(profileId);
  }

  /**
   * 获取桑基图数据（客户分群流转）
   */
  @Get('profiles/:profileId/charts/sankey')
  @ApiOperation({
    summary: '获取桑基图数据',
    description: '获取客户分群流转关系的桑基图数据',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              source: { type: 'string' },
              target: { type: 'string' },
              value: { type: 'number' },
            },
          },
        },
        totalFlowIn: { type: 'number' },
        totalFlowOut: { type: 'number' },
        netGrowth: { type: 'number' },
        retentionInsights: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getSankeyChartData(
    @Param('profileId') profileId: string,
  ): Promise<Record<string, any>> {
    return await this.customerAnalyticsService.getSankeyChartData(profileId);
  }

  /**
   * 获取所有图表数据
   */
  @Get('profiles/:profileId/charts/all')
  @ApiOperation({
    summary: '获取所有图表数据',
    description: '一次性获取所有类型的图表数据，用于仪表板展示',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        radar: { type: 'object' },
        scatter: { type: 'object' },
        heatmap: { type: 'object' },
        funnel: { type: 'object' },
        sankey: { type: 'object' },
        generatedAt: { type: 'string', format: 'date-time' },
        profileId: { type: 'string' },
      },
    },
  })
  async getAllChartData(
    @Param('profileId') profileId: string,
  ): Promise<Record<string, any>> {
    return await this.customerAnalyticsService.getAllChartData(profileId);
  }
}
