import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
import {
  DashboardStatsQueryDto,
  CustomerOverviewQueryDto,
  MarketingPerformanceQueryDto,
  RealTimeMetricsQueryDto,
  ChartDataQueryDto,
  GenerateReportDto,
  ExportDashboardDto,
} from '../dto/dashboard.dto';
import {
  DashboardStats,
  CustomerOverview,
  MarketingPerformance,
  RealTimeMetrics,
  ChartData,
  DashboardReportResponse,
} from '../interfaces/dashboard.interface';

@ApiTags('dashboard')
@Controller('v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: '获取仪表板概览统计' })
  @ApiResponse({ status: 200, description: '返回仪表板统计信息' })
  async getDashboardStats(
    @Query() query: DashboardStatsQueryDto,
  ): Promise<DashboardStats> {
    return this.dashboardService.getDashboardStats(query);
  }

  @Get('customer-overview/:profileId')
  @ApiOperation({ summary: '获取客户概览数据' })
  @ApiResponse({ status: 200, description: '返回客户概览数据' })
  async getCustomerOverview(
    @Param() params: CustomerOverviewQueryDto,
  ): Promise<CustomerOverview> {
    return this.dashboardService.getCustomerOverview(params.profileId);
  }

  @Get('marketing-performance/:campaignId')
  @ApiOperation({ summary: '获取营销活动表现数据' })
  @ApiResponse({ status: 200, description: '返回营销活动表现数据' })
  async getMarketingPerformance(
    @Param() params: MarketingPerformanceQueryDto,
    @Query('granularity') granularity?: string,
  ): Promise<MarketingPerformance> {
    return this.dashboardService.getMarketingPerformance(
      params.campaignId,
      granularity,
    );
  }

  @Get('real-time-metrics')
  @ApiOperation({ summary: '获取实时指标' })
  @ApiResponse({ status: 200, description: '返回实时指标数据' })
  async getRealTimeMetrics(
    @Query() query: RealTimeMetricsQueryDto,
  ): Promise<RealTimeMetrics> {
    return this.dashboardService.getRealTimeMetrics(query.lastMinutes);
  }

  @Get('charts/user-activity')
  @ApiOperation({ summary: '获取用户活跃度图表数据' })
  @ApiResponse({ status: 200, description: '返回用户活跃度图表数据' })
  async getUserActivityChart(
    @Query() query: ChartDataQueryDto,
  ): Promise<ChartData> {
    return this.dashboardService.getUserActivityChart(
      query.days,
      query.profileId,
    );
  }

  @Get('charts/consumption-distribution')
  @ApiOperation({ summary: '获取消费频次分布图表数据' })
  @ApiResponse({ status: 200, description: '返回消费频次分布图表数据' })
  async getConsumptionDistributionChart(
    @Query() query: ChartDataQueryDto,
  ): Promise<ChartData> {
    return this.dashboardService.getConsumptionDistributionChart(
      query.profileId,
    );
  }

  @Get('charts/geographic-distribution')
  @ApiOperation({ summary: '获取地理位置分布图表数据' })
  @ApiResponse({ status: 200, description: '返回地理位置分布图表数据' })
  async getGeographicDistributionChart(
    @Query() query: ChartDataQueryDto,
  ): Promise<ChartData> {
    return this.dashboardService.getGeographicDistributionChart(
      query.profileId,
    );
  }

  @Get('charts/roi-trend')
  @ApiOperation({ summary: '获取营销ROI趋势图表数据' })
  @ApiResponse({ status: 200, description: '返回营销ROI趋势图表数据' })
  async getROITrendChart(
    @Query() query: ChartDataQueryDto,
  ): Promise<ChartData> {
    return this.dashboardService.getROITrendChart(query.campaignId);
  }

  @Get('charts/customer-scatter')
  @ApiOperation({ summary: '获取客户散点图数据（新增图表类型）' })
  @ApiResponse({ status: 200, description: '返回客户散点图数据' })
  async getCustomerScatterChart(
    @Query() query: ChartDataQueryDto,
  ): Promise<ChartData> {
    return this.dashboardService.getCustomerScatterChart(query.profileId);
  }

  @Get('charts/customer-radar')
  @ApiOperation({ summary: '获取客户雷达图数据（新增图表类型）' })
  @ApiResponse({ status: 200, description: '返回客户雷达图数据' })
  async getCustomerRadarChart(
    @Query() query: ChartDataQueryDto,
  ): Promise<ChartData> {
    return this.dashboardService.getCustomerRadarChart(query.profileId);
  }

  @Get('charts/heatmap')
  @ApiOperation({ summary: '获取热力图数据（新增图表类型）' })
  @ApiResponse({ status: 200, description: '返回热力图数据' })
  async getHeatmapChart(@Query() query: ChartDataQueryDto): Promise<ChartData> {
    return this.dashboardService.getHeatmapChart(query.days, query.profileId);
  }

  @Post('generate-report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '生成数据看板报告' })
  @ApiResponse({ status: 200, description: '返回报告URL' })
  async generateDashboardReport(
    @Body() body: GenerateReportDto,
  ): Promise<DashboardReportResponse> {
    return this.dashboardService.generateDashboardReport(body);
  }

  @Get('export')
  @ApiOperation({ summary: '导出数据看板数据' })
  @ApiResponse({ status: 200, description: '返回数据下载URL' })
  async exportDashboardData(
    @Query() query: ExportDashboardDto,
  ): Promise<{ downloadUrl: string }> {
    return this.dashboardService.exportDashboardData(query.format);
  }

  @Get('charts/parking-spending')
  @ApiOperation({ summary: '获取停车时长与消费金额关系数据' })
  @ApiResponse({ status: 200, description: '返回停车时长与消费金额关系数据' })
  async getParkingSpendingChart(
    @Query('profileId') profileId?: string,
  ): Promise<any[]> {
    return this.dashboardService.getParkingSpendingData(profileId);
  }

  @Get('charts/traffic-timeseries')
  @ApiOperation({ summary: '获取每日客流趋势数据' })
  @ApiResponse({ status: 200, description: '返回每日客流趋势数据' })
  async getTrafficTimeSeriesChart(
    @Query('profileId') profileId?: string,
    @Query('days') days?: number,
  ): Promise<any[]> {
    return this.dashboardService.getTrafficTimeSeriesData(profileId, days);
  }
}
