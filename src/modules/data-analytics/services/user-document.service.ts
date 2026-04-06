import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDocument, UserDocumentFileType, CustomReportType } from '../../../entities/user-document.entity';
import { Report, ReportType, ReportStatus } from '../../../entities/report.entity';
import { User } from '../../../entities/user.entity';
import { GeminiService } from './gemini.service';
import { Platform } from '../../../shared/enums/platform.enum';

export interface UserDocumentUploadDto {
  title: string;
  description?: string;
  reportType?: CustomReportType;
  isPublic?: boolean;
}

export interface UserDocumentUpdateDto {
  title?: string;
  description?: string;
  reportType?: CustomReportType;
  isPublic?: boolean;
}

export interface CustomReportGenerationDto {
  documentId: string;
  reportType: CustomReportType;
  title?: string;
  customInstructions?: string;
}

@Injectable()
export class UserDocumentService {
  private readonly logger = new Logger(UserDocumentService.name);

  constructor(
    @InjectRepository(UserDocument)
    private readonly userDocumentRepository: Repository<UserDocument>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly geminiService: GeminiService,
  ) {}

  /**
   * 上传用户文档
   */
  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    uploadDto: UserDocumentUploadDto,
  ): Promise<UserDocument> {
    try {
      // 验证用户存在
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`用户不存在: ${userId}`);
      }

      // 确定文件类型
      const fileType = this.determineFileType(file.mimetype, file.originalname);

      // 创建文档记录
      const document = this.userDocumentRepository.create({
        userId,
        title: uploadDto.title || file.originalname,
        fileUrl: this.generateFileUrl(userId, file), // 实际应用中应上传到OSS并返回URL
        fileType,
        fileInfo: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          encoding: file.encoding,
        },
        description: uploadDto.description,
        reportType: uploadDto.reportType,
        isPublic: uploadDto.isPublic || false,
        extractionStatus: 'pending',
      });

      const savedDocument = await this.userDocumentRepository.save(document);

      // 异步提取文档内容（实际应用中应该使用队列处理）
      this.extractDocumentContent(savedDocument.id).catch(error => {
        this.logger.error(`提取文档内容失败: ${error.message}`, error.stack);
      });

      return savedDocument;
    } catch (error) {
      this.logger.error(`上传用户文档失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取用户文档列表
   */
  async getUserDocuments(
    userId: string,
    options?: {
      reportType?: CustomReportType;
      fileType?: UserDocumentFileType;
      limit?: number;
      offset?: number;
      includePublic?: boolean;
    },
  ): Promise<{ documents: UserDocument[]; total: number }> {
    try {
      const query = this.userDocumentRepository.createQueryBuilder('doc')
        .where('doc.userId = :userId', { userId })
        .andWhere('doc.deletedAt IS NULL');

      if (options?.reportType) {
        query.andWhere('doc.reportType = :reportType', { reportType: options.reportType });
      }

      if (options?.fileType) {
        query.andWhere('doc.fileType = :fileType', { fileType: options.fileType });
      }

      if (!options?.includePublic) {
        query.andWhere('doc.isPublic = false');
      }

      const [documents, total] = await query
        .orderBy('doc.createdAt', 'DESC')
        .skip(options?.offset || 0)
        .take(options?.limit || 20)
        .getManyAndCount();

      return { documents, total };
    } catch (error) {
      this.logger.error(`获取用户文档列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取文档详情
   */
  async getDocumentById(documentId: string, userId?: string): Promise<UserDocument> {
    try {
      const query = this.userDocumentRepository.createQueryBuilder('doc')
        .where('doc.id = :documentId', { documentId })
        .andWhere('doc.deletedAt IS NULL');

      // 如果提供了userId，检查权限
      if (userId) {
        query.andWhere('(doc.userId = :userId OR doc.isPublic = true)', { userId });
      }

      const document = await query.getOne();

      if (!document) {
        throw new NotFoundException(`文档不存在或无权访问: ${documentId}`);
      }

      return document;
    } catch (error) {
      this.logger.error(`获取文档详情失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 更新文档信息
   */
  async updateDocument(
    documentId: string,
    userId: string,
    updateDto: UserDocumentUpdateDto,
  ): Promise<UserDocument> {
    try {
      const document = await this.userDocumentRepository
        .createQueryBuilder('doc')
        .where('doc.id = :documentId', { documentId })
        .andWhere('doc.userId = :userId', { userId })
        .andWhere('doc.deletedAt IS NULL')
        .getOne();

      if (!document) {
        throw new NotFoundException(`文档不存在或无权修改: ${documentId}`);
      }

      // 更新字段
      if (updateDto.title !== undefined) {
        document.title = updateDto.title;
      }
      if (updateDto.description !== undefined) {
        document.description = updateDto.description;
      }
      if (updateDto.reportType !== undefined) {
        document.reportType = updateDto.reportType;
      }
      if (updateDto.isPublic !== undefined) {
        document.isPublic = updateDto.isPublic;
      }

      return await this.userDocumentRepository.save(document);
    } catch (error) {
      this.logger.error(`更新文档失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 删除文档（软删除）
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    try {
      const document = await this.userDocumentRepository
        .createQueryBuilder('doc')
        .where('doc.id = :documentId', { documentId })
        .andWhere('doc.userId = :userId', { userId })
        .andWhere('doc.deletedAt IS NULL')
        .getOne();

      if (!document) {
        throw new NotFoundException(`文档不存在或无权删除: ${documentId}`);
      }

      document.deletedAt = new Date();
      await this.userDocumentRepository.save(document);
    } catch (error) {
      this.logger.error(`删除文档失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 生成自定义报告
   */
  async generateCustomReport(
    userId: string,
    generationDto: CustomReportGenerationDto,
  ): Promise<Report> {
    try {
      // 获取文档
      const document = await this.getDocumentById(generationDto.documentId, userId);

      // 检查文档内容是否已提取
      if (document.extractionStatus !== 'completed' || !document.content) {
        throw new BadRequestException('文档内容尚未提取完成，请稍后再试');
      }

      // 生成报告标题
      const reportTitle = generationDto.title ||
        `${this.getReportTypeLabel(generationDto.reportType)} - ${document.title}`;

      // 创建报告记录
      const report = this.reportRepository.create({
        tenantId: 'default-tenant', // 用户文档不绑定租户，使用默认租户
        type: ReportType.CUSTOM,
        title: reportTitle,
        startDate: new Date(),
        endDate: new Date(),
        content: {},
        status: ReportStatus.GENERATING,
        generatedBy: userId,
      });

      const savedReport = await this.reportRepository.save(report);

      // 异步生成报告内容
      this.generateReportContent(savedReport.id, document, generationDto)
        .catch(error => {
          this.logger.error(`生成报告内容失败: ${error.message}`, error.stack);
          // 更新报告状态为失败
          this.updateReportStatus(savedReport.id, ReportStatus.FAILED, error.message);
        });

      // 更新文档的生成报告ID
      document.generatedReportId = savedReport.id;
      await this.userDocumentRepository.save(document);

      return savedReport;
    } catch (error) {
      this.logger.error(`生成自定义报告失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 提取文档内容（异步）
   */
  private async extractDocumentContent(documentId: string): Promise<void> {
    try {
      const document = await this.userDocumentRepository
        .createQueryBuilder('doc')
        .where('doc.id = :documentId', { documentId })
        .andWhere('doc.deletedAt IS NULL')
        .getOne();

      if (!document) {
        throw new NotFoundException(`文档不存在: ${documentId}`);
      }

      // 更新状态为处理中
      document.extractionStatus = 'processing';
      await this.userDocumentRepository.save(document);

      // 实际应用中应该根据文件类型提取文本内容
      // 这里简化处理，模拟提取过程
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟提取的内容
      document.content = `这是从文档 "${document.title}" 中提取的模拟内容。实际应用中应该使用相应的库提取文本。`;
      document.summary = `这是文档 "${document.title}" 的摘要。`;
      document.keywords = ['模拟', '文档', '内容'];
      document.extractionStatus = 'completed';

      await this.userDocumentRepository.save(document);
    } catch (error) {
      this.logger.error(`提取文档内容失败: ${error.message}`, error.stack);

      // 更新状态为失败
      const document = await this.userDocumentRepository.findOne({
        where: { id: documentId },
      });
      if (document) {
        document.extractionStatus = 'failed';
        document.extractionError = error.message;
        await this.userDocumentRepository.save(document);
      }
    }
  }

  /**
   * 生成报告内容（异步）
   */
  private async generateReportContent(
    reportId: string,
    document: UserDocument,
    generationDto: CustomReportGenerationDto,
  ): Promise<void> {
    try {
      const report = await this.reportRepository.findOne({
        where: { id: reportId },
      });

      if (!report) {
        throw new NotFoundException(`报告不存在: ${reportId}`);
      }

      // 使用AI生成报告内容
      const prompt = this.buildReportPrompt(document, generationDto);
      const result = await this.geminiService.generateContent({
        prompt,
        platform: Platform.ANALYSIS,
        temperature: 0.7,
      });

      // 解析AI响应并生成报告结构
      const aiResponse = result.content?.content || '';
      const reportContent = this.parseAIResponseToReport(aiResponse, generationDto.reportType);

      // 更新报告
      report.content = reportContent.content;
      report.charts = reportContent.charts;
      report.analysis = reportContent.analysis;
      report.status = ReportStatus.COMPLETED;
      report.completedAt = new Date();

      await this.reportRepository.save(report);
    } catch (error) {
      this.logger.error(`生成报告内容失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 构建报告生成提示词
   */
  private buildReportPrompt(
    document: UserDocument,
    generationDto: CustomReportGenerationDto,
  ): string {
    const reportTypeLabel = this.getReportTypeLabel(generationDto.reportType);

    let prompt = `请基于以下文档内容，生成一份${reportTypeLabel}。\n\n`;
    prompt += `文档标题: ${document.title}\n`;

    if (document.description) {
      prompt += `文档描述: ${document.description}\n`;
    }

    prompt += `\n文档内容:\n${document.content}\n\n`;

    prompt += `请生成包含以下部分的报告:\n`;
    prompt += `1. 摘要 (Executive Summary)\n`;
    prompt += `2. 背景分析 (Background Analysis)\n`;
    prompt += `3. 主要发现 (Key Findings)\n`;
    prompt += `4. 建议和行动计划 (Recommendations & Action Plan)\n`;
    prompt += `5. 结论 (Conclusion)\n\n`;

    if (generationDto.customInstructions) {
      prompt += `额外要求: ${generationDto.customInstructions}\n`;
    }

    prompt += `请以JSON格式返回报告内容，包含以下字段:\n`;
    prompt += `- content: 报告正文内容（各章节的详细文本）\n`;
    prompt += `- charts: 建议的图表数据（如果有）\n`;
    prompt += `- analysis: 分析结论和建议\n`;

    return prompt;
  }

  /**
   * 解析AI响应生成报告结构
   */
  private parseAIResponseToReport(
    aiResponse: string,
    reportType: CustomReportType,
  ): { content: any; charts: any; analysis: string } {
    try {
      // 尝试解析JSON响应
      const parsedResponse = JSON.parse(aiResponse);
      return {
        content: parsedResponse.content || {},
        charts: parsedResponse.charts || {},
        analysis: parsedResponse.analysis || 'AI生成的分析内容',
      };
    } catch (error) {
      // 如果AI响应不是JSON，创建默认报告结构
      this.logger.warn(`AI响应不是有效的JSON，创建默认报告结构: ${error.message}`);

      return {
        content: {
          summary: `这是基于上传文档生成的${this.getReportTypeLabel(reportType)}。`,
          background: '背景分析内容将在这里展示。',
          findings: '主要发现将在这里展示。',
          recommendations: '建议和行动计划将在这里展示。',
          conclusion: '结论将在这里展示。',
        },
        charts: {
          charts: [
            {
              type: 'bar',
              title: '关键数据分布',
              labels: ['项目1', '项目2', '项目3'],
              data: [65, 59, 80],
            },
          ],
        },
        analysis: '基于文档内容，AI生成了初步的分析结论和建议。在实际应用中，AI会提供更详细的分析。',
      };
    }
  }

  /**
   * 更新报告状态
   */
  private async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    errorMessage?: string,
  ): Promise<void> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });

    if (report) {
      report.status = status;
      if (status === ReportStatus.FAILED && errorMessage) {
        report.content = { error: errorMessage };
      } else if (status === ReportStatus.COMPLETED) {
        report.completedAt = new Date();
      }
      await this.reportRepository.save(report);
    }
  }

  /**
   * 根据MIME类型和文件名确定文件类型
   */
  private determineFileType(mimeType: string, originalName: string): UserDocumentFileType {
    const extension = originalName.toLowerCase().split('.').pop();

    if (mimeType.includes('word') || mimeType.includes('officedocument.wordprocessingml') ||
        extension === 'doc' || extension === 'docx') {
      return UserDocumentFileType.WORD;
    } else if (mimeType.includes('pdf') || extension === 'pdf') {
      return UserDocumentFileType.PDF;
    } else if (mimeType.includes('excel') || mimeType.includes('officedocument.spreadsheetml') ||
               extension === 'xls' || extension === 'xlsx') {
      return UserDocumentFileType.EXCEL;
    } else if (mimeType.includes('powerpoint') || mimeType.includes('officedocument.presentationml') ||
               extension === 'ppt' || extension === 'pptx') {
      return UserDocumentFileType.PPT;
    } else if (extension === 'md' || extension === 'markdown') {
      return UserDocumentFileType.MARKDOWN;
    } else if (mimeType.includes('text') || extension === 'txt') {
      return UserDocumentFileType.TEXT;
    } else {
      return UserDocumentFileType.OTHER;
    }
  }

  /**
   * 生成文件URL（模拟）
   */
  private generateFileUrl(userId: string, file: Express.Multer.File): string {
    // 实际应用中应上传到OSS并返回URL
    // 这里返回模拟URL
    const timestamp = Date.now();
    const extension = file.originalname.split('.').pop();
    return `/uploads/user-documents/${userId}/${timestamp}.${extension}`;
  }

  /**
   * 获取报告类型标签
   */
  private getReportTypeLabel(reportType: CustomReportType): string {
    const labels: Record<CustomReportType, string> = {
      [CustomReportType.WORK_SUMMARY]: '工作总结',
      [CustomReportType.ACTIVITY_REVIEW]: '活动复盘',
      [CustomReportType.RESEARCH_ANALYSIS]: '调研分析',
      [CustomReportType.POLICY_INTERPRETATION]: '政策解读',
      [CustomReportType.OTHER]: '自定义报告',
    };
    return labels[reportType] || '自定义报告';
  }
}