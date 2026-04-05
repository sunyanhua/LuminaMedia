import { Sentiment, SentimentPlatform, SentimentType } from '../../entities/sentiment.entity';
import { TenantRepository } from './tenant.repository';

/**
 * Sentiment实体的租户感知Repository
 */
export class SentimentRepository extends TenantRepository<Sentiment> {
  // 按平台查找舆情
  async findByPlatform(platform: SentimentPlatform): Promise<Sentiment[]> {
    return this.createQueryBuilder('sentiment')
      .where('sentiment.platform = :platform', { platform })
      .orderBy('sentiment.publishTime', 'DESC')
      .getMany();
  }

  // 按情感类型查找舆情
  async findBySentiment(sentiment: SentimentType): Promise<Sentiment[]> {
    return this.createQueryBuilder('sentiment')
      .where('sentiment.sentiment = :sentiment', { sentiment })
      .orderBy('sentiment.publishTime', 'DESC')
      .getMany();
  }

  // 按时间范围查找舆情
  async findByTimeRange(startDate: Date, endDate: Date): Promise<Sentiment[]> {
    return this.createQueryBuilder('sentiment')
      .where('sentiment.publishTime >= :startDate', { startDate })
      .andWhere('sentiment.publishTime <= :endDate', { endDate })
      .orderBy('sentiment.publishTime', 'DESC')
      .getMany();
  }

  // 按关键词搜索舆情
  async findByKeywords(keywords: string[]): Promise<Sentiment[]> {
    const queryBuilder = this.createQueryBuilder('sentiment');

    // 为每个关键词添加 OR 条件
    const orConditions = keywords.map((keyword, index) => {
      return `sentiment.content LIKE :keyword${index}`;
    });

    if (orConditions.length === 0) {
      return [];
    }

    queryBuilder.where(`(${orConditions.join(' OR ')})`);

    keywords.forEach((keyword, index) => {
      queryBuilder.setParameter(`keyword${index}`, `%${keyword}%`);
    });

    return queryBuilder.orderBy('sentiment.publishTime', 'DESC').getMany();
  }

  // 获取舆情统计
  async getSentimentStats(startDate?: Date, endDate?: Date): Promise<{
    total: number;
    byPlatform: Record<SentimentPlatform, number>;
    bySentiment: Record<SentimentType, number>;
    averageSentimentScore: number;
  }> {
    const queryBuilder = this.createQueryBuilder('sentiment');

    if (startDate && endDate) {
      queryBuilder
        .where('sentiment.publishTime >= :startDate', { startDate })
        .andWhere('sentiment.publishTime <= :endDate', { endDate });
    }

    const sentiments = await queryBuilder.getMany();

    const total = sentiments.length;
    const byPlatform: Record<SentimentPlatform, number> = {
      [SentimentPlatform.WEIBO]: 0,
      [SentimentPlatform.WECHAT]: 0,
      [SentimentPlatform.DOUYIN]: 0,
      [SentimentPlatform.XIAOHONGSHU]: 0,
    };

    const bySentiment: Record<SentimentType, number> = {
      [SentimentType.POSITIVE]: 0,
      [SentimentType.NEGATIVE]: 0,
      [SentimentType.NEUTRAL]: 0,
    };

    let totalScore = 0;
    let scoredCount = 0;

    sentiments.forEach((sentiment) => {
      byPlatform[sentiment.platform] = (byPlatform[sentiment.platform] || 0) + 1;
      bySentiment[sentiment.sentiment] = (bySentiment[sentiment.sentiment] || 0) + 1;

      if (sentiment.sentimentScore !== null && sentiment.sentimentScore !== undefined) {
        totalScore += Number(sentiment.sentimentScore);
        scoredCount++;
      }
    });

    const averageSentimentScore = scoredCount > 0 ? totalScore / scoredCount : 0;

    return {
      total,
      byPlatform,
      bySentiment,
      averageSentimentScore,
    };
  }

  // 获取热门关键词
  async getHotKeywords(limit = 10): Promise<{ keyword: string; count: number }[]> {
    const sentiments = await this.createQueryBuilder('sentiment').getMany();
    const keywordCounts: Record<string, number> = {};

    sentiments.forEach((sentiment) => {
      if (sentiment.keywords && Array.isArray(sentiment.keywords)) {
        sentiment.keywords.forEach((keyword) => {
          if (keyword && keyword.trim()) {
            const normalizedKeyword = keyword.trim();
            keywordCounts[normalizedKeyword] = (keywordCounts[normalizedKeyword] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // 获取舆情趋势（按时间分组）
  async getSentimentTrend(
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month' = 'day',
  ): Promise<Array<{
    period: string;
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    averageScore: number;
  }>> {
    const sentiments = await this.findByTimeRange(startDate, endDate);
    const groups: Record<string, Sentiment[]> = {};

    // 分组逻辑
    sentiments.forEach((sentiment) => {
      const date = new Date(sentiment.publishTime);
      let period: string;

      switch (interval) {
        case 'day':
          period = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          break;
        case 'week':
          const weekNumber = Math.floor(date.getDate() / 7) + 1;
          period = `${date.getFullYear()}-W${weekNumber}`;
          break;
        case 'month':
          period = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        default:
          period = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      }

      if (!groups[period]) {
        groups[period] = [];
      }

      groups[period].push(sentiment);
    });

    // 计算每个分组的统计
    return Object.entries(groups).map(([period, groupSentiments]) => {
      const total = groupSentiments.length;
      const positive = groupSentiments.filter(s => s.sentiment === SentimentType.POSITIVE).length;
      const negative = groupSentiments.filter(s => s.sentiment === SentimentType.NEGATIVE).length;
      const neutral = groupSentiments.filter(s => s.sentiment === SentimentType.NEUTRAL).length;

      const scoredSentiments = groupSentiments.filter(s =>
        s.sentimentScore !== null && s.sentimentScore !== undefined
      );
      const averageScore = scoredSentiments.length > 0
        ? scoredSentiments.reduce((sum, s) => sum + Number(s.sentimentScore), 0) / scoredSentiments.length
        : 0;

      return {
        period,
        total,
        positive,
        negative,
        neutral,
        averageScore,
      };
    }).sort((a, b) => a.period.localeCompare(b.period));
  }
}