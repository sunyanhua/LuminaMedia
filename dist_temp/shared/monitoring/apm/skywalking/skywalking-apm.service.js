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
var SkywalkingApmService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkywalkingApmService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let SkywalkingApmService = SkywalkingApmService_1 = class SkywalkingApmService {
    configService;
    logger = new common_1.Logger(SkywalkingApmService_1.name);
    config;
    isInitialized = false;
    skywalkingAgent = null;
    constructor(configService) {
        this.configService = configService;
        this.config = this.loadConfig();
    }
    async onModuleInit() {
        if (this.config.enabled) {
            await this.start();
        }
        else {
            this.logger.warn('SkyWalking APM is disabled by configuration');
        }
    }
    async start() {
        try {
            this.logger.log('Initializing SkyWalking APM agent...');
            this.skywalkingAgent = this.createMockAgent();
            this.logger.log(`SkyWalking APM agent initialized for service: ${this.config.serviceName}`);
            this.isInitialized = true;
            this.recordMetric('apm_agent_started', 1, {
                service: this.config.serviceName,
            });
        }
        catch (error) {
            this.logger.error('Failed to initialize SkyWalking APM agent', error);
            throw error;
        }
    }
    async stop() {
        if (this.skywalkingAgent && this.skywalkingAgent.stop) {
            await this.skywalkingAgent.stop();
        }
        this.isInitialized = false;
        this.logger.log('SkyWalking APM agent stopped');
    }
    createCustomTrace(operation, tags, logs) {
        if (!this.isInitialized) {
            return;
        }
        try {
            this.logger.debug(`Custom trace: ${operation}`, { tags, logs });
            this.recordMetric('custom_trace_count', 1, { operation });
        }
        catch (error) {
            this.logger.warn(`Failed to create custom trace: ${operation}`, error);
        }
    }
    recordError(error, context) {
        if (!this.isInitialized) {
            return;
        }
        try {
            this.logger.error(`APM recorded error: ${error.message}`, {
                error: error.stack,
                context,
            });
            this.recordMetric('error_count', 1, {
                error_type: error.constructor.name,
                message: error.message.substring(0, 100),
            });
        }
        catch (err) {
            this.logger.warn('Failed to record error to APM', err);
        }
    }
    recordMetric(name, value, tags) {
        if (!this.isInitialized) {
            return;
        }
        try {
            if (this.configService.get('NODE_ENV') === 'development') {
                this.logger.debug(`Metric recorded: ${name}=${value}`, { tags });
            }
        }
        catch (error) {
            this.logger.warn(`Failed to record metric: ${name}`, error);
        }
    }
    loadConfig() {
        return {
            serviceName: this.configService.get('APM_SERVICE_NAME', 'lumina-media'),
            serviceInstance: this.configService.get('APM_SERVICE_INSTANCE', 'lumina-media-instance-1'),
            oapServer: this.configService.get('APM_OAP_SERVER', 'http://skywalking-oap:12800'),
            sampleRate: parseFloat(this.configService.get('APM_SAMPLE_RATE', '1.0')),
            enabled: this.configService.get('APM_ENABLED', 'true') === 'true',
        };
    }
    createMockAgent() {
        return {
            start: () => Promise.resolve(),
            stop: () => Promise.resolve(),
            recordTrace: (trace) => {
                this.logger.debug('Mock trace recorded', trace);
            },
            recordError: (error) => {
                this.logger.debug('Mock error recorded', error);
            },
            recordMetric: (metric) => {
                this.logger.debug('Mock metric recorded', metric);
            },
        };
    }
    getConfig() {
        return { ...this.config };
    }
    getStatus() {
        return {
            initialized: this.isInitialized,
            serviceName: this.config.serviceName,
            enabled: this.config.enabled,
        };
    }
};
exports.SkywalkingApmService = SkywalkingApmService;
exports.SkywalkingApmService = SkywalkingApmService = SkywalkingApmService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SkywalkingApmService);
//# sourceMappingURL=skywalking-apm.service.js.map