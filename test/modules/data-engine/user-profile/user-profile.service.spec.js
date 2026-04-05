"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const user_profile_service_1 = require("./user-profile.service");
const customer_profile_entity_1 = require("../../../entities/customer-profile.entity");
describe('UserProfileService', () => {
    let service;
    let customerProfileRepository;
    const mockCustomerProfileRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
        createQueryBuilder: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                user_profile_service_1.UserProfileService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(customer_profile_entity_1.CustomerProfile),
                    useValue: mockCustomerProfileRepository,
                },
            ],
        }).compile();
        service = module.get(user_profile_service_1.UserProfileService);
        customerProfileRepository = module.get((0, typeorm_1.getRepositoryToken)(customer_profile_entity_1.CustomerProfile));
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('getUserProfile', () => {
        it('should return user profile for existing customer', async () => {
            const customerId = 'test-customer-id';
            const mockProfile = {
                id: customerId,
                profileData: {
                    tags: {
                        age_group: { value: '26-35' },
                        education: { value: 'bachelor' },
                        consumption_level: { value: 'medium' },
                    },
                },
            };
            mockCustomerProfileRepository.findOne.mockResolvedValue(mockProfile);
            const result = await service.getUserProfile(customerId);
            expect(mockCustomerProfileRepository.findOne).toHaveBeenCalledWith({
                where: { id: customerId },
            });
            expect(result).toBeDefined();
            expect(result.basicLifecycle.ageGroup).toBe('26-35');
            expect(result.basicLifecycle.education).toBe('bachelor');
            expect(result.consumptionPersonality.consumptionLevel).toBe('medium');
        });
        it('should throw NotFoundException for non-existing customer', async () => {
            const customerId = 'non-existing-id';
            mockCustomerProfileRepository.findOne.mockResolvedValue(null);
            await expect(service.getUserProfile(customerId)).rejects.toThrow();
            expect(mockCustomerProfileRepository.findOne).toHaveBeenCalledWith({
                where: { id: customerId },
            });
        });
    });
    describe('filterCustomersByProfile', () => {
        it('should return empty array when no filters provided', async () => {
            const result = await service.filterCustomersByProfile({});
            expect(result).toEqual([]);
        });
        it('should build query conditions for valid filters', async () => {
            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getMany: jest
                    .fn()
                    .mockResolvedValue([{ id: 'cust1' }, { id: 'cust2' }]),
            };
            mockCustomerProfileRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            const filters = {
                basicLifecycle: {
                    ageGroup: '26-35',
                },
            };
            const result = await service.filterCustomersByProfile(filters);
            expect(mockCustomerProfileRepository.createQueryBuilder).toHaveBeenCalledWith('cp');
            expect(mockQueryBuilder.where).toHaveBeenCalled();
            expect(mockQueryBuilder.select).toHaveBeenCalledWith('cp.id');
            expect(result).toEqual(['cust1', 'cust2']);
        });
    });
});
//# sourceMappingURL=user-profile.service.spec.js.map