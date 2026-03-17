import { DataImportStatus } from '../../../shared/enums/data-import-status.enum';
import { SourceType } from '../../../shared/enums/source-type.enum';

export interface ImportJobSummary {
  id: string;
  customerProfileId: string;
  sourceType: SourceType;
  fileName: string | null;
  filePath: string | null;
  recordCount: number;
  processedRecords: number;
  failedRecords: number;
  status: DataImportStatus;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  notes: string;
  validationErrors: Record<string, any>[];
  summary: Record<string, any>;
}

export interface ImportValidationResult {
  isValid: boolean;
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    message: string;
    field?: string;
    row?: number;
  }>;
  summary: {
    totalRecordsChecked: number;
    validationRulesApplied: Record<string, any>;
    dataQualityScore: number;
    completeness: number;
    accuracy: number;
    consistency: number;
  };
}

export interface ImportStats {
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  processingJobs: number;
  failedJobs: number;
  totalRecords: number;
  totalProcessed: number;
  totalFailed: number;
  successRate: string;
  lastImport: Date | null;
}
