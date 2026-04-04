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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotaCheckMiddleware = void 0;
const common_1 = require("@nestjs/common");
const quota_service_1 = require("../services/quota.service");
let QuotaCheckMiddleware = class QuotaCheckMiddleware {
    quotaService;
    constructor(quotaService) {
        this.quotaService = quotaService;
    }
    async use(req, res, next) {
        const tenantId = req.headers['x-tenant-id'] ||
            req.user?.tenantId ||
            req.session?.user?.tenantId;
        const featureKey = this.getFeatureFromPath(req.path, req.method);
        if (tenantId && featureKey) {
            try {
                const quotaInfo = await this.quotaService.checkQuota(tenantId, featureKey);
                if (!quotaInfo.hasQuota) {
                    return res.status(429).json({
                        statusCode: 429,
                        message: `配额已用尽，剩余配额: ${quotaInfo.remaining}`,
                        error: 'Quota Exceeded',
                        featureKey,
                        resetTime: (await this.quotaService.getQuotaInfo(tenantId, featureKey)).resetTime,
                    });
                }
                await this.quotaService.consumeQuota(tenantId, featureKey);
                req.quotaInfo = quotaInfo;
            }
            catch (error) {
                console.warn('Quota check failed:', error.message);
            }
        }
        next();
    }
    getFeatureFromPath(path, method) {
        if (path.includes('/ai/') || path.includes('/analysis') || path.includes('/planning') || path.includes('/copywriting')) {
            return 'ai-analysis';
        }
        else if (path.includes('/publish') || path.includes('/matrix')) {
            return 'matrix-publishing';
        }
        else if (path.includes('/customer') || path.includes('/profile')) {
            return 'customer-profile';
        }
        else if (path.includes('/monitor') || path.includes('/social')) {
            return 'social-monitoring';
        }
        else if (path.includes('/government') || path.includes('/gov')) {
            return 'government-content';
        }
        if (method === 'POST' && (path.includes('/content') || path.includes('/strategy') || path.includes('/campaign'))) {
            return 'ai-analysis';
        }
        return null;
    }
};
exports.QuotaCheckMiddleware = QuotaCheckMiddleware;
exports.QuotaCheckMiddleware = QuotaCheckMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [quota_service_1.QuotaService])
], QuotaCheckMiddleware);
//# sourceMappingURL=quota-check.middleware.js.map