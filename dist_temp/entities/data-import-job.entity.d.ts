import { CustomerProfile } from './customer-profile.entity';
import { SourceType } from '../shared/enums/source-type.enum';
import { DataImportStatus } from '../shared/enums/data-import-status.enum';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';
export declare class DataImportJob implements TenantEntity {
    id: string;
    tenantId: string;
    customerProfileId: string;
    customerProfile: CustomerProfile;
    sourceType: SourceType;
    filePath: string | null;
    originalFilename: string | null;
    recordCount: number;
    successCount: number;
    failedCount: number;
    status: DataImportStatus;
    errorMessage: string;
    validationErrors: Record<string, any>[];
    summary: Record<string, any>;
    notes: string;
    importData: Record<string, any>;
    createdAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
}
