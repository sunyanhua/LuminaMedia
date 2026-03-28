import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationRepository } from '../repositories/notification.repository';
import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../../../shared/enums/workflow-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkflowEventType } from '../interfaces/workflow.interface';

/**
 * 通知服务
 * 负责发送工作流相关的通知和提醒
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 发送单个通知
   */
  async sendNotification(notification: Notification): Promise<boolean> {
    try {
      this.logger.debug(
        `Sending notification: ${notification.id} via channels: ${notification.channels.join(', ')}`,
      );

      // 根据渠道发送通知
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

      // 标记为已发送
      await this.notificationRepository.markAsSent(notification.id);

      // 发送事件
      this.eventEmitter.emit(WorkflowEventType.NOTIFICATION_SENT, {
        notificationId: notification.id,
        recipientId: notification.recipientId,
        type: notification.type,
        timestamp: new Date(),
      });

      this.logger.log(`Notification sent successfully: ${notification.id}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send notification ${notification.id}: ${error.message}`,
        error.stack,
      );

      // 标记为失败
      await this.notificationRepository.markAsFailed(
        notification.id,
        error.message,
      );

      // 检查是否需要重试
      if (notification.retryCount < notification.maxRetries) {
        const nextSendAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后重试
        await this.notificationRepository.updateById(notification.id, {
          nextSendAt,
          retryCount: notification.retryCount + 1,
        } as any);
      }

      return false;
    }
  }

  /**
   * 批量发送通知
   */
  async sendNotifications(
    notifications: Notification[],
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const notification of notifications) {
      const result = await this.sendNotification(notification);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * 创建并发送通知
   */
  async createAndSendNotification(data: {
    type: NotificationType;
    recipientId: string;
    title: string;
    content: string;
    workflowId?: string;
    nodeId?: string;
    channels?: string[];
    priority?: number;
    metadata?: any;
  }): Promise<Notification> {
    const notification =
      await this.notificationRepository.createNotification(data);
    await this.sendNotification(notification);
    return notification;
  }

  /**
   * 获取用户未读通知
   */
  async getUserUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findUnreadByRecipient(userId);
  }

  /**
   * 标记通知为已读
   */
  async markNotificationAsRead(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    const notification =
      await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error(`Notification not found: ${notificationId}`);
    }

    if (notification.recipientId !== userId) {
      throw new Error(
        'User does not have permission to mark this notification as read',
      );
    }

    await this.notificationRepository.markAsRead(notificationId);
  }

  /**
   * 标记通知为已处理
   */
  async markNotificationAsActioned(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    const notification =
      await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error(`Notification not found: ${notificationId}`);
    }

    if (notification.recipientId !== userId) {
      throw new Error(
        'User does not have permission to mark this notification as actioned',
      );
    }

    await this.notificationRepository.markAsActioned(notificationId);
  }

  /**
   * 删除用户通知
   */
  async deleteUserNotification(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    const notification =
      await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error(`Notification not found: ${notificationId}`);
    }

    if (notification.recipientId !== userId) {
      throw new Error(
        'User does not have permission to delete this notification',
      );
    }

    await this.notificationRepository.deleteById(notificationId);
  }

  /**
   * 定时任务：发送待处理通知
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processPendingNotifications(): Promise<void> {
    try {
      this.logger.debug('Processing pending notifications...');

      const pendingNotifications =
        await this.notificationRepository.findPendingNotifications();
      this.logger.debug(
        `Found ${pendingNotifications.length} pending notifications`,
      );

      const now = new Date();
      const notificationsToSend = pendingNotifications.filter(
        (notification) =>
          !notification.nextSendAt || notification.nextSendAt <= now,
      );

      if (notificationsToSend.length > 0) {
        const result = await this.sendNotifications(notificationsToSend);
        this.logger.log(
          `Sent ${result.success} notifications, ${result.failed} failed`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error processing pending notifications: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * 定时任务：重试失败的通知
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedNotifications(): Promise<void> {
    try {
      this.logger.debug('Retrying failed notifications...');

      const failedNotifications =
        await this.notificationRepository.findRetryNotifications();
      this.logger.debug(
        `Found ${failedNotifications.length} notifications to retry`,
      );

      if (failedNotifications.length > 0) {
        const result = await this.sendNotifications(failedNotifications);
        this.logger.log(
          `Retried ${result.success} notifications, ${result.failed} still failed`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error retrying failed notifications: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * 定时任务：清理旧通知
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNotifications(): Promise<void> {
    try {
      this.logger.debug('Cleaning up old notifications...');

      const deletedCount =
        await this.notificationRepository.deleteOldNotifications(30);
      this.logger.log(`Deleted ${deletedCount} old notifications`);
    } catch (error) {
      this.logger.error(
        `Error cleaning up old notifications: ${error.message}`,
        error.stack,
      );
    }
  }

  // ========== 私有方法：实际发送逻辑 ==========

  /**
   * 发送应用内通知
   */
  private async sendInAppNotification(
    notification: Notification,
  ): Promise<void> {
    // 这里实现应用内通知逻辑，例如：
    // 1. 将通知推送到WebSocket
    // 2. 存储到用户的通知中心
    // 3. 触发前端事件

    this.logger.debug(
      `In-app notification sent: ${notification.title} to user ${notification.recipientId}`,
    );

    // 模拟发送延迟
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * 发送邮件通知
   */
  private async sendEmailNotification(
    notification: Notification,
  ): Promise<void> {
    // 这里实现邮件发送逻辑
    // 可以使用Nodemailer或其他邮件服务

    this.logger.debug(
      `Email notification sent: ${notification.title} to user ${notification.recipientId}`,
    );

    // 模拟发送延迟
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  /**
   * 发送短信通知
   */
  private async sendSmsNotification(notification: Notification): Promise<void> {
    // 这里实现短信发送逻辑
    // 可以使用阿里云、腾讯云等短信服务

    this.logger.debug(
      `SMS notification sent: ${notification.title} to user ${notification.recipientId}`,
    );

    // 模拟发送延迟
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  /**
   * 发送微信通知
   */
  private async sendWechatNotification(
    notification: Notification,
  ): Promise<void> {
    // 这里实现微信通知逻辑
    // 可以使用企业微信、微信公众号等

    this.logger.debug(
      `WeChat notification sent: ${notification.title} to user ${notification.recipientId}`,
    );

    // 模拟发送延迟
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  /**
   * 发送钉钉通知
   */
  private async sendDingtalkNotification(
    notification: Notification,
  ): Promise<void> {
    // 这里实现钉钉通知逻辑
    // 可以使用钉钉机器人、钉钉工作通知等

    this.logger.debug(
      `DingTalk notification sent: ${notification.title} to user ${notification.recipientId}`,
    );

    // 模拟发送延迟
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  /**
   * 发送超时提醒
   */
  async sendTimeoutReminders(): Promise<void> {
    // 这里可以查询超时的审批节点，发送提醒通知
    // 具体实现需要与工作流服务结合
  }
}
