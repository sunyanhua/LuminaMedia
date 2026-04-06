import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { ReferenceInfo, ReferenceInfoStatus } from '../../../entities/reference-info.entity';
import { TenantContextService } from '../../../shared/services/tenant-context.service';

// 查询选项接口
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

// 抓取结果接口
export interface CrawlResult {
  title: string;
  content: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishTime: Date | undefined;
  author?: string;
  relevance: number;
  metadata: {
    sourceType: string;
    crawledAt: Date;
    isDemo?: boolean;
    category?: string;
    [key: string]: any;
  };
}

@Injectable()
export class ReferenceInfoService {
  private readonly logger = new Logger(ReferenceInfoService.name);

  constructor(
    @InjectRepository(ReferenceInfo)
    private readonly referenceInfoRepository: Repository<ReferenceInfo>,
    private readonly tenantContextService: TenantContextService,
  ) {}

  /**
   * 获取参考信息列表
   */
  async findAll(options: ReferenceInfoQueryOptions): Promise<{ items: ReferenceInfo[]; total: number }> {
    const tenantId = this.tenantContextService.getTenantId();
    const {
      page = 1,
      limit = 20,
      status,
      category,
      keyword,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const where: FindOptionsWhere<ReferenceInfo> = { tenantId };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (keyword) {
      where.title = Like(`%${keyword}%`);
    }

    if (startDate && endDate) {
      where.publishTime = Between(startDate, endDate);
    }

    const [items, total] = await this.referenceInfoRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 根据ID获取参考信息
   */
  async findById(id: string): Promise<ReferenceInfo> {
    const tenantId = this.tenantContextService.getTenantId();
    const referenceInfo = await this.referenceInfoRepository.findOne({
      where: { id, tenantId },
    });

    if (!referenceInfo) {
      throw new NotFoundException(`参考信息不存在: ${id}`);
    }

    return referenceInfo;
  }

  /**
   * 创建参考信息
   */
  async create(data: Partial<ReferenceInfo>): Promise<ReferenceInfo> {
    const tenantId = this.tenantContextService.getTenantId();
    const referenceInfo = this.referenceInfoRepository.create({
      ...data,
      tenantId,
      status: ReferenceInfoStatus.NEW,
    });

    return await this.referenceInfoRepository.save(referenceInfo);
  }

  /**
   * 更新参考信息
   */
  async update(id: string, data: Partial<ReferenceInfo>): Promise<ReferenceInfo> {
    const referenceInfo = await this.findById(id);
    Object.assign(referenceInfo, data);
    return await this.referenceInfoRepository.save(referenceInfo);
  }

  /**
   * 删除参考信息
   */
  async delete(id: string): Promise<void> {
    const referenceInfo = await this.findById(id);
    await this.referenceInfoRepository.remove(referenceInfo);
  }

  /**
   * 标记为已采用
   */
  async markAsAdopted(id: string, userId: string): Promise<ReferenceInfo> {
    const referenceInfo = await this.findById(id);
    referenceInfo.status = ReferenceInfoStatus.ADOPTED;
    referenceInfo.adoptedBy = userId;
    referenceInfo.adoptedAt = new Date();
    return await this.referenceInfoRepository.save(referenceInfo);
  }

  /**
   * 标记为已修改采用
   */
  async markAsModified(
    id: string,
    userId: string,
    notes: string,
    generatedContent: string,
  ): Promise<ReferenceInfo> {
    const referenceInfo = await this.findById(id);
    referenceInfo.status = ReferenceInfoStatus.MODIFIED;
    referenceInfo.adoptedBy = userId;
    referenceInfo.adoptedAt = new Date();
    referenceInfo.modificationNotes = notes;
    referenceInfo.generatedContent = generatedContent;
    return await this.referenceInfoRepository.save(referenceInfo);
  }

  /**
   * 标记为已忽略
   */
  async markAsIgnored(id: string, reason?: string): Promise<ReferenceInfo> {
    const referenceInfo = await this.findById(id);
    referenceInfo.status = ReferenceInfoStatus.IGNORED;
    referenceInfo.ignoreReason = reason ?? '';
    return await this.referenceInfoRepository.save(referenceInfo);
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<{
    total: number;
    new: number;
    adopted: number;
    modified: number;
    ignored: number;
  }> {
    const tenantId = this.tenantContextService.getTenantId();
    const total = await this.referenceInfoRepository.count({ where: { tenantId } });
    const newCount = await this.referenceInfoRepository.count({
      where: { tenantId, status: ReferenceInfoStatus.NEW },
    });
    const adoptedCount = await this.referenceInfoRepository.count({
      where: { tenantId, status: ReferenceInfoStatus.ADOPTED },
    });
    const modifiedCount = await this.referenceInfoRepository.count({
      where: { tenantId, status: ReferenceInfoStatus.MODIFIED },
    });
    const ignoredCount = await this.referenceInfoRepository.count({
      where: { tenantId, status: ReferenceInfoStatus.IGNORED },
    });

    return {
      total,
      new: newCount,
      adopted: adoptedCount,
      modified: modifiedCount,
      ignored: ignoredCount,
    };
  }

  /**
   * 计算内容相关度
   */
  calculateRelevance(content: string, keywords: string[]): number {
    if (!keywords.length) return 50;

    let matchCount = 0;
    const contentLower = content.toLowerCase();

    for (const keyword of keywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    // 基础分50，每匹配一个关键词加10分，最多100分
    return Math.min(50 + matchCount * 10, 100);
  }

  /**
   * 生成修改后的内容
   */
  async generateModifiedContent(originalContent: string, notes: string): Promise<string> {
    // DEMO版本：简单拼接
    // 实际项目应该调用AI服务生成
    return `基于原文修改：\n\n原文：${originalContent}\n\n修改要求：${notes}\n\n【AI生成内容将在这里展示】`;
  }
}
