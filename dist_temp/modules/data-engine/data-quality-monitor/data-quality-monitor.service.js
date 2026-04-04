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
var DataQualityMonitorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataQualityMonitorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const data_quality_rule_entity_1 = require("./entities/data-quality-rule.entity");
const data_quality_result_entity_1 = require("./entities/data-quality-result.entity");
const typeorm_3 = require("typeorm");
let DataQualityMonitorService = DataQualityMonitorService_1 = class DataQualityMonitorService {
    ruleRepository;
    resultRepository;
    dataSource;
    logger = new common_1.Logger(DataQualityMonitorService_1.name);
    constructor(ruleRepository, resultRepository, dataSource) {
        this.ruleRepository = ruleRepository;
        this.resultRepository = resultRepository;
        this.dataSource = dataSource;
    }
    async createRule(createDto) {
        const rule = this.ruleRepository.create(createDto);
        return await this.ruleRepository.save(rule);
    }
    async updateRule(id, updateDto) {
        await this.ruleRepository.update(id, updateDto);
        return this.ruleRepository.findOne({
            where: { id },
        });
    }
    async deleteRule(id) {
        await this.ruleRepository.delete(id);
    }
    async getRules() {
        return this.ruleRepository.find({ where: { isActive: true } });
    }
    async executeRule(rule) {
        this.logger.debug(`Executing rule ${rule.name} on table ${rule.tableName}`);
        let metricValue;
        try {
            const queryResult = await this.dataSource.query(`SELECT COUNT(*) as total_count,
                SUM(CASE WHEN ${rule.condition} THEN 1 ELSE 0 END) as valid_count
         FROM ${rule.tableName}`);
            const total = parseInt(queryResult[0].total_count);
            const valid = parseInt(queryResult[0].valid_count);
            metricValue = total > 0 ? valid / total : 1;
        }
        catch (error) {
            this.logger.error(`Failed to execute rule ${rule.name}: ${error.message}`);
            throw error;
        }
        const result = this.resultRepository.create({
            ruleId: rule.id,
            ruleName: rule.name,
            tableName: rule.tableName,
            fieldName: rule.fieldName,
            metricValue,
            threshold: rule.threshold,
            severity: rule.severity,
            passed: metricValue >= rule.threshold,
            executionTime: new Date(),
            details: {
                condition: rule.condition,
                calculatedValue: metricValue,
            },
        });
        const savedResult = await this.resultRepository.save(result);
        if (!savedResult.passed) {
            await this.sendAlert({
                ruleId: rule.id,
                ruleName: rule.name,
                message: `数据质量规则 "${rule.name}" 未通过: ${metricValue.toFixed(2)} < ${rule.threshold}`,
                severity: rule.severity,
                timestamp: new Date(),
                details: {
                    tableName: rule.tableName,
                    fieldName: rule.fieldName,
                    condition: rule.condition,
                    metricValue,
                    threshold: rule.threshold,
                },
            });
        }
        return savedResult;
    }
    async executeAllRules() {
        const activeRules = await this.getRules();
        const results = [];
        for (const rule of activeRules) {
            try {
                const result = await this.executeRule(rule);
                results.push(result);
            }
            catch (error) {
                this.logger.error(`Failed to execute rule ${rule.name}: ${error.message}`);
            }
        }
        return results;
    }
    async scheduleDailyScan() {
        this.logger.log('Scheduling daily data quality scan...');
        await this.executeAllRules();
    }
    async sendAlert(alert) {
        this.logger.warn(`Data quality alert: ${alert.message}`);
        console.log('ALERT:', alert);
    }
    async getRecentResults(limit = 100) {
        return this.resultRepository.find({
            order: { executionTime: 'DESC' },
            take: limit,
        });
    }
    async getRuleCompliance(ruleId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const results = await this.resultRepository
            .createQueryBuilder('result')
            .where('result.ruleId = :ruleId', { ruleId })
            .andWhere('result.executionTime >= :startDate', { startDate })
            .orderBy('result.executionTime', 'ASC')
            .getMany();
        return results.map((result) => ({
            date: result.executionTime.toISOString().split('T')[0],
            compliance: result.passed ? 100 : 0,
        }));
    }
};
exports.DataQualityMonitorService = DataQualityMonitorService;
exports.DataQualityMonitorService = DataQualityMonitorService = DataQualityMonitorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(data_quality_rule_entity_1.DataQualityRule)),
    __param(1, (0, typeorm_1.InjectRepository)(data_quality_result_entity_1.DataQualityResult)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_3.DataSource])
], DataQualityMonitorService);
//# sourceMappingURL=data-quality-monitor.service.js.map