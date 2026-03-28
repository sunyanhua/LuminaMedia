/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
            refreshToken: jest.fn(),
            getProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call authService.login with loginDto and return result', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };
      const expectedResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: 'user-id',
          username: 'testuser',
          email: 'test@example.com',
          tenantId: 'tenant-id',
        },
      };

      (authService.login as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toBe(expectedResult);
    });

    it('should propagate UnauthorizedException from authService.login', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('register', () => {
    it('should call authService.register with registerDto and return result', async () => {
      const registerDto: RegisterDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        tenantId: 'tenant-id',
      };
      const expectedResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: 'new-user-id',
          username: 'newuser',
          email: 'new@example.com',
          tenantId: 'tenant-id',
        },
      };

      (authService.register as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toBe(expectedResult);
    });

    it('should propagate ConflictException from authService.register', async () => {
      const registerDto: RegisterDto = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      };

      (authService.register as jest.Mock).mockRejectedValue(
        new ConflictException(),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle registerDto without tenantId', async () => {
      const registerDto: RegisterDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        // tenantId omitted
      };
      const expectedResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: 'new-user-id',
          username: 'newuser',
          email: 'new@example.com',
          tenantId: 'default-tenant',
        },
      };

      (authService.register as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshToken with refreshTokenDto and return result', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refresh_token: 'refresh-token',
      };
      const expectedResult = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };

      (authService.refreshToken as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.refresh(refreshTokenDto);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
      expect(result).toBe(expectedResult);
    });

    it('should propagate UnauthorizedException from authService.refreshToken', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refresh_token: 'invalid-token',
      };

      (authService.refreshToken as jest.Mock).mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });
  });

  describe('getProfile', () => {
    it('should call authService.getProfile with user id from request and return result', async () => {
      const mockRequest = {
        user: {
          id: 'user-id',
          username: 'testuser',
          email: 'test@example.com',
          tenantId: 'tenant-id',
        },
      };
      const expectedResult = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        tenantId: 'tenant-id',
        createdAt: new Date('2026-03-26'),
      };

      (authService.getProfile as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.getProfile(mockRequest);

      expect(authService.getProfile).toHaveBeenCalledWith('user-id');
      expect(result).toBe(expectedResult);
    });

    it('should propagate UnauthorizedException from authService.getProfile', async () => {
      const mockRequest = {
        user: {
          id: 'non-existent-id',
        },
      };

      (authService.getProfile as jest.Mock).mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(controller.getProfile(mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.getProfile).toHaveBeenCalledWith('non-existent-id');
    });

    it('should handle request with minimal user object', async () => {
      const mockRequest = {
        user: {
          id: 'user-id',
        },
      };
      const expectedResult = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        tenantId: 'tenant-id',
      };

      (authService.getProfile as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.getProfile(mockRequest);

      expect(authService.getProfile).toHaveBeenCalledWith('user-id');
      expect(result).toBe(expectedResult);
    });
  });
});
