import { StructuredLog } from '../interfaces/structured-log.interface';
import { LogWriter } from '../interfaces/log-writer.interface';
export declare class ConsoleLogWriter implements LogWriter {
    private readonly colors;
    private readonly reset;
    write(log: StructuredLog): Promise<void>;
}
