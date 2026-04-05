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
  Req,
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
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { WechatOfficialAccountService } from '../services/wechat-official-account.service';
import { Request } from 'express';

/**
 * 微信公众号账号控制器
 * 提供微信公众号绑定、管理和数据获取功能
 */
@ApiTags('微信公众号管理')
@ApiBearerAuth()
@Controller('wechat-official-accounts')
@UseGuards(JwtAuthGuard, FeatureGuard, RolesGuard)
@Feature('wechat-mp')
export class WechatOfficialAccountController {
  constructor(
    private readonly wechatAccountService: WechatOfficialAccountService,
  ) {}

  /**
   * 获取微信授权URL
   */
  @Get('auth-url')
  @Roles('admin', 'editor', 'manager')
  @ApiOperation({
    summary: '获取微信授权URL',
    description: '获取微信公众号OAuth授权URL（DEMO模拟）',
  })
  @ApiQuery({
    name: 'redirectUri',
    required: true,
    description: '授权回调地址',
  })
  @ApiResponse({ status: 200, description: '成功获取授权URL' })
  async getAuthUrl(
    @Query('redirectUri') redirectUri: string,
    @Req() req: Request,
  ) {
    const tenantId = (req.user as any)?.tenantId || 'demo-tenant';
    const result = await this.wechatAccountService.getAuthorizationUrl(
      tenantId,
      redirectUri,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 处理授权回调
   */
  @Post('auth-callback')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'editor', 'manager')
  @ApiOperation({
    summary: '处理授权回调',
    description: '处理微信公众号OAuth授权回调（DEMO模拟）',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: '授权码（模拟）',
  })
  @ApiQuery({
    name: 'state',
    required: true,
    description: '状态参数',
  })
  @ApiResponse({ status: 200, description: '授权成功' })
  @ApiResponse({ status: 400, description: '授权失败' })
  async handleAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
  ) {
    const tenantId = (req.user as any)?.tenantId || 'demo-tenant';
    const result = await this.wechatAccountService.handleAuthorizationCallback(
      code,
      state,
      tenantId,
    );

    if (result.success) {
      return {
        success: true,
        message: '微信公众号绑定成功',
        accountId: result.accountId,
        mpName: result.mpName,
      };
    } else {
      return {
        success: false,
        message: '微信公众号绑定失败',
        error: result.error,
      };
    }
  }

  /**
   * 获取已绑定的微信公众号列表
   */
  @Get()
  @Roles('admin', 'editor', 'manager', 'viewer')
  @ApiOperation({
    summary: '获取已绑定的微信公众号列表',
    description: '获取当前租户下所有已绑定的微信公众号',
  })
  @ApiResponse({ status: 200, description: '成功获取列表' })
  async getAccounts(@Req() req: Request) {
    const tenantId = (req.user as any)?.tenantId || 'demo-tenant';
    const accounts = await this.wechatAccountService.getBoundAccounts(tenantId);

    return {
      success: true,
      data: accounts,
      total: accounts.length,
    };
  }

