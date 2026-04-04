import { TenantRepository } from './tenant.repository';
import { EnterpriseProfile } from '../../entities/enterprise-profile.entity';
export declare class EnterpriseProfileRepository extends TenantRepository<EnterpriseProfile> {
    findByCustomerProfileId(customerProfileId: string): Promise<EnterpriseProfile[]>;
    findCurrentByCustomerProfileId(customerProfileId: string): Promise<EnterpriseProfile | null>;
    findByIndustry(industry: string): Promise<EnterpriseProfile[]>;
    findSimilarProfiles(featureVector: number[], limit?: number, excludeProfileId?: string): Promise<EnterpriseProfile[]>;
    getVersionHistory(customerProfileId: string): Promise<EnterpriseProfile[]>;
    updateVersionStatus(customerProfileId: string, newCurrentVersionId: string): Promise<void>;
    getIndustryStats(): Promise<Array<{
        industry: string;
        count: number;
    }>>;
    getAnalysisStatusStats(): Promise<Array<{
        status: string;
        count: number;
        avgProgress: number;
    }>>;
}
