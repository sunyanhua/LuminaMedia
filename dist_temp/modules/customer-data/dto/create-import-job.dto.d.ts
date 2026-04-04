import { SourceType } from '../../../shared/enums/source-type.enum';
export declare class CreateImportJobDto {
    customerProfileId: string;
    sourceType: SourceType;
    filePath?: string;
    fileName?: string;
    recordCount?: number;
    notes?: string;
}
