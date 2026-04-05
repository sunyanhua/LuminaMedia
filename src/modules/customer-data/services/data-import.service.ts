import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataImportJob } from '../../../entities/data-import-job.entity';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { DataImportStatus } from '../../../shared/enums/data-import-status.enum';
import { SourceType } from '../../../shared/enums/source-type.enum';
import { DataImportJobRepository } from '../../../shared/repositories/data-import-job.repository';
import { CustomerProfileRepository } from '../../../shared/repositories/customer-profile.repository';

@Injectable()
export class DataImportService {
  constructor(
    @InjectRepository(DataImportJobRepository)
    private dataImportJobRepository: DataImportJobRepository,
    @InjectRepository(CustomerProfileRepository)
    private customerProfileRepository: CustomerProfileRepository,
  ) {}

  /**
   * 创建数据导入任务
   */
  async createImportJob(
    customerProfileId: string,
    sourceType: SourceType,
    filePath?: string,
    originalFilename?: string,
    recordCount?: number,
    notes?: string,
  ): Promise<DataImportJob> {
    // 验证客户档案是否存在
    const profile = await this.customerProfileRepository.findOne({
      where: { id: customerProfileId },
    });

    if (!profile) {
      throw new NotFoundException(
        `Customer profile ${customerProfileId} not found`,
      );
    }

    const importJob = this.dataImportJobRepository.create({
      customerProfileId,
      sourceType,
      filePath: filePath ?? null,
      originalFilename: originalFilename ?? `import_${Date.now()}`,
      recordCount: recordCount || 0,
      status: DataImportStatus.PENDING,
      notes: notes || '',
    });

    return await this.dataImportJobRepository.save(importJob);
  }

  /**
   * 获取导入任务详情
   */
  async getImportJob(id: string): Promise<DataImportJob> {
    const importJob = await this.dataImportJobRepository.findOne({
      where: { id },
      relations: ['customerProfile'],
    });

    if (!importJob) {
      throw new NotFoundException(`Import job ${id} not found`);
    }

    return importJob;
  }

