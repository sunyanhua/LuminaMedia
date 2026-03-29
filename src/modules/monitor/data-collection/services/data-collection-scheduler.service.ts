import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, In } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { DataCollectionTask } from '../entities/data-collection-task.entity';
import { PlatformConfig } from '../entities/platform-config.entity';
import { TaskStatus, PlatformType } from '../interfaces/data-collection.interface';

@Injectable()
export class DataCollectionSchedulerService {
  private readonly logger = new Logger(DataCollectionSchedulerService.name);

  constructor(
    @InjectRepository(DataCollectionTask)
    private taskRepository: Repository<DataCollectionTask>,
    @InjectRepository(PlatformConfig)
    private platformConfigRepository: Repository<PlatformConfig>,
    @InjectQueue('data-collection')
    private dataCollectionQueue: Queue,
  ) {}

  /**
   * 调度待处理任务
   */
  async schedulePendingTasks(): Promise<number> {
    try {
      // 查找所有待处理且计划时间已到（或已过）的任务
      const pendingTasks = await this.taskRepository.find({
        where: {
          status: TaskStatus.PENDING,
          scheduledAt: LessThanOrEqual(new Date()),
        },
        take: 100, // 每次最多调度100个任务
      });

      if (pendingTasks.length === 0) {
        this.logger.debug('没有待调度的任务');
        return 0;
      }

      this.logger.log(`找到 ${pendingTasks.length} 个待调度任务`);

      let scheduledCount = 0;
      for (const task of pendingTasks) {
        try {
          // 检查平台配置是否激活
          const platformConfig = await this.platformConfigRepository.findOne({
            where: {
              tenantId: task.tenantId,
              platform: task.platform,
              isActive: true,
            },
          });

          if (!platformConfig) {
            this.logger.warn(`平台配置未找到或未激活: tenant=${task.tenantId}, platform=${task.platform}`);
            await this.markTaskAsFailed(task.id, '平台配置未找到或未激活');
            continue;
          }

          // 检查API限制
          if (platformConfig.apiLimits && platformConfig.apiLimits.remaining <= 0) {
            this.logger.warn(`API限制已达到: platform=${task.platform}, remaining=${platformConfig.apiLimits.remaining}`);
            // 重新调度任务到限制重置时间
            const resetAt = new Date(platformConfig.apiLimits.resetAt);
            await this.rescheduleTask(task.id, resetAt);
            continue;
          }

          // 添加到队列
          await this.dataCollectionQueue.add('collect-data', {
            taskId: task.id,
            tenantId: task.tenantId,
            platform: task.platform,
            method: task.method,
            config: task.config,
          });

          // 更新任务状态
          await this.taskRepository.update(task.id, {
            status: TaskStatus.SCHEDULED,
            scheduledAt: new Date(),
          });

          scheduledCount++;
          this.logger.debug(`任务已调度: ${task.id}`);
        } catch (error) {
          this.logger.error(`调度任务失败 ${task.id}: ${error.message}`, error.stack);
          await this.markTaskAsFailed(task.id, `调度失败: ${error.message}`);
        }
      }

      this.logger.log(`成功调度 ${scheduledCount} 个任务`);
      return scheduledCount;
    } catch (error) {
      this.logger.error(`调度任务失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 创建新的采集任务
   */
  async createCollectionTask(data: {
    tenantId: string;
    platform: PlatformType;
    method?: string;
    config?: any;
    scheduledAt?: Date;
  }): Promise<DataCollectionTask> {
    try {
      const task = this.taskRepository.create({
        tenantId: data.tenantId,
        platform: data.platform,
        method: data.method || 'api',
        config: data.config || {},
        status: TaskStatus.PENDING,
        scheduledAt: data.scheduledAt || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedTask = await this.taskRepository.save(task);
      this.logger.log(`创建采集任务: ${savedTask.id}`);
      return savedTask;
    } catch (error) {
      this.logger.error(`创建采集任务失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 批量创建采集任务
   */
  async batchCreateTasks(tasks: Array<{
    tenantId: string;
    platform: PlatformType;
    method?: string;
    config?: any;
    scheduledAt?: Date;
  }>): Promise<DataCollectionTask[]> {
    const createdTasks: DataCollectionTask[] = [];

    for (const taskData of tasks) {
      try {
        const task = await this.createCollectionTask(taskData);
        createdTasks.push(task);
      } catch (error) {
        this.logger.error(`批量创建任务失败: ${error.message}`);
        // 继续处理其他任务
      }
    }

    return createdTasks;
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string): Promise<{
    status: TaskStatus;
    progress: number;
    result?: any;
    errorMessage?: string;
  }> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`);
    }

    return {
      status: task.status,
      progress: task.progress,
      result: task.result,
      errorMessage: task.errorMessage,
    };
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`);
    }

    if ([TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED].includes(task.status)) {
      this.logger.warn(`任务已处于最终状态，无法取消: ${taskId}, status=${task.status}`);
      return false;
    }

    await this.taskRepository.update(taskId, {
      status: TaskStatus.CANCELLED,
      updatedAt: new Date(),
    });

    // 从队列中移除任务（如果存在）
    try {
      const jobs = await this.dataCollectionQueue.getJobs(['waiting', 'delayed', 'active']);
      const job = jobs.find(j => j.data.taskId === taskId);
      if (job) {
        await job.remove();
        this.logger.debug(`从队列中移除任务: ${taskId}`);
      }
    } catch (error) {
      this.logger.warn(`从队列中移除任务失败: ${error.message}`);
    }

    this.logger.log(`任务已取消: ${taskId}`);
    return true;
  }

  /**
   * 重新调度任务
   */
  private async rescheduleTask(taskId: string, scheduledAt: Date): Promise<void> {
    await this.taskRepository.update(taskId, {
      scheduledAt,
      updatedAt: new Date(),
    });
    this.logger.debug(`任务重新调度: ${taskId} -> ${scheduledAt.toISOString()}`);
  }

  /**
   * 标记任务为失败
   */
  private async markTaskAsFailed(taskId: string, errorMessage: string): Promise<void> {
    await this.taskRepository.update(taskId, {
      status: TaskStatus.FAILED,
      errorMessage,
      completedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * 获取平台统计信息
   */
  async getPlatformStats(tenantId: string): Promise<Array<{
    platform: PlatformType;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    successRate: number;
    lastCollectionAt: Date | null;
  }>> {
    const platforms = Object.values(PlatformType);
    const stats = [];

    for (const platform of platforms) {
      const tasks = await this.taskRepository.find({
        where: { tenantId, platform },
      });

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
      const failedTasks = tasks.filter(t => t.status === TaskStatus.FAILED).length;
      const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const lastCompletedTask = tasks
        .filter(t => t.status === TaskStatus.COMPLETED)
        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())[0];

      stats.push({
        platform,
        totalTasks,
        completedTasks,
        failedTasks,
        successRate,
        lastCollectionAt: lastCompletedTask?.completedAt || null,
      });
    }

    return stats;
  }

  /**
   * 清理旧任务
   */
  async cleanupOldTasks(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.taskRepository.createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('status IN (:...statuses)', {
        statuses: [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED],
      })
      .execute();

    this.logger.log(`清理 ${result.affected} 个旧任务`);
    return result.affected || 0;
  }
}