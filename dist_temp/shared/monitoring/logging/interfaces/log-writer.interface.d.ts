import { StructuredLog } from './structured-log.interface';
export interface LogWriter {
    write(log: StructuredLog): Promise<void>;
    flush?(): Promise<void>;
    close?(): Promise<void>;
}
