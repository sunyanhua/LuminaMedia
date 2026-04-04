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
exports.DemoResetService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_profile_entity_1 = require("../../../entities/customer-profile.entity");
const marketing_campaign_entity_1 = require("../../../entities/marketing-campaign.entity");
const marketing_strategy_entity_1 = require("../../../entities/marketing-strategy.entity");
const content_draft_entity_1 = require("../../../entities/content-draft.entity");
const government_content_entity_1 = require("../../../entities/government-content.entity");
const social_interaction_entity_1 = require("../../../entities/social-interaction.entity");
const tenant_entity_1 = require("../../../entities/tenant.entity");
let DemoResetService = class DemoResetService {
    dataSource;
    customerProfileRepository;
    marketingCampaignRepository;
    marketingStrategyRepository;
    contentDraftRepository;
    governmentContentRepository;
    socialInteractionRepository;
    tenantRepository;
    constructor(dataSource, customerProfileRepository, marketingCampaignRepository, marketingStrategyRepository, contentDraftRepository, governmentContentRepository, socialInteractionRepository, tenantRepository) {
        this.dataSource = dataSource;
        this.customerProfileRepository = customerProfileRepository;
        this.marketingCampaignRepository = marketingCampaignRepository;
        this.marketingStrategyRepository = marketingStrategyRepository;
        this.contentDraftRepository = contentDraftRepository;
        this.governmentContentRepository = governmentContentRepository;
        this.socialInteractionRepository = socialInteractionRepository;
        this.tenantRepository = tenantRepository;
    }
    async resetDemoData(tenantId) {
        const tenant = await this.tenantRepository.findOne({
            where: { id: tenantId },
        });
        if (!tenant || !tenantId.includes('demo')) {
            throw new Error(`Tenant ${tenantId} is not a demo tenant`);
        }
        await this.dataSource.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.getRepository(customer_profile_entity_1.CustomerProfile)
                .delete({
                tenantId,
                isPreset: false,
            });
            await transactionalEntityManager.getRepository(marketing_campaign_entity_1.MarketingCampaign)
                .delete({
                tenantId,
                isPreset: false,
            });
            await transactionalEntityManager.getRepository(marketing_strategy_entity_1.MarketingStrategy)
                .delete({
                tenantId,
                isPreset: false,
            });
            await transactionalEntityManager.getRepository(content_draft_entity_1.ContentDraft)
                .delete({
                tenantId,
                isPreset: false,
            });
            if (tenantId.includes('government')) {
                await transactionalEntityManager.getRepository(government_content_entity_1.GovernmentContent)
                    .delete({
                    tenantId,
                    isPreset: false,
                });
            }
            await transactionalEntityManager.getRepository(social_interaction_entity_1.SocialInteraction)
                .delete({
                tenantId,
                isPreset: false,
            });
        });
    }
    async resetAllDemoData() {
        const demoTenants = await this.tenantRepository.find({
            where: [
                { id: 'demo-business-001' },
                { id: 'demo-government-001' },
            ],
        });
        for (const tenant of demoTenants) {
            await this.resetDemoData(tenant.id);
        }
    }
    async isDemoTenant(tenantId) {
        const tenant = await this.tenantRepository.findOne({
            where: { id: tenantId },
        });
        return tenant ? tenantId.includes('demo') : false;
    }
    async getDemoDataStats(tenantId) {
        const [customerProfiles, marketingCampaigns, marketingStrategies, contentDrafts, governmentContents, socialInteractions, presetData] = await Promise.all([
            this.customerProfileRepository.count({ where: { tenantId } }),
            this.marketingCampaignRepository.count({ where: { tenantId } }),
            this.marketingStrategyRepository.count({ where: { tenantId } }),
            this.contentDraftRepository.count({ where: { tenantId } }),
            tenantId.includes('government')
                ? this.governmentContentRepository.count({ where: { tenantId } })
                : Promise.resolve(0),
            this.socialInteractionRepository.count({ where: { tenantId } }),
            Promise.all([
                this.customerProfileRepository.count({ where: { tenantId, isPreset: true } }),
                this.marketingCampaignRepository.count({ where: { tenantId, isPreset: true } }),
                this.marketingStrategyRepository.count({ where: { tenantId, isPreset: true } }),
                this.contentDraftRepository.count({ where: { tenantId, isPreset: true } }),
                tenantId.includes('government')
                    ? this.governmentContentRepository.count({ where: { tenantId, isPreset: true } })
                    : Promise.resolve(0),
                this.socialInteractionRepository.count({ where: { tenantId, isPreset: true } }),
            ]).then(results => results.reduce((sum, count) => sum + count, 0))
        ]);
        return {
            customerProfiles,
            marketingCampaigns,
            marketingStrategies,
            contentDrafts,
            governmentContents,
            socialInteractions,
            presetDataCount: presetData,
        };
    }
    async regeneratePresetData(tenantId) {
        if (!await this.isDemoTenant(tenantId)) {
            throw new Error(`Tenant ${tenantId} is not a demo tenant`);
        }
        const presetCount = await this.customerProfileRepository.count({
            where: { tenantId, isPreset: true },
        });
        if (presetCount === 0) {
            const presetProfiles = [
                {
                    name: '张三',
                    email: 'zhangsan@example.com',
                    phone: '13800138001',
                    age: 30,
                    gender: 'male',
                    location: '北京',
                    interests: ['科技', '金融'],
                    behaviorTags: ['活跃用户', '高价值客户'],
                    spendingLevel: 'high',
                    tenantId,
                    isPreset: true,
                    demoScenario: tenantId.includes('government') ? 'government-demo' : 'business-demo',
                },
                {
                    name: '李四',
                    email: 'lisi@example.com',
                    phone: '13800138002',
                    age: 25,
                    gender: 'female',
                    location: '上海',
                    interests: ['时尚', '美容'],
                    behaviorTags: ['新用户', '潜力客户'],
                    spendingLevel: 'medium',
                    tenantId,
                    isPreset: true,
                    demoScenario: tenantId.includes('government') ? 'government-demo' : 'business-demo',
                },
            ];
            await this.customerProfileRepository.insert(presetProfiles);
        }
    }
};
exports.DemoResetService = DemoResetService;
exports.DemoResetService = DemoResetService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(customer_profile_entity_1.CustomerProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(marketing_campaign_entity_1.MarketingCampaign)),
    __param(3, (0, typeorm_1.InjectRepository)(marketing_strategy_entity_1.MarketingStrategy)),
    __param(4, (0, typeorm_1.InjectRepository)(content_draft_entity_1.ContentDraft)),
    __param(5, (0, typeorm_1.InjectRepository)(government_content_entity_1.GovernmentContent)),
    __param(6, (0, typeorm_1.InjectRepository)(social_interaction_entity_1.SocialInteraction)),
    __param(7, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DemoResetService);
//# sourceMappingURL=demo-reset.service.js.map