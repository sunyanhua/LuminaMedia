import { Report, ReportType, ReportStatus } from '../../entities/report.entity';
import { TenantRepository } from './tenant.repository';

/**
 * Report实体的租户感知Repository
 */
export class ReportRepository extends TenantRepository<Report> {
  // 按类型查找报告
  async findByType(type: ReportType): Promise<Report[]> {
    return this.createQueryBuilder('report')
      .where('report.type = :type', { type })
      .orderBy('report.createdAt', 'DESC')
      .getMany();
  }

  // 按状态查找报告
  async findByStatus(status: ReportStatus): Promise<Report[]> {
    return this.createQueryBuilder('report')
      .where('report.status = :status', { status })
      .orderBy('report.createdAt', 'DESC')
      .getMany();
  }

  // 查找指定时间范围内的报告
  async findByTimeRange(startDate: Date, endDate: Date): Promise<Report[]> {
    return this.createQueryBuilder('report')
      .where('report.startDate >= :startDate', { startDate })
      .andWhere('report.endDate <= :endDate', { endDate })
      .orderBy('report.createdAt', 'DESC')
      .getMany();
  }

  // 查找指定用户生成的报告
  async findByUser(userId: string): Promise<Report[]> {
    return this.createQueryBuilder('report')
      .where('report.generatedBy = :userId', { userId })
      .orderBy('report.createdAt', 'DESC')
      .getMany();
  }

  // 查找最新完成的报告
  async findLatestCompleted(limit = 10): Promise<Report[]> {
    return this.createQueryBuilder('report')
      .where('report.status = :status', { status: ReportStatus.COMPLETED })
      .orderBy('report.completedAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  // 统计各类报告数量
  async countByType(): Promise<{ type: ReportType; count: number }[]> {
    const results = await this.createQueryBuilder('report')
      .select('report.type', 'type')
      .addSelect('COUNT(report.id)', 'count')
      .groupBy('report.type')
      .getRawMany();

    return results.map((row) => ({
      type: row.type,
      count: parseInt(row.count, 10),
    }));
  }
}