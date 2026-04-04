import { User } from './user.entity';
import { PublishTask } from './publish-task.entity';
import { PlatformType } from '../modules/publish/interfaces/platform-adapter.interface';
import { AccountStatus } from '../shared/enums/account-status.enum';
export declare class SocialAccount {
    id: string;
    tenantId: string;
    userId: string;
    user: User;
    platform: PlatformType;
    accountName: string;
    platformUserId: string;
    platformUserName: string;
    avatarUrl: string;
    encryptedCredentials: string;
    credentialHash: string | null;
    config: Record<string, any>;
    quotaInfo: Record<string, any>;
    webhookUrl: string;
    isEnabled: boolean;
    lastTestedAt: Date;
    testResult: Record<string, any>;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    status: AccountStatus;
    lastUsedAt: Date;
    publishTasks: PublishTask[];
}
