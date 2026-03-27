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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../../../entities/role.entity';
import { Permission } from '../../../entities/permission.entity';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('api/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: '获取所有角色' })
  @ApiResponse({ status: 200, description: '成功获取角色列表', type: [Role] })
  async findAll(@Request() req): Promise<Role[]> {
    return this.roleService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: '获取角色详情' })
  @ApiResponse({ status: 200, description: '成功获取角色', type: Role })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async findOne(@Param('id') id: string, @Request() req): Promise<Role> {
    return this.roleService.findOne(id, req.user.tenantId);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '创建新角色' })
  @ApiResponse({ status: 201, description: '成功创建角色', type: Role })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @Request() req,
  ): Promise<Role> {
    return this.roleService.create(createRoleDto, req.user.tenantId);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: '更新角色' })
  @ApiResponse({ status: 200, description: '成功更新角色', type: Role })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() req,
  ): Promise<Role> {
    return this.roleService.update(id, updateRoleDto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: '删除角色' })
  @ApiResponse({ status: 204, description: '成功删除角色' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.roleService.remove(id, req.user.tenantId);
  }

  @Post(':id/permissions')
  @Roles('admin')
  @ApiOperation({ summary: '为角色分配权限' })
  @ApiResponse({ status: 200, description: '成功分配权限', type: Role })
  @ApiResponse({ status: 404, description: '角色或权限不存在' })
  async assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
    @Request() req,
  ): Promise<Role> {
    return this.roleService.assignPermissions(
      id,
      assignPermissionsDto,
      req.user.tenantId,
    );
  }

  @Get(':id/permissions')
  @Roles('admin')
  @ApiOperation({ summary: '获取角色的权限列表' })
  @ApiResponse({
    status: 200,
    description: '成功获取权限列表',
    type: [Permission],
  })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async getPermissions(
    @Param('id') id: string,
    @Request() req,
  ): Promise<Permission[]> {
    return this.roleService.getPermissions(id, req.user.tenantId);
  }
}
