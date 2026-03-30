import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RegionLevel {
  COUNTRY = 'country',
  PROVINCE = 'province',
  CITY = 'city',
  DISTRICT = 'district',
}

export enum RegionType {
  URBAN = 'urban', // 城市
  RURAL = 'rural', // 乡村
  SUBURBAN = 'suburban', // 郊区
  INDUSTRIAL = 'industrial', // 工业区
  COMMERCIAL = 'commercial', // 商业区
  RESIDENTIAL = 'residential', // 住宅区
}

@Entity('geo_regions')
@Index(['tenantId', 'regionCode'], { unique: true })
@Index(['tenantId', 'parentId'])
@Index(['tenantId', 'regionLevel'])
@Index(['tenantId', 'isActive'])
export class GeoRegion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  tenantId: string;

  @Column({ type: 'varchar', length: 50 })
  regionCode: string; // 行政区划代码

  @Column({ type: 'varchar', length: 100 })
  name: string; // 地区名称

  @Column({ type: 'varchar', length: 100, nullable: true })
  englishName: string; // 英文名称

  @Column({ type: 'varchar', length: 50 })
  regionLevel: RegionLevel; // 地区级别

  @Column({ type: 'varchar', length: 50, nullable: true })
  regionType: RegionType; // 地区类型

  @Column({ type: 'varchar', length: 36, nullable: true })
  parentId: string; // 父级地区ID

  @Column({ type: 'varchar', length: 100, nullable: true })
  parentName: string; // 父级地区名称

  @Column({ type: 'float', nullable: true })
  latitude: number; // 纬度

  @Column({ type: 'float', nullable: true })
  longitude: number; // 经度

  @Column({ type: 'json', nullable: true })
  boundingBox: {
    north: number;
    south: number;
    east: number;
    west: number;
  }; // 地理边界框

  @Column({ type: 'int', nullable: true })
  population: number; // 人口数量

  @Column({ type: 'float', nullable: true })
  area: number; // 面积（平方公里）

  @Column({ type: 'float', nullable: true })
  gdp: number; // GDP（亿元）

  @Column({ type: 'float', nullable: true })
  gdpPerCapita: number; // 人均GDP

  @Column({ type: 'json', nullable: true })
  economicIndicators: {
    primaryIndustry: number; // 第一产业占比
    secondaryIndustry: number; // 第二产业占比
    tertiaryIndustry: number; // 第三产业占比
    growthRate: number; // 经济增长率
    inflationRate: number; // 通货膨胀率
    unemploymentRate: number; // 失业率
  };

  @Column({ type: 'json', nullable: true })
  demographicData: {
    ageDistribution: Record<string, number>; // 年龄分布
    genderRatio: number; // 性别比例（女性/男性）
    educationLevel: Record<string, number>; // 教育水平分布
    householdIncome: Record<string, number>; // 家庭收入分布
    urbanizationRate: number; // 城镇化率
  };

  @Column({ type: 'json', nullable: true })
  culturalData: {
    dominantLanguage: string; // 主要语言
    dialects: string[]; // 方言
    religions: string[]; // 宗教
    festivals: string[]; // 节日
    customs: string[]; // 习俗
    taboos: string[]; // 禁忌
  };

  @Column({ type: 'json', nullable: true })
  consumerBehavior: {
    averageSpending: number; // 平均消费水平
    onlineShoppingRate: number; // 网络购物率
    mobilePaymentRate: number; // 移动支付率
    favoriteCategories: string[]; // 热门消费类别
    peakShoppingHours: string[]; // 购物高峰时段
    preferredChannels: string[]; // 偏好渠道
  };

  @Column({ type: 'json', nullable: true })
  digitalInfrastructure: {
    internetPenetration: number; // 互联网普及率
    smartphonePenetration: number; // 智能手机普及率
    socialMediaUsage: Record<string, number>; // 社交媒体使用率
    ecommercePlatforms: string[]; // 主要电商平台
    popularApps: string[]; // 热门应用
  };

  @Column({ type: 'json', nullable: true })
  competitors: {
    companyName: string; // 竞争对手名称
    industry: string; // 行业
    marketShare: number; // 市场份额
    strengths: string[]; // 优势
    weaknesses: string[]; // 劣势
    keyProducts: string[]; // 关键产品
  }[];

  @Column({ type: 'json', nullable: true })
  opportunities: {
    category: string; // 机会类别
    description: string; // 描述
    potentialValue: number; // 潜在价值
    implementationDifficulty: 'low' | 'medium' | 'high'; // 实施难度
    timeframe: string; // 时间框架
  }[];

  @Column({ type: 'float', nullable: true })
  competitionIntensity: number; // 竞争强度 (0-1)

  @Column({ type: 'json', nullable: true })
  entryBarriers: string[]; // 进入壁垒

  @Column({ type: 'float', nullable: true })
  marketConcentration: number; // 市场集中度 (0-1)

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // 是否活跃

  @Column({ type: 'timestamp', nullable: true })
  dataUpdatedAt: Date; // 数据更新时间

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;
}
