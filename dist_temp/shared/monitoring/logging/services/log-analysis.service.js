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
exports.LogAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let LogAnalysisService = class LogAnalysisService {
    configService;
    indexPrefix;
    elasticsearchService;
    constructor(configService, elasticsearchService) {
        this.configService = configService;
        this.indexPrefix = this.configService.get('ELASTICSEARCH_INDEX_PREFIX', 'lumina-logs');
        this.elasticsearchService = elasticsearchService || null;
    }
    async queryLogs(options) {
        if (this.elasticsearchService) {
            return this.queryElasticsearch(options);
        }
        return this.queryMockData(options);
    }
    async analyzeLogs(options) {
        const logs = await this.queryLogs(options);
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {
            timeRange: {
                from: options.from || sevenDaysAgo.toISOString(),
                to: options.to || now.toISOString(),
            },
            statistics: {
                totalLogs: 1000,
                byLevel: { info: 700, error: 50, warn: 200, debug: 50 },
                byModule: { auth: 300, user: 200, api: 500 },
                byStatus: { success: 850, failure: 150 },
                errors: 50,
                warnings: 200,
            },
            trends: {
                hourly: Array.from({ length: 24 }, (_, i) => ({
                    hour: `${i}:00`,
                    count: Math.floor(Math.random() * 100),
                    errors: Math.floor(Math.random() * 10),
                })),
                daily: Array.from({ length: 7 }, (_, i) => ({
                    day: new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0],
                    count: Math.floor(Math.random() * 500),
                    errors: Math.floor(Math.random() * 50),
                })),
            },
            errorAnalysis: {
                topErrors: [
                    {
                        errorCode: 'AUTH_FAILED',
                        errorMessage: 'Authentication failed',
                        count: 25,
                        lastOccurred: new Date().toISOString(),
                    },
                    {
                        errorCode: 'DB_CONNECTION',
                        errorMessage: 'Database connection failed',
                        count: 15,
                        lastOccurred: new Date().toISOString(),
                    },
                ],
                errorRate: 5.0,
            },
            performanceAnalysis: {
                averageDuration: 150,
                p95Duration: 450,
                p99Duration: 800,
                slowOperations: [
                    {
                        module: 'api',
                        action: 'generate-report',
                        averageDuration: 1200,
                        count: 10,
                    },
                    {
                        module: 'auth',
                        action: 'validate-token',
                        averageDuration: 800,
                        count: 50,
                    },
                ],
            },
            recommendations: [
                {
                    type: 'error',
                    priority: 'high',
                    description: '高频认证错误',
                    suggestion: '检查认证服务配置，增加失败重试机制',
                },
                {
                    type: 'performance',
                    priority: 'medium',
                    description: '报告生成操作耗时过长',
                    suggestion: '优化数据库查询，添加缓存机制',
                },
            ],
        };
    }
    async checkAlertRules(rules) {
        const results = [];
        for (const rule of rules) {
            if (!rule.enabled) {
                results.push({ rule, triggered: false });
                continue;
            }
            const isTriggered = await this.evaluateAlertCondition(rule.condition);
            results.push({
                rule,
                triggered: isTriggered,
                details: isTriggered ? { message: 'Alert triggered' } : undefined,
            });
        }
        return results;
    }
    async getLogStats(timeRange) {
        const analysis = await this.analyzeLogs({
            from: timeRange.from,
            to: timeRange.to,
        });
        return analysis.statistics;
    }
    async getErrorTrends(days = 7) {
        const to = new Date().toISOString();
        const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const analysis = await this.analyzeLogs({ from, to });
        return analysis.trends.daily;
    }
    async queryElasticsearch(options) {
        const query = {
            bool: {
                must: [],
            },
        };
        if (options.from || options.to) {
            query.bool.must.push({
                range: {
                    '@timestamp': {
                        gte: options.from,
                        lte: options.to,
                    },
                },
            });
        }
        if (options.filters) {
            const filters = options.filters;
            if (filters.level) {
                query.bool.must.push({
                    term: { 'log.level': filters.level },
                });
            }
            if (filters.module) {
                query.bool.must.push({
                    term: { 'service.module': filters.module },
                });
            }
        }
        const searchRequest = {
            index: `${this.indexPrefix}-*`,
            body: {
                query,
                size: options.pagination?.pageSize || 100,
                from: ((options.pagination?.page || 1) - 1) *
                    (options.pagination?.pageSize || 100),
                sort: options.sort
                    ? [{ [options.sort.field]: { order: options.sort.order } }]
                    : [{ '@timestamp': { order: 'desc' } }],
            },
        };
        try {
            const result = await this.elasticsearchService.search(searchRequest);
            return result.body ?? result;
        }
        catch (error) {
            console.error('Elasticsearch query failed:', error);
            throw error;
        }
    }
    async queryMockData(options) {
        return {
            hits: {
                total: { value: 1000 },
                hits: Array.from({ length: 10 }, (_, i) => ({
                    _source: {
                        '@timestamp': new Date().toISOString(),
                        'log.level': i % 3 === 0 ? 'error' : 'info',
                        'service.module': i % 2 === 0 ? 'auth' : 'api',
                        'log.action': 'request',
                        'log.status': i % 10 === 0 ? 'failure' : 'success',
                        'error.message': i % 3 === 0 ? 'Something went wrong' : undefined,
                    },
                })),
            },
        };
    }
    async evaluateAlertCondition(condition) {
        return false;
    }
};
exports.LogAnalysisService = LogAnalysisService;
exports.LogAnalysisService = LogAnalysisService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, common_1.Inject)('ELASTICSEARCH_SERVICE')),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], LogAnalysisService);
//# sourceMappingURL=log-analysis.service.js.map