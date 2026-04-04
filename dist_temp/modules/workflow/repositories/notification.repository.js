"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const common_1 = require("@nestjs/common");
const tenant_repository_1 = require("../../../shared/repositories/tenant.repository");
const notification_entity_1 = require("../entities/notification.entity");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
const typeorm_1 = require("typeorm");
let NotificationRepository = class NotificationRepository extends tenant_repository_1.TenantRepository {
    dataSource;
    constructor(dataSource) {
        super(notification_entity_1.Notification, dataSource.createEntityManager(), dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }
    async findByRecipient(recipientId) {
        return this.createQueryBuilder('notification')
            .where('notification.recipient_id = :recipientId', { recipientId })
            .orderBy('notification.createdAt', 'DESC')
            .getMany();
    }
    async findUnreadByRecipient(recipientId) {
        return this.createQueryBuilder('notification')
            .where('notification.recipient_id = :recipientId', { recipientId })
            .andWhere('notification.status = :status', { status: 'PENDING' })
            .orderBy('notification.createdAt', 'DESC')
            .getMany();
    }
    async findByType(type) {
        return this.find({ where: { type } });
    }
    async findPendingNotifications() {
        return this.createQueryBuilder('notification')
            .where('notification.status = :status', { status: 'PENDING' })
            .orderBy('notification.priority', 'DESC')
            .addOrderBy('notification.createdAt', 'ASC')
            .getMany();
    }
    async findFailedNotifications() {
        return this.createQueryBuilder('notification')
            .where('notification.status = :status', { status: 'FAILED' })
            .orderBy('notification.createdAt', 'DESC')
            .getMany();
    }
    async markAsSent(notificationId) {
        await this.updateById(notificationId, {
            status: 'SENT',
            sentAt: new Date(),
        });
    }
    async markAsRead(notificationId) {
        await this.updateById(notificationId, {
            status: 'READ',
            readAt: new Date(),
        });
    }
    async markAsActioned(notificationId) {
        await this.updateById(notificationId, {
            status: 'ACTIONED',
            actionedAt: new Date(),
        });
    }
    async markAsFailed(notificationId, reason) {
        await this.updateById(notificationId, {
            status: 'FAILED',
            failureReason: reason,
            retryCount: () => 'retry_count + 1',
        });
    }
    async createNotification(data) {
        const notification = this.create({
            ...data,
            channels: data.channels || ['in_app'],
            priority: data.priority || 3,
            isSilent: data.isSilent || false,
            metadata: data.metadata || {},
        });
        return this.save(notification);
    }
    async deleteOldNotifications(daysToKeep = 30) {
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
        const result = await this.createQueryBuilder()
            .delete()
            .where('created_at < :cutoffDate', { cutoffDate })
            .execute();
        return result.affected || 0;
    }
    async getRecipientStats(recipientId) {
        const allNotifications = await this.findByRecipient(recipientId);
        const unreadNotifications = await this.findUnreadByRecipient(recipientId);
        const byType = {};
        Object.values(workflow_status_enum_1.NotificationType).forEach((type) => {
            byType[type] = 0;
        });
        allNotifications.forEach((notification) => {
            byType[notification.type] = (byType[notification.type] || 0) + 1;
        });
        return {
            total: allNotifications.length,
            unread: unreadNotifications.length,
            byType,
        };
    }
    async findRetryNotifications() {
        return this.createQueryBuilder('notification')
            .where('notification.status = :status', { status: 'FAILED' })
            .andWhere('notification.retry_count < notification.max_retries')
            .andWhere('notification.next_send_at <= :now', { now: new Date() })
            .getMany();
    }
};
exports.NotificationRepository = NotificationRepository;
exports.NotificationRepository = NotificationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], NotificationRepository);
//# sourceMappingURL=notification.repository.js.map