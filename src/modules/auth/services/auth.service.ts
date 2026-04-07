import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SwitchUserDto } from '../dto/switch-user.dto';
import { User } from '../../../entities/user.entity';
import { TenantContextService } from '../../../shared/services/tenant-context.service';

interface JwtPayload {
  sub: string;
  username?: string;
  email?: string;
  tenantId: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private tenantContextService: TenantContextService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<(Omit<User, 'passwordHash'> & { roles: string[] }) | null> {
    // 登录时先不限制tenantId，根据用户名查找用户
    // 这样可以支持跨租户登录（用户输入用户名和密码，系统自动识别所属租户）
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'passwordHash', 'email', 'tenantId'],
      relations: ['userRoles', 'userRoles.role'],
    });

    if (
      user &&
      (await // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (bcrypt.compare as (plaintext: string, hash: string) => Promise<boolean>)(
        password,
        user.passwordHash,
      ))
    ) {
      const { passwordHash: __, userRoles, ...result } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
      const roles = userRoles?.map(ur => ur.role.name) || [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userRoles: _, ...userWithoutRoles } = result as any;
      return { ...userWithoutRoles, roles } as (Omit<User, 'passwordHash'> & { roles: string[] });
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        tenantId: user.tenantId,
        roles: user.roles,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const tenantId =
      registerDto.tenantId || this.tenantContextService.getCurrentTenantId();

    // 检查用户名是否已存在（当前租户内）
    const existingUser = await this.userRepository.findOne({
      where: { username: registerDto.username, tenantId },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在（当前租户内）
    const existingEmail = await this.userRepository.findOne({
      where: { email: registerDto.email, tenantId },
    });

    if (existingEmail) {
      throw new ConflictException('邮箱已被注册');
    }

    // 密码哈希
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const salt = await bcrypt.genSalt();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    // 创建用户
    const user = this.userRepository.create({
      username: registerDto.username,
      passwordHash,
      email: registerDto.email,
      tenantId,
    });

    const savedUser = await this.userRepository.save(user);

    // 生成令牌
    const payload: JwtPayload = {
      sub: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
      tenantId: savedUser.tenantId,
      roles: [],
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        tenantId: savedUser.tenantId,
        roles: [],
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload: JwtPayload = this.jwtService.verify(
        refreshTokenDto.refresh_token,
      );

      // 检查用户是否存在且属于正确的租户
      const user = await this.userRepository.findOne({
        where: { id: payload.sub, tenantId: payload.tenantId },
        select: ['id', 'username', 'email', 'tenantId'],
        relations: ['userRoles', 'userRoles.role'],
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const roles = user.userRoles?.map(ur => ur.role.name) || [];
      const newPayload: JwtPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        tenantId: user.tenantId,
        roles,
      };

      return {
        access_token: this.jwtService.sign(newPayload),
        refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  async getProfile(userId: string) {
    const tenantId = this.tenantContextService.getCurrentTenantId();
    const user = await this.userRepository.findOne({
      where: { id: userId, tenantId },
      select: ['id', 'username', 'email', 'tenantId', 'createdAt'],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return user;
  }

  async switchUser(switchUserDto: SwitchUserDto, currentUserId: string) {
    const tenantId = this.tenantContextService.getCurrentTenantId();

    // 获取当前用户信息，验证权限
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId, tenantId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!currentUser) {
      throw new UnauthorizedException('当前用户不存在');
    }

    // 检查当前用户是否有切换权限（管理员角色）
    const currentUserRoles = currentUser.userRoles?.map(ur => ur.role.name) || [];
    const isAdmin = currentUserRoles.includes('ADMIN');

    // 在DEMO环境中，允许所有用户切换（为了演示方便）
    // 在生产环境中，应该只允许管理员切换
    // 这里我们检查是否为DEMO环境，通过检查租户ID是否为演示租户
    const isDemoTenant = tenantId === '33333333-3333-3333-3333-333333333333' || // 政务版演示租户
                         tenantId === '11111111-1111-1111-1111-111111111111'; // 商务版演示租户

    if (!isAdmin && !isDemoTenant) {
      throw new UnauthorizedException('无权切换用户');
    }

    // 获取目标用户：支持按ID或email查找
    let targetUser: User | null = null;

    // 检查是否为UUID格式
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(switchUserDto.targetUserId);

    if (isUuid) {
      targetUser = await this.userRepository.findOne({
        where: { id: switchUserDto.targetUserId, tenantId },
        relations: ['userRoles', 'userRoles.role'],
      });
    } else {
      // 按email查找
      targetUser = await this.userRepository.findOne({
        where: { email: switchUserDto.targetUserId, tenantId },
        relations: ['userRoles', 'userRoles.role'],
      });

      // 如果按email找不到，尝试按username查找
      if (!targetUser) {
        targetUser = await this.userRepository.findOne({
          where: { username: switchUserDto.targetUserId, tenantId },
          relations: ['userRoles', 'userRoles.role'],
        });
      }
    }

    if (!targetUser) {
      throw new UnauthorizedException('目标用户不存在或不属于当前租户');
    }

    // 生成新的JWT令牌
    const targetUserRoles = targetUser.userRoles?.map(ur => ur.role.name) || [];
    const payload: JwtPayload = {
      sub: targetUser.id,
      username: targetUser.username,
      email: targetUser.email,
      tenantId: targetUser.tenantId,
      roles: targetUserRoles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: targetUser.id,
        username: targetUser.username,
        email: targetUser.email,
        tenantId: targetUser.tenantId,
        roles: targetUserRoles,
      },
    };
  }
}
