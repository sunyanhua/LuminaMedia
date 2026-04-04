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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const notification_repository_1 = require("../repositories/notification.repository");
const event_emitter_1 = require("@nestjs/event-emitter");
const workflow_interface_1 = require("../interfaces/workflow.interface");
let NotificationService = NotificationService_1 = class NotificationService {
    notificationRepository;
    eventEmitter;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(notificationRepository, eventEmitter) {
        this.notificationRepository = notificationRepository;
        this.eventEmitter = eventEmitter;
    }
    async sendNotification(notification) {
        try {
            this.logger.debug(`Sending notification: ${notification.id} via channels: ${notification.channels.join(', ')}`);
            for (const channel of notification.channels) {
                switch (channel) {
                    case 'in_app':
                        await this.sendInAppNotification(notification);
                        break;
                    case 'email':
                        await this.sendEmailNotification(notification);
                        break;
                    case 'sms':
                        await this.sendSmsNotification(notification);
                        break;
                    case 'wechat':
                        await this.sendWechatNotification(notification);
                        break;
                    case 'dingtalk':
                        await this.sendDingtalkNotification(notification);
                        break;
                    default:
                        this.logger.warn(`Unknown notification channel: ${channel}`);
                }
            }
            await this.notificationRepository.markAsSent(notification.id);
            this.eventEmitter.emit(workflow_interface_1.WorkflowEventType.NOTIFICATION_SENT, {
                notificationId: notification.id,
                recipientId: notification.recipientId,
                type: notification.type,
                timestamp: new Date(),
            });
            this.logger.log(`Notification sent successfully: ${notification.id}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send notification ${notification.id}: ${error.message}`, error.stack);
            await this.notificationRepository.markAsFailed(notification.id, error.message);
            if (notification.retryCount < notification.maxRetries) {
                const nextSendAt = new Date(Date.now() + 5 * 60 * 1000);
                await this.notificationRepository.updateById(notification.id, {
                    nextSendAt,
                    retryCount: notification.retryCount + 1,
                });
            }
            return false;
        }
    }
    async sendNotifications(notifications) {
        let success = 0;
        let failed = 0;
        for (const notification of notifications) {
            const result = await this.sendNotification(notification);
            if (result) {
                success++;
            }
            else {
                failed++;
            }
        }
        return { success, failed };
    }
    async createAndSendNotification(data) {
        const notification = await this.notificationRepository.createNotification(data);
        await this.sendNotification(notification);
        return notification;
    }
    async getUserUnreadNotifications(userId) {
        return this.notificationRepository.findUnreadByRecipient(userId);
    }
    async markNotificationAsRead(notificationId, userId) {
        const notification = await this.notificationRepository.findById(notificationId);
        if (!notification) {
            throw new Error(`Notification not found: ${notificationId}`);
        }
        if (notification.recipientId !== userId) {
            throw new Error('User does not have permission to mark this notification as read');
        }
        await this.notificationRepository.markAsRead(notificationId);
    }
    async markNotificationAsActioned(notificationId, userId) {
        const notification = await this.notificationRepository.findById(notificationId);
        if (!notification) {
            throw new Error(`Notification not found: ${notificationId}`);
        }
        if (notification.recipientId !== userId) {
            throw new Error('User does not have permission to mark this notification as actioned');
        }
        await this.notificationRepository.markAsActioned(notificationId);
    }
    async deleteUserNotification(notificationId, userId) {
        const notification = await this.notificationRepository.findById(notificationId);
        if (!notification) {
            throw new Error(`Notification not found: ${notificationId}`);
        }
        if (notification.recipientId !== userId) {
            throw new Error('User does not have permission to delete this notification');
        }
        await this.notificationRepository.deleteById(notificationId);
    }
    async processPendingNotifications() {
        try {
            this.logger.debug('Processing pending notifications...');
            const pendingNotifications = await this.notificationRepository.findPendingNotifications();
            this.logger.debug(`Found ${pendingNotifications.length} pending notifications`);
            const now = new Date();
            const notificationsToSend = pendingNotifications.filter((notification) => !notification.nextSendAt || notification.nextSendAt <= now);
            if (notificationsToSend.length > 0) {
                const result = await this.sendNotifications(notificationsToSend);
                this.logger.log(`Sent ${result.success} notifications, ${result.failed} failed`);
            }
        }
        catch (error) {
            this.logger.error(`Error processing pending notifications: ${error.message}`, error.stack);
        }
    }
    async retryFailedNotifications() {
        try {
            this.logger.debug('Retrying failed notifications...');
            const failedNotifications = await this.notificationRepository.findRetryNotifications();
            this.logger.debug(`Found ${failedNotifications.length} notifications to retry`);
            if (failedNotifications.length > 0) {
                const result = await this.sendNotifications(failedNotifications);
                this.logger.log(`Retried ${result.success} notifications, ${result.failed} still failed`);
            }
        }
        catch (error) {
            this.logger.error(`Error retrying failed notifications: ${error.message}`, error.stack);
        }
    }
    async cleanupOldNotifications() {
        try {
            this.logger.debug('Cleaning up old notifications...');
            const deletedCount = await this.notificationRepository.deleteOldNotifications(30);
            this.logger.log(`Deleted ${deletedCount} old notifications`);
        }
        catch (error) {
            this.logger.error(`Error cleaning up old notifications: ${error.message}`, error.stack);
        }
    }
    async sendInAppNotification(notification) {
        this.logger.debug(`In-app notification sent: ${notification.title} to user ${notification.recipientId}`);
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    async sendEmailNotification(notification) {
        this.logger.debug(`Email notification sent: ${notification.title} to user ${notification.recipientId}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    async sendSmsNotification(notification) {
        this.logger.debug(`SMS notification sent: ${notification.title} to user ${notification.recipientId}`);
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
    async sendWechatNotification(notification) {
        this.logger.debug(`WeChat notification sent: ${notification.title} to user ${notification.recipientId}`);
        await new Promise((resolve) => setTimeout(resolve, 400));
    }
    async sendDingtalkNotification(notification) {
        this.logger.debug(`DingTalk notification sent: ${notification.title} to user ${notification.recipientId}`);
        await new Promise((resolve) => setTimeout(resolve, 400));
    }
    async sendTimeoutReminders() {
    }
};
exports.NotificationService = NotificationService;
__decorate([
    (0, schedule_1.Cron)('0 */5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "processPendingNotifications", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "retryFailedNotifications", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "cleanupOldNotifications", null);
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_repository_1.NotificationRepository)),
    __metadata("design:paramtypes", [notification_repository_1.NotificationRepository,
        event_emitter_1.EventEmitter2])
], NotificationService);
//# sourceMappingURL=notification.service.js.map