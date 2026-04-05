import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { DataImportService } from '../services/data-import.service';
import { DataImportJob } from '../../../entities/data-import-job.entity';
import { CreateImportJobDto } from '../dto/create-import-job.dto';
import { ProcessImportDto } from '../dto/process-import.dto';
import { SourceType } from '../../../shared/enums/source-type.enum';
import { DataImportStatus } from '../../../shared/enums/data-import-status.enum';

@ApiTags('customer-data')
@Controller('api/v1/customer-data')
export class DataImportController {
  constructor(private readonly dataImportService: DataImportService) {}

  /**
   * 为指定客户档案创建导入任务
   * 符合任务要求：POST /api/v1/customer-data/profiles/{id}/import
   */
  @Post('profiles/:profileId/import')
  @ApiOperation({
    summary: '为客户档案创建数据导入任务',
    description:
      '为客户档案创建一个新的数据导入任务，支持CSV、Excel、API等多种数据源',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiBody({ type: CreateImportJobDto })
  @ApiResponse({
    status: 201,
    description: '导入任务创建成功',
    type: DataImportJob,
  })
  @ApiResponse({ status: 404, description: '客户档案不存在' })
  @ApiResponse({ status: 400, description: '请求参数无效' })
  async createImportJobForProfile(
    @Param('profileId') profileId: string,
    @Body() createDto: CreateImportJobDto,
  ): Promise<DataImportJob> {
    // 使用profileId覆盖DTO中的customerProfileId，确保一致性
    return await this.dataImportService.createImportJob(
      profileId,
      createDto.sourceType,
      createDto.filePath,
      createDto.fileName,
      createDto.recordCount,
      createDto.notes,
    );
  }

  /**
   * 创建导入任务（通用接口）
   */
  @Post('import-jobs')
  @ApiOperation({
    summary: '创建数据导入任务',
    description: '创建一个新的数据导入任务',
  })
  @ApiBody({ type: CreateImportJobDto })
  @ApiResponse({
    status: 201,
    description: '导入任务创建成功',
    type: DataImportJob,
  })
  @ApiResponse({ status: 404, description: '客户档案不存在' })
  async createImportJob(
    @Body() createDto: CreateImportJobDto,
  ): Promise<DataImportJob> {
    return await this.dataImportService.createImportJob(
      createDto.customerProfileId,
      createDto.sourceType,
      createDto.filePath,
      createDto.fileName,
      createDto.recordCount,
      createDto.notes,
    );
  }

  /**
   * 获取导入任务详情
   */
  @Get('import-jobs/:id')
  @ApiOperation({
    summary: '获取导入任务详情',
    description: '根据ID获取数据导入任务的详细信息',
  })
  @ApiParam({ name: 'id', description: '导入任务ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: DataImportJob,
  })
  @ApiResponse({ status: 404, description: '导入任务不存在' })
  async getImportJob(@Param('id') id: string): Promise<DataImportJob> {
    return await this.dataImportService.getImportJob(id);
  }

  /**
   * 获取客户档案的所有导入任务（分页）
   */
  @Get('profiles/:profileId/import-jobs')
  @ApiOperation({
    summary: '获取客户档案的导入任务列表（分页）',
    description: '获取指定客户档案的所有数据导入任务列表，支持分页查询',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码，默认1', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量，默认100，最大1000', type: Number })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/DataImportJob' } },
        total: { type: 'number' },
      },
    },
  })
  async getImportJobsByProfile(
    @Param('profileId') profileId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<{ data: DataImportJob[]; total: number }> {
    // 限制最大每页数量
    const safeLimit = Math.min(limit, 1000);
    return await this.dataImportService.getImportJobsByProfile(profileId, page, safeLimit);
  }

  /**
   * 处理导入文件（模拟处理）
   */
  @Post('import-jobs/:id/process')
  @ApiOperation({
    summary: '处理导入文件',
    description: '处理已上传的数据文件，解析数据并验证',
  })
  @ApiParam({ name: 'id', description: '导入任务ID' })
  @ApiBody({ type: ProcessImportDto })
  @ApiResponse({
    status: 200,
    description: '文件处理成功',
    type: DataImportJob,
  })
  @ApiResponse({ status: 404, description: '导入任务不存在' })
  @ApiResponse({ status: 400, description: '导入任务状态无效' })
  async processImportFile(
    @Param('id') id: string,
    @Body() processDto: ProcessImportDto,
  ): Promise<DataImportJob> {
    return await this.dataImportService.processImportFile(
      id,
      processDto.fileContent,
    );
  }

  /**
   * 取消导入任务
   */
  @Post('import-jobs/:id/cancel')
  @ApiOperation({
    summary: '取消导入任务',
    description: '取消进行中的数据导入任务',
  })
  @ApiParam({ name: 'id', description: '导入任务ID' })
  @ApiResponse({
    status: 200,
    description: '任务取消成功',
    type: DataImportJob,
  })
  @ApiResponse({ status: 404, description: '导入任务不存在' })
  @ApiResponse({ status: 400, description: '无法取消已完成或失败的任务' })
  async cancelImportJob(@Param('id') id: string): Promise<DataImportJob> {
    return await this.dataImportService.cancelImportJob(id);
  }

  /**
   * 重试失败的导入任务
   */
  @Post('import-jobs/:id/retry')
  @ApiOperation({
    summary: '重试失败的导入任务',
    description: '重新执行失败的数据导入任务',
  })
  @ApiParam({ name: 'id', description: '导入任务ID' })
  @ApiResponse({
    status: 200,
    description: '重试任务创建成功',
    type: DataImportJob,
  })
  @ApiResponse({ status: 404, description: '导入任务不存在' })
  @ApiResponse({ status: 400, description: '无法重试非失败状态的任务' })
  async retryImportJob(@Param('id') id: string): Promise<DataImportJob> {
    return await this.dataImportService.retryImportJob(id);
  }

  /**
   * 获取导入任务统计信息
   */
  @Get('profiles/:profileId/import-stats')
  @ApiOperation({
    summary: '获取导入任务统计信息',
    description: '获取指定客户档案的数据导入统计信息',
  })
  @ApiParam({ name: 'profileId', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        totalJobs: { type: 'number' },
        completedJobs: { type: 'number' },
        pendingJobs: { type: 'number' },
        processingJobs: { type: 'number' },
        failedJobs: { type: 'number' },
        totalRecords: { type: 'number' },
        totalProcessed: { type: 'number' },
        totalFailed: { type: 'number' },
        successRate: { type: 'string' },
        lastImport: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getImportStats(
    @Param('profileId') profileId: string,
  ): Promise<Record<string, any>> {
    return await this.dataImportService.getImportStats(profileId);
  }

  /**
   * 验证导入数据
   */
  @Post('import-jobs/:id/validate')
  @ApiOperation({
    summary: '验证导入数据',
    description: '对导入的数据进行验证，检查数据质量和合规性',
  })
  @ApiParam({ name: 'id', description: '导入任务ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        validationRules: {
          type: 'object',
          additionalProperties: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '验证完成',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              severity: { type: 'string', enum: ['error', 'warning', 'info'] },
              message: { type: 'string' },
              field: { type: 'string' },
              row: { type: 'number' },
            },
          },
        },
        summary: { type: 'object' },
      },
    },
  })
  async validateImportData(
    @Param('id') id: string,
    @Body('validationRules') validationRules?: Record<string, any>,
  ): Promise<{
    isValid: boolean;
    issues: Array<{
      severity: 'error' | 'warning' | 'info';
      message: string;
      field?: string;
      row?: number;
    }>;
    summary: Record<string, any>;
  }> {
    return await this.dataImportService.validateImportData(id, validationRules);
  }

  /**
   * 获取数据源类型枚举列表
   */
  @Get('enums/source-types')
  @ApiOperation({
    summary: '获取数据源类型枚举列表',
    description: '获取系统支持的所有数据源类型枚举值',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        sourceTypes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' },
            },
          },
        },
      },
    },
  })
  getSourceTypes(): { value: string; label: string }[] {
    return Object.entries(SourceType).map(([key, value]) => ({
      value,
      label: this.getSourceTypeLabel(value),
    }));
  }

  /**
   * 获取导入状态枚举列表
   */
  @Get('enums/import-statuses')
  @ApiOperation({
    summary: '获取导入状态枚举列表',
    description: '获取系统支持的所有数据导入状态枚举值',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        importStatuses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' },
            },
          },
        },
      },
    },
  })
  getImportStatuses(): { value: string; label: string }[] {
    return Object.entries(DataImportStatus).map(([key, value]) => ({
      value,
      label: this.getImportStatusLabel(value),
    }));
  }

  /**
   * 获取数据源类型标签（中文化）
   */
  private getSourceTypeLabel(sourceType: SourceType): string {
    const labels: Record<SourceType, string> = {
      [SourceType.CSV]: 'CSV文件',
      [SourceType.EXCEL]: 'Excel文件',
      [SourceType.JSON]: 'JSON文件',
      [SourceType.DATABASE]: '数据库',
      [SourceType.API]: 'API接口',
      [SourceType.MANUAL]: '手工录入',
      [SourceType.OTHER]: '其他',
    };
    return labels[sourceType] || sourceType;
  }

  /**
   * 获取导入状态标签（中文化）
   */
  private getImportStatusLabel(status: DataImportStatus): string {
    const labels: Record<DataImportStatus, string> = {
      [DataImportStatus.PENDING]: '待处理',
      [DataImportStatus.PROCESSING]: '处理中',
      [DataImportStatus.SUCCESS]: '成功',
      [DataImportStatus.PARTIAL_SUCCESS]: '部分成功',
      [DataImportStatus.FAILED]: '失败',
      [DataImportStatus.CANCELLED]: '已取消',
    };
    return labels[status] || status;
  }
}
