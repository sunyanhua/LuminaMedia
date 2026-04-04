"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudServiceRetryOptions = exports.NonRetryableError = exports.RetryableError = void 0;
exports.withRetry = withRetry;
exports.sleep = sleep;
exports.createRetryWrapper = createRetryWrapper;
class RetryableError extends Error {
    originalError;
    constructor(message, originalError) {
        super(message);
        this.originalError = originalError;
        this.name = 'RetryableError';
    }
}
exports.RetryableError = RetryableError;
class NonRetryableError extends Error {
    originalError;
    constructor(message, originalError) {
        super(message);
        this.originalError = originalError;
        this.name = 'NonRetryableError';
    }
}
exports.NonRetryableError = NonRetryableError;
async function withRetry(operation, options = {}) {
    const { maxAttempts = 3, initialDelay = 1000, maxDelay = 10000, backoffFactor = 2, retryableErrors = [/网络错误/i, /超时/i, /服务不可用/i, /连接失败/i], onRetry, } = options;
    let lastError;
    let delay = initialDelay;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            const isRetryable = isErrorRetryable(lastError, retryableErrors);
            if (!isRetryable || attempt === maxAttempts) {
                throw new NonRetryableError(`操作失败，已重试 ${attempt - 1} 次: ${lastError.message}`, lastError);
            }
            if (onRetry) {
                onRetry(lastError, attempt, delay);
            }
            console.warn(`[Retry] 操作失败，第 ${attempt}/${maxAttempts} 次重试，延迟 ${delay}ms: ${lastError.message}`);
            await sleep(delay);
            delay = Math.min(delay * backoffFactor, maxDelay);
        }
    }
    throw lastError;
}
function isErrorRetryable(error, retryablePatterns) {
    const errorMessage = error.message.toLowerCase();
    if (error instanceof RetryableError) {
        return true;
    }
    if (error instanceof NonRetryableError) {
        return false;
    }
    for (const pattern of retryablePatterns) {
        if (typeof pattern === 'string') {
            if (errorMessage.includes(pattern.toLowerCase())) {
                return true;
            }
        }
        else if (pattern.test(error.message)) {
            return true;
        }
    }
    return false;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function createRetryWrapper(options) {
    return function retryWrapper(operation) {
        return withRetry(operation, options);
    };
}
exports.cloudServiceRetryOptions = {
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
        /timeout/i,
    ],
    onRetry: (error, attempt, delay) => {
        console.warn(`[CloudService Retry] 第 ${attempt} 次重试，延迟 ${delay}ms: ${error.message}`);
    },
};
//# sourceMappingURL=retry.js.map