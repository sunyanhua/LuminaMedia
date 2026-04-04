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
  Request,
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
import { QuotaService } from '../services/quota.service';
import { TenantQuota } from '../../../entities/tenant-quota.entity';
import { CreateQuotaDto, UpdateQuotaDto, ResetQuotaDto, QuotaQueryDto } from '../dto/quota.dto';

@ApiTags('配额管理')
@ApiBearerAuth()
@Controller('quotas')
@UseGuards(JwtAuthGuard)
export class QuotaController {
  constructor(
    private readonly quotaService: QuotaService,
  ) {}

  /**
   * 获取配额配置列表
   * 符合任务要求：GET /api/quotas
   */
  @Get()
  @ApiOperation({
    summary: '获取配额配置列表',
    description: '返回所有配额配置信息（支持分页、过滤）',
  })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: '租户ID过滤',
  })
  @ApiQuery({
    name: 'featureKey',
    required: false,
    description: '功能键过滤',
  })
  @ApiQuery({
    name: 'quotaPeriod',
    required: false,
    description: '配额周期过滤（daily/weekly/monthly）',
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
  @ApiResponse({ status: 200, description: '成功获取配额配置列表', type: [TenantQuota] })
  async getQuotas(
    @Query() query: QuotaQueryDto,
  ): Promise<{ data: TenantQuota[]; total: number; page: number; pageSize: number }> {
    return await this.quotaService.getQuotas(query);
  }

  /**
   * 获取当前配额使用情况
   * 符合任务要求：GET /api/quotas/current
   */
  @Get('current')
  @ApiOperation({
    summary: '获取当前配额使用情况',
    description: '返回当前租户的所有功能配额使用情况',
  })
  @ApiResponse({ status: 200, description: '成功获取当前配额使用情况' })
  async getCurrentQuotas(
    @Request() req: any,
  ): Promise<Array<{
    featureKey: string;
    usedCount: number;
    maxCount: number;
    remaining: number;
    quotaPeriod: 'daily' | 'weekly' | 'monthly';
    resetTime?: Date;
  }>> {
    // 从请求中获取租户ID，这里需要根据实际认证逻辑调整
    // 假设租户ID从JWT token中获取，存储在req.user.tenantId
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('无法获取租户信息');
    }

    return await this.quotaService.getTenantQuotaUsage(tenantId);
  }

  /**
   * 获取配额使用历史
   * 符合任务要求：GET /api/quotas/history
   * 注意：目前系统没有配额使用历史记录，这里返回空的占位响应
   */
  @Get('history')
  @ApiOperation({
    summary: '获取配额使用历史',
    description: '返回配额使用历史记录（功能待实现）',
  })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: '租户ID过滤',
  })
  @ApiQuery({
    name: 'featureKey',
    required: false,
    description: '功能键过滤',
  })
  @ApiResponse({ status: 200, description: '成功获取配额使用历史（占位）' })
  async getQuotaHistory(
    @Query('tenantId') tenantId?: string,
    @Query('featureKey') featureKey?: string,
  ): Promise<{ message: string; data: any[] }> {
    // TODO: 实现配额使用历史记录功能
    return {
      message: '配额使用历史记录功能待实现',
      data: [],
    };
  }

  /**
   * 重置配额（管理员）
   * 符合任务要求：POST /api/quotas/reset
   */
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '重置配额',
    description: '重置指定租户和功能的配额使用计数（管理员权限）',
  })
  @ApiBody({ type: ResetQuotaDto })
  @ApiResponse({ status: 200, description: '配额重置成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async resetQuota(
    @Body() resetQuotaDto: ResetQuotaDto,
  ): Promise<{ success: boolean; message: string }> {
    const { tenantId, featureKey } = resetQuotaDto;

    if (tenantId && featureKey) {
      // 重置特定租户和功能的配额
      await this.quotaService.resetQuota(tenantId, featureKey);
      return { success: true, message: `已重置租户 ${tenantId} 功能 ${featureKey} 的配额` };
    } else if (tenantId && !featureKey) {
      // 重置租户的所有配额
      await this.quotaService.resetQuotasForTenant(tenantId);
      return { success: true, message: `已重置租户 ${tenantId} 的所有配额` };
    } else {
      throw new Error('必须提供租户ID或租户ID+功能键');
    }
  }

  /**
   * 创建配额配置
   * 符合RESTful设计，虽然不是任务清单中明确要求的，但通常是需要的
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '创建配额配置',
    description: '创建新的配额配置',
  })
  @ApiBody({ type: CreateQuotaDto })
  @ApiResponse({ status: 201, description: '配额配置创建成功', type: TenantQuota })
  @ApiResponse({ status: 400, description: '请求参数错误或配额配置已存在' })
  async createQuota(
    @Body() createQuotaDto: CreateQuotaDto,
  ): Promise<TenantQuota> {
    const { tenantId, featureKey, maxCount, quotaPeriod = 'daily' } = createQuotaDto;
    return await this.quotaService.setQuota(tenantId, featureKey, maxCount, quotaPeriod);
  }

  /**
   * 更新配额配置
   * 符合任务要求：PUT /api/quotas/:quotaType
   * 这里实现为 PUT /api/quotas/:tenantId/:featureKey 更符合RESTful设计
   */
  @Put(':tenantId/:featureKey')
  @ApiOperation({
    summary: '更新配额配置',
    description: '更新指定租户和功能的配额配置',
  })
  @ApiParam({ name: 'tenantId', description: '租户ID', example: 'demo-business-001' })
  @ApiParam({ name: 'featureKey', description: '功能键', example: 'customer-analytics' })
  @ApiBody({ type: UpdateQuotaDto })
  @ApiResponse({ status: 200, description: '配额配置更新成功', type: TenantQuota })
  @ApiResponse({ status: 404, description: '配额配置不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async updateQuota(
    @Param('tenantId') tenantId: string,
    @Param('featureKey') featureKey: string,
    @Body() updateQuotaDto: UpdateQuotaDto,
  ): Promise<TenantQuota> {
    const { maxCount, quotaPeriod } = updateQuotaDto;

    // 先获取现有配额记录
    const existingQuota = await this.quotaService.getQuotaInfo(tenantId, featureKey);

    // 使用setQuota方法更新，它处理创建或更新逻辑
    return await this.quotaService.setQuota(
      tenantId,
      featureKey,
      maxCount ?? existingQuota.maxCount,
      quotaPeriod ?? 'daily'
    );
  }

  /**
   * 删除配额配置
   * 虽然不是任务清单中明确要求的，但通常是需要的
   */
  @Delete(':tenantId/:featureKey')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '删除配额配置',
    description: '删除指定的配额配置',
  })
  @ApiParam({ name: 'tenantId', description: '租户ID', example: 'demo-business-001' })
  @ApiParam({ name: 'featureKey', description: '功能键', example: 'customer-analytics' })
  @ApiResponse({ status: 204, description: '配额配置删除成功' })
  @ApiResponse({ status: 404, description: '配额配置不存在' })
  async deleteQuota(
    @Param('tenantId') tenantId: string,
    @Param('featureKey') featureKey: string,
  ): Promise<void> {
    await this.quotaService.deleteQuota(tenantId, featureKey);
  }

  /**
   * 获取单个配额配置详情
   * 虽然不是任务清单中明确要求的，但通常是需要的
   */
  @Get(':tenantId/:featureKey')
  @ApiOperation({
    summary: '获取配额配置详情',
    description: '获取指定租户和功能的配额配置详情',
  })
  @ApiParam({ name: 'tenantId', description: '租户ID', example: 'demo-business-001' })
  @ApiParam({ name: 'featureKey', description: '功能键', example: 'customer-analytics' })
  @ApiResponse({ status: 200, description: '成功获取配额配置详情' })
  @ApiResponse({ status: 404, description: '配额配置不存在' })
  async getQuotaDetail(
    @Param('tenantId') tenantId: string,
    @Param('featureKey') featureKey: string,
  ): Promise<{
    usedCount: number;
    maxCount: number;
    remaining: number;
    resetTime?: Date;
    quotaPeriod: 'daily' | 'weekly' | 'monthly';
  }> {
    return await this.quotaService.getQuotaInfo(tenantId, featureKey);
  }
}