/**
 * 重试工具类
 * 提供统一的错误处理和重试机制
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number; // 毫秒
  maxDelay?: number; // 毫秒
  backoffFactor?: number;
  retryableErrors?: Array<string | RegExp>;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

export class RetryableError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'RetryableError';
  }
}

export class NonRetryableError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

/**
 * 执行带有重试机制的异步操作
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryableErrors = [/网络错误/i, /超时/i, /服务不可用/i, /连接失败/i],
    onRetry
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 检查是否可重试
      const isRetryable = isErrorRetryable(lastError, retryableErrors);

      if (!isRetryable || attempt === maxAttempts) {
        throw new NonRetryableError(
          `操作失败，已重试 ${attempt - 1} 次: ${lastError.message}`,
          lastError
        );
      }

      // 触发重试回调
      if (onRetry) {
        onRetry(lastError, attempt, delay);
      }

      console.warn(`[Retry] 操作失败，第 ${attempt}/${maxAttempts} 次重试，延迟 ${delay}ms: ${lastError.message}`);

      // 等待延迟
      await sleep(delay);

      // 计算下一次延迟（指数退避）
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  // 理论上不会执行到这里
  throw lastError!;
}

/**
 * 检查错误是否可重试
 */
function isErrorRetryable(error: Error, retryablePatterns: Array<string | RegExp>): boolean {
  const errorMessage = error.message.toLowerCase();

  // 如果错误是RetryableError，则总是可重试
  if (error instanceof RetryableError) {
    return true;
  }

  // 如果错误是NonRetryableError，则总是不可重试
  if (error instanceof NonRetryableError) {
    return false;
  }

  // 检查错误消息是否匹配可重试模式
  for (const pattern of retryablePatterns) {
    if (typeof pattern === 'string') {
      if (errorMessage.includes(pattern.toLowerCase())) {
        return true;
      }
    } else if (pattern.test(error.message)) {
      return true;
    }
  }

  return false;
}

/**
 * 延迟函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 创建重试包装器
 */
export function createRetryWrapper(options: RetryOptions) {
  return function retryWrapper<T>(operation: () => Promise<T>): Promise<T> {
    return withRetry(operation, options);
  };
}

/**
 * 云服务默认重试配置
 */
export const cloudServiceRetryOptions: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [
    /网络错误/i,
    /超时/i,
    /服务不可用/i,
    /连接失败/i,
    /限流/i,
    /too many requests/i,
    /rate limit/i,
    /service unavailable/i,
    /connection refused/i,
    /timeout/i
  ],
  onRetry: (error, attempt, delay) => {
    console.warn(`[CloudService Retry] 第 ${attempt} 次重试，延迟 ${delay}ms: ${error.message}`);
  }
};