"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const user_controller_1 = require("./user.controller");
const user_service_1 = require("../services/user.service");
describe('UserController', () => {
    let controller;
    let userService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [user_controller_1.UserController],
            providers: [
                {
                    provide: user_service_1.UserService,
                    useValue: {
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();
        controller = module.get(user_controller_1.UserController);
        userService = module.get(user_service_1.UserService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('findAll', () => {
        it('should call userService.findAll with pagination params and return result', async () => {
            const page = 1;
            const limit = 10;
            const expectedResult = {
                data: [
                    {
                        id: 'user-1',
                        username: 'user1',
                        email: 'user1@example.com',
                        tenantId: 'tenant-1',
                    },
                    {
                        id: 'user-2',
                        username: 'user2',
                        email: 'user2@example.com',
                        tenantId: 'tenant-1',
                    },
                ],
                total: 2,
                page,
                limit,
                totalPages: 1,
            };
            userService.findAll.mockResolvedValue(expectedResult);
            const result = await controller.findAll(page, limit);
            expect(userService.findAll).toHaveBeenCalledWith(page, limit);
            expect(result).toBe(expectedResult);
        });
        it('should use default values when page and limit are not provided', async () => {
            const expectedResult = {
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            };
            userService.findAll.mockResolvedValue(expectedResult);
            const result = await controller.findAll(1, 10);
            expect(userService.findAll).toHaveBeenCalledWith(1, 10);
            expect(result).toBe(expectedResult);
        });
        it('should handle different pagination values', async () => {
            const page = 2;
            const limit = 20;
            const expectedResult = {
                data: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
            userService.findAll.mockResolvedValue(expectedResult);
            const result = await controller.findAll(page, limit);
            expect(userService.findAll).toHaveBeenCalledWith(page, limit);
            expect(result).toBe(expectedResult);
        });
    });
    describe('findOne', () => {
        it('should call userService.findOne with id and return result', async () => {
            const userId = 'user-123';
            const expectedResult = {
                id: userId,
                username: 'testuser',
                email: 'test@example.com',
                tenantId: 'tenant-1',
                createdAt: new Date('2026-03-26'),
            };
            userService.findOne.mockResolvedValue(expectedResult);
            const result = await controller.findOne(userId);
            expect(userService.findOne).toHaveBeenCalledWith(userId);
            expect(result).toBe(expectedResult);
        });
        it('should propagate errors from userService.findOne', async () => {
            const userId = 'non-existent-id';
            const error = new Error('User not found');
            userService.findOne.mockRejectedValue(error);
            await expect(controller.findOne(userId)).rejects.toThrow(error);
            expect(userService.findOne).toHaveBeenCalledWith(userId);
        });
    });
    describe('create', () => {
        it('should call userService.create with createUserDto and return result', async () => {
            const createUserDto = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'password123',
                tenantId: 'tenant-1',
            };
            const expectedResult = {
                id: 'new-user-id',
                username: 'newuser',
                email: 'new@example.com',
                tenantId: 'tenant-1',
                createdAt: new Date('2026-03-26'),
            };
            userService.create.mockResolvedValue(expectedResult);
            const result = await controller.create(createUserDto);
            expect(userService.create).toHaveBeenCalledWith(createUserDto);
            expect(result).toBe(expectedResult);
        });
        it('should handle createUserDto without tenantId', async () => {
            const createUserDto = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'password123',
            };
            const expectedResult = {
                id: 'new-user-id',
                username: 'newuser',
                email: 'new@example.com',
                tenantId: 'default-tenant',
                createdAt: new Date('2026-03-26'),
            };
            userService.create.mockResolvedValue(expectedResult);
            const result = await controller.create(createUserDto);
            expect(userService.create).toHaveBeenCalledWith(createUserDto);
            expect(result).toBe(expectedResult);
        });
    });
    describe('update', () => {
        it('should call userService.update with id and updateUserDto and return result', async () => {
            const userId = 'user-123';
            const updateUserDto = {
                username: 'updateduser',
                email: 'updated@example.com',
            };
            const expectedResult = {
                id: userId,
                username: 'updateduser',
                email: 'updated@example.com',
                tenantId: 'tenant-1',
                updatedAt: new Date('2026-03-26'),
            };
            userService.update.mockResolvedValue(expectedResult);
            const result = await controller.update(userId, updateUserDto);
            expect(userService.update).toHaveBeenCalledWith(userId, updateUserDto);
            expect(result).toBe(expectedResult);
        });
        it('should handle partial updateUserDto', async () => {
            const userId = 'user-123';
            const updateUserDto = {
                email: 'newemail@example.com',
            };
            const expectedResult = {
                id: userId,
                username: 'originaluser',
                email: 'newemail@example.com',
                tenantId: 'tenant-1',
                updatedAt: new Date('2026-03-26'),
            };
            userService.update.mockResolvedValue(expectedResult);
            const result = await controller.update(userId, updateUserDto);
            expect(userService.update).toHaveBeenCalledWith(userId, updateUserDto);
            expect(result).toBe(expectedResult);
        });
    });
    describe('delete', () => {
        it('should call userService.delete with id and return success message', async () => {
            const userId = 'user-123';
            userService.delete.mockResolvedValue(undefined);
            const result = await controller.delete(userId);
            expect(userService.delete).toHaveBeenCalledWith(userId);
            expect(result).toEqual({ message: '用户删除成功' });
        });
        it('should propagate errors from userService.delete', async () => {
            const userId = 'non-existent-id';
            const error = new Error('Delete failed');
            userService.delete.mockRejectedValue(error);
            await expect(controller.delete(userId)).rejects.toThrow(error);
            expect(userService.delete).toHaveBeenCalledWith(userId);
        });
    });
});
//# sourceMappingURL=user.controller.spec.js.map