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
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TenantProfileService } from '../services/tenant-profile.service';
import { TenantProfile } from '../../../entities/tenant-profile.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../shared/guards/tenant.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../../shared/enums/user-role.enum';

@ApiTags('知识库 - 租户画像')
@ApiBearerAuth()
@Controller('knowledge/tenant-profiles')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class TenantProfileController {
  private readonly logger = new Logger(TenantProfileController.name);

  constructor(private readonly tenantProfileService: TenantProfileService) {}

  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER, UserRole.CONTENT_EDITOR)
  @ApiOperation({ summary: '生成租户画像', description: '基于知识库文档生成或重新生成租户画像' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '画像生成任务已启动', type: TenantProfile })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '没有可用的知识库文档' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: '未授权' })
  async generateTenantProfile(
    @Body() body: { documentIds?: string[] },
  ): Promise<TenantProfile> {
    // 从请求上下文中获取tenantId（由TenantGuard设置）
    const tenantId = (global as any).tenantId || 'default-tenant';
    this.logger.log(`生成租户画像请求: tenantId=${tenantId}`);

    return this.tenantProfileService.generateTenantProfile(
      tenantId,
      body.documentIds,
    );
  }

  @Get('current')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER, UserRole.CONTENT_EDITOR, UserRole.VIEWER)
  @ApiOperation({ summary: '获取当前租户画像', description: '获取当前租户的最新版本画像' })
  @ApiResponse({ status: HttpStatus.OK, description: '返回当前租户画像', type: TenantProfile })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '未找到画像' })
  async getCurrentProfile(): Promise<TenantProfile | null> {
    const tenantId = (global as any).tenantId || 'default-tenant';
    return this.tenantProfileService.getCurrentProfile(tenantId);
  }

  @Get('versions')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER, UserRole.CONTENT_EDITOR, UserRole.VIEWER)
  @ApiOperation({ summary: '获取租户画像版本列表', description: '获取租户的所有画像版本' })
  @ApiResponse({ status: HttpStatus.OK, description: '返回画像版本列表', type: [TenantProfile] })
  async getProfileVersions(): Promise<TenantProfile[]> {
    const tenantId = (global as any).tenantId || 'default-tenant';
    return this.tenantProfileService.getProfileVersions(tenantId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER, UserRole.CONTENT_EDITOR, UserRole.VIEWER)
  @ApiOperation({ summary: '获取画像详情', description: '根据ID获取特定画像详情' })
  @ApiParam({ name: 'id', description: '画像ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '返回画像详情', type: TenantProfile })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '未找到画像' })
  async getProfile(@Param('id') id: string): Promise<TenantProfile> {
    return this.tenantProfileService.getProfile(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiOperation({ summary: '更新画像', description: '人工调整画像内容' })
  @ApiParam({ name: 'id', description: '画像ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功', type: TenantProfile })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '未找到画像' })
  async updateProfile(
    @Param('id') id: string,
    @Body() updates: Partial<TenantProfile>,
  ): Promise<TenantProfile> {
    // 从请求上下文中获取userId（由JwtAuthGuard设置）
    const userId = (global as any).userId || 'system';
    return this.tenantProfileService.updateProfile(id, updates, userId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除画像', description: '软删除指定画像' })
  @ApiParam({ name: 'id', description: '画像ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: '删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '未找到画像' })
  async deleteProfile(@Param('id') id: string): Promise<void> {
    await this.tenantProfileService.deleteProfile(id);
  }

  @Get(':id/status')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER, UserRole.CONTENT_EDITOR, UserRole.VIEWER)
  @ApiOperation({ summary: '获取画像生成状态', description: '获取画像的生成状态信息' })
  @ApiParam({ name: 'id', description: '画像ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '返回状态信息' })
  async getGenerationStatus(@Param('id') id: string): Promise<{
    status: string;
    generatedAt?: Date;
    lastEditedAt?: Date;
    version: number;
  }> {
    return this.tenantProfileService.getGenerationStatus(id);
  }

  @Post(':id/regenerate')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiOperation({ summary: '重新生成画像', description: '基于最新文档重新生成画像' })
  @ApiParam({ name: 'id', description: '当前画像ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '重新生成任务已启动', type: TenantProfile })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '未找到当前画像' })
  async regenerateProfile(@Param('id') id: string): Promise<TenantProfile> {
    const currentProfile = await this.tenantProfileService.getProfile(id);
    const tenantId = currentProfile.tenantId;

    // 重新生成画像（使用最新文档）
    return this.tenantProfileService.generateTenantProfile(tenantId);
  }
}