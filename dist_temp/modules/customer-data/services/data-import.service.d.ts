import { DataImportJob } from '../../../entities/data-import-job.entity';
import { SourceType } from '../../../shared/enums/source-type.enum';
import { DataImportJobRepository } from '../../../shared/repositories/data-import-job.repository';
import { CustomerProfileRepository } from '../../../shared/repositories/customer-profile.repository';
export declare class DataImportService {
    private dataImportJobRepository;
    private customerProfileRepository;
    constructor(dataImportJobRepository: DataImportJobRepository, customerProfileRepository: CustomerProfileRepository);
    createImportJob(customerProfileId: string, sourceType: SourceType, filePath?: string, originalFilename?: string, recordCount?: number, notes?: string): Promise<DataImportJob>;
    getImportJob(id: string): Promise<DataImportJob>;
    getImportJobsByProfile(customerProfileId: string): Promise<DataImportJob[]>;
    processImportFile(importJobId: string, fileContent?: string): Promise<DataImportJob>;
    private mockFileProcessing;
    cancelImportJob(importJobId: string): Promise<DataImportJob>;
    retryImportJob(importJobId: string): Promise<DataImportJob>;
    getImportStats(customerProfileId: string): Promise<Record<string, any>>;
    validateImportData(importJobId: string, validationRules?: Record<string, any>): Promise<{
        isValid: boolean;
        issues: Array<{
            severity: 'error' | 'warning' | 'info';
            message: string;
            field?: string;
            row?: number;
        }>;
        summary: Record<string, any>;
    }>;
}
