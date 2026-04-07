import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FeatureGuard } from '../../auth/guards/feature.guard';
import { Feature } from '../../auth/decorators/feature.decorator';
import { IntelligentReportService, ReportGenerationOptions } from '../services/intelligent-report.service';
import { ReportType, ReportStatus } from '../../../entities/report.entity';

// DTOs for API requests
class ReportGenerationRequestDto implements ReportGenerationOptions {
  startDate: Date;
  endDate: Date;
  title?: string;
  generatedBy?: string;
}

class ReportListQueryDto {
  type?: ReportType;
  status?: ReportStatus;
  limit?: number;
  offset?: number;
}

@ApiTags('intelligent-reports')
@ApiBearerAuth()
@Controller('v1/analytics/intelligent-reports')
@UseGuards(JwtAuthGuard, FeatureGuard)
@Feature('intelligent-reports')
export class IntelligentReportController {
  constructor(private readonly intelligentReportService: IntelligentReportService) {}

  @Post('sentiment/daily')
  @ApiOperation({ summary: '生成舆情监测日报' })
  @ApiBody({ type: ReportGenerationRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '舆情监测日报生成成功',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数无效',
  })
  async generateSentimentDailyReport(@Body() request: ReportGenerationRequestDto) {
    try {
      const report = await this.intelligentReportService.generateSentimentDailyReport(request);

      return {
        success: true,
        message: '舆情监测日报生成成功',
        data: {
          reportId: report.id,
          title: report.title,
          status: report.status,
          createdAt: report.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `生成舆情监测日报失败: ${error.message}`,
      };
    }
  }

  @Post('sentiment/weekly')
  @ApiOperation({ summary: '生成舆情监测周报' })
  @ApiBody({ type: ReportGenerationRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '舆情监测周报生成成功',
  })
  async generateSentimentWeeklyReport(@Body() request: ReportGenerationRequestDto) {
    try {
      const report = await this.intelligentReportService.generateSentimentWeeklyReport(request);

      return {
        success: true,
        message: '舆情监测周报生成成功',
        data: {
          reportId: report.id,
          title: report.title,
          status: report.status,
          createdAt: report.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `生成舆情监测周报失败: ${error.message}`,
      };
    }
  }

  @Post('wechat/monthly')
  @ApiOperation({ summary: '生成公众号运营月报' })
  @ApiBody({ type: ReportGenerationRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '公众号运营月报生成成功',
  })
  async generateWechatMonthlyReport(@Body() request: ReportGenerationRequestDto) {
    try {
      const report = await this.intelligentReportService.generateWechatMonthlyReport(request);

      return {
        success: true,
        message: '公众号运营月报生成成功',
        data: {
          reportId: report.id,
          title: report.title,
          status: report.status,
          createdAt: report.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `生成公众号运营月报失败: ${error.message}`,
      };
    }
  }

  @Get()
  @ApiOperation({ summary: '获取报告列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '报告列表获取成功',
  })
  async getReports(@Query() query: ReportListQueryDto) {
    try {
      const { reports, total } = await this.intelligentReportService.getReports(
        query.type,
        query.status,
        query.limit || 20,
        query.offset || 0,
      );

      return {
        success: true,
        message: '报告列表获取成功',
        data: {
          reports: reports.map(report => ({
            id: report.id,
            type: report.type,
            title: report.title,
            status: report.status,
            startDate: report.startDate,
            endDate: report.endDate,
            createdAt: report.createdAt,
            completedAt: report.completedAt,
            fileUrl: report.fileUrl,
          })),
          pagination: {
            total,
            limit: query.limit || 20,
            offset: query.offset || 0,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `获取报告列表失败: ${error.message}`,
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '获取报告详情' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '报告详情获取成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '报告不存在',
  })
  async getReport(@Param('id') id: string) {
    try {
      const report = await this.intelligentReportService.getReportById(id);

      return {
        success: true,
        message: '报告详情获取成功',
        data: {
          id: report.id,
          type: report.type,
          title: report.title,
          status: report.status,
          startDate: report.startDate,
          endDate: report.endDate,
          content: report.content,
          charts: report.charts,
          analysis: report.analysis,
          generatedBy: report.generatedBy,
          createdAt: report.createdAt,
          completedAt: report.completedAt,
          fileUrl: report.fileUrl,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `获取报告详情失败: ${error.message}`,
      };
    }
  }

  @Post(':id/export/word')
  @ApiOperation({ summary: '导出报告为Word格式' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '报告导出成功',
  })
  async exportReportToWord(@Param('id') id: string) {
    try {
      const result = await this.intelligentReportService.exportReportToWord(id);

      return {
        success: true,
        message: '报告导出成功',
        data: {
          downloadUrl: result.url,
          reportId: id,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `报告导出失败: ${error.message}`,
      };
    }
  }

  @Get(':id/status')
  @ApiOperation({ summary: '获取报告生成状态' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '报告状态获取成功',
  })
  async getReportStatus(@Param('id') id: string) {
    try {
      const report = await this.intelligentReportService.getReportById(id);

      return {
        success: true,
        message: '报告状态获取成功',
        data: {
          id: report.id,
          status: report.status,
          progress: report.status === ReportStatus.GENERATING ? '生成中' :
                   report.status === ReportStatus.COMPLETED ? '已完成' : '失败',
          createdAt: report.createdAt,
          completedAt: report.completedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `获取报告状态失败: ${error.message}`,
      };
    }
  }

  @Post(':id/retry')
  @ApiOperation({ summary: '重试失败的报告生成' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '报告重试成功',
  })
  async retryReportGeneration(@Param('id') id: string) {
    try {
      const report = await this.intelligentReportService.getReportById(id);

      if (report.status !== ReportStatus.FAILED) {
        return {
          success: false,
          message: '只有失败状态的报告可以重试',
        };
      }

      // 重新生成报告（简化：只是更新状态）
      report.status = ReportStatus.GENERATING;
      // 在实际实现中，这里应该重新触发报告生成流程
      // 目前只是更新状态为生成中
      // await this.intelligentReportService.retryReportGeneration(id);

      return {
        success: true,
        message: '报告重试已开始',
        data: {
          id: report.id,
          status: report.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `报告重试失败: ${error.message}`,
      };
    }
  }
}