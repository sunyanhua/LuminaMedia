import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { DemoService } from '../services/demo.service';

@Controller('v1/analytics/demo')
export class DemoController {
  constructor(
    private readonly demoService: DemoService,
  ) {}

  /**
   * 快速启动完整演示流程
   */
  @Post('quick-start')
  @HttpCode(200)
  async quickStartDemo(@Query('userId') userId?: string) {
    try {
      const demoResult = await this.demoService.createMallCustomerDemo(
        userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      );

      return {
        success: true,
        message: '演示流程执行成功',
        data: {
          demoId: `demo-${Date.now()}`,
          customerProfile: {
            id: demoResult.customerProfile.id,
            name: demoResult.customerProfile.customerName,
            description:
              demoResult.customerProfile.profileData?.description ||
              '商场顾客数据',
          },
          segments: demoResult.segments.map((s) => ({
            id: s.id,
            segmentName: s.segmentName,
            description: s.description,
            memberCount: s.memberCount,
          })),
          campaign: {
            id: demoResult.campaign.id,
            name: demoResult.campaign.name,
            budget: demoResult.campaign.budget,
            status: demoResult.campaign.status,
          },
          strategies: demoResult.strategies.map((s) => ({
            id: s.id,
            strategyType: s.strategyType,
            confidenceScore: s.confidenceScore,
            expectedROI: s.expectedROI,
          })),
          contentGenerated: !!demoResult.contentGenerationResult?.success,
          contentPlatforms:
            demoResult.contentGenerationResult?.marketingContent?.recommendedPostingSchedule?.map(
              (s) => s.platform,
            ) || [],
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DEMO_ERROR',
          message: error.message || '演示流程执行失败',
          details: error.stack,
        },
      };
    }
  }

