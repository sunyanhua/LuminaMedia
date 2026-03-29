import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createWriteStream, WriteStream, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { StructuredLog } from '../interfaces/structured-log.interface';
import { LogWriter } from '../interfaces/log-writer.interface';

@Injectable()
export class FileLogWriter implements LogWriter, OnModuleDestroy {
  private stream: WriteStream;
  private readonly logDir: string;
  private readonly logFile: string;

  constructor() {
    // 确定日志目录 - 优先使用环境变量，否则使用项目根目录下的logs目录
    this.logDir = process.env.LOG_DIR || join(process.cwd(), 'logs');
    this.logFile = join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);

    // 创建日志目录
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }

    // 创建写入流，使用flags: 'a'进行追加
    this.stream = createWriteStream(this.logFile, {
      flags: 'a',
      encoding: 'utf8',
    });

    // 写入启动日志
    const startupLog = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      service: 'lumina-media',
      module: 'logging',
      action: 'initialize',
      status: 'success',
      requestId: 'system-startup',
      environment: process.env.NODE_ENV || 'development',
      message: `Log file initialized: ${this.logFile}`,
    });

    this.stream.write(startupLog + '\n');
  }

  async write(log: StructuredLog): Promise<void> {
    return new Promise((resolve, reject) => {
      const logLine = JSON.stringify(log);
      this.stream.write(logLine + '\n', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async flush(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stream.write('', 'utf8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stream.end(() => {
        resolve();
      });
    });
  }

  onModuleDestroy() {
    this.close().catch(console.error);
  }
}