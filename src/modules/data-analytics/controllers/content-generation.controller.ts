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

@Controller('v1/content-generation')
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
    console.log('Received DTO:', JSON.stringify(generateMarketingContentDto));
    try {
      // 使用前端传递的真实数据构建 CampaignSummary
      // 注意：DTO 中的 startDate 和 endDate 是字符串，需要转换为 Date 对象
      const campaignSummary = {
        id: generateMarketingContentDto.campaignId,
        name: generateMarketingContentDto.campaignName,
        campaignType: generateMarketingContentDto.campaignType,
        targetAudience: generateMarketingContentDto.targetAudience,
        budget: generateMarketingContentDto.budget,
        userId: generateMarketingContentDto.userId,
        startDate: generateMarketingContentDto.startDate
          ? new Date(generateMarketingContentDto.startDate)
          : undefined,
        endDate: generateMarketingContentDto.endDate
          ? new Date(generateMarketingContentDto.endDate)
          : undefined,
      };

      // 调试日志
      console.log(
        'Generated campaignSummary:',
        JSON.stringify(campaignSummary),
      );
      console.log(
        'DTO targetAudience:',
        generateMarketingContentDto.targetAudience,
      );

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
        service: 'content-generation',
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 检查 Gemini API 健康状态
   */
  @Get('health')
  async getHealth() {
    const health = await this.geminiService.checkGeminiHealth();
    return {
      success: health.available,
      data: {
        geminiAvailable: health.available,
        timestamp: new Date().toISOString(),
        error: health.error,
        details: health.details,
      },
    };
  }
}
