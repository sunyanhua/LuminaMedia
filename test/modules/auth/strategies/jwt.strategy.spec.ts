import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtStrategy } from '../../../../src/modules/auth/strategies/jwt.strategy';
import { User } from '../../../../src/entities/user.entity';
import { UserRole } from '../../../../src/entities/user-role.entity';
import { Role } from '../../../../src/entities/role.entity';
import { Permission } from '../../../../src/entities/permission.entity';
import { UserRepository } from '../../../../src/shared/repositories/user.repository';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository: Repository<User>;
  let userRoleRepository: Repository<UserRole>;
  let roleRepository: Repository<Role>;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret-key'),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
    userRepository = module.get<UserRepository>(UserRepository);
    userRoleRepository = module.get<Repository<UserRole>>(
      getRepositoryToken(UserRole),
    );
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct options', () => {
      expect(jwtStrategy).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith(
        'JWT_SECRET',
        'your-secret-key',
      );
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

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (userRoleRepository.find as jest.Mock).mockResolvedValue(mockUserRoles);
      (roleRepository.find as jest.Mock).mockResolvedValue(mockRoles);

      const result = await jwtStrategy.validate(payload);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.sub },
        select: ['id', 'username', 'email', 'tenantId'],
      });
      expect(userRoleRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        relations: ['role'],
      });
      expect(roleRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
          relations: ['permissions'],
        }),
      );

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
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

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

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (userRoleRepository.find as jest.Mock).mockResolvedValue(mockUserRoles);
      (roleRepository.find as jest.Mock).mockResolvedValue(mockRoles);

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
            { id: 'perm-3', module: 'users', action: 'create' }, // duplicate module:action
            { id: 'perm-4', module: 'content', action: 'edit' },
          ],
        },
      ];

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (userRoleRepository.find as jest.Mock).mockResolvedValue(mockUserRoles);
      (roleRepository.find as jest.Mock).mockResolvedValue(mockRoles);

      const result = await jwtStrategy.validate(payload);

      // Should have 3 unique permissions (users:create, users:read, content:edit)
      expect(result.permissions).toHaveLength(3);
      expect(result.permissions).toEqual(
        expect.arrayContaining([
          { id: 'perm-3', module: 'users', action: 'create' },
          { id: 'perm-2', module: 'users', action: 'read' },
          { id: 'perm-4', module: 'content', action: 'edit' },
        ]),
      );
      // perm-1 (duplicate users:create) should not appear (overwritten by perm-3)
      expect(result.permissions).not.toContainEqual(
        expect.objectContaining({
          id: 'perm-1',
          module: 'users',
          action: 'create',
        }),
      );
    });
  });
});
