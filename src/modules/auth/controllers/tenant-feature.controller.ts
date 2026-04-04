import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantFeatureService } from '../services/tenant-feature.service';
import { TenantFeatureToggle } from '../../../entities/feature-config.entity';
import {
  EnableFeatureForTenantDto,
  DisableFeatureForTenantDto,
  BatchEnableFeaturesDto,
  BatchDisableFeaturesDto,
} from '../dto/tenant-feature.dto';

@ApiTags('租户功能管理')
@ApiBearerAuth()
@Controller('tenant-features')
@UseGuards(JwtAuthGuard)
export class TenantFeatureController {
  constructor(
    private readonly tenantFeatureService: TenantFeatureService,
  ) {}

  /**
   * 获取租户功能列表
   * 符合任务要求：GET /api/tenant-features
   */
  @Get()
  @ApiOperation({
    summary: '获取租户功能列表',
    description: '返回指定租户的所有功能开关状态',
  })
  @ApiQuery({
    name: 'tenantId',
    required: true,
    description: '租户ID',
  })
  @ApiQuery({
    name: 'featureKey',
    required: false,
    description: '按功能键过滤',
  })
  @ApiQuery({
    name: 'isEnabled',
    required: false,
    description: '按启用状态过滤（true/false）',
  })
  @ApiResponse({ status: 200, description: '成功获取租户功能列表', type: [TenantFeatureToggle] })
  async getTenantFeatures(
    @Query('tenantId') tenantId: string,
    @Query('featureKey') featureKey?: string,
    @Query('isEnabled') isEnabled?: string,
  ): Promise<TenantFeatureToggle[]> {
    const features = await this.tenantFeatureService.getTenantFeatures(tenantId);

    // 应用过滤
    let filteredFeatures = features;
    if (featureKey) {
      filteredFeatures = filteredFeatures.filter(f => f.featureKey.includes(featureKey));
    }
    if (isEnabled !== undefined) {
      const enabled = isEnabled === 'true';
      filteredFeatures = filteredFeatures.filter(f => f.isEnabled === enabled);
    }

    return filteredFeatures;
  }

  /**
   * 获取租户功能详情
   * 符合任务要求：GET /api/tenant-features/:featureKey
   */
  @Get(':featureKey')
  @ApiOperation({
    summary: '获取租户功能详情',
    description: '获取指定租户特定功能的详细信息',
  })
  @ApiParam({ name: 'featureKey', description: '功能键', example: 'customer-analytics' })
  @ApiQuery({
    name: 'tenantId',
    required: true,
    description: '租户ID',
  })
  @ApiResponse({ status: 200, description: '成功获取租户功能详情', type: TenantFeatureToggle })
  @ApiResponse({ status: 404, description: '租户功能配置不存在' })
  async getTenantFeature(
    @Param('featureKey') featureKey: string,
    @Query('tenantId') tenantId: string,
  ): Promise<TenantFeatureToggle | null> {
    const tenantFeature = await this.tenantFeatureService.getTenantFeature(tenantId, featureKey);
    if (!tenantFeature) {
      throw new Error('租户功能配置不存在');
    }
    return tenantFeature;
  }

  /**
   * 启用租户功能
   * 符合任务要求：PUT /api/tenant-features/:featureKey/enable
   */
  @Put(':featureKey/enable')
  @ApiOperation({
    summary: '启用租户功能',
    description: '为指定租户启用特定功能',
  })
  @ApiParam({ name: 'featureKey', description: '功能键', example: 'customer-analytics' })
  @ApiBody({ type: EnableFeatureForTenantDto })
  @ApiResponse({ status: 200, description: '功能启用成功', type: TenantFeatureToggle })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async enableTenantFeature(
    @Param('featureKey') featureKey: string,
    @Body() enableDto: EnableFeatureForTenantDto,
  ): Promise<TenantFeatureToggle> {
    return await this.tenantFeatureService.enableFeatureForTenant(
      enableDto.tenantId,
      featureKey,
      enableDto.quotaConfig,
    );
  }

  /**
   * 禁用租户功能
   * 符合任务要求：PUT /api/tenant-features/:featureKey/disable
   */
  @Put(':featureKey/disable')
  @ApiOperation({
    summary: '禁用租户功能',
    description: '为指定租户禁用特定功能',
  })
  @ApiParam({ name: 'featureKey', description: '功能键', example: 'customer-analytics' })
  @ApiBody({ type: DisableFeatureForTenantDto })
  @ApiResponse({ status: 200, description: '功能禁用成功', type: TenantFeatureToggle })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async disableTenantFeature(
    @Param('featureKey') featureKey: string,
    @Body() disableDto: DisableFeatureForTenantDto,
  ): Promise<TenantFeatureToggle> {
    return await this.tenantFeatureService.disableFeatureForTenant(
      disableDto.tenantId,
      featureKey,
    );
  }

  /**
   * 批量启用功能
   * 符合任务要求：POST /api/tenant-features/batch-enable
   */
  @Post('batch-enable')
  @ApiOperation({
    summary: '批量启用功能',
    description: '为指定租户批量启用多个功能',
  })
  @ApiBody({ type: BatchEnableFeaturesDto })
  @ApiResponse({ status: 200, description: '批量启用成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async batchEnableFeatures(
    @Body() batchEnableDto: BatchEnableFeaturesDto,
  ): Promise<{ success: boolean; updated: number }> {
    const features = batchEnableDto.featureKeys.map(featureKey => ({
      featureKey,
      isEnabled: true,
      quotaConfig: batchEnableDto.quotaConfig,
    }));

    const results = await this.tenantFeatureService.batchSetFeaturesForTenant(
      batchEnableDto.tenantId,
      features,
    );

    return { success: true, updated: results.length };
  }

  /**
   * 批量禁用功能
   * 符合任务要求：POST /api/tenant-features/batch-disable
   */
  @Post('batch-disable')
  @ApiOperation({
    summary: '批量禁用功能',
    description: '为指定租户批量禁用多个功能',
  })
  @ApiBody({ type: BatchDisableFeaturesDto })
  @ApiResponse({ status: 200, description: '批量禁用成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async batchDisableFeatures(
    @Body() batchDisableDto: BatchDisableFeaturesDto,
  ): Promise<{ success: boolean; updated: number }> {
    const features = batchDisableDto.featureKeys.map(featureKey => ({
      featureKey,
      isEnabled: false,
    }));

    const results = await this.tenantFeatureService.batchSetFeaturesForTenant(
      batchDisableDto.tenantId,
      features,
    );

    return { success: true, updated: results.length };
  }
}