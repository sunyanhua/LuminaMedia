import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, In, Between, Like } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import {
  ReferenceInfo,
  ReferenceInfoStatus,
} from '../../../entities/reference-info.entity';
import { TenantContextService } from '../../../shared/services/tenant-context.service';

// 参考信息查询选项
export interface ReferenceInfoQueryOptions {
  page?: number;
  limit?: number;
  status?: ReferenceInfoStatus;
  category?: string;
  keyword?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'publishTime' | 'relevance' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

// 抓取配置
export interface CrawlConfig {
  sources: CrawlSource[];
  frequency: string; // cron表达式
  enabled: boolean;
}

// 抓取源
export interface CrawlSource {
  name: string;
  url: string;
  type: 'policy' | 'news' | 'blog' | 'official';
  selectors?: {
    title: string;
    content: string;
    publishTime?: string;
    author?: string;
  };
}

// 抓取结果
export interface CrawlResult {
  title: string;
  content: string;
  summary?: string;
  sourceUrl: string;
  sourceName: string;
  publishTime?: Date;
  author?: string;
  relevance: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class ReferenceInfoService {
  private readonly logger = new Logger(ReferenceInfoService.name);

  constructor(
    @InjectRepository(ReferenceInfo)
    private readonly referenceInfoRepository: Repository<ReferenceInfo>,
    private readonly configService: ConfigService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  /**
   * 创建参考信息
   */
  async create(
    data: Partial<ReferenceInfo>,
    createdBy?: string,
  ): Promise<ReferenceInfo> {
    try {
      const tenantId = this.tenantContextService.getTenantId();

      const referenceInfo = this.referenceInfoRepository.create({
        ...data,
        tenantId,
        createdBy,
      });

      return await this.referenceInfoRepository.save(referenceInfo);
    } catch (error) {
      this.logger.error(`Failed to create reference info: ${error.message}`, error.stack);
      throw new InternalServerErrorException('创建参考信息失败');
    }
  }

  /**
   * 批量创建参考信息
   */
  async createMany(
    items: Partial<ReferenceInfo>[],
    createdBy?: string,
  ): Promise<ReferenceInfo[]> {
    try {
      const tenantId = this.tenantContextService.getTenantId();

      const referenceInfos = items.map(item =>
        this.referenceInfoRepository.create({
          ...item,
          tenantId,
          createdBy,
        }),
      );

      return await this.referenceInfoRepository.save(referenceInfos);
    } catch (error) {
      this.logger.error(`Failed to create many reference infos: ${error.message}`, error.stack);
      throw new InternalServerErrorException('批量创建参考信息失败');
    }
  }

  /**
   * 更新参考信息
   */
  async update(
    id: string,
    updates: Partial<ReferenceInfo>,
  ): Promise<ReferenceInfo> {
    try {
      const tenantId = this.tenantContextService.getTenantId();

      const referenceInfo = await this.referenceInfoRepository.findOne({
        where: { id, tenantId },
      });

      if (!referenceInfo) {
        throw new NotFoundException(`参考信息 ${id} 不存在`);
      }

      Object.assign(referenceInfo, updates);

      return await this.referenceInfoRepository.save(referenceInfo);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update reference info: ${error.message}`, error.stack);
      throw new InternalServerErrorException('更新参考信息失败');
    }
  }

  /**
   * 删除参考信息（软删除）
   */
  async delete(id: string): Promise<void> {
    try {
      const tenantId = this.tenantContextService.getTenantId();

      const referenceInfo = await this.referenceInfoRepository.findOne({
        where: { id, tenantId },
      });

      if (!referenceInfo) {
        throw new NotFoundException(`参考信息 ${id} 不存在`);
      }

      referenceInfo.deletedAt = new Date();
      await this.referenceInfoRepository.save(referenceInfo);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete reference info: ${error.message}`, error.stack);
      throw new InternalServerErrorException('删除参考信息失败');
    }
  }

  /**
   * 根据ID查找参考信息
   */
  async findById(id: string): Promise<ReferenceInfo> {
    try {
      const tenantId = this.tenantContextService.getTenantId();

      const referenceInfo = await this.referenceInfoRepository.findOne({
        where: { id, tenantId },
      });

      if (!referenceInfo) {
        throw new NotFoundException(`参考信息 ${id} 不存在`);
      }

      return referenceInfo;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find reference info: ${error.message}`, error.stack);
      throw new InternalServerErrorException('查找参考信息失败');
    }
  }

  /**
   * 查询参考信息列表
   */
  async findAll(options: ReferenceInfoQueryOptions = {}): Promise<{
    items: ReferenceInfo[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const tenantId = this.tenantContextService.getTenantId();
      const {
        page = 1,
        limit = 20,
        status,
        category,
        keyword,
        startDate,
        endDate,
        sortBy = 'publishTime',
        sortOrder = 'DESC',
      } = options;

      const skip = (page - 1) * limit;

      const queryBuilder = this.referenceInfoRepository
        .createQueryBuilder('reference')
        .where('reference.tenantId = :tenantId', { tenantId })
        .andWhere('reference.deletedAt IS NULL');

      if (status) {
        queryBuilder.andWhere('reference.status = :status', { status });
      }

      if (category) {
        queryBuilder.andWhere('reference.category = :category', { category });
      }

      if (keyword) {
        queryBuilder.andWhere(
          '(reference.title LIKE :keyword OR reference.summary LIKE :keyword OR reference.content LIKE :keyword)',
          { keyword: `%${keyword}%` },
        );
      }

      if (startDate && endDate) {
        queryBuilder.andWhere('reference.publishTime BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      } else if (startDate) {
        queryBuilder.andWhere('reference.publishTime >= :startDate', { startDate });
      } else if (endDate) {
        queryBuilder.andWhere('reference.publishTime <= :endDate', { endDate });
      }

      // 排序
      const orderField = `reference.${sortBy}`;
      queryBuilder.orderBy(orderField, sortOrder);

      // 分页
      queryBuilder.skip(skip).take(limit);

      const [items, total] = await queryBuilder.getManyAndCount();

      return {
        items,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to find all reference infos: ${error.message}`, error.stack);
      throw new InternalServerErrorException('查询参考信息列表失败');
    }
  }

