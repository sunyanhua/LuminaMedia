import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketingCampaign } from '../entities/marketing-campaign.entity';
import { AnalyticsService } from '../services/analytics.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { CampaignStatus } from '../../../shared/enums/campaign-status.enum';
import { MarketingCampaignRepository } from '../../../shared/repositories/marketing-campaign.repository';

@Controller('api/v1/analytics/campaigns')
export class MarketingCampaignController {
  constructor(
    @InjectRepository(MarketingCampaignRepository)
    private campaignRepository: MarketingCampaignRepository,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    const campaign = this.campaignRepository.create({
      ...createCampaignDto,
      status: CampaignStatus.DRAFT,
      createdAt: new Date(),
    });

    const savedCampaign = await this.campaignRepository.save(campaign);

    return {
      success: true,
      message: 'Campaign created successfully',
      data: savedCampaign,
    };
  }

  @Get()
  async getCampaigns(
    @Query('userId') userId?: string,
    @Query('status') status?: CampaignStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    const [campaigns, total] = await this.campaignRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: {
        campaigns,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  @Get(':id')
  async getCampaign(@Param('id') id: string) {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['strategies'],
    });

    if (!campaign) {
      return {
        success: false,
        message: `Campaign ${id} not found`,
      };
    }

    return {
      success: true,
      data: campaign,
    };
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCampaign(
    @Param('id') id: string,
    @Body() updateData: Partial<MarketingCampaign>,
  ) {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
    });

    if (!campaign) {
      return {
        success: false,
        message: `Campaign ${id} not found`,
      };
    }

    // 不允许更新 ID 和 createdAt
    const { id: _, createdAt: __, ...safeUpdateData } = updateData;

    Object.assign(campaign, safeUpdateData);
    const updatedCampaign = await this.campaignRepository.save(campaign);

    return {
      success: true,
      message: 'Campaign updated successfully',
      data: updatedCampaign,
    };
  }

  @Post(':id/analyze')
  async analyzeCampaign(@Param('id') id: string) {
    try {
      const insights = await this.analyticsService.generateCampaignInsights(id);

      return {
        success: true,
        message: 'Campaign analysis completed',
        data: insights,
        recommendations: this.generateRecommendations(insights),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to analyze campaign',
      };
    }
  }

  private generateRecommendations(insights: any): string[] {
    const recommendations: string[] = [];

    if (insights.totalStrategies === 0) {
      recommendations.push('建议为活动创建营销策略');
    }

    if (insights.averageConfidenceScore < 70) {
      recommendations.push('策略置信度较低，建议进一步优化或进行测试');
    }

    if (insights.estimatedTotalROI < 30) {
      recommendations.push('预期 ROI 较低，建议调整策略或预算分配');
    }

    if (insights.completionRate === 0) {
      recommendations.push('活动尚未完成，建议设置明确的时间节点和目标');
    }

    if (recommendations.length === 0) {
      recommendations.push('活动表现良好，继续保持当前策略');
    }

    return recommendations;
  }
}
