export declare class SocialInteraction {
    id: number;
    platform: string;
    interactionType: string;
    targetId: string;
    targetUrl: string;
    content?: string;
    sourceUser: string;
    timestamp: Date;
    sentiment: 'positive' | 'negative' | 'neutral';
    engagementCount: number;
    tenantId: string;
    isPreset: boolean;
    demoScenario?: string;
    createdAt: Date;
    updatedAt: Date;
}
