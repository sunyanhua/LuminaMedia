import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserRole } from '../../../entities/user-role.entity';
import { Role } from '../../../entities/role.entity';
import { User } from '../../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() as any,
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'username', 'email', 'tenantId'],
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.permissions'],
    });

    if (!user) {
      return null;
    }

    // 从加载的关联中提取角色和权限
    const roles: Role[] = [];
    const permissions: Array<{ id: string; module: string; action: string }> =
      [];

    if (user.userRoles) {
      user.userRoles.forEach((userRole) => {
        if (userRole.role) {
          roles.push(userRole.role);
          if (userRole.role.permissions) {
            userRole.role.permissions.forEach((permission) => {
              permissions.push({
                id: permission.id,
                module: permission.module,
                action: permission.action,
              });
            });
          }
        }
      });
    }

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
