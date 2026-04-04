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
exports.CustomerProfileService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customer_profile_repository_1 = require("../../../shared/repositories/customer-profile.repository");
const data_import_job_repository_1 = require("../../../shared/repositories/data-import-job.repository");
const customer_segment_repository_1 = require("../../../shared/repositories/customer-segment.repository");
const customer_type_enum_1 = require("../../../shared/enums/customer-type.enum");
const industry_enum_1 = require("../../../shared/enums/industry.enum");
const data_import_status_enum_1 = require("../../../shared/enums/data-import-status.enum");
const source_type_enum_1 = require("../../../shared/enums/source-type.enum");
let CustomerProfileService = class CustomerProfileService {
    customerProfileRepository;
    dataImportJobRepository;
    customerSegmentRepository;
    constructor(customerProfileRepository, dataImportJobRepository, customerSegmentRepository) {
        this.customerProfileRepository = customerProfileRepository;
        this.dataImportJobRepository = dataImportJobRepository;
        this.customerSegmentRepository = customerSegmentRepository;
    }
    async createProfile(userId, customerName, customerType, industry, dataSources) {
        const profile = this.customerProfileRepository.create({
            userId,
            customerName,
            customerType,
            industry,
            dataSources: dataSources || {},
            profileData: {},
            behaviorInsights: {},
        });
        return await this.customerProfileRepository.save(profile);
    }
    async getProfile(id) {
        const profile = await this.customerProfileRepository.findOne({
            where: { id },
            relations: ['importJobs', 'segments', 'campaigns', 'strategies'],
        });
        if (!profile) {
            throw new common_1.NotFoundException(`Customer profile ${id} not found`);
        }
        return profile;
    }
    async getProfilesByUser(userId) {
        return await this.customerProfileRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async updateProfile(id, updates) {
        const profile = await this.getProfile(id);
        Object.assign(profile, updates);
        profile.updatedAt = new Date();
        return await this.customerProfileRepository.save(profile);
    }
    async deleteProfile(id) {
        const result = await this.customerProfileRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Customer profile ${id} not found`);
        }
    }
    async generateMallCustomerDemo(userId) {
        const profile = await this.createProfile(userId, 'XX购物中心客户数据', customer_type_enum_1.CustomerType.ENTERPRISE, industry_enum_1.Industry.RETAIL, {
            sources: ['POS系统', '会员系统', '停车系统', 'WiFi探针'],
            dataRange: '2024年1月-12月',
            totalCustomers: 15000,
        });
        const importJobs = await this.generateMockImportJobs(profile.id);
        const segments = await this.generateMockSegments(profile.id);
        const mockProfileData = this.generateMockProfileData();
        profile.profileData = mockProfileData;
        const behaviorInsights = this.generateMockBehaviorInsights();
        profile.behaviorInsights = behaviorInsights;
        await this.customerProfileRepository.save(profile);
        return {
            profile,
            importJobs,
            segments,
        };
    }
    async generateMockImportJobs(profileId) {
        const importJobs = [
            {
                sourceType: source_type_enum_1.SourceType.CSV,
                filePath: '/uploads/customer_data_2024_q1.csv',
                recordCount: 4500,
                status: data_import_status_enum_1.DataImportStatus.SUCCESS,
                notes: '第一季度客户消费数据',
            },
            {
                sourceType: source_type_enum_1.SourceType.CSV,
                filePath: '/uploads/customer_data_2024_q2.csv',
                recordCount: 5200,
                status: data_import_status_enum_1.DataImportStatus.SUCCESS,
                notes: '第二季度客户消费数据',
            },
            {
                sourceType: source_type_enum_1.SourceType.EXCEL,
                filePath: '/uploads/member_info_2024.xlsx',
                recordCount: 8500,
                status: data_import_status_enum_1.DataImportStatus.PROCESSING,
                notes: '会员信息表',
            },
            {
                sourceType: source_type_enum_1.SourceType.API,
                filePath: null,
                recordCount: 1200,
                status: data_import_status_enum_1.DataImportStatus.PENDING,
                notes: '停车场数据API导入',
            },
        ];
        const jobs = [];
        for (const jobData of importJobs) {
            const job = this.dataImportJobRepository.create({
                customerProfileId: profileId,
                ...jobData,
            });
            const savedJob = await this.dataImportJobRepository.save(job);
            jobs.push(savedJob);
        }
        return jobs;
    }
    async generateMockSegments(profileId) {
        const segments = [
            {
                segmentName: '高频高价值客户',
                criteria: {
                    monthlyVisits: { min: 8 },
                    averageSpend: { min: 500 },
                    memberLevel: ['钻石', '白金'],
                },
                memberCount: 1200,
                description: '每月到店8次以上，平均消费500元以上的高价值客户',
            },
            {
                segmentName: '年轻时尚族',
                criteria: {
                    ageRange: [18, 30],
                    interests: ['时尚', '美食', '娱乐'],
                    visitTime: ['周末', '晚上'],
                },
                memberCount: 3500,
                description: '18-30岁，追求时尚和娱乐的年轻客户群体',
            },
            {
                segmentName: '家庭消费者',
                criteria: {
                    familySize: { min: 3 },
                    purchaseCategories: ['母婴', '家居', '食品'],
                    visitTime: ['周末下午'],
                },
                memberCount: 4200,
                description: '以家庭为单位的消费群体，注重生活品质',
            },
            {
                segmentName: '商务人士',
                criteria: {
                    occupation: ['白领', '企业家'],
                    visitTime: ['工作日午餐', '工作日下班后'],
                    spendPattern: '稳定',
                },
                memberCount: 1800,
                description: '工作日到店的商务人士，消费稳定',
            },
            {
                segmentName: '潜在流失客户',
                criteria: {
                    lastVisitDays: { min: 60 },
                    engagementScore: { max: 30 },
                },
                memberCount: 2300,
                description: '超过60天未到店，参与度低的潜在流失客户',
            },
        ];
        const segmentEntities = [];
        for (const segmentData of segments) {
            const segment = this.customerSegmentRepository.create({
                customerProfileId: profileId,
                ...segmentData,
            });
            const savedSegment = await this.customerSegmentRepository.save(segment);
            segmentEntities.push(savedSegment);
        }
        return segmentEntities;
    }
    generateMockProfileData() {
        return {
            demographic: {
                totalCustomers: 15000,
                genderDistribution: {
                    male: 42,
                    female: 58,
                },
                ageDistribution: {
                    '18-25': 22,
                    '26-35': 35,
                    '36-45': 28,
                    '46-55': 12,
                    '56+': 3,
                },
                locationDistribution: {
                    '5km内': 65,
                    '5-10km': 25,
                    '10km+': 10,
                },
            },
            consumption: {
                averageMonthlySpend: 320,
                topCategories: [
                    { category: '餐饮', spend: 45, frequency: 3.2 },
                    { category: '服饰', spend: 28, frequency: 0.8 },
                    { category: '娱乐', spend: 15, frequency: 1.5 },
                    { category: '家居', spend: 8, frequency: 0.3 },
                    { category: '其他', spend: 4, frequency: 0.5 },
                ],
                paymentMethods: {
                    mobilePay: 68,
                    creditCard: 22,
                    cash: 8,
                    other: 2,
                },
            },
            behavior: {
                averageVisitFrequency: 2.8,
                averageStayDuration: 2.1,
                peakHours: ['11:00-13:00', '18:00-20:00'],
                peakDays: ['周六', '周日'],
            },
            loyalty: {
                memberPenetration: 72,
                averageMemberTenure: 18,
                retentionRate: {
                    '1个月': 85,
                    '3个月': 72,
                    '6个月': 58,
                    '12个月': 42,
                },
            },
        };
    }
    generateMockBehaviorInsights() {
        return {
            keyInsights: [
                '年轻客户（18-35岁）占总客户数的57%，是消费主力',
                '周末客流量是工作日的2.3倍，但工作日客单价更高',
                '移动支付占比达68%，数字化消费习惯明显',
                '餐饮消费占比最高（45%），但服饰类消费频率低、客单价高',
                '5公里内客户占比65%，商圈辐射范围有限',
            ],
            opportunities: [
                '开发工作日营销活动，提升非周末时段客流',
                '加强服饰品类推广，提高购买频率',
                '拓展10公里外客户群体，扩大商圈辐射',
                '提升会员互动频率，改善长期留存率',
                '开发线上消费场景，延伸线下消费体验',
            ],
            recommendations: [
                {
                    priority: '高',
                    action: '推出工作日午餐套餐和happy hour活动',
                    expectedImpact: '提升工作日客流15-20%',
                },
                {
                    priority: '高',
                    action: '建立客户分层营销体系，针对高频高价值客户提供专属权益',
                    expectedImpact: '提升高价值客户留存率10%',
                },
                {
                    priority: '中',
                    action: '开展社区营销，拓展5-10公里客户群体',
                    expectedImpact: '扩大商圈覆盖，新增客户8-10%',
                },
                {
                    priority: '中',
                    action: '优化移动支付体验，整合会员积分系统',
                    expectedImpact: '提升会员活跃度12-15%',
                },
            ],
        };
    }
    async getProfileStats(profileId) {
        const profile = await this.getProfile(profileId);
        const importJobs = await this.dataImportJobRepository.find({
            where: { customerProfileId: profileId },
        });
        const segments = await this.customerSegmentRepository.find({
            where: { customerProfileId: profileId },
        });
        const totalRecords = importJobs.reduce((sum, job) => sum + job.recordCount, 0);
        const completedImports = importJobs.filter((job) => job.status === data_import_status_enum_1.DataImportStatus.SUCCESS).length;
        const totalSegments = segments.length;
        const totalMembers = segments.reduce((sum, segment) => sum + segment.memberCount, 0);
        return {
            profileName: profile.customerName,
            industry: profile.industry,
            totalImportJobs: importJobs.length,
            completedImports,
            totalRecords,
            totalSegments,
            totalMembers,
            dataFreshness: profile.updatedAt || profile.createdAt,
            insightsCount: Object.keys(profile.behaviorInsights || {}).length,
        };
    }
};
exports.CustomerProfileService = CustomerProfileService;
exports.CustomerProfileService = CustomerProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_profile_repository_1.CustomerProfileRepository)),
    __param(1, (0, typeorm_1.InjectRepository)(data_import_job_repository_1.DataImportJobRepository)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_segment_repository_1.CustomerSegmentRepository)),
    __metadata("design:paramtypes", [customer_profile_repository_1.CustomerProfileRepository,
        data_import_job_repository_1.DataImportJobRepository,
        customer_segment_repository_1.CustomerSegmentRepository])
], CustomerProfileService);
//# sourceMappingURL=customer-profile.service.js.map