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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestLoggerAdapter = void 0;
const common_1 = require("@nestjs/common");
const structured_logger_service_1 = require("../services/structured-logger.service");
let NestLoggerAdapter = class NestLoggerAdapter {
    structuredLogger;
    constructor(structuredLogger) {
        this.structuredLogger = structuredLogger;
    }
    getModuleFromContext(context) {
        if (!context) {
            return 'unknown';
        }
        const parts = context.split(/[\.\/]/);
        return parts[parts.length - 1] || context;
    }
    log(message, context) {
        const module = this.getModuleFromContext(context);
        this.structuredLogger
            .info(module, 'log', { extra: { message: String(message) } })
            .catch((err) => {
            console.error('Failed to write structured log:', err);
            console.log(`[${context}] ${message}`);
        });
    }
    error(message, trace, context) {
        const module = this.getModuleFromContext(context);
        const errorMessage = typeof message === 'string' ? message : String(message);
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
    warn(message, context) {
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
    debug(message, context) {
        const module = this.getModuleFromContext(context);
        this.structuredLogger
            .debug(module, 'debug', { extra: { message: String(message) } })
            .catch((err) => {
            console.error('Failed to write structured debug log:', err);
            console.debug(`[${context}] ${message}`);
        });
    }
    verbose(message, context) {
        const module = this.getModuleFromContext(context);
        this.structuredLogger
            .verbose(module, 'verbose', { extra: { message: String(message) } })
            .catch((err) => {
            console.error('Failed to write structured verbose log:', err);
            console.log(`[${context}] ${message}`);
        });
    }
};
exports.NestLoggerAdapter = NestLoggerAdapter;
exports.NestLoggerAdapter = NestLoggerAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [structured_logger_service_1.StructuredLoggerService])
], NestLoggerAdapter);
//# sourceMappingURL=nest-logger.adapter.js.map