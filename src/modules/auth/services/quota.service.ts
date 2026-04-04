import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Like, Between } from 'typeorm';
import { TenantQuota } from '../../../entities/tenant-quota.entity';
import { QuotaQueryDto } from '../dto/quota.dto';

@Injectable()
export class QuotaService {
  constructor(
    @InjectRepository(TenantQuota)
    private tenantQuotaRepository: Repository<TenantQuota>,
  ) {}

  /**
   * 检查租户功能配额是否充足
   */
  async checkQuota(tenantId: string, featureKey: string): Promise<{ hasQuota: boolean; remaining: number }> {
    const quotaRecord = await this.tenantQuotaRepository.findOne({
      where: {
        tenantId,
        featureKey,
      },
    });

    if (!quotaRecord) {
      // 如果没有配额记录，默认允许访问
      return { hasQuota: true, remaining: -1 };
    }

    // 检查是否需要重置配额
    await this.maybeResetQuota(quotaRecord);

    const remaining = quotaRecord.maxCount - quotaRecord.usedCount;
    return {
      hasQuota: remaining > 0,
      remaining: remaining > 0 ? remaining : 0
    };
  }

  /**
   * 消费配额
   */
  async consumeQuota(tenantId: string, featureKey: string): Promise<boolean> {
    const quotaInfo = await this.checkQuota(tenantId, featureKey);

    if (!quotaInfo.hasQuota) {
      return false; // 配额不足
    }

    const quotaRecord = await this.getOrCreateQuotaRecord(tenantId, featureKey);

    // 检查是否需要重置配额
    await this.maybeResetQuota(quotaRecord);

    // 增加已使用计数
    quotaRecord.usedCount += 1;
    quotaRecord.updatedAt = new Date();

    await this.tenantQuotaRepository.save(quotaRecord);
    return true;
  }

  /**
   * 获取租户的配额信息
   */
  async getQuotaInfo(tenantId: string, featureKey: string): Promise<{
    usedCount: number;
    maxCount: number;
    remaining: number;
    resetTime?: Date;
  }> {
    const quotaRecord = await this.getOrCreateQuotaRecord(tenantId, featureKey);

    // 检查是否需要重置配额
    await this.maybeResetQuota(quotaRecord);

    const remaining = quotaRecord.maxCount - quotaRecord.usedCount;

    return {
      usedCount: quotaRecord.usedCount,
      maxCount: quotaRecord.maxCount,
      remaining: remaining > 0 ? remaining : 0,
      resetTime: quotaRecord.resetTime,
    };
  }

  /**
   * 重置租户配额
   */
  async resetQuota(tenantId: string, featureKey: string): Promise<void> {
    const quotaRecord = await this.getOrCreateQuotaRecord(tenantId, featureKey);

    quotaRecord.usedCount = 0;
    quotaRecord.resetTime = this.calculateNextResetTime(quotaRecord.quotaPeriod);
    quotaRecord.updatedAt = new Date();

    await this.tenantQuotaRepository.save(quotaRecord);
  }

  /**
   * 批量重置配额
   */
  async resetQuotasForTenant(tenantId: string): Promise<void> {
    const quotaRecords = await this.tenantQuotaRepository.find({
      where: { tenantId },
    });

    for (const record of quotaRecords) {
      record.usedCount = 0;
      record.resetTime = this.calculateNextResetTime(record.quotaPeriod);
      record.updatedAt = new Date();
    }

    await this.tenantQuotaRepository.save(quotaRecords);
  }

