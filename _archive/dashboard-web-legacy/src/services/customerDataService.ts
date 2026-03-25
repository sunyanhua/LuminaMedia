import apiClient from './apiClient';

// 默认用户ID，用于演示和测试（使用数据库中的测试用户）
const DEFAULT_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export interface CustomerProfile {
  id: string;
  userId: string;
  customerName: string;
  customerType: string;
  industry: string;
  dataSources: Record<string, any>;
  profileData: Record<string, any>;
  behaviorInsights: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DataImportJob {
  id: string;
  customerProfileId: string;
  sourceType: string;
  filePath: string | null;
  originalFilename: string | null;
  recordCount: number;
  successCount: number;
  failedCount: number;
  status: string;
  errorMessage: string | null;
  validationErrors: Record<string, any>[] | null;
  summary: Record<string, any> | null;
  notes: string | null;
  importData: Record<string, any> | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface CustomerSegment {
  id: string;
  customerProfileId: string;
  segmentName: string;
  description: string | null;
  criteria: Record<string, any>;
  memberCount: number;
  memberIds: string[] | null;
  segmentInsights: Record<string, any> | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CustomerAnalysis {
  profileId: string;
  profileName: string;
  industry: string;
  analysisTimestamp: string;
  dataSummary: {
    totalImportJobs: number;
    completedImports: number;
    totalRecords: number;
    dataFreshness: string;
    dataCompleteness: number;
  };
  demographicAnalysis: Record<string, any>;
  behavioralAnalysis: Record<string, any>;
  consumptionAnalysis: Record<string, any>;
  segmentationAnalysis: Record<string, any>;
  keyInsights: string[];
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    expectedImpact: string;
    timeframe: string;
  }>;
}

/**
 * 客户数据服务
 */
export const customerDataService = {
  /**
   * 获取客户档案列表（需要用户ID）
   */
  getCustomerProfiles: (userId: string = DEFAULT_USER_ID): Promise<CustomerProfile[]> => {
    return apiClient.get(`/api/v1/customer-data/profiles`, { params: { userId } });
  },

  /**
   * 创建客户档案
   */
  createCustomerProfile: (data: {
    customerName: string;
    customerType: string;
    industry: string;
    dataSources?: Record<string, any>;
    userId?: string;
  }): Promise<CustomerProfile> => {
    const payload = {
      ...data,
      userId: data.userId || DEFAULT_USER_ID,
    };
    return apiClient.post(`/api/v1/customer-data/profiles`, payload);
  },

  /**
   * 获取单个客户档案详情
   */
  getCustomerProfile: (id: string): Promise<CustomerProfile> => {
    return apiClient.get(`/api/v1/customer-data/profiles/${id}`);
  },

  /**
   * 更新客户档案
   */
  updateCustomerProfile: (id: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile> => {
    return apiClient.patch(`/api/v1/customer-data/profiles/${id}`, updates);
  },

  /**
   * 删除客户档案
   */
  deleteCustomerProfile: (id: string): Promise<void> => {
    return apiClient.delete(`/api/v1/customer-data/profiles/${id}`);
  },

  /**
   * 导入客户数据（模拟实现，不实际处理文件）
   */
  importCustomerData: (
    profileId: string,
    sourceType: string = 'CSV',
    fileName?: string,
    recordCount: number = 0,
    notes?: string
  ): Promise<DataImportJob> => {
    const payload = {
      sourceType,
      fileName: fileName || `import_${Date.now()}.csv`,
      recordCount,
      notes: notes || '数据文件导入',
      filePath: `/uploads/${Date.now()}_import.csv`,
    };
    return apiClient.post(`/api/v1/customer-data/profiles/${profileId}/import`, payload);
  },

  /**
   * 获取客户分析报告
   */
  getCustomerAnalysis: (profileId: string): Promise<CustomerAnalysis> => {
    return apiClient.get(`/api/v1/customer-data/profiles/${profileId}/analysis`);
  },

  /**
   * 获取客户分群
   */
  getCustomerSegments: (profileId: string): Promise<CustomerSegment[]> => {
    return apiClient.get(`/api/v1/customer-data/profiles/${profileId}/segments`);
  },

  /**
   * 获取数据导入任务状态
   */
  getImportJobStatus: (jobId: string): Promise<DataImportJob> => {
    return apiClient.get(`/api/v1/customer-data/import-jobs/${jobId}`);
  },

  /**
   * 获取客户档案的导入任务列表
   */
  getImportJobsByProfile: (profileId: string): Promise<DataImportJob[]> => {
    return apiClient.get(`/api/v1/customer-data/profiles/${profileId}/import-jobs`);
  },

  /**
   * 生成商场客户演示数据
   */
  generateDemoData: (profileId: string): Promise<{
    profile: CustomerProfile;
    importJobs: DataImportJob[];
    segments: CustomerSegment[];
  }> => {
    return apiClient.post(`/api/v1/customer-data/profiles/${profileId}/generate-demo`);
  },

  /**
   * 获取客户档案统计信息
   */
  getProfileStats: (profileId: string): Promise<Record<string, any>> => {
    return apiClient.get(`/api/v1/customer-data/profiles/${profileId}/stats`);
  },

  /**
   * 获取客户仪表板数据
   */
  getDashboardData: (profileId: string): Promise<Record<string, any>> => {
    return apiClient.get(`/api/v1/customer-data/profiles/${profileId}/dashboard`);
  },

  /**
   * 获取雷达图数据
   */
  getRadarChartData: (profileId: string): Promise<Record<string, any>> => {
    return apiClient.get(`/api/v1/customer-data/profiles/${profileId}/charts/radar`);
  },

  /**
   * 获取散点图数据
   */
  getScatterChartData: (profileId: string): Promise<Record<string, any>> => {
    return apiClient.get(`/api/v1/customer-data/profiles/${profileId}/charts/scatter`);
  },

  /**
   * 获取热力图数据
   */
  getHeatmapChartData: (profileId: string): Promise<Record<string, any>> => {
    return apiClient.get(`/api/v1/customer-data/profiles/${profileId}/charts/heatmap`);
  },

  /**
   * 获取漏斗图数据
   */
  getFunnelChartData: (profileId: string): Promise<Record<string, any>> => {
    return apiClient.get(`/api/v1/customer-data/profiles/${profileId}/charts/funnel`);
  },

  /**
   * 获取桑基图数据
   */
  getSankeyChartData: (profileId: string): Promise<Record<string, any>> => {
    return apiClient.get(`/api/v1/customer-data/profiles/${profileId}/charts/sankey`);
  },

  /**
   * 获取所有图表数据
   */
  getAllChartData: (profileId: string): Promise<Record<string, any>> => {
    return apiClient.get(`/api/v1/customer-data/profiles/${profileId}/charts/all`);
  },

  /**
   * 获取行业枚举列表
   */
  getIndustries: (): Promise<Array<{ value: string; label: string }>> => {
    return apiClient.get(`/api/v1/customer-data/profiles/enums/industries`);
  },

  /**
   * 获取客户类型枚举列表
   */
  getCustomerTypes: (): Promise<Array<{ value: string; label: string }>> => {
    return apiClient.get(`/api/v1/customer-data/profiles/enums/customer-types`);
  },

  /**
   * 获取数据源类型枚举列表
   */
  getSourceTypes: (): Promise<Array<{ value: string; label: string }>> => {
    return apiClient.get(`/api/v1/customer-data/enums/source-types`);
  },

  /**
   * 获取导入状态枚举列表
   */
  getImportStatuses: (): Promise<Array<{ value: string; label: string }>> => {
    return apiClient.get(`/api/v1/customer-data/enums/import-statuses`);
  },
};

export default customerDataService;