import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../services/auth.service';
import { User } from '../../../entities/user.entity';
import { UserRepository } from '../../../shared/repositories/user.repository';
import { TenantContextService } from '../../../shared/services/tenant-context.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let tenantContextService: TenantContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: TenantContextService,
          useValue: {
            getCurrentTenantId: jest.fn().mockReturnValue('default-tenant'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
    tenantContextService =
      module.get<TenantContextService>(TenantContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without passwordHash when credentials are valid', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        passwordHash: 'hashedPassword',
        email: 'test@example.com',
        tenantId: 'tenant-id',
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser('testuser', 'password');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser', tenantId: 'default-tenant' },
        select: ['id', 'username', 'passwordHash', 'email', 'tenantId'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(result).toEqual({
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        tenantId: 'tenant-id',
      });
    });

    it('should return null when user not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      const result = await authService.validateUser('nonexistent', 'password');
      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        passwordHash: 'hashedPassword',
        email: 'test@example.com',
        tenantId: 'tenant-id',
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await authService.validateUser(
        'testuser',
        'wrongpassword',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return tokens and user info when credentials are valid', async () => {
      const loginDto: LoginDto = { username: 'testuser', password: 'password' };
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        tenantId: 'tenant-id',
      };
      jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue(mockUser as any);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await authService.login(loginDto);
      expect(authService.validateUser).toHaveBeenCalledWith(
        'testuser',
        'password',
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        tenantId: 'tenant-id',
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: 'user-id',
          username: 'testuser',
          email: 'test@example.com',
          tenantId: 'tenant-id',
        },
        { expiresIn: '7d' },
      );
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: 'user-id',
          username: 'testuser',
          email: 'test@example.com',
          tenantId: 'tenant-id',
        },
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should create new user and return tokens', async () => {
      const registerDto: RegisterDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password',
        tenantId: 'tenant-id',
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const mockUser = {
        id: 'new-user-id',
        username: 'newuser',
        email: 'new@example.com',
        tenantId: 'tenant-id',
        passwordHash: 'hashedPassword',
      };
      (userRepository.create as jest.Mock).mockReturnValue(mockUser);
      (userRepository.save as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await authService.register(registerDto);
      // 应该调用两次findOne：一次检查用户名，一次检查邮箱
      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
      expect(userRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { username: 'newuser', tenantId: 'tenant-id' },
      });
      expect(userRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { email: 'new@example.com', tenantId: 'tenant-id' },
      });
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 'salt');
      expect(userRepository.create).toHaveBeenCalledWith({
        username: 'newuser',
        passwordHash: 'hashedPassword',
        email: 'new@example.com',
        tenantId: 'tenant-id',
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: 'new-user-id',
          username: 'newuser',
          email: 'new@example.com',
          tenantId: 'tenant-id',
        },
      });
    });

    it('should throw ConflictException when username or email already exists', async () => {
      const registerDto: RegisterDto = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password',
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'existing-id',
      });
      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should use default tenant when tenantId not provided', async () => {
      const registerDto: RegisterDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password',
        // tenantId omitted
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const mockUser = {
        id: 'new-user-id',
        username: 'newuser',
        email: 'new@example.com',
        tenantId: 'default-tenant',
      };
      (userRepository.create as jest.Mock).mockReturnValue(mockUser);
      (userRepository.save as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('token');

      await authService.register(registerDto);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: 'default-tenant' }),
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refresh_token: 'valid-refresh-token',
      };
      const payload = {
        sub: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        tenantId: 'tenant-id',
      };
      (jwtService.verify as jest.Mock).mockReturnValue(payload);
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        tenantId: 'tenant-id',
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await authService.refreshToken(refreshTokenDto);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id', tenantId: 'tenant-id' },
        select: ['id', 'username', 'email', 'tenantId'],
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        tenantId: 'tenant-id',
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: 'user-id',
          username: 'testuser',
          email: 'test@example.com',
          tenantId: 'tenant-id',
        },
        { expiresIn: '7d' },
      );
      expect(result).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refresh_token: 'invalid-token',
      };
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });
      await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const refreshTokenDto: RefreshTokenDto = { refresh_token: 'valid-token' };
      const payload = { sub: 'non-existent-id' };
      (jwtService.verify as jest.Mock).mockReturnValue(payload);
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile when user exists', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        tenantId: 'tenant-id',
        createdAt: new Date('2026-03-26'),
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      const result = await authService.getProfile('user-id');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id', tenantId: 'default-tenant' },
        select: ['id', 'username', 'email', 'tenantId', 'createdAt'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(authService.getProfile('non-existent-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
