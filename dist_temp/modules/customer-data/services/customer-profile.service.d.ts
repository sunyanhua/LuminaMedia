import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { DataImportJob } from '../../../entities/data-import-job.entity';
import { CustomerSegment } from '../../../entities/customer-segment.entity';
import { CustomerProfileRepository } from '../../../shared/repositories/customer-profile.repository';
import { DataImportJobRepository } from '../../../shared/repositories/data-import-job.repository';
import { CustomerSegmentRepository } from '../../../shared/repositories/customer-segment.repository';
import { CustomerType } from '../../../shared/enums/customer-type.enum';
import { Industry } from '../../../shared/enums/industry.enum';
export declare class CustomerProfileService {
    private customerProfileRepository;
    private dataImportJobRepository;
    private customerSegmentRepository;
    constructor(customerProfileRepository: CustomerProfileRepository, dataImportJobRepository: DataImportJobRepository, customerSegmentRepository: CustomerSegmentRepository);
    createProfile(userId: string, customerName: string, customerType: CustomerType, industry: Industry, dataSources?: Record<string, any>): Promise<CustomerProfile>;
    getProfile(id: string): Promise<CustomerProfile>;
    getProfilesByUser(userId: string): Promise<CustomerProfile[]>;
    updateProfile(id: string, updates: Partial<{
        customerName: string;
        customerType: CustomerType;
        industry: Industry;
        dataSources: Record<string, any>;
        profileData: Record<string, any>;
        behaviorInsights: Record<string, any>;
    }>): Promise<CustomerProfile>;
    deleteProfile(id: string): Promise<void>;
    generateMallCustomerDemo(userId: string): Promise<{
        profile: CustomerProfile;
        importJobs: DataImportJob[];
        segments: CustomerSegment[];
    }>;
    private generateMockImportJobs;
    private generateMockSegments;
    private generateMockProfileData;
    private generateMockBehaviorInsights;
    getProfileStats(profileId: string): Promise<Record<string, any>>;
}
