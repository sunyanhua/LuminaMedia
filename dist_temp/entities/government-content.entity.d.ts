export declare class GovernmentContent {
    id: number;
    title: string;
    content: string;
    category: string;
    publishDate: Date;
    author: string;
    status: 'draft' | 'published' | 'archived';
    tags: string[];
    sourceUrl?: string;
    tenantId: string;
    isPreset: boolean;
    demoScenario?: string;
    createdAt: Date;
    updatedAt: Date;
}
