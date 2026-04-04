import { Repository } from 'typeorm';
import type { Queue } from 'bull';
import { DataCollectionTask } from '../entities/data-collection-task.entity';
import { PlatformConfig } from '../entities/platform-config.entity';
import { TaskStatus, PlatformType } from '../interfaces/data-collection.interface';
export declare class DataCollectionSchedulerService {
    private taskRepository;
    private platformConfigRepository;
    private dataCollectionQueue;
    private readonly logger;
    constructor(taskRepository: Repository<DataCollectionTask>, platformConfigRepository: Repository<PlatformConfig>, dataCollectionQueue: Queue);
    schedulePendingTasks(): Promise<number>;
    createCollectionTask(data: {
        tenantId: string;
        platform: PlatformType;
        method?: string;
        config?: any;
        scheduledAt?: Date;
    }): Promise<DataCollectionTask>;
    batchCreateTasks(tasks: Array<{
        tenantId: string;
        platform: PlatformType;
        method?: string;
        config?: any;
        scheduledAt?: Date;
    }>): Promise<DataCollectionTask[]>;
    getTaskStatus(taskId: string): Promise<{
        status: TaskStatus;
        progress: number;
        result?: any;
        errorMessage?: string;
    }>;
    cancelTask(taskId: string): Promise<boolean>;
    private rescheduleTask;
    private markTaskAsFailed;
    getPlatformStats(tenantId: string): Promise<Array<{
        platform: PlatformType;
        totalTasks: number;
        completedTasks: number;
        failedTasks: number;
        successRate: number;
        lastCollectionAt: Date | null;
    }>>;
    cleanupOldTasks(days?: number): Promise<number>;
}
