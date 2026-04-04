import { CustomerProfile } from './customer-profile.entity';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';
export declare class CustomerSegment implements TenantEntity {
    id: string;
    tenantId: string;
    customerProfileId: string;
    customerProfile: CustomerProfile;
    segmentName: string;
    description: string;
    criteria: Record<string, any>;
    memberCount: number;
    memberIds: string[];
    segmentInsights: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
