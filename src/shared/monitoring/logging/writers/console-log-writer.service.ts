import { Injectable } from '@nestjs/common';
import { StructuredLog } from '../interfaces/structured-log.interface';
import { LogWriter } from '../interfaces/log-writer.interface';

@Injectable()
export class ConsoleLogWriter implements LogWriter {
  private readonly colors = {
    debug: '\x1b[36m', // 青色
    info: '\x1b[32m',  // 绿色
    warn: '\x1b[33m',  // 黄色
    error: '\x1b[31m', // 红色
    verbose: '\x1b[35m', // 紫色
  };

  private readonly reset = '\x1b[0m';

  async write(log: StructuredLog): Promise<void> {
    const color = this.colors[log.level] || this.reset;
    const timestamp = new Date(log.timestamp).toISOString();

    // 格式化控制台输出
    const levelStr = log.level.toUpperCase().padEnd(7);
    const moduleStr = `[${log.service}/${log.module}]`.padEnd(30);
    const actionStr = log.action.padEnd(20);

    console.log(
      `${color}${timestamp} ${levelStr} ${moduleStr} ${actionStr} - ${log.status}${this.reset}`,
    );

    // 如果有错误信息，额外打印
    if (log.errorMessage) {
      console.log(`${color}  ↳ Error: ${log.errorCode || 'NO_CODE'} - ${log.errorMessage}${this.reset}`);
    }

    // 如果有额外信息，在调试模式下打印
    if (log.extra && process.env.NODE_ENV === 'development') {
      console.log(`${color}  ↳ Extra:`, log.extra, `${this.reset}`);
    }
  }
}