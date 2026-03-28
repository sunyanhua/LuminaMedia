import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileService } from './user-profile.service';
import { CustomerProfile } from '../../../entities/customer-profile.entity';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let customerProfileRepository: Repository<CustomerProfile>;

  const mockCustomerProfileRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileService,
        {
          provide: getRepositoryToken(CustomerProfile),
          useValue: mockCustomerProfileRepository,
        },
      ],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
    customerProfileRepository = module.get<Repository<CustomerProfile>>(
      getRepositoryToken(CustomerProfile),
    );

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

      mockCustomerProfileRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const filters = {
        basicLifecycle: {
          ageGroup: '26-35',
        },
      };

      const result = await service.filterCustomersByProfile(filters);

      expect(
        mockCustomerProfileRepository.createQueryBuilder,
      ).toHaveBeenCalledWith('cp');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('cp.id');
      expect(result).toEqual(['cust1', 'cust2']);
    });
  });
});
