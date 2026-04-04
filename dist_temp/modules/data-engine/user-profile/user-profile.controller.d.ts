import { UserProfileService, UserProfile4D } from './user-profile.service';
export declare class UserProfileController {
    private readonly userProfileService;
    constructor(userProfileService: UserProfileService);
    getUserProfile(customerId: string): Promise<UserProfile4D>;
    getBatchUserProfiles(body: {
        customerIds: string[];
    }): Promise<Record<string, UserProfile4D>>;
    filterCustomersByProfile(filters: Partial<UserProfile4D>): Promise<{
        customerIds: string[];
    }>;
    getProfileSummary(customerIds?: string): Promise<{
        basicLifecycle: Record<string, number>;
        consumptionPersonality: Record<string, number>;
        realtimeStatus: Record<string, number>;
        socialActivity: Record<string, number>;
        totalCustomers: number;
    }>;
    getBasicLifecycleDistribution(): Promise<Record<string, number>>;
    getConsumptionPersonalityDistribution(): Promise<Record<string, number>>;
    getRealtimeStatusDistribution(): Promise<Record<string, number>>;
    getSocialActivityDistribution(): Promise<Record<string, number>>;
    compareProfiles(body: {
        customerIds: string[];
        dimensions?: string[];
    }): Promise<{
        similarities: Record<string, number>;
        differences: Record<string, any>;
        recommendations: string[];
    }>;
}
