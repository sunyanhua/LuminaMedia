import type { Job } from 'bull';
export declare class DataCollectionProcessor {
    private readonly logger;
    handleCollectionJob(job: Job): Promise<{
        success: boolean;
        message: string;
    }>;
}
