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
  FieldMappingService,
  FieldMappingResult,
  StandardField,
} from './field-mapping.service';

@ApiTags('字段映射')
@ApiBearerAuth()
@Controller('data-engine/field-mapping')
@UseGuards(JwtAuthGuard)
export class FieldMappingController {
  constructor(private readonly fieldMappingService: FieldMappingService) {}

  @Post('map-headers')
  @ApiOperation({
    summary: '映射表头到标准字段',
    description: '使用AI自动识别非标Excel/API表头，转换为标准4维度字段',
  })
  @ApiResponse({ status: 200, description: '映射成功' })
  @ApiResponse({ status: 400, description: '请求参数无效' })
  @HttpCode(HttpStatus.OK)
  async mapHeaders(
    @Body()
    body: {
      headers: string[];
      industry?: string;
      dataSourceType?: 'excel' | 'csv' | 'api';
      sampleData?: Record<string, any>[];
    },
  ): Promise<FieldMappingResult> {
    const { headers, industry, dataSourceType, sampleData } = body;

    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      throw new Error('headers参数必须是非空数组');
    }

    return this.fieldMappingService.mapHeadersWithAI(headers, {
      industry,
      dataSourceType,
      sampleData,
    });
  }

  @Get('standard-fields')
  @ApiOperation({
    summary: '获取所有标准字段',
    description: '获取4维度共50+标准字段列表',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStandardFields(): Promise<StandardField[]> {
    return this.fieldMappingService.getAllStandardFields();
  }

  @Get('standard-fields/by-category')
  @ApiOperation({
    summary: '按分类获取标准字段',
    description: '按4维度分类组织标准字段',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStandardFieldsByCategory(): Promise<
    Record<string, StandardField[]>
  > {
    return this.fieldMappingService.getStandardFieldsByCategory();
  }

  @Post('manual-mapping')
  @ApiOperation({
    summary: '保存人工修正映射',
    description: '保存用户手动修正的字段映射规则',
  })
  @ApiResponse({ status: 200, description: '保存成功' })
  @ApiResponse({ status: 400, description: '无效的映射' })
  @HttpCode(HttpStatus.OK)
  async saveManualMapping(
    @Body()
    body: {
      sourceHeader: string;
      targetField: string;
      userId: string;
      notes?: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    const { sourceHeader, targetField, userId, notes } = body;

    if (!sourceHeader || !targetField || !userId) {
      throw new Error('sourceHeader, targetField, userId为必填参数');
    }

    this.fieldMappingService.saveManualMapping(
      sourceHeader,
      targetField,
      userId,
      notes,
    );

    return {
      success: true,
      message: '人工映射保存成功',
    };
  }

  @Get('mapping-stats')
  @ApiOperation({
    summary: '获取映射统计信息',
    description: '获取映射规则的学习和缓存统计信息',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMappingStats() {
    return this.fieldMappingService.getMappingStats();
  }

  @Post('validate-mapping')
  @ApiOperation({
    summary: '验证映射结果',
    description: '验证字段映射结果的准确性和完整性',
  })
  @ApiResponse({ status: 200, description: '验证完成' })
  @HttpCode(HttpStatus.OK)
  async validateMapping(
    @Body() body: { mapping: Record<string, string>; headers: string[] },
  ): Promise<{
    valid: boolean;
    issues: Array<{
      type: 'missing' | 'duplicate' | 'invalid' | 'low_confidence';
      description: string;
      suggestion?: string;
    }>;
    score: number; // 0-100评分
  }> {
    const { mapping, headers } = body;

    if (!mapping || !headers) {
      throw new Error('mapping和headers为必填参数');
    }

    // 验证逻辑
    const issues: Array<{
      type: 'missing' | 'duplicate' | 'invalid' | 'low_confidence';
      description: string;
      suggestion?: string;
    }> = [];
    let validCount = 0;

    // 检查缺失的映射
    const unmappedHeaders = headers.filter((h) => !mapping[h]);
    if (unmappedHeaders.length > 0) {
      issues.push({
        type: 'missing',
        description: `${unmappedHeaders.length}个表头未映射`,
        suggestion: `请为以下表头添加映射: ${unmappedHeaders.join(', ')}`,
      });
    } else {
      validCount++;
    }

    // 检查重复映射（多个表头映射到同一个字段）
    const targetFieldCount: Record<string, number> = {};
    Object.values(mapping).forEach((field) => {
      targetFieldCount[field] = (targetFieldCount[field] || 0) + 1;
    });

    const duplicateFields = Object.entries(targetFieldCount)
      .filter(([_, count]) => count > 1)
      .map(([field]) => field);

    if (duplicateFields.length > 0) {
      issues.push({
        type: 'duplicate',
        description: `${duplicateFields.length}个字段被多次映射`,
        suggestion: `以下字段被多次映射: ${duplicateFields.join(', ')}，建议检查映射准确性`,
      });
    } else {
      validCount++;
    }

    // 检查无效字段
    const standardFields = this.fieldMappingService.getAllStandardFields();
    const validFieldIds = new Set(standardFields.map((f) => f.id));
    const invalidMappings = Object.entries(mapping)
      .filter(([_, targetField]) => !validFieldIds.has(targetField))
      .map(
        ([sourceHeader, targetField]) => `${sourceHeader} -> ${targetField}`,
      );

    if (invalidMappings.length > 0) {
      issues.push({
        type: 'invalid',
        description: `${invalidMappings.length}个映射使用了无效字段`,
        suggestion: `无效映射: ${invalidMappings.join('; ')}`,
      });
    } else {
      validCount++;
    }

    // 计算评分
    const score = Math.round((validCount / 3) * 100);

    return {
      valid: issues.length === 0,
      issues,
      score,
    };
  }

  @Post('batch-process')
  @ApiOperation({
    summary: '批量处理表头映射',
    description: '批量处理多个文件的表头映射，支持批量确认和修正',
  })
  @ApiResponse({ status: 200, description: '处理成功' })
  @HttpCode(HttpStatus.OK)
  async batchProcess(
    @Body()
    body: {
      files: Array<{
        filename: string;
        headers: string[];
        industry?: string;
        dataSourceType?: 'excel' | 'csv' | 'api';
      }>;
      autoConfirm?: boolean;
    },
  ): Promise<{
    results: Array<{
      filename: string;
      mappingResult: FieldMappingResult;
      autoConfirmed: boolean;
      issues: string[];
    }>;
    summary: {
      totalFiles: number;
      mappedHeaders: number;
      totalHeaders: number;
      matchRate: number;
      averageConfidence: number;
    };
  }> {
    const { files, autoConfirm = false } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('files参数必须是非空数组');
    }

    const results: Array<{
      filename: string;
      mappingResult: FieldMappingResult;
      autoConfirmed: boolean;
      issues: string[];
    }> = [];
    let totalMappedHeaders = 0;
    let totalHeaders = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;

    for (const file of files) {
      const mappingResult = await this.fieldMappingService.mapHeadersWithAI(
        file.headers,
        {
          industry: file.industry,
          dataSourceType: file.dataSourceType,
        },
      );

      // 计算统计
      const mappedCount = Object.keys(mappingResult.mapping).length;
      totalMappedHeaders += mappedCount;
      totalHeaders += file.headers.length;

      // 计算平均置信度
      Object.values(mappingResult.confidence).forEach((confidence) => {
        totalConfidence += confidence;
        confidenceCount++;
      });

      const issues: string[] = [];
      if (mappingResult.unmatchedHeaders.length > 0) {
        issues.push(`${mappingResult.unmatchedHeaders.length}个表头未匹配`);
      }

      results.push({
        filename: file.filename,
        mappingResult,
        autoConfirmed: autoConfirm,
        issues,
      });
    }

    const averageConfidence =
      confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
    const matchRate = totalHeaders > 0 ? totalMappedHeaders / totalHeaders : 0;

    return {
      results,
      summary: {
        totalFiles: files.length,
        mappedHeaders: totalMappedHeaders,
        totalHeaders,
        matchRate,
        averageConfidence,
      },
    };
  }
}
