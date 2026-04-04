import { TenantRepository } from './tenant.repository';
import { CustomerProfile } from '../../entities/customer-profile.entity';
export declare class CustomerProfileRepository extends TenantRepository<CustomerProfile> {
    findByCustomerName(name: string): Promise<CustomerProfile[]>;
}
