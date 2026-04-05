import apiClient from './apiClient';
import { executeWithDemoWrapper, generateMockData } from './demoModeService';

export interface WechatDashboardSummary {
  totalAccounts: number;
  totalFans: number;
  totalRead: number;
  totalLike: number;
  totalShare: number;
  netFansToday: number;
  readToday: number;
  likeToday: number;
  shareToday: number;
  weeklyTrend: {
    fans: number[];
    read: number[];
    like: number[];
    share: number[];
  };
  topArticles: Array<{
    title: string;
    publishTime: string;
    readCount: number;
    likeCount: number;
    shareCount: number;
    url: string;
    accountName: string;
    accountId: string;
  }>;
  updatedAt: string;
}

export interface ArticleRankItem {
  title: string;
  publishTime: string;
  readCount: number;
  likeCount: number;
  shareCount: number;
  url: string;
  accountName: string;
  accountId: string;
  wechatId: string;
}

/**
 * 微信公众号数据看板服务
 */
export const wechatDashboardService = {
  /**
   * 获取公众号数据看板汇总
   */
  getDashboardSummary: (): Promise<WechatDashboardSummary> => {
    return executeWithDemoWrapper(
      () => apiClient.get(`/api/v1/wechat-official-accounts/dashboard/summary`),
      () => Promise.resolve(generateMockData.wechatDashboardSummary())
    );
  },

  /**
   * 获取公众号文章排行
   * @param type 排行类型：read（阅读量）、like（点赞量）、share（转发量）
   * @param limit 返回数量，默认10
   */
  getArticleRank: (
    type: 'read' | 'like' | 'share' = 'read',
    limit: number = 10
  ): Promise<ArticleRankItem[]> => {
    return executeWithDemoWrapper(
      () => apiClient.get(`/api/v1/wechat-official-accounts/dashboard/articles/rank`, {
        params: { type, limit }
      }),
      () => Promise.resolve(generateMockData.wechatArticleRank(type, limit))
    );
  },

  /**
   * 获取单个公众号详细统计数据
   * @param accountId 公众号账号ID
   */
  getAccountStats: (accountId: string): Promise<any> => {
    return apiClient.get(`/api/v1/wechat-official-accounts/${accountId}/stats`);
  },
};

export default wechatDashboardService;