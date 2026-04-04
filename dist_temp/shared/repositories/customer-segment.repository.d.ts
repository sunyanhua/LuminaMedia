import { TenantRepository } from './tenant.repository';
import { CustomerSegment } from '../../entities/customer-segment.entity';
export declare class CustomerSegmentRepository extends TenantRepository<CustomerSegment> {
    findByCustomerProfile(customerProfileId: string): Promise<CustomerSegment[]>;
    findLargeSegments(minMemberCount?: number): Promise<CustomerSegment[]>;
    findSegmentsByCriteria(criteria: Record<string, any>): Promise<CustomerSegment[]>;
    getSegmentStats(customerProfileId: string): Promise<{
        totalSegments: number;
        totalMembers: number;
        avgMembersPerSegment: number;
        largestSegment: {
            name: string;
            count: number;
        } | null;
    }>;
}
