import { withRetry, RetryableError, NonRetryableError, sleep, createRetryWrapper, cloudServiceRetryOptions, RetryOptions } from './retry';

jest.setTimeout(10000);

describe('Retry utilities', () => {
  describe('sleep', () => {
    it('should resolve after specified milliseconds', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(200);
    });
  });

  describe('RetryableError and NonRetryableError', () => {
    it('should create RetryableError with message and original error', () => {
      const original = new Error('original');
      const error = new RetryableError('retryable', original);
      expect(error.message).toBe('retryable');
      expect(error.originalError).toBe(original);
      expect(error.name).toBe('RetryableError');
    });

    it('should create NonRetryableError with message and original error', () => {
      const original = new Error('original');
      const error = new NonRetryableError('non-retryable', original);
      expect(error.message).toBe('non-retryable');
      expect(error.originalError).toBe(original);
      expect(error.name).toBe('NonRetryableError');
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      jest.useFakeTimers({ legacyFakeTimers: true });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return result immediately if operation succeeds', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await withRetry(operation);
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('网络错误'))
        .mockResolvedValueOnce('success');

      const promise = withRetry(operation, { maxAttempts: 2, initialDelay: 100 });
      // Advance timers for the retry delay
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should throw NonRetryableError after max attempts', async () => {
      const operation = jest.fn()
        .mockRejectedValue(new Error('网络错误'));

      const promise = withRetry(operation, { maxAttempts: 2, initialDelay: 100 });
      jest.advanceTimersByTime(100); // first retry
      jest.advanceTimersByTime(200); // second retry? Actually maxAttempts=2 means first attempt + 1 retry

      await expect(promise).rejects.toThrow(NonRetryableError);
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable error', async () => {
      const operation = jest.fn()
        .mockRejectedValue(new Error('some other error'));

      const promise = withRetry(operation, { maxAttempts: 3, initialDelay: 100 });
      // No timers needed because no retry
      await expect(promise).rejects.toThrow(NonRetryableError);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should use custom retryableErrors patterns', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('custom retryable error'))
        .mockResolvedValueOnce('success');

      const promise = withRetry(operation, {
        maxAttempts: 2,
        initialDelay: 100,
        retryableErrors: ['custom retryable']
      });
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should call onRetry callback on each retry', async () => {
      const onRetry = jest.fn();
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('网络错误'))
        .mockRejectedValueOnce(new Error('网络错误'))
        .mockResolvedValueOnce('success');

      const promise = withRetry(operation, {
        maxAttempts: 3,
        initialDelay: 100,
        onRetry
      });
      jest.advanceTimersByTime(100); // first retry delay
      jest.advanceTimersByTime(200); // second retry delay (backoff)
      const result = await promise;

      expect(result).toBe('success');
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1, 100);
      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 2, 200);
    });
  });

  describe('createRetryWrapper', () => {
    it('should create a wrapper function with preset options', async () => {
      const wrapper = createRetryWrapper({ maxAttempts: 2, initialDelay: 50 });
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('网络错误'))
        .mockResolvedValueOnce('success');

      // Need to handle timers in wrapper
      jest.useFakeTimers({ legacyFakeTimers: true });
      const promise = wrapper(operation);
      jest.advanceTimersByTime(50);
      const result = await promise;
      jest.useRealTimers();

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('cloudServiceRetryOptions', () => {
    it('should have default cloud service retry options', () => {
      expect(cloudServiceRetryOptions.maxAttempts).toBe(3);
      expect(cloudServiceRetryOptions.initialDelay).toBe(1000);
      expect(cloudServiceRetryOptions.maxDelay).toBe(10000);
      expect(cloudServiceRetryOptions.backoffFactor).toBe(2);
      expect(cloudServiceRetryOptions.retryableErrors).toHaveLength(10);
      expect(cloudServiceRetryOptions.onRetry).toBeDefined();
    });
  });
});