"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLogWriter = void 0;
const common_1 = require("@nestjs/common");
let ConsoleLogWriter = class ConsoleLogWriter {
    colors = {
        debug: '\x1b[36m',
        info: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
        verbose: '\x1b[35m',
    };
    reset = '\x1b[0m';
    async write(log) {
        const color = this.colors[log.level] || this.reset;
        const timestamp = new Date(log.timestamp).toISOString();
        const levelStr = log.level.toUpperCase().padEnd(7);
        const moduleStr = `[${log.service}/${log.module}]`.padEnd(30);
        const actionStr = log.action.padEnd(20);
        console.log(`${color}${timestamp} ${levelStr} ${moduleStr} ${actionStr} - ${log.status}${this.reset}`);
        if (log.errorMessage) {
            console.log(`${color}  ↳ Error: ${log.errorCode || 'NO_CODE'} - ${log.errorMessage}${this.reset}`);
        }
        if (log.extra && process.env.NODE_ENV === 'development') {
            console.log(`${color}  ↳ Extra:`, log.extra, `${this.reset}`);
        }
    }
};
exports.ConsoleLogWriter = ConsoleLogWriter;
exports.ConsoleLogWriter = ConsoleLogWriter = __decorate([
    (0, common_1.Injectable)()
], ConsoleLogWriter);
//# sourceMappingURL=console-log-writer.service.js.map