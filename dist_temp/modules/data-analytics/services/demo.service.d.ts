import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { CustomerSegment } from '../../../entities/customer-segment.entity';
import { MarketingCampaign } from '../entities/marketing-campaign.entity';
import { MarketingStrategy } from '../entities/marketing-strategy.entity';
import { CustomerProfileRepository } from '../../../shared/repositories/customer-profile.repository';
import { CustomerSegmentRepository } from '../../../shared/repositories/customer-segment.repository';
import { DataImportJobRepository } from '../../../shared/repositories/data-import-job.repository';
import { MarketingCampaignRepository } from '../../../shared/repositories/marketing-campaign.repository';
import { MarketingStrategyRepository } from '../../../shared/repositories/marketing-strategy.repository';
import { UserBehaviorRepository } from '../../../shared/repositories/user-behavior.repository';
import { ContentGenerationService } from './content-generation.service';
import { MarketingStrategyService } from './marketing-strategy.service';
import { TenantContextService } from '../../../shared/services/tenant-context.service';
export declare class DemoService {
    private customerProfileRepository;
    private customerSegmentRepository;
    private dataImportJobRepository;
    private readonly marketingCampaignRepository;
    private readonly marketingStrategyRepository;
    private userBehaviorRepository;
    private readonly contentGenerationService;
    private readonly marketingStrategyService;
    private readonly tenantContextService;
    private readonly logger;
    constructor(customerProfileRepository: CustomerProfileRepository, customerSegmentRepository: CustomerSegmentRepository, dataImportJobRepository: DataImportJobRepository, marketingCampaignRepository: MarketingCampaignRepository, marketingStrategyRepository: MarketingStrategyRepository, userBehaviorRepository: UserBehaviorRepository, contentGenerationService: ContentGenerationService, marketingStrategyService: MarketingStrategyService, tenantContextService: TenantContextService);
    createMallCustomerDemo(userId?: string): Promise<{
        customerProfile: CustomerProfile;
        segments: CustomerSegment[];
        campaign: MarketingCampaign;
        strategies: MarketingStrategy[];
        contentGenerationResult?: any;
    }>;
    private createDemoCustomerProfile;
    private createDemoSegments;
    private createDemoCampaign;
    private generateDemoStrategies;
    private createFallbackStrategy;
    private generateDemoContent;
    getDemoStatus(): {
        available: boolean;
        features: string[];
        requirements: string[];
    };
    resetDemoData(userId?: string): Promise<{
        deleted: number;
    }>;
    getDemoProgress(userId?: string): Promise<{
        completedScenarios: number;
        totalScenarios: number;
        currentScenario?: string;
        progressPercentage: number;
        completedSteps: number;
        totalSteps: number;
        stepProgress: Array<{
            step: number;
            name: string;
            completed: boolean;
            timestamp?: string;
        }>;
        recentActivity: Array<{
            action: string;
            timestamp: string;
            details: string;
        }>;
    }>;
    getDemoResults(userId?: string): Promise<{
        customerProfile?: any;
        segments?: any[];
        campaign?: any;
        strategies?: any[];
        contentGeneration?: any;
        summary: {
            totalDataPoints: number;
            analysisCompleted: boolean;
            strategiesGenerated: number;
            contentGenerated: boolean;
            overallScore: number;
        };
    }>;
    validateDemoResults(userId?: string): Promise<{
        valid: boolean;
        score: number;
        feedback: string[];
        improvements: string[];
        validationChecks: Array<{
            check: string;
            passed: boolean;
            details: string;
        }>;
    }>;
    generateDemoReport(userId?: string): Promise<{
        reportUrl: string;
        html: string;
        pdfUrl?: string;
        generatedAt: string;
        reportId: string;
    }>;
    private generateHtmlReport;
    executeDemoStep(step: number, userId?: string, stepData?: any): Promise<{
        success: boolean;
        step: number;
        stepName: string;
        result?: any;
        message: string;
        nextStep?: number;
        completed: boolean;
    }>;
}
