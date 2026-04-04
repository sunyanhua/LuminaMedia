import { TenantRepository } from '../../../shared/repositories/tenant.repository';
import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../../../shared/enums/workflow-status.enum';
import { DataSource } from 'typeorm';
export declare class NotificationRepository extends TenantRepository<Notification> {
    private dataSource;
    constructor(dataSource: DataSource);
    findByRecipient(recipientId: string): Promise<Notification[]>;
    findUnreadByRecipient(recipientId: string): Promise<Notification[]>;
    findByType(type: NotificationType): Promise<Notification[]>;
    findPendingNotifications(): Promise<Notification[]>;
    findFailedNotifications(): Promise<Notification[]>;
    markAsSent(notificationId: string): Promise<void>;
    markAsRead(notificationId: string): Promise<void>;
    markAsActioned(notificationId: string): Promise<void>;
    markAsFailed(notificationId: string, reason: string): Promise<void>;
    createNotification(data: {
        type: NotificationType;
        recipientId: string;
        title: string;
        content: string;
        workflowId?: string;
        nodeId?: string;
        channels?: string[];
        priority?: number;
        isSilent?: boolean;
        metadata?: any;
    }): Promise<Notification>;
    deleteOldNotifications(daysToKeep?: number): Promise<number>;
    getRecipientStats(recipientId: string): Promise<{
        total: number;
        unread: number;
        byType: Record<NotificationType, number>;
    }>;
    findRetryNotifications(): Promise<Notification[]>;
}
