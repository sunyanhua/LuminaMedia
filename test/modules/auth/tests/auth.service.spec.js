"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("../../../../src/modules/auth/services/auth.service");
const user_entity_1 = require("../../../../src/entities/user.entity");
const tenant_context_service_1 = require("../../../../src/shared/services/tenant-context.service");
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
jest.mock('bcrypt');
describe('AuthService', () => {
    let authService;
    let userRepository;
    let jwtService;
    let tenantContextService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: {
                        sign: jest.fn(),
                        verify: jest.fn(),
                    },
                },
                {
                    provide: tenant_context_service_1.TenantContextService,
                    useValue: {
                        getCurrentTenantId: jest.fn().mockReturnValue('default-tenant'),
                    },
                },
            ],
        }).compile();
        authService = module.get(auth_service_1.AuthService);
        userRepository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        jwtService = module.get(jwt_1.JwtService);
        tenantContextService =
            module.get(tenant_context_service_1.TenantContextService);
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
            userRepository.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
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
            userRepository.findOne.mockResolvedValue(null);
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
            userRepository.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);
            const result = await authService.validateUser('testuser', 'wrongpassword');
            expect(result).toBeNull();
        });
    });
    describe('login', () => {
        it('should return tokens and user info when credentials are valid', async () => {
            const loginDto = { username: 'testuser', password: 'password' };
            const mockUser = {
                id: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                tenantId: 'tenant-id',
            };
            jest
                .spyOn(authService, 'validateUser')
                .mockResolvedValue(mockUser);
            jwtService.sign
                .mockReturnValueOnce('access-token')
                .mockReturnValueOnce('refresh-token');
            const result = await authService.login(loginDto);
            expect(authService.validateUser).toHaveBeenCalledWith('testuser', 'password');
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                tenantId: 'tenant-id',
            });
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                tenantId: 'tenant-id',
            }, { expiresIn: '7d' });
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
            const loginDto = {
                username: 'testuser',
                password: 'wrongpassword',
            };
            jest.spyOn(authService, 'validateUser').mockResolvedValue(null);
            await expect(authService.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
    describe('register', () => {
        it('should create new user and return tokens', async () => {
            const registerDto = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'password',
                tenantId: 'tenant-id',
            };
            userRepository.findOne.mockResolvedValue(null);
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword');
            const mockUser = {
                id: 'new-user-id',
                username: 'newuser',
                email: 'new@example.com',
                tenantId: 'tenant-id',
                passwordHash: 'hashedPassword',
            };
            userRepository.create.mockReturnValue(mockUser);
            userRepository.save.mockResolvedValue(mockUser);
            jwtService.sign
                .mockReturnValueOnce('access-token')
                .mockReturnValueOnce('refresh-token');
            const result = await authService.register(registerDto);
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
            const registerDto = {
                username: 'existinguser',
                email: 'existing@example.com',
                password: 'password',
            };
            userRepository.findOne.mockResolvedValue({
                id: 'existing-id',
            });
            await expect(authService.register(registerDto)).rejects.toThrow(common_1.ConflictException);
        });
        it('should use default tenant when tenantId not provided', async () => {
            const registerDto = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'password',
            };
            userRepository.findOne.mockResolvedValue(null);
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword');
            const mockUser = {
                id: 'new-user-id',
                username: 'newuser',
                email: 'new@example.com',
                tenantId: 'default-tenant',
            };
            userRepository.create.mockReturnValue(mockUser);
            userRepository.save.mockResolvedValue(mockUser);
            jwtService.sign.mockReturnValue('token');
            await authService.register(registerDto);
            expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'default-tenant' }));
        });
    });
    describe('refreshToken', () => {
        it('should return new tokens when refresh token is valid', async () => {
            const refreshTokenDto = {
                refresh_token: 'valid-refresh-token',
            };
            const payload = {
                sub: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                tenantId: 'tenant-id',
            };
            jwtService.verify.mockReturnValue(payload);
            const mockUser = {
                id: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                tenantId: 'tenant-id',
            };
            userRepository.findOne.mockResolvedValue(mockUser);
            jwtService.sign
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
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                tenantId: 'tenant-id',
            }, { expiresIn: '7d' });
            expect(result).toEqual({
                access_token: 'new-access-token',
                refresh_token: 'new-refresh-token',
            });
        });
        it('should throw UnauthorizedException when refresh token is invalid', async () => {
            const refreshTokenDto = {
                refresh_token: 'invalid-token',
            };
            jwtService.verify.mockImplementation(() => {
                throw new Error('invalid token');
            });
            await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should throw UnauthorizedException when user does not exist', async () => {
            const refreshTokenDto = { refresh_token: 'valid-token' };
            const payload = { sub: 'non-existent-id' };
            jwtService.verify.mockReturnValue(payload);
            userRepository.findOne.mockResolvedValue(null);
            await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(common_1.UnauthorizedException);
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
            userRepository.findOne.mockResolvedValue(mockUser);
            const result = await authService.getProfile('user-id');
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'user-id', tenantId: 'default-tenant' },
                select: ['id', 'username', 'email', 'tenantId', 'createdAt'],
            });
            expect(result).toEqual(mockUser);
        });
        it('should throw UnauthorizedException when user does not exist', async () => {
            userRepository.findOne.mockResolvedValue(null);
            await expect(authService.getProfile('non-existent-id')).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map