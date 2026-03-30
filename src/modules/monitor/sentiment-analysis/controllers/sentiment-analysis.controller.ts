import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

import { SentimentAnalysisService } from '../services/sentiment-analysis.service';
import {
  SentimentAnalysisRequest,
  SentimentResult,
  SentimentTrendAnalysis,
  SentimentAlertRule,
  SentimentAlert,
} from '../interfaces/sentiment-analysis.interface';

// DTOs for API requests/responses
class SentimentAnalysisRequestDto implements SentimentAnalysisRequest {
  text: string;
  platform?: string;
  industry?: string;
  target?: string;
}

class BatchSentimentAnalysisRequestDto {
  requests: SentimentAnalysisRequestDto[];
}

class SentimentTrendRequestDto {
  texts: Array<{ text: string; timestamp: string }>;
  timeInterval?: 'hour' | 'day' | 'week' | 'month';
  industry?: string;
}

class AlertCheckRequestDto {
  texts: Array<{ text: string; timestamp: string }>;
  rules: SentimentAlertRule[];
}

@ApiTags('sentiment-analysis')
@Controller('sentiment-analysis')
export class SentimentAnalysisController {
  constructor(private readonly sentimentService: SentimentAnalysisService) {}

  @Post('analyze')
  @ApiOperation({ summary: '分析单个文本的情感' })
  @ApiBody({ type: SentimentAnalysisRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '情感分析结果',
    type: Object, // Would need proper DTO for SentimentResult
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数无效',
  })
  async analyzeText(
    @Body() request: SentimentAnalysisRequestDto,
  ): Promise<SentimentResult> {
    try {
      return await this.sentimentService.analyzeText(request);
    } catch (error) {
      throw new HttpException(
        `情感分析失败: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('analyze-batch')
  @ApiOperation({ summary: '批量分析文本情感' })
  @ApiBody({ type: BatchSentimentAnalysisRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '批量情感分析结果',
    type: Array, // Would need proper DTO for SentimentResult[]
  })
  async analyzeTexts(
    @Body() request: BatchSentimentAnalysisRequestDto,
  ): Promise<SentimentResult[]> {
    try {
      return await this.sentimentService.analyzeTexts(request.requests);
    } catch (error) {
      throw new HttpException(
        `批量情感分析失败: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('analyze-trend')
  @ApiOperation({ summary: '分析情感趋势' })
  @ApiBody({ type: SentimentTrendRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '情感趋势分析结果',
    type: Object, // Would need proper DTO for SentimentTrendAnalysis
  })
  async analyzeTrend(
    @Body() request: SentimentTrendRequestDto,
  ): Promise<SentimentTrendAnalysis> {
    try {
      // 转换时间戳字符串为Date对象
      const textsWithDates = request.texts.map((item) => ({
        text: item.text,
        timestamp: new Date(item.timestamp),
      }));

      return await this.sentimentService.analyzeTrend(textsWithDates, {
        timeInterval: request.timeInterval,
        industry: request.industry,
      });
    } catch (error) {
      throw new HttpException(
        `情感趋势分析失败: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('check-alerts')
  @ApiOperation({ summary: '检查情感预警' })
  @ApiBody({ type: AlertCheckRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '情感预警检查结果',
    type: Array, // Would need proper DTO for SentimentAlert[]
  })
  async checkAlerts(
    @Body() request: AlertCheckRequestDto,
  ): Promise<SentimentAlert[]> {
    try {
      // 转换时间戳字符串为Date对象
      const textsWithDates = request.texts.map((item) => ({
        text: item.text,
        timestamp: new Date(item.timestamp),
      }));

      return await this.sentimentService.checkAlerts(
        textsWithDates,
        request.rules,
      );
    } catch (error) {
      throw new HttpException(
        `预警检查失败: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('health')
  @ApiOperation({ summary: '情感分析服务健康检查' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '服务健康状态',
  })
  async healthCheck(): Promise<{ status: string; providers: any }> {
    try {
      const providersHealth = await this.sentimentService.getProvidersHealth();

      // 检查是否有可用的提供商
      const hasHealthyProvider = Object.values(providersHealth).some(
        (health) => health.healthy,
      );

      return {
        status: hasHealthyProvider ? 'healthy' : 'unhealthy',
        providers: providersHealth,
      };
    } catch (error) {
      throw new HttpException(
        `健康检查失败: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('providers')
  @ApiOperation({ summary: '获取可用的情感分析提供商' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '提供商列表',
  })
  async getProviders(): Promise<{ providers: string[] }> {
    // 这里可以返回实际的提供商信息
    return {
      providers: ['lexicon', 'gemini'],
    };
  }

  @Post('test')
  @ApiOperation({ summary: '测试情感分析功能' })
  @ApiBody({ type: SentimentAnalysisRequestDto })
  async testAnalysis(
    @Body() request: SentimentAnalysisRequestDto,
  ): Promise<{ success: boolean; result?: SentimentResult; error?: string }> {
    try {
      const result = await this.sentimentService.analyzeText(request);
      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
