import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../../entities/user.entity';
import { TenantContextService } from '../../../shared/services/tenant-context.service';
import { UserRepository } from '../../../shared/repositories/user.repository';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private tenantContextService: TenantContextService,
  ) {}

  /**
   * 哈希密码
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * 获取当前租户的所有用户（分页）
   */
  async findAll(page = 1, limit = 10): Promise<{ data: User[]; total: number }> {
    const tenantId = this.tenantContextService.getCurrentTenantId();
    const [data, total] = await this.userRepository.findAndCount({
      where: { tenantId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  /**
   * 根据ID获取用户（确保属于当前租户）
   */
  async findOne(id: string): Promise<User> {
    const tenantId = this.tenantContextService.getCurrentTenantId();
    const user = await this.userRepository.findOne({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在或不属于当前租户`);
    }

    return user;
  }

  /**
   * 创建新用户（自动设置当前租户）
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const tenantId = this.tenantContextService.getCurrentTenantId();

    // 检查用户名是否已存在（当前租户内）
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username, tenantId },
    });

    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    // 检查邮箱是否已存在（当前租户内）
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email, tenantId },
    });

    if (existingEmail) {
      throw new BadRequestException('邮箱已存在');
    }

    // 创建用户（密码哈希）
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = this.userRepository.create({
      ...createUserDto,
      tenantId,
      passwordHash: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  /**
   * 更新用户信息（确保属于当前租户）
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const tenantId = this.tenantContextService.getCurrentTenantId();

    // 查找用户
    const user = await this.userRepository.findOne({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在或不属于当前租户`);
    }

    // 如果更新用户名，检查是否重复
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username, tenantId },
      });

      if (existingUser) {
        throw new BadRequestException('用户名已存在');
      }
    }

    // 如果更新邮箱，检查是否重复
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email, tenantId },
      });

      if (existingEmail) {
        throw new BadRequestException('邮箱已存在');
      }
    }

    // 更新用户
    Object.assign(user, updateUserDto);

    // 如果更新密码，需要重新哈希
    if (updateUserDto.password) {
      user.passwordHash = await this.hashPassword(updateUserDto.password);
    }

    return await this.userRepository.save(user);
  }

  /**
   * 删除用户（确保属于当前租户）
   */
  async delete(id: string): Promise<void> {
    const tenantId = this.tenantContextService.getCurrentTenantId();

    const result = await this.userRepository.delete({ id, tenantId });

    if (result.affected === 0) {
      throw new NotFoundException(`用户 ${id} 不存在或不属于当前租户`);
    }
  }

  /**
   * 根据用户名查找用户（用于认证）
   */
  async findByUsername(username: string): Promise<User | null> {
    const tenantId = this.tenantContextService.getCurrentTenantId();
    return await this.userRepository.findOne({
      where: { username, tenantId },
    });
  }
}