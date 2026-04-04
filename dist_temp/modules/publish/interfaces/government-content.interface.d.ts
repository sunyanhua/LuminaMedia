export declare enum GovernmentContentType {
    OFFICIAL_DOCUMENT = "official_document",
    ANTI_FRAUD = "anti_fraud",
    POLICY_INTERPRETATION = "policy_interpretation",
    GOVERNMENT_SERVICE = "government_service",
    PUBLIC_ANNOUNCEMENT = "public_announcement",
    EMERGENCY_RESPONSE = "emergency_response"
}
export declare enum GovernmentContentStyle {
    FORMAL = "formal",
    SERIOUS = "serious",
    AUTHORITATIVE = "authoritative",
    INSTRUCTIVE = "instructive",
    FRIENDLY = "friendly"
}
export declare enum ComplianceLevel {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export interface DocumentHeader {
    issuingAuthority: string;
    documentNumber?: string;
    issuer?: string;
    securityLevel?: '公开' | '内部公开' | '秘密' | '机密' | '绝密';
    urgencyLevel?: '平件' | '急件' | '特急';
    title: string;
    mainRecipient?: string;
    copyRecipient?: string;
    issueDate: string;
}
export interface DocumentBody {
    preface?: string;
    sections: DocumentSection[];
    conclusion?: string;
}
export interface DocumentSection {
    title: string;
    content: string;
    subsections?: DocumentSection[];
}
export interface DocumentFooter {
    contactPerson?: string;
    contactInfo?: string;
    attachments?: string[];
    printingAuthority?: string;
    printingDate?: string;
    copies?: number;
}
export interface OfficialDocument {
    type: GovernmentContentType.OFFICIAL_DOCUMENT;
    header: DocumentHeader;
    body: DocumentBody;
    footer?: DocumentFooter;
    style: GovernmentContentStyle.FORMAL;
    complianceLevel: ComplianceLevel.HIGH;
}
export interface AntiFraudContent {
    type: GovernmentContentType.ANTI_FRAUD;
    title: string;
    fraudType: string;
    recentCase: string;
    fraudMethods: string[];
    identificationPoints: string[];
    preventionMeasures: string[];
    emergencyResponse: string[];
    reportingChannels: string[];
    style: GovernmentContentStyle.SERIOUS;
    complianceLevel: ComplianceLevel.MEDIUM;
    visualStyle?: '红头文件样式' | '警示标志' | '图文并茂';
}
export interface PolicyInterpretationContent {
    type: GovernmentContentType.POLICY_INTERPRETATION;
    policyName: string;
    issuingAuthority: string;
    documentNumber?: string;
    issueDate: string;
    background: string;
    keyPoints: PolicyKeyPoint[];
    applicableScope: string;
    operationGuide: string[];
    faqs: FAQ[];
    consultationMethods: string[];
    style: GovernmentContentStyle.AUTHORITATIVE;
    complianceLevel: ComplianceLevel.HIGH;
}
export interface PolicyKeyPoint {
    title: string;
    content: string;
    relatedClauses?: string[];
    implementationTime?: string;
}
export interface FAQ {
    question: string;
    answer: string;
    reference?: string;
}
export interface GovernmentServiceContent {
    type: GovernmentContentType.GOVERNMENT_SERVICE;
    serviceName: string;
    responsibleDepartment: string;
    targetAudience: string;
    eligibility: string[];
    requiredDocuments: string[];
    procedures: ProcedureStep[];
    processingTime: string;
    feeStandard?: string;
    locations: ServiceLocation[];
    onlineUrl?: string;
    contactPhone?: string;
    style: GovernmentContentStyle.INSTRUCTIVE;
    complianceLevel: ComplianceLevel.MEDIUM;
}
export interface ProcedureStep {
    step: number;
    name: string;
    description: string;
    method: 'online' | 'offline';
    estimatedTime?: string;
}
export interface ServiceLocation {
    name: string;
    address: string;
    officeHours?: string;
    phone?: string;
}
export interface PublicAnnouncementContent {
    type: GovernmentContentType.PUBLIC_ANNOUNCEMENT;
    title: string;
    issuingUnit: string;
    announcementTime: string;
    content: string;
    affectedAreas?: string[];
    effectiveTime?: string;
    deadline?: string;
    precautions?: string[];
    contactInfo?: string;
    style: GovernmentContentStyle.FRIENDLY;
    complianceLevel: ComplianceLevel.LOW;
}
export interface EmergencyResponseContent {
    type: GovernmentContentType.EMERGENCY_RESPONSE;
    eventType: '自然灾害' | '事故灾难' | '公共卫生' | '社会安全';
    eventLevel: '一般' | '较大' | '重大' | '特别重大';
    title: string;
    issuingUnit: string;
    issueTime: string;
    eventOverview: string;
    affectedAreas: string[];
    responseMeasures: string[];
    shelters?: ShelterInfo[];
    rescueResources?: RescueResource[];
    emergencyContacts: EmergencyContact[];
    style: GovernmentContentStyle.SERIOUS;
    complianceLevel: ComplianceLevel.HIGH;
}
export interface ShelterInfo {
    name: string;
    address: string;
    capacity?: number;
    currentOccupancy?: number;
    contactPhone?: string;
}
export interface RescueResource {
    type: string;
    quantity: number;
    location: string;
    personInCharge?: string;
    contactPhone?: string;
}
export interface EmergencyContact {
    department: string;
    phone: string;
    contactPerson?: string;
    responsibility?: string;
}
export type GovernmentContent = OfficialDocument | AntiFraudContent | PolicyInterpretationContent | GovernmentServiceContent | PublicAnnouncementContent | EmergencyResponseContent;
export interface GovernmentContentRequest {
    contentType: GovernmentContentType;
    theme: string;
    targetAudience?: string;
    style?: GovernmentContentStyle;
    complianceLevel?: ComplianceLevel;
    length?: 'short' | 'medium' | 'long';
    params?: Record<string, any>;
    tenantId?: string;
    userId?: string;
}
export interface GovernmentContentResponse {
    success: boolean;
    content?: GovernmentContent;
    error?: string;
    generationTime?: number;
    complianceCheck?: ComplianceCheckResult;
    suggestedPlatforms?: string[];
    summary?: string;
}
export interface ComplianceCheckResult {
    passed: boolean;
    score: number;
    items: ComplianceCheckItem[];
    warnings: string[];
    requiredFixes: string[];
    suggestions: string[];
}
export interface ComplianceCheckItem {
    name: string;
    description: string;
    passed: boolean;
    details?: string;
    severity: 'high' | 'medium' | 'low';
}
export interface GovernmentContentTemplate {
    id: string;
    name: string;
    description: string;
    contentType: GovernmentContentType;
    structure: Record<string, any>;
    example: any;
    fieldDescriptions: Record<string, string>;
    styleSuggestions: string[];
    compliancePoints: string[];
    applicableScenarios: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface GovernmentScenarioScript {
    id: string;
    name: string;
    description: string;
    scenarioType: GovernmentContentType;
    targetAudience: string;
    duration: number;
    steps: ScenarioStep[];
    requiredData: string[];
    expectedOutcomes: string[];
    precautions: string[];
    createdAt: Date;
}
export interface ScenarioStep {
    step: number;
    name: string;
    description: string;
    action: string;
    params?: Record<string, any>;
    expectedResult: string;
    demonstrationPoints: string[];
    timeAllocation?: number;
    dependencies?: number[];
}
export interface GovernmentContentStats {
    totalGenerations: number;
    typeBreakdown: Record<GovernmentContentType, number>;
    successRate: number;
    averageGenerationTime: number;
    compliancePassRate: number;
    mostUsedTemplates: string[];
    usageTrend: {
        date: string;
        count: number;
    }[];
}