  /**
   * 获取公众号详细信息
   */
  @Get(':accountId')
  @Roles('admin', 'editor', 'manager', 'viewer')
  @ApiOperation({
    summary: '获取公众号详细信息',
    description: '获取指定微信公众号的详细信息和统计数据',
  })
  @ApiParam({ name: 'accountId', description: '公众号账号ID' })
  @ApiResponse({ status: 200, description: '成功获取详情' })
  @ApiResponse({ status: 404, description: '公众号不存在' })
  async getAccountDetails(
    @Param('accountId') accountId: string,
    @Req() req: Request,
  ) {
    const tenantId = (req.user as any)?.tenantId || 'demo-tenant';
    try {
      const details = await this.wechatAccountService.getAccountDetails(
        accountId,
        tenantId,
      );

      return {
        success: true,
        data: details,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 获取公众号统计数据
   */
  @Get(':accountId/stats')
  @Roles('admin', 'editor', 'manager', 'viewer')
  @ApiOperation({
    summary: '获取公众号统计数据',
    description: '获取指定微信公众号的运营统计数据',
  })
  @ApiParam({ name: 'accountId', description: '公众号账号ID' })
  @ApiResponse({ status: 200, description: '成功获取统计数据' })
  @ApiResponse({ status: 404, description: '公众号不存在' })
  async getAccountStats(
    @Param('accountId') accountId: string,
    @Req() req: Request,
  ) {
    const tenantId = (req.user as any)?.tenantId || 'demo-tenant';
    try {
      const stats = await this.wechatAccountService.getAccountStats(
        accountId,
        tenantId,
      );

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 刷新公众号访问令牌
   */
  @Post(':accountId/refresh-token')
  @Roles('admin', 'editor')
  @ApiOperation({
    summary: '刷新公众号访问令牌',
    description: '刷新微信公众号的访问令牌（DEMO模拟）',
  })
  @ApiParam({ name: 'accountId', description: '公众号账号ID' })
  @ApiResponse({ status: 200, description: '令牌刷新成功' })
  @ApiResponse({ status: 404, description: '公众号不存在' })
  async refreshToken(
    @Param('accountId') accountId: string,
    @Req() req: Request,
  ) {
    const tenantId = (req.user as any)?.tenantId || 'demo-tenant';
    const result = await this.wechatAccountService.refreshAccessToken(
      accountId,
      tenantId,
    );

    if (result.success) {
      return {
        success: true,
        message: '访问令牌刷新成功',
        newToken: result.newToken,
        expiresAt: result.expiresAt,
      };
    } else {
      return {
        success: false,
        message: '访问令牌刷新失败',
        error: result.error,
      };
    }
  }

  /**
   * 更新公众号数据
   */
  @Post(':accountId/update-data')
  @Roles('admin', 'editor')
  @ApiOperation({
    summary: '更新公众号数据',
    description: '从微信API同步最新公众号数据（DEMO模拟）',
  })
  @ApiParam({ name: 'accountId', description: '公众号账号ID' })
  @ApiResponse({ status: 200, description: '数据更新成功' })
  @ApiResponse({ status: 404, description: '公众号不存在' })
  async updateAccountData(
    @Param('accountId') accountId: string,
    @Req() req: Request,
  ) {
    const tenantId = (req.user as any)?.tenantId || 'demo-tenant';
    const result = await this.wechatAccountService.updateAccountData(
      accountId,
      tenantId,
    );

    if (result.success) {
      return {
        success: true,
        message: '公众号数据更新成功',
        updatedData: result.updatedData,
      };
    } else {
      return {
        success: false,
        message: '公众号数据更新失败',
        error: result.error,
      };
    }
  }

  /**
   * 解除公众号绑定
   */
  @Delete(':accountId')
  @Roles('admin')
  @ApiOperation({
    summary: '解除公众号绑定',
    description: '解除微信公众号绑定关系',
  })
  @ApiParam({ name: 'accountId', description: '公众号账号ID' })
  @ApiResponse({ status: 200, description: '解绑成功' })
  @ApiResponse({ status: 404, description: '公众号不存在' })
  async unbindAccount(
    @Param('accountId') accountId: string,
    @Req() req: Request,
  ) {
    const tenantId = (req.user as any)?.tenantId || 'demo-tenant';
    const result = await this.wechatAccountService.unbindAccount(
      accountId,
      tenantId,
    );

    if (result.success) {
      return {
        success: true,
        message: result.message || '公众号解绑成功',
      };
    } else {
      return {
        success: false,
        message: '公众号解绑失败',
        error: result.error,
      };
    }
  }

  /**
   * 批量获取公众号状态
   */
  @Post('batch-status')
  @Roles('admin', 'editor', 'manager')
  @ApiOperation({
    summary: '批量获取公众号状态',
    description: '批量获取多个微信公众号的连接状态和基本信息',
  })
  @ApiResponse({ status: 200, description: '成功获取状态' })
  async getBatchStatus(
    @Body() body: { accountIds: string[] },
    @Req() req: Request,
  ) {
    const tenantId = (req.user as any)?.tenantId || 'demo-tenant';
    const { accountIds } = body;

    const results = await Promise.all(
      accountIds.map(async (accountId) => {
        try {
          const details = await this.wechatAccountService.getAccountDetails(
            accountId,
            tenantId,
          );
          return {
            accountId,
            success: true,
            data: {
              mpName: details.mpName,
              isEnabled: details.isEnabled,
              status: details.status,
              fansCount: details.stats?.fansCount || 0,
              lastDataUpdate: details.stats?.updatedAt,
            },
          };
        } catch (error) {
          return {
            accountId,
            success: false,
            error: error.message,
          };
        }
      }),
    );

    return {
      success: true,
      data: results,
    };
  }

  /**
   * 获取公众号数据看板汇总
   */
  @Get('dashboard/summary')
  @Roles('admin', 'editor', 'manager', 'viewer')
  @ApiOperation({
    summary: '获取公众号数据看板汇总',
    description: '获取所有公众号的聚合数据，用于数据看板展示',
  })
  @ApiResponse({ status: 200, description: '成功获取数据看板汇总' })
  async getDashboardSummary(@Req() req: Request) {
    const tenantId = (req.user as any)?.tenantId || 'demo-tenant';
    try {
      // 获取所有已绑定的公众号
      const accounts = await this.wechatAccountService.getBoundAccounts(tenantId);

      if (accounts.length === 0) {
        return {
          success: true,
          data: {
            totalAccounts: 0,
            totalFans: 0,
            totalRead: 0,
            totalLike: 0,
            totalShare: 0,
            netFansToday: 0,
            readToday: 0,
            likeToday: 0,
            shareToday: 0,
            weeklyTrend: [],
            topArticles: [],
            updatedAt: new Date().toISOString(),
          },
        };
      }

      // 汇总数据
      let totalFans = 0;
      let totalRead = 0;
      let totalLike = 0;
      let totalShare = 0;
      let netFansToday = 0;
      let readToday = 0;
      let likeToday = 0;
      let shareToday = 0;
      const allTopArticles: any[] = [];

      // 获取每个公众号的详细统计数据
      for (const account of accounts) {
        try {
          const stats = await this.wechatAccountService.getAccountStats(account.id, tenantId);

          totalFans += stats.fansCount || 0;
          totalRead += stats.totalRead || 0;
          totalLike += stats.totalLike || 0;
          totalShare += stats.totalShare || 0;

          if (stats.today) {
            netFansToday += stats.today.netFans || 0;
            readToday += stats.today.readCount || 0;
            likeToday += stats.today.likeCount || 0;
            shareToday += stats.today.shareCount || 0;
          }

          // 收集热门文章
          if (stats.topArticles && Array.isArray(stats.topArticles)) {
            const articlesWithAccount = stats.topArticles.map(article => ({
              ...article,
              accountName: account.mpName,
              accountId: account.id,
            }));
            allTopArticles.push(...articlesWithAccount);
          }
        } catch (error) {
          // 单个账号统计失败不影响整体
          console.error(`Failed to get stats for account ${account.id}:`, error);
        }
      }

      // 按阅读量排序，取前10
      const sortedArticles = allTopArticles
        .sort((a, b) => (b.readCount || 0) - (a.readCount || 0))
        .slice(0, 10);

      // 生成7天趋势数据（使用第一个账号的趋势数据作为示例）
      let weeklyTrend = [];
      if (accounts.length > 0) {
        try {
          const firstAccountStats = await this.wechatAccountService.getAccountStats(accounts[0].id, tenantId);
          weeklyTrend = firstAccountStats.weeklyTrend || [];
        } catch (error) {
          console.error('Failed to get weekly trend:', error);
        }
      }

      return {
        success: true,
        data: {
          totalAccounts: accounts.length,
          totalFans,
          totalRead,
          totalLike,
          totalShare,
          netFansToday,
          readToday,
          likeToday,
          shareToday,
          weeklyTrend,
          topArticles: sortedArticles,
          updatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 获取公众号文章排行
   */
  @Get('dashboard/articles/rank')
  @Roles('admin', 'editor', 'manager', 'viewer')
  @ApiOperation({
    summary: '获取公众号文章排行',
    description: '获取所有公众号文章的阅读量、点赞量、转发量排行',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '排行类型：read（阅读量）、like（点赞量）、share（转发量），默认为read',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '返回数量，默认10',
  })
  @ApiResponse({ status: 200, description: '成功获取文章排行' })
  async getArticleRank(
    @Query('type') type: string = 'read',
    @Query('limit') limit: string = '10',
    @Req() req: Request,
  ) {
    const tenantId = (req.user as any)?.tenantId || 'demo-tenant';
    const limitNum = parseInt(limit, 10) || 10;

    try {
      // 获取所有已绑定的公众号
      const accounts = await this.wechatAccountService.getBoundAccounts(tenantId);

      if (accounts.length === 0) {
        return {
          success: true,
          data: [],
          total: 0,
        };
      }

      const allArticles: any[] = [];

      // 获取每个公众号的热门文章
      for (const account of accounts) {
        try {
          const stats = await this.wechatAccountService.getAccountStats(account.id, tenantId);

          if (stats.topArticles && Array.isArray(stats.topArticles)) {
            const articlesWithAccount = stats.topArticles.map(article => ({
              ...article,
              accountName: account.mpName,
              accountId: account.id,
              wechatId: account.wechatId,
            }));
            allArticles.push(...articlesWithAccount);
          }
        } catch (error) {
          console.error(`Failed to get articles for account ${account.id}:`, error);
        }
      }

      // 根据类型排序
      let sortedArticles = [];
      if (type === 'like') {
        sortedArticles = allArticles
          .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
          .slice(0, limitNum);
      } else if (type === 'share') {
        sortedArticles = allArticles
          .sort((a, b) => (b.shareCount || 0) - (a.shareCount || 0))
          .slice(0, limitNum);
      } else {
        // 默认为阅读量排行
        sortedArticles = allArticles
          .sort((a, b) => (b.readCount || 0) - (a.readCount || 0))
          .slice(0, limitNum);
      }

      return {
        success: true,
        data: sortedArticles,
        total: sortedArticles.length,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}