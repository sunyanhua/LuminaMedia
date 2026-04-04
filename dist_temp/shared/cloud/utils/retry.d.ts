export interface RetryOptions {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    retryableErrors?: Array<string | RegExp>;
    onRetry?: (error: Error, attempt: number, delay: number) => void;
}
export declare class RetryableError extends Error {
    readonly originalError?: Error | undefined;
    constructor(message: string, originalError?: Error | undefined);
}
export declare class NonRetryableError extends Error {
    readonly originalError?: Error | undefined;
    constructor(message: string, originalError?: Error | undefined);
}
export declare function withRetry<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T>;
export declare function sleep(ms: number): Promise<void>;
export declare function createRetryWrapper(options: RetryOptions): <T>(operation: () => Promise<T>) => Promise<T>;
export declare const cloudServiceRetryOptions: RetryOptions;
