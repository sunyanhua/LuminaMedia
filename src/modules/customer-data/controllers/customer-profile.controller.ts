import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
  ApiBody,
} from '@nestjs/swagger';
import { CustomerProfileService } from '../services/customer-profile.service';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { CreateCustomerProfileDto } from '../dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { CustomerType } from '../../../shared/enums/customer-type.enum';
import { Industry } from '../../../shared/enums/industry.enum';

@ApiTags('customer-data')
@Controller('api/v1/customer-data/profiles')
export class CustomerProfileController {
  constructor(
    private readonly customerProfileService: CustomerProfileService,
  ) {}

  /**
   * 创建客户档案
   */
  @Post()
  @ApiOperation({
    summary: '创建客户档案',
    description: '创建新的客户档案，包含客户基本信息、行业分类等',
  })
  @ApiBody({ type: CreateCustomerProfileDto })
  @ApiResponse({
    status: 201,
    description: '客户档案创建成功',
    type: CustomerProfile,
  })
  @ApiResponse({ status: 400, description: '请求参数无效' })
  async createProfile(
    @Body() createDto: CreateCustomerProfileDto,
  ): Promise<CustomerProfile> {
    const { userId, customerName, customerType, industry, dataSources } =
      createDto;

    return await this.customerProfileService.createProfile(
      userId,
      customerName,
      customerType,
      industry,
      dataSources,
    );
  }

  /**
   * 获取客户档案详情
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取客户档案详情',
    description: '根据ID获取客户档案的详细信息，包括关联的导入任务和分群',
  })
  @ApiParam({ name: 'id', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: CustomerProfile,
  })
  @ApiResponse({ status: 404, description: '客户档案不存在' })
  async getProfile(@Param('id') id: string): Promise<CustomerProfile> {
    return await this.customerProfileService.getProfile(id);
  }

  /**
   * 获取用户的客户档案列表
   */
  @Get()
  @ApiOperation({
    summary: '获取用户客户档案列表',
    description: '根据用户ID获取该用户的所有客户档案列表',
  })
  @ApiQuery({ name: 'userId', required: true, description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [CustomerProfile],
  })
  async getProfilesByUser(
    @Query('userId') userId: string,
  ): Promise<CustomerProfile[]> {
    return await this.customerProfileService.getProfilesByUser(userId);
  }

