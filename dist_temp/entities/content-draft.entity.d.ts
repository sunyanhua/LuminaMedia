import { User } from './user.entity';
import { PublishTask } from './publish-task.entity';
import { Platform } from '../shared/enums/platform.enum';
import { GenerationMethod } from '../shared/enums/generation-method.enum';
export declare class ContentDraft {
    id: string;
    tenantId: string;
    userId: string;
    user: Promise<User>;
    platformType: Platform;
    title: string;
    content: string;
    mediaUrls: string[];
    tags: string[];
    generatedBy: GenerationMethod;
    qualityScore: number;
    aiGeneratedContent: Record<string, any>;
    isPreset: boolean;
    demoScenario?: string;
    createdAt: Date;
    updatedAt: Date;
    publishTasks: Promise<PublishTask[]>;
}
