import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { MockDataService } from '../services/mock-data.service';

@Controller('api/v1/analytics/mock')
export class MockDataController {
  constructor(private readonly mockDataService: MockDataService) {}

  @Post('generate')
  @HttpCode(201)
  async generateMockData(@Body('userId') userId: string) {
    if (!userId) {
      return {
        success: false,
        message: 'userId is required',
      };
    }

    try {
      const result = await this.mockDataService.generateMockData(userId);

      return {
        success: true,
        message: 'Mock data generated successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to generate mock data',
      };
    }
  }

  @Post('reset')
  async resetMockData(@Query('userId') userId?: string) {
    try {
      const result = await this.mockDataService.resetMockData(userId);

      return {
        success: true,
        message: userId
          ? `Mock data for user ${userId} reset successfully`
          : 'All mock data reset successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to reset mock data',
      };
    }
  }

  @Get('status')
  async getMockDataStatus() {
    try {
      const status = await this.mockDataService.getMockDataStatus();

      return {
        success: true,
        data: status,
        summary: this.generateStatusSummary(status),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get mock data status',
      };
    }
  }

  private generateStatusSummary(status: any): string {
    return `当前模拟数据：${status.totalBehaviors} 条行为记录，${status.totalCampaigns} 个营销活动，${status.totalStrategies} 个营销策略`;
  }
}
