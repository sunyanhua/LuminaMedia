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
import { TopicService, TopicRecommendation } from '../services/topic.service';
import { Topic, TopicSource, TopicStatus } from '../../../entities/topic.entity';

@ApiTags('选题管理')
@ApiBearerAuth()
@Controller('topics')
@UseGuards(JwtAuthGuard, FeatureGuard, RolesGuard)
@Feature('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  /**
   * 获取AI选题推荐
   */
  @Get('recommendations')
  @Roles('EDITOR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取AI选题推荐',
    description: '基于参考信息和知识库分析生成3-5个选题建议',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取选题推荐',
    schema: {
      type: 'object',
      properties: {
        recommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', example: '优化营商环境新政策解读' },
              description: { type: 'string', example: '解读最新出台的营商环境优化措施' },
              reason: { type: 'string', example: '政策热点，企业关注度高' },
            },
          },
        },
      },
    },
  })
  async getRecommendations(@Request() req: any): Promise<{ recommendations: TopicRecommendation[] }> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    const recommendations = await this.topicService.getRecommendedTopics(tenantId, userId);

    return { recommendations };
  }

  /**
   * 刷新选题推荐
   */
  @Post('recommendations/refresh')
  @Roles('EDITOR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '刷新选题推荐',
    description: '根据用户反馈重新生成选题建议',
  })
  @ApiResponse({ status: 200, description: '成功刷新选题推荐' })
  async refreshRecommendations(
    @Body() body: { feedback?: string },
    @Request() req: any,
  ): Promise<{ recommendations: TopicRecommendation[] }> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    const recommendations = await this.topicService.refreshRecommendations(
      tenantId,
      userId,
      body.feedback,
    );

    return { recommendations };
  }

  /**
   * 创建选题
   */
  @Post()
  @Roles('EDITOR', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '创建选题',
    description: '手动创建新选题或从推荐中选择创建',
  })
  @ApiResponse({ status: 201, description: '选题创建成功', type: Topic })
  async createTopic(
    @Body() body: { title: string; description?: string; source?: TopicSource },
    @Request() req: any,
  ): Promise<Topic> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    return await this.topicService.createTopic(tenantId, userId, body);
  }

  /**
   * 获取选题列表
   */
  @Get()
  @Roles('EDITOR', 'MANAGER', 'LEGAL', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取选题列表',
    description: '获取当前用户的选题列表，支持分页和状态筛选',
  })
  @ApiQuery({ name: 'status', required: false, enum: TopicStatus, description: '选题状态筛选' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiResponse({ status: 200, description: '成功获取选题列表' })
  async getTopics(
    @Query('status') status?: TopicStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Request() req: any,
  ): Promise<{ topics: Topic[]; total: number; page: number; limit: number }> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    const { topics, total } = await this.topicService.getTopics(tenantId, userId, {
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    return {
      topics,
      total,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    };
  }

  /**
   * 获取选题详情
   */
  @Get(':id')
  @Roles('EDITOR', 'MANAGER', 'LEGAL', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取选题详情', description: '获取指定选题的详细信息' })
  @ApiParam({ name: 'id', description: '选题ID' })
  @ApiResponse({ status: 200, description: '成功获取选题详情', type: Topic })
  @ApiResponse({ status: 404, description: '选题不存在' })
  async getTopicById(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<Topic> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    return await this.topicService.getTopicById(id, tenantId, userId);
  }

  /**
   * 更新选题
   */
  @Put(':id')
  @Roles('EDITOR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新选题', description: '更新指定选题的信息' })
  @ApiParam({ name: 'id', description: '选题ID' })
  @ApiResponse({ status: 200, description: '选题更新成功', type: Topic })
  @ApiResponse({ status: 404, description: '选题不存在' })
  async updateTopic(
    @Param('id') id: string,
    @Body() body: Partial<Topic>,
    @Request() req: any,
  ): Promise<Topic> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    return await this.topicService.updateTopic(id, tenantId, userId, body);
  }

  /**
   * 删除选题
   */
  @Delete(':id')
  @Roles('EDITOR', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除选题', description: '删除指定的选题' })
  @ApiParam({ name: 'id', description: '选题ID' })
  @ApiResponse({ status: 204, description: '选题删除成功' })
  @ApiResponse({ status: 404, description: '选题不存在' })
  async deleteTopic(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    await this.topicService.deleteTopic(id, tenantId, userId);
  }
}
