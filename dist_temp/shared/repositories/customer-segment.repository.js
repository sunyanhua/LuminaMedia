"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSegmentRepository = void 0;
const tenant_repository_1 = require("./tenant.repository");
class CustomerSegmentRepository extends tenant_repository_1.TenantRepository {
    async findByCustomerProfile(customerProfileId) {
        return this.createQueryBuilder('segment')
            .where('segment.customerProfileId = :customerProfileId', {
            customerProfileId,
        })
            .orderBy('segment.createdAt', 'DESC')
            .getMany();
    }
    async findLargeSegments(minMemberCount = 1000) {
        return this.createQueryBuilder('segment')
            .where('segment.memberCount >= :minMemberCount', { minMemberCount })
            .orderBy('segment.memberCount', 'DESC')
            .getMany();
    }
    async findSegmentsByCriteria(criteria) {
        const query = this.createQueryBuilder('segment');
        if (criteria.segmentName) {
            query.andWhere('segment.segmentName LIKE :name', {
                name: `%${criteria.segmentName}%`,
            });
        }
        if (criteria.minMemberCount) {
            query.andWhere('segment.memberCount >= :minMemberCount', {
                minMemberCount: criteria.minMemberCount,
            });
        }
        return query.getMany();
    }
    async getSegmentStats(customerProfileId) {
        const segments = await this.findByCustomerProfile(customerProfileId);
        if (segments.length === 0) {
            return {
                totalSegments: 0,
                totalMembers: 0,
                avgMembersPerSegment: 0,
                largestSegment: null,
            };
        }
        const totalMembers = segments.reduce((sum, segment) => sum + segment.memberCount, 0);
        const avgMembersPerSegment = totalMembers / segments.length;
        const largestSegment = segments.reduce((largest, segment) => segment.memberCount > largest.memberCount ? segment : largest, segments[0]);
        return {
            totalSegments: segments.length,
            totalMembers,
            avgMembersPerSegment,
            largestSegment: {
                name: largestSegment.segmentName,
                count: largestSegment.memberCount,
            },
        };
    }
}
exports.CustomerSegmentRepository = CustomerSegmentRepository;
//# sourceMappingURL=customer-segment.repository.js.map