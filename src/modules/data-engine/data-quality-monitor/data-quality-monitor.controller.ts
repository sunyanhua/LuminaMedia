import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DataQualityMonitorService } from './data-quality-monitor.service';
import { CreateDataQualityRuleDto } from './dto/create-data-quality-rule.dto';
import { UpdateDataQualityRuleDto } from './dto/update-data-quality-rule.dto';
import { DataQualityResult } from './entities/data-quality-result.entity';

@Controller('data-quality-monitor')
export class DataQualityMonitorController {
  constructor(
    private readonly dataQualityMonitorService: DataQualityMonitorService,
  ) {}

  @Post('rules')
  createRule(@Body() createDataQualityRuleDto: CreateDataQualityRuleDto) {
    return this.dataQualityMonitorService.createRule(createDataQualityRuleDto);
  }

  @Get('rules')
  getRules() {
    return this.dataQualityMonitorService.getRules();
  }

  @Get('rules/:id')
  getRule(@Param('id') id: string) {
    // 简化实现，实际应添加具体查询逻辑
    return this.dataQualityMonitorService
      .getRules()
      .then((rules) => rules.find((r) => r.id === id));
  }

  @Patch('rules/:id')
  updateRule(
    @Param('id') id: string,
    @Body() updateDataQualityRuleDto: UpdateDataQualityRuleDto,
  ) {
    return this.dataQualityMonitorService.updateRule(
      id,
      updateDataQualityRuleDto,
    );
  }

  @Delete('rules/:id')
  deleteRule(@Param('id') id: string) {
    return this.dataQualityMonitorService.deleteRule(id);
  }

  @Post('execute/all')
  executeAllRules() {
    return this.dataQualityMonitorService.executeAllRules();
  }

  @Post('execute/:ruleId')
  executeRule(@Param('ruleId') ruleId: string) {
    // 简化实现，实际应添加具体查询逻辑
    return this.dataQualityMonitorService.getRules().then((rules) => {
      const rule = rules.find((r) => r.id === ruleId);
      if (!rule) {
        throw new Error(`Rule ${ruleId} not found`);
      }
      return this.dataQualityMonitorService.executeRule(rule);
    });
  }

  @Get('results')
  getRecentResults(@Query('limit') limit: number = 100) {
    return this.dataQualityMonitorService.getRecentResults(limit);
  }

  @Get('compliance/:ruleId')
  getRuleCompliance(
    @Param('ruleId') ruleId: string,
    @Query('days') days: number = 30,
  ) {
    return this.dataQualityMonitorService.getRuleCompliance(ruleId, days);
  }

  @Post('scan/daily')
  triggerDailyScan() {
    return this.dataQualityMonitorService.scheduleDailyScan();
  }
}
