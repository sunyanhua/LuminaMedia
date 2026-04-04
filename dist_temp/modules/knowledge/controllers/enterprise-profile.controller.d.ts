import { EnterpriseProfileAnalysisService } from '../services/enterprise-profile-analysis.service';
import { EnterpriseProfile } from '../../../entities/enterprise-profile.entity';
export declare class EnterpriseProfileController {
    private readonly enterpriseProfileAnalysisService;
    constructor(enterpriseProfileAnalysisService: EnterpriseProfileAnalysisService);
    createAnalysisTask(customerProfileId: string): Promise<EnterpriseProfile>;
    getProfile(id: string): Promise<EnterpriseProfile>;
    getProfilesByCustomer(customerProfileId: string): Promise<EnterpriseProfile[]>;
    getCurrentProfile(customerProfileId: string): Promise<EnterpriseProfile | null>;
    reanalyzeProfile(id: string): Promise<EnterpriseProfile>;
    getAnalysisStatus(id: string): Promise<{
        status: string;
        progress: number;
        estimatedTime?: number;
        errorMessage?: string;
    }>;
    batchAnalyzeProfiles(customerProfileIds: string[]): Promise<EnterpriseProfile[]>;
    deleteProfile(id: string): Promise<void>;
    getIndustryStats(): Promise<Array<{
        industry: string;
        count: number;
    }>>;
    getAnalysisStatusStats(): Promise<Array<{
        status: string;
        count: number;
        avgProgress: number;
    }>>;
    findSimilarProfiles(id: string, limit?: number): Promise<EnterpriseProfile[]>;
}
