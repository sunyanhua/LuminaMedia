import { OnModuleDestroy } from '@nestjs/common';
import { StructuredLog } from '../interfaces/structured-log.interface';
import { LogWriter } from '../interfaces/log-writer.interface';
export declare class FileLogWriter implements LogWriter, OnModuleDestroy {
    private stream;
    private readonly logDir;
    private readonly logFile;
    constructor();
    write(log: StructuredLog): Promise<void>;
    flush(): Promise<void>;
    close(): Promise<void>;
    onModuleDestroy(): void;
}
