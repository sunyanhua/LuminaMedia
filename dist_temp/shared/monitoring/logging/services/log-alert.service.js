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
exports.LogAlertService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const cron_1 = require("cron");
const log_analysis_service_1 = require("./log-analysis.service");
let LogAlertService = class LogAlertService {
    configService;
    logAnalysisService;
    schedulerRegistry;
    rules = [];
    alertHistory = [];
    constructor(configService, logAnalysisService, schedulerRegistry) {
        this.configService = configService;
        this.logAnalysisService = logAnalysisService;
        this.schedulerRegistry = schedulerRegistry;
    }
    async onModuleInit() {
        await this.loadAlertRules();
        this.scheduleAlertChecks();
    }
    async addRule(rule) {
        this.rules.push(rule);
        await this.saveAlertRules();
        if (rule.enabled) {
            this.scheduleRuleCheck(rule);
        }
    }
    async updateRule(ruleId, updates) {
        const index = this.rules.findIndex((r) => r.id === ruleId);
        if (index === -1) {
            throw new Error(`Rule ${ruleId} not found`);
        }
        this.rules[index] = { ...this.rules[index], ...updates };
        await this.saveAlertRules();
        const rule = this.rules[index];
        this.unscheduleRuleCheck(ruleId);
        if (rule.enabled) {
            this.scheduleRuleCheck(rule);
        }
    }
    async deleteRule(ruleId) {
        const index = this.rules.findIndex((r) => r.id === ruleId);
        if (index === -1) {
            throw new Error(`Rule ${ruleId} not found`);
        }
        this.unscheduleRuleCheck(ruleId);
        this.rules.splice(index, 1);
        await this.saveAlertRules();
    }
    getRules() {
        return [...this.rules];
    }
    getAlertHistory(ruleId, limit = 100) {
        let history = this.alertHistory;
        if (ruleId) {
            history = history.filter((h) => h.ruleId === ruleId);
        }
        return history.slice(-limit);
    }
    async checkAllRules() {
        const results = await this.logAnalysisService.checkAlertRules(this.rules);
        results.forEach((result) => {
            if (result.triggered) {
                this.recordAlertTrigger(result.rule, result.details);
                this.executeAlertActions(result.rule, result.details);
            }
        });
        return results;
    }
    async executeAlertActions(rule, details) {
        for (const action of rule.actions) {
            try {
                await this.executeAction(action, rule, details);
            }
            catch (error) {
                console.error(`Failed to execute alert action for rule ${rule.id}:`, error);
            }
        }
    }
    async executeAction(action, rule, details) {
        switch (action.type) {
            case 'notification':
                await this.sendNotification(action, rule, details);
                break;
            case 'webhook':
                await this.callWebhook(action, rule, details);
                break;
            case 'script':
                await this.executeScript(action, rule, details);
                break;
            case 'log':
                await this.writeLog(action, rule, details);
                break;
            default:
                console.warn(`Unknown action type: ${action.type}`);
        }
    }
    async sendNotification(action, rule, details) {
        console.log(`[ALERT NOTIFICATION] Rule: ${rule.name}, Action: ${action.target}`);
    }
    async callWebhook(action, rule, details) {
        console.log(`[ALERT WEBHOOK] Calling ${action.target} for rule ${rule.name}`);
    }
    async executeScript(action, rule, details) {
        console.log(`[ALERT SCRIPT] Executing script ${action.target} for rule ${rule.name}`);
    }
    async writeLog(action, rule, details) {
        console.log(`[ALERT LOG] Alert triggered: ${rule.name}, Details:`, details);
    }
    recordAlertTrigger(rule, details) {
        this.alertHistory.push({
            ruleId: rule.id,
            timestamp: new Date().toISOString(),
            triggered: true,
            details,
        });
        if (this.alertHistory.length > 1000) {
            this.alertHistory.splice(0, this.alertHistory.length - 1000);
        }
    }
    async loadAlertRules() {
        this.rules.push(...this.getDefaultRules());
    }
    async saveAlertRules() {
    }
    getDefaultRules() {
        return [
            {
                id: 'error-rate-high',
                name: '错误率过高',
                description: '当错误日志比例超过5%时触发告警',
                enabled: true,
                condition: {
                    type: 'threshold',
                    field: 'error.rate',
                    operator: 'gt',
                    value: 5,
                    window: '5m',
                    occurrences: 3,
                },
                actions: [
                    {
                        type: 'log',
                        target: 'alert-log',
                        parameters: { level: 'error' },
                    },
                ],
                notificationChannels: ['email', 'dingtalk'],
                cooldownPeriod: 5,
            },
            {
                id: 'critical-error',
                name: '关键错误',
                description: '当出现关键错误时立即告警',
                enabled: true,
                condition: {
                    type: 'pattern',
                    field: 'log.level',
                    operator: 'eq',
                    value: 'error',
                    window: '1m',
                    occurrences: 1,
                },
                actions: [
                    {
                        type: 'notification',
                        target: 'critical-alerts',
                        parameters: { priority: 'high' },
                    },
                ],
                notificationChannels: ['sms', 'phone'],
                cooldownPeriod: 60,
            },
        ];
    }
    scheduleAlertChecks() {
        const job = new cron_1.CronJob('*/1 * * * *', () => {
            this.checkAllRules().catch((err) => {
                console.error('Alert check failed:', err);
            });
        });
        this.schedulerRegistry.addCronJob('log-alert-check', job);
        job.start();
    }
    scheduleRuleCheck(rule) {
    }
    unscheduleRuleCheck(ruleId) {
    }
};
exports.LogAlertService = LogAlertService;
exports.LogAlertService = LogAlertService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        log_analysis_service_1.LogAnalysisService,
        schedule_1.SchedulerRegistry])
], LogAlertService);
//# sourceMappingURL=log-alert.service.js.map