"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const structured_logger_service_1 = require("./services/structured-logger.service");
const file_log_writer_service_1 = require("./writers/file-log-writer.service");
const console_log_writer_service_1 = require("./writers/console-log-writer.service");
const nest_logger_adapter_1 = require("./adapters/nest-logger.adapter");
const log_analysis_service_1 = require("./services/log-analysis.service");
const log_alert_service_1 = require("./services/log-alert.service");
let LoggingModule = class LoggingModule {
};
exports.LoggingModule = LoggingModule;
exports.LoggingModule = LoggingModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot()],
        providers: [
            structured_logger_service_1.StructuredLoggerService,
            file_log_writer_service_1.FileLogWriter,
            console_log_writer_service_1.ConsoleLogWriter,
            nest_logger_adapter_1.NestLoggerAdapter,
            log_analysis_service_1.LogAnalysisService,
            log_alert_service_1.LogAlertService,
            {
                provide: 'ELASTICSEARCH_SERVICE',
                useValue: null,
            },
            {
                provide: 'LOG_WRITERS',
                useFactory: (consoleWriter, fileWriter) => {
                    const writers = [consoleWriter, fileWriter];
                    if (process.env.NODE_ENV === 'production' ||
                        process.env.ENABLE_FILE_LOGGING === 'true') {
                        return writers;
                    }
                    return [consoleWriter];
                },
                inject: [console_log_writer_service_1.ConsoleLogWriter, file_log_writer_service_1.FileLogWriter],
            },
        ],
        exports: [
            structured_logger_service_1.StructuredLoggerService,
            nest_logger_adapter_1.NestLoggerAdapter,
            log_analysis_service_1.LogAnalysisService,
            log_alert_service_1.LogAlertService,
        ],
    })
], LoggingModule);
//# sourceMappingURL=logging.module.js.map