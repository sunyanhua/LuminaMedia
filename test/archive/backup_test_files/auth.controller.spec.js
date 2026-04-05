"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("../services/auth.service");
const common_1 = require("@nestjs/common");
describe('AuthController', () => {
    let controller;
    let authService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [auth_controller_1.AuthController],
            providers: [
                {
                    provide: auth_service_1.AuthService,
                    useValue: {
                        login: jest.fn(),
                        register: jest.fn(),
                        refreshToken: jest.fn(),
                        getProfile: jest.fn(),
                    },
                },
            ],
        }).compile();
        controller = module.get(auth_controller_1.AuthController);
        authService = module.get(auth_service_1.AuthService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('login', () => {
        it('should call authService.login with loginDto and return result', async () => {
            const loginDto = {
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
            authService.login.mockResolvedValue(expectedResult);
            const result = await controller.login(loginDto);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(result).toBe(expectedResult);
        });
        it('should propagate UnauthorizedException from authService.login', async () => {
            const loginDto = {
                username: 'testuser',
                password: 'wrongpassword',
            };
            authService.login.mockRejectedValue(new common_1.UnauthorizedException());
            await expect(controller.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });
    describe('register', () => {
        it('should call authService.register with registerDto and return result', async () => {
            const registerDto = {
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
            authService.register.mockResolvedValue(expectedResult);
            const result = await controller.register(registerDto);
            expect(authService.register).toHaveBeenCalledWith(registerDto);
            expect(result).toBe(expectedResult);
        });
        it('should propagate ConflictException from authService.register', async () => {
            const registerDto = {
                username: 'existinguser',
                email: 'existing@example.com',
                password: 'password123',
            };
            authService.register.mockRejectedValue(new common_1.ConflictException());
            await expect(controller.register(registerDto)).rejects.toThrow(common_1.ConflictException);
            expect(authService.register).toHaveBeenCalledWith(registerDto);
        });
        it('should handle registerDto without tenantId', async () => {
            const registerDto = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'password123',
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
            authService.register.mockResolvedValue(expectedResult);
            const result = await controller.register(registerDto);
            expect(authService.register).toHaveBeenCalledWith(registerDto);
            expect(result).toBe(expectedResult);
        });
    });
    describe('refresh', () => {
        it('should call authService.refreshToken with refreshTokenDto and return result', async () => {
            const refreshTokenDto = {
                refresh_token: 'refresh-token',
            };
            const expectedResult = {
                access_token: 'new-access-token',
                refresh_token: 'new-refresh-token',
            };
            authService.refreshToken.mockResolvedValue(expectedResult);
            const result = await controller.refresh(refreshTokenDto);
            expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
            expect(result).toBe(expectedResult);
        });
        it('should propagate UnauthorizedException from authService.refreshToken', async () => {
            const refreshTokenDto = {
                refresh_token: 'invalid-token',
            };
            authService.refreshToken.mockRejectedValue(new common_1.UnauthorizedException());
            await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(common_1.UnauthorizedException);
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
            authService.getProfile.mockResolvedValue(expectedResult);
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
            authService.getProfile.mockRejectedValue(new common_1.UnauthorizedException());
            await expect(controller.getProfile(mockRequest)).rejects.toThrow(common_1.UnauthorizedException);
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
            authService.getProfile.mockResolvedValue(expectedResult);
            const result = await controller.getProfile(mockRequest);
            expect(authService.getProfile).toHaveBeenCalledWith('user-id');
            expect(result).toBe(expectedResult);
        });
    });
});
//# sourceMappingURL=auth.controller.spec.js.map