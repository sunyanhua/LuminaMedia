import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FeatureGuard } from '../../auth/guards/feature.guard';
import { Feature } from '../../auth/decorators/feature.decorator';
import { AccountCredentialService } from '../services/account-credential.service';
import {
  AccountConnectionTestService,
  TestResult,
  BatchTestResult,
} from '../services/account-connection-test.service';
import {
  PlatformType,
  PlatformCredentials,
} from '../interfaces/platform-adapter.interface';

/**
 * 账号管理控制器
 * 提供社交媒体账号的配置、管理和测试功能
 */
@ApiTags('账号管理')
@ApiBearerAuth()
@Controller('accounts')
@UseGuards(JwtAuthGuard, FeatureGuard)
@Feature('matrix-publish')
export class AccountController {
  constructor(
    private readonly accountCredentialService: AccountCredentialService,
    private readonly accountConnectionTestService: AccountConnectionTestService,
  ) {}

  /**
   * 获取所有账号列表
   */
  @Get()
  @ApiOperation({
    summary: '获取所有账号列表',
    description: '返回所有社交媒体账号的基本信息（不包含凭证）',
  })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: '租户ID，默认为demo-tenant',
  })
  @ApiResponse({ status: 200, description: '成功获取账号列表' })
  async getAllAccounts(@Query('tenantId') tenantId: string = 'demo-tenant') {
    return await this.accountCredentialService.getAllAccounts(tenantId);
  }

  /**
   * 创建或更新账号凭证
   */
  @Post(':accountId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '创建或更新账号凭证',
    description: '加密存储社交媒体账号凭证',
  })
  @ApiParam({ name: 'accountId', description: '账号ID' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: '租户ID，默认为demo-tenant',
  })
  @ApiResponse({ status: 201, description: '账号凭证创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createOrUpdateAccount(
    @Param('accountId') accountId: string,
    @Body()
    body: {
      platform: PlatformType;
      credentials: PlatformCredentials;
      tenantId?: string;
      accountName?: string;
      config?: Record<string, any>;
    },
  ) {
    const {
      platform,
      credentials,
      tenantId = 'demo-tenant',
      accountName,
      config,
    } = body;

    const account =
      await this.accountCredentialService.encryptAndStoreCredentials(
        accountId,
        platform,
        credentials,
        tenantId,
      );

    // 更新配置信息（如果提供）
    if (config) {
      // TODO: 更新配置字段
    }

    return {
      success: true,
      message: '账号凭证保存成功',
      accountId: account.id,
      platform: account.platform,
    };
  }

  /**
   * 获取账号详情
   */
  @Get(':accountId')
  @ApiOperation({
    summary: '获取账号详情',
    description: '获取指定账号的详细信息（不包含解密后的凭证）',
  })
  @ApiParam({ name: 'accountId', description: '账号ID' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: '租户ID，默认为demo-tenant',
  })
  @ApiResponse({ status: 200, description: '成功获取账号详情' })
  @ApiResponse({ status: 404, description: '账号不存在' })
  async getAccount(
    @Param('accountId') accountId: string,
    @Query('tenantId') tenantId: string = 'demo-tenant',
  ) {
    const accounts =
      await this.accountCredentialService.getAllAccounts(tenantId);
    const account = accounts.find((acc) => acc.id === accountId);

    if (!account) {
      return {
        success: false,
        message: `账号不存在: ${accountId}`,
      };
    }

    return {
      success: true,
      account,
    };
  }

  /**
   * 删除账号凭证
   */
  @Delete(':accountId')
  @ApiOperation({
    summary: '删除账号凭证',
    description: '删除指定账号的凭证（标记为过期）',
  })
  @ApiParam({ name: 'accountId', description: '账号ID' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: '租户ID，默认为demo-tenant',
  })
  @ApiResponse({ status: 200, description: '账号凭证删除成功' })
  @ApiResponse({ status: 404, description: '账号不存在' })
  async deleteAccount(
    @Param('accountId') accountId: string,
    @Query('tenantId') tenantId: string = 'demo-tenant',
  ) {
    await this.accountCredentialService.deleteCredentials(accountId, tenantId);
    return {
      success: true,
      message: '账号凭证已删除',
      accountId,
    };
  }

  /**
   * 测试账号连接
   */
  @Post(':accountId/test')
  @ApiOperation({
    summary: '测试账号连接',
    description: '测试指定社交媒体账号的连接状态',
  })
  @ApiParam({ name: 'accountId', description: '账号ID' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: '租户ID，默认为demo-tenant',
  })
  @ApiResponse({ status: 200, description: '连接测试完成' })
  async testAccountConnection(
    @Param('accountId') accountId: string,
    @Query('tenantId') tenantId: string = 'demo-tenant',
  ): Promise<TestResult> {
    return await this.accountConnectionTestService.testAccountConnection(
      accountId,
      tenantId,
    );
  }

  /**
   * 测试所有账号连接
   */
  @Post('test/all')
  @ApiOperation({
    summary: '测试所有账号连接',
    description: '批量测试所有社交媒体账号的连接状态',
  })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: '租户ID，默认为demo-tenant',
  })
  @ApiResponse({ status: 200, description: '批量连接测试完成' })
  async testAllAccounts(
    @Query('tenantId') tenantId: string = 'demo-tenant',
  ): Promise<BatchTestResult> {
    return await this.accountConnectionTestService.testAllAccounts(tenantId);
  }

  /**
   * 验证账号凭证
   */
  @Get(':accountId/validate')
  @ApiOperation({
    summary: '验证账号凭证',
    description: '验证指定账号凭证的有效性',
  })
  @ApiParam({ name: 'accountId', description: '账号ID' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: '租户ID，默认为demo-tenant',
  })
  @ApiResponse({ status: 200, description: '凭证验证完成' })
  async validateCredentials(
    @Param('accountId') accountId: string,
    @Query('tenantId') tenantId: string = 'demo-tenant',
  ) {
    const isValid = await this.accountCredentialService.validateCredentials(
      accountId,
      tenantId,
    );
    return {
      success: true,
      valid: isValid,
      accountId,
      message: isValid ? '凭证有效' : '凭证无效',
    };
  }

  /**
   * 更新账号配置
   */
  @Put(':accountId/config')
  @ApiOperation({
    summary: '更新账号配置',
    description: '更新社交媒体账号的配置信息',
  })
  @ApiParam({ name: 'accountId', description: '账号ID' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: '租户ID，默认为demo-tenant',
  })
  @ApiResponse({ status: 200, description: '配置更新成功' })
  async updateConfig(
    @Param('accountId') accountId: string,
    @Body()
    body: {
      config?: Record<string, any>;
      quotaInfo?: Record<string, any>;
      webhookUrl?: string;
      isEnabled?: boolean;
      tenantId?: string;
    },
    @Query('tenantId') tenantId: string = 'demo-tenant',
  ) {
    // TODO: 实现配置更新逻辑
    return {
      success: true,
      message: '配置更新功能待实现',
      accountId,
    };
  }
}
