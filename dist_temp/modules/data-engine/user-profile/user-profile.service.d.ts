import { Repository } from 'typeorm';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
export interface UserProfile4D {
    basicLifecycle: {
        ageGroup?: '18-25' | '26-35' | '36-45' | '46+';
        education?: 'high_school' | 'bachelor' | 'master' | 'phd';
        familyRole?: 'single' | 'married_no_kids' | 'married_with_kids';
        potentialValue?: 'low' | 'medium' | 'high';
    };
    consumptionPersonality: {
        consumptionLevel?: 'low' | 'medium' | 'high' | 'premium';
        shoppingWidth?: 'narrow' | 'medium' | 'wide';
        decisionSpeed?: 'fast' | 'medium' | 'slow';
    };
    realtimeStatus: {
        activityLevel?: number;
        growthTrend?: 'declining' | 'stable' | 'growing' | 'fast_growing';
        engagementScore?: number;
    };
    socialActivity: {
        fissionPotential?: 'low' | 'medium' | 'high';
        activityPreference?: string[];
        socialInfluence?: number;
    };
}
export declare class UserProfileService {
    private readonly customerProfileRepository;
    private readonly logger;
    constructor(customerProfileRepository: Repository<CustomerProfile>);
    private readonly tagMapping;
    getUserProfile(customerId: string): Promise<UserProfile4D>;
    getBatchUserProfiles(customerIds: string[]): Promise<Record<string, UserProfile4D>>;
    filterCustomersByProfile(filters: Partial<UserProfile4D>): Promise<string[]>;
    getProfileSummary(customerIds?: string[]): Promise<{
        basicLifecycle: Record<string, number>;
        consumptionPersonality: Record<string, number>;
        realtimeStatus: Record<string, number>;
        socialActivity: Record<string, number>;
        totalCustomers: number;
    }>;
    private extractTagsFromProfileData;
    private buildUserProfile4D;
    private mergeProfileData;
    private transformValueForField;
    private normalizeActivityLevel;
    private normalizeEngagementScore;
    private normalizeSocialInfluence;
    private parseActivityPreference;
    private buildProfileConditions;
}
