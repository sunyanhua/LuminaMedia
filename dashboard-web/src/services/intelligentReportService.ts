import apiClient from './apiClient';
import { executeWithDemoWrapper } from './demoModeService';

export interface ReportGenerationRequest {
  startDate: Date;
  endDate: Date;
  title?: string;
  generatedBy?: string;
}

export interface ReportItem {
  id: string;
  type: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  completedAt?: string;
  fileUrl?: string;
}

export interface ReportListResponse {
  success: boolean;
  message: string;
  data: {
    reports: ReportItem[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
    };
  };
}

export interface ReportDetailResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    type: string;
    title: string;
    status: string;
    startDate: string;
    endDate: string;
    content: any;
    charts: any;
    analysis: string;
    generatedBy?: string;
    createdAt: string;
    completedAt?: string;
    fileUrl?: string;
  };
}

export interface ReportGenerationResponse {
  success: boolean;
  message: string;
  data: {
    reportId: string;
    title: string;
    status: string;
    createdAt: string;
  };
}

export interface ExportReportResponse {
  success: boolean;
  message: string;
  data: {
    downloadUrl: string;
    reportId: string;
  };
}

export interface RetryReportResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: string;
  };
}

class IntelligentReportService {
  // 生成舆情监测日报
  async generateSentimentDailyReport(request: ReportGenerationRequest): Promise<ReportGenerationResponse> {
    return executeWithDemoWrapper(async () => {
      const response = await apiClient.post('/api/v1/analytics/intelligent-reports/sentiment/daily', request);
      return response.data;
    }, {
      mockData: {
        success: true,
        message: '舆情监测日报生成成功（演示模式）',
        data: {
          reportId: `demo-sentiment-daily-${Date.now()}`,
          title: request.title || '舆情监测日报（演示）',
          status: 'generating',
          createdAt: new Date().toISOString(),
        },
      },
    });
  }

  // 生成舆情监测周报
  async generateSentimentWeeklyReport(request: ReportGenerationRequest): Promise<ReportGenerationResponse> {
    return executeWithDemoWrapper(async () => {
      const response = await apiClient.post('/api/v1/analytics/intelligent-reports/sentiment/weekly', request);
      return response.data;
    }, {
      mockData: {
        success: true,
        message: '舆情监测周报生成成功（演示模式）',
        data: {
          reportId: `demo-sentiment-weekly-${Date.now()}`,
          title: request.title || '舆情监测周报（演示）',
          status: 'generating',
          createdAt: new Date().toISOString(),
        },
      },
    });
  }

  // 生成公众号运营月报
  async generateWechatMonthlyReport(request: ReportGenerationRequest): Promise<ReportGenerationResponse> {
    return executeWithDemoWrapper(async () => {
      const response = await apiClient.post('/api/v1/analytics/intelligent-reports/wechat/monthly', request);
      return response.data;
    }, {
      mockData: {
        success: true,
        message: '公众号运营月报生成成功（演示模式）',
        data: {
          reportId: `demo-wechat-monthly-${Date.now()}`,
          title: request.title || '公众号运营月报（演示）',
          status: 'generating',
          createdAt: new Date().toISOString(),
        },
      },
    });
  }

