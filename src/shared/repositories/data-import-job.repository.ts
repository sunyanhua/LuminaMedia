import { TenantRepository } from './tenant.repository';
import { DataImportJob } from '../../entities/data-import-job.entity';
import { DataImportStatus } from '../enums/data-import-status.enum';

/**
 * DataImportJob实体的租户感知Repository
 */
export class DataImportJobRepository extends TenantRepository<DataImportJob> {
  // 可以添加数据导入任务特定的查询方法
  async findByCustomerProfile(
    customerProfileId: string,
  ): Promise<DataImportJob[]> {
    return this.createQueryBuilder('job')
      .where('job.customerProfileId = :customerProfileId', {
        customerProfileId,
      })
      .orderBy('job.createdAt', 'DESC')
      .getMany();
  }

  async findPendingJobs(): Promise<DataImportJob[]> {
    return this.createQueryBuilder('job')
      .where('job.status = :status', { status: DataImportStatus.PENDING })
      .orderBy('job.createdAt', 'ASC')
      .getMany();
  }

  async findCompletedJobs(fromDate?: Date): Promise<DataImportJob[]> {
    const query = this.createQueryBuilder('job')
      .where('job.status = :status', { status: DataImportStatus.SUCCESS })
      .orderBy('job.completedAt', 'DESC');

    if (fromDate) {
      query.andWhere('job.completedAt >= :fromDate', { fromDate });
    }

    return query.getMany();
  }

  async getImportStatsByProfile(customerProfileId: string): Promise<{
    totalJobs: number;
    completedJobs: number;
    pendingJobs: number;
    totalRecords: number;
    successRate: number;
  }> {
    const jobs = await this.findByCustomerProfile(customerProfileId);

    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(
      (job) => job.status === DataImportStatus.SUCCESS,
    ).length;
    const pendingJobs = jobs.filter(
      (job) => job.status === DataImportStatus.PENDING,
    ).length;
    const totalRecords = jobs.reduce((sum, job) => sum + job.recordCount, 0);
    const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    return {
      totalJobs,
      completedJobs,
      pendingJobs,
      totalRecords,
      successRate,
    };
  }
}
