import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GeoAnalysisService } from '../services/geo-analysis.service';
import { GeoAnalysisRequestDto } from '../dto/geo-analysis-request.dto';
import { GeoAnalysisResponse } from '../interfaces/geo-analysis.interface';

@ApiTags('GEO分析')
@Controller('geo-analysis')
export class GeoAnalysisController {
  constructor(private readonly geoAnalysisService: GeoAnalysisService) {}

  @Post('analyze')
  @ApiOperation({ summary: '发起地理分析', description: '根据请求参数发起地理分析，返回分析ID和初始状态' })
  @ApiResponse({ status: 201, description: '分析任务已创建', type: Object })
  @ApiResponse({ status: 400, description: '请求参数无效' })
  @ApiResponse({ status: 500, description: '分析过程中发生错误' })
  async analyze(@Body() request: GeoAnalysisRequestDto): Promise<GeoAnalysisResponse> {
    return this.geoAnalysisService.analyze(request);
  }

  @Get('results/:analysisId')
  @ApiOperation({ summary: '获取分析结果', description: '根据分析ID获取地理分析结果' })
  @ApiParam({ name: 'analysisId', description: '分析记录ID' })
  @ApiResponse({ status: 200, description: '返回分析结果' })
  @ApiResponse({ status: 404, description: '分析结果不存在' })
  async getAnalysisResult(@Param('analysisId') analysisId: string) {
    return this.geoAnalysisService.getAnalysisResult(analysisId);
  }

  @Get('regions')
  @ApiOperation({ summary: '获取地区列表', description: '根据租户ID和过滤条件获取地区列表' })
  @ApiQuery({ name: 'tenantId', required: true, description: '租户ID' })
  @ApiQuery({ name: 'regionLevel', required: false, description: '地区级别' })
  @ApiQuery({ name: 'regionType', required: false, description: '地区类型' })
  @ApiResponse({ status: 200, description: '返回地区列表' })
  async getRegions(
    @Query('tenantId') tenantId: string,
    @Query('regionLevel') regionLevel?: string,
    @Query('regionType') regionType?: string,
  ) {
    const filters: any = {};
    if (regionLevel) filters.regionLevel = regionLevel;
    if (regionType) filters.regionType = regionType;
    return this.geoAnalysisService.getRegions(tenantId, filters);
  }

  @Get('seo-suggestions')
  @ApiOperation({ summary: '获取SEO建议', description: '根据租户ID和过滤条件获取SEO优化建议' })
  @ApiQuery({ name: 'tenantId', required: true, description: '租户ID' })
  @ApiQuery({ name: 'suggestionType', required: false, description: '建议类型' })
  @ApiQuery({ name: 'priority', required: false, description: '优先级' })
  @ApiResponse({ status: 200, description: '返回SEO建议列表' })
  async getSeoSuggestions(
    @Query('tenantId') tenantId: string,
    @Query('suggestionType') suggestionType?: string,
    @Query('priority') priority?: string,
  ) {
    const filters: any = {};
    if (suggestionType) filters.suggestionType = suggestionType;
    if (priority) filters.priority = priority;
    return this.geoAnalysisService.getSeoSuggestions(tenantId, filters);
  }
}