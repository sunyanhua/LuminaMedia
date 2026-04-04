import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApmService, ApmConfig } from '../../interfaces/apm.interface';
export declare class SkywalkingApmService implements ApmService, OnModuleInit {
    private configService;
    private readonly logger;
    private config;
    private isInitialized;
    private skywalkingAgent;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    createCustomTrace(operation: string, tags?: Record<string, any>, logs?: Record<string, any>): void;
    recordError(error: Error, context?: Record<string, any>): void;
    recordMetric(name: string, value: number, tags?: Record<string, string>): void;
    private loadConfig;
    private createMockAgent;
    getConfig(): ApmConfig;
    getStatus(): {
        initialized: boolean;
        serviceName: string;
        enabled: boolean;
    };
}
