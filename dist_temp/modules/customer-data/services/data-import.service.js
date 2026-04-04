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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataImportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const data_import_status_enum_1 = require("../../../shared/enums/data-import-status.enum");
const source_type_enum_1 = require("../../../shared/enums/source-type.enum");
const data_import_job_repository_1 = require("../../../shared/repositories/data-import-job.repository");
const customer_profile_repository_1 = require("../../../shared/repositories/customer-profile.repository");
let DataImportService = class DataImportService {
    dataImportJobRepository;
    customerProfileRepository;
    constructor(dataImportJobRepository, customerProfileRepository) {
        this.dataImportJobRepository = dataImportJobRepository;
        this.customerProfileRepository = customerProfileRepository;
    }
    async createImportJob(customerProfileId, sourceType, filePath, originalFilename, recordCount, notes) {
        const profile = await this.customerProfileRepository.findOne({
            where: { id: customerProfileId },
        });
        if (!profile) {
            throw new common_1.NotFoundException(`Customer profile ${customerProfileId} not found`);
        }
        const importJob = this.dataImportJobRepository.create({
            customerProfileId,
            sourceType,
            filePath: filePath ?? null,
            originalFilename: originalFilename ?? `import_${Date.now()}`,
            recordCount: recordCount || 0,
            status: data_import_status_enum_1.DataImportStatus.PENDING,
            notes: notes || '',
        });
        return await this.dataImportJobRepository.save(importJob);
    }
    async getImportJob(id) {
        const importJob = await this.dataImportJobRepository.findOne({
            where: { id },
            relations: ['customerProfile'],
        });
        if (!importJob) {
            throw new common_1.NotFoundException(`Import job ${id} not found`);
        }
        return importJob;
    }
    async getImportJobsByProfile(customerProfileId) {
        return await this.dataImportJobRepository.find({
            where: { customerProfileId },
            order: { createdAt: 'DESC' },
        });
    }
    async processImportFile(importJobId, fileContent) {
        const importJob = await this.getImportJob(importJobId);
        if (importJob.status !== data_import_status_enum_1.DataImportStatus.PENDING) {
            throw new common_1.BadRequestException(`Import job ${importJobId} is not in PENDING status`);
        }
        importJob.status = data_import_status_enum_1.DataImportStatus.PROCESSING;
        importJob.startedAt = new Date();
        await this.dataImportJobRepository.save(importJob);
        const mockProcessingResult = await this.mockFileProcessing(importJob, fileContent);
        importJob.status = data_import_status_enum_1.DataImportStatus.SUCCESS;
        importJob.completedAt = new Date();
        importJob.recordCount = mockProcessingResult.recordCount;
        importJob.successCount = mockProcessingResult.successCount;
        importJob.failedCount = mockProcessingResult.failedCount;
        importJob.validationErrors = mockProcessingResult.validationErrors;
        importJob.summary = mockProcessingResult.summary;
        return await this.dataImportJobRepository.save(importJob);
    }
    async mockFileProcessing(importJob, fileContent) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        let recordCount = 0;
        let successCount = 0;
        let failedCount = 0;
        const validationErrors = [];
        let summary = {};
        switch (importJob.sourceType) {
            case source_type_enum_1.SourceType.CSV:
                recordCount = 4500;
                successCount = 4450;
                failedCount = 50;
                validationErrors.push({
                    row: 123,
                    field: 'email',
                    error: 'Invalid email format',
                    value: 'not-an-email',
                }, {
                    row: 456,
                    field: 'age',
                    error: 'Age must be positive number',
                    value: -5,
                }, {
                    row: 789,
                    field: 'phone',
                    error: 'Missing required field',
                    value: null,
                });
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
            case source_type_enum_1.SourceType.EXCEL:
                recordCount = 3200;
                successCount = 3185;
                failedCount = 15;
                validationErrors.push({
                    row: 45,
                    field: 'total_spend',
                    error: 'Value exceeds reasonable range',
                    value: 9999999,
                }, {
                    row: 128,
                    field: 'gender',
                    error: 'Invalid gender code',
                    value: 'X',
                });
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
            case source_type_enum_1.SourceType.API:
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
            case source_type_enum_1.SourceType.DATABASE:
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
    async cancelImportJob(importJobId) {
        const importJob = await this.getImportJob(importJobId);
        if (importJob.status === data_import_status_enum_1.DataImportStatus.SUCCESS) {
            throw new common_1.BadRequestException(`Cannot cancel completed import job ${importJobId}`);
        }
        if (importJob.status === data_import_status_enum_1.DataImportStatus.FAILED) {
            throw new common_1.BadRequestException(`Import job ${importJobId} is already failed`);
        }
        importJob.status = data_import_status_enum_1.DataImportStatus.CANCELLED;
        importJob.completedAt = new Date();
        importJob.notes = `Cancelled at ${new Date().toISOString()}`;
        return await this.dataImportJobRepository.save(importJob);
    }
    async retryImportJob(importJobId) {
        const importJob = await this.getImportJob(importJobId);
        if (importJob.status !== data_import_status_enum_1.DataImportStatus.FAILED) {
            throw new common_1.BadRequestException(`Cannot retry import job ${importJobId} with status ${importJob.status}`);
        }
        importJob.status = data_import_status_enum_1.DataImportStatus.PENDING;
        importJob.startedAt = null;
        importJob.completedAt = null;
        importJob.successCount = 0;
        importJob.failedCount = 0;
        importJob.validationErrors = [];
        importJob.summary = {};
        return await this.dataImportJobRepository.save(importJob);
    }
    async getImportStats(customerProfileId) {
        const importJobs = await this.getImportJobsByProfile(customerProfileId);
        const totalJobs = importJobs.length;
        const completedJobs = importJobs.filter((job) => job.status === data_import_status_enum_1.DataImportStatus.SUCCESS).length;
        const pendingJobs = importJobs.filter((job) => job.status === data_import_status_enum_1.DataImportStatus.PENDING).length;
        const processingJobs = importJobs.filter((job) => job.status === data_import_status_enum_1.DataImportStatus.PROCESSING).length;
        const failedJobs = importJobs.filter((job) => job.status === data_import_status_enum_1.DataImportStatus.FAILED).length;
        const totalRecords = importJobs.reduce((sum, job) => sum + job.recordCount, 0);
        const totalProcessed = importJobs.reduce((sum, job) => sum + (job.successCount || 0), 0);
        const totalFailed = importJobs.reduce((sum, job) => sum + (job.failedCount || 0), 0);
        const successRate = totalProcessed > 0
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
    async validateImportData(importJobId, validationRules) {
        const importJob = await this.getImportJob(importJobId);
        const issues = [
            {
                severity: 'warning',
                message: 'Missing required field: email',
                field: 'email',
                row: 123,
            },
            {
                severity: 'error',
                message: 'Invalid date format in birth_date field',
                field: 'birth_date',
                row: 456,
            },
            {
                severity: 'info',
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
};
exports.DataImportService = DataImportService;
exports.DataImportService = DataImportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(data_import_job_repository_1.DataImportJobRepository)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_profile_repository_1.CustomerProfileRepository)),
    __metadata("design:paramtypes", [data_import_job_repository_1.DataImportJobRepository,
        customer_profile_repository_1.CustomerProfileRepository])
], DataImportService);
//# sourceMappingURL=data-import.service.js.map