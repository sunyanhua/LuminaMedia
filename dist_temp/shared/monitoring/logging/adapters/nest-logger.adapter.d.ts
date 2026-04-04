import { LoggerService } from '@nestjs/common';
import { StructuredLoggerService } from '../services/structured-logger.service';
export declare class NestLoggerAdapter implements LoggerService {
    private readonly structuredLogger;
    constructor(structuredLogger: StructuredLoggerService);
    private getModuleFromContext;
    log(message: any, context?: string): void;
    error(message: any, trace?: string, context?: string): void;
    warn(message: any, context?: string): void;
    debug(message: any, context?: string): void;
    verbose(message: any, context?: string): void;
}