  /**
   * 设置租户功能配额
   */
  async setQuota(tenantId: string, featureKey: string, maxCount: number, quotaPeriod: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<TenantQuota> {
    let quotaRecord = await this.tenantQuotaRepository.findOne({
      where: { tenantId, featureKey },
    });

    if (quotaRecord) {
      quotaRecord.maxCount = maxCount;
      quotaRecord.quotaPeriod = quotaPeriod;
      quotaRecord.updatedAt = new Date();
    } else {
      quotaRecord = this.tenantQuotaRepository.create({
        tenantId,
        featureKey,
        maxCount,
        quotaPeriod,
      });
    }

    return await this.tenantQuotaRepository.save(quotaRecord);
  }

  /**
   * 获取或创建配额记录
   */
  private async getOrCreateQuotaRecord(tenantId: string, featureKey: string): Promise<TenantQuota> {
    let quotaRecord = await this.tenantQuotaRepository.findOne({
      where: { tenantId, featureKey },
    });

    if (!quotaRecord) {
      quotaRecord = this.tenantQuotaRepository.create({
        tenantId,
        featureKey,
        maxCount: 100, // 默认最大配额
        quotaPeriod: 'daily', // 默认每日配额
      });
      quotaRecord = await this.tenantQuotaRepository.save(quotaRecord);
    }

    return quotaRecord;
  }

  /**
   * 根据配额周期检查是否需要重置配额
   */
  private async maybeResetQuota(quotaRecord: TenantQuota): Promise<void> {
    if (!quotaRecord.resetTime) {
      // 如果没有重置时间，设置一个初始重置时间
      quotaRecord.resetTime = this.calculateNextResetTime(quotaRecord.quotaPeriod);
      quotaRecord.usedCount = 0; // 初始时重置使用计数
      await this.tenantQuotaRepository.save(quotaRecord);
      return;
    }

    const now = new Date();
    if (now >= quotaRecord.resetTime) {
      // 需要重置配额
      quotaRecord.usedCount = 0;
      quotaRecord.resetTime = this.calculateNextResetTime(quotaRecord.quotaPeriod);
      await this.tenantQuotaRepository.save(quotaRecord);
    }
  }

  /**
   * 计算下一个重置时间
   */
  private calculateNextResetTime(period: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();

    switch (period) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        now.setHours(0, 0, 0, 0); // 设置为明天的午夜
        return now;
      case 'weekly':
        // 下周一的午夜
        const daysUntilMonday = (8 - now.getDay()) % 7 || 7; // 如果今天是周一，就是7天后
        now.setDate(now.getDate() + daysUntilMonday);
        now.setHours(0, 0, 0, 0);
        return now;
      case 'monthly':
        // 下个月的第一天午夜
        now.setMonth(now.getMonth() + 1);
        now.setDate(1);
        now.setHours(0, 0, 0, 0);
        return now;
    }
  }

  /**
   * 获取配额列表（支持分页和过滤）
   */
  async getQuotas(query: QuotaQueryDto): Promise<{ data: TenantQuota[]; total: number; page: number; pageSize: number }> {
    const { tenantId, featureKey, quotaPeriod, page = 1, pageSize = 20 } = query;

    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (featureKey) {
      where.featureKey = featureKey;
    }

    if (quotaPeriod) {
      where.quotaPeriod = quotaPeriod;
    }

    const [data, total] = await this.tenantQuotaRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取所有租户的配额列表（无过滤）
   */
  async getAllQuotas(): Promise<TenantQuota[]> {
    return await this.tenantQuotaRepository.find({
      order: {
        tenantId: 'ASC',
        featureKey: 'ASC',
      },
    });
  }

  /**
   * 获取租户的所有配额使用情况
   */
  async getTenantQuotaUsage(tenantId: string): Promise<Array<{
    featureKey: string;
    usedCount: number;
    maxCount: number;
    remaining: number;
    quotaPeriod: 'daily' | 'weekly' | 'monthly';
    resetTime?: Date;
  }>> {
    const quotaRecords = await this.tenantQuotaRepository.find({
      where: { tenantId },
    });

    const result = [];

    for (const record of quotaRecords) {
      // 检查是否需要重置配额
      await this.maybeResetQuota(record);

      const remaining = record.maxCount - record.usedCount;
      result.push({
        featureKey: record.featureKey,
        usedCount: record.usedCount,
        maxCount: record.maxCount,
        remaining: remaining > 0 ? remaining : 0,
        quotaPeriod: record.quotaPeriod,
        resetTime: record.resetTime,
      });
    }

    return result;
  }

  /**
   * 获取功能的所有配额配置
   */
  async getFeatureQuotas(featureKey: string): Promise<TenantQuota[]> {
    return await this.tenantQuotaRepository.find({
      where: { featureKey },
      order: {
        tenantId: 'ASC',
      },
    });
  }

  /**
   * 删除配额配置
   */
  async deleteQuota(tenantId: string, featureKey: string): Promise<void> {
    await this.tenantQuotaRepository.delete({
      tenantId,
      featureKey,
    });
  }
}