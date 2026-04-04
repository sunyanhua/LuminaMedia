"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerProfileRepository = void 0;
const tenant_repository_1 = require("./tenant.repository");
class CustomerProfileRepository extends tenant_repository_1.TenantRepository {
    async findByCustomerName(name) {
        return this.createQueryBuilder('profile')
            .where('profile.customerName LIKE :name', { name: `%${name}%` })
            .getMany();
    }
}
exports.CustomerProfileRepository = CustomerProfileRepository;
//# sourceMappingURL=customer-profile.repository.js.map