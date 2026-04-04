import { GovernmentContentService } from '../services/government-content.service';
import { ComplianceCheckService } from '../services/compliance-check.service';
import type { GovernmentContentRequest, GovernmentContentResponse } from '../interfaces/government-content.interface';
import { GovernmentContentType, GovernmentContentStyle, ComplianceLevel, GovernmentContentTemplate, GovernmentScenarioScript, GovernmentContentStats } from '../interfaces/government-content.interface';
export declare class GovernmentController {
    private readonly governmentContentService;
    private readonly complianceCheckService;
    constructor(governmentContentService: GovernmentContentService, complianceCheckService: ComplianceCheckService);
    generateContent(request: GovernmentContentRequest): Promise<GovernmentContentResponse>;
    checkCompliance(content: any): Promise<any>;
    batchCheckCompliance(contents: any[]): Promise<any[]>;
    getTemplates(): Promise<GovernmentContentTemplate[]>;
    getTemplate(templateId: string): Promise<GovernmentContentTemplate | null>;
    getScripts(): Promise<GovernmentScenarioScript[]>;
    getScript(scriptId: string): Promise<GovernmentScenarioScript | null>;
    executeScript(scriptId: string, speed?: string): Promise<{
        success: boolean;
        message: string;
        steps: Array<{
            step: number;
            name: string;
            result: any;
            duration: number;
        }>;
        totalDuration: number;
    }>;
    getStats(): Promise<GovernmentContentStats>;
    getContentTypes(): Promise<{
        types: Array<{
            value: GovernmentContentType;
            label: string;
            description: string;
        }>;
    }>;
    getContentStyles(): Promise<{
        styles: Array<{
            value: GovernmentContentStyle;
            label: string;
            description: string;
        }>;
    }>;
    getComplianceLevels(): Promise<{
        levels: Array<{
            value: ComplianceLevel;
            label: string;
            description: string;
        }>;
    }>;
    testGenerate(type?: GovernmentContentType): Promise<GovernmentContentResponse>;
}
