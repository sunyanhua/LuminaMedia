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
import { AnalyticsService } from '../services/analytics.service';
import { TrackBehaviorDto } from '../dto/track-behavior.dto';
import { DateRange } from '../interfaces/date-range.interface';
import { DateRangeDto } from '../dto/date-range.dto';

@Controller('v1/analytics/behavior')
export class UserBehaviorController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ transform: true }))
  async trackBehavior(@Body() trackBehaviorDto: TrackBehaviorDto) {
    // 在实际应用中，这里会调用服务层保存行为数据
    // 为演示目的，我们返回成功响应
    return {
      success: true,
      message: 'Behavior tracked successfully',
      data: {
        userId: trackBehaviorDto.userId,
        sessionId: trackBehaviorDto.sessionId,
        eventType: trackBehaviorDto.eventType,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get(':userId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUserBehavior(
    @Param('userId') userId: string,
    @Query() dateRangeDto: DateRangeDto,
  ) {
    const dateRange: DateRange = {
      startDate: dateRangeDto.startDate
        ? new Date(dateRangeDto.startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 默认最近30天
      endDate: dateRangeDto.endDate ? new Date(dateRangeDto.endDate) : new Date(),
    };

    const analysis = await this.analyticsService.analyzeUserBehavior(
      userId,
      dateRange,
    );

    return {
      success: true,
      data: analysis,
    };
  }

  @Get(':userId/summary')
  async getUserBehaviorSummary(@Param('userId') userId: string) {
    const engagementMetrics =
      await this.analyticsService.calculateEngagementMetrics(userId);

    return {
      success: true,
      data: {
        userId,
        engagementMetrics,
        summary: this.generateSummaryText(engagementMetrics),
      },
    };
  }

  private generateSummaryText(metrics: any): string {
    const score = metrics.engagementScore;
    let summary = '';

    if (score >= 80) {
      summary = `用户参与度很高（${score}分），内容创作频率为每周${metrics.contentCreationRate.toFixed(1)}次，登录频率每周${metrics.loginFrequency.toFixed(1)}次。`;
    } else if (score >= 60) {
      summary = `用户参与度中等（${score}分），建议增加内容创作和任务完成频率以提高参与度。`;
    } else if (score >= 40) {
      summary = `用户参与度较低（${score}分），需要采取措施提高用户活跃度。`;
    } else {
      summary = `用户参与度很低（${score}分），建议联系用户了解使用障碍。`;
    }

    return summary;
  }
}
