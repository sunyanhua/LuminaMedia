import { TenantRepository } from './tenant.repository';
import { DataImportJob } from '../../entities/data-import-job.entity';
export declare class DataImportJobRepository extends TenantRepository<DataImportJob> {
    findByCustomerProfile(customerProfileId: string): Promise<DataImportJob[]>;
    findPendingJobs(): Promise<DataImportJob[]>;
    findCompletedJobs(fromDate?: Date): Promise<DataImportJob[]>;
    getImportStatsByProfile(customerProfileId: string): Promise<{
        totalJobs: number;
        completedJobs: number;
        pendingJobs: number;
        totalRecords: number;
        successRate: number;
    }>;
}
