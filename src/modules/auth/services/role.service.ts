import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '../../../entities/role.entity';
import { Permission } from '../../../entities/permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async findAll(tenantId: string): Promise<Role[]> {
    return this.roleRepository.find({
      where: { tenantId },
      relations: ['permissions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, tenantId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async create(createRoleDto: CreateRoleDto, tenantId: string): Promise<Role> {
    const role = this.roleRepository.create({
      ...createRoleDto,
      tenantId,
    });

    return this.roleRepository.save(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, tenantId: string): Promise<Role> {
    const role = await this.findOne(id, tenantId);

    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const role = await this.findOne(id, tenantId);
    await this.roleRepository.remove(role);
  }

  async assignPermissions(id: string, assignPermissionsDto: AssignPermissionsDto, tenantId: string): Promise<Role> {
    const role = await this.findOne(id, tenantId);
    const permissions = await this.permissionRepository.find({
      where: {
        id: In(assignPermissionsDto.permissionIds),
        tenantId,
      },
    });

    if (permissions.length !== assignPermissionsDto.permissionIds.length) {
      throw new NotFoundException('Some permissions not found');
    }

    role.permissions = permissions;
    return this.roleRepository.save(role);
  }

  async getPermissions(id: string, tenantId: string): Promise<Permission[]> {
    const role = await this.roleRepository.findOne({
      where: { id, tenantId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role.permissions;
  }
}