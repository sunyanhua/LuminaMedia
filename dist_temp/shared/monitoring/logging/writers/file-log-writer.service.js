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
exports.FileLogWriter = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
let FileLogWriter = class FileLogWriter {
    stream;
    logDir;
    logFile;
    constructor() {
        this.logDir = process.env.LOG_DIR || (0, path_1.join)(process.cwd(), 'logs');
        this.logFile = (0, path_1.join)(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
        if (!(0, fs_1.existsSync)(this.logDir)) {
            (0, fs_1.mkdirSync)(this.logDir, { recursive: true });
        }
        this.stream = (0, fs_1.createWriteStream)(this.logFile, {
            flags: 'a',
            encoding: 'utf8',
        });
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
    async write(log) {
        return new Promise((resolve, reject) => {
            const logLine = JSON.stringify(log);
            this.stream.write(logLine + '\n', (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async flush() {
        return new Promise((resolve, reject) => {
            this.stream.write('', 'utf8', (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async close() {
        return new Promise((resolve, reject) => {
            this.stream.end(() => {
                resolve();
            });
        });
    }
    onModuleDestroy() {
        this.close().catch(console.error);
    }
};
exports.FileLogWriter = FileLogWriter;
exports.FileLogWriter = FileLogWriter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FileLogWriter);
//# sourceMappingURL=file-log-writer.service.js.map