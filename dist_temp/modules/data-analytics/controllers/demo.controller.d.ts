import { DemoService } from '../services/demo.service';
import { GovernmentDemoService } from '../../government/services/government-demo.service';
export declare class DemoController {
    private readonly demoService;
    private readonly governmentDemoService;
    constructor(demoService: DemoService, governmentDemoService: GovernmentDemoService);
    quickStartDemo(userId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            demoId: string;
            customerProfile: {
                id: string;
                name: string;
                description: any;
            };
            segments: {
                id: string;
                segmentName: string;
                description: string;
                memberCount: number;
            }[];
            campaign: {
                id: string;
                name: string;
                budget: number;
                status: import("../../../shared/enums/campaign-status.enum").CampaignStatus;
            };
            strategies: {
                id: string;
                strategyType: import("../../../shared/enums/strategy-type.enum").StrategyType;
                confidenceScore: string;
                expectedROI: string;
            }[];
            contentGenerated: boolean;
            contentPlatforms: any;
        };
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
            details: any;
        };
        message?: undefined;
        data?: undefined;
        timestamp?: undefined;
    }>;
    getMallCustomerScenario(): Promise<{
        success: boolean;
        data: {
            name: string;
            description: string;
            steps: ({
                step: number;
                title: string;
                description: string;
                dataSource: string;
                analysisTypes?: undefined;
                segments?: undefined;
                budget?: undefined;
                duration?: undefined;
                target?: undefined;
                strategies?: undefined;
                platforms?: undefined;
                contentTypes?: undefined;
            } | {
                step: number;
                title: string;
                description: string;
                analysisTypes: string[];
                dataSource?: undefined;
                segments?: undefined;
                budget?: undefined;
                duration?: undefined;
                target?: undefined;
                strategies?: undefined;
                platforms?: undefined;
                contentTypes?: undefined;
            } | {
                step: number;
                title: string;
                description: string;
                segments: string[];
                dataSource?: undefined;
                analysisTypes?: undefined;
                budget?: undefined;
                duration?: undefined;
                target?: undefined;
                strategies?: undefined;
                platforms?: undefined;
                contentTypes?: undefined;
            } | {
                step: number;
                title: string;
                description: string;
                budget: number;
                duration: string;
                target: string;
                dataSource?: undefined;
                analysisTypes?: undefined;
                segments?: undefined;
                strategies?: undefined;
                platforms?: undefined;
                contentTypes?: undefined;
            } | {
                step: number;
                title: string;
                description: string;
                strategies: string[];
                dataSource?: undefined;
                analysisTypes?: undefined;
                segments?: undefined;
                budget?: undefined;
                duration?: undefined;
                target?: undefined;
                platforms?: undefined;
                contentTypes?: undefined;
            } | {
                step: number;
                title: string;
                description: string;
                platforms: string[];
                contentTypes: string[];
                dataSource?: undefined;
                analysisTypes?: undefined;
                segments?: undefined;
                budget?: undefined;
                duration?: undefined;
                target?: undefined;
                strategies?: undefined;
            })[];
            expectedOutcomes: string[];
            estimatedTime: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        data?: undefined;
    }>;
    resetDemoData(userId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            deleted: number;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        message?: undefined;
        data?: undefined;
    }>;
    getDemoStatus(): Promise<{
        success: boolean;
        data: {
            available: boolean;
            features: string[];
            requirements: string[];
        };
        error?: undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        data?: undefined;
    }>;
    executeDemoStep(stepNumber: string, stepData: any): Promise<{
        success: boolean;
        error: {
            code: string;
            message: string;
        };
        data?: undefined;
    } | {
        success: boolean;
        data: {
            step: number;
            description: string;
            completed: boolean;
            timestamp: string;
            stepData: any;
        };
        error?: undefined;
    }>;
    getDemoProgress(userId?: string): Promise<{
        success: boolean;
        data: {
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
        };
        error?: undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        data?: undefined;
    }>;
    getDemoResults(userId?: string): Promise<{
        success: boolean;
        data: {
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
        };
        error?: undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        data?: undefined;
    }>;
    validateDemoResults(userId?: string): Promise<{
        success: boolean;
        data: {
            valid: boolean;
            score: number;
            feedback: string[];
            improvements: string[];
            validationChecks: Array<{
                check: string;
                passed: boolean;
                details: string;
            }>;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        data?: undefined;
    }>;
    generateDemoReport(userId?: string): Promise<{
        success: boolean;
        data: {
            reportUrl: string;
            html: string;
            pdfUrl?: string;
            generatedAt: string;
            reportId: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        data?: undefined;
    }>;
    getDemoDataTypes(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        data?: undefined;
    }>;
    generateGovernmentDemoData(tenantId?: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        message?: undefined;
    }>;
    resetGovernmentDemoData(tenantId?: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        message?: undefined;
    }>;
}
