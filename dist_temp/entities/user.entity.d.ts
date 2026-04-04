import { SocialAccount } from './social-account.entity';
import { ContentDraft } from './content-draft.entity';
import { UserRole } from './user-role.entity';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';
export declare class User implements TenantEntity {
    id: string;
    username: string;
    passwordHash: string;
    email: string;
    createdAt: Date;
    tenantId: string;
    socialAccounts: SocialAccount[];
    contentDrafts: Promise<ContentDraft[]>;
    userRoles: UserRole[];
}