  /**
   * 更新客户档案
   */
  @Patch(':id')
  @ApiOperation({
    summary: '更新客户档案',
    description: '更新客户档案的部分或全部信息',
  })
  @ApiParam({ name: 'id', description: '客户档案ID' })
  @ApiBody({ type: UpdateCustomerProfileDto })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: CustomerProfile,
  })
  @ApiResponse({ status: 404, description: '客户档案不存在' })
  async updateProfile(
    @Param('id') id: string,
    @Body() updateDto: UpdateCustomerProfileDto,
  ): Promise<CustomerProfile> {
    return await this.customerProfileService.updateProfile(id, updateDto);
  }

  /**
   * 删除客户档案
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '删除客户档案',
    description: '删除客户档案及其关联的导入任务和分群数据',
  })
  @ApiParam({ name: 'id', description: '客户档案ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '客户档案不存在' })
  async deleteProfile(@Param('id') id: string): Promise<void> {
    await this.customerProfileService.deleteProfile(id);
  }

  /**
   * 生成商场客户演示数据
   */
  @Post(':id/generate-demo')
  @ApiOperation({
    summary: '生成商场客户演示数据',
    description:
      '为指定的客户档案生成完整的商场客户演示数据，包括模拟的导入任务和客户分群',
  })
  @ApiParam({ name: 'id', description: '客户档案ID' })
  @ApiResponse({
    status: 201,
    description: '演示数据生成成功',
    schema: {
      type: 'object',
      properties: {
        profile: { $ref: '#/components/schemas/CustomerProfile' },
        importJobs: {
          type: 'array',
          items: { $ref: '#/components/schemas/DataImportJob' },
        },
        segments: {
          type: 'array',
          items: { $ref: '#/components/schemas/CustomerSegment' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: '客户档案不存在' })
  async generateMallCustomerDemo(@Param('id') id: string): Promise<{
    profile: CustomerProfile;
    importJobs: any[];
    segments: any[];
  }> {
    // 首先获取档案以获取userId
    const profile = await this.customerProfileService.getProfile(id);

    return await this.customerProfileService.generateMallCustomerDemo(
      profile.userId,
    );
  }

  /**
   * 获取客户档案统计信息
   */
  @Get(':id/stats')
  @ApiOperation({
    summary: '获取客户档案统计信息',
    description:
      '获取客户档案的统计数据，包括导入任务数量、记录总数、分群数量等',
  })
  @ApiParam({ name: 'id', description: '客户档案ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        profileName: { type: 'string' },
        industry: { type: 'string' },
        totalImportJobs: { type: 'number' },
        completedImports: { type: 'number' },
        totalRecords: { type: 'number' },
        totalSegments: { type: 'number' },
        totalMembers: { type: 'number' },
        dataFreshness: { type: 'string' },
        insightsCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '客户档案不存在' })
  async getProfileStats(@Param('id') id: string): Promise<Record<string, any>> {
    return await this.customerProfileService.getProfileStats(id);
  }

  /**
   * 获取行业枚举列表
   */
  @Get('enums/industries')
  @ApiOperation({
    summary: '获取行业枚举列表',
    description: '获取系统支持的所有行业分类枚举值',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        industries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' },
            },
          },
        },
      },
    },
  })
  getIndustries(): { value: string; label: string }[] {
    return Object.entries(Industry).map(([key, value]) => ({
      value,
      label: this.getIndustryLabel(value),
    }));
  }

  /**
   * 获取客户类型枚举列表
   */
  @Get('enums/customer-types')
  @ApiOperation({
    summary: '获取客户类型枚举列表',
    description: '获取系统支持的所有客户类型枚举值',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        customerTypes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' },
            },
          },
        },
      },
    },
  })
  getCustomerTypes(): { value: string; label: string }[] {
    return Object.entries(CustomerType).map(([key, value]) => ({
      value,
      label: this.getCustomerTypeLabel(value),
    }));
  }

  /**
   * 获取行业标签（中文化）
   */
  private getIndustryLabel(industry: Industry): string {
    const labels: Record<Industry, string> = {
      [Industry.RETAIL]: '零售',
      [Industry.ECOMMERCE]: '电子商务',
      [Industry.RESTAURANT]: '餐饮',
      [Industry.EDUCATION]: '教育',
      [Industry.HEALTHCARE]: '医疗健康',
      [Industry.FINANCE]: '金融',
      [Industry.REAL_ESTATE]: '房地产',
      [Industry.TRAVEL_HOTEL]: '旅游酒店',
      [Industry.MANUFACTURING]: '制造业',
      [Industry.TECHNOLOGY]: '科技互联网',
      [Industry.MEDIA_ENTERTAINMENT]: '媒体娱乐',
      [Industry.AUTOMOTIVE]: '汽车',
      [Industry.FASHION_BEAUTY]: '时尚美容',
      [Industry.SPORTS_FITNESS]: '体育健身',
      [Industry.OTHER]: '其他',
    };
    return labels[industry] || industry;
  }

  /**
   * 获取客户类型标签（中文化）
   */
  private getCustomerTypeLabel(customerType: CustomerType): string {
    const labels: Record<CustomerType, string> = {
      [CustomerType.INDIVIDUAL]: '个人客户',
      [CustomerType.ENTERPRISE]: '企业客户',
      [CustomerType.SME]: '中小型企业',
      [CustomerType.INDIVIDUAL_BUSINESS]: '个体工商户',
      [CustomerType.GOVERNMENT]: '政府机构',
      [CustomerType.NON_PROFIT]: '非营利组织',
    };
    return labels[customerType] || customerType;
  }
}
