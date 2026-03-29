import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('data-collection')
@Controller('data-collection')
export class DataCollectionController {
  @Get('health')
  @ApiOperation({ summary: '数据采集服务健康检查' })
  healthCheck() {
    return { status: 'ok' };
  }

  @Get('tasks')
  @ApiOperation({ summary: '获取数据采集任务列表' })
  getTasks() {
    return [];
  }

  @Post('tasks')
  @ApiOperation({ summary: '创建数据采集任务' })
  createTask(@Body() task: any) {
    return { id: 'mock-id', ...task };
  }

  @Get('tasks/:taskId')
  @ApiOperation({ summary: '获取数据采集任务详情' })
  getTask(@Param('taskId') taskId: string) {
    return { id: taskId };
  }
}