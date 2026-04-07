import {
  Controller,
  Post,
  Body,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WechatContentGenerationService } from '../services/wechat-content-generation.service';
import { GenerateWechatArticleDto } from '../dto/generate-wechat-article.dto';

@ApiTags('微信公众号内容生成')
@Controller('v1/wechat-content-generation')
export class WechatContentGenerationController {
  constructor(
    private readonly wechatContentGenerationService: WechatContentGenerationService,
  ) {}

  @Post('generate/article')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: '生成微信公众号文章',
    description: '基于选题、素材和单位画像生成微信公众号文章',
  })
  @ApiResponse({
    status: 200,
    description: '生成成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        article: {
          type: 'object',
          properties: {
            title: { type: 'string', example: '文章标题' },
            content: { type: 'string', example: '文章正文内容...' },
            summary: { type: 'string', example: '文章摘要...' },
            titleOptions: {
              type: 'array',
              items: { type: 'string' },
              example: ['标题1', '标题2', '标题3'],
            },
            imageSuggestions: {
              type: 'array',
              items: { type: 'string' },
              example: ['配图建议1', '配图建议2'],
            },
            hashtags: {
              type: 'array',
              items: { type: 'string' },
              example: ['话题1', '话题2'],
            },
            estimatedReadingTime: { type: 'string', example: '5分钟' },
            wordCount: { type: 'number', example: 1200 },
            tone: { type: 'string', example: 'professional' },
            languageStyle: { type: 'string', example: 'formal' },
            metadata: {
              type: 'object',
              properties: {
                topicId: { type: 'string' },
                tenantId: { type: 'string' },
                userId: { type: 'string' },
                generatedAt: { type: 'string', format: 'date-time' },
                modelUsed: { type: 'string' },
                profileInfluenced: { type: 'boolean' },
                materialsUsed: { type: 'number' },
              },
            },
          },
        },
        processingTime: { type: 'number', example: 3456 },
        modelUsed: { type: 'string', example: 'gemini' },
        qualityAssessment: {
          type: 'object',
          properties: {
            score: { type: 'number', example: 85 },
            metrics: {
              type: 'object',
              properties: {
                readability: { type: 'number' },
                engagement: { type: 'number' },
                relevance: { type: 'number' },
                originality: { type: 'number' },
                platformFit: { type: 'number' },
              },
            },
            feedback: { type: 'string' },
            improvementSuggestions: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  @ApiResponse({
    status: 404,
    description: '选题不存在',
  })
  @ApiResponse({
    status: 500,
    description: '服务器内部错误',
  })
  async generateArticle(@Body() generateWechatArticleDto: GenerateWechatArticleDto) {
    try {
      const result = await this.wechatContentGenerationService.generateWechatArticle({
        topicId: generateWechatArticleDto.topicId,
        tenantId: generateWechatArticleDto.tenantId,
        userId: generateWechatArticleDto.userId,
        options: {
          tone: generateWechatArticleDto.tone,
          wordCount: generateWechatArticleDto.wordCount,
          includeImageSuggestions: generateWechatArticleDto.includeImageSuggestions,
          temperature: generateWechatArticleDto.temperature,
          maxTokens: generateWechatArticleDto.maxTokens,
          languageStyle: generateWechatArticleDto.languageStyle,
          visualPreference: generateWechatArticleDto.visualPreference,
        },
      });

      return {
        success: result.success,
        data: result.article,
        qualityAssessment: result.qualityAssessment,
        processingTime: result.processingTime,
        modelUsed: result.modelUsed,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONTROLLER_ERROR',
          message: error.message || '生成文章失败',
        },
      };
    }
  }

  @Post('generate/test')
  @HttpCode(200)
  @ApiOperation({
    summary: '测试内容生成',
    description: '使用测试数据生成文章，用于验证服务可用性',
  })
  async testGeneration() {
    try {
      // 使用测试数据
      const result = await this.wechatContentGenerationService.generateWechatArticle({
        topicId: 'test-topic-id',
        tenantId: 'default-tenant',
        userId: 'test-user-id',
        options: {
          tone: 'professional',
          wordCount: 800,
        },
      });

      return {
        success: result.success,
        data: result.article,
        error: result.error,
        message: result.success ? '测试生成成功' : '测试生成失败',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: error.message || '测试生成失败',
        },
      };
    }
  }
}