  /**
   * 获取客户档案的所有导入任务（支持分页）
   */
  async getImportJobsByProfile(
    customerProfileId: string,
    page: number = 1,
    limit: number = 100,
  ): Promise<{ data: DataImportJob[]; total: number }> {
    const [data, total] = await this.dataImportJobRepository.findAndCount({
      where: { customerProfileId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  /**
   * 模拟处理上传的文件（CSV/Excel）
   * 在实际实现中，这里会解析文件内容并验证数据
   */
  async processImportFile(
    importJobId: string,
    fileContent?: string,
  ): Promise<DataImportJob> {
    const importJob = await this.getImportJob(importJobId);

    if (importJob.status !== DataImportStatus.PENDING) {
      throw new BadRequestException(
        `Import job ${importJobId} is not in PENDING status`,
      );
    }

    // 更新状态为处理中
    importJob.status = DataImportStatus.PROCESSING;
    importJob.startedAt = new Date();
    await this.dataImportJobRepository.save(importJob);

    // 模拟文件处理（实际实现会解析CSV/Excel文件）
    // 这里我们生成模拟的处理结果
    const mockProcessingResult = await this.mockFileProcessing(
      importJob,
      fileContent,
    );

    // 更新任务状态为完成
    importJob.status = DataImportStatus.SUCCESS;
    importJob.completedAt = new Date();
    importJob.recordCount = mockProcessingResult.recordCount;
    importJob.successCount = mockProcessingResult.successCount;
    importJob.failedCount = mockProcessingResult.failedCount;
    importJob.validationErrors = mockProcessingResult.validationErrors;
    importJob.summary = mockProcessingResult.summary;

    return await this.dataImportJobRepository.save(importJob);
  }

  /**
   * 模拟文件处理逻辑
   */
  private async mockFileProcessing(
    importJob: DataImportJob,
    fileContent?: string,
  ): Promise<{
    recordCount: number;
    successCount: number;
    failedCount: number;
    validationErrors: Record<string, any>[];
    summary: Record<string, any>;
  }> {
    // 模拟处理时间
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 根据文件类型生成不同的模拟结果
    let recordCount = 0;
    let successCount = 0;
    let failedCount = 0;
    const validationErrors: Record<string, any>[] = [];
    let summary: Record<string, any> = {};

    switch (importJob.sourceType) {
      case SourceType.CSV:
        recordCount = 4500;
        successCount = 4450;
        failedCount = 50;
        validationErrors.push(
          {
            row: 123,
            field: 'email',
            error: 'Invalid email format',
            value: 'not-an-email',
          },
          {
            row: 456,
            field: 'age',
            error: 'Age must be positive number',
            value: -5,
          },
          {
            row: 789,
            field: 'phone',
            error: 'Missing required field',
            value: null,
          },
        );
        summary = {
          fileType: 'CSV',
          columnsDetected: [
            'customer_id',
            'name',
            'email',
            'phone',
            'age',
            'gender',
            'total_spend',
          ],
          dataRange: {
            startDate: '2024-01-01',
            endDate: '2024-03-31',
          },
          qualityScore: 98.9,
        };
        break;

      case SourceType.EXCEL:
        recordCount = 3200;
        successCount = 3185;
        failedCount = 15;
        validationErrors.push(
          {
            row: 45,
            field: 'total_spend',
            error: 'Value exceeds reasonable range',
            value: 9999999,
          },
          {
            row: 128,
            field: 'gender',
            error: 'Invalid gender code',
            value: 'X',
          },
        );
        summary = {
          fileType: 'Excel',
          sheets: ['Sheet1', 'Sheet2'],
          columnsDetected: [
            '会员号',
            '姓名',
            '等级',
            '累计消费',
            '最近消费时间',
            '积分余额',
          ],
          dataRange: {
            startDate: '2023-06-01',
            endDate: '2024-05-31',
          },
          qualityScore: 99.5,
        };
        break;

      case SourceType.API:
        recordCount = 1200;
        successCount = 1200;
        failedCount = 0;
        summary = {
          source: 'Parking System API',
          apiEndpoint: 'https://api.parking-system.com/v1/records',
          timeRange: '2024-04-01T00:00:00Z to 2024-04-30T23:59:59Z',
          fields: [
            'plate_number',
            'entry_time',
            'exit_time',
            'duration',
            'fee',
          ],
          qualityScore: 100,
        };
        break;

      case SourceType.DATABASE:
        recordCount = 8500;
        successCount = 8500;
        failedCount = 0;
        summary = {
          source: 'Internal CRM Database',
          tables: ['customers', 'transactions', 'memberships'],
          recordTypes: [
            'customer_profile',
            'purchase_history',
            'service_records',
          ],
          qualityScore: 99.8,
        };
        break;

      default:
        recordCount = 1000;
        successCount = 980;
        failedCount = 20;
        summary = {
          fileType: 'Unknown',
          note: 'Default mock processing applied',
          qualityScore: 95.0,
        };
    }

    // 如果提供了文件内容，可以添加一些基于内容的分析（模拟）
    if (fileContent) {
      summary.contentLength = fileContent.length;
      summary.lines = fileContent.split('\n').length;
    }

    return {
      recordCount,
      successCount,
      failedCount,
      validationErrors,
      summary,
    };
  }

  /**
   * 取消导入任务
   */
  async cancelImportJob(importJobId: string): Promise<DataImportJob> {
    const importJob = await this.getImportJob(importJobId);

    if (importJob.status === DataImportStatus.SUCCESS) {
      throw new BadRequestException(
        `Cannot cancel completed import job ${importJobId}`,
      );
    }

    if (importJob.status === DataImportStatus.FAILED) {
      throw new BadRequestException(
        `Import job ${importJobId} is already failed`,
      );
    }

    importJob.status = DataImportStatus.CANCELLED;
    importJob.completedAt = new Date();
    importJob.notes = `Cancelled at ${new Date().toISOString()}`;

    return await this.dataImportJobRepository.save(importJob);
  }

  /**
   * 重试失败的导入任务
   */
  async retryImportJob(importJobId: string): Promise<DataImportJob> {
    const importJob = await this.getImportJob(importJobId);

    if (importJob.status !== DataImportStatus.FAILED) {
      throw new BadRequestException(
        `Cannot retry import job ${importJobId} with status ${importJob.status}`,
      );
    }

    // 重置任务状态为待处理
    importJob.status = DataImportStatus.PENDING;
    importJob.startedAt = null;
    importJob.completedAt = null;
    importJob.successCount = 0;
    importJob.failedCount = 0;
    importJob.validationErrors = [];
    importJob.summary = {};

    return await this.dataImportJobRepository.save(importJob);
  }

  /**
   * 获取导入任务统计信息
   */
  async getImportStats(
    customerProfileId: string,
  ): Promise<Record<string, any>> {
    const { data: importJobs } = await this.getImportJobsByProfile(customerProfileId, 1, 1000); // 获取最多1000条记录用于统计

    const totalJobs = importJobs.length;
    const completedJobs = importJobs.filter(
      (job) => job.status === DataImportStatus.SUCCESS,
    ).length;
    const pendingJobs = importJobs.filter(
      (job) => job.status === DataImportStatus.PENDING,
    ).length;
    const processingJobs = importJobs.filter(
      (job) => job.status === DataImportStatus.PROCESSING,
    ).length;
    const failedJobs = importJobs.filter(
      (job) => job.status === DataImportStatus.FAILED,
    ).length;

    const totalRecords = importJobs.reduce(
      (sum, job) => sum + job.recordCount,
      0,
    );
    const totalProcessed = importJobs.reduce(
      (sum, job) => sum + (job.successCount || 0),
      0,
    );
    const totalFailed = importJobs.reduce(
      (sum, job) => sum + (job.failedCount || 0),
      0,
    );

    const successRate =
      totalProcessed > 0
        ? (((totalProcessed - totalFailed) / totalProcessed) * 100).toFixed(2)
        : '0.00';

    return {
      totalJobs,
      completedJobs,
      pendingJobs,
      processingJobs,
      failedJobs,
      totalRecords,
      totalProcessed,
      totalFailed,
      successRate: `${successRate}%`,
      lastImport: importJobs.length > 0 ? importJobs[0].createdAt : null,
    };
  }

  /**
   * 验证导入数据（模拟实现）
   */
  async validateImportData(
    importJobId: string,
    validationRules?: Record<string, any>,
  ): Promise<{
    isValid: boolean;
    issues: Array<{
      severity: 'error' | 'warning' | 'info';
      message: string;
      field?: string;
      row?: number;
    }>;
    summary: Record<string, any>;
  }> {
    const importJob = await this.getImportJob(importJobId);

    // 模拟验证逻辑
    const issues = [
      {
        severity: 'warning' as const,
        message: 'Missing required field: email',
        field: 'email',
        row: 123,
      },
      {
        severity: 'error' as const,
        message: 'Invalid date format in birth_date field',
        field: 'birth_date',
        row: 456,
      },
      {
        severity: 'info' as const,
        message: 'Duplicate customer IDs detected',
        field: 'customer_id',
      },
    ];

    const summary = {
      totalRecordsChecked: importJob.recordCount || 1000,
      validationRulesApplied: validationRules || { basic: true },
      dataQualityScore: 92.5,
      completeness: 98.2,
      accuracy: 95.8,
      consistency: 96.3,
    };

    const hasErrors = issues.some((issue) => issue.severity === 'error');

    return {
      isValid: !hasErrors,
      issues,
      summary,
    };
  }
}