  // 获取报告列表
  async getReports(params?: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ReportListResponse> {
    return executeWithDemoWrapper(async () => {
      const response = await apiClient.get('/api/v1/analytics/intelligent-reports', { params });
      return response.data;
    }, {
      mockData: {
        success: true,
        message: '报告列表获取成功（演示模式）',
        data: {
          reports: [
            {
              id: 'demo-report-1',
              type: 'sentiment_daily',
              title: '舆情监测日报（演示）',
              status: 'completed',
              startDate: new Date(Date.now() - 86400000).toISOString(),
              endDate: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
              fileUrl: '/api/v1/analytics/reports/demo-report-1/export/word',
            },
            {
              id: 'demo-report-2',
              type: 'sentiment_weekly',
              title: '舆情监测周报（演示）',
              status: 'completed',
              startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
              endDate: new Date().toISOString(),
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              completedAt: new Date(Date.now() - 43200000).toISOString(),
              fileUrl: '/api/v1/analytics/reports/demo-report-2/export/word',
            },
            {
              id: 'demo-report-3',
              type: 'wechat_monthly',
              title: '公众号运营月报（演示）',
              status: 'generating',
              startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
              endDate: new Date().toISOString(),
              createdAt: new Date(Date.now() - 7200000).toISOString(),
            },
          ],
          pagination: {
            total: 3,
            limit: params?.limit || 10,
            offset: params?.offset || 0,
          },
        },
      },
    });
  }

  // 获取报告详情
  async getReportDetail(reportId: string): Promise<ReportDetailResponse> {
    return executeWithDemoWrapper(async () => {
      const response = await apiClient.get(`/api/v1/analytics/intelligent-reports/${reportId}`);
      return response.data;
    }, {
      mockData: {
        success: true,
        message: '报告详情获取成功（演示模式）',
        data: {
          id: reportId,
          type: 'sentiment_daily',
          title: '舆情监测日报（演示）',
          status: 'completed',
          startDate: new Date(Date.now() - 86400000).toISOString(),
          endDate: new Date().toISOString(),
          content: {
            summary: {
              total: 156,
              timeRange: {
                start: new Date(Date.now() - 86400000).toISOString(),
                end: new Date().toISOString(),
              },
              platforms: { weibo: 45, wechat: 67, douyin: 32, xiaohongshu: 12 },
              sentiments: { positive: 89, negative: 42, neutral: 25 },
              averageSentimentScore: 0.32,
            },
            trends: [
              { period: '2026-04-05', total: 45, positive: 25, negative: 12, neutral: 8, averageScore: 0.45 },
              { period: '2026-04-06', total: 67, positive: 38, negative: 18, neutral: 11, averageScore: 0.52 },
            ],
            hotKeywords: [
              { keyword: '政务服务', count: 23 },
              { keyword: '数字化转型', count: 18 },
              { keyword: '政策解读', count: 15 },
            ],
            topContent: [
              {
                id: '1',
                platform: 'weibo',
                content: '政务服务数字化转型取得新进展...',
                sentiment: 'positive',
                sentimentScore: 0.78,
                readCount: 1250,
                shareCount: 89,
                commentCount: 45,
                publishTime: new Date(Date.now() - 43200000).toISOString(),
              },
            ],
          },
          charts: {
            sentimentPie: {
              type: 'pie',
              title: '情感分布',
              labels: ['正面', '负面', '中性'],
              datasets: [
                {
                  data: [89, 42, 25],
                  backgroundColor: ['#4CAF50', '#F44336', '#9E9E9E'],
                },
              ],
            },
            platformBar: {
              type: 'bar',
              title: '平台分布',
              labels: ['微博', '微信', '抖音', '小红书'],
              datasets: [
                {
                  label: '舆情数量',
                  data: [45, 67, 32, 12],
                  backgroundColor: '#2196F3',
                },
              ],
            },
          },
          analysis: '昨日舆情总体态势积极向好，正面评价占主导地位。主要关注点集中在政务服务数字化转型和政策解读方面。建议继续加强正面内容传播，巩固良好形象。',
          generatedBy: 'demo-user',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date(Date.now() - 82800000).toISOString(),
          fileUrl: '/api/v1/analytics/reports/demo-report-1/export/word',
        },
      },
    });
  }

  // 导出报告为Word格式
  async exportReportToWord(reportId: string): Promise<ExportReportResponse> {
    return executeWithDemoWrapper(async () => {
      const response = await apiClient.post(`/api/v1/analytics/intelligent-reports/${reportId}/export/word`);
      return response.data;
    }, {
      mockData: {
        success: true,
        message: '报告导出成功（演示模式）',
        data: {
          downloadUrl: `/api/v1/analytics/reports/${reportId}/export/word`,
          reportId,
        },
      },
    });
  }

  // 获取报告状态
  async getReportStatus(reportId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      id: string;
      status: string;
      progress: string;
      createdAt: string;
      completedAt?: string;
    };
  }> {
    return executeWithDemoWrapper(async () => {
      const response = await apiClient.get(`/api/v1/analytics/intelligent-reports/${reportId}/status`);
      return response.data;
    }, {
      mockData: {
        success: true,
        message: '报告状态获取成功（演示模式）',
        data: {
          id: reportId,
          status: 'completed',
          progress: '已完成',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date(Date.now() - 82800000).toISOString(),
        },
      },
    });
  }

  // 重试报告生成
  async retryReportGeneration(reportId: string): Promise<RetryReportResponse> {
    return executeWithDemoWrapper(async () => {
      const response = await apiClient.post(`/api/v1/analytics/intelligent-reports/${reportId}/retry`);
      return response.data;
    }, {
      mockData: {
        success: true,
        message: '报告重试已开始（演示模式）',
        data: {
          id: reportId,
          status: 'generating',
        },
      },
    });
  }
}

export const intelligentReportService = new IntelligentReportService();