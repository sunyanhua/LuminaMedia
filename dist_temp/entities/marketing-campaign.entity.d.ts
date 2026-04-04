export declare class MarketingCampaign {
    id: number;
    name: string;
    description?: string;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
    startDate?: Date;
    endDate?: Date;
    objectives?: any;
    budget?: any;
    tenantId: string;
    isPreset: boolean;
    demoScenario?: string;
    createdAt: Date;
    updatedAt: Date;
}
