import { Injectable, LoggerService } from '@nestjs/common';
import { StructuredLoggerService } from '../services/structured-logger.service';

/**
 * NestJS LoggerService适配器
 * 将NestJS默认Logger替换为结构化Logger
 */
@Injectable()
export class NestLoggerAdapter implements LoggerService {
  constructor(private readonly structuredLogger: StructuredLoggerService) {}

  private getModuleFromContext(context?: string): string {
    if (!context) {
      return 'unknown';
    }

    // 提取模块名称，例如从 "UserController" 或 "UserService"
    const parts = context.split(/[\.\/]/);
    return parts[parts.length - 1] || context;
  }

  log(message: any, context?: string) {
    const module = this.getModuleFromContext(context);
    this.structuredLogger
      .info(module, 'log', { extra: { message: String(message) } })
      .catch((err) => {
        // 如果结构化日志失败，回退到控制台
        console.error('Failed to write structured log:', err);
        console.log(`[${context}] ${message}`);
      });
  }

  error(message: any, trace?: string, context?: string) {
    const module = this.getModuleFromContext(context);
    const errorMessage =
      typeof message === 'string' ? message : String(message);
    const fullMessage = trace ? `${errorMessage}\n${trace}` : errorMessage;

    this.structuredLogger
      .error(module, 'error', new Error(errorMessage), {
        extra: { trace, fullMessage },
      })
      .catch((err) => {
        console.error('Failed to write structured error log:', err);
        console.error(`[${context}] ${fullMessage}`);
      });
  }

  warn(message: any, context?: string) {
    const module = this.getModuleFromContext(context);
    this.structuredLogger
      .warn(module, 'warn', String(message), {
        extra: { message: String(message) },
      })
      .catch((err) => {
        console.error('Failed to write structured warn log:', err);
        console.warn(`[${context}] ${message}`);
      });
  }

  debug(message: any, context?: string) {
    const module = this.getModuleFromContext(context);
    this.structuredLogger
      .debug(module, 'debug', { extra: { message: String(message) } })
      .catch((err) => {
        console.error('Failed to write structured debug log:', err);
        console.debug(`[${context}] ${message}`);
      });
  }

  verbose(message: any, context?: string) {
    const module = this.getModuleFromContext(context);
    this.structuredLogger
      .verbose(module, 'verbose', { extra: { message: String(message) } })
      .catch((err) => {
        console.error('Failed to write structured verbose log:', err);
        console.log(`[${context}] ${message}`);
      });
  }
}
