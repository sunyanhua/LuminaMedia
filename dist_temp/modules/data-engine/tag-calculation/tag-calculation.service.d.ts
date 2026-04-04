import { Repository, DataSource } from 'typeorm';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
export interface TagCalculationResult {
    success: boolean;
    processedCount: number;
    error?: string;
    executionTime: number;
    tagUpdates: Record<string, number>;
}
export interface TagDefinition {
    name: string;
    description: string;
    sqlTemplate: string;
    refreshInterval: 'daily' | 'weekly' | 'monthly' | 'manual';
    dependsOn?: string[];
    parameters?: Record<string, any>;
}
export declare class TagCalculatorService {
    private readonly customerProfileRepository;
    private readonly dataSource;
    private readonly logger;
    private calculationInProgress;
    constructor(customerProfileRepository: Repository<CustomerProfile>, dataSource: DataSource);
    calculateTags(tagName?: string, forceRecalculate?: boolean): Promise<TagCalculationResult>;
    getTagDefinitions(): TagDefinition[];
    private sortTagsByDependency;
    private executeTagCalculation;
    private updateCustomerTags;
    private batchUpdateCustomerTags;
}
