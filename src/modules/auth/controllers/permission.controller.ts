import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Permission } from '../../../entities/permission.entity';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('api/permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: '获取所有权限' })
  @ApiResponse({ status: 200, description: '成功获取权限列表', type: [Permission] })
  async findAll(@Request() req): Promise<Permission[]> {
    return this.permissionService.findAll(req.user.tenantId);
  }

  @Get('module/:module')
  @Roles('admin')
  @ApiOperation({ summary: '按模块获取权限' })
  @ApiResponse({ status: 200, description: '成功获取权限列表', type: [Permission] })
  async findByModule(@Param('module') module: string, @Request() req): Promise<Permission[]> {
    return this.permissionService.findByModule(module, req.user.tenantId);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: '获取权限详情' })
  @ApiResponse({ status: 200, description: '成功获取权限', type: Permission })
  @ApiResponse({ status: 404, description: '权限不存在' })
  async findOne(@Param('id') id: string, @Request() req): Promise<Permission> {
    return this.permissionService.findOne(id, req.user.tenantId);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '创建新权限' })
  @ApiResponse({ status: 201, description: '成功创建权限', type: Permission })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
    @Request() req,
  ): Promise<Permission> {
    return this.permissionService.create(createPermissionDto, req.user.tenantId);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: '更新权限' })
  @ApiResponse({ status: 200, description: '成功更新权限', type: Permission })
  @ApiResponse({ status: 404, description: '权限不存在' })
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @Request() req,
  ): Promise<Permission> {
    return this.permissionService.update(id, updatePermissionDto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: '删除权限' })
  @ApiResponse({ status: 204, description: '成功删除权限' })
  @ApiResponse({ status: 404, description: '权限不存在' })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.permissionService.remove(id, req.user.tenantId);
  }
}