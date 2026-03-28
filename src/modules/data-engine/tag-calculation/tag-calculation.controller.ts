import {
  Controller,
  Post,
  Get,
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
import {
  TagCalculatorService,
  TagCalculationResult,
  TagDefinition,
} from './tag-calculation.service';

@ApiTags('标签计算')
@ApiBearerAuth()
@Controller('data-engine/tag-calculation')
@UseGuards(JwtAuthGuard)
export class TagCalculationController {
  constructor(private readonly tagCalculatorService: TagCalculatorService) {}

  @Post('calculate')
  @ApiOperation({
    summary: '执行标签计算',
    description: '执行离线标签计算，基于SQL模板系统批量计算用户标签',
  })
  @ApiResponse({ status: 200, description: '计算成功' })
  @ApiResponse({ status: 400, description: '请求参数无效' })
  @HttpCode(HttpStatus.OK)
  async calculateTags(
    @Body()
    body: {
      tagName?: string;
      forceRecalculate?: boolean;
      batchSize?: number;
    },
  ): Promise<TagCalculationResult> {
    const { tagName, forceRecalculate = false, batchSize } = body;
    return this.tagCalculatorService.calculateTags(tagName, forceRecalculate);
  }

  @Get('tags')
  @ApiOperation({
    summary: '获取所有标签定义',
    description: '获取系统支持的所有标签定义，包括SQL模板和刷新间隔',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTagDefinitions(): Promise<TagDefinition[]> {
    return this.tagCalculatorService.getTagDefinitions();
  }

  @Get('tags/:tagName')
  @ApiOperation({
    summary: '获取单个标签定义',
    description: '根据标签名称获取详细的标签定义信息',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '标签不存在' })
  async getTagDefinition(
    @Param('tagName') tagName: string,
  ): Promise<TagDefinition> {
    const definitions = this.tagCalculatorService.getTagDefinitions();
    const definition = definitions.find((def) => def.name === tagName);
    if (!definition) {
      throw new Error(`标签 ${tagName} 不存在`);
    }
    return definition;
  }

  @Get('status')
  @ApiOperation({
    summary: '获取标签计算状态',
    description: '获取各标签的最后计算时间和下次计算计划',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCalculationStatus(): Promise<{
    tags: Array<{
      name: string;
      lastCalculated?: Date;
      nextCalculation?: Date;
      refreshInterval: string;
      dependsOn: string[];
    }>;
    systemStatus: 'idle' | 'calculating' | 'error';
    lastCalculationTime?: Date;
    nextScheduledCalculation?: Date;
  }> {
    const definitions = this.tagCalculatorService.getTagDefinitions();
    return {
      tags: definitions.map((def) => ({
        name: def.name,
        lastCalculated: undefined, // TODO: 从数据库获取实际时间
        nextCalculation: undefined, // TODO: 基于refreshInterval计算
        refreshInterval: def.refreshInterval,
        dependsOn: def.dependsOn || [],
      })),
      systemStatus: 'idle',
      lastCalculationTime: undefined,
      nextScheduledCalculation: undefined,
    };
  }

  @Post('custom-tag')
  @ApiOperation({
    summary: '创建自定义标签',
    description: '创建自定义SQL标签模板，支持复杂业务规则',
  })
  @ApiResponse({ status: 200, description: '创建成功' })
  @ApiResponse({ status: 400, description: 'SQL模板无效' })
  @HttpCode(HttpStatus.CREATED)
  async createCustomTag(
    @Body()
    body: {
      name: string;
      description: string;
      sqlTemplate: string;
      refreshInterval: 'daily' | 'weekly' | 'monthly' | 'manual';
      parameters?: Record<string, any>;
      validationRules?: string[];
    },
  ): Promise<{ success: boolean; message: string; tagName: string }> {
    // TODO: 验证SQL模板语法
    // TODO: 存储自定义标签定义到数据库
    return {
      success: true,
      message: '自定义标签创建成功（待实现）',
      tagName: body.name,
    };
  }

  @Post('test-sql')
  @ApiOperation({
    summary: '测试SQL模板',
    description: '测试SQL模板语法的正确性和性能',
  })
  @ApiResponse({ status: 200, description: '测试完成' })
  @HttpCode(HttpStatus.OK)
  async testSqlTemplate(
    @Body() body: { sqlTemplate: string; sampleSize?: number },
  ): Promise<{
    valid: boolean;
    executionTime?: number;
    rowCount?: number;
    error?: string;
    sampleResults?: any[];
  }> {
    const { sqlTemplate, sampleSize = 10 } = body;

    // TODO: 执行SQL测试查询（有限制条件）
    // 使用EXPLAIN或LIMIT子句避免全表扫描

    return {
      valid: false,
      error: 'SQL测试功能待实现',
    };
  }
}
