export declare class MarketingStrategy {
    id: number;
    name: string;
    description?: string;
    type: 'content-marketing' | 'social-media' | 'email-marketing' | 'seo' | 'paid-advertising' | 'influencer';
    targetAudience?: any;
    channels?: any[];
    tactics?: any[];
    status: 'draft' | 'active' | 'completed' | 'archived';
    tenantId: string;
    isPreset: boolean;
    demoScenario?: string;
    createdAt: Date;
    updatedAt: Date;
}
