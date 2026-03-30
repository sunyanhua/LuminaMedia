import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GovernmentContentService } from '../services/government-content.service';
import { ComplianceCheckService } from '../services/compliance-check.service';
import type {
  GovernmentContentRequest,
  GovernmentContentResponse,
} from '../interfaces/government-content.interface';
import {
  GovernmentContentType,
  GovernmentContentStyle,
  ComplianceLevel,
  GovernmentContent,
  GovernmentContentTemplate,
  GovernmentScenarioScript,
  GovernmentContentStats,
} from '../interfaces/government-content.interface';

/**
 * 政府内容控制器
 * 提供政府场景内容生成、合规性检查和演示剧本管理功能
 */
@ApiTags('政府内容管理')
@Controller('government')
export class GovernmentController {
  constructor(
    private readonly governmentContentService: GovernmentContentService,
    private readonly complianceCheckService: ComplianceCheckService,
  ) {}

  /**
   * 生成政府内容
   */
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '生成政府内容',
    description: '根据指定类型和参数生成政府场景内容',
  })
  @ApiResponse({ status: 200, description: '内容生成成功', type: Object })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async generateContent(
    @Body() request: GovernmentContentRequest,
  ): Promise<GovernmentContentResponse> {
    return await this.governmentContentService.generateContent(request);
  }

  /**
   * 检查内容合规性
   */
  @Post('check-compliance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '检查内容合规性',
    description: '检查政府内容是否符合法律法规和政策要求',
  })
  @ApiResponse({ status: 200, description: '合规性检查完成', type: Object })
  async checkCompliance(@Body() content: any): Promise<any> {
    return await this.complianceCheckService.checkCompliance(content);
  }

  /**
   * 批量检查合规性
   */
  @Post('batch-check-compliance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '批量检查合规性',
    description: '批量检查多个政府内容的合规性',
  })
  @ApiResponse({ status: 200, description: '批量合规性检查完成', type: Object })
  async batchCheckCompliance(@Body() contents: any[]): Promise<any[]> {
    return await this.complianceCheckService.batchCheckCompliance(contents);
  }

  /**
   * 获取内容模板列表
   */
  @Get('templates')
  @ApiOperation({
    summary: '获取内容模板列表',
    description: '获取所有可用的政府内容模板',
  })
  @ApiResponse({ status: 200, description: '成功获取模板列表', type: Object })
  async getTemplates(): Promise<GovernmentContentTemplate[]> {
    return this.governmentContentService.getTemplates();
  }

  /**
   * 获取模板详情
   */
  @Get('templates/:templateId')
  @ApiOperation({
    summary: '获取模板详情',
    description: '获取指定模板的详细信息',
  })
  @ApiParam({ name: 'templateId', description: '模板ID' })
  @ApiResponse({ status: 200, description: '成功获取模板详情', type: Object })
  async getTemplate(
    @Param('templateId') templateId: string,
  ): Promise<GovernmentContentTemplate | null> {
    const templates = await this.governmentContentService.getTemplates();
    return templates.find((template) => template.id === templateId) || null;
  }

  /**
   * 获取演示剧本列表
   */
  @Get('scripts')
  @ApiOperation({
    summary: '获取演示剧本列表',
    description: '获取所有可用的政府场景演示剧本',
  })
  @ApiResponse({ status: 200, description: '成功获取剧本列表', type: Object })
  async getScripts(): Promise<GovernmentScenarioScript[]> {
    return this.governmentContentService.getScripts();
  }

  /**
   * 获取剧本详情
   */
  @Get('scripts/:scriptId')
  @ApiOperation({
    summary: '获取剧本详情',
    description: '获取指定演示剧本的详细信息',
  })
  @ApiParam({ name: 'scriptId', description: '剧本ID' })
  @ApiResponse({ status: 200, description: '成功获取剧本详情', type: Object })
  async getScript(
    @Param('scriptId') scriptId: string,
  ): Promise<GovernmentScenarioScript | null> {
    const scripts = await this.governmentContentService.getScripts();
    return scripts.find((script) => script.id === scriptId) || null;
  }

  /**
   * 执行演示剧本
   */
  @Post('scripts/:scriptId/execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '执行演示剧本',
    description: '执行指定的政府场景演示剧本',
  })
  @ApiParam({ name: 'scriptId', description: '剧本ID' })
  @ApiQuery({
    name: 'speed',
    required: false,
    description: '执行速度（1=正常，2=快速）',
  })
  @ApiResponse({ status: 200, description: '剧本执行完成', type: Object })
  async executeScript(
    @Param('scriptId') scriptId: string,
    @Query('speed') speed = '1',
  ): Promise<{
    success: boolean;
    message: string;
    steps: Array<{ step: number; name: string; result: any; duration: number }>;
    totalDuration: number;
  }> {
    const scripts = await this.governmentContentService.getScripts();
    const script = scripts.find((s) => s.id === scriptId);

    if (!script) {
      return {
        success: false,
        message: `剧本不存在: ${scriptId}`,
        steps: [],
        totalDuration: 0,
      };
    }

    // 模拟执行剧本步骤
    const steps: Array<{
      step: number;
      name: string;
      result: any;
      duration: number;
    }> = [];
    let totalDuration = 0;

    for (const step of script.steps) {
      const stepStartTime = Date.now();

      // 模拟步骤执行
      await new Promise((resolve) => {
        const duration = step.timeAllocation
          ? (step.timeAllocation * 1000) / parseInt(speed)
          : 1000;
        setTimeout(resolve, duration);
      });

      const stepDuration = Date.now() - stepStartTime;
      totalDuration += stepDuration;

      steps.push({
        step: step.step,
        name: step.name,
        result: {
          success: true,
          message: `步骤 ${step.step} 执行成功`,
          expectedResult: step.expectedResult,
        },
        duration: stepDuration,
      });
    }

    return {
      success: true,
      message: `剧本执行完成: ${script.name}`,
      steps,
      totalDuration,
    };
  }

  /**
   * 获取统计信息
   */
  @Get('stats')
  @ApiOperation({
    summary: '获取统计信息',
    description: '获取政府内容生成和合规性检查的统计信息',
  })
  @ApiResponse({ status: 200, description: '成功获取统计信息', type: Object })
  async getStats(): Promise<GovernmentContentStats> {
    return this.governmentContentService.getStats();
  }

  /**
   * 获取内容类型枚举
   */
  @Get('content-types')
  @ApiOperation({
    summary: '获取内容类型枚举',
    description: '获取所有支持的政府内容类型',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取内容类型枚举',
    type: Object,
  })
  async getContentTypes(): Promise<{
    types: Array<{
      value: GovernmentContentType;
      label: string;
      description: string;
    }>;
  }> {
    const types = [
      {
        value: GovernmentContentType.OFFICIAL_DOCUMENT,
        label: '公文发布',
        description: '政府公文、通知、通报等正式文件',
      },
      {
        value: GovernmentContentType.ANTI_FRAUD,
        label: '防诈骗宣传',
        description: '防诈骗警示宣传材料',
      },
      {
        value: GovernmentContentType.POLICY_INTERPRETATION,
        label: '政策解读',
        description: '政策文件解读和说明',
      },
      {
        value: GovernmentContentType.GOVERNMENT_SERVICE,
        label: '政务服务',
        description: '政务办事指南和服务说明',
      },
      {
        value: GovernmentContentType.PUBLIC_ANNOUNCEMENT,
        label: '公共通知',
        description: '公共事务通知和公告',
      },
      {
        value: GovernmentContentType.EMERGENCY_RESPONSE,
        label: '应急响应',
        description: '突发事件应急响应信息',
      },
    ];

    return { types };
  }

  /**
   * 获取内容风格枚举
   */
  @Get('content-styles')
  @ApiOperation({
    summary: '获取内容风格枚举',
    description: '获取所有支持的政府内容风格',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取内容风格枚举',
    type: Object,
  })
  async getContentStyles(): Promise<{
    styles: Array<{
      value: GovernmentContentStyle;
      label: string;
      description: string;
    }>;
  }> {
    const styles = [
      {
        value: GovernmentContentStyle.FORMAL,
        label: '正式',
        description: '正式公文风格，严谨规范',
      },
      {
        value: GovernmentContentStyle.SERIOUS,
        label: '严肃',
        description: '严肃警示风格，具有威慑力',
      },
      {
        value: GovernmentContentStyle.AUTHORITATIVE,
        label: '权威',
        description: '权威解读风格，专业可信',
      },
      {
        value: GovernmentContentStyle.INSTRUCTIVE,
        label: '指导性',
        description: '指导说明风格，清晰易懂',
      },
      {
        value: GovernmentContentStyle.FRIENDLY,
        label: '亲民友好',
        description: '亲民友好风格，贴近群众',
      },
    ];

    return { styles };
  }

  /**
   * 获取合规级别枚举
   */
  @Get('compliance-levels')
  @ApiOperation({
    summary: '获取合规级别枚举',
    description: '获取所有支持的合规级别',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取合规级别枚举',
    type: Object,
  })
  async getComplianceLevels(): Promise<{
    levels: Array<{
      value: ComplianceLevel;
      label: string;
      description: string;
    }>;
  }> {
    const levels = [
      {
        value: ComplianceLevel.HIGH,
        label: '高',
        description: '高合规性要求，如红头文件',
      },
      {
        value: ComplianceLevel.MEDIUM,
        label: '中',
        description: '中等合规性要求，如宣传材料',
      },
      {
        value: ComplianceLevel.LOW,
        label: '低',
        description: '低合规性要求，如内部通知',
      },
    ];

    return { levels };
  }

  /**
   * 测试内容生成（示例）
   */
  @Post('test-generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试内容生成',
    description: '生成示例内容用于测试',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '内容类型，默认为公文发布',
  })
  @ApiResponse({ status: 200, description: '测试内容生成成功', type: Object })
  async testGenerate(
    @Query('type') type = GovernmentContentType.OFFICIAL_DOCUMENT,
  ): Promise<GovernmentContentResponse> {
    const sampleRequests: Record<
      GovernmentContentType,
      GovernmentContentRequest
    > = {
      [GovernmentContentType.OFFICIAL_DOCUMENT]: {
        contentType: GovernmentContentType.OFFICIAL_DOCUMENT,
        theme: '关于加强安全生产工作的通知',
        style: GovernmentContentStyle.FORMAL,
        complianceLevel: ComplianceLevel.HIGH,
        params: {
          issuingAuthority: 'XX市安全生产委员会办公室',
          documentNumber: `X安委办〔${new Date().getFullYear()}〕12号`,
        },
      },
      [GovernmentContentType.ANTI_FRAUD]: {
        contentType: GovernmentContentType.ANTI_FRAUD,
        theme: '防范电信网络诈骗',
        style: GovernmentContentStyle.SERIOUS,
        complianceLevel: ComplianceLevel.MEDIUM,
        params: {
          fraudType: '电信网络诈骗',
        },
      },
      [GovernmentContentType.POLICY_INTERPRETATION]: {
        contentType: GovernmentContentType.POLICY_INTERPRETATION,
        theme: '小微企业税收优惠政策解读',
        style: GovernmentContentStyle.AUTHORITATIVE,
        complianceLevel: ComplianceLevel.HIGH,
        params: {
          issuingAuthority: 'XX市税务局',
        },
      },
      [GovernmentContentType.GOVERNMENT_SERVICE]: {
        contentType: GovernmentContentType.GOVERNMENT_SERVICE,
        theme: '企业开办一站式服务',
        style: GovernmentContentStyle.INSTRUCTIVE,
        complianceLevel: ComplianceLevel.MEDIUM,
      },
      [GovernmentContentType.PUBLIC_ANNOUNCEMENT]: {
        contentType: GovernmentContentType.PUBLIC_ANNOUNCEMENT,
        theme: '关于临时交通管制的通知',
        style: GovernmentContentStyle.FRIENDLY,
        complianceLevel: ComplianceLevel.LOW,
      },
      [GovernmentContentType.EMERGENCY_RESPONSE]: {
        contentType: GovernmentContentType.EMERGENCY_RESPONSE,
        theme: '台风应急响应',
        style: GovernmentContentStyle.SERIOUS,
        complianceLevel: ComplianceLevel.HIGH,
      },
    };

    const request =
      sampleRequests[type] ||
      sampleRequests[GovernmentContentType.OFFICIAL_DOCUMENT];
    return await this.governmentContentService.generateContent(request);
  }
}
