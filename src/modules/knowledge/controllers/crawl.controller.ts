import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CrawlService } from '../services/crawl.service';
import { StartCrawlDto } from '../dto/start-crawl.dto';

@ApiTags('Crawl')
@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Post('start')
  @ApiOperation({ summary: '启动抓取任务' })
  @ApiResponse({ status: 201, description: '任务启动成功' })
  async startCrawl(@Body() dto: StartCrawlDto) {
    const result = await this.crawlService.startCrawlTask(
      dto.url,
      dto.mode,
      dto.category,
    );
    return result;
  }

  @Get(':taskId/status')
  @ApiOperation({ summary: '获取任务状态' })
  @ApiResponse({ status: 200, description: '任务状态' })
  async getTaskStatus(@Param('taskId') taskId: string) {
    const status = await this.crawlService.getTaskStatus(taskId);
    return status;
  }

  @Delete(':taskId')
  @ApiOperation({ summary: '取消任务' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async cancelTask(@Param('taskId') taskId: string) {
    const success = await this.crawlService.cancelTask(taskId);
    return { success };
  }

  @Get('tasks')
  @ApiOperation({ summary: '获取任务列表' })
  @ApiResponse({ status: 200, description: '任务列表' })
  async getTaskList(
    @Query('offset') offset: string = '0',
    @Query('limit') limit: string = '20',
  ) {
    const parsedOffset = parseInt(offset, 10);
    const parsedLimit = parseInt(limit, 10);
    const result = await this.crawlService.getTaskList(
      isNaN(parsedOffset) ? 0 : parsedOffset,
      isNaN(parsedLimit) ? 20 : parsedLimit,
    );
    return result;
  }
}
