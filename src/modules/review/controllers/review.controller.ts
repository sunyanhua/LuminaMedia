import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FeatureGuard } from '../../auth/guards/feature.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Feature } from '../../auth/decorators/feature.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ReviewService } from '../services/review.service';
import { ReviewRecord } from '../../../entities/review-record.entity';
import { SubmitReviewDto } from '../dto/submit-review.dto';

@ApiTags('审核管理')
@ApiBearerAuth()
@Controller('review')
@UseGuards(JwtAuthGuard, FeatureGuard, RolesGuard)
@Feature('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * 获取我的待审列表
   * 编辑、主管、法务、管理员可访问
   */
  @Get('pending')
  @Roles('EDITOR', 'MANAGER', 'LEGAL', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取我的待审列表',
    description: '获取当前用户需要审核的内容列表，根据用户角色自动筛选对应审核步骤',
  })
  @ApiQuery({ name: 'page', required: false, description: '页码，从1开始', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiResponse({ status: 200, description: '成功获取待审列表', type: Object })
  async getMyPendingReviews(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Request() req: any,
  ): Promise<{ records: ReviewRecord[]; total: number; page: number; limit: number }> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    const { records, total } = await this.reviewService.getMyPendingReviews(
      userId,
      tenantId,
      { page: Number(page), limit: Number(limit) },
    );

    return {
      records,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  /**
   * 获取我已审核列表
   * 编辑、主管、法务、管理员可访问
   */
  @Get('history')
  @Roles('EDITOR', 'MANAGER', 'LEGAL', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取我已审核列表',
    description: '获取当前用户已审核的历史记录',
  })
  @ApiQuery({ name: 'page', required: false, description: '页码，从1开始', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiResponse({ status: 200, description: '成功获取已审列表', type: Object })
  async getMyReviewedHistory(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Request() req: any,
  ): Promise<{ records: ReviewRecord[]; total: number; page: number; limit: number }> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    const { records, total } = await this.reviewService.getMyReviewedHistory(
      userId,
      tenantId,
      { page: Number(page), limit: Number(limit) },
    );

    return {
      records,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  /**
   * 获取内容审核追踪
   * 编辑、主管、法务、管理员可访问
   */
  @Get('content/:contentDraftId/history')
  @Roles('EDITOR', 'MANAGER', 'LEGAL', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取内容审核追踪',
    description: '获取指定内容草稿的完整审核历史记录',
  })
  @ApiParam({ name: 'contentDraftId', description: '内容草稿ID' })
  @ApiResponse({ status: 200, description: '成功获取审核历史', type: Object })
  async getContentReviewHistory(
    @Param('contentDraftId') contentDraftId: string,
    @Request() req: any,
  ): Promise<ReviewRecord[]> {
    const tenantId = req.user.tenantId;
    return await this.reviewService.getContentReviewHistory(contentDraftId, tenantId);
  }

  /**
   * 提交审核结果
   * 编辑、主管、法务、管理员可访问
   */
  @Post('submit')
  @Roles('EDITOR', 'MANAGER', 'LEGAL', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '提交审核结果',
    description: '提交对内容草稿的审核结果（通过或退回）',
  })
  @ApiResponse({ status: 200, description: '审核结果提交成功', type: ReviewRecord })
  async submitReview(
    @Body() submitReviewDto: SubmitReviewDto,
    @Request() req: any,
  ): Promise<ReviewRecord> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    return await this.reviewService.submitReviewResult(
      submitReviewDto.contentDraftId,
      userId,
      tenantId,
      submitReviewDto,
    );
  }

  /**
   * 创建初始审核记录（内部使用）
   * 编辑、管理员可访问
   */
  @Post('initialize')
  @Roles('EDITOR', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '创建初始审核记录',
    description: '当内容提交审核时创建初始审核记录（内部接口）',
  })
  @ApiResponse({ status: 201, description: '初始审核记录创建成功', type: ReviewRecord })
  async createInitialReviewRecord(
    @Query('contentDraftId') contentDraftId: string,
    @Request() req: any,
  ): Promise<ReviewRecord> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    if (!contentDraftId) {
      throw new BadRequestException('contentDraftId参数不能为空');
    }

    return await this.reviewService.createInitialReviewRecord(
      contentDraftId,
      tenantId,
      userId,
    );
  }
}