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
var UserProfileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_profile_entity_1 = require("../../../entities/customer-profile.entity");
let UserProfileService = UserProfileService_1 = class UserProfileService {
    customerProfileRepository;
    logger = new common_1.Logger(UserProfileService_1.name);
    constructor(customerProfileRepository) {
        this.customerProfileRepository = customerProfileRepository;
    }
    tagMapping = {
        basicLifecycle: {
            age_group: 'ageGroup',
            education: 'education',
            family_role: 'familyRole',
            potential_value: 'potentialValue',
        },
        consumptionPersonality: {
            consumption_level: 'consumptionLevel',
            shopping_width: 'shoppingWidth',
            decision_speed: 'decisionSpeed',
        },
        realtimeStatus: {
            activity_level: 'activityLevel',
            growth_trend: 'growthTrend',
            engagement_score: 'engagementScore',
        },
        socialActivity: {
            fission_potential: 'fissionPotential',
            activity_preference: 'activityPreference',
            social_influence: 'socialInfluence',
        },
    };
    async getUserProfile(customerId) {
        this.logger.log(`获取客户画像: ${customerId}`);
        const profile = await this.customerProfileRepository.findOne({
            where: { id: customerId },
        });
        if (!profile) {
            throw new common_1.NotFoundException(`客户 ${customerId} 不存在`);
        }
        const tags = this.extractTagsFromProfileData(profile.profileData);
        return this.buildUserProfile4D(tags, profile);
    }
    async getBatchUserProfiles(customerIds) {
        this.logger.log(`批量获取客户画像: ${customerIds.length} 个客户`);
        const profiles = await this.customerProfileRepository.find({
            where: customerIds.map((id) => ({ id })),
        });
        const result = {};
        for (const profile of profiles) {
            const tags = this.extractTagsFromProfileData(profile.profileData);
            result[profile.id] = this.buildUserProfile4D(tags, profile);
        }
        return result;
    }
    async filterCustomersByProfile(filters) {
        this.logger.log(`根据画像维度筛选客户: ${JSON.stringify(filters)}`);
        if (!filters || Object.keys(filters).length === 0) {
            return [];
        }
        const queryBuilder = this.customerProfileRepository.createQueryBuilder('cp');
        const conditions = this.buildProfileConditions(filters);
        if (conditions.length === 0) {
            return [];
        }
        conditions.forEach((condition, index) => {
            if (index === 0) {
                queryBuilder.where(condition.sql, condition.parameters);
            }
            else {
                queryBuilder.andWhere(condition.sql, condition.parameters);
            }
        });
        const results = await queryBuilder.select('cp.id').getMany();
        return results.map((profile) => profile.id);
    }
    async getProfileSummary(customerIds) {
        this.logger.log(`获取画像统计摘要`);
        return {
            basicLifecycle: {},
            consumptionPersonality: {},
            realtimeStatus: {},
            socialActivity: {},
            totalCustomers: 0,
        };
    }
    extractTagsFromProfileData(profileData) {
        if (!profileData || !profileData.tags) {
            return {};
        }
        const tags = profileData.tags;
        if (typeof tags !== 'object') {
            return {};
        }
        const result = {};
        for (const [tagName, tagData] of Object.entries(tags)) {
            if (tagData && typeof tagData === 'object' && 'value' in tagData) {
                result[tagName] = tagData.value;
            }
            else {
                result[tagName] = tagData;
            }
        }
        return result;
    }
    buildUserProfile4D(tags, profile) {
        const allData = this.mergeProfileData(profile.profileData, tags);
        const userProfile = {
            basicLifecycle: {},
            consumptionPersonality: {},
            realtimeStatus: {},
            socialActivity: {},
        };
        for (const [dimension, fieldMapping] of Object.entries(this.tagMapping)) {
            for (const [sourceField, targetField] of Object.entries(fieldMapping)) {
                if (allData[sourceField] !== undefined) {
                    const value = this.transformValueForField(dimension, targetField, allData[sourceField]);
                    userProfile[dimension][targetField] = value;
                }
            }
        }
        return userProfile;
    }
    mergeProfileData(profileData, tags) {
        const result = { ...tags };
        if (!profileData || typeof profileData !== 'object') {
            return result;
        }
        const rootFields = [
            'age_group',
            'education',
            'family_role',
            'potential_value',
        ];
        for (const field of rootFields) {
            if (profileData[field] !== undefined && result[field] === undefined) {
                result[field] = profileData[field];
            }
        }
        const dataPaths = {
            activity_level: ['activity', 'level'],
            engagement_score: ['engagement', 'score'],
            social_influence: ['social', 'influence_score'],
        };
        for (const [field, path] of Object.entries(dataPaths)) {
            if (result[field] === undefined) {
                let value = profileData;
                for (const key of path) {
                    if (value && typeof value === 'object' && key in value) {
                        value = value[key];
                    }
                    else {
                        value = undefined;
                        break;
                    }
                }
                if (value !== undefined) {
                    result[field] = value;
                }
            }
        }
        return result;
    }
    transformValueForField(dimension, field, value) {
        if (dimension === 'realtimeStatus' && field === 'activityLevel') {
            return this.normalizeActivityLevel(value);
        }
        if (dimension === 'realtimeStatus' && field === 'engagementScore') {
            return this.normalizeEngagementScore(value);
        }
        if (dimension === 'socialActivity' && field === 'socialInfluence') {
            return this.normalizeSocialInfluence(value);
        }
        if (dimension === 'socialActivity' && field === 'activityPreference') {
            return this.parseActivityPreference(value);
        }
        if (dimension === 'basicLifecycle') {
            if (field === 'ageGroup') {
                const validValues = ['18-25', '26-35', '36-45', '46+'];
                if (typeof value === 'string' && validValues.includes(value)) {
                    return value;
                }
            }
            if (field === 'education') {
                const validValues = ['high_school', 'bachelor', 'master', 'phd'];
                if (typeof value === 'string' && validValues.includes(value)) {
                    return value;
                }
            }
            if (field === 'familyRole') {
                const validValues = ['single', 'married_no_kids', 'married_with_kids'];
                if (typeof value === 'string' && validValues.includes(value)) {
                    return value;
                }
            }
            if (field === 'potentialValue') {
                const validValues = ['low', 'medium', 'high'];
                if (typeof value === 'string' && validValues.includes(value)) {
                    return value;
                }
            }
        }
        if (dimension === 'consumptionPersonality') {
            if (field === 'consumptionLevel') {
                const validValues = ['low', 'medium', 'high', 'premium'];
                if (typeof value === 'string' && validValues.includes(value)) {
                    return value;
                }
            }
            if (field === 'shoppingWidth') {
                const validValues = ['narrow', 'medium', 'wide'];
                if (typeof value === 'string' && validValues.includes(value)) {
                    return value;
                }
            }
            if (field === 'decisionSpeed') {
                const validValues = ['fast', 'medium', 'slow'];
                if (typeof value === 'string' && validValues.includes(value)) {
                    return value;
                }
            }
        }
        if (dimension === 'realtimeStatus' && field === 'growthTrend') {
            const validValues = ['declining', 'stable', 'growing', 'fast_growing'];
            if (typeof value === 'string' && validValues.includes(value)) {
                return value;
            }
        }
        if (dimension === 'socialActivity' && field === 'fissionPotential') {
            const validValues = ['low', 'medium', 'high'];
            if (typeof value === 'string' && validValues.includes(value)) {
                return value;
            }
        }
        return value;
    }
    normalizeActivityLevel(activityLevel) {
        if (typeof activityLevel === 'number') {
            return Math.max(0, Math.min(100, activityLevel));
        }
        if (typeof activityLevel === 'string') {
            const mapping = {
                very_low: 20,
                low: 40,
                medium: 60,
                high: 80,
                very_high: 95,
            };
            return mapping[activityLevel.toLowerCase()];
        }
        return undefined;
    }
    normalizeEngagementScore(engagementScore) {
        if (typeof engagementScore === 'number') {
            return Math.max(0, Math.min(100, engagementScore));
        }
        return undefined;
    }
    normalizeSocialInfluence(socialInfluence) {
        if (typeof socialInfluence === 'number') {
            return Math.max(0, Math.min(100, socialInfluence));
        }
        return undefined;
    }
    parseActivityPreference(activityPreference) {
        if (Array.isArray(activityPreference)) {
            return activityPreference.filter((item) => typeof item === 'string');
        }
        if (typeof activityPreference === 'string') {
            try {
                const parsed = JSON.parse(activityPreference);
                if (Array.isArray(parsed)) {
                    return parsed.filter((item) => typeof item === 'string');
                }
            }
            catch {
                return activityPreference
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean);
            }
        }
        return [];
    }
    buildProfileConditions(filters) {
        const conditions = [];
        const reverseMapping = {};
        for (const [dimension, fieldMap] of Object.entries(this.tagMapping)) {
            for (const [sourceField, targetField] of Object.entries(fieldMap)) {
                reverseMapping[`${dimension}.${targetField}`] = sourceField;
            }
        }
        for (const [dimension, dimensionFilters] of Object.entries(filters)) {
            if (!dimensionFilters || typeof dimensionFilters !== 'object') {
                continue;
            }
            for (const [field, value] of Object.entries(dimensionFilters)) {
                if (value === undefined || value === null) {
                    continue;
                }
                const mappingKey = `${dimension}.${field}`;
                const tagField = reverseMapping[mappingKey];
                if (!tagField) {
                    this.logger.warn(`未找到字段映射: ${mappingKey}`);
                    continue;
                }
                const paramName = `param_${tagField}`;
                conditions.push({
                    sql: `JSON_UNQUOTE(JSON_EXTRACT(cp.profile_data, '$.tags."${tagField}".value')) = :${paramName}`,
                    parameters: { [paramName]: value },
                });
            }
        }
        return conditions;
    }
};
exports.UserProfileService = UserProfileService;
exports.UserProfileService = UserProfileService = UserProfileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_profile_entity_1.CustomerProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserProfileService);
//# sourceMappingURL=user-profile.service.js.map