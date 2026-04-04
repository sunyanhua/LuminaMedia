"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const tenant_repository_1 = require("./tenant.repository");
class UserRepository extends tenant_repository_1.TenantRepository {
    async findByEmail(email) {
        return this.createQueryBuilder('user')
            .where('user.email = :email', { email })
            .getOne();
    }
    async findActiveUsers() {
        return this.createQueryBuilder('user')
            .orderBy('user.createdAt', 'DESC')
            .getMany();
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map