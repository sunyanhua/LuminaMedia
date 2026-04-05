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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { ReferenceInfoService, ReferenceInfoQueryOptions } from '../services/reference-info.service';
import { ReferenceCrawlerService } from '../services/reference-crawler.service';
import { ReferenceInfo, ReferenceInfoStatus } from '../../../entities/reference-info.entity';

// 请求和响应DTO
class CreateReferenceInfoDto {
  title: string;
  summary?: string;
  content?: string;
  sourceUrl?: string;
  sourceName?: string;
  publishTime?: Date;
  category?: string;
  keywords?: string[];
  metadata?: Record<string, any>;
}

class UpdateReferenceInfoDto {
  title?: string;
  summary?: string;
  content?: string;
  category?: string;
  keywords?: string[];
  metadata?: Record<string, any>;
}

class AdoptReferenceInfoDto {
  userId: string;
}

class ModifyReferenceInfoDto {
  userId: string;
  notes: string;
  generatedContent?: string;
}

class IgnoreReferenceInfoDto {
  reason?: string;
}

class CrawlTriggerResponse {
  success: boolean;
  message: string;
  count: number;
}

@ApiTags('参考信息')
@Controller('reference-infos')
export class ReferenceInfoController {
  constructor(
    private readonly referenceInfoService: ReferenceInfoService,
    private readonly referenceCrawlerService: ReferenceCrawlerService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取参考信息列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', type: Number })
  @ApiQuery({ name: 'status', required: false, description: '状态筛选', enum: ReferenceInfoStatus })
  @ApiQuery({ name: 'category', required: false, description: '分类筛选', type: String })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词搜索', type: String })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期', type: Date })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期', type: Date })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段', enum: ['publishTime', 'relevance', 'createdAt'] })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序顺序', enum: ['ASC', 'DESC'] })
  @ApiOkResponse({ description: '返回参考信息列表' })
  async findAll(@Query() query: ReferenceInfoQueryOptions) {
    return await this.referenceInfoService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取参考信息详情' })
  @ApiParam({ name: 'id', description: '参考信息ID' })
  @ApiOkResponse({ description: '返回参考信息详情' })
  @ApiResponse({ status: 404, description: '参考信息不存在' })
  async findOne(@Param('id') id: string) {
    return await this.referenceInfoService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建参考信息' })
  @ApiBody({ type: CreateReferenceInfoDto })
  @ApiCreatedResponse({ description: '参考信息创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createDto: CreateReferenceInfoDto) {
    return await this.referenceInfoService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新参考信息' })
  @ApiParam({ name: 'id', description: '参考信息ID' })
  @ApiBody({ type: UpdateReferenceInfoDto })
  @ApiOkResponse({ description: '参考信息更新成功' })
  @ApiResponse({ status: 404, description: '参考信息不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateReferenceInfoDto,
  ) {
    return await this.referenceInfoService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除参考信息' })
  @ApiParam({ name: 'id', description: '参考信息ID' })
  @ApiNoContentResponse({ description: '删除成功' })
  @ApiResponse({ status: 404, description: '参考信息不存在' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.referenceInfoService.delete(id);
  }

  @Post(':id/adopt')
  @ApiOperation({ summary: '采用参考信息' })
  @ApiParam({ name: 'id', description: '参考信息ID' })
  @ApiBody({ type: AdoptReferenceInfoDto })
  @ApiOkResponse({ description: '采用成功' })
  @ApiResponse({ status: 404, description: '参考信息不存在' })
  async adopt(
    @Param('id') id: string,
    @Body() adoptDto: AdoptReferenceInfoDto,
  ) {
    return await this.referenceInfoService.markAsAdopted(id, adoptDto.userId);
  }

  @Post(':id/generate')
  @ApiOperation({ summary: '生成修改后内容' })
  @ApiParam({ name: 'id', description: '参考信息ID' })
  @ApiBody({ type: ModifyReferenceInfoDto })
  @ApiOkResponse({ description: '生成成功', type: String })
  @ApiResponse({ status: 404, description: '参考信息不存在' })
  async generate(
    @Param('id') id: string,
    @Body() modifyDto: ModifyReferenceInfoDto,
  ) {
    const referenceInfo = await this.referenceInfoService.findById(id);
    const generatedContent = await this.referenceInfoService.generateModifiedContent(
      referenceInfo.content || '',
      modifyDto.notes,
    );
    return { content: generatedContent };
  }

  @Post(':id/modify')
  @ApiOperation({ summary: '修改后采用参考信息' })
  @ApiParam({ name: 'id', description: '参考信息ID' })
  @ApiBody({ type: ModifyReferenceInfoDto })
  @ApiOkResponse({ description: '修改后采用成功' })
  @ApiResponse({ status: 404, description: '参考信息不存在' })
  async modify(
    @Param('id') id: string,
    @Body() modifyDto: ModifyReferenceInfoDto,
  ) {
    let generatedContent = modifyDto.generatedContent;

    // 如果未提供生成内容，则调用AI生成
    if (!generatedContent) {
      const referenceInfo = await this.referenceInfoService.findById(id);
      generatedContent = await this.referenceInfoService.generateModifiedContent(
        referenceInfo.content || '',
        modifyDto.notes,
      );
    }

    return await this.referenceInfoService.markAsModified(
      id,
      modifyDto.userId,
      modifyDto.notes,
      generatedContent,
    );
  }

  @Post(':id/ignore')
  @ApiOperation({ summary: '忽略参考信息' })
  @ApiParam({ name: 'id', description: '参考信息ID' })
  @ApiBody({ type: IgnoreReferenceInfoDto })
  @ApiOkResponse({ description: '忽略成功' })
  @ApiResponse({ status: 404, description: '参考信息不存在' })
  async ignore(
    @Param('id') id: string,
    @Body() ignoreDto: IgnoreReferenceInfoDto,
  ) {
    return await this.referenceInfoService.markAsIgnored(id, ignoreDto.reason);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: '获取参考信息统计概览' })
  @ApiOkResponse({ description: '返回统计信息' })
  async getStats() {
    return await this.referenceInfoService.getStats();
  }

  @Post('crawl/trigger')
  @ApiOperation({ summary: '手动触发抓取' })
  @ApiOkResponse({ description: '抓取任务已触发', type: CrawlTriggerResponse })
  async triggerCrawl() {
    const result = await this.referenceCrawlerService.triggerManualCrawl();
    return result;
  }
}