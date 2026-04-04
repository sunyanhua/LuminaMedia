import { DataImportService } from '../services/data-import.service';
import { DataImportJob } from '../../../entities/data-import-job.entity';
import { CreateImportJobDto } from '../dto/create-import-job.dto';
import { ProcessImportDto } from '../dto/process-import.dto';
export declare class DataImportController {
    private readonly dataImportService;
    constructor(dataImportService: DataImportService);
    createImportJobForProfile(profileId: string, createDto: CreateImportJobDto): Promise<DataImportJob>;
    createImportJob(createDto: CreateImportJobDto): Promise<DataImportJob>;
    getImportJob(id: string): Promise<DataImportJob>;
    getImportJobsByProfile(profileId: string): Promise<DataImportJob[]>;
    processImportFile(id: string, processDto: ProcessImportDto): Promise<DataImportJob>;
    cancelImportJob(id: string): Promise<DataImportJob>;
    retryImportJob(id: string): Promise<DataImportJob>;
    getImportStats(profileId: string): Promise<Record<string, any>>;
    validateImportData(id: string, validationRules?: Record<string, any>): Promise<{
        isValid: boolean;
        issues: Array<{
            severity: 'error' | 'warning' | 'info';
            message: string;
            field?: string;
            row?: number;
        }>;
        summary: Record<string, any>;
    }>;
    getSourceTypes(): {
        value: string;
        label: string;
    }[];
    getImportStatuses(): {
        value: string;
        label: string;
    }[];
    private getSourceTypeLabel;
    private getImportStatusLabel;
}
