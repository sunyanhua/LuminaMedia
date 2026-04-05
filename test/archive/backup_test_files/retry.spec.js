"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const retry_1 = require("./retry");
jest.setTimeout(10000);
describe('Retry utilities', () => {
    describe('sleep', () => {
        it('should resolve after specified milliseconds', async () => {
            const start = Date.now();
            await (0, retry_1.sleep)(100);
            const elapsed = Date.now() - start;
            expect(elapsed).toBeGreaterThanOrEqual(90);
            expect(elapsed).toBeLessThanOrEqual(200);
        });
    });
    describe('RetryableError and NonRetryableError', () => {
        it('should create RetryableError with message and original error', () => {
            const original = new Error('original');
            const error = new retry_1.RetryableError('retryable', original);
            expect(error.message).toBe('retryable');
            expect(error.originalError).toBe(original);
            expect(error.name).toBe('RetryableError');
        });
        it('should create NonRetryableError with message and original error', () => {
            const original = new Error('original');
            const error = new retry_1.NonRetryableError('non-retryable', original);
            expect(error.message).toBe('non-retryable');
            expect(error.originalError).toBe(original);
            expect(error.name).toBe('NonRetryableError');
        });
    });
    describe('withRetry', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });
        afterEach(() => {
            jest.useRealTimers();
        });
        it('should return result immediately if operation succeeds', async () => {
            const operation = jest.fn().mockResolvedValue('success');
            const result = await (0, retry_1.withRetry)(operation);
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(1);
        });
        it('should retry on retryable error and eventually succeed', async () => {
            const operation = jest
                .fn()
                .mockRejectedValueOnce(new Error('网络错误'))
                .mockResolvedValueOnce('success');
            const promise = (0, retry_1.withRetry)(operation, {
                maxAttempts: 2,
                initialDelay: 100,
            });
            await jest.advanceTimersByTimeAsync(100);
            const result = await promise;
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(2);
        });
        it.skip('should throw NonRetryableError after max attempts', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('网络错误'));
            const promise = (0, retry_1.withRetry)(operation, {
                maxAttempts: 2,
                initialDelay: 100,
            });
            await jest.advanceTimersByTimeAsync(100);
            await expect(promise).rejects.toThrow(retry_1.NonRetryableError);
            expect(operation).toHaveBeenCalledTimes(2);
        });
        it('should not retry on non-retryable error', async () => {
            const operation = jest
                .fn()
                .mockRejectedValue(new Error('some other error'));
            const promise = (0, retry_1.withRetry)(operation, {
                maxAttempts: 3,
                initialDelay: 100,
            });
            await expect(promise).rejects.toThrow(retry_1.NonRetryableError);
            expect(operation).toHaveBeenCalledTimes(1);
        });
        it('should use custom retryableErrors patterns', async () => {
            const operation = jest
                .fn()
                .mockRejectedValueOnce(new Error('custom retryable error'))
                .mockResolvedValueOnce('success');
            const promise = (0, retry_1.withRetry)(operation, {
                maxAttempts: 2,
                initialDelay: 100,
                retryableErrors: ['custom retryable'],
            });
            await jest.advanceTimersByTimeAsync(100);
            const result = await promise;
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(2);
        });
        it('should call onRetry callback on each retry', async () => {
            const onRetry = jest.fn();
            const operation = jest
                .fn()
                .mockRejectedValueOnce(new Error('网络错误'))
                .mockRejectedValueOnce(new Error('网络错误'))
                .mockResolvedValueOnce('success');
            const promise = (0, retry_1.withRetry)(operation, {
                maxAttempts: 3,
                initialDelay: 100,
                onRetry,
            });
            await jest.advanceTimersByTimeAsync(100);
            await jest.advanceTimersByTimeAsync(200);
            const result = await promise;
            expect(result).toBe('success');
            expect(onRetry).toHaveBeenCalledTimes(2);
            expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1, 100);
            expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 2, 200);
        });
    });
    describe('createRetryWrapper', () => {
        it('should create a wrapper function with preset options', async () => {
            const wrapper = (0, retry_1.createRetryWrapper)({ maxAttempts: 2, initialDelay: 50 });
            const operation = jest
                .fn()
                .mockRejectedValueOnce(new Error('网络错误'))
                .mockResolvedValueOnce('success');
            jest.useFakeTimers();
            const promise = wrapper(operation);
            await jest.advanceTimersByTimeAsync(50);
            const result = await promise;
            jest.useRealTimers();
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(2);
        });
    });
    describe('cloudServiceRetryOptions', () => {
        it('should have default cloud service retry options', () => {
            expect(retry_1.cloudServiceRetryOptions.maxAttempts).toBe(3);
            expect(retry_1.cloudServiceRetryOptions.initialDelay).toBe(1000);
            expect(retry_1.cloudServiceRetryOptions.maxDelay).toBe(10000);
            expect(retry_1.cloudServiceRetryOptions.backoffFactor).toBe(2);
            expect(retry_1.cloudServiceRetryOptions.retryableErrors).toHaveLength(10);
            expect(retry_1.cloudServiceRetryOptions.onRetry).toBeDefined();
        });
    });
});
//# sourceMappingURL=retry.spec.js.map