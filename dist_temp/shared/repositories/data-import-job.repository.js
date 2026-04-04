"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataImportJobRepository = void 0;
const tenant_repository_1 = require("./tenant.repository");
const data_import_status_enum_1 = require("../enums/data-import-status.enum");
class DataImportJobRepository extends tenant_repository_1.TenantRepository {
    async findByCustomerProfile(customerProfileId) {
        return this.createQueryBuilder('job')
            .where('job.customerProfileId = :customerProfileId', {
            customerProfileId,
        })
            .orderBy('job.createdAt', 'DESC')
            .getMany();
    }
    async findPendingJobs() {
        return this.createQueryBuilder('job')
            .where('job.status = :status', { status: data_import_status_enum_1.DataImportStatus.PENDING })
            .orderBy('job.createdAt', 'ASC')
            .getMany();
    }
    async findCompletedJobs(fromDate) {
        const query = this.createQueryBuilder('job')
            .where('job.status = :status', { status: data_import_status_enum_1.DataImportStatus.SUCCESS })
            .orderBy('job.completedAt', 'DESC');
        if (fromDate) {
            query.andWhere('job.completedAt >= :fromDate', { fromDate });
        }
        return query.getMany();
    }
    async getImportStatsByProfile(customerProfileId) {
        const jobs = await this.findByCustomerProfile(customerProfileId);
        const totalJobs = jobs.length;
        const completedJobs = jobs.filter((job) => job.status === data_import_status_enum_1.DataImportStatus.SUCCESS).length;
        const pendingJobs = jobs.filter((job) => job.status === data_import_status_enum_1.DataImportStatus.PENDING).length;
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
exports.DataImportJobRepository = DataImportJobRepository;
//# sourceMappingURL=data-import-job.repository.js.map