  /**
   * 获取商场场景数据
   */
  @Get('scenario/mall-customer')
  async getMallCustomerScenario() {
    try {
      // 返回场景描述和预设数据
      const scenario = {
        name: '商场顾客营销方案演示',
        description: '模拟商场顾客数据，展示从数据导入到营销内容生成的全流程',
        steps: [
          {
            step: 1,
            title: '数据导入',
            description: '导入1000条商场顾客消费记录CSV文件',
            dataSource: 'demo-data/mall_customers.csv',
          },
          {
            step: 2,
            title: '客户分析',
            description: '自动分析客户特征，生成用户画像和消费行为洞察',
            analysisTypes: ['人口统计', '消费习惯', '兴趣偏好', '时间模式'],
          },
          {
            step: 3,
            title: '客户分群',
            description: '基于分析结果将客户分为3个典型群体',
            segments: ['高价值VIP客户', '年轻时尚族群', '家庭消费群体'],
          },
          {
            step: 4,
            title: '活动策划',
            description: '创建"商场春季焕新购物节"营销活动',
            budget: 200000,
            duration: '3个月',
            target: '提升商场客流量和消费额',
          },
          {
            step: 5,
            title: '策略生成',
            description: '使用AI生成4种类型的营销策略',
            strategies: ['内容策略', '渠道策略', '时间策略', '预算策略'],
          },
          {
            step: 6,
            title: '内容生成',
            description: '为小红书和微信公众号生成营销内容',
            platforms: ['小红书', '微信公众号'],
            contentTypes: ['促销文案', '教育文章'],
          },
        ],
        expectedOutcomes: [
          '完整的客户画像分析报告',
          '3个客户分群及特征描述',
          '营销活动策划方案',
          '4个AI生成的营销策略',
          '跨平台营销内容包',
        ],
        estimatedTime: '2-3分钟',
      };

      return {
        success: true,
        data: scenario,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SCENARIO_ERROR',
          message: error.message || '获取场景数据失败',
        },
      };
    }
  }

  /**
   * 重置演示数据
   */
  @Delete('reset')
  async resetDemoData(@Query('userId') userId?: string) {
    try {
      const result = await this.demoService.resetDemoData(
        userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      );

      return {
        success: true,
        message: '演示数据重置成功',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESET_ERROR',
          message: error.message || '重置演示数据失败',
        },
      };
    }
  }

  /**
   * 获取演示状态
   */
  @Get('status')
  async getDemoStatus() {
    try {
      const status = this.demoService.getDemoStatus();

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STATUS_ERROR',
          message: error.message || '获取演示状态失败',
        },
      };
    }
  }

  /**
   * 分步执行演示流程
   */
  @Post('step/:stepNumber')
  async executeDemoStep(
    @Param('stepNumber') stepNumber: string,
    @Body() stepData: any,
  ) {
    const step = parseInt(stepNumber, 10);

    if (step < 1 || step > 6) {
      return {
        success: false,
        error: {
          code: 'INVALID_STEP',
          message: '步骤编号必须在1-6之间',
        },
      };
    }

    // 简化处理：直接返回步骤描述
    const stepDescriptions = [
      '数据导入步骤',
      '客户分析步骤',
      '客户分群步骤',
      '活动策划步骤',
      '策略生成步骤',
      '内容生成步骤',
    ];

    return {
      success: true,
      data: {
        step,
        description: stepDescriptions[step - 1],
        completed: true,
        timestamp: new Date().toISOString(),
        stepData,
      },
    };
  }

  /**
   * 获取演示进度
   */
  @Get('progress')
  async getDemoProgress(@Query('userId') userId?: string) {
    try {
      const progress = await this.demoService.getDemoProgress(
        userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      );

      return {
        success: true,
        data: progress,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROGRESS_ERROR',
          message: error.message || '获取演示进度失败',
        },
      };
    }
  }

  /**
   * 获取演示结果
   */
  @Get('results')
  async getDemoResults(@Query('userId') userId?: string) {
    try {
      const results = await this.demoService.getDemoResults(
        userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      );

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESULTS_ERROR',
          message: error.message || '获取演示结果失败',
        },
      };
    }
  }

  /**
   * 验证演示结果
   */
  @Get('validate')
  async validateDemoResults(@Query('userId') userId?: string) {
    try {
      const validation = await this.demoService.validateDemoResults(
        userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      );

      return {
        success: true,
        data: validation,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message || '验证演示结果失败',
        },
      };
    }
  }

  /**
   * 生成演示报告
   */
  @Get('report')
  async generateDemoReport(@Query('userId') userId?: string) {
    try {
      const report = await this.demoService.generateDemoReport(
        userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      );

      return {
        success: true,
        data: report,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPORT_ERROR',
          message: error.message || '生成演示报告失败',
        },
      };
    }
  }

  @Get('data-types')
  async getDemoDataTypes() {
    try {
      const dataTypes = [
        { id: 'mall-customer', name: '商场顾客营销方案', description: '商场顾客数据导入到营销内容生成全流程' },
        { id: 'government-demo', name: '政务版演示数据', description: '政务内容、舆情监测和地理分析数据' },
        { id: 'e-commerce', name: '电商用户行为分析', description: '电商用户购买行为分析和个性化推荐' },
        { id: 'social-media', name: '社交媒体舆情监测', description: '社交媒体舆情数据收集和情感分析' },
      ];

      return {
        success: true,
        data: dataTypes,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATA_TYPES_ERROR',
          message: error.message || '获取演示数据类型失败',
        },
      };
    }
  }

  @Post('government/generate')
  async generateGovernmentDemoData(@Query('tenantId') tenantId?: string) {
    return {
      success: false,
      error: {
        code: 'GOVERNMENT_DEMO_NOT_AVAILABLE',
        message: '政务版演示功能暂时不可用，请联系开发人员',
      },
    };
  }

  @Delete('government/reset')
  async resetGovernmentDemoData(@Query('tenantId') tenantId?: string) {
    return {
      success: false,
      error: {
        code: 'GOVERNMENT_DEMO_NOT_AVAILABLE',
        message: '政务版演示功能暂时不可用',
      },
    };
  }
}
