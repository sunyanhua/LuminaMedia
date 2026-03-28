import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import type { User } from '../../../entities/user.entity';
import { UserRepository } from '../../../shared/repositories/user.repository';
import { TenantContextService } from '../../../shared/services/tenant-context.service';

interface JwtPayload {
  sub: string;
  username?: string;
  email?: string;
  tenantId: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private tenantContextService: TenantContextService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const tenantId = this.tenantContextService.getCurrentTenantId();
    const user = await this.userRepository.findOne({
      where: { username, tenantId },
      select: ['id', 'username', 'passwordHash', 'email', 'tenantId'],
    });

    if (
      user &&
      (await // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (bcrypt.compare as (plaintext: string, hash: string) => Promise<boolean>)(
        password,
        user.passwordHash,
      ))
    ) {
      const { passwordHash: __, ...result } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      tenantId: user.tenantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        tenantId: user.tenantId,
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
    const payload = {
      sub: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
      tenantId: savedUser.tenantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        tenantId: savedUser.tenantId,
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
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const newPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        tenantId: user.tenantId,
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
}
