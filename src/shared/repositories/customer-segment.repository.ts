import { TenantRepository } from './tenant.repository';
import { CustomerSegment } from '../../entities/customer-segment.entity';

/**
 * CustomerSegment实体的租户感知Repository
 */
export class CustomerSegmentRepository extends TenantRepository<CustomerSegment> {
  // 可以添加客户分群特定的查询方法
  async findByCustomerProfile(
    customerProfileId: string,
  ): Promise<CustomerSegment[]> {
    return this.createQueryBuilder('segment')
      .where('segment.customerProfileId = :customerProfileId', {
        customerProfileId,
      })
      .orderBy('segment.createdAt', 'DESC')
      .getMany();
  }

  async findLargeSegments(
    minMemberCount: number = 1000,
  ): Promise<CustomerSegment[]> {
    return this.createQueryBuilder('segment')
      .where('segment.memberCount >= :minMemberCount', { minMemberCount })
      .orderBy('segment.memberCount', 'DESC')
      .getMany();
  }

  async findSegmentsByCriteria(
    criteria: Record<string, any>,
  ): Promise<CustomerSegment[]> {
    const query = this.createQueryBuilder('segment');

    // 简单的JSON字段搜索 - 实际实现可能需要更复杂的JSON查询
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

  async getSegmentStats(customerProfileId: string): Promise<{
    totalSegments: number;
    totalMembers: number;
    avgMembersPerSegment: number;
    largestSegment: { name: string; count: number } | null;
  }> {
    const segments = await this.findByCustomerProfile(customerProfileId);

    if (segments.length === 0) {
      return {
        totalSegments: 0,
        totalMembers: 0,
        avgMembersPerSegment: 0,
        largestSegment: null,
      };
    }

    const totalMembers = segments.reduce(
      (sum, segment) => sum + segment.memberCount,
      0,
    );
    const avgMembersPerSegment = totalMembers / segments.length;
    const largestSegment = segments.reduce(
      (largest, segment) =>
        segment.memberCount > largest.memberCount ? segment : largest,
      segments[0],
    );

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
