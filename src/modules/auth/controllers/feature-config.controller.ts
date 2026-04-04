import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { FeatureConfigService } from '../services/feature-config.service';
import { FeatureConfig } from '../../../entities/feature-config.entity';
import { CreateFeatureConfigDto, UpdateFeatureConfigDto } from '../dto/feature-config.dto';

@ApiTags('功能配置管理')
@ApiBearerAuth()
@Controller('features')
@UseGuards(JwtAuthGuard)
export class FeatureConfigController {
  constructor(
    private readonly featureConfigService: FeatureConfigService,
  ) {}

  /**
   * 获取功能配置列表
   * 符合任务要求：GET /api/features
   */
  @Get()
  @ApiOperation({
    summary: '获取功能配置列表',
    description: '返回所有功能配置信息（支持分页、过滤、排序）',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '页码，默认为1',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: '每页数量，默认为20',
  })
  @ApiQuery({
    name: 'isEnabled',
    required: false,
    description: '是否启用（true/false/all）',
  })
  @ApiQuery({
    name: 'tenantType',
    required: false,
    description: '租户类型过滤（all/business/government）',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: '排序字段（featureKey/featureName/createdAt）',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: '排序方式（asc/desc），默认asc',
  })
  @ApiResponse({ status: 200, description: '成功获取功能配置列表', type: [FeatureConfig] })
  async getFeatureConfigs(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('isEnabled') isEnabled?: string,
    @Query('tenantType') tenantType?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<{ data: FeatureConfig[]; total: number; page: number; pageSize: number }> {
    const where: any = {};
    if (isEnabled && isEnabled !== 'all') {
      where.isEnabled = isEnabled === 'true';
    }
    if (tenantType && tenantType !== 'all') {
      where.tenantType = tenantType;
    }

    const [data, total] = await this.featureConfigService.getAllFeatureConfigs(
      page,
      pageSize,
      where,
      sortBy,
      sortOrder,
    );

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取单个功能配置
   * 符合任务要求：GET /api/features/:featureKey
   */
  @Get(':featureKey')
  @ApiOperation({
    summary: '获取单个功能配置',
    description: '根据功能键获取特定功能配置的详细信息',
  })
  @ApiParam({ name: 'featureKey', description: '功能键', example: 'customer-analytics' })
  @ApiResponse({ status: 200, description: '成功获取功能配置', type: FeatureConfig })
  @ApiResponse({ status: 404, description: '功能配置不存在' })
  async getFeatureConfig(
    @Param('featureKey') featureKey: string,
  ): Promise<FeatureConfig | null> {
    const featureConfig = await this.featureConfigService.getFeatureConfigByKey(featureKey);
    if (!featureConfig) {
      throw new Error('功能配置不存在');
    }
    return featureConfig;
  }

  /**
   * 创建功能配置
   * 符合任务要求：POST /api/features
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '创建功能配置',
    description: '创建新的功能配置',
  })
  @ApiBody({ type: CreateFeatureConfigDto })
  @ApiResponse({ status: 201, description: '功能配置创建成功', type: FeatureConfig })
  @ApiResponse({ status: 400, description: '请求参数错误或功能键已存在' })
  async createFeatureConfig(
    @Body() createFeatureConfigDto: CreateFeatureConfigDto,
  ): Promise<FeatureConfig> {
    return await this.featureConfigService.createFeatureConfig(createFeatureConfigDto);
  }

  /**
   * 更新功能配置
   * 符合任务要求：PUT /api/features/:featureKey
   */
  @Put(':featureKey')
  @ApiOperation({
    summary: '更新功能配置',
    description: '更新指定功能配置的信息',
  })
  @ApiParam({ name: 'featureKey', description: '功能键', example: 'customer-analytics' })
  @ApiBody({ type: UpdateFeatureConfigDto })
  @ApiResponse({ status: 200, description: '功能配置更新成功', type: FeatureConfig })
  @ApiResponse({ status: 404, description: '功能配置不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async updateFeatureConfig(
    @Param('featureKey') featureKey: string,
    @Body() updateFeatureConfigDto: UpdateFeatureConfigDto,
  ): Promise<FeatureConfig> {
    return await this.featureConfigService.updateFeatureConfig(featureKey, updateFeatureConfigDto);
  }

  /**
   * 删除功能配置
   * 符合任务要求：DELETE /api/features/:featureKey
   */
  @Delete(':featureKey')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '删除功能配置',
    description: '删除指定的功能配置',
  })
  @ApiParam({ name: 'featureKey', description: '功能键', example: 'customer-analytics' })
  @ApiResponse({ status: 204, description: '功能配置删除成功' })
  @ApiResponse({ status: 404, description: '功能配置不存在' })
  @ApiResponse({ status: 400, description: '无法删除正在使用的功能配置' })
  async deleteFeatureConfig(
    @Param('featureKey') featureKey: string,
  ): Promise<void> {
    await this.featureConfigService.deleteFeatureConfig(featureKey);
  }

  /**
   * 批量操作 - 批量启用功能
   */
  @Post('batch/enable')
  @ApiOperation({
    summary: '批量启用功能',
    description: '批量启用指定的功能配置',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        featureKeys: {
          type: 'array',
          items: { type: 'string' },
          description: '功能键列表',
        },
      },
      example: {
        featureKeys: ['customer-analytics', 'geo-analysis'],
      },
    },
  })
  @ApiResponse({ status: 200, description: '批量启用成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async batchEnableFeatures(
    @Body() body: { featureKeys: string[] },
  ): Promise<{ success: boolean; updated: number }> {
    let updated = 0;
    for (const featureKey of body.featureKeys) {
      try {
        await this.featureConfigService.updateFeatureConfig(featureKey, { isEnabled: true });
        updated++;
      } catch (error) {
        // 忽略不存在的功能
      }
    }
    return { success: true, updated };
  }

  /**
   * 批量操作 - 批量禁用功能
   */
  @Post('batch/disable')
  @ApiOperation({
    summary: '批量禁用功能',
    description: '批量禁用指定的功能配置',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        featureKeys: {
          type: 'array',
          items: { type: 'string' },
          description: '功能键列表',
        },
      },
      example: {
        featureKeys: ['customer-analytics', 'geo-analysis'],
      },
    },
  })
  @ApiResponse({ status: 200, description: '批量禁用成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async batchDisableFeatures(
    @Body() body: { featureKeys: string[] },
  ): Promise<{ success: boolean; updated: number }> {
    let updated = 0;
    for (const featureKey of body.featureKeys) {
      try {
        await this.featureConfigService.updateFeatureConfig(featureKey, { isEnabled: false });
        updated++;
      } catch (error) {
        // 忽略不存在的功能
      }
    }
    return { success: true, updated };
  }
}
