"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBehaviorRepository = void 0;
const tenant_repository_1 = require("./tenant.repository");
class UserBehaviorRepository extends tenant_repository_1.TenantRepository {
    async findByUserAndDateRange(userId, startDate, endDate) {
        return this.createQueryBuilder('behavior')
            .where('behavior.userId = :userId', { userId })
            .andWhere('behavior.timestamp BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        })
            .orderBy('behavior.timestamp', 'ASC')
            .getMany();
    }
    async findUserSessions(userId, days = 30) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        const behaviors = await this.createQueryBuilder('behavior')
            .select('DISTINCT behavior.sessionId')
            .where('behavior.userId = :userId', { userId })
            .andWhere('behavior.timestamp >= :date', { date })
            .getRawMany();
        return behaviors.map((b) => b.sessionId);
    }
}
exports.UserBehaviorRepository = UserBehaviorRepository;
//# sourceMappingURL=user-behavior.repository.js.map