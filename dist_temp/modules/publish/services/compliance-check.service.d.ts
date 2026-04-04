import { GovernmentContent, ComplianceCheckResult } from '../interfaces/government-content.interface';
export declare class ComplianceCheckService {
    private readonly logger;
    private readonly forbiddenTerms;
    private readonly governmentAuthoritySuffixes;
    private readonly requiredElements;
    checkCompliance(content: GovernmentContent): Promise<ComplianceCheckResult>;
    private checkGeneralCompliance;
    private checkOfficialDocumentCompliance;
    private checkAntiFraudCompliance;
    private checkPolicyInterpretationCompliance;
    private findSensitiveWords;
    private checkPoliticalCorrectness;
    private checkLegalCompliance;
    private checkDataAuthenticity;
    private checkMissingRequiredElements;
    private checkFormatCompliance;
    private checkLanguageStandardization;
    private validateGovernmentAuthority;
    private validateDocumentNumber;
    private validateDocumentTitle;
    private checkOfficialTerminology;
    private checkAccessibleLanguage;
    private checkWarningEffectiveness;
    private checkInterpretationAccuracy;
    private getPlatformSpecificSuggestions;
    batchCheckCompliance(contents: GovernmentContent[]): Promise<ComplianceCheckResult[]>;
    getComplianceStats(contents: GovernmentContent[]): Promise<{
        total: number;
        passed: number;
        failed: number;
        averageScore: number;
        typeBreakdown: Record<string, {
            total: number;
            passed: number;
            averageScore: number;
        }>;
    }>;
}