  /**
   * 标记为已采用
   */
  async markAsAdopted(id: string, userId: string): Promise<ReferenceInfo> {
    try {
      const referenceInfo = await this.findById(id);
      referenceInfo.markAsAdopted(userId);
      return await this.referenceInfoRepository.save(referenceInfo);
    } catch (error) {
      this.logger.error(`Failed to mark as adopted: ${error.message}`, error.stack);
      throw new InternalServerErrorException('标记为已采用失败');
    }
  }

  /**
   * 标记为已修改
   */
  async markAsModified(
    id: string,
    userId: string,
    notes: string,
    generatedContent?: string,
  ): Promise<ReferenceInfo> {
    try {
      const referenceInfo = await this.findById(id);
      referenceInfo.markAsModified(userId, notes, generatedContent);
      return await this.referenceInfoRepository.save(referenceInfo);
    } catch (error) {
      this.logger.error(`Failed to mark as modified: ${error.message}`, error.stack);
      throw new InternalServerErrorException('标记为已修改失败');
    }
  }

  /**
   * 标记为已忽略
   */
  async markAsIgnored(id: string, reason?: string): Promise<ReferenceInfo> {
    try {
      const referenceInfo = await this.findById(id);
      referenceInfo.markAsIgnored(reason);
      return await this.referenceInfoRepository.save(referenceInfo);
    } catch (error) {
      this.logger.error(`Failed to mark as ignored: ${error.message}`, error.stack);
      throw new InternalServerErrorException('标记为已忽略失败');
    }
  }

  /**
   * 计算相关度评分
   */
  calculateRelevance(
    content: string,
    keywords: string[] = [],
  ): number {
    // 简化实现：基于关键词匹配计算评分
    // 实际项目中可以更复杂的算法
    if (!keywords.length) {
      return 50; // 默认中等相关度
    }

    const contentLower = content.toLowerCase();
    let matches = 0;

    for (const keyword of keywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        matches++;
      }
    }

    const score = (matches / keywords.length) * 100;
    return Math.min(Math.round(score), 100);
  }

  /**
   * 获取统计数据
   */
  async getStats(): Promise<{
    total: number;
    byStatus: Record<ReferenceInfoStatus, number>;
    byCategory: Record<string, number>;
  }> {
    try {
      const tenantId = this.tenantContextService.getTenantId();

      const total = await this.referenceInfoRepository.count({
        where: { tenantId, deletedAt: null },
      });

      // 按状态统计
      const statusQuery = await this.referenceInfoRepository
        .createQueryBuilder('reference')
        .select('reference.status, COUNT(*) as count')
        .where('reference.tenantId = :tenantId', { tenantId })
        .andWhere('reference.deletedAt IS NULL')
        .groupBy('reference.status')
        .getRawMany();

      const byStatus: Record<ReferenceInfoStatus, number> = {
        [ReferenceInfoStatus.NEW]: 0,
        [ReferenceInfoStatus.ADOPTED]: 0,
        [ReferenceInfoStatus.MODIFIED]: 0,
        [ReferenceInfoStatus.IGNORED]: 0,
      };

      statusQuery.forEach(row => {
        byStatus[row.reference_status] = parseInt(row.count, 10);
      });

      // 按分类统计
      const categoryQuery = await this.referenceInfoRepository
        .createQueryBuilder('reference')
        .select('reference.category, COUNT(*) as count')
        .where('reference.tenantId = :tenantId', { tenantId })
        .andWhere('reference.deletedAt IS NULL')
        .andWhere('reference.category IS NOT NULL')
        .groupBy('reference.category')
        .getRawMany();

      const byCategory: Record<string, number> = {};
      categoryQuery.forEach(row => {
        byCategory[row.reference_category] = parseInt(row.count, 10);
      });

      return {
        total,
        byStatus,
        byCategory,
      };
    } catch (error) {
      this.logger.error(`Failed to get stats: ${error.message}`, error.stack);
      throw new InternalServerErrorException('获取统计数据失败');
    }
  }

  /**
   * 生成修改后的内容
   */
  async generateModifiedContent(
    originalContent: string,
    modificationNotes: string,
  ): Promise<string> {
    try {
      // DEMO版本：模拟AI生成
      // 实际项目可以调用GeminiService或其他AI服务
      this.logger.log(`Generating modified content with notes: ${modificationNotes}`);

      // 模拟生成延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 简单的模拟生成逻辑
      const generated = `【AI生成内容 - 基于修改意见】\n\n${originalContent}\n\n---\n\n【修改说明】\n${modificationNotes}\n\n【AI优化建议】\n根据您的要求，已对原文进行了优化，语言更加正式，重点更加突出。`;

      return generated;
    } catch (error) {
      this.logger.error(`Failed to generate modified content: ${error.message}`, error.stack);
      // 如果生成失败，返回原始内容
      return originalContent;
    }
  }
}