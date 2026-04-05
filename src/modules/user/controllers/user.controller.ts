import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import type { CreateUserDto, UpdateUserDto } from '../services/user.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Request } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles('admin', 'editor')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.userService.findAll(page, limit);
  }

  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const targetUser = await this.userService.findOne(id);
    // 确保目标用户属于当前用户的租户（防御性检查）
    if ((req.user as any)?.tenantId !== targetUser.tenantId) {
      throw new ForbiddenException('无权访问该用户');
    }
    return targetUser;
  }

  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const targetUser = await this.userService.findOne(id);
    // 确保目标用户属于当前用户的租户（防御性检查）
    if ((req.user as any)?.tenantId !== targetUser.tenantId) {
      throw new ForbiddenException('无权修改该用户');
    }
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const targetUser = await this.userService.findOne(id);
    // 确保目标用户属于当前用户的租户（防御性检查）
    if ((req.user as any)?.tenantId !== targetUser.tenantId) {
      throw new ForbiddenException('无权删除该用户');
    }
    await this.userService.delete(id);
    return { message: '用户删除成功' };
  }
}
