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
var DataCollectionSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataCollectionSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bull_1 = require("@nestjs/bull");
const data_collection_task_entity_1 = require("../entities/data-collection-task.entity");
const platform_config_entity_1 = require("../entities/platform-config.entity");
const data_collection_interface_1 = require("../interfaces/data-collection.interface");
let DataCollectionSchedulerService = DataCollectionSchedulerService_1 = class DataCollectionSchedulerService {
    taskRepository;
    platformConfigRepository;
    dataCollectionQueue;
    logger = new common_1.Logger(DataCollectionSchedulerService_1.name);
    constructor(taskRepository, platformConfigRepository, dataCollectionQueue) {
        this.taskRepository = taskRepository;
        this.platformConfigRepository = platformConfigRepository;
        this.dataCollectionQueue = dataCollectionQueue;
    }
    async schedulePendingTasks() {
        try {
            const pendingTasks = await this.taskRepository.find({
                where: {
                    status: data_collection_interface_1.TaskStatus.PENDING,
                    scheduledAt: (0, typeorm_2.LessThanOrEqual)(new Date()),
                },
                take: 100,
            });
            if (pendingTasks.length === 0) {
                this.logger.debug('没有待调度的任务');
                return 0;
            }
            this.logger.log(`找到 ${pendingTasks.length} 个待调度任务`);
            let scheduledCount = 0;
            for (const task of pendingTasks) {
                try {
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
                    if (platformConfig.apiLimits &&
                        platformConfig.apiLimits.remaining <= 0) {
                        this.logger.warn(`API限制已达到: platform=${task.platform}, remaining=${platformConfig.apiLimits.remaining}`);
                        const resetAt = new Date(platformConfig.apiLimits.resetAt);
                        await this.rescheduleTask(task.id, resetAt);
                        continue;
                    }
                    await this.dataCollectionQueue.add('collect-data', {
                        taskId: task.id,
                        tenantId: task.tenantId,
                        platform: task.platform,
                        method: task.method,
                        config: task.config,
                    });
                    await this.taskRepository.update(task.id, {
                        status: data_collection_interface_1.TaskStatus.SCHEDULED,
                        scheduledAt: new Date(),
                    });
                    scheduledCount++;
                    this.logger.debug(`任务已调度: ${task.id}`);
                }
                catch (error) {
                    this.logger.error(`调度任务失败 ${task.id}: ${error.message}`, error.stack);
                    await this.markTaskAsFailed(task.id, `调度失败: ${error.message}`);
                }
            }
            this.logger.log(`成功调度 ${scheduledCount} 个任务`);
            return scheduledCount;
        }
        catch (error) {
            this.logger.error(`调度任务失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createCollectionTask(data) {
        try {
            const task = this.taskRepository.create({
                tenantId: data.tenantId,
                platform: data.platform,
                method: data.method || 'api',
                config: data.config || {},
                status: data_collection_interface_1.TaskStatus.PENDING,
                scheduledAt: data.scheduledAt || new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const savedTask = await this.taskRepository.save(task);
            this.logger.log(`创建采集任务: ${savedTask.id}`);
            return savedTask;
        }
        catch (error) {
            this.logger.error(`创建采集任务失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async batchCreateTasks(tasks) {
        const createdTasks = [];
        for (const taskData of tasks) {
            try {
                const task = await this.createCollectionTask(taskData);
                createdTasks.push(task);
            }
            catch (error) {
                this.logger.error(`批量创建任务失败: ${error.message}`);
            }
        }
        return createdTasks;
    }
    async getTaskStatus(taskId) {
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
    async cancelTask(taskId) {
        const task = await this.taskRepository.findOne({ where: { id: taskId } });
        if (!task) {
            throw new Error(`任务不存在: ${taskId}`);
        }
        if ([data_collection_interface_1.TaskStatus.COMPLETED, data_collection_interface_1.TaskStatus.FAILED, data_collection_interface_1.TaskStatus.CANCELLED].includes(task.status)) {
            this.logger.warn(`任务已处于最终状态，无法取消: ${taskId}, status=${task.status}`);
            return false;
        }
        await this.taskRepository.update(taskId, {
            status: data_collection_interface_1.TaskStatus.CANCELLED,
            updatedAt: new Date(),
        });
        try {
            const jobs = await this.dataCollectionQueue.getJobs([
                'waiting',
                'delayed',
                'active',
            ]);
            const job = jobs.find((j) => j.data.taskId === taskId);
            if (job) {
                await job.remove();
                this.logger.debug(`从队列中移除任务: ${taskId}`);
            }
        }
        catch (error) {
            this.logger.warn(`从队列中移除任务失败: ${error.message}`);
        }
        this.logger.log(`任务已取消: ${taskId}`);
        return true;
    }
    async rescheduleTask(taskId, scheduledAt) {
        await this.taskRepository.update(taskId, {
            scheduledAt,
            updatedAt: new Date(),
        });
        this.logger.debug(`任务重新调度: ${taskId} -> ${scheduledAt.toISOString()}`);
    }
    async markTaskAsFailed(taskId, errorMessage) {
        await this.taskRepository.update(taskId, {
            status: data_collection_interface_1.TaskStatus.FAILED,
            errorMessage,
            completedAt: new Date(),
            updatedAt: new Date(),
        });
    }
    async getPlatformStats(tenantId) {
        const platforms = Object.values(data_collection_interface_1.PlatformType);
        const stats = [];
        for (const platform of platforms) {
            const tasks = await this.taskRepository.find({
                where: { tenantId, platform },
            });
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter((t) => t.status === data_collection_interface_1.TaskStatus.COMPLETED).length;
            const failedTasks = tasks.filter((t) => t.status === data_collection_interface_1.TaskStatus.FAILED).length;
            const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            const lastCompletedTask = tasks
                .filter((t) => t.status === data_collection_interface_1.TaskStatus.COMPLETED)
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
    async cleanupOldTasks(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const result = await this.taskRepository
            .createQueryBuilder()
            .delete()
            .where('createdAt < :cutoffDate', { cutoffDate })
            .andWhere('status IN (:...statuses)', {
            statuses: [
                data_collection_interface_1.TaskStatus.COMPLETED,
                data_collection_interface_1.TaskStatus.FAILED,
                data_collection_interface_1.TaskStatus.CANCELLED,
            ],
        })
            .execute();
        this.logger.log(`清理 ${result.affected} 个旧任务`);
        return result.affected || 0;
    }
};
exports.DataCollectionSchedulerService = DataCollectionSchedulerService;
exports.DataCollectionSchedulerService = DataCollectionSchedulerService = DataCollectionSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(data_collection_task_entity_1.DataCollectionTask)),
    __param(1, (0, typeorm_1.InjectRepository)(platform_config_entity_1.PlatformConfig)),
    __param(2, (0, bull_1.InjectQueue)('data-collection')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, Object])
], DataCollectionSchedulerService);
//# sourceMappingURL=data-collection-scheduler.service.js.map