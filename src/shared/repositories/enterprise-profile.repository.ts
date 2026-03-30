import { TenantRepository } from './tenant.repository';
import { EnterpriseProfile } from '../../entities/enterprise-profile.entity';

/**
 * EnterpriseProfile实体的租户感知Repository
 */
export class EnterpriseProfileRepository extends TenantRepository<EnterpriseProfile> {
  /**
   * 根据客户档案ID查找企业画像
   */
  async findByCustomerProfileId(
    customerProfileId: string,
  ): Promise<EnterpriseProfile[]> {
    return this.createQueryBuilder('profile')
      .where('profile.customerProfileId = :customerProfileId', {
        customerProfileId,
      })
      .orderBy('profile.version', 'DESC')
      .getMany();
  }

  /**
   * 获取当前版本的企业画像
   */
  async findCurrentByCustomerProfileId(
    customerProfileId: string,
  ): Promise<EnterpriseProfile | null> {
    return this.createQueryBuilder('profile')
      .where('profile.customerProfileId = :customerProfileId', {
        customerProfileId,
      })
      .andWhere('profile.isCurrent = :isCurrent', { isCurrent: true })
      .getOne();
  }

  /**
   * 根据行业查找企业画像
   */
  async findByIndustry(industry: string): Promise<EnterpriseProfile[]> {
    return this.createQueryBuilder('profile')
      .where('profile.industry LIKE :industry', { industry: `%${industry}%` })
      .andWhere('profile.isCurrent = :isCurrent', { isCurrent: true })
      .getMany();
  }

  /**
   * 查找相似的企业画像（基于特征向量）
   */
  async findSimilarProfiles(
    featureVector: number[],
    limit: number = 5,
    excludeProfileId?: string,
  ): Promise<EnterpriseProfile[]> {
    if (!featureVector || featureVector.length === 0) {
      return this.find({ where: { isCurrent: true }, take: limit });
    }

    const queryBuilder = this.createQueryBuilder('profile')
      .where('profile.featureVector IS NOT NULL')
      .andWhere('profile.isCurrent = :isCurrent', { isCurrent: true })
      .orderBy('profile.updatedAt', 'DESC')
      .take(limit);

    if (excludeProfileId) {
      queryBuilder.andWhere('profile.id != :excludeProfileId', {
        excludeProfileId,
      });
    }

    // 注：实际相似性搜索应在向量数据库中进行
    // 这里仅返回最近更新的画像作为占位实现
    return queryBuilder.getMany();
  }

  /**
   * 获取企业画像版本历史
   */
  async getVersionHistory(
    customerProfileId: string,
  ): Promise<EnterpriseProfile[]> {
    return this.createQueryBuilder('profile')
      .where('profile.customerProfileId = :customerProfileId', {
        customerProfileId,
      })
      .orderBy('profile.version', 'DESC')
      .getMany();
  }

  /**
   * 更新企业画像版本状态
   */
  async updateVersionStatus(
    customerProfileId: string,
    newCurrentVersionId: string,
  ): Promise<void> {
    // 先将所有版本标记为非当前
    await this.createQueryBuilder()
      .update(EnterpriseProfile)
      .set({ isCurrent: false })
      .where('customerProfileId = :customerProfileId', { customerProfileId })
      .execute();

    // 将指定版本标记为当前
    await this.createQueryBuilder()
      .update(EnterpriseProfile)
      .set({ isCurrent: true })
      .where('id = :id', { id: newCurrentVersionId })
      .execute();
  }

  /**
   * 获取行业统计
   */
  async getIndustryStats(): Promise<
    Array<{ industry: string; count: number }>
  > {
    const results = await this.createQueryBuilder('profile')
      .select('profile.industry', 'industry')
      .addSelect('COUNT(*)', 'count')
      .where('profile.isCurrent = :isCurrent', { isCurrent: true })
      .groupBy('profile.industry')
      .orderBy('count', 'DESC')
      .getRawMany();

    return results.map((row) => ({
      industry: row.industry,
      count: parseInt(row.count, 10),
    }));
  }

  /**
   * 获取分析状态统计
   */
  async getAnalysisStatusStats(): Promise<
    Array<{ status: string; count: number; avgProgress: number }>
  > {
    const results = await this.createQueryBuilder('profile')
      .select('profile.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(profile.analysisProgress)', 'avgProgress')
      .groupBy('profile.status')
      .getRawMany();

    return results.map((row) => ({
      status: row.status,
      count: parseInt(row.count, 10),
      avgProgress: parseFloat(row.avgProgress) || 0,
    }));
  }
}
