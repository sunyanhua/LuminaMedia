import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { EnterpriseProfileAnalysisService } from '../services/enterprise-profile-analysis.service';
import { EnterpriseProfile } from '../../../entities/enterprise-profile.entity';

@ApiTags('knowledge')
@Controller('v1/knowledge/enterprise-profiles')
export class EnterpriseProfileController {
  constructor(
    private readonly enterpriseProfileAnalysisService: EnterpriseProfileAnalysisService,
  ) {}

  /**
   * 创建企业画像分析任务
   */
  @Post(':customerProfileId/analyze')
  @ApiOperation({
    summary: '创建企业画像分析任务',
    description: '为指定客户档案创建企业画像分析任务，异步生成企业画像',
  })
  @ApiParam({
    name: 'customerProfileId',
    description: '客户档案ID',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: '分析任务创建成功',
    type: EnterpriseProfile,
  })
  @ApiResponse({ status: 404, description: '客户档案不存在' })
  @ApiResponse({ status: 400, description: '请求参数无效' })
  async createAnalysisTask(
    @Param('customerProfileId') customerProfileId: string,
  ): Promise<EnterpriseProfile> {
    return await this.enterpriseProfileAnalysisService.createAnalysisTask(
      customerProfileId,
    );
  }

  /**
   * 获取企业画像详情
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取企业画像详情',
    description: '根据ID获取企业画像的详细信息，包括画像数据和特征向量',
  })
  @ApiParam({ name: 'id', description: '企业画像ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: EnterpriseProfile,
  })
  @ApiResponse({ status: 404, description: '企业画像不存在' })
  async getProfile(@Param('id') id: string): Promise<EnterpriseProfile> {
    return await this.enterpriseProfileAnalysisService.getProfile(id);
  }

  /**
   * 获取客户档案的企业画像列表
   */
  @Get()
  @ApiOperation({
    summary: '获取客户档案的企业画像列表',
    description: '根据客户档案ID获取该客户的所有企业画像列表（包含版本历史）',
  })
  @ApiQuery({
    name: 'customerProfileId',
    required: true,
    description: '客户档案ID',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [EnterpriseProfile],
  })
  async getProfilesByCustomer(
    @Query('customerProfileId') customerProfileId: string,
  ): Promise<EnterpriseProfile[]> {
    return await this.enterpriseProfileAnalysisService.getProfilesByCustomer(
      customerProfileId,
    );
  }

  /**
   * 获取当前版本的企业画像
   */
  @Get('current/:customerProfileId')
  @ApiOperation({
    summary: '获取当前版本的企业画像',
    description: '获取指定客户档案的当前版本企业画像',
  })
  @ApiParam({
    name: 'customerProfileId',
    description: '客户档案ID',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: EnterpriseProfile,
  })
  @ApiResponse({ status: 404, description: '企业画像不存在' })
  async getCurrentProfile(
    @Param('customerProfileId') customerProfileId: string,
  ): Promise<EnterpriseProfile | null> {
    return await this.enterpriseProfileAnalysisService.getCurrentProfile(
      customerProfileId,
    );
  }

  /**
   * 重新分析企业画像
   */
  @Post(':id/reanalyze')
  @ApiOperation({
    summary: '重新分析企业画像',
    description: '重新分析企业画像，生成新版本',
  })
  @ApiParam({ name: 'id', description: '企业画像ID' })
  @ApiResponse({
    status: 201,
    description: '重新分析任务创建成功',
    type: EnterpriseProfile,
  })
  @ApiResponse({ status: 404, description: '企业画像不存在' })
  @ApiResponse({ status: 400, description: '画像正在分析中' })
  async reanalyzeProfile(@Param('id') id: string): Promise<EnterpriseProfile> {
    return await this.enterpriseProfileAnalysisService.reanalyzeProfile(id);
  }

  /**
   * 获取分析状态
   */
  @Get(':id/status')
  @ApiOperation({
    summary: '获取分析状态',
    description: '获取企业画像分析任务的当前状态和进度',
  })
  @ApiParam({ name: 'id', description: '企业画像ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        progress: { type: 'number' },
        estimatedTime: { type: 'number', nullable: true },
        errorMessage: { type: 'string', nullable: true },
      },
    },
  })
  async getAnalysisStatus(@Param('id') id: string): Promise<{
    status: string;
    progress: number;
    estimatedTime?: number;
    errorMessage?: string;
  }> {
    return await this.enterpriseProfileAnalysisService.getAnalysisStatus(id);
  }

  /**
   * 批量分析企业画像
   */
  @Post('batch-analyze')
  @ApiOperation({
    summary: '批量分析企业画像',
    description: '批量创建企业画像分析任务',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        customerProfileIds: {
          type: 'array',
          items: { type: 'string' },
          description: '客户档案ID数组',
        },
      },
      required: ['customerProfileIds'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '批量分析任务创建成功',
    type: [EnterpriseProfile],
  })
  async batchAnalyzeProfiles(
    @Body('customerProfileIds') customerProfileIds: string[],
  ): Promise<EnterpriseProfile[]> {
    return await this.enterpriseProfileAnalysisService.batchAnalyzeProfiles(
      customerProfileIds,
    );
  }

  /**
   * 删除企业画像
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '删除企业画像',
    description: '删除企业画像记录（谨慎操作，建议版本管理而非删除）',
  })
  @ApiParam({ name: 'id', description: '企业画像ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '企业画像不存在' })
  async deleteProfile(@Param('id') id: string): Promise<void> {
    // TODO: 实现删除逻辑（需要检查是否为当前版本，如果是则不能删除）
    // 暂时只记录日志
    console.warn(`企业画像删除请求: ${id}，功能待实现`);
  }

  /**
   * 获取行业统计
   */
  @Get('stats/industries')
  @ApiOperation({
    summary: '获取行业统计',
    description: '获取企业画像的行业分布统计',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        stats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              industry: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getIndustryStats(): Promise<
    Array<{ industry: string; count: number }>
  > {
    // TODO: 从repository获取统计信息
    return [
      { industry: '科技', count: 25 },
      { industry: '金融', count: 18 },
      { industry: '医疗', count: 12 },
      { industry: '教育', count: 8 },
      { industry: '零售', count: 15 },
    ];
  }

  /**
   * 获取分析状态统计
   */
  @Get('stats/analysis-status')
  @ApiOperation({
    summary: '获取分析状态统计',
    description: '获取企业画像分析任务的状态分布统计',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        stats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              count: { type: 'number' },
              avgProgress: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getAnalysisStatusStats(): Promise<
    Array<{ status: string; count: number; avgProgress: number }>
  > {
    // TODO: 从repository获取统计信息
    return [
      { status: 'completed', count: 45, avgProgress: 100 },
      { status: 'analyzing', count: 5, avgProgress: 65 },
      { status: 'pending', count: 3, avgProgress: 0 },
      { status: 'failed', count: 2, avgProgress: 30 },
    ];
  }

  /**
   * 查找相似企业画像
   */
  @Get(':id/similar')
  @ApiOperation({
    summary: '查找相似企业画像',
    description: '基于特征向量查找相似的企业画像',
  })
  @ApiParam({ name: 'id', description: '企业画像ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '返回结果数量限制',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [EnterpriseProfile],
  })
  async findSimilarProfiles(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ): Promise<EnterpriseProfile[]> {
    // 获取当前画像
    const profile = await this.enterpriseProfileAnalysisService.getProfile(id);
    if (!profile.featureVector) {
      return [];
    }

    // TODO: 实现相似性搜索（使用向量数据库）
    // 暂时返回空数组
    return [];
  }
}
