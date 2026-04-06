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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FeatureGuard } from '../../auth/guards/feature.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Feature } from '../../auth/decorators/feature.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ContentDraftService } from '../services/content-draft.service';
import { ContentDraft, ContentStatus } from '../../../entities/content-draft.entity';
import { ContentDraftFilterDto } from '../dto/content-draft-filter.dto';

@ApiTags('内容草稿管理')
@ApiBearerAuth()
@Controller('content-drafts')
@UseGuards(JwtAuthGuard, FeatureGuard, RolesGuard)
@Feature('content-draft')
export class ContentDraftController {
  constructor(private readonly contentDraftService: ContentDraftService) {}

  /**
   * 创建内容草稿
   * 编辑、管理员可访问
   */
  @Post()
  @Roles('EDITOR', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '创建内容草稿',
    description: '创建新的内容草稿',
  })
  @ApiResponse({ status: 201, description: '草稿创建成功', type: ContentDraft })
  async create(
    @Body() draftData: Partial<ContentDraft>,
    @Request() req: any,
  ): Promise<ContentDraft> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    return await this.contentDraftService.create(draftData, userId, tenantId);
  }

  /**
   * 更新内容草稿
   * 编辑、管理员可访问
   */
  @Put(':id')
  @Roles('EDITOR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新内容草稿',
    description: '更新指定的内容草稿',
  })
  @ApiParam({ name: 'id', description: '草稿ID' })
  @ApiResponse({ status: 200, description: '草稿更新成功', type: ContentDraft })
  async update(
    @Param('id') id: string,
    @Body() draftData: Partial<ContentDraft>,
    @Request() req: any,
  ): Promise<ContentDraft> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    return await this.contentDraftService.update(id, draftData, userId, tenantId);
  }

  /**
   * 获取草稿详情
   * 所有登录用户可访问
   */
  @Get(':id')
  @Roles('EDITOR', 'MANAGER', 'LEGAL', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取草稿详情',
    description: '获取指定内容草稿的详细信息',
  })
  @ApiParam({ name: 'id', description: '草稿ID' })
  @ApiResponse({ status: 200, description: '成功获取草稿详情', type: ContentDraft })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ContentDraft> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    return await this.contentDraftService.findOne(id, userId, tenantId);
  }

  /**
   * 获取草稿列表
   * 所有登录用户可访问
   */
  @Get()
  @Roles('EDITOR', 'MANAGER', 'LEGAL', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取草稿列表',
    description: '获取当前用户的内容草稿列表，支持分页、状态筛选、关键词搜索、时间范围筛选',
  })
  @ApiQuery({ name: 'status', required: false, description: '草稿状态筛选', enum: ContentStatus })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词搜索（标题或内容）' })
  @ApiQuery({ name: 'createdBy', required: false, description: '按创建人ID筛选' })
  @ApiQuery({ name: 'startDate', required: false, description: '按创建时间起始筛选（ISO日期字符串）' })
  @ApiQuery({ name: 'endDate', required: false, description: '按创建时间结束筛选（ISO日期字符串）' })
  @ApiQuery({ name: 'page', required: false, description: '页码，从1开始', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiResponse({ status: 200, description: '成功获取草稿列表', type: Object })
  async findAll(
    @Query() filter: ContentDraftFilterDto,
    @Request() req: any,
  ): Promise<{ drafts: ContentDraft[]; total: number; page: number; limit: number }> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    const { drafts, total } = await this.contentDraftService.findAllWithFilter(userId, tenantId, {
      status: filter.status,
      keyword: filter.keyword,
      createdBy: filter.createdBy,
      startDate: filter.startDate,
      endDate: filter.endDate,
      page: filter.page,
      limit: filter.limit,
    });

    return {
      drafts,
      total,
      page: filter.page || 1,
      limit: filter.limit || 20,
    };
  }

  /**
   * 提交审核
   * 编辑、管理员可访问
   */
  @Post(':id/submit')
  @Roles('EDITOR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '提交审核',
    description: '将内容草稿提交到三审三校流程',
  })
  @ApiParam({ name: 'id', description: '草稿ID' })
  @ApiResponse({ status: 200, description: '提交审核成功', type: ContentDraft })
  async submitForReview(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ContentDraft> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    return await this.contentDraftService.submitForReview(id, userId, tenantId);
  }

  /**
   * 撤回修改（审核通过前可撤回）
   * 编辑、管理员可访问
   */
  @Post(':id/withdraw')
  @Roles('EDITOR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '撤回修改',
    description: '在审核通过前撤回内容草稿，状态变回草稿',
  })
  @ApiParam({ name: 'id', description: '草稿ID' })
  @ApiResponse({ status: 200, description: '撤回成功', type: ContentDraft })
  async withdraw(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ContentDraft> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    return await this.contentDraftService.withdraw(id, userId, tenantId);
  }

  /**
   * 检查内容合规性
   * 编辑、管理员可访问
   */
  @Post(':id/check-compliance')
  @Roles('EDITOR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '检查内容合规性',
    description: '检查内容草稿的合规性（敏感词、字数等）',
  })
  @ApiParam({ name: 'id', description: '草稿ID' })
  @ApiResponse({ status: 200, description: '合规性检查完成', type: Object })
  async checkCompliance(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{
    sensitiveWords: string[];
    wordCount: number;
    formatValid: boolean;
  }> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    const draft = await this.contentDraftService.findOne(id, userId, tenantId);
    return await this.contentDraftService.checkContentCompliance(draft.content);
  }

  /**
   * 删除草稿
   * 编辑、管理员可访问
   */
  @Delete(':id')
  @Roles('EDITOR', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '删除草稿',
    description: '删除指定的内容草稿',
  })
  @ApiParam({ name: 'id', description: '草稿ID' })
  @ApiResponse({ status: 204, description: '草稿删除成功' })
  async delete(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    await this.contentDraftService.delete(id, userId, tenantId);
  }

  /**
   * 获取待发文章列表（状态为APPROVED）
   * 所有登录用户可访问
   */
  @Get('approved-for-publishing')
  @Roles('EDITOR', 'MANAGER', 'LEGAL', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取待发文章列表',
    description: '获取当前租户下已通过审核（APPROVED状态）的文章列表，支持分页和排序',
  })
  @ApiQuery({ name: 'page', required: false, description: '页码，从1开始', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiQuery({ name: 'orderBy', required: false, description: '排序字段', enum: ['publishOrder', 'createdAt', 'updatedAt'] })
  @ApiQuery({ name: 'orderDirection', required: false, description: '排序方向', enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: '成功获取待发文章列表', type: Object })
  async getApprovedForPublishing(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('orderBy') orderBy: 'publishOrder' | 'createdAt' | 'updatedAt',
    @Query('orderDirection') orderDirection: 'ASC' | 'DESC',
    @Request() req: any,
  ): Promise<{ drafts: ContentDraft[]; total: number; page: number; limit: number }> {
    const tenantId = req.user.tenantId;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const skip = (pageNum - 1) * limitNum;

    const { drafts, total } = await this.contentDraftService.findApprovedForPublishing(tenantId, {
      skip,
      take: limitNum,
      orderBy,
      orderDirection,
    });

    return {
      drafts,
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  /**
   * 更新发布顺序
   * 编辑、管理员可访问
   */
  @Put('publish-order')
  @Roles('EDITOR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新发布顺序',
    description: '批量更新文章的发布顺序（拖拽排序）',
  })
  @ApiResponse({ status: 200, description: '发布顺序更新成功' })
  async updatePublishOrder(
    @Body() body: { draftIds: string[] },
    @Request() req: any,
  ): Promise<void> {
    const tenantId = req.user.tenantId;
    await this.contentDraftService.updatePublishOrder(tenantId, body.draftIds);
  }

  /**
   * 发布单个文章
   * 管理员可访问
   */
  @Post(':id/publish')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '发布文章',
    description: '发布指定的文章（DEMO版模拟）',
  })
  @ApiParam({ name: 'id', description: '草稿ID' })
  @ApiResponse({ status: 200, description: '发布成功', type: ContentDraft })
  async publish(
    @Param('id') id: string,
    @Body() body: { scheduledAt?: Date },
    @Request() req: any,
  ): Promise<ContentDraft> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    return await this.contentDraftService.publishDraft(id, tenantId, userId, {
      scheduledAt: body.scheduledAt,
    });
  }

  /**
   * 批量发布
   * 管理员可访问
   */
  @Post('batch-publish')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '批量发布',
    description: '批量发布多篇文章（DEMO版模拟）',
  })
  @ApiResponse({ status: 200, description: '批量发布结果' })
  async batchPublish(
    @Body() body: { draftIds: string[] },
    @Request() req: any,
  ): Promise<{ success: string[]; failed: Array<{ id: string; reason: string }> }> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    return await this.contentDraftService.batchPublish(body.draftIds, tenantId, userId);
  }
}