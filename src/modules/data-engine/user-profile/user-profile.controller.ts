import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserProfileService, UserProfile4D } from './user-profile.service';

@ApiTags('用户画像')
@ApiBearerAuth()
@Controller('data-engine/user-profile')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get(':customerId')
  @ApiOperation({
    summary: '获取单个客户4维度画像',
    description: '根据客户ID获取完整的4维度用户画像数据',
  })
  @ApiResponse({ status: 200, description: '获取成功', type: Object })
  @ApiResponse({ status: 404, description: '客户不存在' })
  async getUserProfile(
    @Param('customerId') customerId: string,
  ): Promise<UserProfile4D> {
    return this.userProfileService.getUserProfile(customerId);
  }

  @Post('batch')
  @ApiOperation({
    summary: '批量获取客户画像',
    description: '批量获取多个客户的4维度用户画像数据',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  @HttpCode(HttpStatus.OK)
  async getBatchUserProfiles(
    @Body() body: { customerIds: string[] },
  ): Promise<Record<string, UserProfile4D>> {
    return this.userProfileService.getBatchUserProfiles(body.customerIds);
  }

  @Post('filter')
  @ApiOperation({
    summary: '根据画像维度筛选客户',
    description: '根据4维度画像条件筛选符合条件的客户',
  })
  @ApiResponse({ status: 200, description: '筛选成功' })
  @HttpCode(HttpStatus.OK)
  async filterCustomersByProfile(
    @Body() filters: Partial<UserProfile4D>,
  ): Promise<{ customerIds: string[] }> {
    const customerIds =
      await this.userProfileService.filterCustomersByProfile(filters);
    return { customerIds };
  }

  @Get('summary')
  @ApiOperation({
    summary: '获取画像统计摘要',
    description: '获取客户画像各维度的统计摘要信息',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProfileSummary(@Query('customerIds') customerIds?: string): Promise<{
    basicLifecycle: Record<string, number>;
    consumptionPersonality: Record<string, number>;
    realtimeStatus: Record<string, number>;
    socialActivity: Record<string, number>;
    totalCustomers: number;
  }> {
    const ids = customerIds ? customerIds.split(',') : undefined;
    return this.userProfileService.getProfileSummary(ids);
  }

  @Get('dimensions/basic-lifecycle')
  @ApiOperation({
    summary: '获取基础生命周期维度分布',
    description: '获取基础生命周期维度各字段的分布情况',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getBasicLifecycleDistribution(): Promise<Record<string, number>> {
    // TODO: 实现维度分布统计
    return {};
  }

  @Get('dimensions/consumption-personality')
  @ApiOperation({
    summary: '获取消费性格维度分布',
    description: '获取消费性格维度各字段的分布情况',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getConsumptionPersonalityDistribution(): Promise<
    Record<string, number>
  > {
    // TODO: 实现维度分布统计
    return {};
  }

  @Get('dimensions/realtime-status')
  @ApiOperation({
    summary: '获取实时状态维度分布',
    description: '获取实时状态维度各字段的分布情况',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRealtimeStatusDistribution(): Promise<Record<string, number>> {
    // TODO: 实现维度分布统计
    return {};
  }

  @Get('dimensions/social-activity')
  @ApiOperation({
    summary: '获取社交与活动维度分布',
    description: '获取社交与活动维度各字段的分布情况',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSocialActivityDistribution(): Promise<Record<string, number>> {
    // TODO: 实现维度分布统计
    return {};
  }

  @Post('compare')
  @ApiOperation({
    summary: '画像对比分析',
    description: '对比多个客户画像的相似性和差异性',
  })
  @ApiResponse({ status: 200, description: '对比成功' })
  @HttpCode(HttpStatus.OK)
  async compareProfiles(
    @Body() body: { customerIds: string[]; dimensions?: string[] },
  ): Promise<{
    similarities: Record<string, number>;
    differences: Record<string, any>;
    recommendations: string[];
  }> {
    // TODO: 实现画像对比分析
    return {
      similarities: {},
      differences: {},
      recommendations: [],
    };
  }
}
