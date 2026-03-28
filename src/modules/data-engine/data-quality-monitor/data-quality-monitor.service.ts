import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataQualityRule } from './entities/data-quality-rule.entity';
import { DataQualityResult } from './entities/data-quality-result.entity';
import { CreateDataQualityRuleDto } from './dto/create-data-quality-rule.dto';
import { UpdateDataQualityRuleDto } from './dto/update-data-quality-rule.dto';
import { DataSource } from 'typeorm';

export interface DataQualityMetric {
  ruleId: string;
  tableName: string;
  fieldName: string;
  metricName: string;
  value: number;
  threshold: number;
  severity: 'info' | 'warning' | 'error';
  timestamp: Date;
}

export interface AlertNotification {
  ruleId: string;
  ruleName: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: Date;
  details: Record<string, any>;
}

@Injectable()
export class DataQualityMonitorService {
  private readonly logger = new Logger(DataQualityMonitorService.name);

  constructor(
    @InjectRepository(DataQualityRule)
    private readonly ruleRepository: Repository<DataQualityRule>,
    @InjectRepository(DataQualityResult)
    private readonly resultRepository: Repository<DataQualityResult>,
    private readonly dataSource: DataSource,
  ) {}

  async createRule(
    createDto: CreateDataQualityRuleDto,
  ): Promise<DataQualityRule> {
    const rule = this.ruleRepository.create(createDto);
    return await this.ruleRepository.save(rule);
  }

  async updateRule(
    id: string,
    updateDto: UpdateDataQualityRuleDto,
  ): Promise<DataQualityRule> {
    await this.ruleRepository.update(id, updateDto);
    return this.ruleRepository.findOne({
      where: { id },
    }) as Promise<DataQualityRule>;
  }

  async deleteRule(id: string): Promise<void> {
    await this.ruleRepository.delete(id);
  }

  async getRules(): Promise<DataQualityRule[]> {
    return this.ruleRepository.find({ where: { isActive: true } });
  }

  async executeRule(rule: DataQualityRule): Promise<DataQualityResult> {
    this.logger.debug(`Executing rule ${rule.name} on table ${rule.tableName}`);

    let metricValue: number;
    try {
      // 执行SQL查询计算指标值
      const queryResult = await this.dataSource.query(
        `SELECT COUNT(*) as total_count,
                SUM(CASE WHEN ${rule.condition} THEN 1 ELSE 0 END) as valid_count
         FROM ${rule.tableName}`,
      );

      const total = parseInt(queryResult[0].total_count);
      const valid = parseInt(queryResult[0].valid_count);
      metricValue = total > 0 ? valid / total : 1;
    } catch (error) {
      this.logger.error(
        `Failed to execute rule ${rule.name}: ${error.message}`,
      );
      throw error;
    }

    // 创建结果记录
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

    // 检查是否需要发送告警
    if (!savedResult.passed) {
      await this.sendAlert({
        ruleId: rule.id,
        ruleName: rule.name,
        message: `数据质量规则 "${rule.name}" 未通过: ${metricValue.toFixed(2)} < ${rule.threshold}`,
        severity: rule.severity as 'error' | 'warning' | 'info',
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

  async executeAllRules(): Promise<DataQualityResult[]> {
    const activeRules = await this.getRules();
    const results: DataQualityResult[] = [];

    for (const rule of activeRules) {
      try {
        const result = await this.executeRule(rule);
        results.push(result);
      } catch (error) {
        this.logger.error(
          `Failed to execute rule ${rule.name}: ${error.message}`,
        );
      }
    }

    return results;
  }

  async scheduleDailyScan(): Promise<void> {
    // 每天定时执行所有规则
    this.logger.log('Scheduling daily data quality scan...');
    await this.executeAllRules();
  }

  async sendAlert(alert: AlertNotification): Promise<void> {
    this.logger.warn(`Data quality alert: ${alert.message}`);

    // TODO: 集成邮件、钉钉、企业微信通知
    // 目前先记录日志
    console.log('ALERT:', alert);

    // 实际集成时实现以下功能：
    // 1. 邮件通知
    // 2. 钉钉机器人
    // 3. 企业微信机器人
  }

  async getRecentResults(limit: number = 100): Promise<DataQualityResult[]> {
    return this.resultRepository.find({
      order: { executionTime: 'DESC' },
      take: limit,
    });
  }

  async getRuleCompliance(
    ruleId: string,
    days: number = 30,
  ): Promise<{ date: string; compliance: number }[]> {
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
}
