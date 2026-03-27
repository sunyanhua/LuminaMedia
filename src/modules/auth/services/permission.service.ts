import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async findAll(tenantId: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { tenantId },
      order: { module: 'ASC', action: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id, tenantId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async create(
    createPermissionDto: CreatePermissionDto,
    tenantId: string,
  ): Promise<Permission> {
    const permission = this.permissionRepository.create({
      ...createPermissionDto,
      tenantId,
    });

    return this.permissionRepository.save(permission);
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    tenantId: string,
  ): Promise<Permission> {
    const permission = await this.findOne(id, tenantId);

    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const permission = await this.findOne(id, tenantId);
    await this.permissionRepository.remove(permission);
  }

  async findByModule(module: string, tenantId: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { module, tenantId },
      order: { action: 'ASC' },
    });
  }
}
