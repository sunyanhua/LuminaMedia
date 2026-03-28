import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserRole } from '../../../entities/user-role.entity';
import { Role } from '../../../entities/role.entity';
import { UserRepository } from '../../../shared/repositories/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() as any,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-secret-key'),
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'username', 'email', 'tenantId'],
    });

    if (!user) {
      return null;
    }

    // 获取用户的角色
    const userRoles = await this.userRoleRepository.find({
      where: { userId: user.id },
      relations: ['role'],
    });

    const roleIds = userRoles.map((ur) => ur.roleId);
    const roles = await this.roleRepository.find({
      where: { id: In(roleIds) },
      relations: ['permissions'],
    });

    // 提取所有权限
    const permissions: Array<{ id: string; module: string; action: string }> =
      [];
    roles.forEach((role) => {
      if (role.permissions) {
        role.permissions.forEach((permission) => {
          permissions.push({
            id: permission.id,
            module: permission.module,
            action: permission.action,
          });
        });
      }
    });

    // 去重权限
    const uniquePermissions = Array.from(
      new Map(permissions.map((p) => [`${p.module}:${p.action}`, p])).values(),
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      tenantId: user.tenantId,
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
      })),
      permissions: uniquePermissions,
    };
  }
}
