"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_strategy_1 = require("../../../../src/modules/auth/strategies/jwt.strategy");
const user_entity_1 = require("../../../../src/entities/user.entity");
const user_role_entity_1 = require("../../../../src/entities/user-role.entity");
const role_entity_1 = require("../../../../src/entities/role.entity");
describe('JwtStrategy', () => {
    let jwtStrategy;
    let userRepository;
    let userRoleRepository;
    let roleRepository;
    let configService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                jwt_strategy_1.JwtStrategy,
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('test-secret-key'),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_role_entity_1.UserRole),
                    useValue: {
                        find: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(role_entity_1.Role),
                    useValue: {
                        find: jest.fn(),
                    },
                },
            ],
        }).compile();
        jwtStrategy = module.get(jwt_strategy_1.JwtStrategy);
        configService = module.get(config_1.ConfigService);
        userRepository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        userRoleRepository = module.get((0, typeorm_1.getRepositoryToken)(user_role_entity_1.UserRole));
        roleRepository = module.get((0, typeorm_1.getRepositoryToken)(role_entity_1.Role));
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('constructor', () => {
        it('should initialize with correct options', () => {
            expect(jwtStrategy).toBeDefined();
            expect(configService.get).toHaveBeenCalledWith('JWT_SECRET', 'your-secret-key');
        });
    });
    describe('validate', () => {
        const payload = {
            sub: 'user-id',
            username: 'testuser',
            email: 'test@example.com',
            tenantId: 'tenant-id',
        };
        it('should return user with roles and permissions when user exists', async () => {
            const mockUser = {
                id: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                tenantId: 'tenant-id',
            };
            const mockUserRoles = [
                {
                    userId: 'user-id',
                    roleId: 'role-1',
                    role: { id: 'role-1', name: 'admin' },
                },
                {
                    userId: 'user-id',
                    roleId: 'role-2',
                    role: { id: 'role-2', name: 'editor' },
                },
            ];
            const mockRoles = [
                {
                    id: 'role-1',
                    name: 'admin',
                    description: 'Administrator',
                    permissions: [
                        { id: 'perm-1', module: 'users', action: 'create' },
                        { id: 'perm-2', module: 'users', action: 'read' },
                    ],
                },
                {
                    id: 'role-2',
                    name: 'editor',
                    description: 'Editor',
                    permissions: [
                        { id: 'perm-3', module: 'content', action: 'edit' },
                        { id: 'perm-4', module: 'content', action: 'publish' },
                    ],
                },
            ];
            userRepository.findOne.mockResolvedValue(mockUser);
            userRoleRepository.find.mockResolvedValue(mockUserRoles);
            roleRepository.find.mockResolvedValue(mockRoles);
            const result = await jwtStrategy.validate(payload);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: payload.sub },
                select: ['id', 'username', 'email', 'tenantId'],
            });
            expect(userRoleRepository.find).toHaveBeenCalledWith({
                where: { userId: 'user-id' },
                relations: ['role'],
            });
            expect(roleRepository.find).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.any(Object),
                relations: ['permissions'],
            }));
            expect(result).toEqual({
                id: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                tenantId: 'tenant-id',
                roles: [
                    { id: 'role-1', name: 'admin', description: 'Administrator' },
                    { id: 'role-2', name: 'editor', description: 'Editor' },
                ],
                permissions: [
                    { id: 'perm-1', module: 'users', action: 'create' },
                    { id: 'perm-2', module: 'users', action: 'read' },
                    { id: 'perm-3', module: 'content', action: 'edit' },
                    { id: 'perm-4', module: 'content', action: 'publish' },
                ],
            });
        });
        it('should return null when user does not exist', async () => {
            userRepository.findOne.mockResolvedValue(null);
            const result = await jwtStrategy.validate(payload);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: payload.sub },
                select: ['id', 'username', 'email', 'tenantId'],
            });
            expect(result).toBeNull();
        });
        it('should handle empty roles and permissions', async () => {
            const mockUser = {
                id: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                tenantId: 'tenant-id',
            };
            const mockUserRoles = [];
            const mockRoles = [];
            userRepository.findOne.mockResolvedValue(mockUser);
            userRoleRepository.find.mockResolvedValue(mockUserRoles);
            roleRepository.find.mockResolvedValue(mockRoles);
            const result = await jwtStrategy.validate(payload);
            expect(result).toEqual({
                id: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                tenantId: 'tenant-id',
                roles: [],
                permissions: [],
            });
        });
        it('should deduplicate permissions with same module:action', async () => {
            const mockUser = {
                id: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                tenantId: 'tenant-id',
            };
            const mockUserRoles = [
                {
                    userId: 'user-id',
                    roleId: 'role-1',
                    role: { id: 'role-1', name: 'admin' },
                },
                {
                    userId: 'user-id',
                    roleId: 'role-2',
                    role: { id: 'role-2', name: 'editor' },
                },
            ];
            const mockRoles = [
                {
                    id: 'role-1',
                    name: 'admin',
                    description: 'Administrator',
                    permissions: [
                        { id: 'perm-1', module: 'users', action: 'create' },
                        { id: 'perm-2', module: 'users', action: 'read' },
                    ],
                },
                {
                    id: 'role-2',
                    name: 'editor',
                    description: 'Editor',
                    permissions: [
                        { id: 'perm-3', module: 'users', action: 'create' },
                        { id: 'perm-4', module: 'content', action: 'edit' },
                    ],
                },
            ];
            userRepository.findOne.mockResolvedValue(mockUser);
            userRoleRepository.find.mockResolvedValue(mockUserRoles);
            roleRepository.find.mockResolvedValue(mockRoles);
            const result = await jwtStrategy.validate(payload);
            expect(result.permissions).toHaveLength(3);
            expect(result.permissions).toEqual(expect.arrayContaining([
                { id: 'perm-3', module: 'users', action: 'create' },
                { id: 'perm-2', module: 'users', action: 'read' },
                { id: 'perm-4', module: 'content', action: 'edit' },
            ]));
            expect(result.permissions).not.toContainEqual(expect.objectContaining({
                id: 'perm-1',
                module: 'users',
                action: 'create',
            }));
        });
    });
});
//# sourceMappingURL=jwt.strategy.spec.js.map