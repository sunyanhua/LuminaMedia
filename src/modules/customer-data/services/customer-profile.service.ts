import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { DataImportJob } from '../../../entities/data-import-job.entity';
import { CustomerSegment } from '../../../entities/customer-segment.entity';
import { CustomerType } from '../../../shared/enums/customer-type.enum';
import { Industry } from '../../../shared/enums/industry.enum';
import { DataImportStatus } from '../../../shared/enums/data-import-status.enum';
import { SourceType } from '../../../shared/enums/source-type.enum';

@Injectable()
export class CustomerProfileService {
  constructor(
    @InjectRepository(CustomerProfile)
    private customerProfileRepository: Repository<CustomerProfile>,
    @InjectRepository(DataImportJob)
    private dataImportJobRepository: Repository<DataImportJob>,
    @InjectRepository(CustomerSegment)
    private customerSegmentRepository: Repository<CustomerSegment>,
  ) {}

  /**
   * 创建客户档案
   */
  async createProfile(
    userId: string,
    customerName: string,
    customerType: CustomerType,
    industry: Industry,
    dataSources?: Record<string, any>,
  ): Promise<CustomerProfile> {
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

  /**
   * 获取客户档案详情
   */
  async getProfile(id: string): Promise<CustomerProfile> {
    const profile = await this.customerProfileRepository.findOne({
      where: { id },
      relations: ['importJobs', 'segments', 'campaigns', 'strategies'],
    });

    if (!profile) {
      throw new NotFoundException(`Customer profile ${id} not found`);
    }

    return profile;
  }

  /**
   * 获取用户的客户档案列表
   */
  async getProfilesByUser(userId: string): Promise<CustomerProfile[]> {
    return await this.customerProfileRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 更新客户档案
   */
  async updateProfile(
    id: string,
    updates: Partial<{
      customerName: string;
      customerType: CustomerType;
      industry: Industry;
      dataSources: Record<string, any>;
      profileData: Record<string, any>;
      behaviorInsights: Record<string, any>;
    }>,
  ): Promise<CustomerProfile> {
    const profile = await this.getProfile(id);

    Object.assign(profile, updates);
    profile.updatedAt = new Date();

    return await this.customerProfileRepository.save(profile);
  }

  /**
   * 删除客户档案（级联删除相关数据）
   */
  async deleteProfile(id: string): Promise<void> {
    const result = await this.customerProfileRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Customer profile ${id} not found`);
    }
  }

  /**
   * 生成商场客户模拟数据
   * 创建模拟的客户档案、导入任务和客户分群
   */
  async generateMallCustomerDemo(userId: string): Promise<{
    profile: CustomerProfile;
    importJobs: DataImportJob[];
    segments: CustomerSegment[];
  }> {
    // 创建商场客户档案
    const profile = await this.createProfile(
      userId,
      'XX购物中心客户数据',
      CustomerType.ENTERPRISE,
      Industry.RETAIL,
      {
        sources: ['POS系统', '会员系统', '停车系统', 'WiFi探针'],
        dataRange: '2024年1月-12月',
        totalCustomers: 15000,
      },
    );

    // 创建模拟的数据导入任务
    const importJobs = await this.generateMockImportJobs(profile.id);

    // 创建模拟的客户分群
    const segments = await this.generateMockSegments(profile.id);

    // 生成模拟的客户档案数据（用户画像）
    const mockProfileData = this.generateMockProfileData();
    profile.profileData = mockProfileData;

    // 生成模拟的行为洞察
    const behaviorInsights = this.generateMockBehaviorInsights();
    profile.behaviorInsights = behaviorInsights;

    await this.customerProfileRepository.save(profile);

    return {
      profile,
      importJobs,
      segments,
    };
  }

  /**
   * 生成模拟的数据导入任务
   */
  private async generateMockImportJobs(
    profileId: string,
  ): Promise<DataImportJob[]> {
    const importJobs = [
      {
        sourceType: SourceType.CSV,
        filePath: '/uploads/customer_data_2024_q1.csv',
        recordCount: 4500,
        status: DataImportStatus.SUCCESS,
        notes: '第一季度客户消费数据',
      },
      {
        sourceType: SourceType.CSV,
        filePath: '/uploads/customer_data_2024_q2.csv',
        recordCount: 5200,
        status: DataImportStatus.SUCCESS,
        notes: '第二季度客户消费数据',
      },
      {
        sourceType: SourceType.EXCEL,
        filePath: '/uploads/member_info_2024.xlsx',
        recordCount: 8500,
        status: DataImportStatus.PROCESSING,
        notes: '会员信息表',
      },
      {
        sourceType: SourceType.API,
        filePath: null,
        recordCount: 1200,
        status: DataImportStatus.PENDING,
        notes: '停车场数据API导入',
      },
    ];

    const jobs: DataImportJob[] = [];
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

  /**
   * 生成模拟的客户分群
   */
  private async generateMockSegments(
    profileId: string,
  ): Promise<CustomerSegment[]> {
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

    const segmentEntities: CustomerSegment[] = [];
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

  /**
   * 生成模拟的客户档案数据（用户画像）
   */
  private generateMockProfileData(): Record<string, any> {
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
        averageVisitFrequency: 2.8, // 次/月
        averageStayDuration: 2.1, // 小时
        peakHours: ['11:00-13:00', '18:00-20:00'],
        peakDays: ['周六', '周日'],
      },
      loyalty: {
        memberPenetration: 72, // 会员渗透率
        averageMemberTenure: 18, // 平均会员时长（月）
        retentionRate: {
          '1个月': 85,
          '3个月': 72,
          '6个月': 58,
          '12个月': 42,
        },
      },
    };
  }

  /**
   * 生成模拟的行为洞察
   */
  private generateMockBehaviorInsights(): Record<string, any> {
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

  /**
   * 获取客户档案统计信息
   */
  async getProfileStats(profileId: string): Promise<Record<string, any>> {
    const profile = await this.getProfile(profileId);

    const importJobs = await this.dataImportJobRepository.find({
      where: { customerProfileId: profileId },
    });

    const segments = await this.customerSegmentRepository.find({
      where: { customerProfileId: profileId },
    });

    const totalRecords = importJobs.reduce(
      (sum, job) => sum + job.recordCount,
      0,
    );
    const completedImports = importJobs.filter(
      (job) => job.status === DataImportStatus.SUCCESS,
    ).length;
    const totalSegments = segments.length;
    const totalMembers = segments.reduce(
      (sum, segment) => sum + segment.memberCount,
      0,
    );

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
}
