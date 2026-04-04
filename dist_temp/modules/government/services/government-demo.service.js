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
exports.GovernmentDemoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const government_content_entity_1 = require("../../../entities/government-content.entity");
const social_interaction_entity_1 = require("../../../entities/social-interaction.entity");
const customer_profile_entity_1 = require("../../../entities/customer-profile.entity");
const marketing_campaign_repository_1 = require("../../../shared/repositories/marketing-campaign.repository");
const marketing_strategy_repository_1 = require("../../../shared/repositories/marketing-strategy.repository");
const content_draft_entity_1 = require("../../../entities/content-draft.entity");
const customer_type_enum_1 = require("../../../shared/enums/customer-type.enum");
const industry_enum_1 = require("../../../shared/enums/industry.enum");
let GovernmentDemoService = class GovernmentDemoService {
    governmentContentRepository;
    socialInteractionRepository;
    customerProfileRepository;
    marketingCampaignRepository;
    marketingStrategyRepository;
    contentDraftRepository;
    constructor(governmentContentRepository, socialInteractionRepository, customerProfileRepository, marketingCampaignRepository, marketingStrategyRepository, contentDraftRepository) {
        this.governmentContentRepository = governmentContentRepository;
        this.socialInteractionRepository = socialInteractionRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.marketingCampaignRepository = marketingCampaignRepository;
        this.marketingStrategyRepository = marketingStrategyRepository;
        this.contentDraftRepository = contentDraftRepository;
    }
    async generateGovernmentDemoData(tenantId) {
        await this.clearGovernmentDemoData(tenantId);
        await this.generateGovernmentContent(tenantId);
        await this.generateSocialMonitoringData(tenantId);
        await this.generateGeographicAnalysisData(tenantId);
        await this.generateGovernmentCustomerProfiles(tenantId);
    }
    async clearGovernmentDemoData(tenantId) {
        await this.governmentContentRepository.delete({
            tenantId,
            isPreset: false,
        });
        await this.socialInteractionRepository.delete({
            tenantId,
            isPreset: false,
        });
        await this.customerProfileRepository.delete({
            tenantId,
            isPreset: false,
        });
        const campaigns = await this.marketingCampaignRepository.find({
            where: { tenantId, isPreset: false }
        });
        await this.marketingCampaignRepository.remove(campaigns);
    }
    async generateGovernmentContent(tenantId) {
        const governmentContents = [
            {
                title: '关于加强数字化政务服务的通知',
                content: '为进一步推进政务服务数字化转型，提高办事效率，现就有关事项通知如下：1. 推进一体化政务服务平台建设；2. 完善电子证照共享机制；3. 强化数据安全保障。',
                category: '政策法规',
                publishDate: new Date('2026-03-15'),
                author: '市政府办公室',
                status: 'published',
                tags: ['数字化', '政务服务', '政策'],
                isPreset: false,
                demoScenario: 'government-demo',
                tenantId,
            },
            {
                title: '2026年第一季度财政预算执行情况',
                content: '本市2026年第一季度财政预算执行情况良好，收入同比增长8.5%，支出结构持续优化，民生领域投入占比达72%。',
                category: '财政公开',
                publishDate: new Date('2026-04-01'),
                author: '市财政局',
                status: 'published',
                tags: ['财政', '预算', '执行情况'],
                isPreset: false,
                demoScenario: 'government-demo',
                tenantId,
            },
            {
                title: '关于推进智慧城市建设项目的意见',
                content: '智慧城市建设是提升城市治理现代化水平的重要抓手，各地各部门要高度重视，统筹规划，分步实施，确保项目建设取得实效。',
                category: '发展规划',
                publishDate: new Date('2026-03-20'),
                author: '市发改委',
                status: 'published',
                tags: ['智慧城市', '规划', '建设'],
                isPreset: false,
                demoScenario: 'government-demo',
                tenantId,
            },
            {
                title: '环境保护专项行动实施方案',
                content: '为深入打好污染防治攻坚战，决定在全市开展环境保护专项行动，重点整治工业污染、生活污水和大气污染等问题。',
                category: '环境保护',
                publishDate: new Date('2026-03-25'),
                author: '市环保局',
                status: 'published',
                tags: ['环保', '污染治理', '专项行动'],
                isPreset: false,
                demoScenario: 'government-demo',
                tenantId,
            },
        ];
        await this.governmentContentRepository.save(governmentContents);
    }
    async generateSocialMonitoringData(tenantId) {
        const socialInteractions = [];
        for (let i = 0; i < 4; i++) {
            const baseDate = new Date('2026-03-15');
            baseDate.setDate(baseDate.getDate() + i * 3);
            for (let j = 0; j < 5; j++) {
                socialInteractions.push({
                    platform: 'weibo',
                    interactionType: 'comment',
                    targetId: (i + 1).toString(),
                    targetUrl: `/api/government-content/${i + 1}`,
                    content: this.generateRandomGovernmentComment(),
                    sourceUser: `user_${i}_${j}`,
                    timestamp: new Date(baseDate.getTime() + j * 3600000),
                    sentiment: Math.random() > 0.3 ? 'positive' : 'negative',
                    engagementCount: Math.floor(Math.random() * 10) + 1,
                    isPreset: false,
                    demoScenario: 'government-demo',
                    tenantId,
                });
            }
            for (let j = 0; j < 3; j++) {
                socialInteractions.push({
                    platform: 'weibo',
                    interactionType: 'share',
                    targetId: (i + 1).toString(),
                    targetUrl: `/api/government-content/${i + 1}`,
                    content: `转发: ${this.generateRandomGovernmentComment()}`,
                    sourceUser: `user_share_${i}_${j}`,
                    timestamp: new Date(baseDate.getTime() + (j + 5) * 3600000),
                    sentiment: 'neutral',
                    engagementCount: Math.floor(Math.random() * 5) + 1,
                    isPreset: false,
                    demoScenario: 'government-demo',
                    tenantId,
                });
            }
        }
        await this.socialInteractionRepository.save(socialInteractions);
    }
    async generateGeographicAnalysisData(tenantId) {
        const geographicLocations = [
            { city: '北京市', district: '朝阳区', longitude: 116.4074, latitude: 39.9042 },
            { city: '北京市', district: '海淀区', longitude: 116.3106, latitude: 39.9928 },
            { city: '上海市', district: '浦东新区', longitude: 121.4737, latitude: 31.2304 },
            { city: '深圳市', district: '南山区', longitude: 113.9440, latitude: 22.5447 },
            { city: '广州市', district: '天河区', longitude: 113.3215, latitude: 23.1196 },
        ];
        const geographicData = [];
        for (const location of geographicLocations) {
            for (let i = 0; i < 3; i++) {
                geographicData.push({
                    title: `${location.district}关于数字化政务服务的舆情`,
                    content: `在${location.city}${location.district}地区，市民对数字化政务服务的关注度为${Math.floor(Math.random() * 50) + 50}%，满意度为${Math.floor(Math.random() * 30) + 70}%。`,
                    category: '舆情地理分析',
                    publishDate: new Date('2026-04-01'),
                    author: '舆情分析系统',
                    status: 'published',
                    tags: ['舆情', '地理分析', location.district],
                    isPreset: false,
                    demoScenario: 'government-demo',
                    tenantId,
                });
            }
        }
        await this.governmentContentRepository.save(geographicData);
    }
    async generateGovernmentCustomerProfiles(tenantId) {
        const governmentProfiles = [
            {
                customerName: '政务工作者A',
                userId: 'gov-user-a',
                customerType: customer_type_enum_1.CustomerType.ENTERPRISE,
                industry: industry_enum_1.Industry.GOVERNMENT,
                dataSources: { type: 'gov-employee', department: '政务服务管理局' },
                profileData: { age: 35, gender: 'male', location: '北京市', interests: ['政策解读', '政务服务', '信息化建设'] },
                behaviorInsights: { tags: ['政策关注者', '政府工作人员'], spendingLevel: 'low' },
                isPreset: false,
                demoScenario: 'government-demo',
                tenantId,
            },
            {
                customerName: '政务工作者B',
                userId: 'gov-user-b',
                customerType: customer_type_enum_1.CustomerType.ENTERPRISE,
                industry: industry_enum_1.Industry.GOVERNMENT,
                dataSources: { type: 'gov-employee', department: '大数据中心' },
                profileData: { age: 28, gender: 'female', location: '上海市', interests: ['智慧城市', '大数据应用', '数字治理'] },
                behaviorInsights: { tags: ['数字政府倡导者', '年轻公务员'], spendingLevel: 'medium' },
                isPreset: false,
                demoScenario: 'government-demo',
                tenantId,
            },
            {
                customerName: '政策研究员',
                userId: 'gov-researcher',
                customerType: customer_type_enum_1.CustomerType.ENTERPRISE,
                industry: industry_enum_1.Industry.RESEARCH,
                dataSources: { type: 'researcher', department: '政策研究室' },
                profileData: { age: 42, gender: 'male', location: '深圳市', interests: ['政策研究', '社会治理', '改革创新'] },
                behaviorInsights: { tags: ['政策专家', '深度思考者'], spendingLevel: 'medium' },
                isPreset: false,
                demoScenario: 'government-demo',
                tenantId,
            },
            {
                customerName: '市民代表',
                userId: 'citizen-representative',
                customerType: customer_type_enum_1.CustomerType.INDIVIDUAL,
                industry: industry_enum_1.Industry.PUBLIC_SERVICE,
                dataSources: { type: 'citizen' },
                profileData: { age: 38, gender: 'female', location: '广州市', interests: ['公共服务', '便民措施', '政务透明'] },
                behaviorInsights: { tags: ['积极市民', '政务参与者'], spendingLevel: 'high' },
                isPreset: false,
                demoScenario: 'government-demo',
                tenantId,
            },
        ];
        for (const profile of governmentProfiles) {
            await this.customerProfileRepository.save(profile);
        }
    }
    generateRandomGovernmentComment() {
        const comments = [
            '支持政府数字化改革，期待更好的服务体验',
            '政策解读很到位，希望能加快落实进度',
            '政务服务平台使用方便，点赞',
            '建议进一步简化办事流程',
            '信息公开做得很好，值得推广',
            '希望更多业务能实现网上办理',
            '数字化政务服务是大势所趋',
            '期待更多便民利民措施',
            '政府工作效率有了明显提升',
            '政务公开透明度不断提高'
        ];
        return comments[Math.floor(Math.random() * comments.length)];
    }
    async getGovernmentDemoStats(tenantId) {
        const [governmentContents, socialInteractions, customerProfiles, geographicAnalyses] = await Promise.all([
            this.governmentContentRepository.count({
                where: { tenantId, demoScenario: 'government-demo' }
            }),
            this.socialInteractionRepository.count({
                where: { tenantId, demoScenario: 'government-demo' }
            }),
            this.customerProfileRepository.count({
                where: { tenantId, demoScenario: 'government-demo' }
            }),
            this.governmentContentRepository.count({
                where: {
                    tenantId,
                    demoScenario: 'government-demo',
                    category: '舆情地理分析'
                }
            })
        ]);
        return {
            governmentContents,
            socialInteractions,
            customerProfiles,
            geographicAnalyses,
        };
    }
};
exports.GovernmentDemoService = GovernmentDemoService;
exports.GovernmentDemoService = GovernmentDemoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(government_content_entity_1.GovernmentContent)),
    __param(1, (0, typeorm_1.InjectRepository)(social_interaction_entity_1.SocialInteraction)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_profile_entity_1.CustomerProfile)),
    __param(3, (0, typeorm_1.InjectRepository)(marketing_campaign_repository_1.MarketingCampaignRepository)),
    __param(4, (0, typeorm_1.InjectRepository)(marketing_strategy_repository_1.MarketingStrategyRepository)),
    __param(5, (0, typeorm_1.InjectRepository)(content_draft_entity_1.ContentDraft)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        marketing_campaign_repository_1.MarketingCampaignRepository,
        marketing_strategy_repository_1.MarketingStrategyRepository,
        typeorm_2.Repository])
], GovernmentDemoService);
//# sourceMappingURL=government-demo.service.js.map