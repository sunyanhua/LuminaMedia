import { ContentDraft } from './content-draft.entity';
import { SocialAccount } from './social-account.entity';
import { TaskStatus } from '../shared/enums/task-status.enum';
export declare class PublishTask {
    id: string;
    tenantId: string;
    draftId: string;
    draft: Promise<ContentDraft>;
    accountId: string;
    account: SocialAccount;
    status: TaskStatus;
    scheduledAt: Date;
    publishedAt: Date;
    postUrl: string;
    errorMessage: string;
}
