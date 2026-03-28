import { Injectable } from '@nestjs/common';
import { TenantRepository } from '../../../shared/repositories/tenant.repository';
import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../../../shared/enums/workflow-status.enum';
import { DataSource } from 'typeorm';

@Injectable()
export class NotificationRepository extends TenantRepository<Notification> {
  constructor(private dataSource: DataSource) {
    super(
      Notification,
      dataSource.createEntityManager(),
      dataSource.createQueryRunner(),
    );
  }

  /**
   * 根据接收人ID查找通知
   */
  async findByRecipient(recipientId: string): Promise<Notification[]> {
    return this.createQueryBuilder('notification')
      .where('notification.recipient_id = :recipientId', { recipientId })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
  }

  /**
   * 查找未读通知
   */
  async findUnreadByRecipient(recipientId: string): Promise<Notification[]> {
    return this.createQueryBuilder('notification')
      .where('notification.recipient_id = :recipientId', { recipientId })
      .andWhere('notification.status = :status', { status: 'PENDING' })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
  }

  /**
   * 根据类型查找通知
   */
  async findByType(type: NotificationType): Promise<Notification[]> {
    return this.find({ where: { type } });
  }

  /**
   * 查找待发送的通知
   */
  async findPendingNotifications(): Promise<Notification[]> {
    return this.createQueryBuilder('notification')
      .where('notification.status = :status', { status: 'PENDING' })
      .orderBy('notification.priority', 'DESC')
      .addOrderBy('notification.createdAt', 'ASC')
      .getMany();
  }

  /**
   * 查找失败的通知
   */
  async findFailedNotifications(): Promise<Notification[]> {
    return this.createQueryBuilder('notification')
      .where('notification.status = :status', { status: 'FAILED' })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
  }

  /**
   * 标记通知为已发送
   */
  async markAsSent(notificationId: string): Promise<void> {
    await this.updateById(notificationId, {
      status: 'SENT',
      sentAt: new Date(),
    });
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(notificationId: string): Promise<void> {
    await this.updateById(notificationId, {
      status: 'READ',
      readAt: new Date(),
    });
  }

  /**
   * 标记通知为已处理
   */
  async markAsActioned(notificationId: string): Promise<void> {
    await this.updateById(notificationId, {
      status: 'ACTIONED',
      actionedAt: new Date(),
    });
  }

  /**
   * 标记通知为失败
   */
  async markAsFailed(notificationId: string, reason: string): Promise<void> {
    await this.updateById(notificationId, {
      status: 'FAILED',
      failureReason: reason,
      retryCount: () => 'retry_count + 1',
    } as any);
  }

  /**
   * 创建通知
   */
  async createNotification(data: {
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
  }): Promise<Notification> {
    const notification = this.create({
      ...data,
      channels: data.channels || ['in_app'],
      priority: data.priority || 3,
      isSilent: data.isSilent || false,
      metadata: data.metadata || {},
    });

    return this.save(notification);
  }

  /**
   * 删除旧通知
   */
  async deleteOldNotifications(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await this.createQueryBuilder()
      .delete()
      .where('created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * 获取接收人的通知统计
   */
  async getRecipientStats(recipientId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
  }> {
    const allNotifications = await this.findByRecipient(recipientId);
    const unreadNotifications = await this.findUnreadByRecipient(recipientId);

    const byType: Record<NotificationType, number> = {} as Record<
      NotificationType,
      number
    >;
    Object.values(NotificationType).forEach((type) => {
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

  /**
   * 查找需要重试的通知
   */
  async findRetryNotifications(): Promise<Notification[]> {
    return this.createQueryBuilder('notification')
      .where('notification.status = :status', { status: 'FAILED' })
      .andWhere('notification.retry_count < notification.max_retries')
      .andWhere('notification.next_send_at <= :now', { now: new Date() })
      .getMany();
  }
}
