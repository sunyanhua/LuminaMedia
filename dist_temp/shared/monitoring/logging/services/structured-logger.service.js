"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredLoggerService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const file_log_writer_service_1 = require("../writers/file-log-writer.service");
const console_log_writer_service_1 = require("../writers/console-log-writer.service");
let StructuredLoggerService = class StructuredLoggerService {
    writers = [];
    requestIdMap = new Map();
    serviceName;
    environment;
    constructor(writers) {
        this.serviceName = process.env.SERVICE_NAME || 'lumina-media';
        this.environment = process.env.NODE_ENV || 'development';
        this.writers = writers || [new console_log_writer_service_1.ConsoleLogWriter(), new file_log_writer_service_1.FileLogWriter()];
    }
    generateRequestId() {
        return (0, uuid_1.v4)();
    }
    setRequestId(requestId) {
        this.requestIdMap.set('current', requestId);
    }
    getCurrentRequestId() {
        return this.requestIdMap.get('current') || 'unknown';
    }
    createBaseLog(level, module, action, status) {
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
    async log(level, module, action, status, options) {
        const timestamp = new Date().toISOString();
        const requestId = options?.requestId || this.getCurrentRequestId();
        const log = {
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
        await Promise.allSettled(this.writers.map((writer) => writer.write(log).catch((err) => {
            console.error(`Failed to write log to writer: ${err.message}`);
        })));
    }
    info(module, action, options) {
        return this.log('info', module, action, options?.status || 'success', options);
    }
    error(module, action, error, options) {
        const errorObj = typeof error === 'string' ? new Error(error) : error;
        return this.log('error', module, action, 'failure', {
            ...options,
            errorCode: errorObj.name,
            errorMessage: errorObj.message,
        });
    }
    warn(module, action, message, options) {
        return this.log('warn', module, action, 'partial', {
            ...options,
            errorMessage: message,
        });
    }
    debug(module, action, options) {
        return this.log('debug', module, action, options?.status || 'success', options);
    }
    verbose(module, action, options) {
        return this.log('verbose', module, action, options?.status || 'success', options);
    }
    async measure(module, action, operation, options) {
        const startTime = Date.now();
        const requestId = options?.requestId || this.getCurrentRequestId();
        try {
            const result = await (typeof operation === 'function'
                ? operation()
                : operation);
            const duration = Date.now() - startTime;
            await this.log('info', module, action, 'success', {
                ...options,
                requestId,
                duration,
            });
            return result;
        }
        catch (error) {
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
        await Promise.allSettled(this.writers.map((writer) => writer.close?.().catch((err) => {
            console.error(`Failed to close log writer: ${err.message}`);
        })));
    }
};
exports.StructuredLoggerService = StructuredLoggerService;
exports.StructuredLoggerService = StructuredLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, common_1.Inject)('LOG_WRITERS')),
    __metadata("design:paramtypes", [Array])
], StructuredLoggerService);
//# sourceMappingURL=structured-logger.service.js.map