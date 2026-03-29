import { Injectable, Inject, Optional, OnModuleDestroy } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StructuredLog } from '../interfaces/structured-log.interface';
import { LogWriter } from '../interfaces/log-writer.interface';
import { FileLogWriter } from '../writers/file-log-writer.service';
import { ConsoleLogWriter } from '../writers/console-log-writer.service';

@Injectable()
export class StructuredLoggerService implements OnModuleDestroy {
  private readonly writers: LogWriter[] = [];
  private readonly requestIdMap = new Map<string, string>();
  private readonly serviceName: string;
  private readonly environment: string;

  constructor(
    @Optional() @Inject('LOG_WRITERS') writers?: LogWriter[],
  ) {
    this.serviceName = process.env.SERVICE_NAME || 'lumina-media';
    this.environment = process.env.NODE_ENV || 'development';

    // 默认使用控制台和文件写入器
    this.writers = writers || [
      new ConsoleLogWriter(),
      new FileLogWriter(),
    ];
  }

  /**
   * 生成请求ID
   */
  generateRequestId(): string {
    return uuidv4();
  }

  /**
   * 设置当前请求ID（用于异步上下文）
   */
  setRequestId(requestId: string): void {
    // 在异步上下文中存储请求ID
    // 实际实现可能需要使用AsyncLocalStorage或请求上下文
    // 这里简化实现
    this.requestIdMap.set('current', requestId);
  }

  /**
   * 获取当前请求ID
   */
  getCurrentRequestId(): string {
    return this.requestIdMap.get('current') || 'unknown';
  }

  /**
   * 创建基础日志对象
   */
  private createBaseLog(
    level: StructuredLog['level'],
    module: string,
    action: string,
    status: StructuredLog['status'],
  ): Omit<StructuredLog, 'timestamp' | 'requestId'> {
    return {
      level,
      service: this.serviceName,
      module,
      action,
      status,
      environment: this.environment,
      hostname: process.env.HOSTNAME || require('os').hostname(),
      version: process.env.APP_VERSION || '1.0.0',
    };
  }

  /**
   * 记录日志
   */
  async log(
    level: StructuredLog['level'],
    module: string,
    action: string,
    status: StructuredLog['status'],
    options?: {
      userId?: string;
      tenantId?: string;
      duration?: number;
      errorCode?: string;
      errorMessage?: string;
      extra?: Record<string, any>;
      requestId?: string;
    },
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const requestId = options?.requestId || this.getCurrentRequestId();

    const log: StructuredLog = {
      ...this.createBaseLog(level, module, action, status),
      timestamp,
      requestId,
      userId: options?.userId,
      tenantId: options?.tenantId,
      duration: options?.duration,
      errorCode: options?.errorCode,
      errorMessage: options?.errorMessage,
      extra: options?.extra,
    };

    // 并行写入所有写入器
    await Promise.allSettled(
      this.writers.map(writer => writer.write(log).catch(err => {
        // 写入器错误不应影响应用，但可以在控制台记录
        console.error(`Failed to write log to writer: ${err.message}`);
      })),
    );
  }

  /**
   * 快捷方法：信息级别日志
   */
  info(
    module: string,
    action: string,
    options?: Omit<Parameters<typeof this.log>[3], 'level' | 'status'> & { status?: 'success' | 'failure' | 'partial' },
  ): Promise<void> {
    return this.log('info', module, action, options?.status || 'success', options);
  }

  /**
   * 快捷方法：错误级别日志
   */
  error(
    module: string,
    action: string,
    error: Error | string,
    options?: Omit<Parameters<typeof this.log>[3], 'level' | 'status' | 'errorCode' | 'errorMessage'>,
  ): Promise<void> {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    return this.log('error', module, action, 'failure', {
      ...options,
      errorCode: errorObj.name,
      errorMessage: errorObj.message,
    });
  }

  /**
   * 快捷方法：警告级别日志
   */
  warn(
    module: string,
    action: string,
    message: string,
    options?: Omit<Parameters<typeof this.log>[3], 'level' | 'status' | 'errorMessage'>,
  ): Promise<void> {
    return this.log('warn', module, action, 'partial', {
      ...options,
      errorMessage: message,
    });
  }

  /**
   * 快捷方法：调试级别日志
   */
  debug(
    module: string,
    action: string,
    options?: Omit<Parameters<typeof this.log>[3], 'level' | 'status'> & { status?: 'success' | 'failure' | 'partial' },
  ): Promise<void> {
    return this.log('debug', module, action, options?.status || 'success', options);
  }

  /**
   * 快捷方法：详细级别日志
   */
  verbose(
    module: string,
    action: string,
    options?: Omit<Parameters<typeof this.log>[3], 'level' | 'status'> & { status?: 'success' | 'failure' | 'partial' },
  ): Promise<void> {
    return this.log('verbose', module, action, options?.status || 'success', options);
  }

  /**
   * 测量操作耗时
   */
  async measure<T>(
    module: string,
    action: string,
    operation: () => Promise<T> | T,
    options?: Omit<Parameters<typeof this.log>[3], 'level' | 'status' | 'duration'>,
  ): Promise<T> {
    const startTime = Date.now();
    const requestId = options?.requestId || this.getCurrentRequestId();

    try {
      const result = await (typeof operation === 'function' ? operation() : operation);
      const duration = Date.now() - startTime;

      await this.log('info', module, action, 'success', {
        ...options,
        requestId,
        duration,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorObj = error instanceof Error ? error : new Error(String(error));

      await this.log('error', module, action, 'failure', {
        ...options,
        requestId,
        duration,
        errorCode: errorObj.name,
        errorMessage: errorObj.message,
      });

      throw error;
    }
  }

  async onModuleDestroy() {
    // 关闭所有写入器
    await Promise.allSettled(
      this.writers.map(writer => writer.close?.().catch(err => {
        console.error(`Failed to close log writer: ${err.message}`);
      })),
    );
  }
}