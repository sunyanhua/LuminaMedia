import { Module, Global, LoggerService } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StructuredLoggerService } from './services/structured-logger.service';
import { FileLogWriter } from './writers/file-log-writer.service';
import { ConsoleLogWriter } from './writers/console-log-writer.service';
import { NestLoggerAdapter } from './adapters/nest-logger.adapter';
import { LogAnalysisService } from './services/log-analysis.service';
import { LogAlertService } from './services/log-alert.service';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    StructuredLoggerService,
    FileLogWriter,
    ConsoleLogWriter,
    NestLoggerAdapter,
    LogAnalysisService,
    LogAlertService,
    {
      provide: 'LOG_WRITERS',
      useFactory: (consoleWriter: ConsoleLogWriter, fileWriter: FileLogWriter) => {
        const writers = [consoleWriter, fileWriter];

        // 根据环境决定是否启用文件写入器
        if (process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGGING === 'true') {
          return writers;
        }

        // 开发环境默认只使用控制台写入器
        return [consoleWriter];
      },
      inject: [ConsoleLogWriter, FileLogWriter],
    },
    // 提供LoggerService作为NestLoggerAdapter
    {
      provide: LoggerService,
      useExisting: NestLoggerAdapter,
    },
  ],
  exports: [StructuredLoggerService, LoggerService, LogAnalysisService, LogAlertService],
})
export class LoggingModule {}