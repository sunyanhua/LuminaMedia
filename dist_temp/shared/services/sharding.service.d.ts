import { Connection } from 'typeorm';
export declare class ShardingService {
    private readonly connection;
    private readonly logger;
    constructor(connection: Connection);
    initializePartitions(tableNames?: string[]): Promise<any[]>;
    partitionTable(tableName: string, partitionCount?: number): Promise<any>;
    getPartitionInfo(tableName: string): Promise<any[]>;
    isTablePartitioned(tableName: string): Promise<boolean>;
    checkTableExists(tableName: string): Promise<boolean>;
    checkColumnExists(tableName: string, columnName: string): Promise<boolean>;
    getAllPartitionStats(): Promise<any[]>;
    analyzePartitionBalance(tableName: string): Promise<any>;
    getTenantDistribution(tableName: string, limit?: number): Promise<any[]>;
    generateMigrationReport(tableName: string): Promise<any>;
    private getRowCount;
    private estimateDowntime;
    monitorPartitionPerformance(tableName: string): Promise<any>;
    private analyzePerformance;
}
