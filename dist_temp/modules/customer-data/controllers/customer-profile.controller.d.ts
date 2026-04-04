import { CustomerProfileService } from '../services/customer-profile.service';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { CreateCustomerProfileDto } from '../dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
export declare class CustomerProfileController {
    private readonly customerProfileService;
    constructor(customerProfileService: CustomerProfileService);
    createProfile(createDto: CreateCustomerProfileDto): Promise<CustomerProfile>;
    getProfile(id: string): Promise<CustomerProfile>;
    getProfilesByUser(userId: string): Promise<CustomerProfile[]>;
    updateProfile(id: string, updateDto: UpdateCustomerProfileDto): Promise<CustomerProfile>;
    deleteProfile(id: string): Promise<void>;
    generateMallCustomerDemo(id: string): Promise<{
        profile: CustomerProfile;
        importJobs: any[];
        segments: any[];
    }>;
    getProfileStats(id: string): Promise<Record<string, any>>;
    getIndustries(): {
        value: string;
        label: string;
    }[];
    getCustomerTypes(): {
        value: string;
        label: string;
    }[];
    private getIndustryLabel;
    private getCustomerTypeLabel;
}
