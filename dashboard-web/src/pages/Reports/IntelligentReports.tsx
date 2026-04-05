import React, { useState, useEffect } from 'react';
import { Card, Button, DatePicker, Select, Table, message, Space, Typography, Row, Col } from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  ReloadOutlined,
  PieChartOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { intelligentReportService } from '../../services/intelligentReportService';
import './IntelligentReports.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 报告类型选项
const REPORT_TYPES = [
  { value: 'sentiment_daily', label: '舆情监测日报' },
  { value: 'sentiment_weekly', label: '舆情监测周报' },
  { value: 'wechat_monthly', label: '公众号运营月报' },
];

// 报告状态选项
const REPORT_STATUS = [
  { value: 'generating', label: '生成中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
];

const IntelligentReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('sentiment_daily');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);
  const [reports, setReports] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);

  // 加载报告列表
  const loadReports = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const params = {
        type: filterType,
        status: filterStatus,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      };
      const response = await intelligentReportService.getReports(params);

      if (response.success) {
        setReports(response.data.reports);
        setPagination({
          current: page,
          pageSize,
          total: response.data.pagination.total,
        });
      } else {
        message.error(response.message || '加载报告列表失败');
      }
    } catch (error) {
      message.error('请求失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filterStatus, filterType]);

  // 生成报告
  const handleGenerateReport = async () => {
    if (!dateRange || dateRange.length !== 2) {
      message.warning('请选择时间范围');
      return;
    }

    try {
      setLoading(true);
      const request = {
        startDate: dateRange[0].toDate(),
        endDate: dateRange[1].toDate(),
        title: `${REPORT_TYPES.find(t => t.value === reportType)?.label} (${dateRange[0].format('YYYY-MM-DD')} 至 ${dateRange[1].format('YYYY-MM-DD')})`,
      };

      let response;
      switch (reportType) {
        case 'sentiment_daily':
          response = await intelligentReportService.generateSentimentDailyReport(request);
          break;
        case 'sentiment_weekly':
          response = await intelligentReportService.generateSentimentWeeklyReport(request);
          break;
        case 'wechat_monthly':
          response = await intelligentReportService.generateWechatMonthlyReport(request);
          break;
        default:
          message.error('未知的报告类型');
          return;
      }

      if (response.success) {
        message.success('报告生成任务已提交，请稍后查看');
        loadReports(); // 刷新列表
      } else {
        message.error(response.message || '报告生成失败');
      }
    } catch (error) {
      message.error('请求失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 导出报告
  const handleExportReport = async (reportId: string) => {
    try {
      const response = await intelligentReportService.exportReportToWord(reportId);
      if (response.success) {
        message.success('报告导出任务已提交');
        // 在实际应用中，这里可以触发文件下载
        window.open(response.data.downloadUrl, '_blank');
      } else {
        message.error(response.message || '报告导出失败');
      }
    } catch (error) {
      message.error('导出失败，请检查网络连接');
    }
  };

  // 查看报告详情
  const handleViewReport = (reportId: string) => {
    // 跳转到报告详情页或打开弹窗
    message.info(`查看报告 ${reportId}，详情功能开发中`);
  };

  // 重试失败的报告
  const handleRetryReport = async (reportId: string) => {
    try {
      const response = await intelligentReportService.retryReportGeneration(reportId);
      if (response.success) {
        message.success('报告重试任务已提交');
        loadReports();
      } else {
        message.error(response.message || '报告重试失败');
      }
    } catch (error) {
      message.error('重试失败，请检查网络连接');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '报告标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <div style={{ maxWidth: 300 }}>
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeInfo = REPORT_TYPES.find(t => t.value === type);
        return typeInfo ? typeInfo.label : type;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          generating: { text: '生成中', color: 'blue' },
          completed: { text: '已完成', color: 'green' },
          failed: { text: '失败', color: 'red' },
        };
        const statusInfo = statusMap[status] || { text: status, color: 'default' };
        return <span style={{ color: statusInfo.color }}>{statusInfo.text}</span>;
      },
    },
    {
      title: '时间范围',
      key: 'timeRange',
      render: (_: any, record: any) => (
        <Text type="secondary">
          {dayjs(record.startDate).format('YYYY-MM-DD')} 至 {dayjs(record.endDate).format('YYYY-MM-DD')}
        </Text>
      ),
    },
    {
      title: '生成时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleViewReport(record.id)}
            disabled={record.status !== 'completed'}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleExportReport(record.id)}
            disabled={record.status !== 'completed'}
          >
            导出
          </Button>
          {record.status === 'failed' && (
            <Button
              type="link"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => handleRetryReport(record.id)}
            >
              重试
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="intelligent-reports-page">
      <Title level={2}>智能报告中心</Title>
      <Text type="secondary">生成舆情监测和公众号运营报告，支持Word导出</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="报告生成" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong>选择报告类型：</Text>
                <Select
                  value={reportType}
                  onChange={setReportType}
                  style={{ width: 200, marginLeft: 8 }}
                >
                  {REPORT_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>选择时间范围：</Text>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                  style={{ marginLeft: 8 }}
                />
              </div>

              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={handleGenerateReport}
                loading={loading}
                size="large"
              >
                生成报告
              </Button>
            </Space>
          </Card>

          <Card
            title="报告列表"
            extra={
              <Space>
                <Select
                  placeholder="按类型筛选"
                  style={{ width: 150 }}
                  allowClear
                  onChange={setFilterType}
                  value={filterType}
                >
                  {REPORT_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
                <Select
                  placeholder="按状态筛选"
                  style={{ width: 120 }}
                  allowClear
                  onChange={setFilterStatus}
                  value={filterStatus}
                >
                  {REPORT_STATUS.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
                <Button icon={<ReloadOutlined />} onClick={() => loadReports()}>
                  刷新
                </Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={reports}
              rowKey="id"
              pagination={pagination}
              loading={loading}
              onChange={(pagination) => loadReports(pagination.current!, pagination.pageSize!)}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="报告类型说明" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="middle">
              {REPORT_TYPES.map(type => (
                <Card key={type.value} size="small">
                  <Text strong>{type.label}</Text>
                  <br />
                  <Text type="secondary">
                    {type.value === 'sentiment_daily' && '每日舆情监测分析，包含情感分布、平台统计和热点话题'}
                    {type.value === 'sentiment_weekly' && '每周舆情趋势分析，包含情感变化趋势和风险评估'}
                    {type.value === 'wechat_monthly' && '每月公众号运营分析，包含阅读量、互动数据和内容表现'}
                  </Text>
                </Card>
              ))}
            </Space>
          </Card>

          <Card title="快速操作">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                block
                icon={<PieChartOutlined />}
                onClick={() => {
                  setReportType('sentiment_daily');
                  setDateRange([dayjs().subtract(1, 'day'), dayjs()]);
                }}
              >
                生成昨日舆情日报
              </Button>
              <Button
                block
                icon={<BarChartOutlined />}
                onClick={() => {
                  setReportType('sentiment_weekly');
                  setDateRange([dayjs().subtract(7, 'day'), dayjs()]);
                }}
              >
                生成本周舆情周报
              </Button>
              <Button
                block
                icon={<FileTextOutlined />}
                onClick={() => {
                  setReportType('wechat_monthly');
                  const startOfMonth = dayjs().startOf('month');
                  setDateRange([startOfMonth, dayjs()]);
                }}
              >
                生成本月公众号月报
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default IntelligentReports;