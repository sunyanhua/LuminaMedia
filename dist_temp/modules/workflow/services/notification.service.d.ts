import { NotificationRepository } from '../repositories/notification.repository';
import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../../../shared/enums/workflow-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class NotificationService {
    private readonly notificationRepository;
    private readonly eventEmitter;
    private readonly logger;
    constructor(notificationRepository: NotificationRepository, eventEmitter: EventEmitter2);
    sendNotification(notification: Notification): Promise<boolean>;
    sendNotifications(notifications: Notification[]): Promise<{
        success: number;
        failed: number;
    }>;
    createAndSendNotification(data: {
        type: NotificationType;
        recipientId: string;
        title: string;
        content: string;
        workflowId?: string;
        nodeId?: string;
        channels?: string[];
        priority?: number;
        metadata?: any;
    }): Promise<Notification>;
    getUserUnreadNotifications(userId: string): Promise<Notification[]>;
    markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
    markNotificationAsActioned(notificationId: string, userId: string): Promise<void>;
    deleteUserNotification(notificationId: string, userId: string): Promise<void>;
    processPendingNotifications(): Promise<void>;
    retryFailedNotifications(): Promise<void>;
    cleanupOldNotifications(): Promise<void>;
    private sendInAppNotification;
    private sendEmailNotification;
    private sendSmsNotification;
    private sendWechatNotification;
    private sendDingtalkNotification;
    sendTimeoutReminders(): Promise<void>;
}
