import { Controller, Get, Post, Param, Query, HttpCode } from '@nestjs/common';
import { ReportService } from '../services/report.service';

@Controller('api/v1/analytics/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('behavior/:userId')
  async generateBehaviorReport(@Param('userId') userId: string) {
    try {
      const report = await this.reportService.generateBehaviorReport(userId);

      return {
        success: true,
        message: 'Behavior report generated successfully',
        data: report,
        exportOptions: {
          json: `/api/v1/analytics/reports/behavior/${userId}/export?format=json`,
          pdf: `/api/v1/analytics/reports/behavior/${userId}/export?format=pdf`,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to generate behavior report',
      };
    }
  }

  @Get('campaign/:campaignId')
  async generateCampaignReport(@Param('campaignId') campaignId: string) {
    try {
      const report =
        await this.reportService.generateCampaignReport(campaignId);

      return {
        success: true,
        message: 'Campaign report generated successfully',
        data: report,
        exportOptions: {
          json: `/api/v1/analytics/reports/campaign/${campaignId}/export?format=json`,
          pdf: `/api/v1/analytics/reports/campaign/${campaignId}/export?format=pdf`,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to generate campaign report',
      };
    }
  }

  @Post('export/:reportType/:id')
  @HttpCode(200)
  async exportReport(
    @Param('reportType') reportType: 'behavior' | 'campaign',
    @Param('id') id: string,
    @Query('format') format: 'json' | 'pdf' = 'json',
  ) {
    try {
      // 生成报告ID
      const reportId = `${reportType}-${id}-${Date.now()}`;
      const exportResult = await this.reportService.exportReport(
        reportId,
        format,
      );

      return {
        success: true,
        message: `Report exported as ${format.toUpperCase()}`,
        data: exportResult,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to export report',
      };
    }
  }

  @Get('visualization/daily-activity')
  async getDailyActivityVisualization(
    @Query('userId') userId: string,
    @Query('days') days = 30,
  ) {
    // 简化版本：返回模拟图表数据
    const now = new Date();
    const data: Array<{ date: string; activity: number; events: number }> = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      data.push({
        date: dateStr,
        activity: Math.floor(Math.random() * 50) + 10,
        events: Math.floor(Math.random() * 20) + 5,
      });
    }

    return {
      success: true,
      data: {
        type: 'line',
        title: `最近${days}天活跃度趋势`,
        labels: data.map((d) => d.date),
        datasets: [
          {
            label: '活跃度',
            data: data.map((d) => d.activity),
            borderColor: 'rgb(75, 192, 192)',
          },
          {
            label: '事件数',
            data: data.map((d) => d.events),
            borderColor: 'rgb(255, 99, 132)',
          },
        ],
      },
    };
  }

  @Get('visualization/event-distribution')
  async getEventDistributionVisualization(@Query('userId') userId: string) {
    const events = [
      { event: 'PAGE_VIEW', count: 45, color: '#FF6384' },
      { event: 'CONTENT_CREATE', count: 25, color: '#36A2EB' },
      { event: 'PUBLISH_TASK', count: 15, color: '#FFCE56' },
      { event: 'LOGIN', count: 30, color: '#4BC0C0' },
      { event: 'LOGOUT', count: 30, color: '#9966FF' },
      { event: 'CAMPAIGN_CREATE', count: 5, color: '#FF9F40' },
    ];

    return {
      success: true,
      data: {
        type: 'pie',
        title: '事件类型分布',
        labels: events.map((e) => e.event),
        datasets: [
          {
            data: events.map((e) => e.count),
            backgroundColor: events.map((e) => e.color),
          },
        ],
      },
    };
  }
}
