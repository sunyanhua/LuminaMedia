import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { ContentGenerationService } from '../services/content-generation.service';
import { GeminiService } from '../services/gemini.service';
import { GenerateTextDto } from '../dto/generate-text.dto';
import { GenerateMarketingContentDto } from '../dto/generate-marketing-content.dto';
import { Platform } from '../../../shared/enums/platform.enum';

@Controller('api/v1/analytics/content-generation')
export class ContentGenerationController {
  constructor(
    private readonly contentGenerationService: ContentGenerationService,
    private readonly geminiService: GeminiService,
  ) {}

  /**
   * 生成单条文案
   */
  @Post('generate/text')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateText(@Body() generateTextDto: GenerateTextDto) {
    try {
      const result = await this.contentGenerationService.generateContent({
        prompt: generateTextDto.prompt,
        platform: generateTextDto.platform,
        tone: generateTextDto.tone,
        wordCount: generateTextDto.wordCount,
        includeHashtags: generateTextDto.includeHashtags,
        includeImageSuggestions: generateTextDto.includeImageSuggestions,
        temperature: generateTextDto.temperature,
        maxTokens: generateTextDto.maxTokens,
      });

      return {
        success: result.success,
        data: result.content,
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
          message: error.message || 'Failed to generate text',
        },
      };
    }
  }

  /**
   * 生成营销内容包
   */
  @Post('generate/marketing-content')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateMarketingContent(
    @Body() generateMarketingContentDto: GenerateMarketingContentDto,
  ) {
    try {
      // 这里需要获取 CampaignSummary，暂时使用模拟数据
      // 实际应用中应该从数据库获取活动信息
      const campaignSummary = {
        id: generateMarketingContentDto.campaignId,
        name: '营销活动', // 需要从数据库获取
        campaignType: 'ONLINE', // 默认值
        targetAudience: {},
        budget: 0,
        userId: 'system',
      };

      const result =
        await this.contentGenerationService.generateMarketingContent({
          campaignSummary: campaignSummary as any,
          targetPlatforms: generateMarketingContentDto.targetPlatforms,
          contentTypes: generateMarketingContentDto.contentTypes,
          tone: generateMarketingContentDto.tone,
          quantity: generateMarketingContentDto.quantity,
        });

      return {
        success: result.success,
        marketingContent: result.marketingContent,
        processingTime: result.processingTime,
        modelUsed: result.modelUsed,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONTROLLER_ERROR',
          message: error.message || 'Failed to generate marketing content',
        },
      };
    }
  }

  /**
   * 获取所有内容模板
   */
  @Get('templates')
  async getTemplates(@Query('platform') platform?: Platform) {
    try {
      let templates;
      if (platform) {
        templates =
          this.contentGenerationService.getTemplatesByPlatform(platform);
      } else {
        templates = this.contentGenerationService.getAllTemplates();
      }

      return {
        success: true,
        data: templates,
        count: templates.length,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONTROLLER_ERROR',
          message: error.message || 'Failed to get templates',
        },
      };
    }
  }

  /**
   * 检查 Gemini API 可用性
   */
  @Get('status')
  async getStatus() {
    const isAvailable = this.geminiService.isGeminiAvailable();
    return {
      success: true,
      data: {
        geminiAvailable: isAvailable,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
